import { Module, Global } from '@nestjs/common';
import { AchievementService } from './achievement.service';
import { AchievementController } from './achievement.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { RankModule } from '../rank/rank.module';
import { BidModule } from '../bid/bid.module';

@Global() // Di-set global agar service check() bisa di-import langsung dari service lain
@Module({
  imports: [RankModule, BidModule],
  controllers: [AchievementController],
  providers: [AchievementService, PrismaService],
  exports: [AchievementService],
})
export class AchievementModule {}
