import {
  IsEmail,
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  Matches,
  IsStrongPassword,
} from 'class-validator';
import { Match } from '../decorators/match.decorator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * RegisterDto — Validasi input endpoint POST /api/v1/auth/register
 *
 * Aturan validasi:
 * ─── Email ──────────────────────────────────────────────────────
 * - Format email yang valid (RFC 5322)
 * - Di-lowercase & di-trim secara otomatis via @Transform
 * - Maks 255 karakter (batas umum DB varchar)
 *
 * ─── Password ───────────────────────────────────────────────────
 * - Min 8 karakter, maks 72 karakter
 *   (72 karakter adalah batas bcrypt; Argon2 tidak punya batas,
 *    tapi kita batasi untuk mencegah DoS via password sangat panjang)
 * - Wajib mengandung: huruf besar, huruf kecil, angka, simbol
 * - Tidak boleh mengandung spasi
 *
 * ─── ConfirmPassword ─────────────────────────────────────────────
 * - Wajib sama dengan field `password`
 * - Divalidasi dengan custom @Match decorator
 */
export class RegisterDto {
  @ApiProperty({
    example: 'peter@emeraldkingdom.com',
    description: 'Alamat email yang valid dan belum terdaftar',
  })
  @IsEmail({}, { message: 'Format email tidak valid' })
  @IsNotEmpty({ message: 'Email tidak boleh kosong' })
  @MaxLength(255, { message: 'Email tidak boleh melebihi 255 karakter' })
  email!: string;

  @ApiProperty({
    example: 'P@ssw0rd!2024',
    description:
      'Password minimal 8 karakter, mengandung huruf besar, huruf kecil, angka, dan simbol',
  })
  @IsString({ message: 'Password harus berupa string' })
  @IsNotEmpty({ message: 'Password tidak boleh kosong' })
  @MinLength(8, { message: 'Password minimal 8 karakter' })
  @MaxLength(72, { message: 'Password tidak boleh melebihi 72 karakter' })
  @IsStrongPassword(
    {
      minUppercase: 1,
      minLowercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    {
      message:
        'Password harus mengandung minimal 1 huruf besar, 1 huruf kecil, 1 angka, dan 1 simbol',
    },
  )
  @Matches(/^\S*$/, { message: 'Password tidak boleh mengandung spasi' })
  password!: string;

  @ApiProperty({
    example: 'P@ssw0rd!2024',
    description: 'Harus sama dengan field password',
  })
  @IsString({ message: 'Konfirmasi password harus berupa string' })
  @IsNotEmpty({ message: 'Konfirmasi password tidak boleh kosong' })
  @Match('password', { message: 'Password dan konfirmasi password tidak cocok' })
  confirmPassword!: string;
}
