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
exports.AuctionController = void 0;
const common_1 = require("@nestjs/common");
const auction_service_1 = require("./auction.service");
const create_auction_dto_1 = require("./dto/create-auction.dto");
const update_auction_dto_1 = require("./dto/update-auction.dto");
const auth_guard_1 = require("../../common/auth/auth.guard");
const optional_auth_guard_1 = require("../../common/auth/optional-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
let AuctionController = class AuctionController {
    constructor(auctionService) {
        this.auctionService = auctionService;
    }
    /**
     * Mendapatkan daftar semua lelang dengan filter status, tipe, dan search query
     */
    async getAuctions(req, status, type, query) {
        return this.auctionService.findAll({ status, type, query, userId: req.user?.id });
    }
    /**
     * Mendapatkan daftar lelang yang sedang LIVE
     */
    async getLiveAuctions(req) {
        return this.auctionService.findAll({
            statuses: [auction_service_1.AuctionStatus.ACTIVE, auction_service_1.AuctionStatus.ENDING, auction_service_1.AuctionStatus.UPCOMING],
            type: create_auction_dto_1.AuctionType.LIVE,
            userId: req.user?.id,
        });
    }
    /**
     * Mendapatkan daftar lelang rank-exclusive, termasuk item yang terkunci.
     */
    async getExclusiveAuctions(req) {
        return this.auctionService.findAll({
            statuses: [auction_service_1.AuctionStatus.ACTIVE, auction_service_1.AuctionStatus.ENDING, auction_service_1.AuctionStatus.UPCOMING],
            type: create_auction_dto_1.AuctionType.RANK_EXCL,
            userId: req.user?.id,
            includeLocked: true,
        });
    }
    /**
     * Mendapatkan rekomendasi lelang event saat event aktif.
     */
    async getEventAuctions(req) {
        return this.auctionService.findEventAuctions(req.user?.id);
    }
    /**
     * Mendapatkan daftar lelang UPCOMING (mendatang)
     */
    async getUpcomingAuctions(req) {
        return this.auctionService.findAll({ status: auction_service_1.AuctionStatus.UPCOMING, userId: req.user?.id });
    }
    /**
     * Mendapatkan detail satu lelang
     */
    async getAuctionById(id) {
        return this.auctionService.findOne(id);
    }
    /**
     * Mendapatkan riwayat bid lelang tertentu
     */
    async getAuctionBids(id) {
        return this.auctionService.getBids(id);
    }
    /**
     * Membuat draf lelang baru (Admin)
     */
    async createAuction(dto) {
        return this.auctionService.create(dto);
    }
    /**
     * Memperbarui draf lelang (Admin)
     */
    async updateAuction(id, dto) {
        return this.auctionService.update(id, dto);
    }
    /**
     * Mempublikasikan lelang agar aktif (Admin)
     */
    async publishAuction(id) {
        return this.auctionService.publish(id);
    }
    /**
     * Membatalkan lelang (Admin)
     */
    async cancelAuction(id) {
        return this.auctionService.cancel(id);
    }
};
exports.AuctionController = AuctionController;
__decorate([
    (0, common_1.Get)('auctions'),
    (0, common_1.UseGuards)(optional_auth_guard_1.OptionalAuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('type')),
    __param(3, (0, common_1.Query)('query')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], AuctionController.prototype, "getAuctions", null);
__decorate([
    (0, common_1.Get)('auctions/live'),
    (0, common_1.UseGuards)(optional_auth_guard_1.OptionalAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuctionController.prototype, "getLiveAuctions", null);
__decorate([
    (0, common_1.Get)('auctions/exclusive'),
    (0, common_1.UseGuards)(optional_auth_guard_1.OptionalAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuctionController.prototype, "getExclusiveAuctions", null);
__decorate([
    (0, common_1.Get)('auctions/event'),
    (0, common_1.UseGuards)(optional_auth_guard_1.OptionalAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuctionController.prototype, "getEventAuctions", null);
__decorate([
    (0, common_1.Get)('auctions/upcoming'),
    (0, common_1.UseGuards)(optional_auth_guard_1.OptionalAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuctionController.prototype, "getUpcomingAuctions", null);
__decorate([
    (0, common_1.Get)('auctions/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuctionController.prototype, "getAuctionById", null);
__decorate([
    (0, common_1.Get)('auctions/:id/bids'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuctionController.prototype, "getAuctionBids", null);
__decorate([
    (0, common_1.Post)('admin/auctions'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(roles_decorator_1.AdminRole.SUPER_ADMIN, roles_decorator_1.AdminRole.AUCTION_MANAGER),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_auction_dto_1.CreateAuctionDto]),
    __metadata("design:returntype", Promise)
], AuctionController.prototype, "createAuction", null);
__decorate([
    (0, common_1.Put)('admin/auctions/:id'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(roles_decorator_1.AdminRole.SUPER_ADMIN, roles_decorator_1.AdminRole.AUCTION_MANAGER),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_auction_dto_1.UpdateAuctionDto]),
    __metadata("design:returntype", Promise)
], AuctionController.prototype, "updateAuction", null);
__decorate([
    (0, common_1.Post)('admin/auctions/:id/publish'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(roles_decorator_1.AdminRole.SUPER_ADMIN, roles_decorator_1.AdminRole.AUCTION_MANAGER),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuctionController.prototype, "publishAuction", null);
__decorate([
    (0, common_1.Post)('admin/auctions/:id/cancel'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(roles_decorator_1.AdminRole.SUPER_ADMIN, roles_decorator_1.AdminRole.AUCTION_MANAGER),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuctionController.prototype, "cancelAuction", null);
exports.AuctionController = AuctionController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [auction_service_1.AuctionService])
], AuctionController);
//# sourceMappingURL=auction.controller.js.map