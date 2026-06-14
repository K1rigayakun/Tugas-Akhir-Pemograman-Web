import { AuditService } from "../audit/audit.service";
import { EncryptionService } from "../../common/encryption/encryption.service";
/**
 * AdminService — Logika bisnis untuk semua operasi admin panel.
 *
 * Setiap aksi admin dicatat ke audit log secara otomatis.
 */
export declare class AdminService {
    private auditService;
    private encryptionService;
    constructor(auditService: AuditService, encryptionService: EncryptionService);
    /** Statistik platform hari ini */
    getDashboardStats(): Promise<{
        activeUsers: number;
        activeAuctions: number;
        totalTopUpToday: number;
        totalBidsToday: number;
        pendingKYC: number;
    }>;
    /** Grafik aktivitas platform 7 hari terakhir */
    getDashboardChart(): Promise<{
        date: string;
        bids: number;
        topUp: number;
        newUsers: number;
    }[]>;
    /** Cari user berdasarkan email atau username */
    searchUsers(query: string, page?: number, limit?: number): Promise<{
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
    /** Profil lengkap user untuk admin */
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
    /** Kirim peringatan ke user */
    warnUser(adminId: string, userId: string, reason: string, ipAddress?: string): Promise<{
        success: boolean;
        message: string;
    }>;
    /** Suspend user sementara */
    suspendUser(adminId: string, userId: string, reason: string, durationDays: number, ipAddress?: string): Promise<{
        success: boolean;
        message: string;
    }>;
    /** Ban user dari lelang — set flag dan cancel semua bid aktif */
    banFromAuction(adminId: string, userId: string, reason: string, ipAddress?: string): Promise<{
        success: boolean;
        message: string;
    }>;
    /** Ban permanen */
    banPermanent(adminId: string, userId: string, reason: string, ipAddress?: string): Promise<{
        success: boolean;
        message: string;
    }>;
    /** Daftar semua lelang dengan filter */
    getAuctions(status?: string, type?: string, page?: number, limit?: number): Promise<{
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
    /**
     * Buat lelang baru melalui admin panel
     * Requirement 2.3: Validate all auction creation fields
     * Requirement 2.4: Create auction record with all fields from request
     */
    createAuction(adminId: string, data: any, ipAddress?: string): Promise<{
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
    /**
     * Batalkan lelang — trigger refund semua hold.
     * Menggunakan $transaction agar SEMUA operasi atomic.
     * Kalau satu gagal, semuanya rollback.
     */
    cancelAuction(adminId: string, auctionId: string, reason: string, ipAddress?: string): Promise<{
        success: boolean;
        message: string;
    }>;
    /** Daftar KYC yang menunggu review */
    getPendingKYC(page?: number, limit?: number): Promise<{
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
    /** Approve KYC */
    approveKYC(adminId: string, kycId: string, ipAddress?: string): Promise<{
        success: boolean;
        message: string;
    }>;
    /** Reject KYC */
    rejectKYC(adminId: string, kycId: string, notes: string, ipAddress?: string): Promise<{
        success: boolean;
        message: string;
    }>;
    /** Dapatkan daftar item museum */
    getMuseumItems(page?: number, limit?: number): Promise<{
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
    /** Kurasi item ke museum */
    curateToMuseum(adminId: string, auctionId: string, editorial: string, ipAddress?: string): Promise<{
        success: boolean;
        message: string;
    }>;
    /** Dapatkan daftar event */
    getEvents(page?: number, limit?: number): Promise<{
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
    /** Buat event baru */
    createEvent(adminId: string, data: {
        name: string;
        theme: string;
        backgroundMode?: string;
        accentColors?: string[];
        bannerUrl?: string;
        expMultiplier: number;
        startTime: Date;
        endTime: Date;
    }, ipAddress?: string): Promise<{
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
    /** Aktifkan event */
    activateEvent(adminId: string, eventId: string, ipAddress?: string): Promise<{
        success: boolean;
        message: string;
    }>;
    /** Akhiri event */
    endEvent(adminId: string, eventId: string, ipAddress?: string): Promise<{
        success: boolean;
        message: string;
    }>;
    /** Deteksi aktivitas mencurigakan (rule-based) */
    getFraudAlerts(): Promise<{
        type: string;
        userId: string;
        detail: string;
    }[]>;
    /** Keuangan: Dapatkan transaksi */
    getTransactions(page?: number, limit?: number): Promise<{
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
    /** Keuangan: Manual Refund */
    processManualRefund(adminId: string, transactionId: string, reason: string, ipAddress?: string): Promise<{
        success: boolean;
        message: string;
    }>;
    /** Cosmetic: Dapatkan semua cosmetic */
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
    /** Cosmetic: Buat cosmetic baru */
    createCosmetic(adminId: string, data: any, fileUrl: string, ipAddress?: string): Promise<{
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
    /** Achievement: Dapatkan semua achievement */
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
    /** Achievement: Buat achievement baru */
    createAchievement(adminId: string, data: any, ipAddress?: string): Promise<{
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
    /** Content: Dapatkan semua konten */
    getContent(type?: any): Promise<{
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
    /** Content: Buat konten baru */
    createContent(adminId: string, data: any, fileUrl?: string, ipAddress?: string): Promise<{
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
    /** Security: Dapatkan IP whitelist/blacklist */
    getSecurityRules(): Promise<{
        id: string;
        ipAddress: string;
        isBlocked: boolean;
        reason: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    /** Security: Tambah IP rule */
    createSecurityRule(adminId: string, data: any, ipAddress?: string): Promise<{
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
    /** Dapatkan pengaturan tema saat ini */
    getThemeSettings(): Promise<{
        baseTheme: string;
        effectLayer: string;
    }>;
    /** Simpan pengaturan tema */
    updateThemeSettings(adminId: string, data: any, ipAddress?: string): Promise<{
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
    reviewVaultOffering(id: string, status: "APPROVED" | "REJECTED", adminNotes: string | undefined, adminId: string): Promise<{
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
//# sourceMappingURL=admin.service.d.ts.map