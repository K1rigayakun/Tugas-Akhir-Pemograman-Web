import { AchievementService } from './achievement.service';
export declare class AchievementController {
    private readonly achievementService;
    constructor(achievementService: AchievementService);
    /**
     * Mendapatkan daftar semua achievement yang tersedia beserta status unlock milik user
     */
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
}
//# sourceMappingURL=achievement.controller.d.ts.map