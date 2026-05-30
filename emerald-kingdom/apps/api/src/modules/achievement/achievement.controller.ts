import { Controller, Get, Param } from '@nestjs/common';
import { AchievementService } from './achievement.service';

@Controller('api/v1/users')
export class AchievementController {
  constructor(private readonly achievementService: AchievementService) {}

  /**
   * Mendapatkan daftar semua achievement yang tersedia beserta status unlock milik user
   */
  @Get(':userId/achievements')
  async getUserAchievements(@Param('userId') userId: string) {
    return this.achievementService.getUserAchievements(userId);
  }
}
