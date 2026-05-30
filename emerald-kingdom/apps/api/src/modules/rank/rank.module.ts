import { Module, Global } from '@nestjs/common';
import { RankService } from './rank.service';
import { RankController } from './rank.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { BidModule } from '../bid/bid.module';

@Global() // Di-set global agar RankService dapat diakses lelang service dan modul lainnya
@Module({
  imports: [BidModule],
  controllers: [RankController],
  providers: [RankService, PrismaService],
  exports: [RankService],
})
export class RankModule {}
