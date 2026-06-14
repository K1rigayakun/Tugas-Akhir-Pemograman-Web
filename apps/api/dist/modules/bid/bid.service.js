"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BidService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const crypto_1 = require("crypto");
const encryption_service_1 = require("../../common/encryption/encryption.service");
const prisma_service_1 = require("../../prisma/prisma.service");
const wallet_service_1 = require("../wallet/wallet.service");
const notification_service_1 = require("../notification/notification.service");
const bid_gateway_1 = require("./bid.gateway");
const ai_service_1 = require("../ai/ai.service");
const RANK_ORDER = Object.values(client_1.Rank);
let BidService = class BidService {
    constructor(prisma, walletService, bidGateway, encryptionService, notificationService, aiService) {
        this.prisma = prisma;
        this.walletService = walletService;
        this.bidGateway = bidGateway;
        this.encryptionService = encryptionService;
        this.notificationService = notificationService;
        this.aiService = aiService;
        this.locks = new Set();
    }
    async placeBid(auctionId, userId, amount, idempotencyKey, allowPhantomResponse = true) {
        const lockKey = `bid:${auctionId}`;
        if (this.locks.has(lockKey)) {
            throw new common_1.ConflictException("Bid lain sedang diproses. Silakan coba lagi.");
        }
        this.locks.add(lockKey);
        let result;
        let succeeded = false;
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                include: { achievements: true }
            });
            const auction = await this.prisma.auction.findUnique({ where: { id: auctionId } });
            if (!user)
                throw new common_1.BadRequestException("User tidak ditemukan");
            if (user.kycStatus !== "APPROVED") {
                throw new common_1.BadRequestException("KYC harus disetujui sebelum melakukan bid");
            }
            if (user.isBannedFromAuction) {
                throw new common_1.BadRequestException("Anda dilarang mengikuti lelang");
            }
            if (!auction)
                throw new common_1.BadRequestException("Lelang tidak ditemukan");
            if (auction.status !== "ACTIVE" && auction.status !== "ENDING") {
                throw new common_1.BadRequestException("Lelang tidak aktif");
            }
            if (auction.minimumRank &&
                RANK_ORDER.indexOf(user.rank) < RANK_ORDER.indexOf(auction.minimumRank)) {
                throw new common_1.BadRequestException(`Lelang membutuhkan rank ${auction.minimumRank}`);
            }
            if (auction.requiredAchievementId) {
                const hasAchv = user.achievements.some(a => a.achievementId === auction.requiredAchievementId);
                if (!hasAchv) {
                    throw new common_1.BadRequestException("Anda tidak memiliki achievement yang dibutuhkan untuk lelang ini");
                }
            }
            const userAddress = await this.prisma.userAddress.findUnique({ where: { userId } });
            const isDigital = auction.category === "Domain Internet Premium" || auction.category === "Digital" || auction.category === "Web Code";
            if (!userAddress && !isDigital) {
                throw new common_1.BadRequestException("ADDRESS_REQUIRED: Anda belum mengatur Alamat Pengiriman. Silakan atur di Settings.");
            }
            // ==========================================
            // ANTI-FRAUD RULE: Maksimal 5 bid per menit
            // ==========================================
            const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
            const recentBidsCount = await this.prisma.bid.count({
                where: {
                    userId,
                    placedAt: { gte: oneMinuteAgo },
                },
            });
            if (recentBidsCount >= 5) {
                throw new common_1.HttpException("Aktivitas mencurigakan (Anti-Fraud): Anda telah mencapai batas maksimal 5 bid per menit.", common_1.HttpStatus.TOO_MANY_REQUESTS);
            }
            // ==========================================
            // AI FRAUD DETECTION (RINA)
            // ==========================================
            const fraudCheck = await this.aiService.detectFraud(amount, user.rank, auction.currentPrice);
            if (fraudCheck.isFraud) {
                throw new common_1.HttpException(fraudCheck.reason || "AI mendeteksi anomali penawaran.", common_1.HttpStatus.FORBIDDEN);
            }
            if (auction.auctionType === "DESCENDING") {
                if (amount < auction.currentPrice) {
                    throw new common_1.BadRequestException(`Bid minimum adalah ${auction.currentPrice} CC`);
                }
            }
            else {
                if (amount < auction.currentPrice + auction.minimumIncrement) {
                    throw new common_1.BadRequestException(`Bid minimum adalah ${auction.currentPrice + auction.minimumIncrement} CC`);
                }
            }
            const currentBid = await this.prisma.bid.findFirst({
                where: { auctionId, status: "ACTIVE" },
                orderBy: [{ amount: "desc" }, { placedAt: "asc" }],
            });
            if (currentBid) {
                await this.walletService.releaseBalance(currentBid.userId, currentBid.amount, `outbid-${auctionId}-${currentBid.id}`, auctionId);
                await this.prisma.bid.update({
                    where: { id: currentBid.id },
                    data: { status: "OUTBID" },
                });
                await this.notificationService.send(currentBid.userId, "OUTBID", {
                    auctionId,
                    previousAmount: currentBid.amount,
                    newAmount: amount,
                });
            }
            await this.walletService.holdBalance(userId, amount, idempotencyKey, auctionId);
            const bid = await this.prisma.bid.create({
                data: { auctionId, userId, amount, status: "ACTIVE" },
            });
            const isDescending = auction.auctionType === "DESCENDING";
            let endTime = auction.endTime;
            let status = auction.status;
            if (isDescending) {
                status = client_1.AuctionStatus.ENDED;
            }
            else {
                const secondsLeft = (auction.endTime.getTime() - Date.now()) / 1000;
                const extended = secondsLeft <= 60;
                endTime = extended
                    ? new Date(auction.endTime.getTime() + 60000)
                    : auction.endTime;
                if (extended)
                    status = client_1.AuctionStatus.ENDING;
            }
            await this.prisma.auction.update({
                where: { id: auctionId },
                data: {
                    currentPrice: amount,
                    endTime,
                    status,
                    ...(isDescending ? { winnerId: userId, finalPrice: amount } : {})
                },
            });
            this.bidGateway.broadcastNewBid(auctionId, {
                userId,
                amount,
                username: user.username,
                rank: user.rank,
                timestamp: bid.placedAt,
                activeNameEffect: user.activeNameEffect,
                activeCoatFrame: user.activeCoatFrame,
                avatarUrl: user.avatarUrl,
            });
            if (isDescending) {
                this.bidGateway.broadcastAuctionEnded(auctionId, {
                    winnerId: userId,
                    winnerName: user.username,
                    finalPrice: amount
                });
                await this.walletService.deductBalance(userId, amount, "BID_DEDUCT", idempotencyKey + '-win', auctionId, true);
                const isDigital = auction.category === "Domain Internet Premium" || auction.category === "Digital" || auction.category === "Web Code";
                const userAddress = await this.prisma.userAddress.findUnique({ where: { userId } });
                if (!isDigital && userAddress) {
                    await this.prisma.delivery.create({
                        data: {
                            auctionId,
                            userId,
                            recipient: userAddress.recipient,
                            phoneNumber: userAddress.phoneNumber,
                            address: userAddress.address,
                            city: userAddress.city,
                            province: userAddress.province,
                            postalCode: userAddress.postalCode,
                            status: "PENDING"
                        }
                    });
                }
                await this.notificationService.send(userId, "YOU_WON", { auctionId, message: `Selamat! Anda memenangkan lelang ${auction.title}.` });
            }
            else {
                const secondsLeft = (auction.endTime.getTime() - Date.now()) / 1000;
                const extended = secondsLeft <= 60;
                if (extended) {
                    this.bidGateway.broadcastTimerExtended(auctionId, {
                        newEndTime: endTime,
                        message: "A new claim has been declared - the clock extends.",
                    });
                }
            }
            await this.prisma.user.update({
                where: { id: userId },
                data: { totalBids: { increment: 1 } },
            });
            result = bid;
            succeeded = true;
        }
        finally {
            this.locks.delete(lockKey);
        }
        if (succeeded && allowPhantomResponse) {
            await this.respondWithPhantomBid(auctionId, userId);
        }
        return result;
    }
    async placePhantomBid(auctionId, userId, maxAmount, idempotencyKey) {
        const auction = await this.prisma.auction.findUnique({ where: { id: auctionId } });
        const wallet = await this.walletService.getBalance(userId);
        if (!auction ||
            (auction.status !== client_1.AuctionStatus.ACTIVE && auction.status !== client_1.AuctionStatus.ENDING)) {
            throw new common_1.BadRequestException("Lelang tidak aktif");
        }
        if (maxAmount < auction.currentPrice + auction.minimumIncrement) {
            throw new common_1.BadRequestException("Batas phantom bid terlalu rendah");
        }
        if (wallet.availableBalance < maxAmount) {
            throw new common_1.BadRequestException("Saldo tidak cukup untuk batas phantom bid");
        }
        const phantom = await this.prisma.phantomBid.upsert({
            where: { userId_auctionId: { userId, auctionId } },
            update: { maxAmount: this.encryptionService.encrypt(String(maxAmount)), isActive: true },
            create: {
                userId,
                auctionId,
                maxAmount: this.encryptionService.encrypt(String(maxAmount)),
            },
        });
        await this.respondWithPhantomBid(auctionId, "");
        return { ...phantom, maxAmount: undefined, idempotencyKey };
    }
    async respondWithPhantomBid(auctionId, excludedUserId) {
        const auction = await this.prisma.auction.findUnique({ where: { id: auctionId } });
        if (!auction ||
            (auction.status !== client_1.AuctionStatus.ACTIVE && auction.status !== client_1.AuctionStatus.ENDING)) {
            return;
        }
        const phantoms = await this.prisma.phantomBid.findMany({
            where: { auctionId, isActive: true, userId: { not: excludedUserId || undefined } },
        });
        const candidate = phantoms
            .map((phantom) => ({
            ...phantom,
            limit: Number(this.encryptionService.decrypt(phantom.maxAmount)),
        }))
            .filter((phantom) => phantom.limit >= auction.currentPrice + auction.minimumIncrement)
            .sort((a, b) => b.limit - a.limit)[0];
        if (!candidate)
            return;
        const nextAmount = Math.min(candidate.limit, auction.currentPrice + auction.minimumIncrement);
        try {
            await this.placeBid(auctionId, candidate.userId, nextAmount, (0, crypto_1.randomUUID)(), false);
        }
        catch {
            await this.prisma.phantomBid.update({
                where: { id: candidate.id },
                data: { isActive: false },
            });
        }
    }
};
exports.BidService = BidService;
exports.BidService = BidService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        wallet_service_1.WalletService,
        bid_gateway_1.BidGateway,
        encryption_service_1.EncryptionService,
        notification_service_1.NotificationService,
        ai_service_1.AiService])
], BidService);
//# sourceMappingURL=bid.service.js.map