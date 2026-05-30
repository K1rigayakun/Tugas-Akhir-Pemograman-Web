// ============================================================
// Rank — Threshold EXP, Gelar, dan Tema Visual
// ============================================================

import { Rank } from "./enums";

/** EXP yang dibutuhkan untuk mencapai setiap rank */
export const RANK_EXP_THRESHOLDS: Record<Rank, number> = {
  [Rank.CIVIS]: 0,
  [Rank.MERCHANT]: 500,
  [Rank.KNIGHT]: 2_000,
  [Rank.BARON]: 8_000,
  [Rank.VISCOUNT]: 25_000,
  [Rank.EARL]: 80_000,
  [Rank.MARQUIS]: 250_000,
  [Rank.DUKE]: 600_000,
  [Rank.SOVEREIGN]: 1_000_000,
  [Rank.EMPEROR]: 2_000_000,
};

/** Gelar per rank — {username} diganti saat render */
export const RANK_TITLES: Record<Rank, string> = {
  [Rank.CIVIS]: "The Civis",
  [Rank.MERCHANT]: "The Merchant",
  [Rank.KNIGHT]: "Sir / Dame {username}",
  [Rank.BARON]: "Baron / Baroness of {username}",
  [Rank.VISCOUNT]: "Viscount / Viscountess",
  [Rank.EARL]: "Earl / Countess of {username}",
  [Rank.MARQUIS]: "Marquis / Marchioness",
  [Rank.DUKE]: "Duke / Duchess of {username}",
  [Rank.SOVEREIGN]: "The Sovereign",
  [Rank.EMPEROR]: "The Emperor",
};

/** CSS variable yang berubah otomatis sesuai rank */
export const RANK_THEME: Record<Rank, { accent: string; glow: string }> = {
  [Rank.CIVIS]: { accent: "#4A7C6A", glow: "rgba(74,124,106,0.2)" },
  [Rank.MERCHANT]: { accent: "#5A8F7A", glow: "rgba(90,143,122,0.25)" },
  [Rank.KNIGHT]: { accent: "#CD7F32", glow: "rgba(205,127,50,0.3)" },
  [Rank.BARON]: { accent: "#CD7F32", glow: "rgba(205,127,50,0.35)" },
  [Rank.VISCOUNT]: { accent: "#C0C0C0", glow: "rgba(192,192,192,0.3)" },
  [Rank.EARL]: { accent: "#C9A84C", glow: "rgba(201,168,76,0.35)" },
  [Rank.MARQUIS]: { accent: "#C9A84C", glow: "rgba(201,168,76,0.4)" },
  [Rank.DUKE]: { accent: "#E8A020", glow: "rgba(232,160,32,0.45)" },
  [Rank.SOVEREIGN]: { accent: "#E5E4E2", glow: "rgba(229,228,226,0.4)" },
  [Rank.EMPEROR]: { accent: "#FFD700", glow: "rgba(255,215,0,0.5)" },
};

/** Urutan rank dari rendah ke tinggi */
export const RANK_ORDER: Rank[] = [
  Rank.CIVIS,
  Rank.MERCHANT,
  Rank.KNIGHT,
  Rank.BARON,
  Rank.VISCOUNT,
  Rank.EARL,
  Rank.MARQUIS,
  Rank.DUKE,
  Rank.SOVEREIGN,
  Rank.EMPEROR,
];

/** Cek apakah rank A >= rank B */
export const isRankAtLeast = (current: Rank, required: Rank): boolean => {
  return RANK_ORDER.indexOf(current) >= RANK_ORDER.indexOf(required);
};
