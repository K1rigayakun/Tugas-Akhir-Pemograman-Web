"use strict";
// ============================================================
// EXP — Reward dan multiplier
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.WIN_STREAK_MULTIPLIER = exports.EXP_REWARDS = void 0;
/** Jumlah EXP yang didapat dari setiap aksi */
exports.EXP_REWARDS = {
    WIN_AUCTION: 100,
    PLACE_BID: 5,
    DAILY_LOGIN: 3,
    LOGIN_STREAK_7_DAYS: 50,
    WATCH_LIVE_FULL: 15,
    WIN_LIVE_AUCTION: 150,
    TOPUP_PER_10K_CC: 10,
    ACHIEVEMENT_COMMON: 50,
    ACHIEVEMENT_RARE: 200,
    ACHIEVEMENT_EPIC: 500,
    SUBMIT_ITEM_ACCEPTED: 50,
};
/**
 * Multiplier bonus EXP berdasarkan win streak.
 * Jika win streak >= key, gunakan value sebagai multiplier.
 */
exports.WIN_STREAK_MULTIPLIER = {
    3: 1.5,
    5: 2.0,
    10: 3.0,
};
//# sourceMappingURL=exp.js.map