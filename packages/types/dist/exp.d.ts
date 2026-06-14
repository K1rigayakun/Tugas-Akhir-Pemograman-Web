/** Jumlah EXP yang didapat dari setiap aksi */
export declare const EXP_REWARDS: {
    readonly WIN_AUCTION: 100;
    readonly PLACE_BID: 5;
    readonly DAILY_LOGIN: 3;
    readonly LOGIN_STREAK_7_DAYS: 50;
    readonly WATCH_LIVE_FULL: 15;
    readonly WIN_LIVE_AUCTION: 150;
    readonly TOPUP_PER_10K_CC: 10;
    readonly ACHIEVEMENT_COMMON: 50;
    readonly ACHIEVEMENT_RARE: 200;
    readonly ACHIEVEMENT_EPIC: 500;
    readonly SUBMIT_ITEM_ACCEPTED: 50;
};
/**
 * Multiplier bonus EXP berdasarkan win streak.
 * Jika win streak >= key, gunakan value sebagai multiplier.
 */
export declare const WIN_STREAK_MULTIPLIER: Record<number, number>;
//# sourceMappingURL=exp.d.ts.map