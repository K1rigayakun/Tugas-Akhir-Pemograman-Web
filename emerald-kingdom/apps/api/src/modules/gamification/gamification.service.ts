import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BidGateway } from '../bid/bid.gateway';
import { RankService } from '../rank/rank.service';

export interface QuestConfig {
  id: string;
  title: string;
  description: string;
  targetCount: number;
  expReward: number;
  type: 'PLACE_BID' | 'WIN_AUCTION' | 'TOP_UP';
}

const QUEST_CONFIGS: Record<string, QuestConfig> = {
  DAILY_BID: {
    id: "DAILY_BID",
    title: "Patroli Kerajaan (Royal Patrol)",
    description: "Ajukan penawaran lelang (bid) sebanyak 3 kali hari ini.",
    targetCount: 3,
    expReward: 30,
    type: 'PLACE_BID',
  },
  DAILY_WIN: {
    id: "DAILY_WIN",
    title: "Penakluk Harian (Daily Conqueror)",
    description: "Menangkan minimal 1 lelang hari ini.",
    targetCount: 1,
    expReward: 100,
    type: 'WIN_AUCTION',
  },
  DAILY_TOPUP: {
    id: "DAILY_TOPUP",
    title: "Pengumpul Harta (Treasure Fill)",
    description: "Lakukan pengisian saldo (top-up) CC minimal 1 kali hari ini.",
    targetCount: 1,
    expReward: 50,
    type: 'TOP_UP',
  },
};

@Injectable()
export class GamificationService {
  // Local Memory Cache Fallback jika Upstash Redis belum tersambung
  private localCache: Map<string, string> = new Map();

  constructor(
    private readonly prisma: PrismaService,
    private readonly bidGateway: BidGateway,
    private readonly rankService: RankService,
  ) {}

  /**
   * Mendapatkan status event musiman (seasonal event) yang sedang aktif
   */
  async getActiveEvent() {
    return this.prisma.event.findFirst({
      where: { status: 'ACTIVE' },
    });
  }

  /**
   * Memulai event baru secara administratif (Admin)
   */
  async startEvent(dto: { title: string; expMultiplier: number; backgroundMode: string; accentColors: string }) {
    return this.prisma.$transaction(async (tx) => {
      // Nonaktifkan event yang aktif sebelumnya
      await tx.event.updateMany({
        where: { status: 'ACTIVE' },
        data: { status: 'ENDED', endedAt: new Date() },
      });

      // Buat event baru
      const newEvent = await tx.event.create({
        data: {
          title: dto.title,
          expMultiplier: dto.expMultiplier,
          backgroundMode: dto.backgroundMode,
          accentColors: dto.accentColors,
          status: 'ACTIVE',
        },
      });

      // Broadcast perubahan warna UI & partikel background via WebSocket ke seluruh client
      this.bidGateway.server.emit('event:started', {
        eventId: newEvent.id,
        backgroundMode: newEvent.backgroundMode,
        accentColors: newEvent.accentColors,
      });

      return newEvent;
    });
  }

  /**
   * Mengakhiri event aktif secara administratif (Admin)
   */
  async endActiveEvent() {
    const active = await this.getActiveEvent();
    if (!active) throw new BadRequestException('Tidak ada event aktif saat ini');

    const updated = await this.prisma.event.update({
      where: { id: active.id },
      data: { status: 'ENDED', endedAt: new Date() },
    });

    // Broadcast ke frontend bahwa event selesai (mengembalikan background default)
    this.bidGateway.server.emit('event:ended', {
      eventId: active.id,
    });

    return updated;
  }

  /**
   * Mendapatkan progress daily quest milik user
   */
  async getDailyQuests(userId: string) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // 1. Dapatkan progress aktivitas user hari ini dari database
    const bidsTodayCount = await this.prisma.bid.count({
      where: {
        userId,
        createdAt: { gte: todayStart, lte: todayEnd },
      },
    });

    const winsTodayCount = await this.prisma.bid.count({
      where: {
        userId,
        status: 'WON',
        createdAt: { gte: todayStart, lte: todayEnd }, // Pemenang yang diputus hari ini
      },
    });

    const topupsTodayCount = await this.prisma.walletTransaction.count({
      where: {
        userId,
        type: 'TOP_UP',
        createdAt: { gte: todayStart, lte: todayEnd },
      },
    });

    // 2. Dapatkan quest yang sudah di-claim hari ini
    const claimedQuests = await this.prisma.userQuestClaim.findMany({
      where: {
        userId,
        claimedAt: { gte: todayStart, lte: todayEnd },
      },
      select: { questId: true },
    });
    const claimedIds = new Set(claimedQuests.map(c => c.questId));

    // 3. Bangun data respons
    return Object.values(QUEST_CONFIGS).map(config => {
      let currentCount = 0;
      if (config.type === 'PLACE_BID') currentCount = bidsTodayCount;
      if (config.type === 'WIN_AUCTION') currentCount = winsTodayCount;
      if (config.type === 'TOP_UP') currentCount = topupsTodayCount;

      const isCompleted = currentCount >= config.targetCount;
      const isClaimed = claimedIds.has(config.id);

      return {
        ...config,
        currentCount: Math.min(currentCount, config.targetCount),
        isCompleted,
        isClaimed,
      };
    });
  }

  /**
   * Mengklaim reward daily quest yang sudah diselesaikan
   */
  async claimDailyQuest(userId: string, questId: string) {
    const config = QUEST_CONFIGS[questId];
    if (!config) throw new NotFoundException('Quest tidak ditemukan');

    const quests = await this.getDailyQuests(userId);
    const questStatus = quests.find(q => q.id === questId);

    if (!questStatus.isCompleted) {
      throw new BadRequestException('Quest belum selesai dikerjakan');
    }
    if (questStatus.isClaimed) {
      throw new BadRequestException('Quest sudah diklaim hari ini');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Catat klaim hari ini
      const claim = await tx.userQuestClaim.create({
        data: {
          userId,
          questId,
        },
      });

      // 2. Berikan hadiah EXP
      await this.rankService.awardExp(userId, config.expReward, `Menyelesaikan Quest: ${config.title}`);

      return {
        status: 'success',
        message: `Klaim berhasil! ♛${config.expReward} EXP ditambahkan ke reputasi Anda.`,
        claim,
      };
    });
  }

  /**
   * Menghitung ulang seluruh kategori leaderboard dan menyimpannya di Redis Cache
   * Dipanggil oleh BullMQ / Cron Job setiap 5 menit.
   */
  async refreshLeaderboardCache() {
    const categories = ['wealth', 'prestige', 'wins'];
    const periods = ['weekly', 'monthly', 'all-time'];

    const today = new Date();
    const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    for (const category of categories) {
      for (const period of periods) {
        let dateFilter: any = {};
        if (period === 'weekly') dateFilter = { gte: oneWeekAgo };
        if (period === 'monthly') dateFilter = { gte: oneMonthAgo };

        let leaderboardData = [];

        // KATEGORI 1: Wealth (Saldo Terkaya)
        if (category === 'wealth') {
          leaderboardData = await this.prisma.user.findMany({
            select: { id: true, username: true, rank: true, balance: true },
            orderBy: { balance: 'desc' },
            take: 50,
          });
        }
        // KATEGORI 2: Prestige (EXP Tertinggi)
        else if (category === 'prestige') {
          leaderboardData = await this.prisma.user.findMany({
            select: { id: true, username: true, rank: true, exp: true },
            orderBy: { exp: 'desc' },
            take: 50,
          });
        }
        // KATEGORI 3: Wins (Kemenangan Lelang Terbanyak)
        else if (category === 'wins') {
          const rawWins = await this.prisma.bid.groupBy({
            by: ['userId'],
            where: { 
              status: 'WON',
              ...(period !== 'all-time' ? { createdAt: dateFilter } : {}),
            },
            _count: { userId: true },
            orderBy: { _count: { userId: 'desc' } },
            take: 50,
          });

          // Lengkapi dengan detail profil user
          for (const item of rawWins) {
            const user = await this.prisma.user.findUnique({
              where: { id: item.userId },
              select: { username: true, rank: true },
            });
            if (user) {
              leaderboardData.push({
                id: item.userId,
                username: user.username,
                rank: user.rank,
                wins: item._count.userId,
              });
            }
          }
        }

        // Simpan data ke cache key
        const cacheKey = `leaderboard:${category}:${period}`;
        await this.setCache(cacheKey, JSON.stringify(leaderboardData));
      }
    }

    console.log('[Leaderboard Cache] Seluruh leaderboard berhasil diperbarui di cache.');
  }

  /**
   * Membaca data leaderboard dari cache (Visel memanggil ini)
   */
  async getLeaderboardFromCache(category: string, period: string) {
    const cacheKey = `leaderboard:${category}:${period}`;
    const cachedData = await this.getCache(cacheKey);

    if (!cachedData) {
      // Jika cache kosong (belum ter-refresh), trigger refresh kueri langsung sebagai fallback
      await this.refreshLeaderboardCache();
      const freshData = await this.getCache(cacheKey);
      return freshData ? JSON.parse(freshData) : [];
    }

    return JSON.parse(cachedData);
  }

  /**
   * Helper Cache Read
   */
  private async getCache(key: string): Promise<string | null> {
    // Di produksi: return this.redis.get(key);
    return this.localCache.get(key) || null;
  }

  /**
   * Helper Cache Write
   */
  private async setCache(key: string, value: string): Promise<void> {
    // Di produksi: await this.redis.set(key, value, 'EX', 360);
    this.localCache.set(key, value);
  }
}
