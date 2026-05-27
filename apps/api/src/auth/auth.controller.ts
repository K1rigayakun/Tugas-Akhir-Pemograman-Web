import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { Public } from './decorators/public.decorator';
import { AuthThrottlerGuard } from './guards/auth-throttler.guard';
import { RegisterResponse } from './interfaces/auth.interface';

/**
 * Auth Controller — Emerald Kingdom
 *
 * Guard hierarchy yang aktif di controller ini:
 * 1. JwtAccessGuard (global, dari app.module) → di-bypass oleh @Public()
 * 2. AuthThrottlerGuard (class-level) → rate limiting ketat auth endpoints
 */
@ApiTags('Authentication')
@UseGuards(AuthThrottlerGuard)
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ════════════════════════════════════════════════════════════
  // STEP 2 — POST /api/v1/auth/register
  // ════════════════════════════════════════════════════════════

  /**
   * Endpoint registrasi akun baru.
   *
   * Proteksi yang aktif:
   * - @Public()           → bypass JwtAccessGuard global
   * - @Throttle auth      → max 5 percobaan / 5 menit per IP, blokir 15 menit
   * - ValidationPipe      → RegisterDto divalidasi secara otomatis (whitelist + strict)
   *
   * Response:
   * - 201 Created         → registrasi sukses, OTP dikirim ke email
   * - 409 Conflict        → email sudah terdaftar
   * - 422 Unprocessable   → validasi DTO gagal
   * - 429 Too Many Req.   → rate limit terlampaui
   */
  @Public()
  @Throttle({ auth: { limit: 5, ttl: 300_000 } })
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Registrasi akun baru',
    description:
      'Mendaftarkan user baru dan mengirimkan kode OTP ke email untuk verifikasi. ' +
      'Rate limited: maks 5 percobaan per 5 menit per IP.',
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'Registrasi berhasil. OTP dikirim ke email.',
    schema: {
      example: {
        message:
          'Registrasi berhasil! Kode OTP telah dikirim ke email Anda. Kode berlaku selama 10 menit.',
        userId: 'clxyz1234abcdef',
        email: 'peter@emeraldkingdom.com',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Email sudah terdaftar.',
    schema: {
      example: {
        statusCode: 409,
        message: 'Email ini sudah terdaftar. Silakan gunakan email lain atau login.',
        error: 'Conflict',
      },
    },
  })
  @ApiResponse({
    status: 422,
    description: 'Validasi input gagal.',
    schema: {
      example: {
        statusCode: 422,
        message: [
          'Format email tidak valid',
          'Password harus mengandung minimal 1 huruf besar, 1 huruf kecil, 1 angka, dan 1 simbol',
          'Password dan konfirmasi password tidak cocok',
        ],
        error: 'Unprocessable Entity',
      },
    },
  })
  @ApiResponse({
    status: 429,
    description: 'Terlalu banyak percobaan. Coba lagi dalam 15 menit.',
  })
  async register(@Body() dto: RegisterDto): Promise<RegisterResponse> {
    return this.authService.register(dto);
  }

  // ────────────────────────────────────────────────────────────
  // Step 3: POST /api/v1/auth/verify-email  → akan ditambahkan
  // Step 4: POST /api/v1/auth/login         → akan ditambahkan
  // ────────────────────────────────────────────────────────────
}
