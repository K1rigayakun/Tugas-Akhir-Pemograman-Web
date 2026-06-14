import { AchievementService } from "./achievement.service";
import { RankService } from "../rank/rank.service";
export declare class AchievementListener {
    private readonly achievementService;
    private readonly rankService;
    private readonly logger;
    constructor(achievementService: AchievementService, rankService: RankService);
    handleUserLogin(payload: {
        userId: string;
        loginCount: number;
        isFirstLoginToday: boolean;
        loginStreak: number;
    }): Promise<void>;
    handleAuctionWon(payload: {
        userId: string;
        auctionId: string;
        totalWins: number;
    }): Promise<void>;
}
//# sourceMappingURL=achievement.listener.d.ts.map