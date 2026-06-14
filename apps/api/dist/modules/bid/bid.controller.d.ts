import { BidService } from './bid.service';
import { PlaceBidDto } from './dto/place-bid.dto';
export declare class BidController {
    private readonly bidService;
    constructor(bidService: BidService);
    /**
     * Mengajukan penawaran bid normal pada lelang tertentu
     */
    placeBid(auctionId: string, req: any, dto: PlaceBidDto): Promise<{
        id: string;
        auctionId: string;
        userId: string;
        amount: number;
        status: import(".prisma/client").$Enums.BidStatus;
        isPhantom: boolean;
        phantomMax: string | null;
        placedAt: Date;
    }>;
    /**
     * Memasang Phantom Bid (Shadow Pledge) - auto-bid otomatis hingga batas maksimum
     */
    placePhantomBid(auctionId: string, req: any, body: {
        maxAmount: number;
        idempotencyKey: string;
    }): Promise<{
        maxAmount: undefined;
        idempotencyKey: string;
        id: string;
        userId: string;
        auctionId: string;
        isActive: boolean;
        createdAt: Date;
    }>;
}
//# sourceMappingURL=bid.controller.d.ts.map