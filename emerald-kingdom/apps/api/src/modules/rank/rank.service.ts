import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BidGateway } from '../bid/bid.gateway';
import { Rank } from '../auction/dto/create-auction.dto';
import { Inject, forwardRef } from '@nestjs/common';
import { AchievementService } from '../achievement/achievement.service';

const RANK_EXP_THRESHOLDS: Record<Rank, number> = {
  [Rank.CIVIS]:     0,
  [Rank.MERCHANT]:  500,
  [Rank.KNIGHT]:    2000,
  [Rank.BARON]:     8000,
  [Rank.VISCOUNT]:  25000,
  [Rank.EARL]:      80000,
  [Rank.MARQUIS]:   250000,
  [Rank.DUKE]:      600000,
  [Rank.SOVEREIGN]: 1000000,
  [Rank.EMPEROR]:   2000000,
};

const EXP_REWARDS = {
  WIN_AUCTION:          100,
  PLACE_BID:            5,
  DAILY_LOGIN:          3,
  LOGIN_STREAK_7_DAYS:  50,
  WATCH_LIVE_FULL:      15,
  WIN_LIVE_AUCTION:     150,
  TOPUP_PER_10K_CC:     10,
  ACHIEVEMENT_COMMON:   50,
  ACHIEVEMENT_RARE:     200,
  ACHIEVEMENT_EPIC:     500,
  SUBMIT_ITEM_ACCEPTED: 50,
} as const;

const WIN_STREAK_MULTIPLIERS = [
  { minStreak: 10, multiplier: 3.0 },
  { minStreak: 5, multiplier: 2.0 },
  { minStreak: 3, multiplier: 1.5 },
];

@Injectable()
export class RankService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly bidGateway: BidGateway,
    @Inject(forwardRef(() => AchievementService))
    private readonly achievementService: AchievementService,
  ) {}

  /**
   * Mendapatkan informasi detail rank, EXP, dan sisa EXP menuju rank selanjutnya
   */
  async getRankInfo(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, rank: true, exp: true },
    });

    if (!user) throw new NotFoundException('User tidak ditemukan');

    const currentRank = user.rank as Rank;
    const currentExp = user.exp;

    // Hitung rank berikutnya
    const ranks = Object.values(Rank);
    const currentIndex = ranks.indexOf(currentRank);
    const nextRank = currentIndex < ranks.length - 1 ? ranks[currentIndex + 1] : null;
    const nextThreshold = nextRank ? RANK_EXP_THRESHOLDS[nextRank] : null;

    const currentRankThreshold = RANK_EXP_THRESHOLDS[currentRank];
    const expInCurrentRank = currentExp - currentRankThreshold;
    const expNeededForNextRank = nextThreshold ? nextThreshold - currentRankThreshold : 0;
    const progressPercentage = nextThreshold 
      ? Math.min((expInCurrentRank / expNeededForNextRank) * 100, 100) 
      : 100;

    return {
      userId: user.id,
      username: user.username,
      currentRank,
      currentExp,
      nextRank,
      nextRankThreshold: nextThreshold,
      expNeeded: nextThreshold ? Math.max(nextThreshold - currentExp, 0) : 0,
      progressPercentage: Math.round(progressPercentage * 100) / 100,
    };
  }

  /**
   * Memberikan EXP umum kepada user
   */
  async awardExp(userId: string, baseAmount: number, reason: string) {
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
      });

      if (!user) throw new BadRequestException('User tidak ditemukan');

      // Terapkan Event Multiplier jika ada event global aktif
      let multiplier = 1.0;
      const activeEvent = await tx.event.findFirst({
        where: { status: 'ACTIVE' },
      });
      if (activeEvent && activeEvent.expMultiplier) {
        multiplier = activeEvent.expMultiplier;
      }

      const finalAmount = Math.floor(baseAmount * multiplier);
      const newExp = user.exp + finalAmount;

      // Cari rank baru yang memenuhi syarat EXP
      let calculatedRank = user.rank as Rank;
      for (const [r, threshold] of Object.entries(RANK_EXP_THRESHOLDS)) {
        if (newExp >= threshold) {
          calculatedRank = r as Rank;
        }
      }

      // Validasi syarat promosi rank khusus (Sovereign dan Emperor)
      const finalizedRank = await this.verifyRankRequirements(tx, userId, calculatedRank, user.rank as Rank);

      // Simpan pembaruan ke user
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { exp: newExp, rank: finalizedRank },
      });

      // Jika naik rank, proses kosmetik, websocket, dan notifikasi
      if (finalizedRank !== user.rank) {
        await this.handleRankPromotion(tx, userId, user.rank as Rank, finalizedRank, reason);
      }

      return {
        previousExp: user.exp,
        newExp,
        earnedExp: finalAmount,
        previousRank: user.rank,
        currentRank: finalizedRank,
        promoted: finalizedRank !== user.rank,
      };
    });
  }

  /**
   * Memberikan EXP khusus untuk kemenangan lelang (dengan win-streak multiplier)
   */
  async awardWinExp(userId: string, tx?: any) {
    const db = tx || this.prisma;
    
    // 1. Ambil data user & hitung streak kemenangan beruntun (bids dengan status WON)
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        bids: {
          where: { status: 'WON' },
          orderBy: { createdAt: 'desc' },
          take: 12,
        },
      },
    });

    if (!user) throw new BadRequestException('User tidak ditemukan');

    // Hitung streak kemenangan beruntun lelang normal
    // (Asumsi kita memeriksa status bid berurutan untuk menghitung win streak)
    let winStreak = 0;
    for (const bid of user.bids) {
      if (bid.status === 'WON') {
        winStreak++;
      } else {
        break;
      }
    }

    // 2. Tentukan Multiplier berdasarkan Win Streak
    let streakMultiplier = 1.0;
    for (const item of WIN_STREAK_MULTIPLIERS) {
      if (winStreak >= item.minStreak) {
        streakMultiplier = item.multiplier;
        break;
      }
    }

    const baseExp = EXP_REWARDS.WIN_AUCTION;
    const finalBaseExp = Math.floor(baseExp * streakMultiplier);

    // 3. Panggil method awardExp untuk menambahkan EXP ke DB
    return this.awardExp(userId, finalBaseExp, `Memenangkan lelang (Win Streak ${winStreak}x)`);
  }

  /**
   * Mendapatkan riwayat riwayat promosi rank user
   */
  async getRankHistory(userId: string) {
    return this.prisma.rankHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Memvalidasi syarat khusus untuk naik ke rank Sovereign dan Emperor
   */
  private async verifyRankRequirements(tx: any, userId: string, targetRank: Rank, currentRank: Rank): Promise<Rank> {
    // Jika tidak ada perubahan rank khusus, langsung setujui targetRank
    if (targetRank !== Rank.SOVEREIGN && targetRank !== Rank.EMPEROR) {
      return targetRank;
    }

    const now = new Date();

    // Syarat Khusus Sovereign:
    // - Minimal 300 kemenangan lelang
    // - Akun aktif minimal 1 tahun (365 hari)
    // - Tidak pernah di-suspend
    if (targetRank === Rank.SOVEREIGN && currentRank !== Rank.SOVEREIGN) {
      const userDetails = await tx.user.findUnique({
        where: { id: userId },
        select: { createdAt: true },
      });

      const winsCount = await tx.bid.count({
        where: { userId, status: 'WON' },
      });

      const activeDays = (now.getTime() - userDetails.createdAt.getTime()) / (1000 * 60 * 60 * 24);

      if (winsCount < 300 || activeDays < 365) {
        // Gagal memenuhi syarat, tahan user di rank DUKE (rank di bawah Sovereign)
        return Rank.DUKE;
      }
    }

    // Syarat Khusus Emperor:
    // - Minimal 500 kemenangan lelang
    // - Pernah menang minimal 1 live auction
    // - Akun aktif minimal 2 tahun (730 hari)
    // - Sudah di rank Sovereign minimal 6 bulan (180 hari)
    if (targetRank === Rank.EMPEROR && currentRank !== Rank.EMPEROR) {
      const userDetails = await tx.user.findUnique({
        where: { id: userId },
        select: { createdAt: true },
      });

      const winsCount = await tx.bid.count({
        where: { userId, status: 'WON' },
      });

      const liveWinsCount = await tx.bid.count({
        where: { 
          userId, 
          status: 'WON',
          auction: { type: AuctionType.LIVE }
        },
      });

      const activeDays = (now.getTime() - userDetails.createdAt.getTime()) / (1000 * 60 * 60 * 24);

      const sovereignHistory = await tx.rankHistory.findFirst({
        where: { userId, newRank: Rank.SOVEREIGN },
        orderBy: { createdAt: 'asc' },
      });

      const sovereignDays = sovereignHistory 
        ? (now.getTime() - sovereignHistory.createdAt.getTime()) / (1000 * 60 * 60 * 24)
        : 0;

      if (winsCount < 500 || liveWinsCount < 1 || activeDays < 730 || sovereignDays < 180) {
        // Gagal memenuhi syarat, tahan user di rank SOVEREIGN
        return Rank.SOVEREIGN;
      }
    }

    return targetRank;
  }

  /**
   * Memproses kenaikan rank (pemberian kosmetik, trigger WebSocket, dan pencatatan history)
   */
  private async handleRankPromotion(tx: any, userId: string, oldRank: Rank, newRank: Rank, reason: string) {
    // 1. Catat riwayat naik rank
    await tx.rankHistory.create({
      data: {
        userId,
        oldRank,
        newRank,
        reason,
      },
    });

    // 2. Berikan kosmetik rank secara gratis (Assign Cosmetic)
    // PETER: Logika kosmetik Peter diintegrasikan di sini untuk menyimpan item kosmetik baru ke koleksi user
    await tx.userCosmetic.create({
      data: {
        userId,
        cosmeticId: `rank-badge-${newRank.toLowerCase()}`,
        status: 'UNLOCKED',
      },
    }).catch(() => {
      // Abaikan jika kosmetik sudah ada
    });

    // 3. Emit real-time rank:changed ke WebSocket client Syaikah
    const themeVars = this.getRankThemeVars(newRank);
    this.bidGateway.server.to(`user:${userId}`).emit('rank:changed', {
      newRank,
      cssVars: themeVars,
    });

    // 4. Kirim notifikasi global jika ada penobatan Emperor baru
    if (newRank === Rank.EMPEROR) {
      this.bidGateway.server.emit('notification:global', {
        type: 'EMPEROR_ASCENSION',
        title: '👑 Penobatan Kaisar Baru!',
        message: `Terompet kerajaan berbunyi! Pahlawan terkuat telah naik tahta sebagai THE EMPEROR baru kerajaan Emerald Kingdom.`,
      });
    }

    // 5. Cek Achievement untuk kenaikan rank ini
    await this.achievementService.check(userId, 'RANK_UP', { newRank });
  }

  /**
   * Konfigurasi CSS Variable per rank sesuai spesifikasi ASSETS.md
   */
  private getRankThemeVars(rank: Rank) {
    const themes: Record<Rank, { accent: string; glow: string }> = {
      [Rank.CIVIS]:     { accent: "#4A7C6A", glow: "rgba(74,124,106,0.2)"  },
      [Rank.MERCHANT]:  { accent: "#5A8F7A", glow: "rgba(90,143,122,0.25)" },
      [Rank.KNIGHT]:    { accent: "#CD7F32", glow: "rgba(205,127,50,0.3)"  },
      [Rank.BARON]:     { accent: "#CD7F32", glow: "rgba(205,127,50,0.35)" },
      [Rank.VISCOUNT]:  { accent: "#C0C0C0", glow: "rgba(192,192,192,0.3)" },
      [Rank.EARL]:      { accent: "#C9A84C", glow: "rgba(201,168,76,0.35)" },
      [Rank.MARQUIS]:   { accent: "#C9A84C", glow: "rgba(201,168,76,0.4)"  },
      [Rank.DUKE]:      { accent: "#E8A020", glow: "rgba(232,160,32,0.45)" },
      [Rank.SOVEREIGN]: { accent: "#E5E4E2", glow: "rgba(229,228,226,0.4)" },
      [Rank.EMPEROR]:   { accent: "#FFD700", glow: "rgba(255,215,0,0.5)"   },
    };
    return themes[rank];
  }
}
