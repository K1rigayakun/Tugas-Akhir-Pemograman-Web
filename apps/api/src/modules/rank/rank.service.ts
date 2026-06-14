import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { AuctionType, Rank } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { BidGateway } from "../bid/bid.gateway";
import { NotificationService } from "../notification/notification.service";

const RANKS: Array<{ rank: Rank; exp: number }> = [
  { rank: Rank.CIVIS, exp: 0 },
  { rank: Rank.MERCHANT, exp: 500 },
  { rank: Rank.KNIGHT, exp: 2_000 },
  { rank: Rank.BARON, exp: 8_000 },
  { rank: Rank.VISCOUNT, exp: 25_000 },
  { rank: Rank.EARL, exp: 80_000 },
  { rank: Rank.MARQUIS, exp: 250_000 },
  { rank: Rank.DUKE, exp: 600_000 },
  { rank: Rank.SOVEREIGN, exp: 1_000_000 },
  { rank: Rank.EMPEROR, exp: 2_000_000 },
];

@Injectable()
export class RankService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly bidGateway: BidGateway,
    private readonly notificationService: NotificationService,
  ) {}

  async getRankInfo(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException("User tidak ditemukan");

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
        ? Math.min(
            100,
            Math.round(((user.totalExp - current.exp) / (next.exp - current.exp)) * 10_000) /
              100,
          )
        : 100,
    };
  }

  async awardExp(userId: string, baseAmount: number, reason: string) {
    if (!Number.isFinite(baseAmount) || baseAmount <= 0) {
      throw new BadRequestException("EXP harus lebih besar dari nol");
    }

    const activeEvent = await this.prisma.event.findFirst({
      where: { isActive: true, startTime: { lte: new Date() }, endTime: { gte: new Date() } },
    });
    const multiplier = activeEvent?.expMultiplier ?? 1;
    const amount = Math.floor(baseAmount * multiplier);

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException("User tidak ditemukan");
    const totalExp = user.totalExp + amount;
    let targetRank = [...RANKS].reverse().find((item) => totalExp >= item.exp)?.rank ?? Rank.CIVIS;
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
      if (targetRank === Rank.EMPEROR) {
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

  async awardWinExp(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException("User tidak ditemukan");
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

  async getRankHistory(userId: string) {
    return this.prisma.rankHistory.findMany({
      where: { userId },
      orderBy: { changedAt: "desc" },
      take: 100,
    });
  }

  private async applySpecialRequirements(userId: string, targetRank: Rank) {
    if (targetRank !== Rank.SOVEREIGN && targetRank !== Rank.EMPEROR) return targetRank;
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return Rank.CIVIS;
    const ageDays = (Date.now() - user.createdAt.getTime()) / 86_400_000;

    if (targetRank === Rank.SOVEREIGN) {
      return user.totalWins >= 300 && ageDays >= 365 && !user.isSuspended
        ? targetRank
        : Rank.DUKE;
    }

    const liveWins = await this.prisma.bid.count({
      where: { userId, status: "WON", auction: { auctionType: AuctionType.LIVE } },
    });
    const sovereignHistory = await this.prisma.rankHistory.findFirst({
      where: { userId, toRank: Rank.SOVEREIGN },
      orderBy: { changedAt: "asc" },
    });
    const sovereignDays = sovereignHistory
      ? (Date.now() - sovereignHistory.changedAt.getTime()) / 86_400_000
      : 0;
    return user.totalWins >= 500 && liveWins > 0 && ageDays >= 730 && sovereignDays >= 180
      ? Rank.EMPEROR
      : Rank.SOVEREIGN;
  }
}
