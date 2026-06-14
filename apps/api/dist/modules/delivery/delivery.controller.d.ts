import { DeliveryService } from './delivery.service';
export declare class DeliveryController {
    private readonly deliveryService;
    constructor(deliveryService: DeliveryService);
    getMyAddress(req: any): Promise<{
        address: {
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
        } | null;
    }>;
    updateMyAddress(req: any, body: {
        recipient: string;
        phoneNumber: string;
        address: string;
        city: string;
        province: string;
        postalCode: string;
    }): Promise<{
        address: {
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
        };
        message: string;
    }>;
    getMyDeliveries(req: any): Promise<({
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
    getAllDeliveries(req: any): Promise<({
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
    updateDeliveryStatus(req: any, id: string, body: {
        status: string;
        trackingResi?: string;
        courier?: string;
    }): Promise<{
        delivery: {
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
        };
        message: string;
    }>;
}
//# sourceMappingURL=delivery.controller.d.ts.map