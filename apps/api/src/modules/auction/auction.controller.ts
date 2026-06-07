import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { AuctionService, AuctionStatus } from './auction.service';
import { CreateAuctionDto, AuctionType } from './dto/create-auction.dto';
import { UpdateAuctionDto } from './dto/update-auction.dto';
import { AuthGuard } from '../../common/auth/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AdminRole, Roles } from '../../common/decorators/roles.decorator';

@Controller()
export class AuctionController {
  constructor(private readonly auctionService: AuctionService) {}

  /**
   * Mendapatkan daftar semua lelang dengan filter status, tipe, dan search query
   */
  @Get('auctions')
  async getAuctions(
    @Query('status') status?: AuctionStatus,
    @Query('type') type?: AuctionType,
    @Query('query') query?: string,
  ) {
    return this.auctionService.findAll({ status, type, query });
  }

  /**
   * Mendapatkan daftar lelang yang sedang LIVE
   */
  @Get('auctions/live')
  async getLiveAuctions() {
    return this.auctionService.findAll({ status: AuctionStatus.ACTIVE, type: AuctionType.LIVE });
  }

  /**
   * Mendapatkan daftar lelang UPCOMING (mendatang)
   */
  @Get('auctions/upcoming')
  async getUpcomingAuctions() {
    return this.auctionService.findAll({ status: AuctionStatus.UPCOMING });
  }

  /**
   * Mendapatkan detail satu lelang
   */
  @Get('auctions/:id')
  async getAuctionById(@Param('id') id: string) {
    return this.auctionService.findOne(id);
  }

  /**
   * Mendapatkan riwayat bid lelang tertentu
   */
  @Get('auctions/:id/bids')
  async getAuctionBids(@Param('id') id: string) {
    return this.auctionService.getBids(id);
  }

  /**
   * Membuat draf lelang baru (Admin)
   */
  @Post('admin/auctions')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.AUCTION_MANAGER)
  async createAuction(@Body() dto: CreateAuctionDto) {
    return this.auctionService.create(dto);
  }

  /**
   * Memperbarui draf lelang (Admin)
   */
  @Put('admin/auctions/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.AUCTION_MANAGER)
  async updateAuction(@Param('id') id: string, @Body() dto: UpdateAuctionDto) {
    return this.auctionService.update(id, dto);
  }

  /**
   * Mempublikasikan lelang agar aktif (Admin)
   */
  @Post('admin/auctions/:id/publish')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.AUCTION_MANAGER)
  async publishAuction(@Param('id') id: string) {
    return this.auctionService.publish(id);
  }

  /**
   * Membatalkan lelang (Admin)
   */
  @Post('admin/auctions/:id/cancel')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.AUCTION_MANAGER)
  async cancelAuction(@Param('id') id: string) {
    return this.auctionService.cancel(id);
  }
}
