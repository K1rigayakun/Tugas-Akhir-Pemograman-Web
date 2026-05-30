import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Query,
  Body,
  Req,
  UseGuards,
} from "@nestjs/common";
import { AdminService } from "./admin.service";
import { AuditService } from "../audit/audit.service";
import { AuthGuard } from "../../common/auth/auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles, AdminRole } from "../../common/decorators/roles.decorator";
import {
  WarnUserDto,
  SuspendUserDto,
  BanUserDto,
  CancelAuctionDto,
  RejectKYCDto,
  CurateMuseumDto,
  CreateEventDto,
} from "./dto/admin.dto";

/**
 * AdminController — Semua endpoint admin panel.
 *
 * Prefix: /api/v1/admin
 * Semua endpoint dilindungi oleh AuthGuard (JWT) + RolesGuard (RBAC).
 */
@Controller("admin")
@UseGuards(AuthGuard, RolesGuard)
export class AdminController {
  constructor(
    private adminService: AdminService,
    private auditService: AuditService,
  ) {}

  // ============================================================
  // DASHBOARD
  // ============================================================

  @Get("dashboard/stats")
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.AUCTION_MANAGER, AdminRole.SUPPORT_OFFICER)
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get("fraud-alerts")
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.SUPPORT_OFFICER)
  async getFraudAlerts() {
    return this.adminService.getFraudAlerts();
  }

  // ============================================================
  // AUDIT LOG
  // ============================================================

  @Get("audit-logs")
  @Roles(AdminRole.SUPER_ADMIN)
  async getAuditLogs(
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 50,
  ) {
    return this.auditService.getLogs(page, limit);
  }

  // ============================================================
  // KELOLA USER
  // ============================================================

  @Get("users/search")
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.SUPPORT_OFFICER)
  async searchUsers(
    @Query("q") query: string,
    @Query("page") page: number = 1,
  ) {
    return this.adminService.searchUsers(query, page);
  }

  @Get("users/:id/full-profile")
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.SUPPORT_OFFICER)
  async getUserFullProfile(@Param("id") userId: string) {
    return this.adminService.getUserFullProfile(userId);
  }

  @Post("users/:id/warn")
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.SUPPORT_OFFICER)
  async warnUser(
    @Param("id") userId: string,
    @Body() dto: WarnUserDto,
    @Req() req: any,
  ) {
    return this.adminService.warnUser(req.user.id, userId, dto.reason, req.ip);
  }

  @Post("users/:id/suspend")
  @Roles(AdminRole.SUPER_ADMIN)
  async suspendUser(
    @Param("id") userId: string,
    @Body() dto: SuspendUserDto,
    @Req() req: any,
  ) {
    return this.adminService.suspendUser(
      req.user.id, userId, dto.reason, dto.durationDays, req.ip,
    );
  }

  @Post("users/:id/ban-auction")
  @Roles(AdminRole.SUPER_ADMIN)
  async banFromAuction(
    @Param("id") userId: string,
    @Body() dto: BanUserDto,
    @Req() req: any,
  ) {
    return this.adminService.banFromAuction(req.user.id, userId, dto.reason, req.ip);
  }

  @Post("users/:id/ban-permanent")
  @Roles(AdminRole.SUPER_ADMIN)
  async banPermanent(
    @Param("id") userId: string,
    @Body() dto: BanUserDto,
    @Req() req: any,
  ) {
    return this.adminService.banPermanent(req.user.id, userId, dto.reason, req.ip);
  }

  // ============================================================
  // KELOLA LELANG
  // ============================================================

  @Get("auctions")
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.AUCTION_MANAGER)
  async getAuctions(
    @Query("status") status?: string,
    @Query("page") page: number = 1,
  ) {
    return this.adminService.getAuctions(status, page);
  }

  @Post("auctions/:id/cancel")
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.AUCTION_MANAGER)
  async cancelAuction(
    @Param("id") auctionId: string,
    @Body() dto: CancelAuctionDto,
    @Req() req: any,
  ) {
    return this.adminService.cancelAuction(req.user.id, auctionId, dto.reason, req.ip);
  }

  // ============================================================
  // REVIEW KYC
  // ============================================================

  @Get("kyc/pending")
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.KYC_OFFICER)
  async getPendingKYC(@Query("page") page: number = 1) {
    return this.adminService.getPendingKYC(page);
  }

  @Post("kyc/:id/approve")
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.KYC_OFFICER)
  async approveKYC(@Param("id") kycId: string, @Req() req: any) {
    return this.adminService.approveKYC(req.user.id, kycId, req.ip);
  }

  @Post("kyc/:id/reject")
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.KYC_OFFICER)
  async rejectKYC(
    @Param("id") kycId: string,
    @Body() dto: RejectKYCDto,
    @Req() req: any,
  ) {
    return this.adminService.rejectKYC(req.user.id, kycId, dto.notes, req.ip);
  }

  // ============================================================
  // KELOLA MUSEUM
  // ============================================================

  @Post("museum/items/:auctionId")
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.CONTENT_MANAGER)
  async curateToMuseum(
    @Param("auctionId") auctionId: string,
    @Body() dto: CurateMuseumDto,
    @Req() req: any,
  ) {
    return this.adminService.curateToMuseum(req.user.id, auctionId, dto.editorial, req.ip);
  }

  // ============================================================
  // KELOLA EVENT
  // ============================================================

  @Post("events")
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.CONTENT_MANAGER)
  async createEvent(@Body() dto: CreateEventDto, @Req() req: any) {
    return this.adminService.createEvent(req.user.id, {
      ...dto,
      startTime: new Date(dto.startTime),
      endTime: new Date(dto.endTime),
    }, req.ip);
  }

  @Put("events/:id/activate")
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.CONTENT_MANAGER)
  async activateEvent(@Param("id") eventId: string, @Req() req: any) {
    return this.adminService.activateEvent(req.user.id, eventId, req.ip);
  }

  @Put("events/:id/end")
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.CONTENT_MANAGER)
  async endEvent(@Param("id") eventId: string, @Req() req: any) {
    return this.adminService.endEvent(req.user.id, eventId, req.ip);
  }
}
