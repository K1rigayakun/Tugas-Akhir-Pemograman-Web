import { Controller, Get, Post, Param, Query, Body, Req, UseGuards } from "@nestjs/common";
import { LiveAuctionService } from "./live-auction.service";
import { AuthGuard } from "../../common/auth/auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles, AdminRole } from "../../common/decorators/roles.decorator";

/**
 * LiveAuctionController — REST endpoints untuk live auction.
 *
 * Prefix: /api/v1/live-auction
 *
 * Endpoints publik:
 * - GET /active — Daftar live auction yang sedang berlangsung
 * - GET /:id/token — Generate Agora token untuk join streaming
 *
 * Endpoints admin:
 * - POST /:id/start — Mulai sesi live auction
 * - POST /:id/end — Akhiri sesi live auction
 */
@Controller("live-auction")
export class LiveAuctionController {
  constructor(private liveAuctionService: LiveAuctionService) {}

  // ============================================================
  // PUBLIC ENDPOINTS
  // ============================================================

  /** Daftar live auction yang sedang berlangsung */
  @Get("active")
  async getActiveLiveAuctions() {
    return this.liveAuctionService.getActiveLiveAuctions();
  }

  /**
   * Generate Agora token untuk join video streaming.
   * User harus login.
   */
  @Get(":id/token")
  @UseGuards(AuthGuard)
  async getAgoraToken(
    @Param("id") auctionId: string,
    @Query("uid") uid: number = 0,
    @Query("role") role: string = "audience",
  ) {
    const isHost = role === "host";
    return this.liveAuctionService.getAgoraToken(auctionId, uid, isHost);
  }

  // ============================================================
  // ADMIN ENDPOINTS
  // ============================================================

  /** Mulai sesi live auction */
  @Post(":id/start")
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.AUCTION_MANAGER)
  async startLiveSession(
    @Param("id") auctionId: string,
    @Req() req: any,
  ) {
    return this.liveAuctionService.startLiveSession(req.user.id, auctionId, req.ip);
  }

  /** Akhiri sesi live auction */
  @Post(":id/end")
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.AUCTION_MANAGER)
  async endLiveSession(
    @Param("id") auctionId: string,
    @Req() req: any,
  ) {
    return this.liveAuctionService.endLiveSession(req.user.id, auctionId, req.ip);
  }
}
