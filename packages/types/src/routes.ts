// ============================================================
// Routes — Semua rute platform
// ============================================================

export const ROUTES = {
  HOME: "/",
  AUCTION_LIST: "/auction",
  AUCTION_ITEM: (id: string) => `/auction/${id}`,
  PROFILE: (username: string) => `/profile/${username}`,
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
} as const;
