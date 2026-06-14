import { EncryptionService } from "../../common/encryption/encryption.service";
import { PrismaService } from "../../prisma/prisma.service";
import { WalletService } from "../wallet/wallet.service";
import { NotificationService } from "../notification/notification.service";
import { BidGateway } from "./bid.gateway";
import { AiService } from "../ai/ai.service";
export declare class BidService {
    private readonly prisma;
    private readonly walletService;
    private readonly bidGateway;
    private readonly encryptionService;
    private readonly notificationService;
    private readonly aiService;
    private readonly locks;
    constructor(prisma: PrismaService, walletService: WalletService, bidGateway: BidGateway, encryptionService: EncryptionService, notificationService: NotificationService, aiService: AiService);
    placeBid(auctionId: string, userId: string, amount: number, idempotencyKey: string, allowPhantomResponse?: boolean): Promise<{
        id: string;
        auctionId: string;
        userId: string;
        amount: number;
        status: import(".prisma/client").$Enums.BidStatus;
        isPhantom: boolean;
        phantomMax: string | null;
        placedAt: Date;
    }>;
    placePhantomBid(auctionId: string, userId: string, maxAmount: number, idempotencyKey: string): Promise<{
        maxAmount: undefined;
        idempotencyKey: string;
        id: string;
        userId: string;
        auctionId: string;
        isActive: boolean;
        createdAt: Date;
    }>;
    private respondWithPhantomBid;
}
//# sourceMappingURL=bid.service.d.ts.map