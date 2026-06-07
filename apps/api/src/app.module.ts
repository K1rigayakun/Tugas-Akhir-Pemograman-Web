import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { APP_GUARD } from "@nestjs/core";
import { HealthModule } from "./common/health/health.module";
import { EncryptionModule } from "./common/encryption/encryption.module";
import { AuthModule } from "./modules/auth/auth.module";
import { AuditModule } from "./modules/audit/audit.module";
import { AdminModule } from "./modules/admin/admin.module";
import { LiveAuctionModule } from "./modules/live-auction/live-auction.module";
import { StorageModule } from "./modules/storage/storage.module";
import { WalletModule } from "./modules/wallet/wallet.module";
import { BidModule } from "./modules/bid/bid.module";
import { RankModule } from "./modules/rank/rank.module";
import { AchievementModule } from "./modules/achievement/achievement.module";
import { AuctionModule } from "./modules/auction/auction.module";
import { GamificationModule } from "./modules/gamification/gamification.module";
import { UserAuthModule } from "./auth/auth.module";

@Module({
  imports: [
    // Environment variables
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: "../../.env",
    }),

    // Rate limiting global — berlaku untuk SEMUA endpoint
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.THROTTLE_TTL || "60") * 1000,
        limit: parseInt(process.env.THROTTLE_LIMIT || "100"),
      },
    ]),

    // Core
    HealthModule,
    EncryptionModule,
    AuthModule,
    UserAuthModule,

    // Feature modules
    AuditModule,
    AdminModule,
    LiveAuctionModule,
    StorageModule,
    WalletModule,
    BidModule,
    RankModule,
    AchievementModule,
    AuctionModule,
    GamificationModule,
  ],
  providers: [
    // ThrottlerGuard global — semua endpoint terlindungi rate limit
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
