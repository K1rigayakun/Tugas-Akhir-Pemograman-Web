"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const admin_service_1 = require("./admin.service");
const audit_service_1 = require("../audit/audit.service");
const storage_service_1 = require("../storage/storage.service");
const auth_guard_1 = require("../../common/auth/auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const admin_dto_1 = require("./dto/admin.dto");
/**
 * AdminController — Semua endpoint admin panel.
 *
 * Prefix: /api/v1/admin
 * Semua endpoint dilindungi oleh AuthGuard (JWT) + RolesGuard (RBAC).
 */
let AdminController = class AdminController {
    constructor(adminService, storageService, auditService) {
        this.adminService = adminService;
        this.storageService = storageService;
        this.auditService = auditService;
    }
    // ============================================================
    // DASHBOARD
    // ============================================================
    async getDashboardStats() {
        return this.adminService.getDashboardStats();
    }
    async getDashboardChart() {
        return this.adminService.getDashboardChart();
    }
    async getFraudAlerts() {
        return this.adminService.getFraudAlerts();
    }
    // ============================================================
    // AUDIT LOG
    // ============================================================
    async getAuditLogs(page = 1, limit = 50) {
        return this.auditService.getLogs(page, limit);
    }
    // ============================================================
    // KELOLA USER
    // ============================================================
    async searchUsers(query, page = 1) {
        return this.adminService.searchUsers(query, page);
    }
    async getUserFullProfile(userId) {
        return this.adminService.getUserFullProfile(userId);
    }
    async warnUser(userId, dto, req) {
        return this.adminService.warnUser(req.user.id, userId, dto.reason, req.ip);
    }
    async suspendUser(userId, dto, req) {
        return this.adminService.suspendUser(req.user.id, userId, dto.reason, dto.durationDays, req.ip);
    }
    async banFromAuction(userId, dto, req) {
        return this.adminService.banFromAuction(req.user.id, userId, dto.reason, req.ip);
    }
    async banPermanent(userId, dto, req) {
        return this.adminService.banPermanent(req.user.id, userId, dto.reason, req.ip);
    }
    // ============================================================
    // KELOLA LELANG
    // ============================================================
    async getAuctions(status, type, page = 1) {
        return this.adminService.getAuctions(status, type, page);
    }
    async createAuction(dto, req) {
        return this.adminService.createAuction(req.user.id, dto, req.ip);
    }
    async cancelAuction(auctionId, dto, req) {
        return this.adminService.cancelAuction(req.user.id, auctionId, dto.reason, req.ip);
    }
    // ============================================================
    // REVIEW KYC
    // ============================================================
    async getPendingKYC(page = "1") {
        return this.adminService.getPendingKYC(parseInt(page, 10) || 1);
    }
    async approveKYC(kycId, req) {
        return this.adminService.approveKYC(req.user.id, kycId, req.ip);
    }
    async rejectKYC(kycId, dto, req) {
        return this.adminService.rejectKYC(req.user.id, kycId, dto.notes, req.ip);
    }
    // ============================================================
    // KELOLA MUSEUM
    // ============================================================
    async getMuseumItems(page = 1) {
        return this.adminService.getMuseumItems(page);
    }
    async curateToMuseum(auctionId, dto, req) {
        return this.adminService.curateToMuseum(req.user.id, auctionId, dto.editorial, req.ip);
    }
    // ============================================================
    // KELOLA EVENT
    // ============================================================
    async getEvents(page = 1) {
        return this.adminService.getEvents(page);
    }
    async createEvent(dto, req) {
        return this.adminService.createEvent(req.user.id, {
            ...dto,
            startTime: new Date(dto.startTime),
            endTime: new Date(dto.endTime),
        }, req.ip);
    }
    async activateEvent(eventId, req) {
        return this.adminService.activateEvent(req.user.id, eventId, req.ip);
    }
    async endEvent(eventId, req) {
        return this.adminService.endEvent(req.user.id, eventId, req.ip);
    }
    // ============================================================
    // EKSPANSI FASE 3: FINANCE, COSMETICS, ACHIEVEMENTS, CONTENT, SECURITY
    // ============================================================
    async getTransactions(page = 1) {
        return this.adminService.getTransactions(page);
    }
    async processManualRefund(id, body, req) {
        return this.adminService.processManualRefund(req.user.id, id, body.reason, req.ip);
    }
    async getCosmetics() {
        return this.adminService.getCosmetics();
    }
    async createCosmetic(file, body, req) {
        let fileUrl = "";
        if (file) {
            fileUrl = await this.storageService.uploadFile(file, 'cosmetics');
        }
        return this.adminService.createCosmetic(req.user.id, body, fileUrl, req.ip);
    }
    async getAchievements() {
        return this.adminService.getAchievements();
    }
    async createAchievement(body, req) {
        return this.adminService.createAchievement(req.user.id, body, req.ip);
    }
    async getContent(type) {
        return this.adminService.getContent(type);
    }
    async createContent(file, body, req) {
        let fileUrl = "";
        if (file) {
            fileUrl = await this.storageService.uploadFile(file, 'content');
        }
        return this.adminService.createContent(req.user.id, body, fileUrl, req.ip);
    }
    async getSecurityRules() {
        return this.adminService.getSecurityRules();
    }
    async createSecurityRule(body, req) {
        return this.adminService.createSecurityRule(req.user.id, body, req.ip);
    }
    // ============================================================
    // PLATFORM SETTINGS (THEME, etc.)
    // ============================================================
    async getThemeSettings() {
        return this.adminService.getThemeSettings();
    }
    async updateThemeSettings(file, body, req) {
        let fileUrl = body.customEffectUrl || "";
        if (file) {
            fileUrl = await this.storageService.uploadFile(file, 'theme-effects');
        }
        const data = { ...body, customEffectUrl: fileUrl };
        return this.adminService.updateThemeSettings(req.user.id, data, req.ip);
    }
    // ============================================================
    // VAULT OFFERINGS
    // ============================================================
    async getVaultOfferings() {
        return this.adminService.getVaultOfferings();
    }
    async reviewVaultOffering(id, body, req) {
        return this.adminService.reviewVaultOffering(id, body.status, body.adminNotes, req.user.id);
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)("dashboard/stats"),
    (0, roles_decorator_1.Roles)(roles_decorator_1.AdminRole.SUPER_ADMIN, roles_decorator_1.AdminRole.AUCTION_MANAGER, roles_decorator_1.AdminRole.SUPPORT_OFFICER),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getDashboardStats", null);
__decorate([
    (0, common_1.Get)("dashboard/chart"),
    (0, roles_decorator_1.Roles)(roles_decorator_1.AdminRole.SUPER_ADMIN, roles_decorator_1.AdminRole.AUCTION_MANAGER, roles_decorator_1.AdminRole.SUPPORT_OFFICER),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getDashboardChart", null);
__decorate([
    (0, common_1.Get)("fraud-alerts"),
    (0, roles_decorator_1.Roles)(roles_decorator_1.AdminRole.SUPER_ADMIN, roles_decorator_1.AdminRole.SUPPORT_OFFICER),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getFraudAlerts", null);
__decorate([
    (0, common_1.Get)("audit-logs"),
    (0, roles_decorator_1.Roles)(roles_decorator_1.AdminRole.SUPER_ADMIN),
    __param(0, (0, common_1.Query)("page")),
    __param(1, (0, common_1.Query)("limit")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAuditLogs", null);
__decorate([
    (0, common_1.Get)("users/search"),
    (0, roles_decorator_1.Roles)(roles_decorator_1.AdminRole.SUPER_ADMIN, roles_decorator_1.AdminRole.SUPPORT_OFFICER),
    __param(0, (0, common_1.Query)("q")),
    __param(1, (0, common_1.Query)("page")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "searchUsers", null);
__decorate([
    (0, common_1.Get)("users/:id/full-profile"),
    (0, roles_decorator_1.Roles)(roles_decorator_1.AdminRole.SUPER_ADMIN, roles_decorator_1.AdminRole.SUPPORT_OFFICER),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getUserFullProfile", null);
__decorate([
    (0, common_1.Post)("users/:id/warn"),
    (0, roles_decorator_1.Roles)(roles_decorator_1.AdminRole.SUPER_ADMIN, roles_decorator_1.AdminRole.SUPPORT_OFFICER),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, admin_dto_1.WarnUserDto, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "warnUser", null);
__decorate([
    (0, common_1.Post)("users/:id/suspend"),
    (0, roles_decorator_1.Roles)(roles_decorator_1.AdminRole.SUPER_ADMIN),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, admin_dto_1.SuspendUserDto, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "suspendUser", null);
__decorate([
    (0, common_1.Post)("users/:id/ban-auction"),
    (0, roles_decorator_1.Roles)(roles_decorator_1.AdminRole.SUPER_ADMIN),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, admin_dto_1.BanUserDto, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "banFromAuction", null);
__decorate([
    (0, common_1.Post)("users/:id/ban-permanent"),
    (0, roles_decorator_1.Roles)(roles_decorator_1.AdminRole.SUPER_ADMIN),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, admin_dto_1.BanUserDto, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "banPermanent", null);
__decorate([
    (0, common_1.Get)("auctions"),
    (0, roles_decorator_1.Roles)(roles_decorator_1.AdminRole.SUPER_ADMIN, roles_decorator_1.AdminRole.AUCTION_MANAGER),
    __param(0, (0, common_1.Query)("status")),
    __param(1, (0, common_1.Query)("type")),
    __param(2, (0, common_1.Query)("page")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAuctions", null);
__decorate([
    (0, common_1.Post)("auctions"),
    (0, roles_decorator_1.Roles)(roles_decorator_1.AdminRole.SUPER_ADMIN, roles_decorator_1.AdminRole.AUCTION_MANAGER),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_dto_1.CreateAuctionDto, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createAuction", null);
__decorate([
    (0, common_1.Post)("auctions/:id/cancel"),
    (0, roles_decorator_1.Roles)(roles_decorator_1.AdminRole.SUPER_ADMIN, roles_decorator_1.AdminRole.AUCTION_MANAGER),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, admin_dto_1.CancelAuctionDto, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "cancelAuction", null);
__decorate([
    (0, common_1.Get)("kyc/pending"),
    (0, roles_decorator_1.Roles)(roles_decorator_1.AdminRole.SUPER_ADMIN, roles_decorator_1.AdminRole.KYC_OFFICER),
    __param(0, (0, common_1.Query)("page")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getPendingKYC", null);
__decorate([
    (0, common_1.Post)("kyc/:id/approve"),
    (0, roles_decorator_1.Roles)(roles_decorator_1.AdminRole.SUPER_ADMIN, roles_decorator_1.AdminRole.KYC_OFFICER),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "approveKYC", null);
__decorate([
    (0, common_1.Post)("kyc/:id/reject"),
    (0, roles_decorator_1.Roles)(roles_decorator_1.AdminRole.SUPER_ADMIN, roles_decorator_1.AdminRole.KYC_OFFICER),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, admin_dto_1.RejectKYCDto, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "rejectKYC", null);
__decorate([
    (0, common_1.Get)("museum/items"),
    (0, roles_decorator_1.Roles)(roles_decorator_1.AdminRole.SUPER_ADMIN, roles_decorator_1.AdminRole.CONTENT_MANAGER),
    __param(0, (0, common_1.Query)("page")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getMuseumItems", null);
__decorate([
    (0, common_1.Post)("museum/items/:auctionId"),
    (0, roles_decorator_1.Roles)(roles_decorator_1.AdminRole.SUPER_ADMIN, roles_decorator_1.AdminRole.CONTENT_MANAGER),
    __param(0, (0, common_1.Param)("auctionId")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, admin_dto_1.CurateMuseumDto, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "curateToMuseum", null);
__decorate([
    (0, common_1.Get)("events"),
    (0, roles_decorator_1.Roles)(roles_decorator_1.AdminRole.SUPER_ADMIN, roles_decorator_1.AdminRole.CONTENT_MANAGER),
    __param(0, (0, common_1.Query)("page")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getEvents", null);
__decorate([
    (0, common_1.Post)("events"),
    (0, roles_decorator_1.Roles)(roles_decorator_1.AdminRole.SUPER_ADMIN, roles_decorator_1.AdminRole.CONTENT_MANAGER),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_dto_1.CreateEventDto, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createEvent", null);
__decorate([
    (0, common_1.Put)("events/:id/activate"),
    (0, roles_decorator_1.Roles)(roles_decorator_1.AdminRole.SUPER_ADMIN, roles_decorator_1.AdminRole.CONTENT_MANAGER),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "activateEvent", null);
__decorate([
    (0, common_1.Put)("events/:id/end"),
    (0, roles_decorator_1.Roles)(roles_decorator_1.AdminRole.SUPER_ADMIN, roles_decorator_1.AdminRole.CONTENT_MANAGER),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "endEvent", null);
__decorate([
    (0, common_1.Get)("finance/transactions"),
    (0, roles_decorator_1.Roles)(roles_decorator_1.AdminRole.SUPER_ADMIN),
    __param(0, (0, common_1.Query)("page")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getTransactions", null);
__decorate([
    (0, common_1.Post)("finance/transactions/:id/refund"),
    (0, roles_decorator_1.Roles)(roles_decorator_1.AdminRole.SUPER_ADMIN),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "processManualRefund", null);
__decorate([
    (0, common_1.Get)("cosmetics"),
    (0, roles_decorator_1.Roles)(roles_decorator_1.AdminRole.SUPER_ADMIN, roles_decorator_1.AdminRole.CONTENT_MANAGER),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getCosmetics", null);
__decorate([
    (0, common_1.Post)("cosmetics"),
    (0, roles_decorator_1.Roles)(roles_decorator_1.AdminRole.SUPER_ADMIN, roles_decorator_1.AdminRole.CONTENT_MANAGER),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createCosmetic", null);
__decorate([
    (0, common_1.Get)("achievements"),
    (0, roles_decorator_1.Roles)(roles_decorator_1.AdminRole.SUPER_ADMIN, roles_decorator_1.AdminRole.CONTENT_MANAGER),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAchievements", null);
__decorate([
    (0, common_1.Post)("achievements"),
    (0, roles_decorator_1.Roles)(roles_decorator_1.AdminRole.SUPER_ADMIN, roles_decorator_1.AdminRole.CONTENT_MANAGER),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createAchievement", null);
__decorate([
    (0, common_1.Get)("content"),
    (0, roles_decorator_1.Roles)(roles_decorator_1.AdminRole.SUPER_ADMIN, roles_decorator_1.AdminRole.CONTENT_MANAGER),
    __param(0, (0, common_1.Query)("type")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getContent", null);
__decorate([
    (0, common_1.Post)("content"),
    (0, roles_decorator_1.Roles)(roles_decorator_1.AdminRole.SUPER_ADMIN, roles_decorator_1.AdminRole.CONTENT_MANAGER),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createContent", null);
__decorate([
    (0, common_1.Get)("security/rules"),
    (0, roles_decorator_1.Roles)(roles_decorator_1.AdminRole.SUPER_ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getSecurityRules", null);
__decorate([
    (0, common_1.Post)("security/rules"),
    (0, roles_decorator_1.Roles)(roles_decorator_1.AdminRole.SUPER_ADMIN),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createSecurityRule", null);
__decorate([
    (0, common_1.Get)("settings/theme"),
    (0, roles_decorator_1.Roles)(roles_decorator_1.AdminRole.SUPER_ADMIN, roles_decorator_1.AdminRole.CONTENT_MANAGER),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getThemeSettings", null);
__decorate([
    (0, common_1.Put)("settings/theme"),
    (0, roles_decorator_1.Roles)(roles_decorator_1.AdminRole.SUPER_ADMIN, roles_decorator_1.AdminRole.CONTENT_MANAGER),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateThemeSettings", null);
__decorate([
    (0, common_1.Get)("vault-offerings"),
    (0, roles_decorator_1.Roles)(roles_decorator_1.AdminRole.SUPER_ADMIN, roles_decorator_1.AdminRole.AUCTION_MANAGER),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getVaultOfferings", null);
__decorate([
    (0, common_1.Put)("vault-offerings/:id"),
    (0, roles_decorator_1.Roles)(roles_decorator_1.AdminRole.SUPER_ADMIN, roles_decorator_1.AdminRole.AUCTION_MANAGER),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "reviewVaultOffering", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.Controller)("admin"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [admin_service_1.AdminService,
        storage_service_1.StorageService,
        audit_service_1.AuditService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map