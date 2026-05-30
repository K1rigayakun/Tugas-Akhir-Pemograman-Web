import { IsString, IsNumber, IsOptional, IsEnum, IsDateString, IsBoolean, Min } from 'class-validator';
import { AuctionType, Rank } from './create-auction.dto';

export class UpdateAuctionDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  startPrice?: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  minimumPrice?: number;

  @IsDateString()
  @IsOptional()
  startTime?: string;

  @IsDateString()
  @IsOptional()
  endTime?: string;

  @IsEnum(AuctionType)
  @IsOptional()
  type?: AuctionType;

  @IsEnum(Rank)
  @IsOptional()
  minimumRank?: Rank;

  @IsBoolean()
  @IsOptional()
  isSealed?: boolean;
}
