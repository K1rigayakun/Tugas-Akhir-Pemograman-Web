import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { BidGateway } from "../bid/bid.gateway";
import { RankService } from "../rank/rank.service";

const LEADERBOARD_CATEGORIES = [
  "top-spender",
  "most-wins",
  "highest-streak",
  "rare-collector",
  "highest-rank",
  "event-champion",
  "live-auction-king",
];

@Injectable()
export class GamificationService {
  private readonly localCache = new Map<string, string>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly bidGateway: BidGateway,
    private readonly rankService: RankService,
  ) {}

  async getActiveEvent() {
    const now = new Date();
    return this.prisma.event.findFirst({
      where: { isActive: true, startTime: { lte: now }, endTime: { gte: now } },
    });
  }

  async startEvent(dto: {
    name: string;
    theme?: string;
    expMultiplier: number;
    backgroundMode?: string;
    accentColors?: unknown;
    startTime?: string;
    endTime?: string;
  }) {
    const now = new Date();
    await this.prisma.event.updateMany({ where: { isActive: true }, data: { isActive: false } });
    const event = await this.prisma.event.create({
      data: {
        name: dto.name,
        theme: dto.theme ?? dto.name,
        expMultiplier: dto.expMultiplier,
        backgroundMode: dto.backgroundMode,
        accentColors: (dto.accentColors ?? []) as object,
        startTime: dto.startTime ? new Date(dto.startTime) : now,
        endTime: dto.endTime ? new Date(dto.endTime) : new Date(now.getTime() + 7 * 86_400_000),
        isActive: true,
      },
    });
    this.bidGateway.server?.emit("event:started", event);
    return event;
  }

  async endActiveEvent() {
    const event = await this.getActiveEvent();
    if (!event) throw new NotFoundException("Tidak ada event aktif");
    const ended = await this.prisma.event.update({
      where: { id: event.id },
      data: { isActive: false },
    });
    this.bidGateway.server?.emit("event:ended", { eventId: event.id });
    return ended;
  }

  async getDailyQuests(userId: string) {
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

  async claimDailyQuest(userId: string, questId: string) {
    const date = this.today();
    const progress = await this.prisma.userQuestProgress.findUnique({
      where: { userId_questId_date: { userId, questId, date } },
      include: { quest: true },
    });
    if (!progress?.isCompleted) throw new BadRequestException("Quest belum selesai");
    if (progress.claimedAt) throw new BadRequestException("Reward quest sudah diklaim");

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
        let data: unknown[] = standardUsers;
        if (category === "top-spender") {
          data = spenders.map((wallet) => ({ ...wallet.user, value: wallet.totalSpent }));
        } else if (category === "most-wins" || category === "live-auction-king") {
          data = [...standardUsers]
            .sort((a, b) => b.totalWins - a.totalWins)
            .map((user) => ({ ...user, value: user.totalWins }));
        } else if (category === "highest-streak") {
          data = [...standardUsers]
            .sort((a, b) => b.longestStreak - a.longestStreak)
            .map((user) => ({ ...user, value: user.longestStreak }));
        } else {
          data = standardUsers.map((user) => ({ ...user, value: user.totalExp }));
        }
        this.localCache.set(`leaderboard:${category}:${period}`, JSON.stringify(data));
      }
    }
  }

  async getLeaderboardFromCache(category: string, period: string) {
    const safeCategory = LEADERBOARD_CATEGORIES.includes(category) ? category : "highest-rank";
    const safePeriod = ["weekly", "monthly", "all-time"].includes(period) ? period : "all-time";
    const key = `leaderboard:${safeCategory}:${safePeriod}`;
    if (!this.localCache.has(key)) await this.refreshLeaderboardCache();
    return JSON.parse(this.localCache.get(key) ?? "[]");
  }

  private today() {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }
}
