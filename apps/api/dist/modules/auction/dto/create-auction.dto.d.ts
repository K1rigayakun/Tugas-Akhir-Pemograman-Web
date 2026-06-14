import { AuctionType, ItemRarity, Rank } from "@prisma/client";
export { AuctionType, ItemRarity, Rank } from "@prisma/client";
export declare class CreateAuctionDto {
    title: string;
    description: string;
    category: string;
    rarity?: ItemRarity;
    startingPrice: number;
    minimumIncrement?: number;
    minimumPrice?: number;
    decrementAmount?: number;
    startTime: string;
    endTime: string;
    auctionType: AuctionType;
    minimumRank?: Rank;
    isSealed?: boolean;
    imageUrls?: string[];
    requiredAchievementId?: string;
}
//# sourceMappingURL=create-auction.dto.d.ts.map