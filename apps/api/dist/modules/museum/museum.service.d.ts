import { PrismaService } from '../../prisma/prisma.service';
export declare class MuseumService {
    private prisma;
    constructor(prisma: PrismaService);
    getFeaturedItems(): Promise<{
        id: string;
        name: string;
        description: string;
        image: string;
        category: string;
        owner: string | null | undefined;
    }[]>;
    getMuseumItems(limit: number): Promise<({
        auction: {
            id: string;
            _count: {
                bids: number;
            };
            title: string;
            rarity: import(".prisma/client").$Enums.ItemRarity;
            imageUrls: string[];
            finalPrice: number | null;
            winner: {
                username: string;
                rank: import(".prisma/client").$Enums.Rank;
                privacyMode: import(".prisma/client").$Enums.PrivacyMode;
            } | null;
        };
    } & {
        id: string;
        auctionId: string;
        featuredAt: Date;
        editorial: string | null;
    })[]>;
}
//# sourceMappingURL=museum.service.d.ts.map