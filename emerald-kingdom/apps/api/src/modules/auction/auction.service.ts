import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { WalletService, WalletTxType } from '../wallet/wallet.service';
import { CreateAuctionDto, AuctionType, Rank } from './dto/create-auction.dto';
import { UpdateAuctionDto } from './dto/update-auction.dto';
import { RankService } from '../rank/rank.service';
import { Inject, forwardRef } from '@nestjs/common';
import { AchievementService } from '../achievement/achievement.service';

export enum AuctionStatus {
  DRAFT     = "DRAFT",
  UPCOMING  = "UPCOMING",
  ACTIVE    = "ACTIVE",
  ENDING    = "ENDING",
  ENDED     = "ENDED",
  CANCELLED = "CANCELLED",
}

export enum ItemRarity {
  COMMON       = "COMMON",
  UNCOMMON     = "UNCOMMON",
  RARE         = "RARE",
  EPIC         = "EPIC",
  LEGENDARY    = "LEGENDARY",
  TRANSCENDENT = "TRANSCENDENT",
}

const CASHBACK_RATES: Record<Rank, number> = {
  [Rank.CIVIS]:     0,
  [Rank.MERCHANT]:  0,
  [Rank.KNIGHT]:    0,
  [Rank.BARON]:     0.02,
  [Rank.VISCOUNT]:  0.03,
  [Rank.EARL]:      0.04,
  [Rank.MARQUIS]:   0.05,
  [Rank.DUKE]:      0.06,
  [Rank.SOVEREIGN]: 0.07,
  [Rank.EMPEROR]:   0.08,
};

@Injectable()
export class AuctionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly walletService: WalletService,
    private readonly rankService: RankService,
    @Inject(forwardRef(() => AchievementService))
    private readonly achievementService: AchievementService,
  ) {}

  /**
   * Menampilkan semua lelang dengan filter opsional
   */
  async findAll(filters: { status?: AuctionStatus; type?: AuctionType; query?: string }) {
    const where: any = {};
    if (filters.status) where.status = filters.status;
    if (filters.type) where.type = filters.type;
    if (filters.query) {
      where.OR = [
        { title: { contains: filters.query, mode: 'insensitive' } },
        { description: { contains: filters.query, mode: 'insensitive' } },
      ];
    }

    return this.prisma.auction.findMany({
      where,
      orderBy: { startTime: 'asc' },
    });
  }

  /**
   * Mendapatkan detail satu lelang
   */
  async findOne(id: string) {
    const auction = await this.prisma.auction.findUnique({
      where: { id },
      include: {
        bids: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!auction) {
      throw new NotFoundException('Lelang tidak ditemukan');
    }
    return auction;
  }

  /**
   * Mendapatkan riwayat penawaran lelang
   */
  async getBids(id: string) {
    await this.findOne(id); // Validasi keberadaan lelang
    return this.prisma.bid.findMany({
      where: { auctionId: id },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Membuat draf lelang baru (Admin)
   */
  async create(dto: CreateAuctionDto) {
    const start = new Date(dto.startTime);
    const end = new Date(dto.endTime);

    if (start >= end) {
      throw new BadRequestException('Waktu mulai harus sebelum waktu selesai');
    }

    return this.prisma.auction.create({
      data: {
        title: dto.title,
        description: dto.description,
        startPrice: dto.startPrice,
        currentPrice: dto.startPrice,
        minimumPrice: dto.minimumPrice,
        startTime: start,
        endTime: end,
        type: dto.type,
        minimumRank: dto.minimumRank || Rank.CIVIS,
        isSealed: dto.isSealed || false,
        status: AuctionStatus.DRAFT,
      },
    });
  }

  /**
   * Memperbarui informasi lelang sebelum aktif
   */
  async update(id: string, dto: UpdateAuctionDto) {
    const auction = await this.findOne(id);

    if (auction.status !== AuctionStatus.DRAFT && auction.status !== AuctionStatus.UPCOMING) {
      throw new BadRequestException('Lelang yang sudah aktif tidak dapat diedit');
    }

    const updateData: any = { ...dto };
    if (dto.startTime) updateData.startTime = new Date(dto.startTime);
    if (dto.endTime) updateData.endTime = new Date(dto.endTime);

    if (updateData.startTime && updateData.endTime && updateData.startTime >= updateData.endTime) {
      throw new BadRequestException('Waktu mulai harus sebelum waktu selesai');
    }

    return this.prisma.auction.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * Mempublikasikan lelang agar siap ditampilkan
   */
  async publish(id: string) {
    const auction = await this.findOne(id);

    if (auction.status !== AuctionStatus.DRAFT) {
      throw new BadRequestException('Hanya lelang berstatus DRAFT yang dapat dipublikasikan');
    }

    const now = new Date();
    const status = auction.startTime <= now ? AuctionStatus.ACTIVE : AuctionStatus.UPCOMING;

    return this.prisma.auction.update({
      where: { id },
      data: { status },
    });
  }

  /**
   * Membatalkan lelang dan mengembalikan CC yang sedang di-hold (Admin)
   */
  async cancel(id: string) {
    const auction = await this.findOne(id);

    if (auction.status === AuctionStatus.ENDED || auction.status === AuctionStatus.CANCELLED) {
      throw new BadRequestException('Lelang sudah selesai atau sudah dibatalkan');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Dapatkan semua penawar aktif yang saldonya ter-hold
      const bidsToRefund = await tx.bid.findMany({
        where: { auctionId: id, status: 'ACTIVE' },
      });

      // 2. Lakukan refund (BID_RELEASE) untuk setiap user secara paralel / sekuensial
      for (const bid of bidsToRefund) {
        const idempotencyKey = `refund_cancel_${id}_${bid.userId}_${bid.id}`;
        await this.walletService.releaseBalance(bid.userId, bid.amount, idempotencyKey, id);

        // Update status bid di database
        await tx.bid.update({
          where: { id: bid.id },
          data: { status: 'REFUNDED' },
        });
      }

      // 3. Update status lelang ke CANCELLED
      return tx.auction.update({
        where: { id },
        data: { status: AuctionStatus.CANCELLED },
      });
    });
  }

  /**
   * Menyelesaikan lelang secara otomatis (Dipanggil oleh BullMQ Scheduler)
   */
  async endAuction(id: string) {
    const auction = await this.prisma.auction.findUnique({
      where: { id },
      include: {
        bids: {
          orderBy: { amount: 'desc' },
        },
      },
    });

    if (!auction) throw new NotFoundException('Lelang tidak ditemukan');
    if (auction.status === AuctionStatus.ENDED || auction.status === AuctionStatus.CANCELLED) {
      return auction;
    }

    const bids = auction.bids;

    // Skenario 1: Tidak ada penawar sama sekali
    if (bids.length === 0) {
      return this.prisma.auction.update({
        where: { id },
        data: { status: AuctionStatus.ENDED },
      });
    }

    return this.prisma.$transaction(async (tx) => {
      // Pemenang adalah penawar tertinggi pertama
      const winnerBid = bids[0];
      const winnerId = winnerBid.userId;
      const finalAmount = winnerBid.amount;

      // 1. Kurangi saldo pemenang dari hold -> deducted (BID_DEDUCT)
      const deductKey = `deduct_win_${id}_${winnerId}`;
      await this.walletService.deductBalance(
        winnerId,
        finalAmount,
        WalletTxType.BID_DEDUCT,
        deductKey,
        id,
        true // isBidHoldDeduct
      );

      // Tandai bid pemenang sebagai WON
      await tx.bid.update({
        where: { id: winnerBid.id },
        data: { status: 'WON' },
      });

      // 2. Kembalikan saldo/hold semua penawar yang kalah
      const losersBids = bids.slice(1);
      // Untuk memastikan kita hanya mengembalikan sekali per user jika user bid berkali-kali
      const refundedUserIds = new Set<string>();

      for (const loserBid of losersBids) {
        if (refundedUserIds.has(loserBid.userId)) continue;

        const refundKey = `release_lose_${id}_${loserBid.userId}_${loserBid.id}`;
        await this.walletService.releaseBalance(
          loserBid.userId,
          loserBid.amount,
          refundKey,
          id
        );

        await tx.bid.update({
          where: { id: loserBid.id },
          data: { status: 'REFUNDED' },
        });

        refundedUserIds.add(loserBid.userId);
      }

      // 3. Ambil data user pemenang untuk hitung Rank dan Cashback
      const winnerUser = await tx.user.findUnique({
        where: { id: winnerId },
        select: { rank: true, username: true },
      });

      // 4. Hitung & berikan Cashback otomatis
      if (winnerUser) {
        const rate = CASHBACK_RATES[winnerUser.rank as Rank] || 0;
        if (rate > 0) {
          const cashbackAmount = Math.floor(finalAmount * rate);
          const cashbackKey = `cashback_${id}_${winnerId}`;
          await this.walletService.addBalance(
            winnerId,
            cashbackAmount,
            WalletTxType.CASHBACK,
            cashbackKey,
            id
          );
        }
      }

      // 5. Berikan EXP reward ke pemenang (Otomatis menghitung Win Streak Multiplier di RankService)
      await this.rankService.awardWinExp(winnerId, tx);

      // Cek Achievement untuk kemenangan lelang ini
      await this.achievementService.check(winnerId, 'AUCTION_WON', { auctionId: id });

      // 6. Cek & daftarkan barang lelang ke Museum jika Rarity: Legendary / Transcendent
      // VISEL: Hasil tulisan di database museumItem ini akan kamu tampilkan di halaman /museum.
      const item = await tx.item.findFirst({
        where: { id: auction.itemId },
      });

      if (item && (item.rarity === ItemRarity.LEGENDARY || item.rarity === ItemRarity.TRANSCENDENT)) {
        await tx.museumItem.create({
          data: {
            itemId: item.id,
            auctionId: id,
            acquiredById: winnerId,
            pricePaid: finalAmount,
            description: `Dimenangkan oleh ${winnerUser?.username || 'Ksatria Kerajaan'} seharga ♛${finalAmount.toLocaleString()} CC`,
          },
        });
      }

      // 7. Pindahkan status lelang ke ENDED
      return tx.auction.update({
        where: { id },
        data: { status: AuctionStatus.ENDED, winnerId },
      });
    });
  }

  /**
   * Logika background untuk menurunkan harga Descending (Reverse Auction) secara berkala.
   * Dipanggil oleh scheduler / cron job.
   */
  async handleDescendingAuctions() {
    const activeDescendingAuctions = await this.prisma.auction.findMany({
      where: {
        type: AuctionType.DESCENDING,
        status: AuctionStatus.ACTIVE,
      },
    });

    for (const auction of activeDescendingAuctions) {
      const now = new Date();
      // Misal harga turun 5% dari selisih startPrice & minimumPrice setiap 1 jam
      // atau turun secara linear berdasarkan waktu
      const totalDurationMs = auction.endTime.getTime() - auction.startTime.getTime();
      const elapsedMs = now.getTime() - auction.startTime.getTime();
      const pctElapsed = Math.min(elapsedMs / totalDurationMs, 1);

      const minPrice = auction.minimumPrice || (auction.startPrice * 0.2); // Default min 20%
      const priceRange = auction.startPrice - minPrice;
      const newPrice = Math.max(
        Math.floor(auction.startPrice - priceRange * pctElapsed),
        minPrice
      );

      if (newPrice !== auction.currentPrice) {
        await this.prisma.auction.update({
          where: { id: auction.id },
          data: { currentPrice: newPrice },
        });

        // Di sini memancarkan update real-time via WebSocket
        // gateway.emitPriceDecrease(auction.id, newPrice);
      }
    }
  }


}
