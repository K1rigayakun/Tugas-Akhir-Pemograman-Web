"use strict";
// ============================================================
// Rank — Threshold EXP, Gelar, dan Tema Visual
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.isRankAtLeast = exports.RANK_ORDER = exports.RANK_THEME = exports.RANK_TITLES = exports.RANK_EXP_THRESHOLDS = void 0;
const enums_1 = require("./enums");
/** EXP yang dibutuhkan untuk mencapai setiap rank */
exports.RANK_EXP_THRESHOLDS = {
    [enums_1.Rank.CIVIS]: 0,
    [enums_1.Rank.MERCHANT]: 500,
    [enums_1.Rank.KNIGHT]: 2000,
    [enums_1.Rank.BARON]: 8000,
    [enums_1.Rank.VISCOUNT]: 25000,
    [enums_1.Rank.EARL]: 80000,
    [enums_1.Rank.MARQUIS]: 250000,
    [enums_1.Rank.DUKE]: 600000,
    [enums_1.Rank.SOVEREIGN]: 1000000,
    [enums_1.Rank.EMPEROR]: 2000000,
};
/** Gelar per rank — {username} diganti saat render */
exports.RANK_TITLES = {
    [enums_1.Rank.CIVIS]: "The Civis",
    [enums_1.Rank.MERCHANT]: "The Merchant",
    [enums_1.Rank.KNIGHT]: "Sir / Dame {username}",
    [enums_1.Rank.BARON]: "Baron / Baroness of {username}",
    [enums_1.Rank.VISCOUNT]: "Viscount / Viscountess",
    [enums_1.Rank.EARL]: "Earl / Countess of {username}",
    [enums_1.Rank.MARQUIS]: "Marquis / Marchioness",
    [enums_1.Rank.DUKE]: "Duke / Duchess of {username}",
    [enums_1.Rank.SOVEREIGN]: "The Sovereign",
    [enums_1.Rank.EMPEROR]: "The Emperor",
};
/** CSS variable yang berubah otomatis sesuai rank */
exports.RANK_THEME = {
    [enums_1.Rank.CIVIS]: { accent: "#4A7C6A", glow: "rgba(74,124,106,0.2)" },
    [enums_1.Rank.MERCHANT]: { accent: "#5A8F7A", glow: "rgba(90,143,122,0.25)" },
    [enums_1.Rank.KNIGHT]: { accent: "#CD7F32", glow: "rgba(205,127,50,0.3)" },
    [enums_1.Rank.BARON]: { accent: "#CD7F32", glow: "rgba(205,127,50,0.35)" },
    [enums_1.Rank.VISCOUNT]: { accent: "#C0C0C0", glow: "rgba(192,192,192,0.3)" },
    [enums_1.Rank.EARL]: { accent: "#C9A84C", glow: "rgba(201,168,76,0.35)" },
    [enums_1.Rank.MARQUIS]: { accent: "#C9A84C", glow: "rgba(201,168,76,0.4)" },
    [enums_1.Rank.DUKE]: { accent: "#E8A020", glow: "rgba(232,160,32,0.45)" },
    [enums_1.Rank.SOVEREIGN]: { accent: "#E5E4E2", glow: "rgba(229,228,226,0.4)" },
    [enums_1.Rank.EMPEROR]: { accent: "#FFD700", glow: "rgba(255,215,0,0.5)" },
};
/** Urutan rank dari rendah ke tinggi */
exports.RANK_ORDER = [
    enums_1.Rank.CIVIS,
    enums_1.Rank.MERCHANT,
    enums_1.Rank.KNIGHT,
    enums_1.Rank.BARON,
    enums_1.Rank.VISCOUNT,
    enums_1.Rank.EARL,
    enums_1.Rank.MARQUIS,
    enums_1.Rank.DUKE,
    enums_1.Rank.SOVEREIGN,
    enums_1.Rank.EMPEROR,
];
/** Cek apakah rank A >= rank B */
const isRankAtLeast = (current, required) => {
    return exports.RANK_ORDER.indexOf(current) >= exports.RANK_ORDER.indexOf(required);
};
exports.isRankAtLeast = isRankAtLeast;
//# sourceMappingURL=rank.js.map