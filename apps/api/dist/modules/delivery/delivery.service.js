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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeliveryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const notification_service_1 = require("../notification/notification.service");
const client_1 = require("@prisma/client");
let DeliveryService = class DeliveryService {
    constructor(prisma, notificationService) {
        this.prisma = prisma;
        this.notificationService = notificationService;
    }
    // --- ADDRESS MANAGEMENT ---
    async getUserAddress(userId) {
        return this.prisma.userAddress.findUnique({
            where: { userId },
        });
    }
    async upsertUserAddress(userId, data) {
        return this.prisma.userAddress.upsert({
            where: { userId },
            update: data,
            create: { ...data, userId },
        });
    }
    // --- DELIVERY TRACKING ---
    async getDeliveriesByUser(userId) {
        return this.prisma.delivery.findMany({
            where: { userId },
            include: {
                auction: {
                    select: { title: true, imageUrls: true, rarity: true, finalPrice: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    async getAllDeliveries() {
        return this.prisma.delivery.findMany({
            include: {
                auction: { select: { title: true } },
                user: { select: { username: true, email: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    async updateDeliveryStatus(id, adminId, status, trackingResi, courier) {
        const delivery = await this.prisma.delivery.findUnique({ where: { id } });
        if (!delivery)
            throw new common_1.NotFoundException("Delivery not found");
        const updateData = { status };
        if (trackingResi !== undefined)
            updateData.trackingResi = trackingResi;
        if (courier !== undefined)
            updateData.courier = courier;
        if (status === 'SHIPPED' && delivery.status !== 'SHIPPED') {
            updateData.shippedAt = new Date();
        }
        else if (status === 'DELIVERED' && delivery.status !== 'DELIVERED') {
            updateData.deliveredAt = new Date();
        }
        const updated = await this.prisma.delivery.update({
            where: { id },
            data: updateData
        });
        if (status === 'SHIPPED') {
            await this.notificationService.send(delivery.userId, client_1.NotifType.YOU_WON, { deliveryId: updated.id, message: `Barang lelang Anda telah dikirim! Resi: ${trackingResi || '-'}` });
        }
        return updated;
    }
    // Called automatically when an auction ends and someone wins
    async createDeliveryForWinner(auctionId, userId) {
        const address = await this.prisma.userAddress.findUnique({ where: { userId } });
        if (!address) {
            return null;
        }
        const existing = await this.prisma.delivery.findUnique({ where: { auctionId } });
        if (existing)
            return existing;
        const delivery = await this.prisma.delivery.create({
            data: {
                auctionId,
                userId,
                recipient: address.recipient,
                phoneNumber: address.phoneNumber,
                address: address.address,
                city: address.city,
                province: address.province,
                postalCode: address.postalCode,
                status: 'PENDING'
            }
        });
        return delivery;
    }
};
exports.DeliveryService = DeliveryService;
exports.DeliveryService = DeliveryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notification_service_1.NotificationService])
], DeliveryService);
//# sourceMappingURL=delivery.service.js.map