import { ConfigService } from "@nestjs/config";
import { AuditService } from "../audit/audit.service";
import { LiveAuctionGateway } from "./live-auction.gateway";
import { RankService } from "../rank/rank.service";
import { EventEmitter2 } from "@nestjs/event-emitter";
/**
 * LiveAuctionService — Logika bisnis untuk live auction.
 *
 * Mengelola:
 * - Start/end sesi live auction
 * - Generate Agora token untuk join video streaming
 * - Daftar live auction yang sedang berlangsung
 */
export declare class LiveAuctionService {
    private configService;
    private auditService;
    private liveAuctionGateway;
    private readonly rankService;
    private readonly eventEmitter;
    private readonly logger;
    private readonly agoraAppId;
    private readonly agoraCertificate;
    constructor(configService: ConfigService, auditService: AuditService, liveAuctionGateway: LiveAuctionGateway, rankService: RankService, eventEmitter: EventEmitter2);
    /**
     * Mulai sesi live auction.
     * Hanya admin yang bisa memulai.
     */
    startLiveSession(adminId: string, auctionId: string, ipAddress?: string): Promise<{
        success: boolean;
        message: string;
        auctionId?: undefined;
        hostToken?: undefined;
    } | {
        success: boolean;
        message: string;
        auctionId: string;
        hostToken: {
            appId: string;
            token: string;
            channel: string;
            uid: number;
            role: string;
            expiresAt: string;
        } | {
            appId: string;
            token: string;
            channel: string;
            uid: number;
            role: string;
            expiresAt: string;
            error: string;
        };
    }>;
    /**
     * Akhiri sesi live auction.
     */
    endLiveSession(adminId: string, auctionId: string, ipAddress?: string): Promise<{
        success: boolean;
        message: string;
        winnerId?: undefined;
        finalPrice?: undefined;
    } | {
        success: boolean;
        message: string;
        winnerId: string | null;
        finalPrice: number | null;
    }>;
    /**
     * Generate Agora token untuk join video streaming.
     *
     * @param auctionId - ID lelang (channel name)
     * @param uid - User ID (0 = auto-assign)
     * @param isHost - true kalau user adalah host/admin
     */
    getAgoraToken(auctionId: string, uid?: number, isHost?: boolean): {
        appId: string;
        token: string;
        channel: string;
        uid: number;
        role: string;
        expiresAt: string;
    } | {
        appId: string;
        token: string;
        channel: string;
        uid: number;
        role: string;
        expiresAt: string;
        error: string;
    };
    /**
     * Daftar live auction yang sedang berlangsung.
     */
    getActiveLiveAuctions(): Promise<{
        id: string;
        _count: {
            bids: number;
        };
        title: string;
        currentPrice: number;
        startTime: Date;
        imageUrls: string[];
    }[]>;
}
//# sourceMappingURL=live-auction.service.d.ts.map