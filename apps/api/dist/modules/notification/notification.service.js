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
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const notification_gateway_1 = require("./notification.gateway");
let NotificationService = class NotificationService {
    constructor(prisma, gateway) {
        this.prisma = prisma;
        this.gateway = gateway;
    }
    async send(userId, type, payload) {
        const notif = await this.prisma.notification.create({ data: { userId, type, payload } });
        this.gateway.notifyUser(userId, type, payload);
        return notif;
    }
    async sendGlobal(type, payload) {
        const users = await this.prisma.user.findMany({
            where: { deletedAt: null, isSuspended: false },
            select: { id: true },
        });
        // Broadcast real-time
        this.gateway.broadcastGlobalAnnouncement("Global Announcement", { type, payload });
        return this.prisma.notification.createMany({
            data: users.map(({ id }) => ({ userId: id, type, payload })),
        });
    }
    async list(userId, page = 1, limit = 20, unreadOnly = false) {
        const take = Math.min(Math.max(limit, 1), 100);
        const where = { userId, ...(unreadOnly ? { isRead: false } : {}) };
        const [data, total] = await Promise.all([
            this.prisma.notification.findMany({
                where,
                skip: (Math.max(page, 1) - 1) * take,
                take,
                orderBy: { createdAt: "desc" },
            }),
            this.prisma.notification.count({ where }),
        ]);
        return { data, meta: { page, limit: take, total, totalPages: Math.ceil(total / take) } };
    }
    async markRead(userId, id) {
        const result = await this.prisma.notification.updateMany({
            where: { id, userId },
            data: { isRead: true },
        });
        if (!result.count)
            throw new common_1.NotFoundException("Notifikasi tidak ditemukan.");
        return { success: true };
    }
    async markAllRead(userId) {
        const result = await this.prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
        });
        return { success: true, updated: result.count };
    }
    async unreadCount(userId) {
        return { count: await this.prisma.notification.count({ where: { userId, isRead: false } }) };
    }
    async getPreferences(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { notificationPrefs: true },
        });
        return user?.notificationPrefs || {};
    }
    async updatePreferences(userId, preferences) {
        const user = await this.prisma.user.update({
            where: { id: userId },
            data: { notificationPrefs: preferences },
            select: { notificationPrefs: true },
        });
        return user.notificationPrefs;
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notification_gateway_1.NotificationGateway])
], NotificationService);
//# sourceMappingURL=notification.service.js.map