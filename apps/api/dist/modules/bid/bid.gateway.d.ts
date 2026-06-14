import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
export declare class BidGateway implements OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    private roomViewers;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    /**
     * User bergabung ke room lelang spesifik untuk menerima update real-time
     */
    handleJoinAuction(data: {
        auctionId: string;
    }, client: Socket): {
        status: string;
        message: string;
    };
    /**
     * User meninggalkan room lelang
     */
    handleLeaveAuction(data: {
        auctionId: string;
    }, client: Socket): {
        status: string;
        message: string;
    };
    /**
     * Mengirimkan bid baru ke semua client di dalam room lelang
     */
    broadcastNewBid(auctionId: string, bidData: {
        userId: string;
        amount: number;
        username: string;
        rank: string;
        timestamp: Date;
        activeNameEffect?: string | null;
        activeCoatFrame?: string | null;
        avatarUrl?: string | null;
    }): void;
    /**
     * Mengirim pemberitahuan perpanjangan waktu lelang (Anti-Snipe)
     */
    broadcastTimerExtended(auctionId: string, data: {
        newEndTime: Date;
        message: string;
    }): void;
    /**
     * Mengirim pemberitahuan harga turun (Reverse Auction)
     */
    broadcastPriceDescended(auctionId: string, data: {
        newPrice: number;
        message: string;
    }): void;
    /**
     * Mengirim pemberitahuan lelang selesai
     */
    broadcastAuctionEnded(auctionId: string, data: {
        winnerId?: string;
        winnerName?: string;
        finalPrice: number;
    }): void;
    handlePriceDescendedEvent(payload: {
        auctionId: string;
        newPrice: number;
    }): void;
    handleAuctionEndedEvent(payload: {
        auctionId: string;
        winnerId?: string;
        winnerName?: string;
        finalPrice: number;
    }): void;
    /**
     * Broadcast jumlah penonton aktif di lelang ini
     */
    private broadcastViewerCount;
}
//# sourceMappingURL=bid.gateway.d.ts.map