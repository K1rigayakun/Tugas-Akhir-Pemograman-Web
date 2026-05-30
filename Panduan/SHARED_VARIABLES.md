# 🔗 Emerald Kingdom — Shared Variables

Semua konstanta, enum, dan variabel yang dipakai bersama oleh seluruh tim.
Didefinisikan di `packages/types/src/`.

**Aturan:** Jangan mendefinisikan ulang di tempat lain. Kalau sudah ada di sini, pakai yang ini.

---

## Identitas Aplikasi

```ts
export const APP_NAME        = "Emerald Kingdom";
export const APP_TAGLINE     = "Where Fortune Meets Glory.";
export const APP_SUBTAGLINE  = "Bid. Conquer. Ascend.";

export const CURRENCY_NAME   = "Crown Coin";
export const CURRENCY_SHORT  = "CC";
export const CURRENCY_SYMBOL = "♛";

// Format tampilan: ♛ 12,500 CC
export const formatCC = (amount: number) =>
  `${CURRENCY_SYMBOL} ${amount.toLocaleString("id-ID")} ${CURRENCY_SHORT}`;
```

---

## Enum Rank

```ts
export enum Rank {
  CIVIS     = "CIVIS",
  MERCHANT  = "MERCHANT",
  KNIGHT    = "KNIGHT",
  BARON     = "BARON",
  VISCOUNT  = "VISCOUNT",
  EARL      = "EARL",
  MARQUIS   = "MARQUIS",
  DUKE      = "DUKE",
  SOVEREIGN = "SOVEREIGN",
  EMPEROR   = "EMPEROR",
}
```

### EXP yang Dibutuhkan Per Rank

```ts
export const RANK_EXP_THRESHOLDS: Record<Rank, number> = {
  [Rank.CIVIS]:     0,
  [Rank.MERCHANT]:  500,
  [Rank.KNIGHT]:    2_000,
  [Rank.BARON]:     8_000,
  [Rank.VISCOUNT]:  25_000,
  [Rank.EARL]:      80_000,
  [Rank.MARQUIS]:   250_000,
  [Rank.DUKE]:      600_000,
  [Rank.SOVEREIGN]: 1_000_000,
  [Rank.EMPEROR]:   2_000_000,
};
```

### Gelar Per Rank

```ts
export const RANK_TITLES: Record<Rank, string> = {
  [Rank.CIVIS]:     "The Civis",
  [Rank.MERCHANT]:  "The Merchant",
  [Rank.KNIGHT]:    "Sir / Dame {username}",
  [Rank.BARON]:     "Baron / Baroness of {username}",
  [Rank.VISCOUNT]:  "Viscount / Viscountess",
  [Rank.EARL]:      "Earl / Countess of {username}",
  [Rank.MARQUIS]:   "Marquis / Marchioness",
  [Rank.DUKE]:      "Duke / Duchess of {username}",
  [Rank.SOVEREIGN]: "The Sovereign",
  [Rank.EMPEROR]:   "The Emperor",
};
```

### CSS Variable Per Rank

```ts
export const RANK_THEME: Record<Rank, { accent: string; glow: string }> = {
  [Rank.CIVIS]:     { accent: "#4A7C6A", glow: "rgba(74,124,106,0.2)"   },
  [Rank.MERCHANT]:  { accent: "#5A8F7A", glow: "rgba(90,143,122,0.25)"  },
  [Rank.KNIGHT]:    { accent: "#CD7F32", glow: "rgba(205,127,50,0.3)"   },
  [Rank.BARON]:     { accent: "#CD7F32", glow: "rgba(205,127,50,0.35)"  },
  [Rank.VISCOUNT]:  { accent: "#C0C0C0", glow: "rgba(192,192,192,0.3)"  },
  [Rank.EARL]:      { accent: "#C9A84C", glow: "rgba(201,168,76,0.35)"  },
  [Rank.MARQUIS]:   { accent: "#C9A84C", glow: "rgba(201,168,76,0.4)"   },
  [Rank.DUKE]:      { accent: "#E8A020", glow: "rgba(232,160,32,0.45)"  },
  [Rank.SOVEREIGN]: { accent: "#E5E4E2", glow: "rgba(229,228,226,0.4)"  },
  [Rank.EMPEROR]:   { accent: "#FFD700", glow: "rgba(255,215,0,0.5)"    },
};
```

---

## Enum Rarity

```ts
// Untuk item lelang
export enum ItemRarity {
  COMMON       = "COMMON",
  UNCOMMON     = "UNCOMMON",
  RARE         = "RARE",
  EPIC         = "EPIC",
  LEGENDARY    = "LEGENDARY",
  TRANSCENDENT = "TRANSCENDENT",
}

// Untuk cosmetic
export enum CosmeticRarity {
  COMMON    = "COMMON",
  UNCOMMON  = "UNCOMMON",
  RARE      = "RARE",
  EPIC      = "EPIC",
  LEGENDARY = "LEGENDARY",
  MYTHIC    = "MYTHIC",
}

export const RARITY_COLOR: Record<ItemRarity, string> = {
  [ItemRarity.COMMON]:       "#9E9E9E",
  [ItemRarity.UNCOMMON]:     "#4CAF50",
  [ItemRarity.RARE]:         "#2196F3",
  [ItemRarity.EPIC]:         "#9C27B0",
  [ItemRarity.LEGENDARY]:    "#FF9800",
  [ItemRarity.TRANSCENDENT]: "#F44336",
};
```

---

## Enum Status Lelang & Tipe

```ts
export enum AuctionType {
  STANDARD     = "STANDARD",
  SCHEDULED    = "SCHEDULED",
  LIVE         = "LIVE",
  RANK_EXCL    = "RANK_EXCL",
  SEALED_CHEST = "SEALED_CHEST",
  DESCENDING   = "DESCENDING",
}

export enum AuctionStatus {
  DRAFT     = "DRAFT",
  UPCOMING  = "UPCOMING",
  ACTIVE    = "ACTIVE",
  ENDING    = "ENDING",    // 60 detik terakhir
  ENDED     = "ENDED",
  CANCELLED = "CANCELLED",
}

export enum BidStatus {
  ACTIVE   = "ACTIVE",
  OUTBID   = "OUTBID",
  WON      = "WON",
  REFUNDED = "REFUNDED",
}
```

---

## Enum KYC, Wallet, Notifikasi, Privasi

```ts
export enum KYCStatus {
  NONE     = "NONE",
  PENDING  = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export enum WalletTxType {
  TOP_UP        = "TOP_UP",
  BID_HOLD      = "BID_HOLD",
  BID_RELEASE   = "BID_RELEASE",
  BID_DEDUCT    = "BID_DEDUCT",
  CASHBACK      = "CASHBACK",
  SHOP_PURCHASE = "SHOP_PURCHASE",
  REFUND        = "REFUND",
  BONUS         = "BONUS",
}

export enum NotifType {
  OUTBID              = "OUTBID",
  AUCTION_ENDING_SOON = "AUCTION_ENDING_SOON",
  YOU_WON             = "YOU_WON",
  LIVE_AUCTION_START  = "LIVE_AUCTION_START",
  RANK_UP             = "RANK_UP",
  NEW_ACHIEVEMENT     = "NEW_ACHIEVEMENT",
  EVENT_STARTING      = "EVENT_STARTING",
  CASHBACK_RECEIVED   = "CASHBACK_RECEIVED",
  KYC_STATUS          = "KYC_STATUS",
  SECURITY_ALERT      = "SECURITY_ALERT",
  EMPEROR_ASCENSION   = "EMPEROR_ASCENSION",
}

export enum PrivacyMode {
  PUBLIC    = "PUBLIC",
  ANONYMOUS = "ANONYMOUS",
  SHADOW    = "SHADOW",
}
```

---

## Konstanta EXP

```ts
export const EXP_REWARDS = {
  WIN_AUCTION:          100,
  PLACE_BID:            5,
  DAILY_LOGIN:          3,
  LOGIN_STREAK_7_DAYS:  50,
  WATCH_LIVE_FULL:      15,
  WIN_LIVE_AUCTION:     150,
  TOPUP_PER_10K_CC:     10,
  ACHIEVEMENT_COMMON:   50,
  ACHIEVEMENT_RARE:     200,
  ACHIEVEMENT_EPIC:     500,
  SUBMIT_ITEM_ACCEPTED: 50,
} as const;

export const WIN_STREAK_MULTIPLIER: Record<number, number> = {
  3:  1.5,
  5:  2.0,
  10: 3.0,
};
```

---

## Cashback & Showcase Per Rank

```ts
export const CASHBACK_RATE: Record<Rank, number> = {
  [Rank.CIVIS]:     0,
  [Rank.MERCHANT]:  0,
  [Rank.KNIGHT]:    0,
  [Rank.BARON]:     0.02,
  [Rank.VISCOUNT]:  0.03,
  [Rank.EARL]:      0.04,
  [Rank.MARQUIS]:   0.05,
  [Rank.DUKE]:      0.06,
  [Rank.SOVEREIGN]: 0.07,
  [Rank.EMPEROR]:   0.08,
};

export const SHOWCASE_SLOTS: Record<Rank, number> = {
  [Rank.CIVIS]:     3,
  [Rank.MERCHANT]:  3,
  [Rank.KNIGHT]:    4,
  [Rank.BARON]:     5,
  [Rank.VISCOUNT]:  6,
  [Rank.EARL]:      7,
  [Rank.MARQUIS]:   8,
  [Rank.DUKE]:      10,
  [Rank.SOVEREIGN]: 12,
  [Rank.EMPEROR]:   15,
};
```

---

## Anti-Sniping

```ts
export const ANTI_SNIPE_WINDOW_SEC    = 60;
export const ANTI_SNIPE_EXTENSION_SEC = 60;
export const ANTI_SNIPE_MESSAGE       =
  "A new claim has been declared — the clock extends.";
```

---

## WebSocket Events

```ts
export const WS_EVENTS = {
  // Server → Client
  BID_NEW:         "bid:new",
  TIMER_UPDATE:    "timer:update",
  TIMER_EXTENDED:  "timer:extended",
  AUCTION_ENDED:   "auction:ended",
  PRICE_DECREASED: "price:decreased",
  VIEWER_COUNT:    "viewer:count",
  RANK_CHANGED:    "rank:changed",
  EVENT_STARTED:   "event:started",
  EVENT_ENDED:     "event:ended",

  // Client → Server
  JOIN_AUCTION:    "join-auction",
  LEAVE_AUCTION:   "leave-auction",
  PLACE_BID:       "bid:place",
} as const;
```

---

## Routes

```ts
export const ROUTES = {
  HOME:          "/",
  AUCTION_LIST:  "/auction",
  AUCTION_ITEM:  (id: string) => `/auction/${id}`,
  PROFILE:       (username: string) => `/profile/${username}`,
  WALLET:        "/wallet",
  SHOP:          "/shop",
  LEADERBOARD:   "/leaderboard",
  MUSEUM:        "/museum",
  ACHIEVEMENTS:  "/achievements",
  EVENTS:        "/events",
  SETTINGS:      "/settings",
  NOTIFICATIONS: "/notifications",
  LOGIN:         "/login",
  REGISTER:      "/register",
  KYC:           "/kyc",
  HELP:          "/help",
  ADMIN:         "/admin",
} as const;
```
