import { 
  WebSocketGateway, 
  WebSocketServer, 
  SubscribeMessage, 
  MessageBody, 
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ 
  cors: { origin: '*' },
  namespace: 'auction'
})
export class BidGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  // Track viewer count per auction room
  private roomViewers: Map<string, Set<string>> = new Map();

  handleConnection(client: Socket) {
    console.log(`Client terhubung ke WS: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client terputus dari WS: ${client.id}`);
    // Bersihkan client dari semua room viewers
    for (const [roomId, viewers] of this.roomViewers.entries()) {
      if (viewers.delete(client.id)) {
        this.broadcastViewerCount(roomId);
      }
    }
  }

  /**
   * User bergabung ke room lelang spesifik untuk menerima update real-time
   */
  @SubscribeMessage('join-auction')
  handleJoinAuction(
    @MessageBody() data: { auctionId: string }, 
    @ConnectedSocket() client: Socket
  ) {
    const roomId = `auction:${data.auctionId}`;
    client.join(roomId);

    // Update viewer count
    if (!this.roomViewers.has(data.auctionId)) {
      this.roomViewers.set(data.auctionId, new Set());
    }
    this.roomViewers.get(data.auctionId)?.add(client.id);
    this.broadcastViewerCount(data.auctionId);

    return { status: 'success', message: `Berhasil bergabung ke ruangan lelang ${data.auctionId}` };
  }

  /**
   * User meninggalkan room lelang
   */
  @SubscribeMessage('leave-auction')
  handleLeaveAuction(
    @MessageBody() data: { auctionId: string }, 
    @ConnectedSocket() client: Socket
  ) {
    const roomId = `auction:${data.auctionId}`;
    client.leave(roomId);

    // Update viewer count
    if (this.roomViewers.has(data.auctionId)) {
      this.roomViewers.get(data.auctionId)?.delete(client.id);
      this.broadcastViewerCount(data.auctionId);
    }

    return { status: 'success', message: `Meninggalkan ruangan lelang ${data.auctionId}` };
  }

  /**
   * Mengirimkan bid baru ke semua client di dalam room lelang
   */
  broadcastNewBid(auctionId: string, bidData: { userId: string; amount: number; username: string; rank: string; timestamp: Date }) {
    this.server.to(`auction:${auctionId}`).emit('bid:new', bidData);
  }

  /**
   * Mengirim pemberitahuan perpanjangan waktu lelang (Anti-Snipe)
   */
  broadcastTimerExtended(auctionId: string, data: { newEndTime: Date; message: string }) {
    this.server.to(`auction:${auctionId}`).emit('timer:extended', data);
  }

  /**
   * Broadcast jumlah penonton aktif di lelang ini
   */
  private broadcastViewerCount(auctionId: string) {
    const count = this.roomViewers.get(auctionId)?.size || 0;
    this.server.to(`auction:${auctionId}`).emit('viewer:count', { count });
  }
}
