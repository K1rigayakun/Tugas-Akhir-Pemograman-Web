import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { randomInt, randomUUID } from "crypto";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { JwtService } from "../common/auth/jwt.service";
import { PasswordService } from "../common/auth/password.service";
import { PrismaService } from "../prisma/prisma.service";
import { TwoFactorService } from "./two-factor.service";
import { LoginDto } from "./dto/login.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { RegisterDto } from "./dto/register.dto";
import { VerifyEmailDto } from "./dto/verify-email.dto";
import {
  AuthResponse,
  AuthUser,
  LoginResponse,
  LogoutResponse,
  RefreshTokenResponse,
  RegisterResponse,
  TokenPair,
  VerifyEmailResponse,
} from "./interfaces/auth.interface";

type SessionUser = {
  id: string;
  email: string;
  username: string;
  rank: string;
  adminRole: string | null;
};

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly otpTtlMs = 10 * 60 * 1000;
  private readonly refreshTtlSeconds: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly passwordService: PasswordService,
    private readonly configService: ConfigService,
    private readonly twoFactorService: TwoFactorService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.refreshTtlSeconds = Number(
      this.configService.get<string>("JWT_REFRESH_TTL") || "604800",
    );
  }

  async register(dto: RegisterDto): Promise<RegisterResponse> {
    const email = this.normalizeEmail(dto.email);
    const existing = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException("Email sudah terdaftar.");
    }

    const otp = this.generateOtp();
    const [passwordHash, otpHash, username] = await Promise.all([
      this.passwordService.hash(dto.password),
      this.passwordService.hash(otp),
      this.generateUsername(email),
    ]);

    try {
      const user = await this.prisma.user.create({
        data: {
          email,
          username,
          passwordHash,
          otpHash,
          otpExpiresAt: new Date(Date.now() + this.otpTtlMs),
          walletAccount: { create: {} },
        },
        select: { id: true, email: true },
      });

      await this.sendOtpEmail(user.email, otp);

      return {
        message: "Registrasi berhasil. Verifikasi email dengan kode OTP.",
        userId: user.id,
        email: user.email,
        ...(this.isDevelopment() ? { devOtp: otp } : {}),
      };
    } catch (error) {
      if ((error as { code?: string }).code === "P2002") {
        throw new ConflictException("Email atau username sudah terdaftar.");
      }
      throw error;
    }
  }

  async verifyEmail(
    dto: VerifyEmailDto,
    ipAddress: string,
    userAgent: string,
  ): Promise<VerifyEmailResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: this.normalizeEmail(dto.email) },
    });

    if (!user || !user.otpHash || !user.otpExpiresAt) {
      throw new UnauthorizedException("Kode OTP tidak valid atau sudah kedaluwarsa.");
    }
    if (user.emailVerified) {
      throw new ConflictException("Email sudah terverifikasi.");
    }
    if (user.otpExpiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException("Kode OTP tidak valid atau sudah kedaluwarsa.");
    }

    const validOtp = await this.passwordService.verify(user.otpHash, dto.otp.trim());
    if (!validOtp) {
      throw new UnauthorizedException("Kode OTP tidak valid atau sudah kedaluwarsa.");
    }

    const sessionId = randomUUID();
    const tokens = await this.createTokenPair(user, sessionId);
    const refreshTokenHash = await this.passwordService.hash(tokens.refreshToken);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerified: true,
          otpHash: null,
          otpExpiresAt: null,
          lastActiveAt: new Date(),
        },
      }),
      this.prisma.session.create({
        data: {
          id: sessionId,
          userId: user.id,
          refreshTokenHash,
          expiresAt: this.refreshExpiry(),
          ipAddress,
          userAgent,
          deviceInfo: userAgent,
        },
      }),
    ]);

    return this.authResponse("Email berhasil diverifikasi.", user, tokens);
  }

  async login(
    dto: LoginDto,
    ipAddress: string,
    userAgent: string,
  ): Promise<LoginResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: this.normalizeEmail(dto.email) },
    });

    if (!user || !(await this.passwordService.verify(user.passwordHash, dto.password))) {
      throw new UnauthorizedException("Email atau password tidak valid.");
    }
    if (!user.emailVerified) {
      throw new ForbiddenException("Verifikasi email sebelum login.");
    }
    if (user.isSuspended || user.deletedAt) {
      throw new ForbiddenException("Akun tidak aktif.");
    }

    // Jika 2FA sudah di-reset (disabled + no secret), skip 2FA dan langsung beri token
    if (!user.twoFactorEnabled && !user.twoFactorSecret) {
      const sessionId = randomUUID();
      const refreshTokenHash = await this.passwordService.hash(randomUUID());
      await Promise.all([
        this.prisma.user.update({
          where: { id: user.id },
          data: { lastActiveAt: new Date() },
        }),
        this.prisma.session.create({
          data: {
            id: sessionId,
            userId: user.id,
            refreshTokenHash,
            expiresAt: this.refreshExpiry(),
            ipAddress,
            userAgent,
            deviceInfo: userAgent,
          },
        }),
      ]);
      const tokens = await this.createTokenPair(user as SessionUser, sessionId);
      return this.authResponse("Login berhasil.", user as SessionUser, tokens);
    }

    if (!user.twoFactorEnabled) {
      // Setup 2FA required
      const { secret, qrCodeUrl } = await this.twoFactorService.generateTwoFactorSecret(user);
      const tempToken = this.jwtService.sign(
        { sub: user.id, type: "2fa_setup" },
        600 // 10 menit
      );
      return {
        requires2fa: true,
        requires2faSetup: true,
        tempToken,
        qrCodeUrl,
        secret,
        message: "Silakan setup Double Verification (2FA) Anda.",
      };
    }

    // 2FA Enabled, need verification
    const tempToken = this.jwtService.sign(
      { sub: user.id, type: "2fa_verify" },
      300 // 5 menit
    );
    
    return {
      requires2fa: true,
      requires2faSetup: false,
      tempToken,
      message: "Silakan masukkan kode Authenticator Anda.",
    };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        avatarUrl: true,
        rank: true,
        kycStatus: true,
        totalExp: true,
        totalWins: true,
        totalBids: true,
        winStreak: true,
        longestStreak: true,
        activeTitle: true,
        activeCoatFrame: true,
        activeNameEffect: true,
        activeWalletSkin: true,
        activeWebCodeId: true,
        activeBannerId: true,
        twoFactorEnabled: true,
        privacyMode: true,
        createdAt: true,
        lastActiveAt: true,
      },
    });
    if (!user) throw new NotFoundException("User tidak ditemukan.");
    return user;
  }

  async myCosmetics(userId: string) {
    const list = await this.prisma.userCosmetic.findMany({
      where: { userId },
      include: {
        cosmetic: true
      }
    });
    return list.map(item => item.cosmetic);
  }

  async changeUsername(userId: string, newUsername: string) {
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(newUsername)) {
      throw new BadRequestException("Username hanya boleh mengandung huruf, angka, underscore, dan 3-20 karakter.");
    }

    // Cek ketersediaan username
    const existing = await this.prisma.user.findUnique({
      where: { username: newUsername }
    });
    if (existing) {
      throw new BadRequestException("Username sudah terpakai.");
    }

    const COST = 500;

    return await this.prisma.$transaction(async (tx) => {
      const wallet = await tx.walletAccount.findUnique({
        where: { userId }
      });

      if (!wallet || wallet.balance < COST) {
        throw new BadRequestException(`Saldo tidak cukup. Dibutuhkan ${COST} CC.`);
      }

      // Potong saldo
      await tx.walletAccount.update({
        where: { userId },
        data: {
          balance: { decrement: COST },
          totalSpent: { increment: COST }
        }
      });

      // Catat transaksi
      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: "SHOP_PURCHASE",
          amount: COST,
          description: `Pembelian Name Change: ${newUsername}`,
          idempotencyKey: `name_change_${userId}_${Date.now()}`
        }
      });

      // Ubah username
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { username: newUsername }
      });

      return {
        success: true,
        message: "Username berhasil diubah.",
        newUsername: updatedUser.username
      };
    });
  }

  async changeAvatar(userId: string, avatarUrl: string) {
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl }
    });

    return {
      success: true,
      message: "Avatar berhasil diubah.",
      avatarUrl: updatedUser.avatarUrl
    };
  }

  // Helper function to finalize login after 2FA is verified
  async finalizeLogin(userId: string, ipAddress: string, userAgent: string): Promise<LoginResponse> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new UnauthorizedException("User tidak ditemukan.");

    const knownDevice = await this.prisma.session.findFirst({
      where: { userId: user.id, ipAddress, userAgent, isActive: true },
      select: { id: true },
    });
    const sessionId = randomUUID();
    const tokens = await this.createTokenPair(user, sessionId);
    const refreshTokenHash = await this.passwordService.hash(tokens.refreshToken);

    await this.prisma.$transaction([
      this.prisma.session.create({
        data: {
          id: sessionId,
          userId: user.id,
          refreshTokenHash,
          expiresAt: this.refreshExpiry(),
          ipAddress,
          userAgent,
          deviceInfo: userAgent,
        },
      }),
      ...(!knownDevice
        ? [
            this.prisma.notification.create({
              data: {
                userId: user.id,
                type: "SECURITY_ALERT",
                payload: { ipAddress, userAgent },
              },
            }),
          ]
        : []),
    ]);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { 
        lastActiveAt: new Date(),
      },
    });
    
    this.eventEmitter.emit("user.login", {
      userId: user.id,
      loginCount: 1, // Optional: tracking precise count if needed
    });

    return this.authResponse("Login berhasil.", user, tokens);
  }

  async refreshToken(dto: RefreshTokenDto): Promise<RefreshTokenResponse> {
    const payload = this.jwtService.verify(dto.refreshToken);
    const sessionId = payload?.sessionId;

    if (payload?.type !== "refresh" || typeof sessionId !== "string") {
      throw new UnauthorizedException("Refresh token tidak valid.");
    }

    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: { user: true },
    });

    if (
      !session ||
      !session.isActive ||
      !session.refreshTokenHash ||
      !session.expiresAt ||
      session.expiresAt.getTime() < Date.now()
    ) {
      throw new UnauthorizedException("Sesi tidak aktif atau sudah kedaluwarsa.");
    }
    if (session.user.isSuspended || session.user.deletedAt) {
      throw new ForbiddenException("Akun tidak aktif.");
    }

    const valid = await this.passwordService.verify(
      session.refreshTokenHash,
      dto.refreshToken,
    );
    if (!valid) {
      await this.prisma.session.updateMany({
        where: { userId: session.userId },
        data: { isActive: false },
      });
      throw new UnauthorizedException("Refresh token tidak valid.");
    }

    const newSessionId = randomUUID();
    const tokens = await this.createTokenPair(session.user, newSessionId);
    const refreshTokenHash = await this.passwordService.hash(tokens.refreshToken);

    await this.prisma.$transaction([
      this.prisma.session.update({
        where: { id: session.id },
        data: { isActive: false, lastActiveAt: new Date() },
      }),
      this.prisma.session.create({
        data: {
          id: newSessionId,
          userId: session.userId,
          refreshTokenHash,
          expiresAt: this.refreshExpiry(),
          ipAddress: session.ipAddress,
          userAgent: session.userAgent,
          deviceInfo: session.deviceInfo,
        },
      }),
    ]);

    return tokens;
  }

  async logout(dto: RefreshTokenDto): Promise<LogoutResponse> {
    const payload = this.jwtService.verify(dto.refreshToken);
    const sessionId = payload?.sessionId;

    if (payload?.type === "refresh" && typeof sessionId === "string") {
      await this.prisma.session.updateMany({
        where: { id: sessionId, userId: payload.sub as string },
        data: { isActive: false, lastActiveAt: new Date() },
      });
    }

    return { message: "Logout berhasil." };
  }

  /**
   * Logout all active sessions for a user
   * Used by the new logout endpoint that follows the design spec
   */
  async logoutAllSessions(userId: string): Promise<void> {
    await this.prisma.session.updateMany({
      where: {
        userId: userId,
        isActive: true,
      },
      data: {
        isActive: false,
        refreshTokenHash: null,
      },
    });
  }

  listSessions(userId: string) {
    return this.prisma.session.findMany({
      where: { userId, isActive: true },
      select: {
        id: true,
        ipAddress: true,
        userAgent: true,
        deviceInfo: true,
        createdAt: true,
        lastActiveAt: true,
        expiresAt: true,
      },
      orderBy: { lastActiveAt: "desc" },
    });
  }

  async revokeSession(userId: string, sessionId: string) {
    const result = await this.prisma.session.updateMany({
      where: { id: sessionId, userId, isActive: true },
      data: { isActive: false, lastActiveAt: new Date() },
    });
    if (!result.count) throw new NotFoundException("Sesi aktif tidak ditemukan.");
    return { success: true };
  }

  private async createTokenPair(
    user: SessionUser,
    sessionId: string,
  ): Promise<TokenPair> {
    return {
      accessToken: this.jwtService.generateAccessToken({
        userId: user.id,
        email: user.email,
        role: user.rank,
        adminRole: user.adminRole || undefined,
      }),
      refreshToken: this.jwtService.generateRefreshToken(user.id, sessionId),
    };
  }

  private authResponse(
    message: string,
    user: SessionUser,
    tokens: TokenPair,
  ): AuthResponse {
    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      username: user.username,
      rank: user.rank,
    };
    return { message, ...tokens, user: authUser };
  }

  private async generateUsername(email: string): Promise<string> {
    const base =
      email
        .split("@")[0]
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, "")
        .slice(0, 20) || "user";

    for (let attempt = 0; attempt < 10; attempt += 1) {
      const candidate = `${base}_${randomInt(1000, 1_000_000)}`;
      const exists = await this.prisma.user.findUnique({
        where: { username: candidate },
        select: { id: true },
      });
      if (!exists) return candidate;
    }

    return `user_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
  }

  private generateOtp(): string {
    return randomInt(0, 1_000_000).toString().padStart(6, "0");
  }

  private normalizeEmail(email: string): string {
    return email.toLowerCase().trim();
  }

  private refreshExpiry(): Date {
    return new Date(Date.now() + this.refreshTtlSeconds * 1000);
  }

  private isDevelopment(): boolean {
    return this.configService.get<string>("NODE_ENV") !== "production";
  }

  private async sendOtpEmail(email: string, otp: string): Promise<void> {
    const apiKey = this.configService.get<string>("RESEND_API_KEY");
    if (!apiKey || apiKey.startsWith("re_your_")) {
      this.logger.warn(`RESEND_API_KEY belum aktif. OTP development untuk ${email}: ${otp}`);
      return;
    }

    const from = this.configService.get<string>(
      "EMAIL_FROM",
      "noreply@emeraldkingdom.com",
    );
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `Emerald Kingdom <${from}>`,
        to: [email],
        subject: "Kode verifikasi Emerald Kingdom",
        html: `<p>Kode verifikasi Anda:</p><h1>${otp}</h1><p>Berlaku selama 10 menit.</p>`,
      }),
    });

    if (!response.ok) {
      this.logger.error(`Gagal mengirim OTP ke ${email}: HTTP ${response.status}`);
    }
  }
}

