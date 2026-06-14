import { Injectable, NotFoundException } from "@nestjs/common";
import { NotifType, Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { NotificationGateway } from "./notification.gateway";

@Injectable()
export class NotificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: NotificationGateway
  ) {}

  async send(userId: string, type: NotifType, payload: Prisma.InputJsonValue) {
    const notif = await this.prisma.notification.create({ data: { userId, type, payload } });
    this.gateway.notifyUser(userId, type, payload);
    return notif;
  }

  async sendGlobal(type: NotifType, payload: Prisma.InputJsonValue) {
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

  async list(userId: string, page = 1, limit = 20, unreadOnly = false) {
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

  async markRead(userId: string, id: string) {
    const result = await this.prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
    if (!result.count) throw new NotFoundException("Notifikasi tidak ditemukan.");
    return { success: true };
  }

  async markAllRead(userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return { success: true, updated: result.count };
  }

  async unreadCount(userId: string) {
    return { count: await this.prisma.notification.count({ where: { userId, isRead: false } }) };
  }

  async getPreferences(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { notificationPrefs: true },
    });
    return user?.notificationPrefs || {};
  }

  async updatePreferences(userId: string, preferences: Prisma.InputJsonValue) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { notificationPrefs: preferences },
      select: { notificationPrefs: true },
    });
    return user.notificationPrefs;
  }
}
