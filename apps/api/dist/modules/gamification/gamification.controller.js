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
exports.GamificationController = void 0;
const common_1 = require("@nestjs/common");
const gamification_service_1 = require("./gamification.service");
const auth_guard_1 = require("../../common/auth/auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
let GamificationController = class GamificationController {
    constructor(gamificationService) {
        this.gamificationService = gamificationService;
    }
    /**
     * Mendapatkan daftar quest harian beserta tingkat progress user saat ini
     */
    async getDailyQuests(req) {
        return this.gamificationService.getDailyQuests(req.user.id);
    }
    /**
     * Mengklaim hadiah EXP dari quest harian yang sudah selesai dikerjakan
     */
    async claimDailyQuest(questId, req) {
        return this.gamificationService.claimDailyQuest(req.user.id, questId);
    }
    /**
     * Membaca klasemen leaderboard dari Redis cache untuk Visel
     */
    async getLeaderboard(category, period) {
        const defaultCategory = category || 'prestige';
        const defaultPeriod = period || 'all-time';
        return this.gamificationService.getLeaderboardFromCache(defaultCategory, defaultPeriod);
    }
    /**
     * Mendapatkan event aktif untuk halaman publik dan rekomendasi event.
     */
    async getActiveEvent() {
        return this.gamificationService.getActiveEvent();
    }
    /**
     * Memulai event musiman baru secara administratif (Admin)
     */
    async startEvent(body) {
        return this.gamificationService.startEvent(body);
    }
    /**
     * Menghentikan event musiman yang sedang aktif (Admin)
     */
    async endEvent() {
        return this.gamificationService.endActiveEvent();
    }
    /**
     * Memaksa refresh leaderboard cache (Admin/Debugging)
     */
    async refreshLeaderboard() {
        await this.gamificationService.refreshLeaderboardCache();
        return { status: 'success', message: 'Cache leaderboard berhasil dihitung ulang.' };
    }
};
exports.GamificationController = GamificationController;
__decorate([
    (0, common_1.Get)('quests/daily'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GamificationController.prototype, "getDailyQuests", null);
__decorate([
    (0, common_1.Post)('quests/daily/:id/claim'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], GamificationController.prototype, "claimDailyQuest", null);
__decorate([
    (0, common_1.Get)('leaderboard'),
    __param(0, (0, common_1.Query)('category')),
    __param(1, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], GamificationController.prototype, "getLeaderboard", null);
__decorate([
    (0, common_1.Get)('events/active'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], GamificationController.prototype, "getActiveEvent", null);
__decorate([
    (0, common_1.Post)('admin/events'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(roles_decorator_1.AdminRole.SUPER_ADMIN, roles_decorator_1.AdminRole.CONTENT_MANAGER),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GamificationController.prototype, "startEvent", null);
__decorate([
    (0, common_1.Post)('admin/events/end'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(roles_decorator_1.AdminRole.SUPER_ADMIN, roles_decorator_1.AdminRole.CONTENT_MANAGER),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], GamificationController.prototype, "endEvent", null);
__decorate([
    (0, common_1.Post)('admin/leaderboard/refresh'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(roles_decorator_1.AdminRole.SUPER_ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], GamificationController.prototype, "refreshLeaderboard", null);
exports.GamificationController = GamificationController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [gamification_service_1.GamificationService])
], GamificationController);
//# sourceMappingURL=gamification.controller.js.map