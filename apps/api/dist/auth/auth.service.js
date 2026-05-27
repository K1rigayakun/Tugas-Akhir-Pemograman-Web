"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const argon2 = require("argon2");
const crypto = require("crypto");
const resend_1 = require("resend");
const prisma_service_1 = require("../prisma/prisma.service");
let AuthService = AuthService_1 = class AuthService {
    constructor(prisma, jwtService, configService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
        this.logger = new common_1.Logger(AuthService_1.name);
        this.argon2Options = {
            type: argon2.argon2id,
            memoryCost: 2 ** 16,
            timeCost: 3,
            parallelism: 4,
        };
        this.OTP_TTL_MS = 10 * 60 * 1000;
        this.resend = new resend_1.Resend(this.configService.get('RESEND_API_KEY'));
    }
    async register(dto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email },
            select: { id: true },
        });
        if (existingUser) {
            throw new common_1.ConflictException('Email ini sudah terdaftar. Silakan gunakan email lain atau login.');
        }
        const passwordHash = await this.hashPassword(dto.password);
        const { plainOtp, otpHash, otpExpiresAt } = await this.generateOtp();
        let newUser;
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
        }
        catch (error) {
            if (error.code === 'P2002') {
                throw new common_1.ConflictException('Email ini sudah terdaftar. Silakan gunakan email lain atau login.');
            }
            this.logger.error('Failed to create user', error);
            throw new common_1.InternalServerErrorException('Gagal membuat akun. Silakan coba lagi.');
        }
        this.sendOtpEmail(newUser.email, plainOtp).catch((err) => {
            this.logger.error(`Failed to send OTP email to ${newUser.email}`, err instanceof Error ? err.stack : err);
        });
        return {
            message: 'Registrasi berhasil! Kode OTP telah dikirim ke email Anda. Kode berlaku selama 10 menit.',
            userId: newUser.id,
            email: newUser.email,
        };
    }
    async generateOtp() {
        const plainOtp = crypto.randomInt(0, 1_000_000).toString().padStart(6, '0');
        const otpHash = await argon2.hash(plainOtp, {
            ...this.argon2Options,
            memoryCost: 2 ** 14,
            timeCost: 2,
        });
        const otpExpiresAt = new Date(Date.now() + this.OTP_TTL_MS);
        return { plainOtp, otpHash, otpExpiresAt };
    }
    async verifyOtp(plainOtp, otpHash) {
        try {
            return await argon2.verify(otpHash, plainOtp);
        }
        catch {
            return false;
        }
    }
    async sendOtpEmail(toEmail, otp) {
        const fromEmail = this.configService.get('EMAIL_FROM', 'noreply@emeraldkingdom.com');
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
            throw new Error(`Resend API error: ${JSON.stringify(error)}`);
        }
        this.logger.log(`OTP email sent successfully to ${toEmail}`);
    }
    async sendSecurityAlertEmail(toEmail, ipAddress, userAgent) {
        const fromEmail = this.configService.get('EMAIL_FROM', 'noreply@emeraldkingdom.com');
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
    buildOtpEmailHtml(otp, expiryMinutes, appName) {
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
    buildOtpEmailText(otp, expiryMinutes, appName) {
        return `
${appName} — Verifikasi Email

Kode OTP Anda: ${otp}

Kode ini berlaku selama ${expiryMinutes} menit.
Jangan bagikan kode ini kepada siapapun.

Jika Anda tidak mendaftar di ${appName}, abaikan email ini.

© ${new Date().getFullYear()} ${appName}
    `.trim();
    }
    buildSecurityAlertHtml(ipAddress, userAgent, appName) {
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
    buildSecurityAlertText(ipAddress, userAgent, appName) {
        return `
[${appName}] PERINGATAN KEAMANAN — Login dari Perangkat Baru

IP Address : ${ipAddress}
Perangkat  : ${userAgent}
Waktu      : ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB

Jika ini bukan Anda, segera ubah password dan hubungi tim ${appName}.
    `.trim();
    }
    async hashPassword(plainPassword) {
        try {
            return await argon2.hash(plainPassword, this.argon2Options);
        }
        catch (error) {
            this.logger.error('Failed to hash password', error);
            throw new common_1.InternalServerErrorException('Password processing failed');
        }
    }
    async verifyPassword(hashedPassword, plainPassword) {
        try {
            return await argon2.verify(hashedPassword, plainPassword);
        }
        catch (error) {
            this.logger.error('Failed to verify password', error);
            return false;
        }
    }
    async generateTokenPair(userId, email, role, sessionId) {
        const accessPayload = {
            sub: userId,
            email,
            role,
            type: 'access',
        };
        const refreshPayload = {
            sub: userId,
            type: 'refresh',
            sessionId,
        };
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(accessPayload, {
                secret: this.configService.get('JWT_ACCESS_SECRET'),
                expiresIn: this.configService.get('JWT_ACCESS_EXPIRES_IN', '15m'),
            }),
            this.jwtService.signAsync(refreshPayload, {
                secret: this.configService.get('JWT_REFRESH_SECRET'),
                expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '30d'),
            }),
        ]);
        return { accessToken, refreshToken };
    }
    async verifyAccessToken(token) {
        return this.jwtService.verifyAsync(token, {
            secret: this.configService.get('JWT_ACCESS_SECRET'),
            issuer: 'emerald-kingdom',
            audience: 'emerald-kingdom-client',
        });
    }
    async verifyRefreshToken(token) {
        return this.jwtService.verifyAsync(token, {
            secret: this.configService.get('JWT_REFRESH_SECRET'),
        });
    }
    async hashRefreshToken(refreshToken) {
        return argon2.hash(refreshToken, {
            ...this.argon2Options,
            memoryCost: 2 ** 14,
        });
    }
    async verifyRefreshTokenHash(hashedToken, plainToken) {
        return argon2.verify(hashedToken, plainToken);
    }
    async verifyEmail(dto) {
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
        const INVALID_OTP_MESSAGE = 'Kode OTP tidak valid atau sudah kedaluwarsa. Silakan minta kode baru.';
        if (!user || !user.isActive) {
            throw new common_1.UnauthorizedException(INVALID_OTP_MESSAGE);
        }
        if (user.emailVerified) {
            throw new common_1.ConflictException('Email ini sudah terverifikasi. Silakan login.');
        }
        if (!user.otpHash || !user.otpExpiresAt) {
            throw new common_1.UnauthorizedException(INVALID_OTP_MESSAGE);
        }
        const isExpired = new Date() > user.otpExpiresAt;
        if (isExpired) {
            throw new common_1.UnauthorizedException(INVALID_OTP_MESSAGE);
        }
        const isOtpValid = await this.verifyOtp(dto.otp, user.otpHash);
        if (!isOtpValid) {
            throw new common_1.UnauthorizedException(INVALID_OTP_MESSAGE);
        }
        const sessionId = crypto.randomUUID();
        const { accessToken, refreshToken } = await this.generateTokenPair(user.id, user.email, user.role, sessionId);
        const refreshTokenHash = await this.hashRefreshToken(refreshToken);
        const sessionExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        await this.prisma.$transaction([
            this.prisma.user.update({
                where: { id: user.id },
                data: {
                    emailVerified: true,
                    otpHash: null,
                    otpExpiresAt: null,
                },
            }),
            this.prisma.session.create({
                data: {
                    id: sessionId,
                    userId: user.id,
                    refreshTokenHash,
                    expiresAt: sessionExpiresAt,
                },
            }),
        ]);
        this.logger.log(`Email verified and session created for user: ${user.id}`);
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
    async login(dto, ipAddress, userAgent) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
            select: {
                id: true,
                email: true,
                role: true,
                passwordHash: true,
                emailVerified: true,
                isActive: true,
            },
        });
        const DUMMY_HASH = '$argon2id$v=19$m=65536,t=3,p=4$dummysaltdummysalt$dummyhashvaluefordummypurposes';
        const passwordToVerify = user?.passwordHash ?? DUMMY_HASH;
        const isPasswordValid = await this.verifyPassword(passwordToVerify, dto.password);
        if (!user || !isPasswordValid) {
            throw new common_1.UnauthorizedException('Email atau password yang Anda masukkan salah.');
        }
        if (!user.isActive) {
            throw new common_1.ForbiddenException('Akun Anda telah dinonaktifkan. Hubungi tim support.');
        }
        if (!user.emailVerified) {
            throw new common_1.ForbiddenException('Email Anda belum diverifikasi. Silakan cek inbox dan masukkan kode OTP.');
        }
        const lastSession = await this.prisma.session.findFirst({
            where: { userId: user.id, isActive: true },
            orderBy: { createdAt: 'desc' },
            select: { ipAddress: true, userAgent: true },
        });
        const isNewDevice = lastSession &&
            (lastSession.ipAddress !== ipAddress ||
                lastSession.userAgent !== userAgent);
        if (isNewDevice) {
            this.sendSecurityAlertEmail(user.email, ipAddress, userAgent).catch((err) => {
                this.logger.error(`Failed to send security alert to ${user.email}`, err instanceof Error ? err.stack : err);
            });
        }
        const sessionId = crypto.randomUUID();
        const { accessToken, refreshToken } = await this.generateTokenPair(user.id, user.email, user.role, sessionId);
        const refreshTokenHash = await this.hashRefreshToken(refreshToken);
        const sessionExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        await this.prisma.session.create({
            data: {
                id: sessionId,
                userId: user.id,
                refreshTokenHash,
                ipAddress,
                userAgent,
                expiresAt: sessionExpiresAt,
            },
        });
        this.logger.log(`User logged in: ${user.id} | IP: ${ipAddress}`);
        return {
            message: 'Login berhasil. Selamat datang kembali!',
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
            },
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map