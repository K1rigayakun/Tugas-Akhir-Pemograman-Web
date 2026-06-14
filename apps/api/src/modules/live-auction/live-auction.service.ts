import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { prisma } from "@emerald-kingdom/db";
import { AuditService } from "../audit/audit.service";
import { LiveAuctionGateway } from "./live-auction.gateway";
import { generateAuctionToken } from "../../common/agora/agora-token.builder";
import { RankService } from "../rank/rank.service";
import { EventEmitter2 } from "@nestjs/event-emitter";

/**
 * LiveAuctionService — Logika bisnis untuk live auction.
 *
 * Mengelola:
 * - Start/end sesi live auction
 * - Generate Agora token untuk join video streaming
 * - Daftar live auction yang sedang berlangsung
 */
@Injectable()
export class LiveAuctionService {
  private readonly logger = new Logger("LiveAuctionService");
  private readonly agoraAppId: string;
  private readonly agoraCertificate: string;

  constructor(
    private configService: ConfigService,
    private auditService: AuditService,
    private liveAuctionGateway: LiveAuctionGateway,
    private readonly rankService: RankService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.agoraAppId = this.configService.get<string>("AGORA_APP_ID") || "";
    this.agoraCertificate =
      this.configService.get<string>("AGORA_APP_CERTIFICATE") || "";

    if (!this.agoraAppId || !this.agoraCertificate) {
      this.logger.warn(
        "Agora credentials belum lengkap. " +
          "Set AGORA_APP_ID dan AGORA_APP_CERTIFICATE di .env",
      );
    }
  }

  /**
   * Mulai sesi live auction.
   * Hanya admin yang bisa memulai.
   */
  async startLiveSession(
    adminId: string,
    auctionId: string,
    ipAddress?: string,
  ) {
    const auction = await prisma.auction.findUnique({
      where: { id: auctionId },
    });

    if (!auction) {
      return { success: false, message: "Lelang tidak ditemukan." };
    }

    if (auction.auctionType !== "LIVE") {
      return { success: false, message: "Lelang ini bukan tipe LIVE." };
    }

    // Update status ke ACTIVE
    await prisma.auction.update({
      where: { id: auctionId },
      data: { status: "ACTIVE" },
    });

    await this.auditService.logAdminAction(
      adminId,
      "START_LIVE_AUCTION",
      auctionId,
      "AUCTION",
      { title: auction.title },
      ipAddress,
    );

    this.logger.log(`Live auction started: ${auctionId}`);

    // Generate host token untuk admin
    const hostToken = this.getAgoraToken(auctionId, 0, true);

    return {
      success: true,
      message: "Sesi live auction dimulai.",
      auctionId,
      hostToken,
    };
  }

  /**
   * Akhiri sesi live auction.
   */
  async endLiveSession(
    adminId: string,
    auctionId: string,
    ipAddress?: string,
  ) {
    const auction = await prisma.auction.findUnique({
      where: { id: auctionId },
      include: {
        bids: {
          where: { status: "ACTIVE" },
          orderBy: { amount: "desc" },
          take: 1,
        },
      },
    });

    if (!auction) {
      return { success: false, message: "Lelang tidak ditemukan." };
    }

    const winningBid = auction.bids[0];

    // Atomic: update auction + mark winning bid
    await prisma.$transaction(async (tx) => {
      await tx.auction.update({
        where: { id: auctionId },
        data: {
          status: "ENDED",
          winnerId: winningBid?.userId || null,
          finalPrice: winningBid?.amount || null,
        },
      });

      if (winningBid) {
        await tx.bid.update({
          where: { id: winningBid.id },
          data: { status: "WON" },
        });
      }
    });

    if (winningBid) {
      await this.rankService.awardWinExp(winningBid.userId);
      const refreshedUser = await prisma.user.findUnique({ where: { id: winningBid.userId } });
      if (refreshedUser) {
        this.eventEmitter.emit("auction.won", {
          userId: winningBid.userId,
          auctionId: auctionId,
          totalWins: refreshedUser.totalWins,
        });
      }
    }

    // Broadcast auction ended
    this.liveAuctionGateway.broadcastAuctionEnded(
      auctionId,
      winningBid?.userId || "",
      winningBid?.amount || 0,
    );

    await this.auditService.logAdminAction(
      adminId,
      "END_LIVE_AUCTION",
      auctionId,
      "AUCTION",
      {
        title: auction.title,
        winnerId: winningBid?.userId,
        finalPrice: winningBid?.amount,
      },
      ipAddress,
    );

    this.logger.log(`Live auction ended: ${auctionId}`);

    return {
      success: true,
      message: "Sesi live auction diakhiri.",
      winnerId: winningBid?.userId || null,
      finalPrice: winningBid?.amount || null,
    };
  }

  /**
   * Generate Agora token untuk join video streaming.
   *
   * @param auctionId - ID lelang (channel name)
   * @param uid - User ID (0 = auto-assign)
   * @param isHost - true kalau user adalah host/admin
   */
  getAgoraToken(auctionId: string, uid: number = 0, isHost: boolean = false) {
    if (!this.agoraAppId || !this.agoraCertificate) {
      return {
        appId: this.agoraAppId,
        token: "",
        channel: `ek-auction-${auctionId}`,
        uid,
        role: isHost ? "host" : "audience",
        expiresAt: "",
        error: "Agora credentials belum dikonfigurasi.",
      };
    }

    return generateAuctionToken(
      this.agoraAppId,
      this.agoraCertificate,
      auctionId,
      uid,
      isHost,
    );
  }

  /**
   * Daftar live auction yang sedang berlangsung.
   */
  async getActiveLiveAuctions() {
    return prisma.auction.findMany({
      where: {
        auctionType: "LIVE",
        status: { in: ["ACTIVE", "ENDING"] },
      },
      orderBy: { startTime: "desc" },
      select: {
        id: true,
        title: true,
        currentPrice: true,
        startTime: true,
        imageUrls: true,
        _count: { select: { bids: true } },
      },
    });
  }
}
