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

export { AuctionStatus, ItemRarity } from "@prisma/client";

@Injectable()
export class AuctionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly walletService: WalletService,
    private readonly rankService: RankService,
    private readonly notificationService: NotificationService,
  ) {}

  async findAll(filters: { status?: AuctionStatus; type?: AuctionType; query?: string }) {
    return this.prisma.auction.findMany({
      where: {
        status: filters.status,
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
    return this.prisma.bid.findMany({
      where: { auctionId: id },
      orderBy: { placedAt: "desc" },
      take: 100,
    });
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

  async handleDescendingAuctions() {
    const auctions = await this.prisma.auction.findMany({
      where: { auctionType: AuctionType.DESCENDING, status: AuctionStatus.ACTIVE },
    });
    for (const auction of auctions) {
      const nextPrice = Math.max(
        auction.minimumPrice ?? 1,
        auction.currentPrice - (auction.decrementAmount ?? auction.minimumIncrement),
      );
      await this.prisma.auction.update({
        where: { id: auction.id },
        data: { currentPrice: nextPrice },
      });
    }
  }
}
