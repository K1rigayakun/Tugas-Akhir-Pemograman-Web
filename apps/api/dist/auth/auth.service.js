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
const config_1 = require("@nestjs/config");
const crypto_1 = require("crypto");
const event_emitter_1 = require("@nestjs/event-emitter");
const jwt_service_1 = require("../common/auth/jwt.service");
const password_service_1 = require("../common/auth/password.service");
const prisma_service_1 = require("../prisma/prisma.service");
const two_factor_service_1 = require("./two-factor.service");
let AuthService = AuthService_1 = class AuthService {
    constructor(prisma, jwtService, passwordService, configService, twoFactorService, eventEmitter) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.passwordService = passwordService;
        this.configService = configService;
        this.twoFactorService = twoFactorService;
        this.eventEmitter = eventEmitter;
        this.logger = new common_1.Logger(AuthService_1.name);
        this.otpTtlMs = 10 * 60 * 1000;
        this.refreshTtlSeconds = Number(this.configService.get("JWT_REFRESH_TTL") || "604800");
    }
    async register(dto) {
        const email = this.normalizeEmail(dto.email);
        const existing = await this.prisma.user.findUnique({
            where: { email },
            select: { id: true },
        });
        if (existing) {
            throw new common_1.ConflictException("Email sudah terdaftar.");
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
        }
        catch (error) {
            if (error.code === "P2002") {
                throw new common_1.ConflictException("Email atau username sudah terdaftar.");
            }
            throw error;
        }
    }
    async verifyEmail(dto, ipAddress, userAgent) {
        const user = await this.prisma.user.findUnique({
            where: { email: this.normalizeEmail(dto.email) },
        });
        if (!user || !user.otpHash || !user.otpExpiresAt) {
            throw new common_1.UnauthorizedException("Kode OTP tidak valid atau sudah kedaluwarsa.");
        }
        if (user.emailVerified) {
            throw new common_1.ConflictException("Email sudah terverifikasi.");
        }
        if (user.otpExpiresAt.getTime() < Date.now()) {
            throw new common_1.UnauthorizedException("Kode OTP tidak valid atau sudah kedaluwarsa.");
        }
        const validOtp = await this.passwordService.verify(user.otpHash, dto.otp.trim());
        if (!validOtp) {
            throw new common_1.UnauthorizedException("Kode OTP tidak valid atau sudah kedaluwarsa.");
        }
        const sessionId = (0, crypto_1.randomUUID)();
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
    async login(dto, ipAddress, userAgent) {
        const user = await this.prisma.user.findUnique({
            where: { email: this.normalizeEmail(dto.email) },
        });
        if (!user || !(await this.passwordService.verify(user.passwordHash, dto.password))) {
            throw new common_1.UnauthorizedException("Email atau password tidak valid.");
        }
        if (!user.emailVerified) {
            throw new common_1.ForbiddenException("Verifikasi email sebelum login.");
        }
        if (user.isSuspended || user.deletedAt) {
            throw new common_1.ForbiddenException("Akun tidak aktif.");
        }
        if (!user.twoFactorEnabled) {
            // Setup 2FA required
            const { secret, qrCodeUrl } = await this.twoFactorService.generateTwoFactorSecret(user);
            const tempToken = this.jwtService.sign({ sub: user.id, type: "2fa_setup" }, 600 // 10 menit
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
        const tempToken = this.jwtService.sign({ sub: user.id, type: "2fa_verify" }, 300 // 5 menit
        );
        return {
            requires2fa: true,
            requires2faSetup: false,
            tempToken,
            message: "Silakan masukkan kode Authenticator Anda.",
        };
    }
    async getProfile(userId) {
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
        if (!user)
            throw new common_1.NotFoundException("User tidak ditemukan.");
        return user;
    }
    async myCosmetics(userId) {
        const list = await this.prisma.userCosmetic.findMany({
            where: { userId },
            include: {
                cosmetic: true
            }
        });
        return list.map(item => item.cosmetic);
    }
    async changeUsername(userId, newUsername) {
        const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
        if (!usernameRegex.test(newUsername)) {
            throw new common_1.BadRequestException("Username hanya boleh mengandung huruf, angka, underscore, dan 3-20 karakter.");
        }
        // Cek ketersediaan username
        const existing = await this.prisma.user.findUnique({
            where: { username: newUsername }
        });
        if (existing) {
            throw new common_1.BadRequestException("Username sudah terpakai.");
        }
        const COST = 500;
        return await this.prisma.$transaction(async (tx) => {
            const wallet = await tx.walletAccount.findUnique({
                where: { userId }
            });
            if (!wallet || wallet.balance < COST) {
                throw new common_1.BadRequestException(`Saldo tidak cukup. Dibutuhkan ${COST} CC.`);
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
    async changeAvatar(userId, avatarUrl) {
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
    async finalizeLogin(userId, ipAddress, userAgent) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user)
            throw new common_1.UnauthorizedException("User tidak ditemukan.");
        const knownDevice = await this.prisma.session.findFirst({
            where: { userId: user.id, ipAddress, userAgent, isActive: true },
            select: { id: true },
        });
        const sessionId = (0, crypto_1.randomUUID)();
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
    async refreshToken(dto) {
        const payload = this.jwtService.verify(dto.refreshToken);
        const sessionId = payload?.sessionId;
        if (payload?.type !== "refresh" || typeof sessionId !== "string") {
            throw new common_1.UnauthorizedException("Refresh token tidak valid.");
        }
        const session = await this.prisma.session.findUnique({
            where: { id: sessionId },
            include: { user: true },
        });
        if (!session ||
            !session.isActive ||
            !session.refreshTokenHash ||
            !session.expiresAt ||
            session.expiresAt.getTime() < Date.now()) {
            throw new common_1.UnauthorizedException("Sesi tidak aktif atau sudah kedaluwarsa.");
        }
        if (session.user.isSuspended || session.user.deletedAt) {
            throw new common_1.ForbiddenException("Akun tidak aktif.");
        }
        const valid = await this.passwordService.verify(session.refreshTokenHash, dto.refreshToken);
        if (!valid) {
            await this.prisma.session.updateMany({
                where: { userId: session.userId },
                data: { isActive: false },
            });
            throw new common_1.UnauthorizedException("Refresh token tidak valid.");
        }
        const newSessionId = (0, crypto_1.randomUUID)();
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
    async logout(dto) {
        const payload = this.jwtService.verify(dto.refreshToken);
        const sessionId = payload?.sessionId;
        if (payload?.type === "refresh" && typeof sessionId === "string") {
            await this.prisma.session.updateMany({
                where: { id: sessionId, userId: payload.sub },
                data: { isActive: false, lastActiveAt: new Date() },
            });
        }
        return { message: "Logout berhasil." };
    }
    /**
     * Logout all active sessions for a user
     * Used by the new logout endpoint that follows the design spec
     */
    async logoutAllSessions(userId) {
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
    listSessions(userId) {
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
    async revokeSession(userId, sessionId) {
        const result = await this.prisma.session.updateMany({
            where: { id: sessionId, userId, isActive: true },
            data: { isActive: false, lastActiveAt: new Date() },
        });
        if (!result.count)
            throw new common_1.NotFoundException("Sesi aktif tidak ditemukan.");
        return { success: true };
    }
    async createTokenPair(user, sessionId) {
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
    authResponse(message, user, tokens) {
        const authUser = {
            id: user.id,
            email: user.email,
            username: user.username,
            rank: user.rank,
        };
        return { message, ...tokens, user: authUser };
    }
    async generateUsername(email) {
        const base = email
            .split("@")[0]
            .toLowerCase()
            .replace(/[^a-z0-9_]/g, "")
            .slice(0, 20) || "user";
        for (let attempt = 0; attempt < 10; attempt += 1) {
            const candidate = `${base}_${(0, crypto_1.randomInt)(1000, 1000000)}`;
            const exists = await this.prisma.user.findUnique({
                where: { username: candidate },
                select: { id: true },
            });
            if (!exists)
                return candidate;
        }
        return `user_${(0, crypto_1.randomUUID)().replace(/-/g, "").slice(0, 16)}`;
    }
    generateOtp() {
        return (0, crypto_1.randomInt)(0, 1000000).toString().padStart(6, "0");
    }
    normalizeEmail(email) {
        return email.toLowerCase().trim();
    }
    refreshExpiry() {
        return new Date(Date.now() + this.refreshTtlSeconds * 1000);
    }
    isDevelopment() {
        return this.configService.get("NODE_ENV") !== "production";
    }
    async sendOtpEmail(email, otp) {
        const apiKey = this.configService.get("RESEND_API_KEY");
        if (!apiKey || apiKey.startsWith("re_your_")) {
            this.logger.warn(`RESEND_API_KEY belum aktif. OTP development untuk ${email}: ${otp}`);
            return;
        }
        const from = this.configService.get("EMAIL_FROM", "noreply@emeraldkingdom.com");
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
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_service_1.JwtService,
        password_service_1.PasswordService,
        config_1.ConfigService,
        two_factor_service_1.TwoFactorService,
        event_emitter_1.EventEmitter2])
], AuthService);
//# sourceMappingURL=auth.service.js.map