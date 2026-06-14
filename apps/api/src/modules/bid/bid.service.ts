import { BadRequestException, ConflictException, Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { AuctionStatus, Rank } from "@prisma/client";
import { randomUUID } from "crypto";
import { EncryptionService } from "../../common/encryption/encryption.service";
import { PrismaService } from "../../prisma/prisma.service";
import { WalletService } from "../wallet/wallet.service";
import { NotificationService } from "../notification/notification.service";
import { BidGateway } from "./bid.gateway";
import { RankService } from "../rank/rank.service";
import { AiService } from "../ai/ai.service";

const RANK_ORDER = Object.values(Rank);

@Injectable()
export class BidService {
  private readonly locks = new Set<string>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly walletService: WalletService,
    private readonly bidGateway: BidGateway,
    private readonly encryptionService: EncryptionService,
    private readonly notificationService: NotificationService,
    private readonly aiService: AiService,
    private readonly rankService: RankService,
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

    let result;
    let succeeded = false;
    try {
      const user = await this.prisma.user.findUnique({ 
        where: { id: userId },
        include: { achievements: true }
      });
      const auction = await this.prisma.auction.findUnique({ where: { id: auctionId } });
      if (!user) throw new BadRequestException("User tidak ditemukan");
      if (user.kycStatus !== "APPROVED") {
        throw new BadRequestException("KYC harus disetujui sebelum melakukan bid");
      }
      if (user.isBannedFromAuction) {
        throw new BadRequestException("Anda dilarang mengikuti lelang");
      }
      if (!auction) throw new BadRequestException("Lelang tidak ditemukan");

      if (auction.status !== "ACTIVE" && auction.status !== "ENDING") {
        throw new BadRequestException("Lelang tidak aktif");
      }
      if (
        auction.minimumRank &&
        RANK_ORDER.indexOf(user.rank) < RANK_ORDER.indexOf(auction.minimumRank)
      ) {
        throw new BadRequestException(`Lelang membutuhkan rank ${auction.minimumRank}`);
      }
      if (auction.requiredAchievementId) {
        const hasAchv = user.achievements.some(a => a.achievementId === auction.requiredAchievementId);
        if (!hasAchv) {
          throw new BadRequestException("Anda tidak memiliki achievement yang dibutuhkan untuk lelang ini");
        }
      }

      const userAddress = await this.prisma.userAddress.findUnique({ where: { userId } });
      const isDigital = auction.category === "Domain Internet Premium" || auction.category === "Digital" || auction.category === "Web Code";
      if (!userAddress && !isDigital) {
        throw new BadRequestException("ADDRESS_REQUIRED: Anda belum mengatur Alamat Pengiriman. Silakan atur di Settings.");
      }

      // ==========================================
      // ANTI-FRAUD RULE: Maksimal 5 bid per menit
      // ==========================================
      const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
      const recentBidsCount = await this.prisma.bid.count({
        where: {
          userId,
          placedAt: { gte: oneMinuteAgo },
        },
      });

      if (recentBidsCount >= 5) {
        throw new HttpException(
          "Aktivitas mencurigakan (Anti-Fraud): Anda telah mencapai batas maksimal 5 bid per menit.",
          HttpStatus.TOO_MANY_REQUESTS
        );
      }
      
      // ==========================================
      // AI FRAUD DETECTION (RINA)
      // ==========================================
      const fraudCheck = await this.aiService.detectFraud(amount, user.rank, auction.currentPrice);
      if (fraudCheck.isFraud) {
        throw new HttpException(
          fraudCheck.reason || "AI mendeteksi anomali penawaran.",
          HttpStatus.FORBIDDEN
        );
      }

      if (auction.auctionType === "DESCENDING") {
        if (amount < auction.currentPrice) {
          throw new BadRequestException(`Bid minimum adalah ${auction.currentPrice} CC`);
        }
      } else {
        if (amount < auction.currentPrice + auction.minimumIncrement) {
          throw new BadRequestException(
            `Bid minimum adalah ${auction.currentPrice + auction.minimumIncrement} CC`,
          );
        }
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
        await this.notificationService.send(currentBid.userId, "OUTBID", {
          auctionId,
          previousAmount: currentBid.amount,
          newAmount: amount,
        });
      }

      await this.walletService.holdBalance(userId, amount, idempotencyKey, auctionId);
      const bid = await this.prisma.bid.create({
        data: { auctionId, userId, amount, status: "ACTIVE" },
      });

      const isDescending = auction.auctionType === "DESCENDING";
      
      let endTime = auction.endTime;
      let status: any = auction.status;

      if (isDescending) {
        status = AuctionStatus.ENDED;
      } else {
        const secondsLeft = (auction.endTime.getTime() - Date.now()) / 1000;
        const extended = secondsLeft <= 60;
        endTime = extended
          ? new Date(auction.endTime.getTime() + 60_000)
          : auction.endTime;
        if (extended) status = AuctionStatus.ENDING;
      }

      await this.prisma.auction.update({
        where: { id: auctionId },
        data: {
          currentPrice: amount,
          endTime,
          status,
          ...(isDescending ? { winnerId: userId, finalPrice: amount } : {})
        },
      });
      this.bidGateway.broadcastNewBid(auctionId, {
        userId,
        amount,
        username: user.username,
        rank: user.rank,
        timestamp: bid.placedAt,
        activeNameEffect: user.activeNameEffect,
        activeCoatFrame: user.activeCoatFrame,
        avatarUrl: user.avatarUrl,
      });

      if (isDescending) {
        this.bidGateway.broadcastAuctionEnded(auctionId, {
          winnerId: userId,
          winnerName: user.username,
          finalPrice: amount
        });
        
        await this.walletService.deductBalance(userId, amount, "BID_DEDUCT", idempotencyKey + '-win', auctionId, true);
        
        // Gamification: Berikan XP kemenangan
        await this.rankService.awardWinExp(userId);

        const isDigital = auction.category === "Domain Internet Premium" || auction.category === "Digital" || auction.category === "Web Code";
        const userAddress = await this.prisma.userAddress.findUnique({ where: { userId } });
        if (!isDigital && userAddress) {
          await this.prisma.delivery.create({
            data: {
              auctionId,
              userId,
              recipient: userAddress.recipient,
              phoneNumber: userAddress.phoneNumber,
              address: userAddress.address,
              city: userAddress.city,
              province: userAddress.province,
              postalCode: userAddress.postalCode,
              status: "PENDING"
            }
          });
        }
        await this.notificationService.send(userId, "YOU_WON" as any, { auctionId, message: `Selamat! Anda memenangkan lelang ${auction.title}.` });

      } else {
        const secondsLeft = (auction.endTime.getTime() - Date.now()) / 1000;
        const extended = secondsLeft <= 60;
        if (extended) {
          this.bidGateway.broadcastTimerExtended(auctionId, {
            newEndTime: endTime,
            message: "A new claim has been declared - the clock extends.",
          });
        }
      }

      await this.prisma.user.update({
        where: { id: userId },
        data: { totalBids: { increment: 1 } },
      });

      // Gamification: Berikan 10 XP jika ini bid pertama user di lelang ini
      const previousBidCount = await this.prisma.bid.count({
        where: { auctionId, userId, id: { not: bid.id } }
      });
      if (previousBidCount === 0) {
        await this.rankService.awardExp(userId, 10, `Bid pertama di lelang: ${auction.title}`);
      }

      result = bid;
      succeeded = true;
    } finally {
      this.locks.delete(lockKey);
    }
    if (succeeded && allowPhantomResponse) {
      await this.respondWithPhantomBid(auctionId, userId);
    }
    return result;
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
