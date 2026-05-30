import { Module } from '@nestjs/common';
import { WalletModule } from './modules/wallet/wallet.module';
import { AuctionModule } from './modules/auction/auction.module';
import { BidModule } from './modules/bid/bid.module';
import { RankModule } from './modules/rank/rank.module';
import { AchievementModule } from './modules/achievement/achievement.module';
import { GamificationModule } from './modules/gamification/gamification.module';

@Module({
  imports: [
    WalletModule,
    AuctionModule,
    BidModule,
    RankModule,
    AchievementModule,
    GamificationModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}
