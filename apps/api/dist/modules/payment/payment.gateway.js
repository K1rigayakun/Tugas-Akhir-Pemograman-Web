"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PaymentGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
/**
 * PaymentGateway — Real-time payment status updates via Socket.IO
 * Task 14.1: Socket.IO event listeners for payment status changes
 * Validates Requirement 7.2: Real-time status updates within 5 seconds
 */
let PaymentGateway = PaymentGateway_1 = class PaymentGateway {
    constructor() {
        this.logger = new common_1.Logger(PaymentGateway_1.name);
    }
    /**
     * Handle client connection
     * Clients should join their user-specific room for filtered updates
     */
    handleConnection(client) {
        this.logger.log(`Payment client connected: ${client.id}`);
    }
    /**
     * Handle client disconnection
     */
    handleDisconnect(client) {
        this.logger.log(`Payment client disconnected: ${client.id}`);
    }
    /**
     * Subscribe client to their userId room for filtered updates
     * Requirement 7.2: Subscribe to payment.status.changed events filtered by userId
     */
    handleSubscribeUser(client, userId) {
        const roomName = `user_${userId}`;
        client.join(roomName);
        this.logger.log(`Client ${client.id} subscribed to ${roomName}`);
        return { success: true, room: roomName };
    }
    /**
     * Unsubscribe client from userId room
     */
    handleUnsubscribeUser(client, userId) {
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
    handlePaymentStatusChanged(payload) {
        this.logger.log(`Payment status changed: TopUpRequest=${payload.topUpRequestId}, User=${payload.userId}, Status=${payload.status}`);
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
    notifyUser(userId, payload) {
        const roomName = `user_${userId}`;
        this.server.to(roomName).emit('payment:status:changed', payload);
        this.logger.log(`Direct notification sent to user ${userId}`);
    }
};
exports.PaymentGateway = PaymentGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], PaymentGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('subscribe:user'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", void 0)
], PaymentGateway.prototype, "handleSubscribeUser", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('unsubscribe:user'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", void 0)
], PaymentGateway.prototype, "handleUnsubscribeUser", null);
__decorate([
    (0, event_emitter_1.OnEvent)('payment.status.changed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PaymentGateway.prototype, "handlePaymentStatusChanged", null);
exports.PaymentGateway = PaymentGateway = PaymentGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: { origin: '*' },
        namespace: 'payments',
    })
], PaymentGateway);
//# sourceMappingURL=payment.gateway.js.map