import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

/**
 * PaymentGateway — Real-time payment status updates via Socket.IO
 * Task 14.1: Socket.IO event listeners for payment status changes
 * Validates Requirement 7.2: Real-time status updates within 5 seconds
 */
@WebSocketGateway({
  cors: { origin: '*' },
  namespace: 'payments',
})
export class PaymentGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(PaymentGateway.name);

  /**
   * Handle client connection
   * Clients should join their user-specific room for filtered updates
   */
  handleConnection(client: Socket) {
    this.logger.log(`Payment client connected: ${client.id}`);
  }

  /**
   * Handle client disconnection
   */
  handleDisconnect(client: Socket) {
    this.logger.log(`Payment client disconnected: ${client.id}`);
  }

  /**
   * Subscribe client to their userId room for filtered updates
   * Requirement 7.2: Subscribe to payment.status.changed events filtered by userId
   */
  @SubscribeMessage('subscribe:user')
  handleSubscribeUser(client: Socket, userId: string) {
    const roomName = `user_${userId}`;
    client.join(roomName);
    this.logger.log(`Client ${client.id} subscribed to ${roomName}`);
    return { success: true, room: roomName };
  }

  /**
   * Unsubscribe client from userId room
   */
  @SubscribeMessage('unsubscribe:user')
  handleUnsubscribeUser(client: Socket, userId: string) {
    const roomName = `user_${userId}`;
    client.leave(roomName);
    this.logger.log(`Client ${client.id} unsubscribed from ${roomName}`);
    return { success: true };
  }

  /**
   * Listen to payment.status.changed events from PaymentService
   * Emit to user-specific room for filtered updates
   * Validates Requirement 7.2: Update UI within 5 seconds of status change
   */
  @OnEvent('payment.status.changed')
  handlePaymentStatusChanged(payload: {
    topUpRequestId: string;
    userId: string;
    status: string;
    amount?: number;
    fiatAmount?: number;
    method?: string;
    provider?: string;
    paidAt?: Date;
  }) {
    this.logger.log(
      `Payment status changed: TopUpRequest=${payload.topUpRequestId}, User=${payload.userId}, Status=${payload.status}`
    );

    const roomName = `user_${payload.userId}`;

    // Emit to user-specific room
    this.server.to(roomName).emit('payment:status:changed', {
      topUpRequestId: payload.topUpRequestId,
      status: payload.status,
      amount: payload.amount,
      fiatAmount: payload.fiatAmount,
      method: payload.method,
      provider: payload.provider,
      paidAt: payload.paidAt,
      timestamp: new Date().toISOString(),
    });

    this.logger.log(`Emitted payment:status:changed to room ${roomName}`);
  }

  /**
   * Broadcast a payment status update to a specific user
   * Used for direct notifications outside event listeners
   */
  notifyUser(userId: string, payload: any) {
    const roomName = `user_${userId}`;
    this.server.to(roomName).emit('payment:status:changed', payload);
    this.logger.log(`Direct notification sent to user ${userId}`);
  }
}
