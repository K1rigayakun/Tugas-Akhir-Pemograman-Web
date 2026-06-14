import { Global, Module, forwardRef } from "@nestjs/common";
import { RankService } from './rank.service';
import { RankController } from './rank.controller';
import { BidModule } from '../bid/bid.module';

@Global()
@Module({
  imports: [forwardRef(() => BidModule)],
  controllers: [RankController],
  providers: [RankService],
  exports: [RankService],
})
export class RankModule {}
