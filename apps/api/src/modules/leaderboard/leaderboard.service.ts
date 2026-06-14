import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class LeaderboardService {
  constructor(private prisma: PrismaService) {}

  // New method for homepage - top users by total spent
  async getTopUsers(limit: number = 10) {
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

  async getLeaderboard(category: string, limit: number) {
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
}
