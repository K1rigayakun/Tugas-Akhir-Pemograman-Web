import { Request } from "express";
import { AuthService } from "./auth.service";
import { TwoFactorService } from "./two-factor.service";
import { JwtService } from "../common/auth/jwt.service";
import { LoginDto } from "./dto/login.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { RegisterDto } from "./dto/register.dto";
import { VerifyEmailDto } from "./dto/verify-email.dto";
export declare class AuthController {
    private readonly authService;
    private readonly twoFactorService;
    private readonly jwtService;
    constructor(authService: AuthService, twoFactorService: TwoFactorService, jwtService: JwtService);
    register(dto: RegisterDto): Promise<import("./interfaces/auth.interface").RegisterResponse>;
    verifyEmail(dto: VerifyEmailDto, request: Request): Promise<import("./interfaces/auth.interface").AuthResponse>;
    login(dto: LoginDto, request: Request): Promise<import("./interfaces/auth.interface").LoginResponse>;
    refresh(dto: RefreshTokenDto): Promise<import("./interfaces/auth.interface").TokenPair>;
    logout(request: Request & {
        user: {
            id: string;
        };
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    setup2fa(dto: {
        tempToken: string;
        code: string;
    }, request: Request): Promise<import("./interfaces/auth.interface").LoginResponse>;
    verify2fa(dto: {
        tempToken: string;
        code: string;
    }, request: Request): Promise<import("./interfaces/auth.interface").LoginResponse>;
    sessions(request: Request & {
        user: {
            id: string;
        };
    }): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        lastActiveAt: Date;
        expiresAt: Date | null;
        deviceInfo: string | null;
        ipAddress: string | null;
        userAgent: string | null;
    }[]>;
    revokeSession(request: Request & {
        user: {
            id: string;
        };
    }, sessionId: string): Promise<{
        success: boolean;
    }>;
    me(request: Request & {
        user: {
            id: string;
        };
    }): Promise<{
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
    myCosmetics(request: Request & {
        user: {
            id: string;
        };
    }): Promise<{
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
    changeUsername(request: Request & {
        user: {
            id: string;
        };
    }, dto: {
        newUsername: string;
    }): Promise<{
        success: boolean;
        message: string;
        newUsername: string;
    }>;
    changeAvatar(request: Request & {
        user: {
            id: string;
        };
    }, dto: {
        avatarUrl: string;
    }): Promise<{
        success: boolean;
        message: string;
        avatarUrl: string | null;
    }>;
    private clientIp;
}
//# sourceMappingURL=auth.controller.d.ts.map