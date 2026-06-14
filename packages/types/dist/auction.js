"use strict";
// ============================================================
// Auction — Anti-sniping & WebSocket Events
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.WS_EVENTS = exports.ANTI_SNIPE = exports.ANTI_SNIPE_MESSAGE = exports.ANTI_SNIPE_EXTENSION_SEC = exports.ANTI_SNIPE_WINDOW_SEC = void 0;
/** Berapa detik sebelum akhir lelang yang dianggap window anti-snipe */
exports.ANTI_SNIPE_WINDOW_SEC = 60;
/** Berapa detik perpanjangan saat ada bid di window anti-snipe */
exports.ANTI_SNIPE_EXTENSION_SEC = 60;
/** Pesan yang ditampilkan saat anti-snipe aktif */
exports.ANTI_SNIPE_MESSAGE = "A new claim has been declared \u2014 the clock extends.";
/** Anti-snipe config object — dipakai oleh LiveAuctionGateway */
exports.ANTI_SNIPE = {
    THRESHOLD_SECONDS: exports.ANTI_SNIPE_WINDOW_SEC,
    EXTENSION_SECONDS: exports.ANTI_SNIPE_EXTENSION_SEC,
    MESSAGE: exports.ANTI_SNIPE_MESSAGE,
};
/** Semua WebSocket event names — gunakan ini, jangan hardcode string */
exports.WS_EVENTS = {
    // Server -> Client
    BID_NEW: "bid:new",
    TIMER_UPDATE: "timer:update",
    TIMER_EXTENDED: "timer:extended",
    AUCTION_ENDED: "auction:ended",
    PRICE_DECREASED: "price:decreased",
    VIEWER_COUNT: "viewer:count",
    RANK_CHANGED: "rank:changed",
    EVENT_STARTED: "event:started",
    EVENT_ENDED: "event:ended",
    // Client -> Server
    JOIN_AUCTION: "join-auction",
    LEAVE_AUCTION: "leave-auction",
    PLACE_BID: "bid:place",
};
//# sourceMappingURL=auction.js.map