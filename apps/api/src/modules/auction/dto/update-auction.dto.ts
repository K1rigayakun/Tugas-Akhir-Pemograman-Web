import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from "class-validator";
import { AuctionType, ItemRarity, Rank } from "./create-auction.dto";

export class UpdateAuctionDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsEnum(ItemRarity)
  @IsOptional()
  rarity?: ItemRarity;

  @IsNumber()
  @IsOptional()
  @Min(1)
  startingPrice?: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  minimumIncrement?: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  minimumPrice?: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  decrementAmount?: number;

  @IsDateString()
  @IsOptional()
  startTime?: string;

  @IsDateString()
  @IsOptional()
  endTime?: string;

  @IsEnum(AuctionType)
  @IsOptional()
  auctionType?: AuctionType;

  @IsEnum(Rank)
  @IsOptional()
  minimumRank?: Rank;

  @IsBoolean()
  @IsOptional()
  isSealed?: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  imageUrls?: string[];
}
