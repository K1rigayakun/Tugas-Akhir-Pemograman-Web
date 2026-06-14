import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { BidGateway } from "../bid/bid.gateway";
import { RankService } from "../rank/rank.service";

@Injectable()
export class AchievementService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rankService: RankService,
    private readonly bidGateway: BidGateway,
  ) {}

  async getUserAchievements(userId: string) {
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

  async check(userId: string, eventType: string, context: Record<string, unknown> = {}) {
    const candidates = await this.prisma.achievement.findMany({
      where: { trigger: eventType },
    });
    const unlocked: string[] = [];

    for (const achievement of candidates) {
      const exists = await this.prisma.userAchievement.findUnique({
        where: { userId_achievementId: { userId, achievementId: achievement.id } },
      });
      if (exists || !this.meetsCondition(achievement.condition, context)) continue;

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
        await this.rankService.awardExp(
          userId,
          achievement.expReward,
          `Achievement: ${achievement.name}`,
        );
      }
      this.bidGateway.server?.to(`user:${userId}`).emit("achievement:unlocked", achievement);
      unlocked.push(achievement.id);
    }
    return { unlocked };
  }

  private meetsCondition(condition: unknown, context: Record<string, unknown>) {
    if (!condition || typeof condition !== "object" || Array.isArray(condition)) return true;
    return Object.entries(condition as Record<string, unknown>).every(([key, expected]) => {
      const actual = context[key];
      return typeof expected === "number" && typeof actual === "number"
        ? actual >= expected
        : actual === expected;
    });
  }
}
