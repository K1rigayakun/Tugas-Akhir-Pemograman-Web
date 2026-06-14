import { Module } from '@nestjs/common';
import { BidService } from './bid.service';
import { BidGateway } from './bid.gateway';
import { PrismaModule } from '../../prisma/prisma.module';
import { WalletModule } from '../wallet/wallet.module';
import { NotificationModule } from '../notification/notification.module';
import { AiModule } from '../ai/ai.module';
import { RankModule } from '../rank/rank.module';

import { BidController } from './bid.controller';

@Module({
  imports: [PrismaModule, WalletModule, NotificationModule, AiModule, RankModule],
  controllers: [BidController],
  providers: [BidService, BidGateway],
  exports: [BidService, BidGateway],
})
export class BidModule {}
