import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
/**
 * PaymentGateway — Real-time payment status updates via Socket.IO
 * Task 14.1: Socket.IO event listeners for payment status changes
 * Validates Requirement 7.2: Real-time status updates within 5 seconds
 */
export declare class PaymentGateway implements OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    private readonly logger;
    /**
     * Handle client connection
     * Clients should join their user-specific room for filtered updates
     */
    handleConnection(client: Socket): void;
    /**
     * Handle client disconnection
     */
    handleDisconnect(client: Socket): void;
    /**
     * Subscribe client to their userId room for filtered updates
     * Requirement 7.2: Subscribe to payment.status.changed events filtered by userId
     */
    handleSubscribeUser(client: Socket, userId: string): {
        success: boolean;
        room: string;
    };
    /**
     * Unsubscribe client from userId room
     */
    handleUnsubscribeUser(client: Socket, userId: string): {
        success: boolean;
    };
    /**
     * Listen to payment.status.changed events from PaymentService
     * Emit to user-specific room for filtered updates
     * Validates Requirement 7.2: Update UI within 5 seconds of status change
     */
    handlePaymentStatusChanged(payload: {
        topUpRequestId: string;
        userId: string;
        status: string;
        amount?: number;
        fiatAmount?: number;
        method?: string;
        provider?: string;
        paidAt?: Date;
    }): void;
    /**
     * Broadcast a payment status update to a specific user
     * Used for direct notifications outside event listeners
     */
    notifyUser(userId: string, payload: any): void;
}
//# sourceMappingURL=payment.gateway.d.ts.map