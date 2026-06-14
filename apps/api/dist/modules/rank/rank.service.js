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
exports.RankService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const bid_gateway_1 = require("../bid/bid.gateway");
const notification_service_1 = require("../notification/notification.service");
const RANKS = [
    { rank: client_1.Rank.CIVIS, exp: 0 },
    { rank: client_1.Rank.MERCHANT, exp: 500 },
    { rank: client_1.Rank.KNIGHT, exp: 2000 },
    { rank: client_1.Rank.BARON, exp: 8000 },
    { rank: client_1.Rank.VISCOUNT, exp: 25000 },
    { rank: client_1.Rank.EARL, exp: 80000 },
    { rank: client_1.Rank.MARQUIS, exp: 250000 },
    { rank: client_1.Rank.DUKE, exp: 600000 },
    { rank: client_1.Rank.SOVEREIGN, exp: 1000000 },
    { rank: client_1.Rank.EMPEROR, exp: 2000000 },
];
let RankService = class RankService {
    constructor(prisma, bidGateway, notificationService) {
        this.prisma = prisma;
        this.bidGateway = bidGateway;
        this.notificationService = notificationService;
    }
    async getRankInfo(userId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException("User tidak ditemukan");
        const currentIndex = RANKS.findIndex((item) => item.rank === user.rank);
        const current = RANKS[currentIndex];
        const next = RANKS[currentIndex + 1];
        return {
            userId,
            username: user.username,
            currentRank: user.rank,
            currentExp: user.totalExp,
            nextRank: next?.rank ?? null,
            nextRankThreshold: next?.exp ?? null,
            expNeeded: next ? Math.max(next.exp - user.totalExp, 0) : 0,
            progressPercentage: next
                ? Math.min(100, Math.round(((user.totalExp - current.exp) / (next.exp - current.exp)) * 10000) /
                    100)
                : 100,
        };
    }
    async awardExp(userId, baseAmount, reason) {
        if (!Number.isFinite(baseAmount) || baseAmount <= 0) {
            throw new common_1.BadRequestException("EXP harus lebih besar dari nol");
        }
        const activeEvent = await this.prisma.event.findFirst({
            where: { isActive: true, startTime: { lte: new Date() }, endTime: { gte: new Date() } },
        });
        const multiplier = activeEvent?.expMultiplier ?? 1;
        const amount = Math.floor(baseAmount * multiplier);
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException("User tidak ditemukan");
        const totalExp = user.totalExp + amount;
        let targetRank = [...RANKS].reverse().find((item) => totalExp >= item.exp)?.rank ?? client_1.Rank.CIVIS;
        targetRank = await this.applySpecialRequirements(userId, targetRank);
        await this.prisma.$transaction([
            this.prisma.expEvent.create({ data: { userId, amount, multiplier, reason } }),
            this.prisma.user.update({ where: { id: userId }, data: { totalExp, rank: targetRank } }),
            ...(targetRank !== user.rank
                ? [
                    this.prisma.rankHistory.create({
                        data: { userId, fromRank: user.rank, toRank: targetRank, reason },
                    }),
                ]
                : []),
        ]);
        if (targetRank !== user.rank) {
            this.bidGateway.server?.to(`user:${userId}`).emit("rank:changed", { newRank: targetRank });
            await this.notificationService.send(userId, "RANK_UP", {
                previousRank: user.rank,
                newRank: targetRank,
            });
            // ==========================================
            // GLOBAL ANNOUNCEMENT UNTUK EMPEROR (Fase 3)
            // ==========================================
            if (targetRank === client_1.Rank.EMPEROR) {
                await this.notificationService.sendGlobal("EMPEROR_ASCENSION", {
                    title: "A New Emperor Rises!",
                    message: `Puji Kaisar! ${user.username} telah naik takhta menjadi EMPEROR yang baru di Aurum Imperium!`,
                    username: user.username
                });
            }
        }
        return {
            previousExp: user.totalExp,
            newExp: totalExp,
            earnedExp: amount,
            previousRank: user.rank,
            currentRank: targetRank,
            promoted: targetRank !== user.rank,
        };
    }
    async awardWinExp(userId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException("User tidak ditemukan");
        const winStreak = user.winStreak + 1;
        const multiplier = winStreak >= 10 ? 3 : winStreak >= 5 ? 2 : winStreak >= 3 ? 1.5 : 1;
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                totalWins: { increment: 1 },
                winStreak,
                longestStreak: Math.max(user.longestStreak, winStreak),
            },
        });
        return this.awardExp(userId, Math.floor(100 * multiplier), `Memenangkan lelang (${winStreak} streak)`);
    }
    async getRankHistory(userId) {
        return this.prisma.rankHistory.findMany({
            where: { userId },
            orderBy: { changedAt: "desc" },
            take: 100,
        });
    }
    async applySpecialRequirements(userId, targetRank) {
        if (targetRank !== client_1.Rank.SOVEREIGN && targetRank !== client_1.Rank.EMPEROR)
            return targetRank;
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            return client_1.Rank.CIVIS;
        const ageDays = (Date.now() - user.createdAt.getTime()) / 86400000;
        if (targetRank === client_1.Rank.SOVEREIGN) {
            return user.totalWins >= 300 && ageDays >= 365 && !user.isSuspended
                ? targetRank
                : client_1.Rank.DUKE;
        }
        const liveWins = await this.prisma.bid.count({
            where: { userId, status: "WON", auction: { auctionType: client_1.AuctionType.LIVE } },
        });
        const sovereignHistory = await this.prisma.rankHistory.findFirst({
            where: { userId, toRank: client_1.Rank.SOVEREIGN },
            orderBy: { changedAt: "asc" },
        });
        const sovereignDays = sovereignHistory
            ? (Date.now() - sovereignHistory.changedAt.getTime()) / 86400000
            : 0;
        return user.totalWins >= 500 && liveWins > 0 && ageDays >= 730 && sovereignDays >= 180
            ? client_1.Rank.EMPEROR
            : client_1.Rank.SOVEREIGN;
    }
};
exports.RankService = RankService;
exports.RankService = RankService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        bid_gateway_1.BidGateway,
        notification_service_1.NotificationService])
], RankService);
//# sourceMappingURL=rank.service.js.map