import { Module } from '@nestjs/common';
import { BidService } from './bid.service';
import { BidGateway } from './bid.gateway';
import { PrismaService } from '../../prisma/prisma.service';
import { WalletModule } from '../wallet/wallet.module';

import { BidController } from './bid.controller';

@Module({
  imports: [WalletModule],
  controllers: [BidController],
  providers: [BidService, BidGateway, PrismaService],
  exports: [BidService, BidGateway],
})
export class BidModule {}
