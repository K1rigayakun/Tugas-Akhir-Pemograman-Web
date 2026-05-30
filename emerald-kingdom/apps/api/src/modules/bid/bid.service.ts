import { Injectable, BadRequestException, ConflictException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { WalletService, WalletTxType } from '../wallet/wallet.service';
import { BidGateway } from './bid.gateway';
import { Rank, AuctionType } from '../auction/dto/create-auction.dto';
import { AuctionStatus } from '../auction/auction.service';
import { AchievementService } from '../achievement/achievement.service';
import * as crypto from 'crypto';

const RANK_WEIGHTS: Record<Rank, number> = {
  [Rank.CIVIS]:     1,
  [Rank.MERCHANT]:  2,
  [Rank.KNIGHT]:    3,
  [Rank.BARON]:     4,
  [Rank.VISCOUNT]:  5,
  [Rank.EARL]:      6,
  [Rank.MARQUIS]:   7,
  [Rank.DUKE]:      8,
  [Rank.SOVEREIGN]: 9,
  [Rank.EMPEROR]:   10,
};

@Injectable()
export class BidService {
  // Mock Redis connection/client local fallback jika Upstash belum tersambung
  private locks: Map<string, string> = new Map();

  // Enkripsi konfigurasi (AES-256-CBC) untuk merenkripsi maxAmount Phantom Bid
  private readonly encryptionKey = process.env.ENCRYPTION_KEY || 'a_very_secret_key_32_characters_long_!!';
  private readonly algorithm = 'aes-256-cbc';
  private readonly ivLength = 16;

  constructor(
    private readonly prisma: PrismaService,
    private readonly walletService: WalletService,
    private readonly bidGateway: BidGateway,
    @Inject(forwardRef(() => AchievementService))
    private readonly achievementService: AchievementService,
  ) {}

  /**
   * Helper Enkripsi
   */
  private encrypt(text: string): string {
    const iv = crypto.randomBytes(this.ivLength);
    const cipher = crypto.createCipheriv(this.algorithm, Buffer.from(this.encryptionKey), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  }

  /**
   * Helper Dekripsi
   */
  private decrypt(text: string): string {
    try {
      const textParts = text.split(':');
      const iv = Buffer.from(textParts.shift()!, 'hex');
      const encryptedText = Buffer.from(textParts.join(':'), 'hex');
      const decipher = crypto.createDecipheriv(this.algorithm, Buffer.from(this.encryptionKey), iv);
      let decrypted = decipher.update(encryptedText);
      decrypted = Buffer.concat([decrypted, decipher.final()]);
      return decrypted.toString();
    } catch (err) {
      console.error('Decryption failed, returning raw text:', err);
      return text;
    }
  }

  /**
   * Mengajukan penawaran baru (Bid Normal)
   */
  async placeBid(auctionId: string, userId: string, amount: number, idempotencyKey: string) {
    const lockKey = `bid-lock:${auctionId}`;
    const lockValue = `${userId}-${Date.now()}`;

    // 1. Ambil Distributed Lock
    const acquired = await this.acquireLock(lockKey, lockValue);
    if (!acquired) {
      throw new ConflictException('Tawaran lain sedang diproses. Silakan coba beberapa saat lagi.');
    }

    try {
      const newBid = await this.prisma.$transaction(async (tx) => {
        // A. Validasi Identitas & Status KYC User
        const user = await tx.user.findUnique({
          where: { id: userId },
          select: { id: true, username: true, rank: true, kycStatus: true },
        });

        if (!user) throw new BadRequestException('User tidak ditemukan');
        if (user.kycStatus !== 'APPROVED') {
          throw new BadRequestException('Akun Anda belum terverifikasi KYC. Silakan selesaikan sumpah warga negara.');
        }

        // B. Ambil & Validasi Data Lelang
        const auction = await tx.auction.findUnique({
          where: { id: auctionId },
        });

        if (!auction) throw new BadRequestException('Lelang tidak ditemukan');
        if (auction.status !== AuctionStatus.ACTIVE && auction.status !== AuctionStatus.ENDING) {
          throw new BadRequestException('Lelang sedang tidak aktif');
        }

        // C. Validasi Rank-Exclusive
        const userWeight = RANK_WEIGHTS[user.rank as Rank] || 1;
        const minRankWeight = RANK_WEIGHTS[auction.minimumRank as Rank] || 1;
        if (userWeight < minRankWeight) {
          throw new BadRequestException(`Lelang ini eksklusif untuk rank ${auction.minimumRank} ke atas.`);
        }

        // D. Validasi Nominal Bid
        if (amount <= auction.currentPrice) {
          throw new BadRequestException('Jumlah bid harus lebih tinggi dari harga tertinggi saat ini');
        }

        // E. Bebaskan saldo hold bid sebelumnya (jawa: release)
        const previousActiveBid = await tx.bid.findFirst({
          where: { auctionId, userId, status: 'ACTIVE' },
        });

        if (previousActiveBid) {
          const releaseKey = `release_prev_${auctionId}_${userId}_${previousActiveBid.id}`;
          await this.walletService.releaseBalance(
            userId,
            previousActiveBid.amount,
            releaseKey,
            auctionId
          );

          // Update status bid lama ke OUTBID
          await tx.bid.update({
            where: { id: previousActiveBid.id },
            data: { status: 'OUTBID' },
          });
        }

        // F. Hold Saldo CC baru user
        const holdKey = idempotencyKey;
        await this.walletService.holdBalance(userId, amount, holdKey, auctionId);

        // G. Catat Bid Baru ke Database
        const newBid = await tx.bid.create({
          data: {
            auctionId,
            userId,
            amount,
            status: 'ACTIVE',
          },
        });

        // Cari tahu bidder tertinggi sebelumnya untuk dikirimi notifikasi outbid
        const prevHighestBid = await tx.bid.findFirst({
          where: { 
            auctionId, 
            status: 'ACTIVE',
            id: { not: newBid.id }
          },
          orderBy: { amount: 'desc' },
        });

        // H. Update Harga Tertinggi Lelang di DB
        const updatedAuction = await tx.auction.update({
          where: { id: auctionId },
          data: { 
            currentPrice: amount,
            highestBidderId: userId
          },
        });

        // I. Cek Anti-Sniping
        let finalEndTime = new Date(updatedAuction.endTime);
        const now = new Date();
        const timeLeftSec = (finalEndTime.getTime() - now.getTime()) / 1000;

        if (timeLeftSec <= 60) { // ANTI_SNIPE_WINDOW_SEC = 60
          const extendedEndTime = new Date(finalEndTime.getTime() + 60 * 1000); // perpanjang 60s
          finalEndTime = extendedEndTime;

          // Update DB dengan waktu baru & ubah status ke ENDING
          await tx.auction.update({
            where: { id: auctionId },
            data: { 
              endTime: extendedEndTime,
              status: AuctionStatus.ENDING
            },
          });

          // Broadcast perpanjangan waktu via WebSocket
          this.bidGateway.broadcastTimerExtended(auctionId, {
            newEndTime: extendedEndTime,
            message: 'A new claim has been declared — the clock extends.'
          });
        }

        // J. Broadcast New Bid via WebSocket ke UI
        this.bidGateway.broadcastNewBid(auctionId, {
          userId,
          amount,
          username: user.username,
          rank: user.rank,
          timestamp: newBid.createdAt,
        });

        // K. Trigger notifikasi Outbid ke user sebelumnya
        if (prevHighestBid && prevHighestBid.userId !== userId) {
          this.triggerOutbidNotification(prevHighestBid.userId, auction.title, amount);
        }

        return newBid;
      });

      // L. Jalankan Duel Phantom Bid jika ada penawar otomatis aktif
      await this.prisma.$transaction(async (tx) => {
        await this.runPhantomBidDuelInternal(tx, auctionId);
      });

      return newBid;
    } finally {
      // 2. Selalu Lepas Lock
      await this.releaseLock(lockKey, lockValue);
    }
  }

  /**
   * Memasang Phantom Bid (Shadow Pledge / Auto-Bid otomatis)
   */
  async placePhantomBid(auctionId: string, userId: string, maxAmount: number, idempotencyKey: string) {
    const lockKey = `bid-lock:${auctionId}`;
    const lockValue = `phantom-${userId}-${Date.now()}`;

    // 1. Ambil Lock
    const acquired = await this.acquireLock(lockKey, lockValue);
    if (!acquired) {
      throw new ConflictException('Tawaran atau sistem auto-bid lain sedang diproses.');
    }

    try {
      await this.prisma.$transaction(async (tx) => {
        // A. Cek KYC User
        const user = await tx.user.findUnique({
          where: { id: userId },
          select: { kycStatus: true },
        });
        if (!user || user.kycStatus !== 'APPROVED') {
          throw new BadRequestException('Akun belum terverifikasi KYC untuk memasang auto-bid.');
        }

        // B. Cek Lelang
        const auction = await tx.auction.findUnique({
          where: { id: auctionId },
        });
        if (!auction || (auction.status !== AuctionStatus.ACTIVE && auction.status !== AuctionStatus.ENDING)) {
          throw new BadRequestException('Lelang tidak aktif');
        }

        if (maxAmount <= auction.currentPrice) {
          throw new BadRequestException('Batas maksimum auto-bid harus lebih tinggi dari harga lelang saat ini');
        }

        // C. Cek apakah user sudah punya active phantom bid sebelumnya di lelang ini
        const prevPhantom = await tx.phantomBid.findFirst({
          where: { auctionId, userId, status: 'ACTIVE' },
        });

        if (prevPhantom) {
          // Dekripsi nilai maxAmount hold lama untuk dikembalikan ke saldo user
          const decryptedMaxAmount = parseInt(this.decrypt(prevPhantom.maxAmount), 10);
          const releaseKey = `release_prev_phantom_${auctionId}_${userId}_${prevPhantom.id}`;
          await this.walletService.releaseBalance(userId, decryptedMaxAmount, releaseKey, auctionId);

          // Tandai status jadi diganti (SUPERSEDED)
          await tx.phantomBid.update({
            where: { id: prevPhantom.id },
            data: { status: 'SUPERSEDED' },
          });
        }

        // D. Hold total batas maksimum saldo user (menjamin dana siap saat duel terjadi)
        const holdKey = idempotencyKey;
        await this.walletService.holdBalance(userId, maxAmount, holdKey, auctionId);

        // E. Catat Phantom Bid baru (Terenkripsi AES-256 untuk kerahasiaan)
        await tx.phantomBid.create({
          data: {
            auctionId,
            userId,
            maxAmount: this.encrypt(maxAmount.toString()),
            status: 'ACTIVE',
          },
        });

        // F. Jalankan simulasi duel auto-bid
        await this.runPhantomBidDuelInternal(tx, auctionId);
      });

      return { status: 'success', message: 'Batas maksimum penawaran (Shadow Pledge) berhasil dikunci.' };
    } finally {
      await this.releaseLock(lockKey, lockValue);
    }
  }

  /**
   * Mengadakan duel penawaran bayangan (Phantom Bid Duel) secara internal di dalam database transaction.
   * Dihitung secara matematis 1-kali jalan tanpa loop kueri berkali-kali ke database.
   */
  private async runPhantomBidDuelInternal(tx: any, auctionId: string) {
    const increment = 100; // Increment minimum bid otomatis

    // 1. Ambil data lelang terupdate
    const auction = await tx.auction.findUnique({
      where: { id: auctionId },
    });
    if (!auction || auction.status === 'ENDED' || auction.status === 'CANCELLED') return;

    // 2. Ambil semua active phantom bids
    const activePhantomsRaw = await tx.phantomBid.findMany({
      where: { auctionId, status: 'ACTIVE' },
      include: { user: true },
    });

    if (activePhantomsRaw.length === 0) return;

    // Dekripsi nilai maxAmount di memori untuk pengurutan logis
    const activePhantoms = activePhantomsRaw.map(p => ({
      ...p,
      maxAmount: parseInt(this.decrypt(p.maxAmount), 10),
    })).sort((a, b) => b.maxAmount - a.maxAmount);

    const currentHighestBidder = auction.highestBidderId;

    // Pisahkan:
    // P_curr = Phantom bid milik penawar tertinggi saat ini (jika ada)
    const pCurr = activePhantoms.find(p => p.userId === currentHighestBidder);
    // P_others = Phantom bid milik user lain (challengers)
    const pOthers = activePhantoms.filter(p => p.userId !== currentHighestBidder);

    if (pOthers.length === 0) {
      // Tidak ada penantang baru, current bidder tetap memimpin lelang
      return;
    }

    const pChallenger = pOthers[0]; // Penantang terkuat (maxAmount terbesar)

    // Skenario A: Penawar tertinggi saat ini juga memiliki active phantom bid
    if (pCurr) {
      if (pChallenger.maxAmount > pCurr.maxAmount) {
        // Penantang mengalahkan penawar tertinggi saat ini!
        const newPrice = Math.min(pCurr.maxAmount + increment, pChallenger.maxAmount);

        // A1. Bebaskan hold penawar saat ini (karena kalah duel)
        const releaseKey = `release_lose_duel_${auctionId}_${pCurr.userId}`;
        await this.walletService.releaseBalance(pCurr.userId, pCurr.maxAmount, releaseKey, auctionId);

        // Tandai phantom bid penawar lama sebagai EXHAUSTED
        await tx.phantomBid.update({
          where: { id: pCurr.id },
          data: { status: 'EXHAUSTED' },
        });

        // A2. Tulis tawaran baru pemenang duel ke tabel bids
        const newBid = await tx.bid.create({
          data: {
            auctionId,
            userId: pChallenger.userId,
            amount: newPrice,
            status: 'ACTIVE',
          },
        });

        // Tandai bid penawar lama sebagai OUTBID
        await tx.bid.updateMany({
          where: { auctionId, status: 'ACTIVE', id: { not: newBid.id } },
          data: { status: 'OUTBID' },
        });

        // A3. Update data lelang
        await tx.auction.update({
          where: { id: auctionId },
          data: { 
            currentPrice: newPrice,
            highestBidderId: pChallenger.userId
          },
        });

        // A4. Broadcast ke Socket
        this.bidGateway.broadcastNewBid(auctionId, {
          userId: pChallenger.userId,
          amount: newPrice,
          username: pChallenger.user.username,
          rank: pChallenger.user.rank,
          timestamp: newBid.createdAt,
        });

        // A5. Tandai phantom bid challengers lain yang di bawah pemenang sebagai EXHAUSTED
        const lowerChallengers = pOthers.slice(1);
        for (const lower of lowerChallengers) {
          const lowerReleaseKey = `release_lose_lower_${auctionId}_${lower.userId}`;
          await this.walletService.releaseBalance(lower.userId, lower.maxAmount, lowerReleaseKey, auctionId);
          await tx.phantomBid.update({
            where: { id: lower.id },
            data: { status: 'EXHAUSTED' },
          });
        }
      } else {
        // Penawar saat ini memenangkan duel (atau seri karena memasang duluan)!
        const newPrice = Math.min(pChallenger.maxAmount + increment, pCurr.maxAmount);

        // A1. Bebaskan hold penantang yang kalah
        const releaseKey = `release_lose_challenger_${auctionId}_${pChallenger.userId}`;
        await this.walletService.releaseBalance(pChallenger.userId, pChallenger.maxAmount, releaseKey, auctionId);

        // Tandai phantom bid penantang sebagai EXHAUSTED
        await tx.phantomBid.update({
          where: { id: pChallenger.id },
          data: { status: 'EXHAUSTED' },
        });

        // A2. Tulis bid baru penawar yang memimpin
        const newBid = await tx.bid.create({
          data: {
            auctionId,
            userId: pCurr.userId,
            amount: newPrice,
            status: 'ACTIVE',
          },
        });

        await tx.bid.updateMany({
          where: { auctionId, status: 'ACTIVE', id: { not: newBid.id } },
          data: { status: 'OUTBID' },
        });

        // A3. Update data lelang
        await tx.auction.update({
          where: { id: auctionId },
          data: { currentPrice: newPrice },
        });

        // A4. Broadcast ke Socket
        this.bidGateway.broadcastNewBid(auctionId, {
          userId: pCurr.userId,
          amount: newPrice,
          username: pCurr.user.username,
          rank: pCurr.user.rank,
          timestamp: newBid.createdAt,
        });

        // A5. Tandai challengers di bawahnya sebagai EXHAUSTED
        const lowerChallengers = pOthers.slice(1);
        for (const lower of lowerChallengers) {
          const lowerReleaseKey = `release_lose_lower_${auctionId}_${lower.userId}`;
          await this.walletService.releaseBalance(lower.userId, lower.maxAmount, lowerReleaseKey, auctionId);
          await tx.phantomBid.update({
            where: { id: lower.id },
            data: { status: 'EXHAUSTED' },
          });
        }
      }
    } 
    // Skenario B: Penawar tertinggi saat ini menawar lewat bid normal (tidak punya active phantom bid)
    else {
      if (pChallenger.maxAmount > auction.currentPrice) {
        // Penantang memenangkan duel melawan bid normal saat ini!
        const newPrice = Math.min(auction.currentPrice + increment, pChallenger.maxAmount);

        // B1. Tulis bid baru penantang
        const newBid = await tx.bid.create({
          data: {
            auctionId,
            userId: pChallenger.userId,
            amount: newPrice,
            status: 'ACTIVE',
          },
        });

        await tx.bid.updateMany({
          where: { auctionId, status: 'ACTIVE', id: { not: newBid.id } },
          data: { status: 'OUTBID' },
        });

        // B2. Update lelang
        await tx.auction.update({
          where: { id: auctionId },
          data: { 
            currentPrice: newPrice,
            highestBidderId: pChallenger.userId
          },
        });

        // B3. Broadcast ke Socket
        this.bidGateway.broadcastNewBid(auctionId, {
          userId: pChallenger.userId,
          amount: newPrice,
          username: pChallenger.user.username,
          rank: pChallenger.user.rank,
          timestamp: newBid.createdAt,
        });

        // B4. Tandai penantang di bawahnya sebagai EXHAUSTED
        const lowerChallengers = pOthers.slice(1);
        for (const lower of lowerChallengers) {
          const lowerReleaseKey = `release_lose_lower_${auctionId}_${lower.userId}`;
          await this.walletService.releaseBalance(lower.userId, lower.maxAmount, lowerReleaseKey, auctionId);
          await tx.phantomBid.update({
            where: { id: lower.id },
            data: { status: 'EXHAUSTED' },
          });
        }
      } else {
        // Batas maksimum penantang tidak mampu melewati bid normal saat ini!
        // Penantang langsung dinyatakan EXHAUSTED
        for (const challenger of pOthers) {
          const releaseKey = `release_failed_phantom_${auctionId}_${challenger.userId}`;
          await this.walletService.releaseBalance(challenger.userId, challenger.maxAmount, releaseKey, auctionId);
          await tx.phantomBid.update({
            where: { id: challenger.id },
            data: { status: 'EXHAUSTED' },
          });
        }
      }
    }
  }

  /**
   * Implementasi lock dengan simulasi (bisa diganti dengan ioredis di production)
   */
  private async acquireLock(key: string, value: string): Promise<boolean> {
    if (this.locks.has(key)) {
      return false;
    }
    this.locks.set(key, value);
    return true;
  }

  private async releaseLock(key: string, value: string): Promise<void> {
    if (this.locks.get(key) === value) {
      this.locks.delete(key);
    }
  }

  /**
   * Menembak trigger ke NotificationService buatan Peter.
   * PETER: Hubungkan kelas NotificationService Anda di sini untuk mengirimkan
   * push notification (FCM) dan email (Resend) ketika user di-outbid.
   */
  private triggerOutbidNotification(userId: string, itemTitle: string, newBidAmount: number) {
    console.log(`[Notification] User ${userId} telah di-outbid pada lelang ${itemTitle} dengan penawaran baru ♛${newBidAmount} CC`);
  }
}
