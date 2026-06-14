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
exports.AchievementService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const bid_gateway_1 = require("../bid/bid.gateway");
const rank_service_1 = require("../rank/rank.service");
let AchievementService = class AchievementService {
    constructor(prisma, rankService, bidGateway) {
        this.prisma = prisma;
        this.rankService = rankService;
        this.bidGateway = bidGateway;
    }
    async getUserAchievements(userId) {
        const achievements = await this.prisma.achievement.findMany({
            orderBy: { tier: "asc" },
            include: { userAchievements: { where: { userId } } },
        });
        return achievements.map(({ userAchievements, ...achievement }) => ({
            ...achievement,
            isUnlocked: userAchievements.length > 0,
            unlockedAt: userAchievements[0]?.unlockedAt ?? null,
        }));
    }
    async getAchievements() {
        return this.prisma.achievement.findMany({
            orderBy: { tier: "asc" },
            include: { _count: { select: { userAchievements: true } } },
        });
    }
    async check(userId, eventType, context = {}) {
        const candidates = await this.prisma.achievement.findMany({
            where: { trigger: eventType },
        });
        const unlocked = [];
        for (const achievement of candidates) {
            const exists = await this.prisma.userAchievement.findUnique({
                where: { userId_achievementId: { userId, achievementId: achievement.id } },
            });
            if (exists || !this.meetsCondition(achievement.condition, context))
                continue;
            await this.prisma.userAchievement.create({
                data: { userId, achievementId: achievement.id },
            });
            if (achievement.titleReward) {
                await this.prisma.user.update({
                    where: { id: userId },
                    data: { activeTitle: achievement.titleReward },
                });
            }
            if (achievement.cosmeticReward) {
                const cosmetic = await this.prisma.cosmetic.findUnique({
                    where: { id: achievement.cosmeticReward },
                });
                if (cosmetic) {
                    await this.prisma.userCosmetic.upsert({
                        where: { userId_cosmeticId: { userId, cosmeticId: cosmetic.id } },
                        update: {},
                        create: { userId, cosmeticId: cosmetic.id, obtainedFrom: "achievement" },
                    });
                }
            }
            if (achievement.expReward > 0) {
                await this.rankService.awardExp(userId, achievement.expReward, `Achievement: ${achievement.name}`);
            }
            this.bidGateway.server?.to(`user:${userId}`).emit("achievement:unlocked", achievement);
            unlocked.push(achievement.id);
        }
        return { unlocked };
    }
    meetsCondition(condition, context) {
        if (!condition || typeof condition !== "object" || Array.isArray(condition))
            return true;
        return Object.entries(condition).every(([key, expected]) => {
            const actual = context[key];
            return typeof expected === "number" && typeof actual === "number"
                ? actual >= expected
                : actual === expected;
        });
    }
};
exports.AchievementService = AchievementService;
exports.AchievementService = AchievementService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        rank_service_1.RankService,
        bid_gateway_1.BidGateway])
], AchievementService);
//# sourceMappingURL=achievement.service.js.map