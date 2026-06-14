import { PrismaService } from '../../prisma/prisma.service';
export declare class AiService {
    private prisma;
    private readonly logger;
    private genAI;
    constructor(prisma: PrismaService);
    /**
     * AI Museum Curator (RINA)
     * Generates a lore/story about an item in the museum.
     */
    generateMuseumStory(auctionId: string): Promise<string>;
    /**
     * AI Fraud Detection
     * Menganalisis tawaran yang masuk untuk mendeteksi anomali.
     */
    detectFraud(amount: number, userRank: string, currentPrice: number): Promise<{
        isFraud: boolean;
        reason?: string;
    }>;
}
//# sourceMappingURL=ai.service.d.ts.map