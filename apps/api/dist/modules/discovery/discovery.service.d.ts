import { PrismaService } from "../../prisma/prisma.service";
export declare class DiscoveryService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    leaderboard(category: string, limit?: number): Promise<{
        position: number;
        userId: string;
        username: string;
        rank: string;
        value: number;
    }[]>;
    museumItems(limit?: number, rarity?: string): import(".prisma/client").Prisma.PrismaPromise<({
        auction: {
            _count: {
                bids: number;
            };
            winner: {
                username: string;
                rank: import(".prisma/client").$Enums.Rank;
                privacyMode: import(".prisma/client").$Enums.PrivacyMode;
            } | null;
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
    } & {
        id: string;
        auctionId: string;
        featuredAt: Date;
        editorial: string | null;
    })[]>;
    museumItem(id: string): import(".prisma/client").Prisma.Prisma__MuseumItemClient<({
        auction: {
            bids: {
                id: string;
                auctionId: string;
                userId: string;
                amount: number;
                status: import(".prisma/client").$Enums.BidStatus;
                isPhantom: boolean;
                phantomMax: string | null;
                placedAt: Date;
            }[];
            winner: {
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
            } | null;
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
    } & {
        id: string;
        auctionId: string;
        featuredAt: Date;
        editorial: string | null;
    }) | null, null, import(".prisma/client/runtime/library").DefaultArgs>;
    museumRecords(): Promise<{
        highestPrice: {
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
        } | null;
        mostBids: ({
            _count: {
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
        }) | null;
        longestStreak: {
            username: string;
            longestStreak: number;
        } | null;
    }>;
    firstEmperor(): import(".prisma/client").Prisma.Prisma__UserClient<{
        id: string;
        username: string;
        totalExp: number;
        totalWins: number;
        createdAt: Date;
    } | null, null, import(".prisma/client/runtime/library").DefaultArgs>;
    eventHighlights(): import(".prisma/client").Prisma.PrismaPromise<{
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
    }[]>;
    events(): import(".prisma/client").Prisma.PrismaPromise<{
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
    }[]>;
    event(id: string): Promise<{
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
    }>;
    private leaderEntry;
}
//# sourceMappingURL=discovery.service.d.ts.map