import { ValidatorConstraintInterface, ValidationArguments } from "class-validator";
import { AuctionType, ItemRarity, Rank } from "@prisma/client";
/**
 * Custom validator untuk memastikan endTime > startTime
 * Requirement 2.3: Validate date ranges (endTime > startTime)
 */
export declare class IsAfterStartTimeConstraint implements ValidatorConstraintInterface {
    validate(endTime: string, args: ValidationArguments): boolean;
    defaultMessage(args: ValidationArguments): string;
}
/**
 * DTO untuk membuat lelang baru melalui admin panel.
 *
 * Validates: Requirements 2.3, 2.6
 *
 * Handles optional fields based on auctionType:
 * - DESCENDING: requires minimumPrice, decrementAmount
 * - RANK_EXCL: requires minimumRank
 * - SEALED_CHEST: requires isSealed
 */
export declare class CreateAuctionDto {
    title: string;
    description: string;
    category: string;
    rarity?: ItemRarity;
    auctionType: AuctionType;
    startingPrice: number;
    minimumIncrement?: number;
    minimumPrice?: number;
    decrementAmount?: number;
    startTime: string;
    endTime: string;
    minimumRank?: Rank;
    requiredAchievementId?: string;
    isSealed?: boolean;
    imageUrls?: string[];
}
//# sourceMappingURL=create-auction.dto.d.ts.map