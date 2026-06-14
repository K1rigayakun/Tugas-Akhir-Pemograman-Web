/** Berapa detik sebelum akhir lelang yang dianggap window anti-snipe */
export declare const ANTI_SNIPE_WINDOW_SEC = 60;
/** Berapa detik perpanjangan saat ada bid di window anti-snipe */
export declare const ANTI_SNIPE_EXTENSION_SEC = 60;
/** Pesan yang ditampilkan saat anti-snipe aktif */
export declare const ANTI_SNIPE_MESSAGE = "A new claim has been declared \u2014 the clock extends.";
/** Anti-snipe config object — dipakai oleh LiveAuctionGateway */
export declare const ANTI_SNIPE: {
    readonly THRESHOLD_SECONDS: 60;
    readonly EXTENSION_SECONDS: 60;
    readonly MESSAGE: "A new claim has been declared — the clock extends.";
};
/** Semua WebSocket event names — gunakan ini, jangan hardcode string */
export declare const WS_EVENTS: {
    readonly BID_NEW: "bid:new";
    readonly TIMER_UPDATE: "timer:update";
    readonly TIMER_EXTENDED: "timer:extended";
    readonly AUCTION_ENDED: "auction:ended";
    readonly PRICE_DECREASED: "price:decreased";
    readonly VIEWER_COUNT: "viewer:count";
    readonly RANK_CHANGED: "rank:changed";
    readonly EVENT_STARTED: "event:started";
    readonly EVENT_ENDED: "event:ended";
    readonly JOIN_AUCTION: "join-auction";
    readonly LEAVE_AUCTION: "leave-auction";
    readonly PLACE_BID: "bid:place";
};
//# sourceMappingURL=auction.d.ts.map