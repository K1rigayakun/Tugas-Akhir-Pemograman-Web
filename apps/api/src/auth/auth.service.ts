import {
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { VerifyEmailResponse } from './interfaces/auth.interface';
import * as crypto from 'crypto';
import { Resend } from 'resend';

import { PrismaService } from '../prisma/prisma.service';
import {
  JwtPayload,
  TokenPair,
  RegisterResponse,
  OtpContext,
} from './interfaces/auth.interface';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  /**
   * Argon2 options dikonfigurasi sesuai OWASP recommendations:
   * - type: argon2id (hybrid, resistant terhadap side-channel & GPU attacks)
   * - memoryCost: 64 MB (mempersulit brute-force di hardware murah)
   * - timeCost: 3 iterations
   * - parallelism: 4 threads
   */
  private readonly argon2Options: argon2.Options = {
    type: argon2.argon2id,
    memoryCost: 2 ** 16, // 64 MB
    timeCost: 3,
    parallelism: 4,
  };

  /** Resend client di-inisialisasi sekali di constructor */
  private readonly resend: Resend;

  /** Durasi OTP dalam milidetik (10 menit) */
  private readonly OTP_TTL_MS = 10 * 60 * 1000;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.resend = new Resend(
      this.configService.get<string>('RESEND_API_KEY'),
    );
  }

  // ════════════════════════════════════════════════════════════
  // STEP 2 — REGISTER
  // ════════════════════════════════════════════════════════════

  /**
   * Alur registrasi:
   * 1. Cek duplikasi email (conflict check)
   * 2. Hash password dengan Argon2id
   * 3. Generate OTP 6-digit beserta hash-nya
   * 4. Simpan user baru ke DB dalam satu operasi atomic
   * 5. Kirim OTP via Resend (fire-and-forget dengan error handling)
   * 6. Kembalikan response tanpa data sensitif
   *
   * CATATAN KEAMANAN — Timing Attack:
   * Kita melakukan conflict check SEBELUM hashing untuk efisiensi,
   * namun response error harus memiliki timing yang sama dengan
   * response sukses agar tidak bocor info "email sudah terdaftar".
   * Pendekatan ini sudah cukup untuk Fase 0; untuk produksi penuh,
   * pertimbangkan selalu mengirim response sukses (email-enumeration protection).
   */
  async register(dto: RegisterDto): Promise<RegisterResponse> {
    // ── 1. Conflict Check ────────────────────────────────────
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: { id: true },
    });

    if (existingUser) {
      throw new ConflictException(
        'Email ini sudah terdaftar. Silakan gunakan email lain atau login.',
      );
    }

    // ── 2. Hash Password ─────────────────────────────────────
    const passwordHash = await this.hashPassword(dto.password);

    // ── 3. Generate OTP ──────────────────────────────────────
    const { plainOtp, otpHash, otpExpiresAt } = await this.generateOtp();

    // ── 4. Simpan User ke Database ───────────────────────────
    let newUser: { id: string; email: string };
    try {
      newUser = await this.prisma.user.create({
        data: {
          email: dto.email,
          passwordHash,
          otpHash,
          otpExpiresAt,
        },
        select: { id: true, email: true },
      });
    } catch (error) {
      // Guard terhadap race condition: dua request simultan dengan email sama
      if ((error as { code?: string }).code === 'P2002') {
        throw new ConflictException(
          'Email ini sudah terdaftar. Silakan gunakan email lain atau login.',
        );
      }
      this.logger.error('Failed to create user', error);
      throw new InternalServerErrorException(
        'Gagal membuat akun. Silakan coba lagi.',
      );
    }

    // ── 5. Kirim OTP via Email (Fire-and-Forget) ─────────────
    /**
     * Pengiriman email tidak di-await dalam alur utama.
     * Jika email gagal terkirim, user tetap berhasil terdaftar
     * dan bisa request OTP baru via endpoint resend-otp (Step berikutnya).
     *
     * Error email di-log untuk monitoring; tidak di-expose ke client.
     */
    this.sendOtpEmail(newUser.email, plainOtp).catch((err: unknown) => {
      this.logger.error(
        `Failed to send OTP email to ${newUser.email}`,
        err instanceof Error ? err.stack : err,
      );
    });

    // ── 6. Return Response ───────────────────────────────────
    return {
      message:
        'Registrasi berhasil! Kode OTP telah dikirim ke email Anda. Kode berlaku selama 10 menit.',
      userId: newUser.id,
      email: newUser.email,
    };
  }

  // ════════════════════════════════════════════════════════════
  // OTP HELPERS
  // ════════════════════════════════════════════════════════════

  /**
   * Men-generate OTP 6-digit yang kriptografis aman.
   *
   * Kenapa crypto.randomInt dan bukan Math.random()?
   * Math.random() tidak kriptografis — nilainya bisa diprediksi.
   * crypto.randomInt() menggunakan CSPRNG (Cryptographically Secure
   * Pseudo-Random Number Generator) dari OS, aman untuk keperluan security.
   *
   * Range: 0–999999, lalu di-pad menjadi 6 digit (misal: 007823).
   */
  async generateOtp(): Promise<OtpContext> {
    const plainOtp = crypto.randomInt(0, 1_000_000).toString().padStart(6, '0');

    /**
     * OTP di-hash sebelum disimpan ke database.
     * Kita gunakan Argon2 dengan cost lebih ringan karena:
     * - OTP pendek (6 digit) = entropi rendah, hashing penting
     * - TTL pendek (10 menit) = window attack sangat kecil
     * - Tapi kita tidak perlu cost setinggi password hash
     */
    const otpHash = await argon2.hash(plainOtp, {
      ...this.argon2Options,
      memoryCost: 2 ** 14, // 16 MB (lebih ringan dari password)
      timeCost: 2,
    });

    const otpExpiresAt = new Date(Date.now() + this.OTP_TTL_MS);

    return { plainOtp, otpHash, otpExpiresAt };
  }

  /**
   * Memverifikasi OTP yang dimasukkan user terhadap hash di database.
   * Digunakan di Step 3 (verify-email).
   */
  async verifyOtp(plainOtp: string, otpHash: string): Promise<boolean> {
    try {
      return await argon2.verify(otpHash, plainOtp);
    } catch {
      return false;
    }
  }

  // ════════════════════════════════════════════════════════════
  // EMAIL HELPERS (Resend)
  // ════════════════════════════════════════════════════════════

  /**
   * Mengirimkan email OTP verifikasi menggunakan Resend API.
   *
   * Template email menggunakan HTML sederhana dengan inline styling
   * untuk kompatibilitas maksimal di berbagai email client.
   * Di produksi, pertimbangkan menggunakan React Email atau MJML
   * untuk template yang lebih kompleks.
   */
  async sendOtpEmail(toEmail: string, otp: string): Promise<void> {
    const fromEmail = this.configService.get<string>(
      'EMAIL_FROM',
      'noreply@emeraldkingdom.com',
    );
    const appName = 'Emerald Kingdom';
    const expiryMinutes = this.OTP_TTL_MS / 60_000;

    const { error } = await this.resend.emails.send({
      from: `${appName} <${fromEmail}>`,
      to: [toEmail],
      subject: `[${appName}] Kode Verifikasi Email Anda: ${otp}`,
      html: this.buildOtpEmailHtml(otp, expiryMinutes, appName),
      text: this.buildOtpEmailText(otp, expiryMinutes, appName),
    });

    if (error) {
      // Lempar error agar bisa di-catch oleh caller (fire-and-forget handler)
      throw new Error(`Resend API error: ${JSON.stringify(error)}`);
    }

    this.logger.log(`OTP email sent successfully to ${toEmail}`);
  }

  /**
   * Mengirimkan email security alert (digunakan di Step 4 — Login).
   * Disiapkan di sini agar Resend client sudah tersedia.
   */
  async sendSecurityAlertEmail(
    toEmail: string,
    ipAddress: string,
    userAgent: string,
  ): Promise<void> {
    const fromEmail = this.configService.get<string>(
      'EMAIL_FROM',
      'noreply@emeraldkingdom.com',
    );
    const appName = 'Emerald Kingdom';

    const { error } = await this.resend.emails.send({
      from: `${appName} Security <${fromEmail}>`,
      to: [toEmail],
      subject: `[${appName}] Peringatan: Login dari perangkat baru`,
      html: this.buildSecurityAlertHtml(ipAddress, userAgent, appName),
      text: this.buildSecurityAlertText(ipAddress, userAgent, appName),
    });

    if (error) {
      throw new Error(`Resend API error (security alert): ${JSON.stringify(error)}`);
    }

    this.logger.log(`Security alert email sent to ${toEmail}`);
  }

  // ════════════════════════════════════════════════════════════
  // EMAIL TEMPLATE BUILDERS
  // ════════════════════════════════════════════════════════════

  private buildOtpEmailHtml(
    otp: string,
    expiryMinutes: number,
    appName: string,
  ): string {
    return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verifikasi Email — ${appName}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0"
          style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a472a 0%,#2d6a4f 100%);padding:36px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:0.5px;">
                💎 ${appName}
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 12px;color:#111827;font-size:20px;font-weight:600;">
                Verifikasi Email Anda
              </h2>
              <p style="margin:0 0 28px;color:#6b7280;font-size:15px;line-height:1.6;">
                Gunakan kode di bawah ini untuk memverifikasi alamat email Anda.
                Kode ini hanya berlaku selama <strong>${expiryMinutes} menit</strong>.
              </p>

              <!-- OTP Box -->
              <div style="background:#f0fdf4;border:2px dashed #16a34a;border-radius:10px;padding:28px;text-align:center;margin-bottom:28px;">
                <p style="margin:0 0 8px;color:#166534;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">
                  Kode Verifikasi Anda
                </p>
                <span style="font-size:48px;font-weight:800;color:#15803d;letter-spacing:10px;font-family:'Courier New',monospace;">
                  ${otp}
                </span>
              </div>

              <p style="margin:0 0 8px;color:#9ca3af;font-size:13px;line-height:1.5;">
                ⚠️ Jangan bagikan kode ini kepada siapapun, termasuk tim ${appName}.
              </p>
              <p style="margin:0;color:#9ca3af;font-size:13px;line-height:1.5;">
                Jika Anda tidak mendaftar di ${appName}, abaikan email ini.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:20px 40px;border-top:1px solid #e5e7eb;">
              <p style="margin:0;color:#9ca3af;font-size:12px;text-align:center;">
                © ${new Date().getFullYear()} ${appName}. Platform Lelang Premium.<br/>
                Email ini dikirim secara otomatis, mohon tidak membalas.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }

  private buildOtpEmailText(
    otp: string,
    expiryMinutes: number,
    appName: string,
  ): string {
    return `
${appName} — Verifikasi Email

Kode OTP Anda: ${otp}

Kode ini berlaku selama ${expiryMinutes} menit.
Jangan bagikan kode ini kepada siapapun.

Jika Anda tidak mendaftar di ${appName}, abaikan email ini.

© ${new Date().getFullYear()} ${appName}
    `.trim();
  }

  private buildSecurityAlertHtml(
    ipAddress: string,
    userAgent: string,
    appName: string,
  ): string {
    const timestamp = new Date().toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta',
    });
    return `
<!DOCTYPE html>
<html lang="id">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0"
          style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:linear-gradient(135deg,#7f1d1d 0%,#b91c1c 100%);padding:36px 40px;text-align:center;">
              <h1 style="margin:0;color:#fff;font-size:24px;font-weight:700;">
                🔐 Peringatan Keamanan
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 12px;color:#111827;font-size:18px;">Login dari Perangkat Baru Terdeteksi</h2>
              <p style="margin:0 0 24px;color:#6b7280;font-size:15px;line-height:1.6;">
                Akun Anda baru saja diakses dari perangkat atau lokasi baru.
                Jika ini bukan Anda, segera ubah password Anda.
              </p>
              <table width="100%" cellpadding="12" cellspacing="0"
                style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;margin-bottom:24px;">
                <tr>
                  <td style="color:#991b1b;font-size:13px;font-weight:600;">Waktu</td>
                  <td style="color:#374151;font-size:13px;">${timestamp} WIB</td>
                </tr>
                <tr>
                  <td style="color:#991b1b;font-size:13px;font-weight:600;">IP Address</td>
                  <td style="color:#374151;font-size:13px;">${ipAddress}</td>
                </tr>
                <tr>
                  <td style="color:#991b1b;font-size:13px;font-weight:600;">Perangkat</td>
                  <td style="color:#374151;font-size:13px;">${userAgent}</td>
                </tr>
              </table>
              <p style="margin:0;color:#9ca3af;font-size:13px;">
                Jika ini adalah Anda, abaikan email ini. Jika bukan, segera hubungi tim ${appName}.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#f9fafb;padding:20px 40px;border-top:1px solid #e5e7eb;">
              <p style="margin:0;color:#9ca3af;font-size:12px;text-align:center;">
                © ${new Date().getFullYear()} ${appName}. Jangan balas email ini.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }

  private buildSecurityAlertText(
    ipAddress: string,
    userAgent: string,
    appName: string,
  ): string {
    return `
[${appName}] PERINGATAN KEAMANAN — Login dari Perangkat Baru

IP Address : ${ipAddress}
Perangkat  : ${userAgent}
Waktu      : ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB

Jika ini bukan Anda, segera ubah password dan hubungi tim ${appName}.
    `.trim();
  }

  // ════════════════════════════════════════════════════════════
  // ARGON2 HELPERS (dari Step 1, tidak diubah)
  // ════════════════════════════════════════════════════════════

  async hashPassword(plainPassword: string): Promise<string> {
    try {
      return await argon2.hash(plainPassword, this.argon2Options);
    } catch (error) {
      this.logger.error('Failed to hash password', error);
      throw new InternalServerErrorException('Password processing failed');
    }
  }

  async verifyPassword(
    hashedPassword: string,
    plainPassword: string,
  ): Promise<boolean> {
    try {
      return await argon2.verify(hashedPassword, plainPassword);
    } catch (error) {
      this.logger.error('Failed to verify password', error);
      return false;
    }
  }

  // ════════════════════════════════════════════════════════════
  // JWT HELPERS (dari Step 1, tidak diubah)
  // ════════════════════════════════════════════════════════════

  async generateTokenPair(
    userId: string,
    email: string,
    role: string,
    sessionId: string,
  ): Promise<TokenPair> {
    const accessPayload: JwtPayload = {
      sub: userId,
      email,
      role,
      type: 'access',
    };

    const refreshPayload: Pick<JwtPayload, 'sub' | 'type'> & {
      sessionId: string;
    } = {
      sub: userId,
      type: 'refresh',
      sessionId,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessPayload, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES_IN', '15m'),
      }),
      this.jwtService.signAsync(refreshPayload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '30d'),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  async verifyAccessToken(token: string): Promise<JwtPayload> {
    return this.jwtService.verifyAsync<JwtPayload>(token, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      issuer: 'emerald-kingdom',
      audience: 'emerald-kingdom-client',
    });
  }

  async verifyRefreshToken(
    token: string,
  ): Promise<Pick<JwtPayload, 'sub' | 'type'> & { sessionId: string }> {
    return this.jwtService.verifyAsync(token, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
    });
  }

  async hashRefreshToken(refreshToken: string): Promise<string> {
    return argon2.hash(refreshToken, {
      ...this.argon2Options,
      memoryCost: 2 ** 14,
    });
  }

  async verifyRefreshTokenHash(
    hashedToken: string,
    plainToken: string,
  ): Promise<boolean> {
    return argon2.verify(hashedToken, plainToken);
  }
  // ════════════════════════════════════════════════════════════
  // STEP 3 — VERIFY EMAIL
  // ════════════════════════════════════════════════════════════

  /**
   * Alur verifikasi email:
   * 1. Cari user berdasarkan email — pastikan ada dan belum terverifikasi
   * 2. Cek apakah OTP sudah kedaluwarsa (bandingkan otpExpiresAt vs now)
   * 3. Verifikasi kecocokan OTP input dengan hash di database (Argon2)
   * 4. Update status emailVerified = true & hapus OTP dari DB (atomic)
   * 5. Buat sessionId, generate token pair, hash refresh token
   * 6. Simpan sesi baru ke tabel sessions
   * 7. Kembalikan token ke client
   *
   * CATATAN KEAMANAN — Urutan pengecekan:
   * Cek expiry SEBELUM verifikasi hash Argon2. Ini penting karena
   * Argon2 sengaja lambat (cost tinggi). Jika OTP sudah expired,
   * tidak perlu buang waktu CPU untuk hashing.
   *
   * CATATAN KEAMANAN — Constant-time comparison:
   * argon2.verify() sudah constant-time secara internal, sehingga
   * tidak rentan terhadap timing attack.
   */
  async verifyEmail(dto: VerifyEmailDto): Promise<VerifyEmailResponse> {
    // ── 1. Cari User ─────────────────────────────────────────
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: {
        id: true,
        email: true,
        role: true,
        emailVerified: true,
        isActive: true,
        otpHash: true,
        otpExpiresAt: true,
      },
    });

    /**
     * Gunakan pesan error yang sama untuk kasus "user tidak ditemukan"
     * dan "OTP salah" agar tidak bocor info enumerasi akun.
     */
    const INVALID_OTP_MESSAGE =
      'Kode OTP tidak valid atau sudah kedaluwarsa. Silakan minta kode baru.';

    if (!user || !user.isActive) {
      throw new UnauthorizedException(INVALID_OTP_MESSAGE);
    }

    // ── 2. Cek Sudah Terverifikasi ───────────────────────────
    if (user.emailVerified) {
      throw new ConflictException(
        'Email ini sudah terverifikasi. Silakan login.',
      );
    }

    // ── 3. Cek OTP Ada di Database ───────────────────────────
    if (!user.otpHash || !user.otpExpiresAt) {
      throw new UnauthorizedException(INVALID_OTP_MESSAGE);
    }

    // ── 4. Cek Expiry SEBELUM Argon2 verify (hemat CPU) ──────
    const isExpired = new Date() > user.otpExpiresAt;
    if (isExpired) {
      throw new UnauthorizedException(INVALID_OTP_MESSAGE);
    }

    // ── 5. Verifikasi Hash OTP ────────────────────────────────
    const isOtpValid = await this.verifyOtp(dto.otp, user.otpHash);
    if (!isOtpValid) {
      throw new UnauthorizedException(INVALID_OTP_MESSAGE);
    }

    // ── 6. Generate Session & Tokens ─────────────────────────
    /**
     * sessionId di-generate sebelum DB transaction agar bisa
     * dimasukkan ke dalam JWT payload Refresh Token.
     * Kita gunakan cuid dari Prisma yang sudah di-install,
     * atau crypto.randomUUID() yang built-in di Node 18+.
     */
    const sessionId = crypto.randomUUID();
    const { accessToken, refreshToken } = await this.generateTokenPair(
      user.id,
      user.email,
      user.role,
      sessionId,
    );
    const refreshTokenHash = await this.hashRefreshToken(refreshToken);
    const sessionExpiresAt = new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 hari
    );

    // ── 7. Update User & Buat Session (Prisma Transaction) ───
    /**
     * Menggunakan prisma.$transaction() untuk memastikan atomicity:
     * jika salah satu operasi gagal, keduanya di-rollback.
     * Tidak boleh ada state di mana emailVerified = true tapi
     * sesi tidak terbuat, atau sebaliknya.
     */
    await this.prisma.$transaction([
      // Tandai email sebagai terverifikasi & hapus OTP dari DB
      this.prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerified: true,
          otpHash: null,        // Hapus OTP — sudah tidak diperlukan
          otpExpiresAt: null,   // Hapus expiry — bersihkan data sensitif
        },
      }),
      // Buat sesi baru
      this.prisma.session.create({
        data: {
          id: sessionId,
          userId: user.id,
          refreshTokenHash,
          expiresAt: sessionExpiresAt,
          // ipAddress & userAgent akan diisi di Step 4 (Login)
          // Di sini kita biarkan null karena verify-email tidak butuh
        },
      }),
    ]);

    this.logger.log(`Email verified and session created for user: ${user.id}`);

    // ── 8. Return Response ───────────────────────────────────
    return {
      message: 'Email berhasil diverifikasi! Selamat datang di Emerald Kingdom.',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }
}
