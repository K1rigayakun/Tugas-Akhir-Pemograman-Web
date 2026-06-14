import { AuctionType, ItemRarity, Rank } from "./create-auction.dto";
export declare class UpdateAuctionDto {
    title?: string;
    description?: string;
    category?: string;
    rarity?: ItemRarity;
    startingPrice?: number;
    minimumIncrement?: number;
    minimumPrice?: number;
    decrementAmount?: number;
    startTime?: string;
    endTime?: string;
    auctionType?: AuctionType;
    minimumRank?: Rank;
    isSealed?: boolean;
    imageUrls?: string[];
    requiredAchievementId?: string;
}
//# sourceMappingURL=update-auction.dto.d.ts.map