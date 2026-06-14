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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AchievementListener = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const achievement_service_1 = require("./achievement.service");
const rank_service_1 = require("../rank/rank.service");
let AchievementListener = class AchievementListener {
    constructor(achievementService, rankService) {
        this.achievementService = achievementService;
        this.rankService = rankService;
        this.logger = new common_1.Logger("AchievementListener");
    }
    async handleUserLogin(payload) {
        try {
            if (payload.isFirstLoginToday) {
                // Beri EXP harian (3 EXP)
                await this.rankService.awardExp(payload.userId, 3, "Daily Login");
                // Bonus 7-day streak (50 EXP)
                if (payload.loginStreak > 0 && payload.loginStreak % 7 === 0) {
                    await this.rankService.awardExp(payload.userId, 50, `7-Day Login Streak Bonus (${payload.loginStreak} days)`);
                }
            }
            // Cek achievement terkait login
            await this.achievementService.check(payload.userId, "USER_LOGIN", {
                loginCount: payload.loginCount
            });
        }
        catch (error) {
            this.logger.error(`Error processing user.login event for ${payload.userId}`, error);
        }
    }
    async handleAuctionWon(payload) {
        try {
            // Cek achievement terkait kemenangan lelang
            await this.achievementService.check(payload.userId, "AUCTION_WIN", {
                totalWins: payload.totalWins
            });
        }
        catch (error) {
            this.logger.error(`Error processing auction.won event for ${payload.userId}`, error);
        }
    }
};
exports.AchievementListener = AchievementListener;
__decorate([
    (0, event_emitter_1.OnEvent)("user.login"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AchievementListener.prototype, "handleUserLogin", null);
__decorate([
    (0, event_emitter_1.OnEvent)("auction.won"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AchievementListener.prototype, "handleAuctionWon", null);
exports.AchievementListener = AchievementListener = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [achievement_service_1.AchievementService,
        rank_service_1.RankService])
], AchievementListener);
//# sourceMappingURL=achievement.listener.js.map