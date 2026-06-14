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
exports.GamificationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const bid_gateway_1 = require("../bid/bid.gateway");
const rank_service_1 = require("../rank/rank.service");
const LEADERBOARD_CATEGORIES = [
    "top-spender",
    "most-wins",
    "highest-streak",
    "rare-collector",
    "highest-rank",
    "event-champion",
    "live-auction-king",
];
let GamificationService = class GamificationService {
    constructor(prisma, bidGateway, rankService) {
        this.prisma = prisma;
        this.bidGateway = bidGateway;
        this.rankService = rankService;
        this.localCache = new Map();
    }
    async getActiveEvent() {
        const now = new Date();
        return this.prisma.event.findFirst({
            where: { isActive: true, startTime: { lte: now }, endTime: { gte: now } },
        });
    }
    async startEvent(dto) {
        const now = new Date();
        await this.prisma.event.updateMany({ where: { isActive: true }, data: { isActive: false } });
        const event = await this.prisma.event.create({
            data: {
                name: dto.name,
                theme: dto.theme ?? dto.name,
                expMultiplier: dto.expMultiplier,
                backgroundMode: dto.backgroundMode,
                accentColors: (dto.accentColors ?? []),
                startTime: dto.startTime ? new Date(dto.startTime) : now,
                endTime: dto.endTime ? new Date(dto.endTime) : new Date(now.getTime() + 7 * 86400000),
                isActive: true,
            },
        });
        this.bidGateway.server?.emit("event:started", event);
        return event;
    }
    async endActiveEvent() {
        const event = await this.getActiveEvent();
        if (!event)
            throw new common_1.NotFoundException("Tidak ada event aktif");
        const ended = await this.prisma.event.update({
            where: { id: event.id },
            data: { isActive: false },
        });
        this.bidGateway.server?.emit("event:ended", { eventId: event.id });
        return ended;
    }
    async getDailyQuests(userId) {
        const date = this.today();
        const quests = await this.prisma.dailyQuest.findMany({
            where: { isActive: true },
            include: { progress: { where: { userId, date } } },
        });
        return quests.map(({ progress, ...quest }) => ({
            ...quest,
            progress: progress[0]?.progress ?? 0,
            isCompleted: progress[0]?.isCompleted ?? false,
            claimedAt: progress[0]?.claimedAt ?? null,
        }));
    }
    async claimDailyQuest(userId, questId) {
        const date = this.today();
        const progress = await this.prisma.userQuestProgress.findUnique({
            where: { userId_questId_date: { userId, questId, date } },
            include: { quest: true },
        });
        if (!progress?.isCompleted)
            throw new common_1.BadRequestException("Quest belum selesai");
        if (progress.claimedAt)
            throw new common_1.BadRequestException("Reward quest sudah diklaim");
        await this.prisma.userQuestProgress.update({
            where: { id: progress.id },
            data: { claimedAt: new Date() },
        });
        await this.rankService.awardExp(userId, progress.quest.expReward, `Daily quest: ${progress.quest.title}`);
        return { success: true };
    }
    async refreshLeaderboardCache() {
        const standardUsers = await this.prisma.user.findMany({
            where: { deletedAt: null },
            select: {
                id: true,
                username: true,
                rank: true,
                totalExp: true,
                totalWins: true,
                longestStreak: true,
                privacyMode: true,
            },
            orderBy: { totalExp: "desc" },
            take: 50,
        });
        const spenders = await this.prisma.walletAccount.findMany({
            include: { user: { select: { id: true, username: true, rank: true, privacyMode: true } } },
            orderBy: { totalSpent: "desc" },
            take: 50,
        });
        for (const period of ["weekly", "monthly", "all-time"]) {
            for (const category of LEADERBOARD_CATEGORIES) {
                let data = standardUsers;
                if (category === "top-spender") {
                    data = spenders.map((wallet) => ({ ...wallet.user, value: wallet.totalSpent }));
                }
                else if (category === "most-wins" || category === "live-auction-king") {
                    data = [...standardUsers]
                        .sort((a, b) => b.totalWins - a.totalWins)
                        .map((user) => ({ ...user, value: user.totalWins }));
                }
                else if (category === "highest-streak") {
                    data = [...standardUsers]
                        .sort((a, b) => b.longestStreak - a.longestStreak)
                        .map((user) => ({ ...user, value: user.longestStreak }));
                }
                else {
                    data = standardUsers.map((user) => ({ ...user, value: user.totalExp }));
                }
                this.localCache.set(`leaderboard:${category}:${period}`, JSON.stringify(data));
            }
        }
    }
    async getLeaderboardFromCache(category, period) {
        const safeCategory = LEADERBOARD_CATEGORIES.includes(category) ? category : "highest-rank";
        const safePeriod = ["weekly", "monthly", "all-time"].includes(period) ? period : "all-time";
        const key = `leaderboard:${safeCategory}:${safePeriod}`;
        if (!this.localCache.has(key))
            await this.refreshLeaderboardCache();
        return JSON.parse(this.localCache.get(key) ?? "[]");
    }
    today() {
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        return date;
    }
};
exports.GamificationService = GamificationService;
exports.GamificationService = GamificationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        bid_gateway_1.BidGateway,
        rank_service_1.RankService])
], GamificationService);
//# sourceMappingURL=gamification.service.js.map