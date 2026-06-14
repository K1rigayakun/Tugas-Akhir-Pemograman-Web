import { Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { AchievementService } from "./achievement.service";
import { RankService } from "../rank/rank.service";

@Injectable()
export class AchievementListener {
  private readonly logger = new Logger("AchievementListener");

  constructor(
    private readonly achievementService: AchievementService,
    private readonly rankService: RankService,
  ) {}

  @OnEvent("user.login")
  async handleUserLogin(payload: { userId: string; loginCount: number; isFirstLoginToday: boolean; loginStreak: number }) {
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
      
    } catch (error) {
      this.logger.error(`Error processing user.login event for ${payload.userId}`, error);
    }
  }

  @OnEvent("auction.won")
  async handleAuctionWon(payload: { userId: string; auctionId: string; totalWins: number }) {
    try {
      // Cek achievement terkait kemenangan lelang
      await this.achievementService.check(payload.userId, "AUCTION_WIN", { 
        totalWins: payload.totalWins 
      });
    } catch (error) {
      this.logger.error(`Error processing auction.won event for ${payload.userId}`, error);
    }
  }
}
