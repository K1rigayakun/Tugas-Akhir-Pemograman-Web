import { PrismaService } from "../../prisma/prisma.service";
import { BidGateway } from "../bid/bid.gateway";
import { RankService } from "../rank/rank.service";
export declare class AchievementService {
    private readonly prisma;
    private readonly rankService;
    private readonly bidGateway;
    constructor(prisma: PrismaService, rankService: RankService, bidGateway: BidGateway);
    getUserAchievements(userId: string): Promise<{
        isUnlocked: boolean;
        unlockedAt: Date;
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
    getAchievements(): Promise<({
        _count: {
            userAchievements: number;
        };
    } & {
        id: string;
        name: string;
        description: string;
        tier: import(".prisma/client").$Enums.AchievementTier;
        trigger: string;
        condition: import(".prisma/client").Prisma.JsonValue;
        expReward: number;
        titleReward: string | null;
        cosmeticReward: string | null;
    })[]>;
    check(userId: string, eventType: string, context?: Record<string, unknown>): Promise<{
        unlocked: string[];
    }>;
    private meetsCondition;
}
//# sourceMappingURL=achievement.service.d.ts.map