import { Controller, Get, Param, Post, Body, Req } from '@nestjs/common';
import { RankService } from './rank.service';

@Controller("users")
export class RankController {
  constructor(private readonly rankService: RankService) {}

  /**
   * Mendapatkan status rank saat ini, total EXP, dan progress detail user
   */
  @Get(':userId/rank')
  async getRankInfo(@Param('userId') userId: string) {
    return this.rankService.getRankInfo(userId);
  }

  /**
   * Mendapatkan daftar riwayat kenaikan pangkat user
   */
  @Get(':userId/rank-history')
  async getRankHistory(@Param('userId') userId: string) {
    return this.rankService.getRankHistory(userId);
  }

  /**
   * Memicu penambahan EXP secara manual (untuk debugging / testing oleh Admin)
   */
  @Post(':userId/award-exp')
  async awardExp(
    @Param('userId') userId: string,
    @Body() body: { amount: number; reason: string },
  ) {
    return this.rankService.awardExp(userId, body.amount, body.reason || 'Manual Admin Adjust');
  }
}
