"use strict";
// ============================================================
// Identitas Aplikasi & Mata Uang
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatCC = exports.CURRENCY_SYMBOL = exports.CURRENCY_SHORT = exports.CURRENCY_NAME = exports.APP_SUBTAGLINE = exports.APP_TAGLINE = exports.APP_NAME = void 0;
exports.APP_NAME = "Emerald Kingdom";
exports.APP_TAGLINE = "Where Fortune Meets Glory.";
exports.APP_SUBTAGLINE = "Bid. Conquer. Ascend.";
exports.CURRENCY_NAME = "Crown Coin";
exports.CURRENCY_SHORT = "CC";
exports.CURRENCY_SYMBOL = "\u2655"; // ♛
/**
 * Format tampilan Crown Coin: ♛ 12,500 CC
 */
const formatCC = (amount) => `${exports.CURRENCY_SYMBOL} ${amount.toLocaleString("id-ID")} ${exports.CURRENCY_SHORT}`;
exports.formatCC = formatCC;
//# sourceMappingURL=constants.js.map