import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RankService } from '../rank/rank.service';
import { BidGateway } from '../bid/bid.gateway';

export enum AchievementTier {
  COMMON = "COMMON",
  RARE   = "RARE",
  EPIC   = "EPIC",
}

export interface AchievementConfig {
  id: string;
  title: string;
  description: string;
  tier: AchievementTier;
  expReward: number;
  rewardTitle?: string;
  rewardCosmeticId?: string;
}

const ACHIEVEMENT_CONFIGS: Record<string, AchievementConfig> = {
  FIRST_BID: {
    id: "FIRST_BID",
    title: "Sumpah Pertama (The Pledge)",
    description: "Mengajukan penawaran (bid) pertama Anda di kerajaan.",
    tier: AchievementTier.COMMON,
    expReward: 50,
  },
  FIRST_WIN: {
    id: "FIRST_WIN",
    title: "Kemenangan Perdana (The Victor)",
    description: "Memenangkan lelang pertama Anda.",
    tier: AchievementTier.COMMON,
    expReward: 50,
    rewardTitle: "The Victor",
  },
  GOLDEN_TREASURE: {
    id: "GOLDEN_TREASURE",
    title: "Pewaris Lydian (Lydian Heir)",
    description: "Mempunyai saldo wallet melampaui ♛100,000 CC.",
    tier: AchievementTier.RARE,
    expReward: 200,
    rewardTitle: "The Goldhoarder",
  },
  HIGH_BIDDER: {
    id: "HIGH_BIDDER",
    title: "Ambisi Kaisar (The Bold)",
    description: "Mengajukan bid tunggal melampaui ♛50,000 CC.",
    tier: AchievementTier.EPIC,
    expReward: 500,
    rewardTitle: "The Bold Bidder",
    rewardCosmeticId: "cosmetic-avatar-aura-bold",
  },
  PEER_OF_REALM: {
    id: "PEER_OF_REALM",
    title: "Bangsawan Kerajaan (Peer of the Realm)",
    description: "Berhasil naik pangkat menjadi Duke atau lebih tinggi.",
    tier: AchievementTier.EPIC,
    expReward: 500,
    rewardCosmeticId: "cosmetic-profile-theme-duke",
  },
};

@Injectable()
export class AchievementService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rankService: RankService,
    private readonly bidGateway: BidGateway,
  ) {}

  /**
   * Mendapatkan daftar semua achievement beserta status unlock untuk user tertentu
   */
  async getUserAchievements(userId: string) {
    const unlocked = await this.prisma.userAchievement.findMany({
      where: { userId },
    });

    const unlockedIds = new Set(unlocked.map(u => u.achievementId));

    return Object.values(ACHIEVEMENT_CONFIGS).map(config => ({
      ...config,
      isUnlocked: unlockedIds.has(config.id),
      unlockedAt: unlocked.find(u => u.achievementId === config.id)?.createdAt || null,
    }));
  }

  /**
   * Memeriksa dan membuka achievement jika syarat terpenuhi (Event-Driven)
   */
  async check(userId: string, eventType: 'BID_PLACED' | 'AUCTION_WON' | 'RANK_UP' | 'TOP_UP', context?: any) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Ambil list achievement yang SUDAH di-unlock agar tidak men-trigger berulang
      const alreadyUnlocked = await tx.userAchievement.findMany({
        where: { userId },
        select: { achievementId: true },
      });
      const unlockedSet = new Set(alreadyUnlocked.map(a => a.achievementId));

      const achievementsToUnlock: AchievementConfig[] = [];

      // 2. Evaluasi syarat per tipe event
      switch (eventType) {
        case 'BID_PLACED':
          // Cek First Bid
          if (!unlockedSet.has('FIRST_BID')) {
            achievementsToUnlock.push(ACHIEVEMENT_CONFIGS.FIRST_BID);
          }
          // Cek High Bidder (> 50,000 CC)
          if (!unlockedSet.has('HIGH_BIDDER') && context?.amount >= 50000) {
            achievementsToUnlock.push(ACHIEVEMENT_CONFIGS.HIGH_BIDDER);
          }
          break;

        case 'AUCTION_WON':
          // Cek First Win
          if (!unlockedSet.has('FIRST_WIN')) {
            achievementsToUnlock.push(ACHIEVEMENT_CONFIGS.FIRST_WIN);
          }
          break;

        case 'TOP_UP':
          // Cek Golden Treasure (total saldo setelah top up > 100,000 CC)
          if (!unlockedSet.has('GOLDEN_TREASURE')) {
            const user = await tx.user.findUnique({
              where: { id: userId },
              select: { balance: true },
            });
            if (user && user.balance >= 100000) {
              achievementsToUnlock.push(ACHIEVEMENT_CONFIGS.GOLDEN_TREASURE);
            }
          }
          break;

        case 'RANK_UP':
          // Cek Duke Ascension
          if (!unlockedSet.has('PEER_OF_REALM') && (context?.newRank === 'DUKE' || context?.newRank === 'SOVEREIGN' || context?.newRank === 'EMPEROR')) {
            achievementsToUnlock.push(ACHIEVEMENT_CONFIGS.PEER_OF_REALM);
          }
          break;
      }

      // 3. Proses unlock achievement yang didapatkan
      for (const config of achievementsToUnlock) {
        await this.unlockAchievement(tx, userId, config);
      }
    });
  }

  /**
   * Helper internal untuk memproses pembukaan achievement baru
   */
  private async unlockAchievement(tx: any, userId: string, config: AchievementConfig) {
    // A. Catat ke tabel user_achievements
    await tx.userAchievement.create({
      data: {
        userId,
        achievementId: config.id,
      },
    });

    // B. Berikan EXP Reward via RankService
    await this.rankService.awardExp(userId, config.expReward, `Unlock Achievement: ${config.title}`);

    // C. Berikan Gelar kehormatan (Title) jika tersedia
    if (config.rewardTitle) {
      await tx.userTitle.create({
        data: {
          userId,
          titleName: config.rewardTitle,
          status: 'UNLOCKED',
        },
      }).catch(() => {}); // Abaikan jika duplikasi
    }

    // D. Berikan reward barang kosmetik jika tersedia
    if (config.rewardCosmeticId) {
      await tx.userCosmetic.create({
        data: {
          userId,
          cosmeticId: config.rewardCosmeticId,
          status: 'UNLOCKED',
        },
      }).catch(() => {});
    }

    // E. Broadcast WebSocket real-time ke client untuk memunculkan efek visual unlock
    this.bidGateway.server.to(`user:${userId}`).emit('achievement:unlocked', {
      id: config.id,
      title: config.title,
      description: config.description,
      tier: config.tier,
    });

    // F. Log notifikasi untuk Peter (Notification Service)
    console.log(`[Achievement Unlocked] User ${userId} membuka achievement: ${config.title}`);
  }
}
