import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  IsNumber,
  IsDateString,
  IsArray,
  IsEnum,
  IsBoolean,
  MinLength,
  MaxLength,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from "class-validator";
import { AuctionType, ItemRarity, Rank } from "@prisma/client";

/**
 * Custom validator untuk memastikan endTime > startTime
 * Requirement 2.3: Validate date ranges (endTime > startTime)
 */
@ValidatorConstraint({ name: "IsAfterStartTime", async: false })
export class IsAfterStartTimeConstraint implements ValidatorConstraintInterface {
  validate(endTime: string, args: ValidationArguments): boolean {
    const obj = args.object as CreateAuctionDto;
    if (!obj.startTime || !endTime) {
      return false;
    }
    const start = new Date(obj.startTime);
    const end = new Date(endTime);
    return end > start;
  }

  defaultMessage(args: ValidationArguments): string {
    return "Waktu berakhir lelang harus setelah waktu mulai lelang.";
  }
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
export class CreateAuctionDto {
  @IsString({ message: "Judul lelang harus berupa teks." })
  @IsNotEmpty({ message: "Judul lelang wajib diisi." })
  @MinLength(5, { message: "Judul lelang minimal 5 karakter." })
  @MaxLength(200, { message: "Judul lelang maksimal 200 karakter." })
  title!: string;

  @IsString({ message: "Deskripsi lelang harus berupa teks." })
  @IsNotEmpty({ message: "Deskripsi lelang wajib diisi." })
  @MinLength(20, { message: "Deskripsi lelang minimal 20 karakter." })
  @MaxLength(5000, { message: "Deskripsi lelang maksimal 5000 karakter." })
  description!: string;

  @IsString({ message: "Kategori harus berupa teks." })
  @IsNotEmpty({ message: "Kategori wajib diisi." })
  category!: string;

  @IsEnum(ItemRarity, { message: "Rarity harus salah satu dari: COMMON, UNCOMMON, RARE, EPIC, LEGENDARY, TRANSCENDENT." })
  @IsOptional()
  rarity?: ItemRarity;

  @IsEnum(AuctionType, { message: "Tipe lelang harus salah satu dari: STANDARD, SCHEDULED, LIVE, RANK_EXCL, SEALED_CHEST, DESCENDING." })
  @IsNotEmpty({ message: "Tipe lelang wajib diisi." })
  auctionType!: AuctionType;

  @IsNumber({}, { message: "Harga awal harus berupa angka." })
  @Min(1, { message: "Harga awal minimal 1." })
  @IsNotEmpty({ message: "Harga awal wajib diisi." })
  startingPrice!: number;

  @IsNumber({}, { message: "Increment minimum harus berupa angka." })
  @Min(1, { message: "Increment minimum minimal 1." })
  @IsOptional()
  minimumIncrement?: number;

  @IsNumber({}, { message: "Harga minimum harus berupa angka." })
  @Min(1, { message: "Harga minimum minimal 1." })
  @IsOptional()
  minimumPrice?: number;

  @IsNumber({}, { message: "Jumlah decrement harus berupa angka." })
  @Min(1, { message: "Jumlah decrement minimal 1." })
  @IsOptional()
  decrementAmount?: number;

  @IsDateString({}, { message: "Waktu mulai harus berupa tanggal ISO 8601 yang valid." })
  @IsNotEmpty({ message: "Waktu mulai lelang wajib diisi." })
  startTime!: string;

  @IsDateString({}, { message: "Waktu berakhir harus berupa tanggal ISO 8601 yang valid." })
  @IsNotEmpty({ message: "Waktu berakhir lelang wajib diisi." })
  @Validate(IsAfterStartTimeConstraint)
  endTime!: string;

  @IsEnum(Rank, { message: "Rank minimum harus salah satu dari: CIVIS, MERCHANT, KNIGHT, BARON, VISCOUNT, EARL, MARQUIS, DUKE, SOVEREIGN, EMPEROR." })
  @IsOptional()
  minimumRank?: Rank;

  @IsString({ message: "ID achievement harus berupa teks." })
  @IsOptional()
  requiredAchievementId?: string;

  @IsBoolean({ message: "isSealed harus berupa boolean (true/false)." })
  @IsOptional()
  isSealed?: boolean;

  @IsArray({ message: "imageUrls harus berupa array." })
  @IsString({ each: true, message: "Setiap URL gambar harus berupa teks." })
  @IsOptional()
  imageUrls?: string[];
}
