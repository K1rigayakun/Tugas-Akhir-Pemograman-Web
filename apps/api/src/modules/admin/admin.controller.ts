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
  UseInterceptors,
  UploadedFile,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
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
@Controller("v1/admin")
@UseGuards(AuthGuard, RolesGuard)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly storageService: StorageService,
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

  @Get("dashboard/chart")
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.AUCTION_MANAGER, AdminRole.SUPPORT_OFFICER)
  async getDashboardChart() {
    return this.adminService.getDashboardChart();
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

  @Get("museum/items")
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.CONTENT_MANAGER)
  async getMuseumItems(@Query("page") page: number = 1) {
    return this.adminService.getMuseumItems(page);
  }

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

  @Get("events")
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.CONTENT_MANAGER)
  async getEvents(@Query("page") page: number = 1) {
    return this.adminService.getEvents(page);
  }

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

  // ============================================================
  // EKSPANSI FASE 3: FINANCE, COSMETICS, ACHIEVEMENTS, CONTENT, SECURITY
  // ============================================================

  @Get("finance/transactions")
  @Roles(AdminRole.SUPER_ADMIN)
  async getTransactions(@Query("page") page: number = 1) {
    return this.adminService.getTransactions(page);
  }

  @Post("finance/transactions/:id/refund")
  @Roles(AdminRole.SUPER_ADMIN)
  async processManualRefund(@Param("id") id: string, @Body() body: { reason: string }, @Req() req: any) {
    return this.adminService.processManualRefund(req.user.id, id, body.reason, req.ip);
  }

  @Get("cosmetics")
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.CONTENT_MANAGER)
  async getCosmetics() {
    return this.adminService.getCosmetics();
  }

  @Post("cosmetics")
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.CONTENT_MANAGER)
  @UseInterceptors(FileInterceptor('file'))
  async createCosmetic(@UploadedFile() file: Express.Multer.File, @Body() body: any, @Req() req: any) {
    let fileUrl = "";
    if (file) {
      fileUrl = await this.storageService.uploadFile(file, 'cosmetics');
    }
    return this.adminService.createCosmetic(req.user.id, body, fileUrl, req.ip);
  }

  @Get("achievements")
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.CONTENT_MANAGER)
  async getAchievements() {
    return this.adminService.getAchievements();
  }

  @Post("achievements")
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.CONTENT_MANAGER)
  async createAchievement(@Body() body: any, @Req() req: any) {
    return this.adminService.createAchievement(req.user.id, body, req.ip);
  }

  @Get("content")
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.CONTENT_MANAGER)
  async getContent(@Query("type") type?: string) {
    return this.adminService.getContent(type);
  }

  @Post("content")
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.CONTENT_MANAGER)
  @UseInterceptors(FileInterceptor('file'))
  async createContent(@UploadedFile() file: Express.Multer.File, @Body() body: any, @Req() req: any) {
    let fileUrl = "";
    if (file) {
      fileUrl = await this.storageService.uploadFile(file, 'content');
    }
    return this.adminService.createContent(req.user.id, body, fileUrl, req.ip);
  }

  @Get("security/rules")
  @Roles(AdminRole.SUPER_ADMIN)
  async getSecurityRules() {
    return this.adminService.getSecurityRules();
  }

  @Post("security/rules")
  @Roles(AdminRole.SUPER_ADMIN)
  async createSecurityRule(@Body() body: any, @Req() req: any) {
    return this.adminService.createSecurityRule(req.user.id, body, req.ip);
  }
}
