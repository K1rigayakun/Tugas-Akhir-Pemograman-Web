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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BidGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const event_emitter_1 = require("@nestjs/event-emitter");
let BidGateway = class BidGateway {
    constructor() {
        // Track viewer count per auction room
        this.roomViewers = new Map();
    }
    handleConnection(client) {
        console.log(`Client terhubung ke WS: ${client.id}`);
    }
    handleDisconnect(client) {
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
    handleJoinAuction(data, client) {
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
    handleLeaveAuction(data, client) {
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
    broadcastNewBid(auctionId, bidData) {
        this.server.to(`auction:${auctionId}`).emit('bid:new', bidData);
    }
    /**
     * Mengirim pemberitahuan perpanjangan waktu lelang (Anti-Snipe)
     */
    broadcastTimerExtended(auctionId, data) {
        this.server.to(`auction:${auctionId}`).emit('timer:extended', data);
    }
    /**
     * Mengirim pemberitahuan harga turun (Reverse Auction)
     */
    broadcastPriceDescended(auctionId, data) {
        this.server.to(`auction:${auctionId}`).emit('price:descended', data);
    }
    /**
     * Mengirim pemberitahuan lelang selesai
     */
    broadcastAuctionEnded(auctionId, data) {
        this.server.to(`auction:${auctionId}`).emit('auction:ended', data);
    }
    handlePriceDescendedEvent(payload) {
        this.broadcastPriceDescended(payload.auctionId, {
            newPrice: payload.newPrice,
            message: `Harga turun menjadi ${payload.newPrice} CC!`
        });
    }
    handleAuctionEndedEvent(payload) {
        this.broadcastAuctionEnded(payload.auctionId, {
            winnerId: payload.winnerId,
            winnerName: payload.winnerName,
            finalPrice: payload.finalPrice
        });
    }
    /**
     * Broadcast jumlah penonton aktif di lelang ini
     */
    broadcastViewerCount(auctionId) {
        const count = this.roomViewers.get(auctionId)?.size || 0;
        this.server.to(`auction:${auctionId}`).emit('viewer:count', { count });
    }
};
exports.BidGateway = BidGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], BidGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('join-auction'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], BidGateway.prototype, "handleJoinAuction", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leave-auction'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], BidGateway.prototype, "handleLeaveAuction", null);
__decorate([
    (0, event_emitter_1.OnEvent)('auction.price.descended'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BidGateway.prototype, "handlePriceDescendedEvent", null);
__decorate([
    (0, event_emitter_1.OnEvent)('auction.ended'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BidGateway.prototype, "handleAuctionEndedEvent", null);
exports.BidGateway = BidGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: { origin: '*' },
        namespace: 'auction'
    })
], BidGateway);
//# sourceMappingURL=bid.gateway.js.map