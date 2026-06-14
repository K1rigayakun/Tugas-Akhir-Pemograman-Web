"use strict";
// ============================================================
// Emerald Kingdom — Shared Enums
// ============================================================
// Semua enum yang dipakai di seluruh project.
// JANGAN definisikan ulang di tempat lain.
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminRole = exports.PrivacyMode = exports.NotifType = exports.WalletTxType = exports.KYCStatus = exports.BidStatus = exports.AuctionStatus = exports.AuctionType = exports.CosmeticRarity = exports.ItemRarity = exports.Rank = void 0;
var Rank;
(function (Rank) {
    Rank["CIVIS"] = "CIVIS";
    Rank["MERCHANT"] = "MERCHANT";
    Rank["KNIGHT"] = "KNIGHT";
    Rank["BARON"] = "BARON";
    Rank["VISCOUNT"] = "VISCOUNT";
    Rank["EARL"] = "EARL";
    Rank["MARQUIS"] = "MARQUIS";
    Rank["DUKE"] = "DUKE";
    Rank["SOVEREIGN"] = "SOVEREIGN";
    Rank["EMPEROR"] = "EMPEROR";
})(Rank || (exports.Rank = Rank = {}));
var ItemRarity;
(function (ItemRarity) {
    ItemRarity["COMMON"] = "COMMON";
    ItemRarity["UNCOMMON"] = "UNCOMMON";
    ItemRarity["RARE"] = "RARE";
    ItemRarity["EPIC"] = "EPIC";
    ItemRarity["LEGENDARY"] = "LEGENDARY";
    ItemRarity["TRANSCENDENT"] = "TRANSCENDENT";
})(ItemRarity || (exports.ItemRarity = ItemRarity = {}));
var CosmeticRarity;
(function (CosmeticRarity) {
    CosmeticRarity["COMMON"] = "COMMON";
    CosmeticRarity["UNCOMMON"] = "UNCOMMON";
    CosmeticRarity["RARE"] = "RARE";
    CosmeticRarity["EPIC"] = "EPIC";
    CosmeticRarity["LEGENDARY"] = "LEGENDARY";
    CosmeticRarity["MYTHIC"] = "MYTHIC";
})(CosmeticRarity || (exports.CosmeticRarity = CosmeticRarity = {}));
var AuctionType;
(function (AuctionType) {
    AuctionType["STANDARD"] = "STANDARD";
    AuctionType["SCHEDULED"] = "SCHEDULED";
    AuctionType["LIVE"] = "LIVE";
    AuctionType["RANK_EXCL"] = "RANK_EXCL";
    AuctionType["SEALED_CHEST"] = "SEALED_CHEST";
    AuctionType["DESCENDING"] = "DESCENDING";
})(AuctionType || (exports.AuctionType = AuctionType = {}));
var AuctionStatus;
(function (AuctionStatus) {
    AuctionStatus["DRAFT"] = "DRAFT";
    AuctionStatus["UPCOMING"] = "UPCOMING";
    AuctionStatus["ACTIVE"] = "ACTIVE";
    AuctionStatus["ENDING"] = "ENDING";
    AuctionStatus["ENDED"] = "ENDED";
    AuctionStatus["CANCELLED"] = "CANCELLED";
})(AuctionStatus || (exports.AuctionStatus = AuctionStatus = {}));
var BidStatus;
(function (BidStatus) {
    BidStatus["ACTIVE"] = "ACTIVE";
    BidStatus["OUTBID"] = "OUTBID";
    BidStatus["WON"] = "WON";
    BidStatus["REFUNDED"] = "REFUNDED";
})(BidStatus || (exports.BidStatus = BidStatus = {}));
var KYCStatus;
(function (KYCStatus) {
    KYCStatus["NONE"] = "NONE";
    KYCStatus["PENDING"] = "PENDING";
    KYCStatus["APPROVED"] = "APPROVED";
    KYCStatus["REJECTED"] = "REJECTED";
})(KYCStatus || (exports.KYCStatus = KYCStatus = {}));
var WalletTxType;
(function (WalletTxType) {
    WalletTxType["TOP_UP"] = "TOP_UP";
    WalletTxType["BID_HOLD"] = "BID_HOLD";
    WalletTxType["BID_RELEASE"] = "BID_RELEASE";
    WalletTxType["BID_DEDUCT"] = "BID_DEDUCT";
    WalletTxType["CASHBACK"] = "CASHBACK";
    WalletTxType["SHOP_PURCHASE"] = "SHOP_PURCHASE";
    WalletTxType["REFUND"] = "REFUND";
    WalletTxType["BONUS"] = "BONUS";
})(WalletTxType || (exports.WalletTxType = WalletTxType = {}));
var NotifType;
(function (NotifType) {
    NotifType["OUTBID"] = "OUTBID";
    NotifType["AUCTION_ENDING_SOON"] = "AUCTION_ENDING_SOON";
    NotifType["YOU_WON"] = "YOU_WON";
    NotifType["LIVE_AUCTION_START"] = "LIVE_AUCTION_START";
    NotifType["RANK_UP"] = "RANK_UP";
    NotifType["NEW_ACHIEVEMENT"] = "NEW_ACHIEVEMENT";
    NotifType["EVENT_STARTING"] = "EVENT_STARTING";
    NotifType["CASHBACK_RECEIVED"] = "CASHBACK_RECEIVED";
    NotifType["KYC_STATUS"] = "KYC_STATUS";
    NotifType["SECURITY_ALERT"] = "SECURITY_ALERT";
    NotifType["EMPEROR_ASCENSION"] = "EMPEROR_ASCENSION";
})(NotifType || (exports.NotifType = NotifType = {}));
var PrivacyMode;
(function (PrivacyMode) {
    PrivacyMode["PUBLIC"] = "PUBLIC";
    PrivacyMode["ANONYMOUS"] = "ANONYMOUS";
    PrivacyMode["SHADOW"] = "SHADOW";
})(PrivacyMode || (exports.PrivacyMode = PrivacyMode = {}));
var AdminRole;
(function (AdminRole) {
    AdminRole["SUPER_ADMIN"] = "SUPER_ADMIN";
    AdminRole["AUCTION_MANAGER"] = "AUCTION_MANAGER";
    AdminRole["KYC_OFFICER"] = "KYC_OFFICER";
    AdminRole["CONTENT_MANAGER"] = "CONTENT_MANAGER";
    AdminRole["SUPPORT_OFFICER"] = "SUPPORT_OFFICER";
})(AdminRole || (exports.AdminRole = AdminRole = {}));
//# sourceMappingURL=enums.js.map