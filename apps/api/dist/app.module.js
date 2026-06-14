"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
const core_1 = require("@nestjs/core");
const event_emitter_1 = require("@nestjs/event-emitter");
const schedule_1 = require("@nestjs/schedule");
const health_module_1 = require("./common/health/health.module");
const encryption_module_1 = require("./common/encryption/encryption.module");
const auth_module_1 = require("./modules/auth/auth.module");
const audit_module_1 = require("./modules/audit/audit.module");
const admin_module_1 = require("./modules/admin/admin.module");
const live_auction_module_1 = require("./modules/live-auction/live-auction.module");
const storage_module_1 = require("./modules/storage/storage.module");
const wallet_module_1 = require("./modules/wallet/wallet.module");
const bid_module_1 = require("./modules/bid/bid.module");
const rank_module_1 = require("./modules/rank/rank.module");
const achievement_module_1 = require("./modules/achievement/achievement.module");
const auction_module_1 = require("./modules/auction/auction.module");
const gamification_module_1 = require("./modules/gamification/gamification.module");
const auth_module_2 = require("./auth/auth.module");
const kyc_module_1 = require("./modules/kyc/kyc.module");
const notification_module_1 = require("./modules/notification/notification.module");
const shop_module_1 = require("./modules/shop/shop.module");
const discovery_module_1 = require("./modules/discovery/discovery.module");
const upload_module_1 = require("./modules/upload/upload.module");
const vault_module_1 = require("./modules/vault/vault.module");
const ai_module_1 = require("./modules/ai/ai.module");
const payment_module_1 = require("./modules/payment/payment.module");
const delivery_module_1 = require("./modules/delivery/delivery.module");
const leaderboard_module_1 = require("./modules/leaderboard/leaderboard.module");
const museum_module_1 = require("./modules/museum/museum.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            // Environment variables
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: "../../.env",
            }),
            // Rate limiting global — berlaku untuk SEMUA endpoint
            throttler_1.ThrottlerModule.forRoot([
                {
                    ttl: parseInt(process.env.THROTTLE_TTL || "60") * 1000,
                    limit: parseInt(process.env.THROTTLE_LIMIT || "100"),
                },
            ]),
            // Events
            event_emitter_1.EventEmitterModule.forRoot(),
            schedule_1.ScheduleModule.forRoot(),
            // Core
            health_module_1.HealthModule,
            encryption_module_1.EncryptionModule,
            auth_module_1.AuthModule,
            auth_module_2.UserAuthModule,
            audit_module_1.AuditModule,
            admin_module_1.AdminModule,
            live_auction_module_1.LiveAuctionModule,
            storage_module_1.StorageModule,
            wallet_module_1.WalletModule,
            bid_module_1.BidModule,
            rank_module_1.RankModule,
            achievement_module_1.AchievementModule,
            auction_module_1.AuctionModule,
            gamification_module_1.GamificationModule,
            kyc_module_1.KycModule,
            notification_module_1.NotificationModule,
            shop_module_1.ShopModule,
            discovery_module_1.DiscoveryModule,
            upload_module_1.UploadModule,
            vault_module_1.VaultModule,
            ai_module_1.AiModule,
            payment_module_1.PaymentModule,
            delivery_module_1.DeliveryModule,
            leaderboard_module_1.LeaderboardModule,
            museum_module_1.MuseumModule,
        ],
        providers: [
            // ThrottlerGuard global — semua endpoint terlindungi rate limit
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_1.ThrottlerGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map