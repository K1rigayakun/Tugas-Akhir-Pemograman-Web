"use strict";
// ============================================================
// Cashback & Showcase — Per Rank
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.SHOWCASE_SLOTS = exports.CASHBACK_RATE = void 0;
const enums_1 = require("./enums");
/** Persentase cashback saat menang lelang, berdasarkan rank */
exports.CASHBACK_RATE = {
    [enums_1.Rank.CIVIS]: 0,
    [enums_1.Rank.MERCHANT]: 0,
    [enums_1.Rank.KNIGHT]: 0,
    [enums_1.Rank.BARON]: 0.02,
    [enums_1.Rank.VISCOUNT]: 0.03,
    [enums_1.Rank.EARL]: 0.04,
    [enums_1.Rank.MARQUIS]: 0.05,
    [enums_1.Rank.DUKE]: 0.06,
    [enums_1.Rank.SOVEREIGN]: 0.07,
    [enums_1.Rank.EMPEROR]: 0.08,
};
/** Jumlah slot showcase di profil, berdasarkan rank */
exports.SHOWCASE_SLOTS = {
    [enums_1.Rank.CIVIS]: 3,
    [enums_1.Rank.MERCHANT]: 3,
    [enums_1.Rank.KNIGHT]: 4,
    [enums_1.Rank.BARON]: 5,
    [enums_1.Rank.VISCOUNT]: 6,
    [enums_1.Rank.EARL]: 7,
    [enums_1.Rank.MARQUIS]: 8,
    [enums_1.Rank.DUKE]: 10,
    [enums_1.Rank.SOVEREIGN]: 12,
    [enums_1.Rank.EMPEROR]: 15,
};
//# sourceMappingURL=cashback.js.map