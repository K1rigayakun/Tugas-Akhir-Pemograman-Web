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
exports.AuctionService = exports.ItemRarity = exports.AuctionStatus = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const types_1 = require("@emerald-kingdom/types");
const prisma_service_1 = require("../../prisma/prisma.service");
const rank_service_1 = require("../rank/rank.service");
const wallet_service_1 = require("../wallet/wallet.service");
const notification_service_1 = require("../notification/notification.service");
const event_emitter_1 = require("@nestjs/event-emitter");
const schedule_1 = require("@nestjs/schedule");
var client_2 = require("@prisma/client");
Object.defineProperty(exports, "AuctionStatus", { enumerable: true, get: function () { return client_2.AuctionStatus; } });
Object.defineProperty(exports, "ItemRarity", { enumerable: true, get: function () { return client_2.ItemRarity; } });
let AuctionService = class AuctionService {
    constructor(prisma, walletService, rankService, notificationService, eventEmitter) {
        this.prisma = prisma;
        this.walletService = walletService;
        this.rankService = rankService;
        this.notificationService = notificationService;
        this.eventEmitter = eventEmitter;
    }
    async findAll(filters) {
        const auctions = await this.prisma.auction.findMany({
            where: {
                status: filters.status ?? (filters.statuses ? { in: filters.statuses } : undefined),
                auctionType: filters.type,
                OR: filters.query
                    ? [
                        { title: { contains: filters.query, mode: "insensitive" } },
                        { description: { contains: filters.query, mode: "insensitive" } },
                    ]
                    : undefined,
            },
            orderBy: { startTime: "asc" },
            take: 100,
        });
        if (filters.includeLocked) {
            return auctions;
        }
        if (!filters.userId) {
            // Jika tidak login, sembunyikan semua lelang yang memiliki restriction
            return auctions.filter(a => (!a.minimumRank || a.minimumRank === "CIVIS") && !a.requiredAchievementId);
        }
        const user = await this.prisma.user.findUnique({
            where: { id: filters.userId },
            include: { achievements: true }
        });
        if (!user)
            return auctions.filter(a => (!a.minimumRank || a.minimumRank === "CIVIS") && !a.requiredAchievementId);
        const RANK_ORDER = ["CIVIS", "BARON", "VISCOUNT", "EARL", "MARQUIS", "DUKE", "GRAND_DUKE", "ARCHDUKE", "EMPEROR"];
        const userRankIndex = RANK_ORDER.indexOf(user.rank);
        return auctions.filter(a => {
            // Filter Rank
            if (a.minimumRank && RANK_ORDER.indexOf(a.minimumRank) > userRankIndex)
                return false;
            // Filter Achievement
            if (a.requiredAchievementId) {
                const hasAchievement = user.achievements.some(ua => ua.achievementId === a.requiredAchievementId);
                if (!hasAchievement)
                    return false;
            }
            return true;
        });
    }
    async findEventAuctions(userId) {
        const now = new Date();
        const event = await this.prisma.event.findFirst({
            where: {
                isActive: true,
                startTime: { lte: now },
                endTime: { gte: now },
            },
            orderBy: { startTime: "desc" },
        });
        if (!event) {
            return { event: null, auctions: [] };
        }
        const auctions = await this.findAll({
            statuses: [client_1.AuctionStatus.ACTIVE, client_1.AuctionStatus.ENDING, client_1.AuctionStatus.UPCOMING],
            userId,
        });
        return {
            event,
            auctions: auctions
                .filter((auction) => auction.auctionType !== client_1.AuctionType.RANK_EXCL)
                .sort((a, b) => {
                if (a.auctionType === client_1.AuctionType.LIVE && b.auctionType !== client_1.AuctionType.LIVE)
                    return -1;
                if (a.auctionType !== client_1.AuctionType.LIVE && b.auctionType === client_1.AuctionType.LIVE)
                    return 1;
                return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
            }),
        };
    }
    async findOne(id) {
        const auction = await this.prisma.auction.findUnique({
            where: { id },
            include: { bids: { orderBy: { placedAt: "desc" }, take: 50 } },
        });
        if (!auction)
            throw new common_1.NotFoundException("Lelang tidak ditemukan");
        return auction;
    }
    async getBids(id) {
        await this.findOne(id);
        const bids = await this.prisma.bid.findMany({
            where: { auctionId: id },
            orderBy: { placedAt: "desc" },
            take: 100,
            include: {
                user: {
                    select: {
                        username: true,
                        rank: true,
                        activeNameEffect: true,
                        activeCoatFrame: true,
                        avatarUrl: true
                    }
                }
            }
        });
        return bids.map(b => ({
            ...b,
            username: b.user?.username,
            rank: b.user?.rank,
            activeNameEffect: b.user?.activeNameEffect,
            activeCoatFrame: b.user?.activeCoatFrame,
            avatarUrl: b.user?.avatarUrl,
            timestamp: b.placedAt, // Map placedAt to timestamp to match WS payload
        }));
    }
    async create(dto) {
        const startTime = new Date(dto.startTime);
        const endTime = new Date(dto.endTime);
        if (startTime >= endTime) {
            throw new common_1.BadRequestException("Waktu mulai harus sebelum waktu selesai");
        }
        return this.prisma.auction.create({
            data: {
                title: dto.title,
                description: dto.description,
                category: dto.category,
                rarity: dto.rarity ?? client_1.ItemRarity.COMMON,
                auctionType: dto.auctionType,
                startingPrice: dto.startingPrice,
                currentPrice: dto.startingPrice,
                minimumIncrement: dto.minimumIncrement ?? 1,
                minimumPrice: dto.minimumPrice,
                decrementAmount: dto.decrementAmount,
                startTime,
                endTime,
                minimumRank: dto.minimumRank ?? client_1.Rank.CIVIS,
                requiredAchievementId: dto.requiredAchievementId,
                isSealed: dto.isSealed ?? false,
                imageUrls: dto.imageUrls ?? [],
            },
        });
    }
    async update(id, dto) {
        const auction = await this.findOne(id);
        if (auction.status !== client_1.AuctionStatus.DRAFT && auction.status !== client_1.AuctionStatus.UPCOMING) {
            throw new common_1.BadRequestException("Lelang aktif tidak dapat diedit");
        }
        return this.prisma.auction.update({
            where: { id },
            data: {
                ...dto,
                startTime: dto.startTime ? new Date(dto.startTime) : undefined,
                endTime: dto.endTime ? new Date(dto.endTime) : undefined,
            },
        });
    }
    async publish(id) {
        const auction = await this.findOne(id);
        if (auction.status !== client_1.AuctionStatus.DRAFT) {
            throw new common_1.BadRequestException("Hanya lelang DRAFT yang dapat dipublikasikan");
        }
        return this.prisma.auction.update({
            where: { id },
            data: { status: auction.startTime <= new Date() ? client_1.AuctionStatus.ACTIVE : client_1.AuctionStatus.UPCOMING },
        });
    }
    async cancel(id) {
        const auction = await this.findOne(id);
        if (auction.status === client_1.AuctionStatus.ENDED || auction.status === client_1.AuctionStatus.CANCELLED) {
            throw new common_1.BadRequestException("Lelang sudah selesai atau dibatalkan");
        }
        const activeBids = await this.prisma.bid.findMany({
            where: { auctionId: id, status: "ACTIVE" },
        });
        for (const bid of activeBids) {
            await this.walletService.releaseBalance(bid.userId, bid.amount, `cancel-${id}-${bid.id}`, id);
        }
        await this.prisma.bid.updateMany({
            where: { auctionId: id, status: "ACTIVE" },
            data: { status: "REFUNDED" },
        });
        return this.prisma.auction.update({
            where: { id },
            data: { status: client_1.AuctionStatus.CANCELLED },
        });
    }
    async endAuction(id) {
        const auction = await this.findOne(id);
        if (auction.status === client_1.AuctionStatus.ENDED || auction.status === client_1.AuctionStatus.CANCELLED)
            return auction;
        const bids = await this.prisma.bid.findMany({
            where: { auctionId: id, status: "ACTIVE" },
            orderBy: [{ amount: "desc" }, { placedAt: "asc" }],
        });
        const winner = bids[0];
        if (!winner) {
            return this.prisma.auction.update({ where: { id }, data: { status: client_1.AuctionStatus.ENDED } });
        }
        await this.walletService.deductBalance(winner.userId, winner.amount, client_1.WalletTxType.BID_DEDUCT, `win-${id}-${winner.userId}`, id);
        for (const bid of bids.slice(1)) {
            await this.walletService.releaseBalance(bid.userId, bid.amount, `lose-${id}-${bid.id}`, id);
        }
        const uniqueLoserIds = [...new Set(bids.slice(1).map(b => b.userId))];
        for (const loserId of uniqueLoserIds) {
            await this.rankService.awardExp(loserId, 5, `Partisipasi lelang aktif (${auction.title})`);
        }
        await this.prisma.bid.updateMany({
            where: { auctionId: id, status: "ACTIVE" },
            data: { status: "REFUNDED" },
        });
        await this.prisma.bid.update({ where: { id: winner.id }, data: { status: "WON" } });
        const user = await this.prisma.user.findUnique({ where: { id: winner.userId } });
        const cashbackRate = user ? types_1.CASHBACK_RATE[user.rank] : 0;
        if (cashbackRate > 0) {
            await this.walletService.addBalance(winner.userId, Math.floor(winner.amount * cashbackRate), client_1.WalletTxType.CASHBACK, `cashback-${id}-${winner.userId}`, id);
        }
        await this.rankService.awardWinExp(winner.userId);
        await this.notificationService.send(winner.userId, "YOU_WON", {
            auctionId: id,
            title: auction.title,
            finalPrice: winner.amount,
        });
        const refreshedUser = await this.prisma.user.findUnique({ where: { id: winner.userId } });
        if (refreshedUser) {
            this.eventEmitter.emit("auction.won", {
                userId: winner.userId,
                auctionId: id,
                totalWins: refreshedUser.totalWins,
            });
        }
        const inMuseum = auction.rarity === client_1.ItemRarity.LEGENDARY || auction.rarity === client_1.ItemRarity.TRANSCENDENT;
        if (inMuseum) {
            await this.prisma.museumItem.upsert({
                where: { auctionId: id },
                update: {},
                create: { auctionId: id, editorial: `${auction.title} dimenangkan seharga ${winner.amount} CC.` },
            });
        }
        return this.prisma.auction.update({
            where: { id },
            data: {
                status: client_1.AuctionStatus.ENDED,
                winnerId: winner.userId,
                finalPrice: winner.amount,
                inMuseum,
            },
        });
    }
    async handleDescendingAuctions() {
        const auctions = await this.prisma.auction.findMany({
            where: { auctionType: client_1.AuctionType.DESCENDING, status: client_1.AuctionStatus.ACTIVE },
        });
        for (const auction of auctions) {
            if (!auction.decrementAmount)
                continue;
            const nextPrice = Math.max(auction.minimumPrice ?? 1, auction.currentPrice - auction.decrementAmount);
            // Don't update if already at minimum
            if (auction.currentPrice <= nextPrice)
                continue;
            await this.prisma.auction.update({
                where: { id: auction.id },
                data: { currentPrice: nextPrice },
            });
            this.eventEmitter.emit('auction.price.descended', {
                auctionId: auction.id,
                newPrice: nextPrice
            });
        }
    }
};
exports.AuctionService = AuctionService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_MINUTE),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuctionService.prototype, "handleDescendingAuctions", null);
exports.AuctionService = AuctionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        wallet_service_1.WalletService,
        rank_service_1.RankService,
        notification_service_1.NotificationService,
        event_emitter_1.EventEmitter2])
], AuctionService);
//# sourceMappingURL=auction.service.js.map