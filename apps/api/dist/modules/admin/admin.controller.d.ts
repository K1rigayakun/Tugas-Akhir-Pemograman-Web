import { AdminService } from "./admin.service";
import { AuditService } from "../audit/audit.service";
import { StorageService } from "../storage/storage.service";
import { WarnUserDto, SuspendUserDto, BanUserDto, CancelAuctionDto, RejectKYCDto, CurateMuseumDto, CreateEventDto, CreateAuctionDto } from "./dto/admin.dto";
/**
 * AdminController — Semua endpoint admin panel.
 *
 * Prefix: /api/v1/admin
 * Semua endpoint dilindungi oleh AuthGuard (JWT) + RolesGuard (RBAC).
 */
export declare class AdminController {
    private readonly adminService;
    private readonly storageService;
    private auditService;
    constructor(adminService: AdminService, storageService: StorageService, auditService: AuditService);
    getDashboardStats(): Promise<{
        activeUsers: number;
        activeAuctions: number;
        totalTopUpToday: number;
        totalBidsToday: number;
        pendingKYC: number;
    }>;
    getDashboardChart(): Promise<{
        date: string;
        bids: number;
        topUp: number;
        newUsers: number;
    }[]>;
    getFraudAlerts(): Promise<{
        type: string;
        userId: string;
        detail: string;
    }[]>;
    getAuditLogs(page?: number, limit?: number): Promise<{
        data: ({
            admin: {
                id: string;
                email: string;
                username: string;
            };
        } & {
            id: string;
            adminId: string;
            action: string;
            targetId: string | null;
            targetType: string | null;
            details: import(".prisma/client").Prisma.JsonValue;
            ipAddress: string | null;
            timestamp: Date;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    searchUsers(query: string, page?: number): Promise<{
        data: {
            id: string;
            email: string;
            username: string;
            rank: import(".prisma/client").$Enums.Rank;
            kycStatus: import(".prisma/client").$Enums.KYCStatus;
            isSuspended: boolean;
            createdAt: Date;
            lastActiveAt: Date;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getUserFullProfile(userId: string): Promise<({
        rankHistory: {
            id: string;
            userId: string;
            fromRank: import(".prisma/client").$Enums.Rank;
            toRank: import(".prisma/client").$Enums.Rank;
            changedAt: Date;
            reason: string;
        }[];
        achievements: ({
            achievement: {
                id: string;
                name: string;
                description: string;
                tier: import(".prisma/client").$Enums.AchievementTier;
                trigger: string;
                condition: import(".prisma/client").Prisma.JsonValue;
                expReward: number;
                titleReward: string | null;
                cosmeticReward: string | null;
            };
        } & {
            id: string;
            userId: string;
            achievementId: string;
            unlockedAt: Date;
        })[];
        kyc: {
            id: string;
            userId: string;
            fullName: string | null;
            nationalId: string | null;
            dateOfBirth: string | null;
            phoneNumber: string | null;
            streetAddress: string | null;
            city: string | null;
            province: string | null;
            country: string;
            postalCode: string | null;
            idDocumentKey: string | null;
            selfieKey: string | null;
            reviewedBy: string | null;
            reviewNotes: string | null;
            submittedAt: Date;
            reviewedAt: Date | null;
            kycStatus: import(".prisma/client").$Enums.KYCStatus;
            nationalIdHash: string | null;
        } | null;
        walletAccount: {
            id: string;
            userId: string;
            balance: number;
            pendingHold: number;
            totalTopUp: number;
            totalSpent: number;
        } | null;
    } & {
        id: string;
        email: string;
        username: string;
        passwordHash: string;
        emailVerified: boolean;
        rank: import(".prisma/client").$Enums.Rank;
        totalExp: number;
        winStreak: number;
        longestStreak: number;
        totalWins: number;
        totalBids: number;
        kycStatus: import(".prisma/client").$Enums.KYCStatus;
        privacyMode: import(".prisma/client").$Enums.PrivacyMode;
        twoFactorEnabled: boolean;
        twoFactorSecret: string | null;
        notificationPrefs: import(".prisma/client").Prisma.JsonValue;
        activeTitle: string | null;
        activeCoatFrame: string | null;
        activeNameEffect: string | null;
        activeWalletSkin: string | null;
        isSuspended: boolean;
        isBannedFromAuction: boolean;
        suspendUntil: Date | null;
        adminRole: import(".prisma/client").$Enums.AdminRole | null;
        deletedAt: Date | null;
        createdAt: Date;
        lastActiveAt: Date;
        otpExpiresAt: Date | null;
        otpHash: string | null;
        activeWebCodeId: string | null;
        activeBannerId: string | null;
        hiddenVaultItems: import(".prisma/client").Prisma.JsonValue;
        avatarUrl: string | null;
    }) | null>;
    warnUser(userId: string, dto: WarnUserDto, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    suspendUser(userId: string, dto: SuspendUserDto, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    banFromAuction(userId: string, dto: BanUserDto, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    banPermanent(userId: string, dto: BanUserDto, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    getAuctions(status?: string, type?: string, page?: number): Promise<{
        data: ({
            _count: {
                watchlists: number;
                bids: number;
            };
        } & {
            id: string;
            title: string;
            description: string;
            category: string;
            rarity: import(".prisma/client").$Enums.ItemRarity;
            auctionType: import(".prisma/client").$Enums.AuctionType;
            status: import(".prisma/client").$Enums.AuctionStatus;
            startingPrice: number;
            currentPrice: number;
            minimumIncrement: number;
            minimumPrice: number | null;
            decrementAmount: number | null;
            startTime: Date;
            endTime: Date;
            minimumRank: import(".prisma/client").$Enums.Rank | null;
            isSealed: boolean;
            imageUrls: string[];
            videoUrl: string | null;
            modelUrl: string | null;
            winnerId: string | null;
            finalPrice: number | null;
            inMuseum: boolean;
            createdAt: Date;
            updatedAt: Date;
            requiredAchievementId: string | null;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    createAuction(dto: CreateAuctionDto, req: any): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        data: {
            _count: {
                watchlists: number;
                bids: number;
            };
        } & {
            id: string;
            title: string;
            description: string;
            category: string;
            rarity: import(".prisma/client").$Enums.ItemRarity;
            auctionType: import(".prisma/client").$Enums.AuctionType;
            status: import(".prisma/client").$Enums.AuctionStatus;
            startingPrice: number;
            currentPrice: number;
            minimumIncrement: number;
            minimumPrice: number | null;
            decrementAmount: number | null;
            startTime: Date;
            endTime: Date;
            minimumRank: import(".prisma/client").$Enums.Rank | null;
            isSealed: boolean;
            imageUrls: string[];
            videoUrl: string | null;
            modelUrl: string | null;
            winnerId: string | null;
            finalPrice: number | null;
            inMuseum: boolean;
            createdAt: Date;
            updatedAt: Date;
            requiredAchievementId: string | null;
        };
        message: string;
    }>;
    cancelAuction(auctionId: string, dto: CancelAuctionDto, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    getPendingKYC(page?: string): Promise<{
        data: ({
            fullName: string | null;
            dateOfBirth: string | null;
            phoneNumber: string | null;
            nationalIdLast4: string | null;
            user: {
                id: string;
                email: string;
                username: string;
            };
            id: string;
            userId: string;
            nationalId: string | null;
            streetAddress: string | null;
            city: string | null;
            province: string | null;
            country: string;
            postalCode: string | null;
            idDocumentKey: string | null;
            selfieKey: string | null;
            reviewedBy: string | null;
            reviewNotes: string | null;
            submittedAt: Date;
            reviewedAt: Date | null;
            kycStatus: import(".prisma/client").$Enums.KYCStatus;
            nationalIdHash: string | null;
        } | {
            fullName: string;
            user: {
                id: string;
                email: string;
                username: string;
            };
            id: string;
            userId: string;
            nationalId: string | null;
            dateOfBirth: string | null;
            phoneNumber: string | null;
            streetAddress: string | null;
            city: string | null;
            province: string | null;
            country: string;
            postalCode: string | null;
            idDocumentKey: string | null;
            selfieKey: string | null;
            reviewedBy: string | null;
            reviewNotes: string | null;
            submittedAt: Date;
            reviewedAt: Date | null;
            kycStatus: import(".prisma/client").$Enums.KYCStatus;
            nationalIdHash: string | null;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    approveKYC(kycId: string, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    rejectKYC(kycId: string, dto: RejectKYCDto, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    getMuseumItems(page?: number): Promise<{
        data: ({
            auction: {
                id: string;
                title: string;
                description: string;
                category: string;
                rarity: import(".prisma/client").$Enums.ItemRarity;
                auctionType: import(".prisma/client").$Enums.AuctionType;
                status: import(".prisma/client").$Enums.AuctionStatus;
                startingPrice: number;
                currentPrice: number;
                minimumIncrement: number;
                minimumPrice: number | null;
                decrementAmount: number | null;
                startTime: Date;
                endTime: Date;
                minimumRank: import(".prisma/client").$Enums.Rank | null;
                isSealed: boolean;
                imageUrls: string[];
                videoUrl: string | null;
                modelUrl: string | null;
                winnerId: string | null;
                finalPrice: number | null;
                inMuseum: boolean;
                createdAt: Date;
                updatedAt: Date;
                requiredAchievementId: string | null;
            };
        } & {
            id: string;
            auctionId: string;
            featuredAt: Date;
            editorial: string | null;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    curateToMuseum(auctionId: string, dto: CurateMuseumDto, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    getEvents(page?: number): Promise<{
        data: {
            id: string;
            name: string;
            theme: string;
            backgroundMode: string | null;
            accentColors: import(".prisma/client").Prisma.JsonValue;
            expMultiplier: number;
            startTime: Date;
            endTime: Date;
            isActive: boolean;
            createdAt: Date;
            defaultBannerId: string | null;
            defaultCoatFrameId: string | null;
            defaultNameEffectId: string | null;
            themeConfig: import(".prisma/client").Prisma.JsonValue | null;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    createEvent(dto: CreateEventDto, req: any): Promise<{
        success: boolean;
        data: {
            id: string;
            name: string;
            theme: string;
            backgroundMode: string | null;
            accentColors: import(".prisma/client").Prisma.JsonValue;
            expMultiplier: number;
            startTime: Date;
            endTime: Date;
            isActive: boolean;
            createdAt: Date;
            defaultBannerId: string | null;
            defaultCoatFrameId: string | null;
            defaultNameEffectId: string | null;
            themeConfig: import(".prisma/client").Prisma.JsonValue | null;
        };
    }>;
    activateEvent(eventId: string, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    endEvent(eventId: string, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    getTransactions(page?: number): Promise<{
        data: {
            id: string;
            walletId: string;
            type: import(".prisma/client").$Enums.WalletTxType;
            amount: number;
            description: string;
            referenceId: string | null;
            idempotencyKey: string;
            createdAt: Date;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    processManualRefund(id: string, body: {
        reason: string;
    }, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    getCosmetics(): Promise<{
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
    createCosmetic(file: Express.Multer.File, body: any, req: any): Promise<{
        success: boolean;
        data: {
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
        };
    }>;
    getAchievements(): Promise<{
        id: string;
        name: string;
        description: string;
        tier: import(".prisma/client").$Enums.AchievementTier;
        trigger: string;
        condition: import(".prisma/client").Prisma.JsonValue;
        expReward: number;
        titleReward: string | null;
        cosmeticReward: string | null;
    }[]>;
    createAchievement(body: any, req: any): Promise<{
        success: boolean;
        data: {
            id: string;
            name: string;
            description: string;
            tier: import(".prisma/client").$Enums.AchievementTier;
            trigger: string;
            condition: import(".prisma/client").Prisma.JsonValue;
            expReward: number;
            titleReward: string | null;
            cosmeticReward: string | null;
        };
    }>;
    getContent(type?: string): Promise<{
        id: string;
        type: import(".prisma/client").$Enums.ContentType;
        title: string;
        content: string;
        imageUrl: string | null;
        isActive: boolean;
        order: number;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    createContent(file: Express.Multer.File, body: any, req: any): Promise<{
        success: boolean;
        data: {
            id: string;
            type: import(".prisma/client").$Enums.ContentType;
            title: string;
            content: string;
            imageUrl: string | null;
            isActive: boolean;
            order: number;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    getSecurityRules(): Promise<{
        id: string;
        ipAddress: string;
        isBlocked: boolean;
        reason: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    createSecurityRule(body: any, req: any): Promise<{
        success: boolean;
        data: {
            id: string;
            ipAddress: string;
            isBlocked: boolean;
            reason: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    getThemeSettings(): Promise<{
        baseTheme: string;
        effectLayer: string;
    }>;
    updateThemeSettings(file: Express.Multer.File, body: any, req: any): Promise<{
        success: boolean;
        message: string;
        data: {
            baseTheme: any;
            effectLayer: any;
            customEffectUrl: any;
        };
    }>;
    getVaultOfferings(): Promise<({
        user: {
            id: string;
            username: string;
            rank: import(".prisma/client").$Enums.Rank;
        };
    } & {
        id: string;
        userId: string;
        title: string;
        description: string;
        rarity: string;
        startingPrice: number;
        imageUrls: string[];
        status: string;
        adminNotes: string | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    reviewVaultOffering(id: string, body: {
        status: "APPROVED" | "REJECTED";
        adminNotes?: string;
    }, req: any): Promise<{
        success: boolean;
        data: {
            id: string;
            userId: string;
            title: string;
            description: string;
            rarity: string;
            startingPrice: number;
            imageUrls: string[];
            status: string;
            adminNotes: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
}
//# sourceMappingURL=admin.controller.d.ts.map