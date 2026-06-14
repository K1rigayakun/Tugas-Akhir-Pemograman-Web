import { IsString, IsNumber, IsOptional, IsEnum, Min, IsNotEmpty } from 'class-validator';

/**
 * Payment method enum for DTO validation
 */
export enum PaymentMethodDto {
  QRIS = 'QRIS',
  VIRTUAL_ACCOUNT = 'VIRTUAL_ACCOUNT',
  EWALLET = 'EWALLET',
  STRIPE = 'STRIPE',
  BANK_TRANSFER = 'BANK_TRANSFER',
  TESTING = 'TESTING',
}

/**
 * DTO for initiating a new payment
 * Validates Requirements 2.1, 10.2, 10.3
 */
export class InitiatePaymentDto {
  @IsNumber()
  @Min(1, { message: 'Jumlah CC harus minimal 1' })
  amount!: number;

  @IsNumber()
  @Min(1, { message: 'Jumlah fiat harus minimal 1' })
  fiatAmount!: number;

  @IsEnum(PaymentMethodDto, { message: 'Metode pembayaran tidak valid' })
  method!: PaymentMethodDto;

  @IsOptional()
  @IsString()
  bank?: string;

  @IsOptional()
  @IsString()
  walletType?: string;
}

/**
 * DTO for approving a payment
 * Validates Requirements 6.3, 6.5
 */
export class ApprovePaymentDto {
  @IsOptional()
  @IsString()
  notes?: string;
}

/**
 * DTO for rejecting a payment
 * Validates Requirements 6.4, 6.7
 */
export class RejectPaymentDto {
  @IsNotEmpty({ message: 'Catatan admin wajib diisi saat menolak pembayaran' })
  @IsString()
  notes!: string;
}

/**
 * DTO for payment list query parameters
 */
export class PaymentListQueryDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  method?: string;

  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;
}
