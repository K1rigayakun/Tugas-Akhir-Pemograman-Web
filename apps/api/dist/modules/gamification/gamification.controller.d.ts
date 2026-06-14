import { GamificationService } from './gamification.service';
export declare class GamificationController {
    private readonly gamificationService;
    constructor(gamificationService: GamificationService);
    /**
     * Mendapatkan daftar quest harian beserta tingkat progress user saat ini
     */
    getDailyQuests(req: any): Promise<{
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
    /**
     * Mengklaim hadiah EXP dari quest harian yang sudah selesai dikerjakan
     */
    claimDailyQuest(questId: string, req: any): Promise<{
        success: boolean;
    }>;
    /**
     * Membaca klasemen leaderboard dari Redis cache untuk Visel
     */
    getLeaderboard(category: string, // wealth, prestige, wins
    period: string): Promise<any>;
    /**
     * Mendapatkan event aktif untuk halaman publik dan rekomendasi event.
     */
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
    /**
     * Memulai event musiman baru secara administratif (Admin)
     */
    startEvent(body: {
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
    /**
     * Menghentikan event musiman yang sedang aktif (Admin)
     */
    endEvent(): Promise<{
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
    /**
     * Memaksa refresh leaderboard cache (Admin/Debugging)
     */
    refreshLeaderboard(): Promise<{
        status: string;
        message: string;
    }>;
}
//# sourceMappingURL=gamification.controller.d.ts.map