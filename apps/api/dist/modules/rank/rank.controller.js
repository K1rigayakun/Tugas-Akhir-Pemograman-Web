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
exports.RankController = void 0;
const common_1 = require("@nestjs/common");
const rank_service_1 = require("./rank.service");
let RankController = class RankController {
    constructor(rankService) {
        this.rankService = rankService;
    }
    /**
     * Mendapatkan status rank saat ini, total EXP, dan progress detail user
     */
    async getRankInfo(userId) {
        return this.rankService.getRankInfo(userId);
    }
    /**
     * Mendapatkan daftar riwayat kenaikan pangkat user
     */
    async getRankHistory(userId) {
        return this.rankService.getRankHistory(userId);
    }
    /**
     * Memicu penambahan EXP secara manual (untuk debugging / testing oleh Admin)
     */
    async awardExp(userId, body) {
        return this.rankService.awardExp(userId, body.amount, body.reason || 'Manual Admin Adjust');
    }
};
exports.RankController = RankController;
__decorate([
    (0, common_1.Get)(':userId/rank'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RankController.prototype, "getRankInfo", null);
__decorate([
    (0, common_1.Get)(':userId/rank-history'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RankController.prototype, "getRankHistory", null);
__decorate([
    (0, common_1.Post)(':userId/award-exp'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RankController.prototype, "awardExp", null);
exports.RankController = RankController = __decorate([
    (0, common_1.Controller)("users"),
    __metadata("design:paramtypes", [rank_service_1.RankService])
], RankController);
//# sourceMappingURL=rank.controller.js.map