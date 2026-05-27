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
import { VerifyEmailDto } from './dto/verify-email.dto';
import { VerifyEmailResponse } from './interfaces/auth.interface';
// Tambahkan ke blok import yang sudah ada
import { Req } from '@nestjs/common';
import { Request } from 'express';
import { LoginDto } from './dto/login.dto';
import { LoginResponse } from './interfaces/auth.interface';
// Tambahkan ke blok import yang sudah ada
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RefreshTokenResponse, LogoutResponse } from './interfaces/auth.interface';

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

// ════════════════════════════════════════════════════════════
// STEP 3 — POST /api/v1/auth/verify-email
// ════════════════════════════════════════════════════════════
// Tambahkan method ini di dalam class AuthController,
// tepat di bawah method register()

  /**
   * Endpoint verifikasi email dengan OTP.
   *
   * Proteksi yang aktif:
   * - @Public()      → bypass JwtAccessGuard global
   * - @Throttle auth → max 5 percobaan / 5 menit per IP, blokir 15 menit
   *                    (penting: mencegah brute-force 6-digit OTP)
   * - ValidationPipe → VerifyEmailDto divalidasi otomatis
   *
   * Response:
   * - 200 OK               → verifikasi sukses, token dikembalikan
   * - 401 Unauthorized     → OTP salah atau kedaluwarsa
   * - 409 Conflict         → email sudah terverifikasi sebelumnya
   * - 429 Too Many Req.    → rate limit terlampaui
   */
  @Public()
  @Throttle({ auth: { limit: 5, ttl: 300_000 } })
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verifikasi email dengan OTP',
    description:
      'Memvalidasi kode OTP 6-digit yang dikirim ke email saat registrasi. ' +
      'Jika valid, mengembalikan Access Token & Refresh Token. ' +
      'Rate limited: maks 5 percobaan per 5 menit per IP.',
  })
  @ApiBody({ type: VerifyEmailDto })
  @ApiResponse({
    status: 200,
    description: 'Email berhasil diverifikasi. Token dikembalikan.',
    schema: {
      example: {
        message: 'Email berhasil diverifikasi! Selamat datang di Emerald Kingdom.',
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: 'clxyz1234abcdef',
          email: 'peter@emeraldkingdom.com',
          role: 'BUYER',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'OTP tidak valid atau sudah kedaluwarsa.',
    schema: {
      example: {
        statusCode: 401,
        message: 'Kode OTP tidak valid atau sudah kedaluwarsa. Silakan minta kode baru.',
        error: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Email sudah terverifikasi sebelumnya.',
  })
  @ApiResponse({
    status: 429,
    description: 'Terlalu banyak percobaan. Coba lagi dalam 15 menit.',
  })
  async verifyEmail(@Body() dto: VerifyEmailDto): Promise<VerifyEmailResponse> {
    return this.authService.verifyEmail(dto);
  }
  // ════════════════════════════════════════════════════════════
  // STEP 4 — POST /api/v1/auth/login
  // ════════════════════════════════════════════════════════════

  @Public()
  @Throttle({ auth: { limit: 5, ttl: 300_000 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login user',
    description:
      'Autentikasi user dengan email & password. Mengembalikan Access Token & Refresh Token. ' +
      'Mengirim security alert jika login dari IP atau perangkat baru.',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login berhasil.',
    schema: {
      example: {
        message: 'Login berhasil. Selamat datang kembali!',
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: { id: 'clxyz1234', email: 'peter@emeraldkingdom.com', role: 'BUYER' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Email atau password salah.' })
  @ApiResponse({ status: 403, description: 'Akun nonaktif atau email belum diverifikasi.' })
  @ApiResponse({ status: 429, description: 'Terlalu banyak percobaan. Blokir 15 menit.' })
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
  ): Promise<LoginResponse> {
    /**
     * Ekstrak IP Address dengan mempertimbangkan reverse proxy (Nginx/Cloudflare).
     * x-forwarded-for bisa berisi multiple IP (client, proxy1, proxy2...),
     * kita ambil yang pertama (IP asli client).
     */
    const ipAddress =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ??
      req.socket.remoteAddress ??
      'unknown';

    const userAgent = req.headers['user-agent'] ?? 'unknown';

    return this.authService.login(dto, ipAddress, userAgent);
  }
  // ════════════════════════════════════════════════════════════
  // STEP 5 — POST /api/v1/auth/refresh
  // ════════════════════════════════════════════════════════════

  /**
   * Endpoint ini @Public() karena client tidak punya Access Token
   * yang valid saat memanggil /refresh (itulah alasan dia refresh).
   * Guard tetap dilindungi ThrottlerGuard + validasi hash di service.
   */
  @Public()
  @Throttle({ auth: { limit: 5, ttl: 300_000 } })
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Rotate refresh token',
    description:
      'Menukar Refresh Token lama dengan pasangan Access Token & Refresh Token baru. ' +
      'Refresh Token lama langsung diinvalidasi (single-use rotation).',
  })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({
    status: 200,
    description: 'Token berhasil di-rotate.',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Token tidak valid, expired, atau reuse terdeteksi.' })
  @ApiResponse({ status: 429, description: 'Terlalu banyak percobaan.' })
  async refresh(@Body() dto: RefreshTokenDto): Promise<RefreshTokenResponse> {
    return this.authService.refreshToken(dto);
  }

  // ════════════════════════════════════════════════════════════
  // STEP 5 — POST /api/v1/auth/logout
  // ════════════════════════════════════════════════════════════

  /**
   * Logout menggunakan refresh token (bukan access token) karena:
   * 1. Access token stateless & short-lived — tidak ada yang perlu direvoke di DB.
   * 2. Yang perlu dimatikan adalah *sesi* (baris di tabel sessions),
   *    dan sesi diidentifikasi via sessionId di dalam refresh token payload.
   *
   * Endpoint ini memerlukan auth (@UseGuards JwtAccessGuard via global guard)
   * TAPI kita tetap pasang @Public() agar client yang access token-nya
   * sudah expired tetap bisa logout dengan bersih menggunakan refresh token-nya.
   */
  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Logout & invalidasi sesi',
    description:
      'Menonaktifkan sesi aktif berdasarkan Refresh Token. ' +
      'Selalu mengembalikan 200 meskipun token sudah expired (silent logout).',
  })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({
    status: 200,
    description: 'Logout berhasil.',
    schema: { example: { message: 'Logout berhasil.' } },
  })
  async logout(@Body() dto: RefreshTokenDto): Promise<LogoutResponse> {
    return this.authService.logout(dto);
  }
}
