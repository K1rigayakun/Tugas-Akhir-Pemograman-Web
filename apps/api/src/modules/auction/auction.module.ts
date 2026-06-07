import { Module } from '@nestjs/common';
import { AuctionService } from './auction.service';
import { AuctionController } from './auction.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { WalletModule } from '../wallet/wallet.module';
import { RankModule } from "../rank/rank.module";

@Module({
  imports: [WalletModule, RankModule],
  controllers: [AuctionController],
  providers: [AuctionService, PrismaService],
  exports: [AuctionService],
})
export class AuctionModule {}
