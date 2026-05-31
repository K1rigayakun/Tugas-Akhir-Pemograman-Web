// ============================================================
// Emerald Kingdom — Shared Enums
// ============================================================
// Semua enum yang dipakai di seluruh project.
// JANGAN definisikan ulang di tempat lain.
// ============================================================

export enum Rank {
  CIVIS = "CIVIS",
  MERCHANT = "MERCHANT",
  KNIGHT = "KNIGHT",
  BARON = "BARON",
  VISCOUNT = "VISCOUNT",
  EARL = "EARL",
  MARQUIS = "MARQUIS",
  DUKE = "DUKE",
  SOVEREIGN = "SOVEREIGN",
  EMPEROR = "EMPEROR",
}

export enum ItemRarity {
  COMMON = "COMMON",
  UNCOMMON = "UNCOMMON",
  RARE = "RARE",
  EPIC = "EPIC",
  LEGENDARY = "LEGENDARY",
  TRANSCENDENT = "TRANSCENDENT",
}

export enum CosmeticRarity {
  COMMON = "COMMON",
  UNCOMMON = "UNCOMMON",
  RARE = "RARE",
  EPIC = "EPIC",
  LEGENDARY = "LEGENDARY",
  MYTHIC = "MYTHIC",
}

export enum AuctionType {
  STANDARD = "STANDARD",
  SCHEDULED = "SCHEDULED",
  LIVE = "LIVE",
  RANK_EXCL = "RANK_EXCL",
  SEALED_CHEST = "SEALED_CHEST",
  DESCENDING = "DESCENDING",
}

export enum AuctionStatus {
  DRAFT = "DRAFT",
  UPCOMING = "UPCOMING",
  ACTIVE = "ACTIVE",
  ENDING = "ENDING", // 60 detik terakhir
  ENDED = "ENDED",
  CANCELLED = "CANCELLED",
}

export enum BidStatus {
  ACTIVE = "ACTIVE",
  OUTBID = "OUTBID",
  WON = "WON",
  REFUNDED = "REFUNDED",
}

export enum KYCStatus {
  NONE = "NONE",
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export enum WalletTxType {
  TOP_UP = "TOP_UP",
  BID_HOLD = "BID_HOLD",
  BID_RELEASE = "BID_RELEASE",
  BID_DEDUCT = "BID_DEDUCT",
  CASHBACK = "CASHBACK",
  SHOP_PURCHASE = "SHOP_PURCHASE",
  REFUND = "REFUND",
  BONUS = "BONUS",
}

export enum NotifType {
  OUTBID = "OUTBID",
  AUCTION_ENDING_SOON = "AUCTION_ENDING_SOON",
  YOU_WON = "YOU_WON",
  LIVE_AUCTION_START = "LIVE_AUCTION_START",
  RANK_UP = "RANK_UP",
  NEW_ACHIEVEMENT = "NEW_ACHIEVEMENT",
  EVENT_STARTING = "EVENT_STARTING",
  CASHBACK_RECEIVED = "CASHBACK_RECEIVED",
  KYC_STATUS = "KYC_STATUS",
  SECURITY_ALERT = "SECURITY_ALERT",
  EMPEROR_ASCENSION = "EMPEROR_ASCENSION",
}

export enum PrivacyMode {
  PUBLIC = "PUBLIC",
  ANONYMOUS = "ANONYMOUS",
  SHADOW = "SHADOW",
}

export enum AdminRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  AUCTION_MANAGER = "AUCTION_MANAGER",
  KYC_OFFICER = "KYC_OFFICER",
  CONTENT_MANAGER = "CONTENT_MANAGER",
  SUPPORT_OFFICER = "SUPPORT_OFFICER",
}
