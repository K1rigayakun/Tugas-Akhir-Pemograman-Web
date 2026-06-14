import { Module, Global } from '@nestjs/common';
import { AchievementService } from './achievement.service';
import { AchievementController } from './achievement.controller';
import { RankModule } from '../rank/rank.module';
import { BidModule } from '../bid/bid.module';
import { AchievementListener } from './achievement.listener';

@Global()
@Module({
  imports: [RankModule, BidModule],
  controllers: [AchievementController],
  providers: [AchievementService, AchievementListener],
  exports: [AchievementService],
})
export class AchievementModule {}
