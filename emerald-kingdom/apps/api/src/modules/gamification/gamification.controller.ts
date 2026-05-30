import { Controller, Get, Post, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { GamificationService } from './gamification.service';

@Controller('api/v1')
export class GamificationController {
  constructor(private readonly gamificationService: GamificationService) {}

  /**
   * Mendapatkan daftar quest harian beserta tingkat progress user saat ini
   */
  @Get('quests/daily')
  async getDailyQuests(@Req() req: any) {
    const userId = req.user?.id || 'dummy-user-id';
    return this.gamificationService.getDailyQuests(userId);
  }

  /**
   * Mengklaim hadiah EXP dari quest harian yang sudah selesai dikerjakan
   */
  @Post('quests/daily/:id/claim')
  async claimDailyQuest(@Param('id') questId: string, @Req() req: any) {
    const userId = req.user?.id || 'dummy-user-id';
    return this.gamificationService.claimDailyQuest(userId, questId);
  }

  /**
   * Membaca klasemen leaderboard dari Redis cache untuk Visel
   */
  @Get('leaderboard')
  async getLeaderboard(
    @Query('category') category: string, // wealth, prestige, wins
    @Query('period') period: string,     // weekly, monthly, all-time
  ) {
    const defaultCategory = category || 'prestige';
    const defaultPeriod = period || 'all-time';
    return this.gamificationService.getLeaderboardFromCache(defaultCategory, defaultPeriod);
  }

  /**
   * Memulai event musiman baru secara administratif (Admin)
   */
  @Post('admin/events')
  async startEvent(
    @Body() body: { title: string; expMultiplier: number; backgroundMode: string; accentColors: string },
  ) {
    return this.gamificationService.startEvent(body);
  }

  /**
   * Menghentikan event musiman yang sedang aktif (Admin)
   */
  @Post('admin/events/end')
  async endEvent() {
    return this.gamificationService.endActiveEvent();
  }

  /**
   * Memaksa refresh leaderboard cache (Admin/Debugging)
   */
  @Post('admin/leaderboard/refresh')
  async refreshLeaderboard() {
    await this.gamificationService.refreshLeaderboardCache();
    return { status: 'success', message: 'Cache leaderboard berhasil dihitung ulang.' };
  }
}
