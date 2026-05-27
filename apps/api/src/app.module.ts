import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerModuleOptions } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { JwtAccessGuard } from './auth/guards/jwt.guard';

@Module({
  imports: [
    // ─── Config ───────────────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // ─── Rate Limiting ────────────────────────────────────────
    /**
     * ThrottlerModule dikonfigurasi dengan DUA named throttler:
     *
     * 1. 'default' → Throttler umum untuk semua route API
     *    - 100 request per 60 detik (per IP)
     *
     * 2. 'auth' → Throttler ketat KHUSUS endpoint Auth
     *    - 5 percobaan per 300 detik (5 menit)
     *    - Jika terlampaui, user di-blokir 900 detik (15 menit)
     *
     * Endpoint Auth akan menggunakan @Throttle({ auth: { ... } })
     * untuk meng-override ke throttler 'auth'.
     */
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService): ThrottlerModuleOptions => ({
        throttlers: [
          {
            name: 'default',
            ttl: 60_000,  // 60 detik (dalam ms untuk NestJS v10+)
            limit: 100,
          },
          {
            name: 'auth',
            ttl: 300_000, // 5 menit dalam ms
            limit: 5,
            blockDuration: 900_000, // 15 menit blokir dalam ms
          },
        ],
        // Gunakan Redis storage di production untuk throttler yang
        // persistent antar instance (scale-out). Di development,
        // default in-memory storage sudah cukup.
        // storage: new ThrottlerStorageRedisService(redisClient),
      }),
      inject: [ConfigService],
    }),

    // ─── Modules ──────────────────────────────────────────────
    PrismaModule,
    AuthModule,
  ],
  providers: [
    /**
     * JwtAccessGuard di-register sebagai APP_GUARD (global guard).
     * Artinya SEMUA endpoint secara default membutuhkan JWT Access Token.
     * Gunakan @Public() decorator untuk mengecualikan endpoint tertentu.
     */
    {
      provide: APP_GUARD,
      useClass: JwtAccessGuard,
    },
  ],
})
export class AppModule {}
