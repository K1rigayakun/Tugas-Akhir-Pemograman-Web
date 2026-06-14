import { MuseumService } from './museum.service';
export declare class MuseumController {
    private museumService;
    constructor(museumService: MuseumService);
    getFeaturedItems(): Promise<{
        data: {
            id: string;
            name: string;
            description: string;
            image: string;
            category: string;
            owner: string | null | undefined;
        }[];
        timestamp: string;
    }>;
    getMuseumItems(limitStr?: string): Promise<({
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
//# sourceMappingURL=museum.controller.d.ts.map