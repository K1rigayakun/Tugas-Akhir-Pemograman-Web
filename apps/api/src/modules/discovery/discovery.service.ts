import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class DiscoveryService {
  constructor(private readonly prisma: PrismaService) {}

  async leaderboard(category: string, limit = 50) {
    const take = Math.min(Math.max(limit, 3), 100);
    if (category === "top-spender") {
      const wallets = await this.prisma.walletAccount.findMany({
        take,
        orderBy: { totalSpent: "desc" },
        include: { user: true },
      });
      return wallets.map((entry, index) => this.leaderEntry(entry.user, index, entry.totalSpent));
    }

    const field = ({
      "most-wins": "totalWins",
      "highest-streak": "longestStreak",
      "highest-rank": "totalExp",
      "event-champion": "totalExp",
      "live-auction-king": "totalWins",
    } as Record<string, "totalWins" | "longestStreak" | "totalExp">)[category];

    if (field) {
      const users = await this.prisma.user.findMany({
        where: { deletedAt: null, isSuspended: false },
        take,
        orderBy: { [field]: "desc" },
      });
      return users.map((user, index) => this.leaderEntry(user, index, user[field]));
    }

    if (category === "rare-collector") {
      const users = await this.prisma.user.findMany({
        where: { deletedAt: null, isSuspended: false },
        take: 100,
        include: { _count: { select: { cosmetics: true } } },
      });
      return users
        .sort((a, b) => b._count.cosmetics - a._count.cosmetics)
        .slice(0, take)
        .map((user, index) => this.leaderEntry(user, index, user._count.cosmetics));
    }
    throw new NotFoundException("Kategori leaderboard tidak ditemukan.");
  }

  museumItems(limit = 20, rarity?: string) {
    return this.prisma.museumItem.findMany({
      take: Math.min(Math.max(limit, 1), 100),
      where: rarity ? { auction: { rarity: rarity as any } } : undefined,
      orderBy: { featuredAt: "desc" },
      include: {
        auction: {
          include: {
            winner: { select: { username: true, privacyMode: true, rank: true } },
            _count: { select: { bids: true } },
          },
        },
      },
    });
  }

  museumItem(id: string) {
    return this.prisma.museumItem.findUnique({
      where: { id },
      include: { auction: { include: { winner: true, bids: { orderBy: { amount: "desc" }, take: 10 } } } },
    });
  }

  async museumRecords() {
    const [highestPrice, mostBids, longestStreak] = await Promise.all([
      this.prisma.auction.findFirst({ where: { status: "ENDED" }, orderBy: { finalPrice: "desc" } }),
      this.prisma.auction.findFirst({
        where: { status: "ENDED" },
        orderBy: { bids: { _count: "desc" } },
        include: { _count: { select: { bids: true } } },
      }),
      this.prisma.user.findFirst({ orderBy: { longestStreak: "desc" }, select: { username: true, longestStreak: true } }),
    ]);
    return { highestPrice, mostBids, longestStreak };
  }

  firstEmperor() {
    return this.prisma.user.findFirst({
      where: { rank: "EMPEROR" },
      orderBy: { createdAt: "asc" },
      select: { id: true, username: true, createdAt: true, totalWins: true, totalExp: true },
    });
  }

  eventHighlights() {
    return this.prisma.event.findMany({ where: { endTime: { lt: new Date() } }, orderBy: { endTime: "desc" } });
  }

  events() {
    return this.prisma.event.findMany({ orderBy: [{ isActive: "desc" }, { startTime: "asc" }] });
  }

  async event(id: string) {
    const event = await this.prisma.event.findUnique({ where: { id } });
    if (!event) throw new NotFoundException("Event tidak ditemukan.");
    return event;
  }

  private leaderEntry(user: {
    id: string;
    username: string;
    rank: string;
    privacyMode: string;
  }, index: number, value: number) {
    return {
      position: index + 1,
      userId: user.id,
      username: user.privacyMode === "PUBLIC" ? user.username : "The Unknown",
      rank: user.rank,
      value,
    };
  }
}
