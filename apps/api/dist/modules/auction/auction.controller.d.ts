import { AuctionService, AuctionStatus } from './auction.service';
import { CreateAuctionDto, AuctionType } from './dto/create-auction.dto';
import { UpdateAuctionDto } from './dto/update-auction.dto';
export declare class AuctionController {
    private readonly auctionService;
    constructor(auctionService: AuctionService);
    /**
     * Mendapatkan daftar semua lelang dengan filter status, tipe, dan search query
     */
    getAuctions(req: any, status?: AuctionStatus, type?: AuctionType, query?: string): Promise<{
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
    }[]>;
    /**
     * Mendapatkan daftar lelang yang sedang LIVE
     */
    getLiveAuctions(req: any): Promise<{
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
    }[]>;
    /**
     * Mendapatkan daftar lelang rank-exclusive, termasuk item yang terkunci.
     */
    getExclusiveAuctions(req: any): Promise<{
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
    }[]>;
    /**
     * Mendapatkan rekomendasi lelang event saat event aktif.
     */
    getEventAuctions(req: any): Promise<{
        event: null;
        auctions: never[];
    } | {
        event: {
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
        auctions: {
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
        }[];
    }>;
    /**
     * Mendapatkan daftar lelang UPCOMING (mendatang)
     */
    getUpcomingAuctions(req: any): Promise<{
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
    }[]>;
    /**
     * Mendapatkan detail satu lelang
     */
    getAuctionById(id: string): Promise<{
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
    }>;
    /**
     * Mendapatkan riwayat bid lelang tertentu
     */
    getAuctionBids(id: string): Promise<{
        username: string;
        rank: import(".prisma/client").$Enums.Rank;
        activeNameEffect: string | null;
        activeCoatFrame: string | null;
        avatarUrl: string | null;
        timestamp: Date;
        user: {
            username: string;
            rank: import(".prisma/client").$Enums.Rank;
            activeCoatFrame: string | null;
            activeNameEffect: string | null;
            avatarUrl: string | null;
        };
        id: string;
        auctionId: string;
        userId: string;
        amount: number;
        status: import(".prisma/client").$Enums.BidStatus;
        isPhantom: boolean;
        phantomMax: string | null;
        placedAt: Date;
    }[]>;
    /**
     * Membuat draf lelang baru (Admin)
     */
    createAuction(dto: CreateAuctionDto): Promise<{
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
    }>;
    /**
     * Memperbarui draf lelang (Admin)
     */
    updateAuction(id: string, dto: UpdateAuctionDto): Promise<{
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
    }>;
    /**
     * Mempublikasikan lelang agar aktif (Admin)
     */
    publishAuction(id: string): Promise<{
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
    }>;
    /**
     * Membatalkan lelang (Admin)
     */
    cancelAuction(id: string): Promise<{
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
    }>;
}
//# sourceMappingURL=auction.controller.d.ts.map