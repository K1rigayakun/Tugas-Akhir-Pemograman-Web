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
exports.LiveAuctionGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const redis_adapter_1 = require("@socket.io/redis-adapter");
const redis_1 = require("redis");
const types_1 = require("@emerald-kingdom/types");
const prisma_service_1 = require("../../prisma/prisma.service");
const event_emitter_1 = require("@nestjs/event-emitter");
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
let LiveAuctionGateway = class LiveAuctionGateway {
    constructor(configService, prisma) {
        this.configService = configService;
        this.prisma = prisma;
        this.logger = new common_1.Logger("LiveAuctionGateway");
        // Track viewer count per auction
        this.viewerCounts = new Map();
    }
    async afterInit(server) {
        // Setup Redis Adapter kalau REDIS_URL tersedia
        const redisUrl = this.configService.get("REDIS_URL");
        if (redisUrl) {
            try {
                const pubClient = (0, redis_1.createClient)({ url: redisUrl });
                const subClient = pubClient.duplicate();
                await Promise.all([pubClient.connect(), subClient.connect()]);
                server.adapter((0, redis_adapter_1.createAdapter)(pubClient, subClient));
                this.logger.log("Redis Adapter connected — WebSocket ready for horizontal scaling");
            }
            catch (error) {
                this.logger.warn(`Redis Adapter gagal connect: ${error}. Fallback ke in-memory adapter.`);
            }
        }
        else {
            this.logger.warn("REDIS_URL tidak dikonfigurasi — WebSocket hanya bisa jalan di 1 instance.");
        }
        this.logger.log("Live Auction WebSocket Gateway initialized");
    }
    handleConnection(client) {
        this.logger.debug(`Client connected: ${client.id}`);
    }
    handleDisconnect(client) {
        this.logger.debug(`Client disconnected: ${client.id}`);
        // Remove from all rooms and update viewer counts
        client.rooms.forEach((room) => {
            if (room.startsWith("auction:") &&
                !room.includes(":vip") &&
                !room.includes(":admin")) {
                const auctionId = room.replace("auction:", "");
                const count = (this.viewerCounts.get(auctionId) || 1) - 1;
                this.viewerCounts.set(auctionId, Math.max(0, count));
                this.server
                    .to(room)
                    .emit(types_1.WS_EVENTS.VIEWER_COUNT, { auctionId, count });
            }
        });
    }
    /**
     * Client join room lelang.
     * Server cek rank user dan masukkan ke room yang sesuai.
     */
    handleJoinAuction(client, data) {
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
        this.server.to(baseRoom).emit(types_1.WS_EVENTS.VIEWER_COUNT, { auctionId, count });
        this.logger.log(`User joined auction:${auctionId} (rank: ${rank || "unknown"})`);
        return { event: "joined", room: baseRoom };
    }
    /**
     * Client leave room lelang.
     */
    handleLeaveAuction(client, data) {
        const { auctionId } = data;
        const baseRoom = `auction:${auctionId}`;
        client.leave(baseRoom);
        client.leave(`${baseRoom}:vip`);
        client.leave(`${baseRoom}:admin`);
        const count = (this.viewerCounts.get(auctionId) || 1) - 1;
        this.viewerCounts.set(auctionId, Math.max(0, count));
        this.server.to(baseRoom).emit(types_1.WS_EVENTS.VIEWER_COUNT, { auctionId, count });
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
    async handlePlaceBid(client, data) {
        const { auctionId, userId, amount, username, rank } = data;
        try {
            // 1. Validasi auction
            const auction = await this.prisma.auction.findUnique({
                where: { id: auctionId },
            });
            if (!auction || !["ACTIVE", "ENDING"].includes(auction.status)) {
                return { success: false, error: "Lelang tidak aktif." };
            }
            // 2. Validasi amount
            if (auction.auctionType === "DESCENDING") {
                if (amount < auction.currentPrice) {
                    return {
                        success: false,
                        error: `Bid minimum ♛${auction.currentPrice}. Anda bid ♛${amount}.`,
                    };
                }
            }
            else {
                const minBid = auction.currentPrice + auction.minimumIncrement;
                if (amount < minBid) {
                    return {
                        success: false,
                        error: `Bid minimum ♛${minBid}. Anda bid ♛${amount}.`,
                    };
                }
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
            const wallet = await this.prisma.walletAccount.findUnique({
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
            const bid = await this.prisma.$transaction(async (tx) => {
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
                // Status update for descending
                const isDescending = auction.auctionType === "DESCENDING";
                let status = auction.status;
                let finalEndTime = auction.endTime;
                if (isDescending) {
                    status = "ENDED";
                }
                else {
                    // Anti-snipe logic
                    const msLeft = auction.endTime.getTime() - Date.now();
                    if (msLeft > 0 && msLeft <= types_1.ANTI_SNIPE.THRESHOLD_SECONDS * 1000) {
                        finalEndTime = new Date(auction.endTime.getTime() + types_1.ANTI_SNIPE.EXTENSION_SECONDS * 1000);
                        status = "ENDING";
                    }
                }
                await tx.auction.update({
                    where: { id: auctionId },
                    data: {
                        currentPrice: amount,
                        status,
                        endTime: finalEndTime,
                        ...(isDescending ? { winnerId: userId, finalPrice: amount } : {})
                    },
                });
                return { newBid, newEndTime: finalEndTime, isDescending };
            });
            // Get user cosmetics
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                select: { username: true, rank: true, activeNameEffect: true, activeCoatFrame: true, avatarUrl: true }
            });
            // 6. Broadcast event via Redis (akan diteruskan ke semua instance)
            const bidPayload = {
                auctionId,
                userId,
                username: user?.username || 'Unknown',
                amount,
                rank: user?.rank || 'CIVIS',
                timestamp: bid.newBid.placedAt.toISOString(),
                activeNameEffect: user?.activeNameEffect,
                activeCoatFrame: user?.activeCoatFrame,
                avatarUrl: user?.avatarUrl,
            };
            this.server.to(`auction:${auctionId}`).emit(types_1.WS_EVENTS.BID_NEW, bidPayload);
            if (bid.isDescending) {
                this.server.to(`auction:${auctionId}`).emit(types_1.WS_EVENTS.AUCTION_ENDED, {
                    auctionId,
                    winnerId: userId,
                    winnerName: user?.username || 'Unknown',
                    finalPrice: amount
                });
                // Finalize wallet translation for the descending winner
                await this.prisma.$transaction(async (tx) => {
                    await tx.walletAccount.update({
                        where: { userId },
                        data: {
                            pendingHold: { decrement: amount },
                            balance: { decrement: amount },
                            totalSpent: { increment: amount }
                        }
                    });
                    await tx.walletTransaction.create({
                        data: {
                            walletId: wallet.id,
                            type: "BID_DEDUCT",
                            amount: -amount,
                            description: `Menang lelang Descending "${auction.title}"`,
                            referenceId: auctionId,
                            idempotencyKey: `win-${auctionId}-${Date.now()}`
                        }
                    });
                });
            }
            else if (bid.newEndTime.getTime() !== auction.endTime.getTime()) {
                this.server.to(`auction:${auctionId}`).emit(types_1.WS_EVENTS.TIMER_EXTENDED, {
                    auctionId,
                    endTime: bid.newEndTime.toISOString(),
                    message: types_1.ANTI_SNIPE.MESSAGE,
                });
            }
            return { success: true, bidId: bid.newBid.id, amount };
        }
        catch (error) {
            this.logger.error(`Bid error: ${error}`);
            return { success: false, error: "Gagal memasang bid. Coba lagi." };
        }
    }
    handlePriceDescendedEvent(payload) {
        this.server.to(`auction:${payload.auctionId}`).emit(types_1.WS_EVENTS.PRICE_DECREASED, {
            auctionId: payload.auctionId,
            newPrice: payload.newPrice,
            message: `Harga The Descending Decree turun menjadi ♛${payload.newPrice.toLocaleString('id-ID')} CC!`
        });
    }
    // ============================================================
    // Broadcast helpers
    // ============================================================
    broadcastNewBid(auctionId, bidData) {
        this.server.to(`auction:${auctionId}`).emit(types_1.WS_EVENTS.BID_NEW, {
            auctionId,
            ...bidData,
        });
    }
    broadcastTimerUpdate(auctionId, endTime, isExtended) {
        const event = isExtended
            ? types_1.WS_EVENTS.TIMER_EXTENDED
            : types_1.WS_EVENTS.TIMER_UPDATE;
        this.server.to(`auction:${auctionId}`).emit(event, {
            auctionId,
            endTime,
            isExtended,
        });
    }
    broadcastAuctionEnded(auctionId, winnerId, finalPrice) {
        this.server.to(`auction:${auctionId}`).emit(types_1.WS_EVENTS.AUCTION_ENDED, {
            auctionId,
            winnerId,
            finalPrice,
        });
    }
    broadcastPriceDecreased(auctionId, newPrice) {
        this.server.to(`auction:${auctionId}`).emit(types_1.WS_EVENTS.PRICE_DECREASED, {
            auctionId,
            newPrice,
        });
    }
};
exports.LiveAuctionGateway = LiveAuctionGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], LiveAuctionGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)(types_1.WS_EVENTS.JOIN_AUCTION),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], LiveAuctionGateway.prototype, "handleJoinAuction", null);
__decorate([
    (0, websockets_1.SubscribeMessage)(types_1.WS_EVENTS.LEAVE_AUCTION),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], LiveAuctionGateway.prototype, "handleLeaveAuction", null);
__decorate([
    (0, websockets_1.SubscribeMessage)(types_1.WS_EVENTS.PLACE_BID),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], LiveAuctionGateway.prototype, "handlePlaceBid", null);
__decorate([
    (0, event_emitter_1.OnEvent)('auction.price.descended'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], LiveAuctionGateway.prototype, "handlePriceDescendedEvent", null);
exports.LiveAuctionGateway = LiveAuctionGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: [
                process.env.FRONTEND_URL || "http://localhost:3000",
                process.env.ADMIN_URL || "http://localhost:3002",
            ],
            credentials: true,
        },
        namespace: "/live-auction",
    }),
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        prisma_service_1.PrismaService])
], LiveAuctionGateway);
//# sourceMappingURL=live-auction.gateway.js.map