import { ShopService } from "./shop.service";
export declare class ShopController {
    private readonly service;
    constructor(service: ShopService);
    items(type?: string): import(".prisma/client").Prisma.PrismaPromise<{
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
    purchase(req: any, itemId: string, body: {
        idempotencyKey: string;
    }): Promise<{
        id: string;
        userId: string;
        shopItemId: string;
        pricePaid: number;
        idempotencyKey: string;
        purchasedAt: Date;
    }>;
}
//# sourceMappingURL=shop.controller.d.ts.map