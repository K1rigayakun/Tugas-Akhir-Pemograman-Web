import { Controller, Post, Body, Param, Req, UseGuards } from '@nestjs/common';
import { BidService } from './bid.service';
import { PlaceBidDto } from './dto/place-bid.dto';
import { AuthGuard } from '../../common/auth/auth.guard';

@Controller("auctions")
@UseGuards(AuthGuard)
export class BidController {
  constructor(private readonly bidService: BidService) {}

  /**
   * Mengajukan penawaran bid normal pada lelang tertentu
   */
  @Post(':id/bids')
  async placeBid(
    @Param('id') auctionId: string,
    @Req() req: any,
    @Body() dto: PlaceBidDto,
  ) {
    return this.bidService.placeBid(auctionId, req.user.id, dto.amount, dto.idempotencyKey);
  }

  /**
   * Memasang Phantom Bid (Shadow Pledge) - auto-bid otomatis hingga batas maksimum
   */
  @Post(':id/phantom-bid')
  async placePhantomBid(
    @Param('id') auctionId: string,
    @Req() req: any,
    @Body() body: { maxAmount: number; idempotencyKey: string },
  ) {
    return this.bidService.placePhantomBid(auctionId, req.user.id, body.maxAmount, body.idempotencyKey);
  }
}
