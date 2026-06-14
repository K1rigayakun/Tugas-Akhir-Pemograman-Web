import { PrismaService } from "../../prisma/prisma.service";
import { BidGateway } from "../bid/bid.gateway";
import { RankService } from "../rank/rank.service";
export declare class GamificationService {
    private readonly prisma;
    private readonly bidGateway;
    private readonly rankService;
    private readonly localCache;
    constructor(prisma: PrismaService, bidGateway: BidGateway, rankService: RankService);
    getActiveEvent(): Promise<{
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
    } | null>;
    startEvent(dto: {
        name: string;
        theme?: string;
        expMultiplier: number;
        backgroundMode?: string;
        accentColors?: unknown;
        startTime?: string;
        endTime?: string;
    }): Promise<{
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
    endActiveEvent(): Promise<{
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
    getDailyQuests(userId: string): Promise<{
        progress: number;
        isCompleted: boolean;
        claimedAt: Date | null;
        id: string;
        title: string;
        description: string;
        condition: import(".prisma/client").Prisma.JsonValue;
        expReward: number;
        isActive: boolean;
    }[]>;
    claimDailyQuest(userId: string, questId: string): Promise<{
        success: boolean;
    }>;
    refreshLeaderboardCache(): Promise<void>;
    getLeaderboardFromCache(category: string, period: string): Promise<any>;
    private today;
}
//# sourceMappingURL=gamification.service.d.ts.map