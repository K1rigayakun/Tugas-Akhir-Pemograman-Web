import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";
import { WS_EVENTS, ANTI_SNIPE } from "@emerald-kingdom/types";
import { prisma } from "@emerald-kingdom/db";

/**
 * LiveAuctionGateway — WebSocket gateway untuk live auction.
 *
 * Dua lapisan yang bekerja bersamaan:
 * 1. Real-time Bidding — Bid real-time via Socket.io
 * 2. Video Streaming — Host siaran via Agora.io (token di REST API)
 *
 * Room System:
 * - auction:{id}       → Semua penonton
 * - auction:{id}:vip   → Rank Marquis ke atas
 * - auction:{id}:admin → Host dan admin
 *
 * Redis Adapter: Memungkinkan WebSocket scale ke multiple instance.
 */
@WebSocketGateway({
  cors: {
    origin: [
      process.env.FRONTEND_URL || "http://localhost:3000",
      process.env.ADMIN_URL || "http://localhost:3002",
    ],
    credentials: true,
  },
  namespace: "/live-auction",
})
@Injectable()
export class LiveAuctionGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger("LiveAuctionGateway");

  // Track viewer count per auction
  private viewerCounts: Map<string, number> = new Map();

  constructor(private configService: ConfigService) {}

  async afterInit(server: Server) {
    // Setup Redis Adapter kalau REDIS_URL tersedia
    const redisUrl = this.configService.get<string>("REDIS_URL");

    if (redisUrl) {
      try {
        const pubClient = createClient({ url: redisUrl });
        const subClient = pubClient.duplicate();

        await Promise.all([pubClient.connect(), subClient.connect()]);
        server.adapter(createAdapter(pubClient, subClient) as any);

        this.logger.log("Redis Adapter connected — WebSocket ready for horizontal scaling");
      } catch (error) {
        this.logger.warn(
          `Redis Adapter gagal connect: ${error}. Fallback ke in-memory adapter.`,
        );
      }
    } else {
      this.logger.warn(
        "REDIS_URL tidak dikonfigurasi — WebSocket hanya bisa jalan di 1 instance.",
      );
    }

    this.logger.log("Live Auction WebSocket Gateway initialized");
  }

  handleConnection(client: Socket) {
    this.logger.debug(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(`Client disconnected: ${client.id}`);

    // Remove from all rooms and update viewer counts
    client.rooms.forEach((room) => {
      if (
        room.startsWith("auction:") &&
        !room.includes(":vip") &&
        !room.includes(":admin")
      ) {
        const auctionId = room.replace("auction:", "");
        const count = (this.viewerCounts.get(auctionId) || 1) - 1;
        this.viewerCounts.set(auctionId, Math.max(0, count));
        this.server
          .to(room)
          .emit(WS_EVENTS.VIEWER_COUNT, { auctionId, count });
      }
    });
  }

  /**
   * Client join room lelang.
   * Server cek rank user dan masukkan ke room yang sesuai.
   */
  @SubscribeMessage(WS_EVENTS.JOIN_AUCTION)
  handleJoinAuction(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      auctionId: string;
      userId: string;
      rank?: string;
      isAdmin?: boolean;
    },
  ) {
    const { auctionId, rank, isAdmin } = data;
    const baseRoom = `auction:${auctionId}`;

    // Semua user join room umum
    client.join(baseRoom);

    // VIP room untuk rank Marquis ke atas
    const vipRanks = ["MARQUIS", "DUKE", "SOVEREIGN", "EMPEROR"];
    if (rank && vipRanks.includes(rank)) {
      client.join(`${baseRoom}:vip`);
    }

    // Admin room
    if (isAdmin) {
      client.join(`${baseRoom}:admin`);
    }

    // Update viewer count
    const count = (this.viewerCounts.get(auctionId) || 0) + 1;
    this.viewerCounts.set(auctionId, count);
    this.server.to(baseRoom).emit(WS_EVENTS.VIEWER_COUNT, { auctionId, count });

    this.logger.log(
      `User joined auction:${auctionId} (rank: ${rank || "unknown"})`,
    );
    return { event: "joined", room: baseRoom };
  }

  /**
   * Client leave room lelang.
   */
  @SubscribeMessage(WS_EVENTS.LEAVE_AUCTION)
  handleLeaveAuction(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { auctionId: string },
  ) {
    const { auctionId } = data;
    const baseRoom = `auction:${auctionId}`;

    client.leave(baseRoom);
    client.leave(`${baseRoom}:vip`);
    client.leave(`${baseRoom}:admin`);

    const count = (this.viewerCounts.get(auctionId) || 1) - 1;
    this.viewerCounts.set(auctionId, Math.max(0, count));
    this.server.to(baseRoom).emit(WS_EVENTS.VIEWER_COUNT, { auctionId, count });

    return { event: "left", room: baseRoom };
  }

  /**
   * Client mengirim bid baru via WebSocket.
   *
   * Flow:
   * 1. Validasi: user ada, auction aktif, amount valid
   * 2. Cek saldo wallet cukup
   * 3. Simpan bid ke database
   * 4. Hold saldo di wallet
   * 5. Broadcast ke semua penonton
   * 6. Cek anti-snipe timer extension
   */
  @SubscribeMessage(WS_EVENTS.PLACE_BID)
  async handlePlaceBid(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      auctionId: string;
      userId: string;
      amount: number;
      username: string;
      rank: string;
    },
  ) {
    const { auctionId, userId, amount, username, rank } = data;

    try {
      // 1. Validasi auction
      const auction = await prisma.auction.findUnique({
        where: { id: auctionId },
      });

      if (!auction || !["ACTIVE", "ENDING"].includes(auction.status)) {
        return { success: false, error: "Lelang tidak aktif." };
      }

      // 2. Validasi amount
      const minBid = auction.currentPrice + auction.minimumIncrement;
      if (amount < minBid) {
        return {
          success: false,
          error: `Bid minimum ♛${minBid}. Anda bid ♛${amount}.`,
        };
      }

      // 3. Cek rank minimum (kalau ada)
      if (auction.minimumRank) {
        const rankOrder = [
          "CIVIS", "MERCHANT", "KNIGHT", "BARON", "VISCOUNT",
          "EARL", "MARQUIS", "DUKE", "SOVEREIGN", "EMPEROR",
        ];
        const userRankIdx = rankOrder.indexOf(rank);
        const minRankIdx = rankOrder.indexOf(auction.minimumRank);
        if (userRankIdx < minRankIdx) {
          return {
            success: false,
            error: `Rank minimum untuk lelang ini: ${auction.minimumRank}.`,
          };
        }
      }

      // 4. Cek saldo wallet
      const wallet = await prisma.walletAccount.findUnique({
        where: { userId },
      });

      if (!wallet) {
        return { success: false, error: "Wallet tidak ditemukan." };
      }

      const availableBalance = wallet.balance - wallet.pendingHold;
      if (availableBalance < amount) {
        return {
          success: false,
          error: `Saldo tidak cukup. Tersedia: ♛${availableBalance}.`,
        };
      }

      // 5. Atomic: buat bid + hold saldo + update harga auction
      const bid = await prisma.$transaction(async (tx) => {
        // Buat bid baru
        const newBid = await tx.bid.create({
          data: {
            auctionId,
            userId,
            amount,
            status: "ACTIVE",
          },
        });

        // Outbid semua bid sebelumnya di auction ini
        await tx.bid.updateMany({
          where: {
            auctionId,
            id: { not: newBid.id },
            status: "ACTIVE",
          },
          data: { status: "OUTBID" },
        });

        // Hold saldo
        await tx.walletTransaction.create({
          data: {
            walletId: wallet.id,
            type: "BID_HOLD",
            amount,
            description: `Hold bid untuk "${auction.title}"`,
            referenceId: auctionId,
            idempotencyKey: `bid-hold-${newBid.id}`,
          },
        });

        await tx.walletAccount.update({
          where: { id: wallet.id },
          data: { pendingHold: { increment: amount } },
        });

        // Update harga auction
        await tx.auction.update({
          where: { id: auctionId },
          data: { currentPrice: amount },
        });

        // Update user stats
        await tx.user.update({
          where: { id: userId },
          data: { totalBids: { increment: 1 } },
        });

        return newBid;
      });

      // 6. Broadcast bid baru ke semua penonton
      this.broadcastNewBid(auctionId, {
        userId,
        username,
        amount,
        rank,
        timestamp: bid.placedAt.toISOString(),
      });

      // 7. Anti-snipe: perpanjang timer kalau bid di detik terakhir
      const timeLeft =
        new Date(auction.endTime).getTime() - Date.now();
      if (timeLeft <= ANTI_SNIPE.THRESHOLD_SECONDS * 1000 && timeLeft > 0) {
        const newEndTime = new Date(
          Date.now() + ANTI_SNIPE.EXTENSION_SECONDS * 1000,
        );
        await prisma.auction.update({
          where: { id: auctionId },
          data: { endTime: newEndTime, status: "ENDING" },
        });
        this.broadcastTimerUpdate(auctionId, newEndTime.toISOString(), true);
      }

      return { success: true, bidId: bid.id, amount };
    } catch (error) {
      this.logger.error(`Bid error: ${error}`);
      return { success: false, error: "Gagal memasang bid. Coba lagi." };
    }
  }

  // ============================================================
  // Broadcast helpers
  // ============================================================

  broadcastNewBid(
    auctionId: string,
    bidData: {
      userId: string;
      username: string;
      amount: number;
      rank: string;
      timestamp: string;
    },
  ) {
    this.server.to(`auction:${auctionId}`).emit(WS_EVENTS.BID_NEW, {
      auctionId,
      ...bidData,
    });
  }

  broadcastTimerUpdate(
    auctionId: string,
    endTime: string,
    isExtended: boolean,
  ) {
    const event = isExtended
      ? WS_EVENTS.TIMER_EXTENDED
      : WS_EVENTS.TIMER_UPDATE;
    this.server.to(`auction:${auctionId}`).emit(event, {
      auctionId,
      endTime,
      isExtended,
    });
  }

  broadcastAuctionEnded(
    auctionId: string,
    winnerId: string,
    finalPrice: number,
  ) {
    this.server.to(`auction:${auctionId}`).emit(WS_EVENTS.AUCTION_ENDED, {
      auctionId,
      winnerId,
      finalPrice,
    });
  }

  broadcastPriceDecreased(auctionId: string, newPrice: number) {
    this.server.to(`auction:${auctionId}`).emit(WS_EVENTS.PRICE_DECREASED, {
      auctionId,
      newPrice,
    });
  }
}
