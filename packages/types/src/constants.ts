// ============================================================
// Identitas Aplikasi & Mata Uang
// ============================================================

export const APP_NAME = "Emerald Kingdom";
export const APP_TAGLINE = "Where Fortune Meets Glory.";
export const APP_SUBTAGLINE = "Bid. Conquer. Ascend.";

export const CURRENCY_NAME = "Crown Coin";
export const CURRENCY_SHORT = "CC";
export const CURRENCY_SYMBOL = "\u2655"; // ♛

/**
 * Format tampilan Crown Coin: ♛ 12,500 CC
 */
export const formatCC = (amount: number): string =>
  `${CURRENCY_SYMBOL} ${amount.toLocaleString("id-ID")} ${CURRENCY_SHORT}`;
