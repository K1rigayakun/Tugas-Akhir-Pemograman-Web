import { PrismaService } from '../../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
export declare class DeliveryService {
    private readonly prisma;
    private readonly notificationService;
    constructor(prisma: PrismaService, notificationService: NotificationService);
    getUserAddress(userId: string): Promise<{
        id: string;
        userId: string;
        recipient: string;
        phoneNumber: string;
        address: string;
        city: string;
        province: string;
        postalCode: string;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    upsertUserAddress(userId: string, data: {
        recipient: string;
        phoneNumber: string;
        address: string;
        city: string;
        province: string;
        postalCode: string;
    }): Promise<{
        id: string;
        userId: string;
        recipient: string;
        phoneNumber: string;
        address: string;
        city: string;
        province: string;
        postalCode: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getDeliveriesByUser(userId: string): Promise<({
        auction: {
            title: string;
            rarity: import(".prisma/client").$Enums.ItemRarity;
            imageUrls: string[];
            finalPrice: number | null;
        };
    } & {
        id: string;
        auctionId: string;
        userId: string;
        status: string;
        trackingResi: string | null;
        courier: string | null;
        shippedAt: Date | null;
        deliveredAt: Date | null;
        recipient: string;
        phoneNumber: string;
        address: string;
        city: string;
        province: string;
        postalCode: string;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    getAllDeliveries(): Promise<({
        user: {
            email: string;
            username: string;
        };
        auction: {
            title: string;
        };
    } & {
        id: string;
        auctionId: string;
        userId: string;
        status: string;
        trackingResi: string | null;
        courier: string | null;
        shippedAt: Date | null;
        deliveredAt: Date | null;
        recipient: string;
        phoneNumber: string;
        address: string;
        city: string;
        province: string;
        postalCode: string;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    updateDeliveryStatus(id: string, adminId: string, status: string, trackingResi?: string, courier?: string): Promise<{
        id: string;
        auctionId: string;
        userId: string;
        status: string;
        trackingResi: string | null;
        courier: string | null;
        shippedAt: Date | null;
        deliveredAt: Date | null;
        recipient: string;
        phoneNumber: string;
        address: string;
        city: string;
        province: string;
        postalCode: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    createDeliveryForWinner(auctionId: string, userId: string): Promise<{
        id: string;
        auctionId: string;
        userId: string;
        status: string;
        trackingResi: string | null;
        courier: string | null;
        shippedAt: Date | null;
        deliveredAt: Date | null;
        recipient: string;
        phoneNumber: string;
        address: string;
        city: string;
        province: string;
        postalCode: string;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
}
//# sourceMappingURL=delivery.service.d.ts.map