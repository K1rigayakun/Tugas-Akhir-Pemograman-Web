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
exports.LiveAuctionService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const db_1 = require("@emerald-kingdom/db");
const audit_service_1 = require("../audit/audit.service");
const live_auction_gateway_1 = require("./live-auction.gateway");
const agora_token_builder_1 = require("../../common/agora/agora-token.builder");
const rank_service_1 = require("../rank/rank.service");
const event_emitter_1 = require("@nestjs/event-emitter");
/**
 * LiveAuctionService — Logika bisnis untuk live auction.
 *
 * Mengelola:
 * - Start/end sesi live auction
 * - Generate Agora token untuk join video streaming
 * - Daftar live auction yang sedang berlangsung
 */
let LiveAuctionService = class LiveAuctionService {
    constructor(configService, auditService, liveAuctionGateway, rankService, eventEmitter) {
        this.configService = configService;
        this.auditService = auditService;
        this.liveAuctionGateway = liveAuctionGateway;
        this.rankService = rankService;
        this.eventEmitter = eventEmitter;
        this.logger = new common_1.Logger("LiveAuctionService");
        this.agoraAppId = this.configService.get("AGORA_APP_ID") || "";
        this.agoraCertificate =
            this.configService.get("AGORA_APP_CERTIFICATE") || "";
        if (!this.agoraAppId || !this.agoraCertificate) {
            this.logger.warn("Agora credentials belum lengkap. " +
                "Set AGORA_APP_ID dan AGORA_APP_CERTIFICATE di .env");
        }
    }
    /**
     * Mulai sesi live auction.
     * Hanya admin yang bisa memulai.
     */
    async startLiveSession(adminId, auctionId, ipAddress) {
        const auction = await db_1.prisma.auction.findUnique({
            where: { id: auctionId },
        });
        if (!auction) {
            return { success: false, message: "Lelang tidak ditemukan." };
        }
        if (auction.auctionType !== "LIVE") {
            return { success: false, message: "Lelang ini bukan tipe LIVE." };
        }
        // Update status ke ACTIVE
        await db_1.prisma.auction.update({
            where: { id: auctionId },
            data: { status: "ACTIVE" },
        });
        await this.auditService.logAdminAction(adminId, "START_LIVE_AUCTION", auctionId, "AUCTION", { title: auction.title }, ipAddress);
        this.logger.log(`Live auction started: ${auctionId}`);
        // Generate host token untuk admin
        const hostToken = this.getAgoraToken(auctionId, 0, true);
        return {
            success: true,
            message: "Sesi live auction dimulai.",
            auctionId,
            hostToken,
        };
    }
    /**
     * Akhiri sesi live auction.
     */
    async endLiveSession(adminId, auctionId, ipAddress) {
        const auction = await db_1.prisma.auction.findUnique({
            where: { id: auctionId },
            include: {
                bids: {
                    where: { status: "ACTIVE" },
                    orderBy: { amount: "desc" },
                    take: 1,
                },
            },
        });
        if (!auction) {
            return { success: false, message: "Lelang tidak ditemukan." };
        }
        const winningBid = auction.bids[0];
        // Atomic: update auction + mark winning bid
        await db_1.prisma.$transaction(async (tx) => {
            await tx.auction.update({
                where: { id: auctionId },
                data: {
                    status: "ENDED",
                    winnerId: winningBid?.userId || null,
                    finalPrice: winningBid?.amount || null,
                },
            });
            if (winningBid) {
                await tx.bid.update({
                    where: { id: winningBid.id },
                    data: { status: "WON" },
                });
            }
        });
        if (winningBid) {
            await this.rankService.awardWinExp(winningBid.userId);
            const refreshedUser = await db_1.prisma.user.findUnique({ where: { id: winningBid.userId } });
            if (refreshedUser) {
                this.eventEmitter.emit("auction.won", {
                    userId: winningBid.userId,
                    auctionId: auctionId,
                    totalWins: refreshedUser.totalWins,
                });
            }
        }
        // Broadcast auction ended
        this.liveAuctionGateway.broadcastAuctionEnded(auctionId, winningBid?.userId || "", winningBid?.amount || 0);
        await this.auditService.logAdminAction(adminId, "END_LIVE_AUCTION", auctionId, "AUCTION", {
            title: auction.title,
            winnerId: winningBid?.userId,
            finalPrice: winningBid?.amount,
        }, ipAddress);
        this.logger.log(`Live auction ended: ${auctionId}`);
        return {
            success: true,
            message: "Sesi live auction diakhiri.",
            winnerId: winningBid?.userId || null,
            finalPrice: winningBid?.amount || null,
        };
    }
    /**
     * Generate Agora token untuk join video streaming.
     *
     * @param auctionId - ID lelang (channel name)
     * @param uid - User ID (0 = auto-assign)
     * @param isHost - true kalau user adalah host/admin
     */
    getAgoraToken(auctionId, uid = 0, isHost = false) {
        if (!this.agoraAppId || !this.agoraCertificate) {
            return {
                appId: this.agoraAppId,
                token: "",
                channel: `ek-auction-${auctionId}`,
                uid,
                role: isHost ? "host" : "audience",
                expiresAt: "",
                error: "Agora credentials belum dikonfigurasi.",
            };
        }
        return (0, agora_token_builder_1.generateAuctionToken)(this.agoraAppId, this.agoraCertificate, auctionId, uid, isHost);
    }
    /**
     * Daftar live auction yang sedang berlangsung.
     */
    async getActiveLiveAuctions() {
        return db_1.prisma.auction.findMany({
            where: {
                auctionType: "LIVE",
                status: { in: ["ACTIVE", "ENDING"] },
            },
            orderBy: { startTime: "desc" },
            select: {
                id: true,
                title: true,
                currentPrice: true,
                startTime: true,
                imageUrls: true,
                _count: { select: { bids: true } },
            },
        });
    }
};
exports.LiveAuctionService = LiveAuctionService;
exports.LiveAuctionService = LiveAuctionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        audit_service_1.AuditService,
        live_auction_gateway_1.LiveAuctionGateway,
        rank_service_1.RankService,
        event_emitter_1.EventEmitter2])
], LiveAuctionService);
//# sourceMappingURL=live-auction.service.js.map