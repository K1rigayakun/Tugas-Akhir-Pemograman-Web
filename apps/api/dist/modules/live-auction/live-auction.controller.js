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
exports.LiveAuctionController = void 0;
const common_1 = require("@nestjs/common");
const live_auction_service_1 = require("./live-auction.service");
const auth_guard_1 = require("../../common/auth/auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
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
let LiveAuctionController = class LiveAuctionController {
    constructor(liveAuctionService) {
        this.liveAuctionService = liveAuctionService;
    }
    // ============================================================
    // PUBLIC ENDPOINTS
    // ============================================================
    /** Daftar live auction yang sedang berlangsung */
    async getActiveLiveAuctions() {
        return this.liveAuctionService.getActiveLiveAuctions();
    }
    /**
     * Generate Agora token untuk join video streaming.
     * User harus login.
     */
    async getAgoraToken(auctionId, uid = 0, role = "audience") {
        const isHost = role === "host";
        return this.liveAuctionService.getAgoraToken(auctionId, uid, isHost);
    }
    // ============================================================
    // ADMIN ENDPOINTS
    // ============================================================
    /** Mulai sesi live auction */
    async startLiveSession(auctionId, req) {
        return this.liveAuctionService.startLiveSession(req.user.id, auctionId, req.ip);
    }
    /** Akhiri sesi live auction */
    async endLiveSession(auctionId, req) {
        return this.liveAuctionService.endLiveSession(req.user.id, auctionId, req.ip);
    }
};
exports.LiveAuctionController = LiveAuctionController;
__decorate([
    (0, common_1.Get)("active"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LiveAuctionController.prototype, "getActiveLiveAuctions", null);
__decorate([
    (0, common_1.Get)(":id/token"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Query)("uid")),
    __param(2, (0, common_1.Query)("role")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, String]),
    __metadata("design:returntype", Promise)
], LiveAuctionController.prototype, "getAgoraToken", null);
__decorate([
    (0, common_1.Post)(":id/start"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(roles_decorator_1.AdminRole.SUPER_ADMIN, roles_decorator_1.AdminRole.AUCTION_MANAGER),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LiveAuctionController.prototype, "startLiveSession", null);
__decorate([
    (0, common_1.Post)(":id/end"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(roles_decorator_1.AdminRole.SUPER_ADMIN, roles_decorator_1.AdminRole.AUCTION_MANAGER),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LiveAuctionController.prototype, "endLiveSession", null);
exports.LiveAuctionController = LiveAuctionController = __decorate([
    (0, common_1.Controller)("live-auction"),
    __metadata("design:paramtypes", [live_auction_service_1.LiveAuctionService])
], LiveAuctionController);
//# sourceMappingURL=live-auction.controller.js.map