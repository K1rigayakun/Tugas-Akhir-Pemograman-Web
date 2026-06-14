import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  Max,
  MinLength,
  MaxLength,
  IsNumber,
  IsDateString,
  IsArray,
} from "class-validator";

// ============================================================
// Admin DTOs — Validasi input untuk semua admin endpoints
// ============================================================

// Export CreateAuctionDto dari file terpisah
export { CreateAuctionDto } from "./create-auction.dto";

/** POST /admin/users/:id/warn */
export class WarnUserDto {
  @IsString()
  @IsNotEmpty({ message: "Alasan peringatan wajib diisi." })
  @MinLength(10, { message: "Alasan minimal 10 karakter." })
  @MaxLength(500, { message: "Alasan maksimal 500 karakter." })
  reason!: string;
}

/** POST /admin/users/:id/suspend */
export class SuspendUserDto {
  @IsString()
  @IsNotEmpty({ message: "Alasan suspend wajib diisi." })
  @MinLength(10, { message: "Alasan minimal 10 karakter." })
  reason!: string;

  @IsInt()
  @Min(1, { message: "Durasi minimal 1 hari." })
  @Max(365, { message: "Durasi maksimal 365 hari." })
  durationDays!: number;
}

/** POST /admin/users/:id/ban-auction, /ban-permanent */
export class BanUserDto {
  @IsString()
  @IsNotEmpty({ message: "Alasan ban wajib diisi." })
  @MinLength(10, { message: "Alasan minimal 10 karakter." })
  reason!: string;
}

/** POST /admin/auctions/:id/cancel */
export class CancelAuctionDto {
  @IsString()
  @IsNotEmpty({ message: "Alasan pembatalan wajib diisi." })
  @MinLength(10, { message: "Alasan minimal 10 karakter." })
  reason!: string;
}

/** POST /admin/kyc/:id/reject */
export class RejectKYCDto {
  @IsString()
  @IsNotEmpty({ message: "Catatan penolakan wajib diisi." })
  @MinLength(10, { message: "Catatan minimal 10 karakter." })
  notes!: string;
}

/** POST /admin/museum/items/:auctionId */
export class CurateMuseumDto {
  @IsString()
  @IsNotEmpty({ message: "Teks editorial wajib diisi." })
  @MinLength(20, { message: "Editorial minimal 20 karakter." })
  @MaxLength(2000, { message: "Editorial maksimal 2000 karakter." })
  editorial!: string;
}

/** POST /admin/events */
export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  theme!: string;

  @IsString()
  @IsOptional()
  backgroundMode?: string;

  @IsArray()
  @IsOptional()
  accentColors?: string[];

  @IsNumber()
  @Min(1)
  @Max(5)
  expMultiplier!: number;

  @IsDateString()
  startTime!: string;

  @IsDateString()
  endTime!: string;
}

// ============================================================
// Pagination DTO
// ============================================================

export class PaginationDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
