import { IsString, IsNumber, IsOptional, IsEnum, IsDateString, IsBoolean, Min } from 'class-validator';

export enum AuctionType {
  STANDARD     = "STANDARD",
  SCHEDULED    = "SCHEDULED",
  LIVE         = "LIVE",
  RANK_EXCL    = "RANK_EXCL",
  SEALED_CHEST = "SEALED_CHEST",
  DESCENDING   = "DESCENDING",
}

export enum Rank {
  CIVIS     = "CIVIS",
  MERCHANT  = "MERCHANT",
  KNIGHT    = "KNIGHT",
  BARON     = "BARON",
  VISCOUNT  = "VISCOUNT",
  EARL      = "EARL",
  MARQUIS   = "MARQUIS",
  DUKE      = "DUKE",
  SOVEREIGN = "SOVEREIGN",
  EMPEROR   = "EMPEROR",
}

export class CreateAuctionDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsNumber()
  @Min(1)
  startPrice: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  minimumPrice?: number; // Khusus lelang Descending

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;

  @IsEnum(AuctionType)
  type: AuctionType;

  @IsEnum(Rank)
  @IsOptional()
  minimumRank?: Rank; // Khusus lelang Rank-Exclusive

  @IsBoolean()
  @IsOptional()
  isSealed?: boolean; // Khusus lelang Mystery (Sealed Chest)
}
