import { Controller, Post, Body, Param, Req, UseGuards } from '@nestjs/common';
import { BidService } from './bid.service';
import { PlaceBidDto } from './dto/place-bid.dto';

@Controller('api/v1/auctions')
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
    const userId = req.user?.id || 'dummy-user-id';
    return this.bidService.placeBid(auctionId, userId, dto.amount, dto.idempotencyKey);
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
    const userId = req.user?.id || 'dummy-user-id';
    return this.bidService.placePhantomBid(auctionId, userId, body.maxAmount, body.idempotencyKey);
  }
}
