import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { AuditModule } from "./modules/audit/audit.module";
import { EncryptionModule } from "./common/encryption/encryption.module";
import { AdminModule } from "./modules/admin/admin.module";
import { LiveAuctionModule } from "./modules/live-auction/live-auction.module";

@Module({
  imports: [
    // Environment variables
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: "../../.env",
    }),

    // Rate limiting global
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.THROTTLE_TTL || "60") * 1000,
        limit: parseInt(process.env.THROTTLE_LIMIT || "100"),
      },
    ]),

    // Modules
    EncryptionModule,
    AuditModule,
    AdminModule,
    LiveAuctionModule,
  ],
})
export class AppModule {}
