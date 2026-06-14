import { RankService } from './rank.service';
export declare class RankController {
    private readonly rankService;
    constructor(rankService: RankService);
    /**
     * Mendapatkan status rank saat ini, total EXP, dan progress detail user
     */
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
    /**
     * Mendapatkan daftar riwayat kenaikan pangkat user
     */
    getRankHistory(userId: string): Promise<{
        id: string;
        userId: string;
        fromRank: import(".prisma/client").$Enums.Rank;
        toRank: import(".prisma/client").$Enums.Rank;
        changedAt: Date;
        reason: string;
    }[]>;
    /**
     * Memicu penambahan EXP secara manual (untuk debugging / testing oleh Admin)
     */
    awardExp(userId: string, body: {
        amount: number;
        reason: string;
    }): Promise<{
        previousExp: number;
        newExp: number;
        earnedExp: number;
        previousRank: import(".prisma/client").$Enums.Rank;
        currentRank: import(".prisma/client").$Enums.Rank;
        promoted: boolean;
    }>;
}
//# sourceMappingURL=rank.controller.d.ts.map