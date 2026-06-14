import { PrismaService } from "../../prisma/prisma.service";
export declare class ShopService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(type?: string): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        name: string;
        type: string;
        cosmeticId: string | null;
        price: number;
        stock: number | null;
        isLimited: boolean;
        flashSalePrice: number | null;
        flashSaleEnd: Date | null;
        isActive: boolean;
        createdAt: Date;
    }[]>;
    flashSales(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        name: string;
        type: string;
        cosmeticId: string | null;
        price: number;
        stock: number | null;
        isLimited: boolean;
        flashSalePrice: number | null;
        flashSaleEnd: Date | null;
        isActive: boolean;
        createdAt: Date;
    }[]>;
    limited(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        name: string;
        type: string;
        cosmeticId: string | null;
        price: number;
        stock: number | null;
        isLimited: boolean;
        flashSalePrice: number | null;
        flashSaleEnd: Date | null;
        isActive: boolean;
        createdAt: Date;
    }[]>;
    purchase(userId: string, itemId: string, idempotencyKey: string): Promise<{
        id: string;
        userId: string;
        shopItemId: string;
        pricePaid: number;
        idempotencyKey: string;
        purchasedAt: Date;
    }>;
}
//# sourceMappingURL=shop.service.d.ts.map