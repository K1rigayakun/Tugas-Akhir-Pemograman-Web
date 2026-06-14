import { Prisma } from "@prisma/client";
import { NotificationService } from "./notification.service";
export declare class NotificationController {
    private readonly service;
    constructor(service: NotificationService);
    list(req: any, page?: string, limit?: string, unread?: string): Promise<{
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
    readAll(req: any): Promise<{
        success: boolean;
        updated: number;
    }>;
    read(req: any, id: string): Promise<{
        success: boolean;
    }>;
    unread(req: any): Promise<{
        count: number;
    }>;
    preferences(req: any): Promise<string | number | true | Prisma.JsonObject | Prisma.JsonArray>;
    updatePreferences(req: any, body: Record<string, unknown>): Promise<Prisma.JsonValue>;
}
//# sourceMappingURL=notification.controller.d.ts.map