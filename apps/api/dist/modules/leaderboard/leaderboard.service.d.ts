import { PrismaService } from '../../prisma/prisma.service';
export declare class LeaderboardService {
    private prisma;
    constructor(prisma: PrismaService);
    getTopUsers(limit?: number): Promise<{
        rank: number;
        userId: string;
        username: string;
        points: number;
        avatar: string | null;
    }[]>;
    getLeaderboard(category: string, limit: number): Promise<{
        position: number;
        userId: string;
        username: string;
        rank: import(".prisma/client").$Enums.Rank;
        value: number;
    }[]>;
}
//# sourceMappingURL=leaderboard.service.d.ts.map