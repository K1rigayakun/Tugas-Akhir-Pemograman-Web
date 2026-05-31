// ============================================================
// Cashback & Showcase — Per Rank
// ============================================================

import { Rank } from "./enums";

/** Persentase cashback saat menang lelang, berdasarkan rank */
export const CASHBACK_RATE: Record<Rank, number> = {
  [Rank.CIVIS]: 0,
  [Rank.MERCHANT]: 0,
  [Rank.KNIGHT]: 0,
  [Rank.BARON]: 0.02,
  [Rank.VISCOUNT]: 0.03,
  [Rank.EARL]: 0.04,
  [Rank.MARQUIS]: 0.05,
  [Rank.DUKE]: 0.06,
  [Rank.SOVEREIGN]: 0.07,
  [Rank.EMPEROR]: 0.08,
};

/** Jumlah slot showcase di profil, berdasarkan rank */
export const SHOWCASE_SLOTS: Record<Rank, number> = {
  [Rank.CIVIS]: 3,
  [Rank.MERCHANT]: 3,
  [Rank.KNIGHT]: 4,
  [Rank.BARON]: 5,
  [Rank.VISCOUNT]: 6,
  [Rank.EARL]: 7,
  [Rank.MARQUIS]: 8,
  [Rank.DUKE]: 10,
  [Rank.SOVEREIGN]: 12,
  [Rank.EMPEROR]: 15,
};
