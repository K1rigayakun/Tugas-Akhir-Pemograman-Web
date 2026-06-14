import { LiveAuctionService } from "./live-auction.service";
/**
 * LiveAuctionController — REST endpoints untuk live auction.
 *
 * Prefix: /api/v1/live-auction
 *
 * Endpoints publik:
 * - GET /active — Daftar live auction yang sedang berlangsung
 * - GET /:id/token — Generate Agora token untuk join streaming
 *
 * Endpoints admin:
 * - POST /:id/start — Mulai sesi live auction
 * - POST /:id/end — Akhiri sesi live auction
 */
export declare class LiveAuctionController {
    private liveAuctionService;
    constructor(liveAuctionService: LiveAuctionService);
    /** Daftar live auction yang sedang berlangsung */
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
    /**
     * Generate Agora token untuk join video streaming.
     * User harus login.
     */
    getAgoraToken(auctionId: string, uid?: number, role?: string): Promise<{
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
    }>;
    /** Mulai sesi live auction */
    startLiveSession(auctionId: string, req: any): Promise<{
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
    /** Akhiri sesi live auction */
    endLiveSession(auctionId: string, req: any): Promise<{
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
}
//# sourceMappingURL=live-auction.controller.d.ts.map