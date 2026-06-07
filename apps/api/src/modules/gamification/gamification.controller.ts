import { Controller, Get, Post, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { GamificationService } from './gamification.service';
import { AuthGuard } from '../../common/auth/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AdminRole, Roles } from '../../common/decorators/roles.decorator';

@Controller()
export class GamificationController {
  constructor(private readonly gamificationService: GamificationService) {}

  /**
   * Mendapatkan daftar quest harian beserta tingkat progress user saat ini
   */
  @Get('quests/daily')
  @UseGuards(AuthGuard)
  async getDailyQuests(@Req() req: any) {
    return this.gamificationService.getDailyQuests(req.user.id);
  }

  /**
   * Mengklaim hadiah EXP dari quest harian yang sudah selesai dikerjakan
   */
  @Post('quests/daily/:id/claim')
  @UseGuards(AuthGuard)
  async claimDailyQuest(@Param('id') questId: string, @Req() req: any) {
    return this.gamificationService.claimDailyQuest(req.user.id, questId);
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
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.CONTENT_MANAGER)
  async startEvent(
    @Body() body: {
      name: string;
      theme?: string;
      expMultiplier: number;
      backgroundMode?: string;
      accentColors?: unknown;
      startTime?: string;
      endTime?: string;
    },
  ) {
    return this.gamificationService.startEvent(body);
  }

  /**
   * Menghentikan event musiman yang sedang aktif (Admin)
   */
  @Post('admin/events/end')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.CONTENT_MANAGER)
  async endEvent() {
    return this.gamificationService.endActiveEvent();
  }

  /**
   * Memaksa refresh leaderboard cache (Admin/Debugging)
   */
  @Post('admin/leaderboard/refresh')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(AdminRole.SUPER_ADMIN)
  async refreshLeaderboard() {
    await this.gamificationService.refreshLeaderboardCache();
    return { status: 'success', message: 'Cache leaderboard berhasil dihitung ulang.' };
  }
}
