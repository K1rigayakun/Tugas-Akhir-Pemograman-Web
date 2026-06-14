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
exports.LeaderboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let LeaderboardService = class LeaderboardService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    // New method for homepage - top users by total spent
    async getTopUsers(limit = 10) {
        const users = await this.prisma.user.findMany({
            take: limit,
            orderBy: { totalExp: 'desc' },
            select: {
                id: true,
                username: true,
                totalExp: true,
                avatarUrl: true,
                walletAccount: {
                    select: {
                        totalSpent: true
                    }
                }
            }
        });
        return users
            .sort((a, b) => (b.walletAccount?.totalSpent || 0) - (a.walletAccount?.totalSpent || 0))
            .map((user, index) => ({
            rank: index + 1,
            userId: user.id,
            username: user.username,
            points: user.walletAccount?.totalSpent || 0,
            avatar: user.avatarUrl
        }));
    }
    async getLeaderboard(category, limit) {
        let users = [];
        switch (category) {
            case 'top-spender':
                users = await this.prisma.user.findMany({
                    orderBy: { totalExp: 'desc' }, // Currently using totalExp as a proxy, ideally join with WalletAccount.totalSpent
                    include: { walletAccount: true },
                    take: limit,
                });
                return users.map((u, index) => ({
                    position: index + 1,
                    userId: u.id,
                    username: u.username,
                    rank: u.rank,
                    value: u.walletAccount?.totalSpent || 0,
                })).sort((a, b) => b.value - a.value).map((u, i) => ({ ...u, position: i + 1 }));
            case 'highest-streak':
                users = await this.prisma.user.findMany({
                    orderBy: { longestStreak: 'desc' },
                    take: limit,
                });
                return users.map((u, index) => ({
                    position: index + 1,
                    userId: u.id,
                    username: u.username,
                    rank: u.rank,
                    value: u.longestStreak,
                }));
            case 'most-wins':
                users = await this.prisma.user.findMany({
                    orderBy: { totalWins: 'desc' },
                    take: limit,
                });
                return users.map((u, index) => ({
                    position: index + 1,
                    userId: u.id,
                    username: u.username,
                    rank: u.rank,
                    value: u.totalWins,
                }));
            case 'highest-rank':
                users = await this.prisma.user.findMany({
                    orderBy: { totalExp: 'desc' },
                    take: limit,
                });
                return users.map((u, index) => ({
                    position: index + 1,
                    userId: u.id,
                    username: u.username,
                    rank: u.rank,
                    value: u.totalExp,
                }));
            default:
                // Fallback to highest exp
                users = await this.prisma.user.findMany({
                    orderBy: { totalExp: 'desc' },
                    take: limit,
                });
                return users.map((u, index) => ({
                    position: index + 1,
                    userId: u.id,
                    username: u.username,
                    rank: u.rank,
                    value: u.totalExp,
                }));
        }
    }
};
exports.LeaderboardService = LeaderboardService;
exports.LeaderboardService = LeaderboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LeaderboardService);
//# sourceMappingURL=leaderboard.service.js.map