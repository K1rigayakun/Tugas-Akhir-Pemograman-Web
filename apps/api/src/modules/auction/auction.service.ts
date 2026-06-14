import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import {
  AuctionStatus,
  AuctionType,
  ItemRarity,
  Rank,
  WalletTxType,
} from "@prisma/client";
import { CASHBACK_RATE } from "@emerald-kingdom/types";
import { PrismaService } from "../../prisma/prisma.service";
import { RankService } from "../rank/rank.service";
import { WalletService } from "../wallet/wallet.service";
import { CreateAuctionDto } from "./dto/create-auction.dto";
import { UpdateAuctionDto } from "./dto/update-auction.dto";
import { NotificationService } from "../notification/notification.service";
import { EventEmitter2 } from "@nestjs/event-emitter";

import { Cron, CronExpression } from '@nestjs/schedule';

export { AuctionStatus, ItemRarity } from "@prisma/client";

@Injectable()
export class AuctionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly walletService: WalletService,
    private readonly rankService: RankService,
    private readonly notificationService: NotificationService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async findAll(filters: {
    status?: AuctionStatus;
    statuses?: AuctionStatus[];
    type?: AuctionType;
    query?: string;
    userId?: string;
    includeLocked?: boolean;
  }) {
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

    if (!user) return auctions.filter(a => (!a.minimumRank || a.minimumRank === "CIVIS") && !a.requiredAchievementId);

    const RANK_ORDER = ["CIVIS", "BARON", "VISCOUNT", "EARL", "MARQUIS", "DUKE", "GRAND_DUKE", "ARCHDUKE", "EMPEROR"];
    const userRankIndex = RANK_ORDER.indexOf(user.rank);

    return auctions.filter(a => {
      // Filter Rank
      if (a.minimumRank && RANK_ORDER.indexOf(a.minimumRank) > userRankIndex) return false;
      // Filter Achievement
      if (a.requiredAchievementId) {
        const hasAchievement = user.achievements.some(ua => ua.achievementId === a.requiredAchievementId);
        if (!hasAchievement) return false;
      }
      return true;
    });
  }

  async findEventAuctions(userId?: string) {
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
      statuses: [AuctionStatus.ACTIVE, AuctionStatus.ENDING, AuctionStatus.UPCOMING],
      userId,
    });

    return {
      event,
      auctions: auctions
        .filter((auction) => auction.auctionType !== AuctionType.RANK_EXCL)
        .sort((a, b) => {
          if (a.auctionType === AuctionType.LIVE && b.auctionType !== AuctionType.LIVE) return -1;
          if (a.auctionType !== AuctionType.LIVE && b.auctionType === AuctionType.LIVE) return 1;
          return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
        }),
    };
  }

  async findOne(id: string) {
    const auction = await this.prisma.auction.findUnique({
      where: { id },
      include: { bids: { orderBy: { placedAt: "desc" }, take: 50 } },
    });
    if (!auction) throw new NotFoundException("Lelang tidak ditemukan");
    return auction;
  }

  async getBids(id: string) {
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

  async create(dto: CreateAuctionDto) {
    const startTime = new Date(dto.startTime);
    const endTime = new Date(dto.endTime);
    if (startTime >= endTime) {
      throw new BadRequestException("Waktu mulai harus sebelum waktu selesai");
    }

    return this.prisma.auction.create({
      data: {
        title: dto.title,
        description: dto.description,
        category: dto.category,
        rarity: dto.rarity ?? ItemRarity.COMMON,
        auctionType: dto.auctionType,
        startingPrice: dto.startingPrice,
        currentPrice: dto.startingPrice,
        minimumIncrement: dto.minimumIncrement ?? 1,
        minimumPrice: dto.minimumPrice,
        decrementAmount: dto.decrementAmount,
        startTime,
        endTime,
        minimumRank: dto.minimumRank ?? Rank.CIVIS,
        requiredAchievementId: dto.requiredAchievementId,
        isSealed: dto.isSealed ?? false,
        imageUrls: dto.imageUrls ?? [],
      },
    });
  }

  async update(id: string, dto: UpdateAuctionDto) {
    const auction = await this.findOne(id);
    if (auction.status !== AuctionStatus.DRAFT && auction.status !== AuctionStatus.UPCOMING) {
      throw new BadRequestException("Lelang aktif tidak dapat diedit");
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

  async publish(id: string) {
    const auction = await this.findOne(id);
    if (auction.status !== AuctionStatus.DRAFT) {
      throw new BadRequestException("Hanya lelang DRAFT yang dapat dipublikasikan");
    }
    return this.prisma.auction.update({
      where: { id },
      data: { status: auction.startTime <= new Date() ? AuctionStatus.ACTIVE : AuctionStatus.UPCOMING },
    });
  }

  async cancel(id: string) {
    const auction = await this.findOne(id);
    if (auction.status === AuctionStatus.ENDED || auction.status === AuctionStatus.CANCELLED) {
      throw new BadRequestException("Lelang sudah selesai atau dibatalkan");
    }

    const activeBids = await this.prisma.bid.findMany({
      where: { auctionId: id, status: "ACTIVE" },
    });
    for (const bid of activeBids) {
      await this.walletService.releaseBalance(
        bid.userId,
        bid.amount,
        `cancel-${id}-${bid.id}`,
        id,
      );
    }

    await this.prisma.bid.updateMany({
      where: { auctionId: id, status: "ACTIVE" },
      data: { status: "REFUNDED" },
    });
    return this.prisma.auction.update({
      where: { id },
      data: { status: AuctionStatus.CANCELLED },
    });
  }

  async endAuction(id: string) {
    const auction = await this.findOne(id);
    if (auction.status === AuctionStatus.ENDED || auction.status === AuctionStatus.CANCELLED) return auction;

    const bids = await this.prisma.bid.findMany({
      where: { auctionId: id, status: "ACTIVE" },
      orderBy: [{ amount: "desc" }, { placedAt: "asc" }],
    });
    const winner = bids[0];
    if (!winner) {
      return this.prisma.auction.update({ where: { id }, data: { status: AuctionStatus.ENDED } });
    }

    await this.walletService.deductBalance(
      winner.userId,
      winner.amount,
      WalletTxType.BID_DEDUCT,
      `win-${id}-${winner.userId}`,
      id,
    );
    for (const bid of bids.slice(1)) {
      await this.walletService.releaseBalance(
        bid.userId,
        bid.amount,
        `lose-${id}-${bid.id}`,
        id,
      );
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
    const cashbackRate = user ? CASHBACK_RATE[user.rank] : 0;
    if (cashbackRate > 0) {
      await this.walletService.addBalance(
        winner.userId,
        Math.floor(winner.amount * cashbackRate),
        WalletTxType.CASHBACK,
        `cashback-${id}-${winner.userId}`,
        id,
      );
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

    const inMuseum =
      auction.rarity === ItemRarity.LEGENDARY || auction.rarity === ItemRarity.TRANSCENDENT;
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
        status: AuctionStatus.ENDED,
        winnerId: winner.userId,
        finalPrice: winner.amount,
        inMuseum,
      },
    });
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async handleDescendingAuctions() {
    const auctions = await this.prisma.auction.findMany({
      where: { auctionType: AuctionType.DESCENDING, status: AuctionStatus.ACTIVE },
    });
    for (const auction of auctions) {
      if (!auction.decrementAmount) continue;
      
      const nextPrice = Math.max(
        auction.minimumPrice ?? 1,
        auction.currentPrice - auction.decrementAmount,
      );
      
      // Don't update if already at minimum
      if (auction.currentPrice <= nextPrice) continue;

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

  @Cron(CronExpression.EVERY_SECOND)
  async resolveEndedAuctions() {
    // Mengecek lelang aktif (STANDARD, DESCENDING) yang waktunya sudah habis
    // Lelang tipe LIVE tidak diresolve otomatis di sini kecuali di-trigger admin
    const now = new Date();
    const auctions = await this.prisma.auction.findMany({
      where: {
        status: AuctionStatus.ACTIVE,
        endTime: { lte: now },
        auctionType: { in: [AuctionType.STANDARD, AuctionType.DESCENDING] }
      },
    });

    for (const auction of auctions) {
      try {
        await this.endAuction(auction.id);
      } catch (error) {
        console.error(`Failed to auto-resolve auction ${auction.id}:`, error);
      }
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async publishUpcomingAuctions() {
    // Mengubah status UPCOMING menjadi ACTIVE saat startTime tercapai
    const now = new Date();
    const auctions = await this.prisma.auction.findMany({
      where: {
        status: AuctionStatus.UPCOMING,
        startTime: { lte: now },
      },
    });

    for (const auction of auctions) {
      await this.prisma.auction.update({
        where: { id: auction.id },
        data: { status: AuctionStatus.ACTIVE },
      });
    }
  }
}
