"use strict";
// ============================================================
// Routes — Semua rute platform
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROUTES = void 0;
exports.ROUTES = {
    HOME: "/",
    AUCTION_LIST: "/auction",
    AUCTION_ITEM: (id) => `/auction/${id}`,
    PROFILE: (username) => `/profile/${username}`,
    WALLET: "/wallet",
    SHOP: "/shop",
    LEADERBOARD: "/leaderboard",
    MUSEUM: "/museum",
    ACHIEVEMENTS: "/achievements",
    EVENTS: "/events",
    SETTINGS: "/settings",
    NOTIFICATIONS: "/notifications",
    LOGIN: "/login",
    REGISTER: "/register",
    KYC: "/kyc",
    HELP: "/help",
    ADMIN: "/admin",
};
//# sourceMappingURL=routes.js.map