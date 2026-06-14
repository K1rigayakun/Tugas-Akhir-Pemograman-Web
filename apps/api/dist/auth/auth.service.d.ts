import { ConfigService } from "@nestjs/config";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { JwtService } from "../common/auth/jwt.service";
import { PasswordService } from "../common/auth/password.service";
import { PrismaService } from "../prisma/prisma.service";
import { TwoFactorService } from "./two-factor.service";
import { LoginDto } from "./dto/login.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { RegisterDto } from "./dto/register.dto";
import { VerifyEmailDto } from "./dto/verify-email.dto";
import { LoginResponse, LogoutResponse, RefreshTokenResponse, RegisterResponse, VerifyEmailResponse } from "./interfaces/auth.interface";
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    private readonly passwordService;
    private readonly configService;
    private readonly twoFactorService;
    private readonly eventEmitter;
    private readonly logger;
    private readonly otpTtlMs;
    private readonly refreshTtlSeconds;
    constructor(prisma: PrismaService, jwtService: JwtService, passwordService: PasswordService, configService: ConfigService, twoFactorService: TwoFactorService, eventEmitter: EventEmitter2);
    register(dto: RegisterDto): Promise<RegisterResponse>;
    verifyEmail(dto: VerifyEmailDto, ipAddress: string, userAgent: string): Promise<VerifyEmailResponse>;
    login(dto: LoginDto, ipAddress: string, userAgent: string): Promise<LoginResponse>;
    getProfile(userId: string): Promise<{
        id: string;
        email: string;
        username: string;
        rank: import(".prisma/client").$Enums.Rank;
        totalExp: number;
        winStreak: number;
        longestStreak: number;
        totalWins: number;
        totalBids: number;
        kycStatus: import(".prisma/client").$Enums.KYCStatus;
        privacyMode: import(".prisma/client").$Enums.PrivacyMode;
        twoFactorEnabled: boolean;
        activeTitle: string | null;
        activeCoatFrame: string | null;
        activeNameEffect: string | null;
        activeWalletSkin: string | null;
        createdAt: Date;
        lastActiveAt: Date;
        activeWebCodeId: string | null;
        activeBannerId: string | null;
        avatarUrl: string | null;
    }>;
    myCosmetics(userId: string): Promise<{
        id: string;
        name: string;
        type: import(".prisma/client").$Enums.CosmeticType;
        rarity: import(".prisma/client").$Enums.CosmeticRarity;
        imageUrl: string;
        previewUrl: string | null;
        obtainMethod: import(".prisma/client").$Enums.ObtainMethod;
        webCode: string | null;
        description: string | null;
        linkedAchievementId: string | null;
        linkedEventName: string | null;
        requiredRank: import(".prisma/client").$Enums.Rank | null;
        shopPrice: number | null;
        splineUrl: string | null;
    }[]>;
    changeUsername(userId: string, newUsername: string): Promise<{
        success: boolean;
        message: string;
        newUsername: string;
    }>;
    changeAvatar(userId: string, avatarUrl: string): Promise<{
        success: boolean;
        message: string;
        avatarUrl: string | null;
    }>;
    finalizeLogin(userId: string, ipAddress: string, userAgent: string): Promise<LoginResponse>;
    refreshToken(dto: RefreshTokenDto): Promise<RefreshTokenResponse>;
    logout(dto: RefreshTokenDto): Promise<LogoutResponse>;
    /**
     * Logout all active sessions for a user
     * Used by the new logout endpoint that follows the design spec
     */
    logoutAllSessions(userId: string): Promise<void>;
    listSessions(userId: string): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        lastActiveAt: Date;
        expiresAt: Date | null;
        deviceInfo: string | null;
        ipAddress: string | null;
        userAgent: string | null;
    }[]>;
    revokeSession(userId: string, sessionId: string): Promise<{
        success: boolean;
    }>;
    private createTokenPair;
    private authResponse;
    private generateUsername;
    private generateOtp;
    private normalizeEmail;
    private refreshExpiry;
    private isDevelopment;
    private sendOtpEmail;
}
//# sourceMappingURL=auth.service.d.ts.map