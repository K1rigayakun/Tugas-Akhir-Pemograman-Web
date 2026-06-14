import { NotifType, Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { NotificationGateway } from "./notification.gateway";
export declare class NotificationService {
    private readonly prisma;
    private readonly gateway;
    constructor(prisma: PrismaService, gateway: NotificationGateway);
    send(userId: string, type: NotifType, payload: Prisma.InputJsonValue): Promise<{
        id: string;
        userId: string;
        type: import(".prisma/client").$Enums.NotifType;
        payload: Prisma.JsonValue;
        isRead: boolean;
        createdAt: Date;
    }>;
    sendGlobal(type: NotifType, payload: Prisma.InputJsonValue): Promise<Prisma.BatchPayload>;
    list(userId: string, page?: number, limit?: number, unreadOnly?: boolean): Promise<{
        data: {
            id: string;
            userId: string;
            type: import(".prisma/client").$Enums.NotifType;
            payload: Prisma.JsonValue;
            isRead: boolean;
            createdAt: Date;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    markRead(userId: string, id: string): Promise<{
        success: boolean;
    }>;
    markAllRead(userId: string): Promise<{
        success: boolean;
        updated: number;
    }>;
    unreadCount(userId: string): Promise<{
        count: number;
    }>;
    getPreferences(userId: string): Promise<string | number | true | Prisma.JsonObject | Prisma.JsonArray>;
    updatePreferences(userId: string, preferences: Prisma.InputJsonValue): Promise<Prisma.JsonValue>;
}
//# sourceMappingURL=notification.service.d.ts.map