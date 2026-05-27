// src/auth/dto/verify-email.dto.ts

import { IsEmail, IsString, IsNotEmpty, Length, Matches } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

/**
 * VerifyEmailDto — Validasi input POST /api/v1/auth/verify-email
 *
 * ─── Email ───────────────────────────────────────────────────
 * - Sama persis dengan email yang dipakai saat register
 * - Di-lowercase & trim otomatis (konsisten dengan RegisterDto)
 *
 * ─── OTP ─────────────────────────────────────────────────────
 * - Tepat 6 karakter
 * - Hanya boleh digit 0–9 (tidak boleh huruf atau simbol)
 * - Whitespace di-strip otomatis (UX: cegah salah copy-paste)
 */
export class VerifyEmailDto {
  @ApiProperty({
    example: 'peter@emeraldkingdom.com',
    description: 'Email yang digunakan saat registrasi',
  })
  @IsEmail({}, { message: 'Format email tidak valid' })
  @IsNotEmpty({ message: 'Email tidak boleh kosong' })
  @Transform(({ value }: { value: string }) =>
    typeof value === 'string' ? value.toLowerCase().trim() : value,
  )
  email: string;

  @ApiProperty({
    example: '048291',
    description: 'Kode OTP 6 digit yang dikirim ke email',
  })
  @IsString({ message: 'OTP harus berupa string' })
  @IsNotEmpty({ message: 'OTP tidak boleh kosong' })
  @Transform(({ value }: { value: string }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @Length(6, 6, { message: 'OTP harus tepat 6 digit' })
  @Matches(/^\d{6}$/, { message: 'OTP hanya boleh mengandung angka' })
  otp: string;
}