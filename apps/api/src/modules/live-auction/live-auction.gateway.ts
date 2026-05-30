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
import { WS_EVENTS } from "@emerald-kingdom/types";

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

  afterInit() {
    this.logger.log("Live Auction WebSocket Gateway initialized");
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);

    // Remove from all rooms and update viewer counts
    client.rooms.forEach((room) => {
      if (room.startsWith("auction:") && !room.includes(":vip") && !room.includes(":admin")) {
        const auctionId = room.replace("auction:", "");
        const count = (this.viewerCounts.get(auctionId) || 1) - 1;
        this.viewerCounts.set(auctionId, Math.max(0, count));
        this.server.to(room).emit(WS_EVENTS.VIEWER_COUNT, { auctionId, count });
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
    @MessageBody() data: { auctionId: string; userId: string; rank?: string; isAdmin?: boolean },
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

    this.logger.log(`User joined auction:${auctionId} (rank: ${rank || "unknown"})`);
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

    // Update viewer count
    const count = (this.viewerCounts.get(auctionId) || 1) - 1;
    this.viewerCounts.set(auctionId, Math.max(0, count));
    this.server.to(baseRoom).emit(WS_EVENTS.VIEWER_COUNT, { auctionId, count });

    return { event: "left", room: baseRoom };
  }

  /**
   * Broadcast bid baru ke semua penonton.
   * Dipanggil oleh LiveAuctionService setelah bid divalidasi.
   */
  broadcastNewBid(auctionId: string, bidData: {
    userId: string;
    username: string;
    amount: number;
    rank: string;
    timestamp: string;
  }) {
    this.server.to(`auction:${auctionId}`).emit(WS_EVENTS.BID_NEW, {
      auctionId,
      ...bidData,
    });
  }

  /** Broadcast timer update */
  broadcastTimerUpdate(auctionId: string, endTime: string, isExtended: boolean) {
    const event = isExtended ? WS_EVENTS.TIMER_EXTENDED : WS_EVENTS.TIMER_UPDATE;
    this.server.to(`auction:${auctionId}`).emit(event, {
      auctionId,
      endTime,
      isExtended,
    });
  }

  /** Broadcast auction ended */
  broadcastAuctionEnded(auctionId: string, winnerId: string, finalPrice: number) {
    this.server.to(`auction:${auctionId}`).emit(WS_EVENTS.AUCTION_ENDED, {
      auctionId,
      winnerId,
      finalPrice,
    });
  }

  /** Broadcast price decrease (descending auction) */
  broadcastPriceDecreased(auctionId: string, newPrice: number) {
    this.server.to(`auction:${auctionId}`).emit(WS_EVENTS.PRICE_DECREASED, {
      auctionId,
      newPrice,
    });
  }
}
