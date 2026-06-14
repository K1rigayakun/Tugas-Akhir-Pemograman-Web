import { PrismaService } from "../../prisma/prisma.service";
import { BidGateway } from "../bid/bid.gateway";
import { NotificationService } from "../notification/notification.service";
export declare class RankService {
    private readonly prisma;
    private readonly bidGateway;
    private readonly notificationService;
    constructor(prisma: PrismaService, bidGateway: BidGateway, notificationService: NotificationService);
    getRankInfo(userId: string): Promise<{
        userId: string;
        username: string;
        currentRank: import(".prisma/client").$Enums.Rank;
        currentExp: number;
        nextRank: import(".prisma/client").$Enums.Rank;
        nextRankThreshold: number;
        expNeeded: number;
        progressPercentage: number;
    }>;
    awardExp(userId: string, baseAmount: number, reason: string): Promise<{
        previousExp: number;
        newExp: number;
        earnedExp: number;
        previousRank: import(".prisma/client").$Enums.Rank;
        currentRank: import(".prisma/client").$Enums.Rank;
        promoted: boolean;
    }>;
    awardWinExp(userId: string): Promise<{
        previousExp: number;
        newExp: number;
        earnedExp: number;
        previousRank: import(".prisma/client").$Enums.Rank;
        currentRank: import(".prisma/client").$Enums.Rank;
        promoted: boolean;
    }>;
    getRankHistory(userId: string): Promise<{
        id: string;
        userId: string;
        fromRank: import(".prisma/client").$Enums.Rank;
        toRank: import(".prisma/client").$Enums.Rank;
        changedAt: Date;
        reason: string;
    }[]>;
    private applySpecialRequirements;
}
//# sourceMappingURL=rank.service.d.ts.map