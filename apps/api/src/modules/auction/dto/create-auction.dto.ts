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
import { AuctionType, ItemRarity, Rank } from "@prisma/client";

export { AuctionType, ItemRarity, Rank } from "@prisma/client";

export class CreateAuctionDto {
  @IsString()
  title!: string;

  @IsString()
  description!: string;

  @IsString()
  category!: string;

  @IsEnum(ItemRarity)
  @IsOptional()
  rarity?: ItemRarity;

  @IsNumber()
  @Min(1)
  startingPrice!: number;

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
  startTime!: string;

  @IsDateString()
  endTime!: string;

  @IsEnum(AuctionType)
  auctionType!: AuctionType;

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
