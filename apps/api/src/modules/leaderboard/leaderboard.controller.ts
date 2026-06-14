import { Controller, Get, Param, Query, HttpException, HttpStatus } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';

@Controller('leaderboard')
export class LeaderboardController {
  constructor(private leaderboardService: LeaderboardService) {}

  // New endpoint for homepage (no category parameter)
  @Get()
  async getTopLeaderboard(@Query('limit') limitStr?: string) {
    try {
      const limit = limitStr ? parseInt(limitStr, 10) : 10;
      const data = await this.leaderboardService.getTopUsers(limit);
      return {
        data,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Leaderboard fetch error:', error);
      throw new HttpException(
        'Failed to fetch leaderboard data',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get(':category')
  async getLeaderboard(
    @Param('category') category: string,
    @Query('limit') limitStr?: string,
  ) {
    const limit = limitStr ? parseInt(limitStr, 10) : 50;
    return this.leaderboardService.getLeaderboard(category, limit);
  }
}
