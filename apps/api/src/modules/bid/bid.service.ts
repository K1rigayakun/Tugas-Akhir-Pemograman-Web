import { BadRequestException, ConflictException, Injectable } from "@nestjs/common";
import { AuctionStatus, Rank } from "@prisma/client";
import { randomUUID } from "crypto";
import { EncryptionService } from "../../common/encryption/encryption.service";
import { PrismaService } from "../../prisma/prisma.service";
import { WalletService } from "../wallet/wallet.service";
import { BidGateway } from "./bid.gateway";

const RANK_ORDER = Object.values(Rank);

@Injectable()
export class BidService {
  private readonly locks = new Set<string>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly walletService: WalletService,
    private readonly bidGateway: BidGateway,
    private readonly encryptionService: EncryptionService,
  ) {}

  async placeBid(
    auctionId: string,
    userId: string,
    amount: number,
    idempotencyKey: string,
    allowPhantomResponse = true,
  ) {
    const lockKey = `bid:${auctionId}`;
    if (this.locks.has(lockKey)) {
      throw new ConflictException("Bid lain sedang diproses. Silakan coba lagi.");
    }
    this.locks.add(lockKey);

    try {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      const auction = await this.prisma.auction.findUnique({ where: { id: auctionId } });
      if (!user) throw new BadRequestException("User tidak ditemukan");
      if (user.kycStatus !== "APPROVED") {
        throw new BadRequestException("KYC harus disetujui sebelum melakukan bid");
      }
      if (
        !auction ||
        (auction.status !== AuctionStatus.ACTIVE && auction.status !== AuctionStatus.ENDING)
      ) {
        throw new BadRequestException("Lelang tidak aktif");
      }
      if (
        auction.minimumRank &&
        RANK_ORDER.indexOf(user.rank) < RANK_ORDER.indexOf(auction.minimumRank)
      ) {
        throw new BadRequestException(`Lelang membutuhkan rank ${auction.minimumRank}`);
      }
      if (amount < auction.currentPrice + auction.minimumIncrement) {
        throw new BadRequestException(
          `Bid minimum adalah ${auction.currentPrice + auction.minimumIncrement} CC`,
        );
      }

      const currentBid = await this.prisma.bid.findFirst({
        where: { auctionId, status: "ACTIVE" },
        orderBy: [{ amount: "desc" }, { placedAt: "asc" }],
      });
      if (currentBid) {
        await this.walletService.releaseBalance(
          currentBid.userId,
          currentBid.amount,
          `outbid-${auctionId}-${currentBid.id}`,
          auctionId,
        );
        await this.prisma.bid.update({
          where: { id: currentBid.id },
          data: { status: "OUTBID" },
        });
      }

      await this.walletService.holdBalance(userId, amount, idempotencyKey, auctionId);
      const bid = await this.prisma.bid.create({
        data: { auctionId, userId, amount, status: "ACTIVE" },
      });

      const secondsLeft = (auction.endTime.getTime() - Date.now()) / 1000;
      const extended = secondsLeft <= 60;
      const endTime = extended
        ? new Date(auction.endTime.getTime() + 60_000)
        : auction.endTime;
      await this.prisma.auction.update({
        where: { id: auctionId },
        data: {
          currentPrice: amount,
          endTime,
          status: extended ? AuctionStatus.ENDING : auction.status,
        },
      });

      this.bidGateway.broadcastNewBid(auctionId, {
        userId,
        amount,
        username: user.username,
        rank: user.rank,
        timestamp: bid.placedAt,
      });
      if (extended) {
        this.bidGateway.broadcastTimerExtended(auctionId, {
          newEndTime: endTime,
          message: "A new claim has been declared - the clock extends.",
        });
      }

      await this.prisma.user.update({
        where: { id: userId },
        data: { totalBids: { increment: 1 } },
      });
      return bid;
    } finally {
      this.locks.delete(lockKey);
      if (allowPhantomResponse) {
        await this.respondWithPhantomBid(auctionId, userId);
      }
    }
  }

  async placePhantomBid(
    auctionId: string,
    userId: string,
    maxAmount: number,
    idempotencyKey: string,
  ) {
    const auction = await this.prisma.auction.findUnique({ where: { id: auctionId } });
    const wallet = await this.walletService.getBalance(userId);
    if (
      !auction ||
      (auction.status !== AuctionStatus.ACTIVE && auction.status !== AuctionStatus.ENDING)
    ) {
      throw new BadRequestException("Lelang tidak aktif");
    }
    if (maxAmount < auction.currentPrice + auction.minimumIncrement) {
      throw new BadRequestException("Batas phantom bid terlalu rendah");
    }
    if (wallet.availableBalance < maxAmount) {
      throw new BadRequestException("Saldo tidak cukup untuk batas phantom bid");
    }

    const phantom = await this.prisma.phantomBid.upsert({
      where: { userId_auctionId: { userId, auctionId } },
      update: { maxAmount: this.encryptionService.encrypt(String(maxAmount)), isActive: true },
      create: {
        userId,
        auctionId,
        maxAmount: this.encryptionService.encrypt(String(maxAmount)),
      },
    });
    await this.respondWithPhantomBid(auctionId, "");
    return { ...phantom, maxAmount: undefined, idempotencyKey };
  }

  private async respondWithPhantomBid(auctionId: string, excludedUserId: string) {
    const auction = await this.prisma.auction.findUnique({ where: { id: auctionId } });
    if (
      !auction ||
      (auction.status !== AuctionStatus.ACTIVE && auction.status !== AuctionStatus.ENDING)
    ) {
      return;
    }

    const phantoms = await this.prisma.phantomBid.findMany({
      where: { auctionId, isActive: true, userId: { not: excludedUserId || undefined } },
    });
    const candidate = phantoms
      .map((phantom) => ({
        ...phantom,
        limit: Number(this.encryptionService.decrypt(phantom.maxAmount)),
      }))
      .filter((phantom) => phantom.limit >= auction.currentPrice + auction.minimumIncrement)
      .sort((a, b) => b.limit - a.limit)[0];
    if (!candidate) return;

    const nextAmount = Math.min(
      candidate.limit,
      auction.currentPrice + auction.minimumIncrement,
    );
    try {
      await this.placeBid(auctionId, candidate.userId, nextAmount, randomUUID(), false);
    } catch {
      await this.prisma.phantomBid.update({
        where: { id: candidate.id },
        data: { isActive: false },
      });
    }
  }
}
