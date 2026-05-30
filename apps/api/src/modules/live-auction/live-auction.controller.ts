import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ThrottlerGuard } from "@nestjs/throttler";
import { LiveAuctionService } from "./live-auction.service";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles, AdminRole } from "../../common/decorators/roles.decorator";

/**
 * LiveAuctionController — Endpoint REST untuk live auction.
 *
 * Prefix: /api/v1/live-auctions (public)
 *         /api/v1/admin/live-auctions (admin only)
 */
@Controller()
@UseGuards(ThrottlerGuard)
export class LiveAuctionController {
  constructor(private liveAuctionService: LiveAuctionService) {}

  // --- Public endpoints ---

  /** Daftar live auction yang sedang berlangsung */
  @Get("live-auctions/active")
  async getActiveLiveAuctions() {
    return this.liveAuctionService.getActiveLiveAuctions();
  }

  /** Token Agora untuk join video streaming */
  @Get("live-auctions/token")
  async getAgoraToken(
    @Query("channel") channel: string,
    @Query("uid") uid: string,
  ) {
    return this.liveAuctionService.generateAgoraToken(channel, parseInt(uid) || 0);
  }

  // --- Admin endpoints ---

  /** Mulai sesi live auction */
  @Post("admin/live-auctions/start")
  @UseGuards(RolesGuard)
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.AUCTION_MANAGER)
  async startLiveSession(
    @Query("auctionId") auctionId: string,
    @Req() req: any,
  ) {
    return this.liveAuctionService.startLiveSession(req.user?.id, auctionId, req.ip);
  }

  /** Akhiri sesi live auction */
  @Post("admin/live-auctions/:id/end")
  @UseGuards(RolesGuard)
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.AUCTION_MANAGER)
  async endLiveSession(@Param("id") auctionId: string, @Req() req: any) {
    return this.liveAuctionService.endLiveSession(req.user?.id, auctionId, req.ip);
  }
}
