import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { prisma } from "@emerald-kingdom/db";
import { AuditService } from "../audit/audit.service";
import { LiveAuctionGateway } from "./live-auction.gateway";
import { createHmac } from "crypto";

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

  constructor(
    private configService: ConfigService,
    private auditService: AuditService,
    private liveAuctionGateway: LiveAuctionGateway,
  ) {}

  /**
   * Mulai sesi live auction.
   * Hanya admin yang bisa memulai.
   */
  async startLiveSession(adminId: string, auctionId: string, ipAddress?: string) {
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
      adminId, "START_LIVE_AUCTION", auctionId, "AUCTION",
      { title: auction.title },
      ipAddress,
    );

    this.logger.log(`Live auction started: ${auctionId}`);

    return {
      success: true,
      message: "Sesi live auction dimulai.",
      auctionId,
    };
  }

  /**
   * Akhiri sesi live auction.
   */
  async endLiveSession(adminId: string, auctionId: string, ipAddress?: string) {
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

    // Update auction status
    await prisma.auction.update({
      where: { id: auctionId },
      data: {
        status: "ENDED",
        winnerId: winningBid?.userId || null,
        finalPrice: winningBid?.amount || null,
      },
    });

    // Mark winning bid
    if (winningBid) {
      await prisma.bid.update({
        where: { id: winningBid.id },
        data: { status: "WON" },
      });
    }

    // Broadcast auction ended
    this.liveAuctionGateway.broadcastAuctionEnded(
      auctionId,
      winningBid?.userId || "",
      winningBid?.amount || 0,
    );

    await this.auditService.logAdminAction(
      adminId, "END_LIVE_AUCTION", auctionId, "AUCTION",
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
   * Agora menggunakan token untuk autentikasi user yang join channel.
   * Token berlaku selama 1 jam.
   *
   * Catatan: Ini adalah implementasi sederhana menggunakan HMAC.
   * Untuk production, gunakan Agora Token Builder SDK.
   */
  generateAgoraToken(channelName: string, uid: number): {
    appId: string;
    token: string;
    channel: string;
    uid: number;
  } {
    const appId = this.configService.get<string>("AGORA_APP_ID") || "";
    const certificate = this.configService.get<string>("AGORA_APP_CERTIFICATE") || "";

    if (!appId || !certificate) {
      this.logger.warn("Agora credentials belum dikonfigurasi. Gunakan .env.example sebagai referensi.");
    }

    // Simplified token — di production gunakan agora-access-token package
    const timestamp = Math.floor(Date.now() / 1000) + 3600; // 1 jam
    const payload = `${appId}${channelName}${uid}${timestamp}`;
    const token = createHmac("sha256", certificate || "placeholder")
      .update(payload)
      .digest("hex");

    return {
      appId,
      token,
      channel: channelName,
      uid,
    };
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
