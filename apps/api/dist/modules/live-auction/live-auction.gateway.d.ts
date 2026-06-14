import { OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../../prisma/prisma.service";
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
export declare class LiveAuctionGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private configService;
    private prisma;
    server: Server;
    private readonly logger;
    private viewerCounts;
    constructor(configService: ConfigService, prisma: PrismaService);
    afterInit(server: Server): Promise<void>;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    /**
     * Client join room lelang.
     * Server cek rank user dan masukkan ke room yang sesuai.
     */
    handleJoinAuction(client: Socket, data: {
        auctionId: string;
        userId: string;
        rank?: string;
        isAdmin?: boolean;
    }): {
        event: string;
        room: string;
    };
    /**
     * Client leave room lelang.
     */
    handleLeaveAuction(client: Socket, data: {
        auctionId: string;
    }): {
        event: string;
        room: string;
    };
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
    handlePlaceBid(client: Socket, data: {
        auctionId: string;
        userId: string;
        amount: number;
        username: string;
        rank: string;
    }): Promise<{
        success: boolean;
        error: string;
        bidId?: undefined;
        amount?: undefined;
    } | {
        success: boolean;
        bidId: string;
        amount: number;
        error?: undefined;
    }>;
    handlePriceDescendedEvent(payload: {
        auctionId: string;
        newPrice: number;
    }): void;
    broadcastNewBid(auctionId: string, bidData: {
        userId: string;
        username: string;
        amount: number;
        rank: string;
        timestamp: string;
        activeNameEffect?: string | null;
        activeCoatFrame?: string | null;
        avatarUrl?: string | null;
    }): void;
    broadcastTimerUpdate(auctionId: string, endTime: string, isExtended: boolean): void;
    broadcastAuctionEnded(auctionId: string, winnerId: string, finalPrice: number): void;
    broadcastPriceDecreased(auctionId: string, newPrice: number): void;
}
//# sourceMappingURL=live-auction.gateway.d.ts.map