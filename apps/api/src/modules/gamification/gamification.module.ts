import { Module } from '@nestjs/common';
import { GamificationService } from './gamification.service';
import { GamificationController } from './gamification.controller';
import { BidModule } from '../bid/bid.module';
import { RankModule } from '../rank/rank.module';

@Module({
  imports: [BidModule, RankModule],
  controllers: [GamificationController],
  providers: [GamificationService],
  exports: [GamificationService],
})
export class GamificationModule {}
