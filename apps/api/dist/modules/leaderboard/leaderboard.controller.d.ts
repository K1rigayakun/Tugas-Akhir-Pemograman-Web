import { LeaderboardService } from './leaderboard.service';
export declare class LeaderboardController {
    private leaderboardService;
    constructor(leaderboardService: LeaderboardService);
    getTopLeaderboard(limitStr?: string): Promise<{
        data: {
            rank: number;
            userId: string;
            username: string;
            points: number;
            avatar: string | null;
        }[];
        timestamp: string;
    }>;
    getLeaderboard(category: string, limitStr?: string): Promise<{
        position: number;
        userId: string;
        username: string;
        rank: import(".prisma/client").$Enums.Rank;
        value: number;
    }[]>;
}
//# sourceMappingURL=leaderboard.controller.d.ts.map