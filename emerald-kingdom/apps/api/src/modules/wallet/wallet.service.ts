import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

import { Inject, forwardRef } from '@nestjs/common';
import { AchievementService } from '../achievement/achievement.service';

export enum WalletTxType {
  TOP_UP        = "TOP_UP",
  BID_HOLD      = "BID_HOLD",
  BID_RELEASE   = "BID_RELEASE",
  BID_DEDUCT    = "BID_DEDUCT",
  CASHBACK      = "CASHBACK",
  SHOP_PURCHASE = "SHOP_PURCHASE",
  REFUND        = "REFUND",
  BONUS         = "BONUS",
}

@Injectable()
export class WalletService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => AchievementService))
    private readonly achievementService: AchievementService,
  ) {}

  /**
   * Mendapatkan saldo saat ini (total, hold, dan tersedia)
   */
  async getBalance(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { balance: true, holdBalance: true },
    });

    if (!user) {
      throw new BadRequestException('User tidak ditemukan');
    }

    const availableBalance = user.balance - user.holdBalance;
    return {
      totalBalance: user.balance,
      holdBalance: user.holdBalance,
      availableBalance,
    };
  }

  /**
   * Riwayat transaksi dompet (paginated)
   */
  async getTransactions(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [transactions, total] = await Promise.all([
      this.prisma.walletTransaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.walletTransaction.count({ where: { userId } }),
    ]);

    return {
      data: transactions,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Menahan saldo untuk bid aktif (BID_HOLD)
   */
  async holdBalance(userId: string, amount: number, idempotencyKey: string, referenceId?: string) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Cek Idempotency Key
      const existingTx = await tx.walletTransaction.findUnique({
        where: { idempotencyKey },
      });
      if (existingTx) return existingTx;

      // 2. Cek Saldo User
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { balance: true, holdBalance: true },
      });

      if (!user) throw new BadRequestException('User tidak ditemukan');

      const available = user.balance - user.holdBalance;
      if (available < amount) {
        throw new BadRequestException('Saldo tidak mencukupi untuk melakukan penawaran');
      }

      // 3. Update Hold Balance User
      await tx.user.update({
        where: { id: userId },
        data: { holdBalance: { increment: amount } },
      });

      // 4. Catat Transaksi Append-Only
      return tx.walletTransaction.create({
        data: {
          userId,
          amount,
          type: WalletTxType.BID_HOLD,
          idempotencyKey,
          referenceId, // id lelang/barang
          description: `Menahan saldo sebesar ♛${amount.toLocaleString()} CC untuk penawaran`,
        },
      });
    });
  }

  /**
   * Melepas saldo hold jika kalah bid / outbid (BID_RELEASE)
   */
  async releaseBalance(userId: string, amount: number, idempotencyKey: string, referenceId?: string) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Cek Idempotency Key
      const existingTx = await tx.walletTransaction.findUnique({
        where: { idempotencyKey },
      });
      if (existingTx) return existingTx;

      // 2. Cek Saldo User & Verifikasi Hold Balance cukup
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { holdBalance: true },
      });

      if (!user) throw new BadRequestException('User tidak ditemukan');
      if (user.holdBalance < amount) {
        throw new BadRequestException('Saldo ditahan kurang dari jumlah yang ingin dilepas');
      }

      // 3. Update Hold Balance User (kurangi hold)
      await tx.user.update({
        where: { id: userId },
        data: { holdBalance: { decrement: amount } },
      });

      // 4. Catat Transaksi Append-Only
      return tx.walletTransaction.create({
        data: {
          userId,
          amount,
          type: WalletTxType.BID_RELEASE,
          idempotencyKey,
          referenceId,
          description: `Melepas saldo tertahan sebesar ♛${amount.toLocaleString()} CC`,
        },
      });
    });
  }

  /**
   * Memotong saldo pemenang lelang (BID_DEDUCT / SHOP_PURCHASE)
   */
  async deductBalance(
    userId: string, 
    amount: number, 
    type: WalletTxType.BID_DEDUCT | WalletTxType.SHOP_PURCHASE, 
    idempotencyKey: string, 
    referenceId?: string,
    isBidHoldDeduct = true
  ) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Cek Idempotency
      const existingTx = await tx.walletTransaction.findUnique({
        where: { idempotencyKey },
      });
      if (existingTx) return existingTx;

      // 2. Cek saldo & hold
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { balance: true, holdBalance: true },
      });

      if (!user) throw new BadRequestException('User tidak ditemukan');
      if (user.balance < amount) {
        throw new BadRequestException('Saldo tidak mencukupi untuk pembayaran');
      }

      // 3. Update User Balance & Hold
      const updateData: any = {
        balance: { decrement: amount }
      };

      // Jika memotong dari saldo lelang yang sedang di-hold
      if (isBidHoldDeduct) {
        if (user.holdBalance < amount) {
          throw new BadRequestException('Saldo ditahan tidak cukup untuk dipotong');
        }
        updateData.holdBalance = { decrement: amount };
      }

      await tx.user.update({
        where: { id: userId },
        data: updateData,
      });

      // 4. Catat Transaksi Append-Only
      return tx.walletTransaction.create({
        data: {
          userId,
          amount,
          type,
          idempotencyKey,
          referenceId,
          description: type === WalletTxType.BID_DEDUCT
            ? `Pembayaran pemenang lelang sebesar ♛${amount.toLocaleString()} CC`
            : `Pembelian barang kosmetik sebesar ♛${amount.toLocaleString()} CC`,
        },
      });
    });
  }

  /**
   * Menambah saldo (TOP_UP, CASHBACK, BONUS, REFUND)
   */
  async addBalance(
    userId: string, 
    amount: number, 
    type: WalletTxType.TOP_UP | WalletTxType.CASHBACK | WalletTxType.BONUS | WalletTxType.REFUND, 
    idempotencyKey: string, 
    referenceId?: string
  ) {
    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Cek Idempotency
      const existingTx = await tx.walletTransaction.findUnique({
        where: { idempotencyKey },
      });
      if (existingTx) return existingTx;

      // 2. Update Saldo User
      const user = await tx.user.update({
        where: { id: userId },
        data: { balance: { increment: amount } },
      });

      if (!user) throw new BadRequestException('User tidak ditemukan');

      // 3. Catat Transaksi Append-Only
      let desc = '';
      switch (type) {
        case WalletTxType.TOP_UP:
          desc = `Top-up saldo berhasil sebesar ♛${amount.toLocaleString()} CC`;
          break;
        case WalletTxType.CASHBACK:
          desc = `Cashback lelang diterima sebesar ♛${amount.toLocaleString()} CC`;
          break;
        case WalletTxType.REFUND:
          desc = `Refund dana lelang dibatalkan sebesar ♛${amount.toLocaleString()} CC`;
          break;
        case WalletTxType.BONUS:
          desc = `Bonus loyalitas sebesar ♛${amount.toLocaleString()} CC`;
          break;
      }

      return tx.walletTransaction.create({
        data: {
          userId,
          amount,
          type,
          idempotencyKey,
          referenceId,
          description: desc,
        },
      });
    });

    // 4. Trigger Achievement Check
    if (type === WalletTxType.TOP_UP) {
      await this.achievementService.check(userId, 'TOP_UP');
    }

    return result;
  }

  /**
   * Memproses Webhook Callback dari Midtrans
   */
  async handleMidtransCallback(payload: any) {
    const orderId = payload.order_id;
    const transactionStatus = payload.transaction_status;
    const fraudStatus = payload.fraud_status;
    const grossAmount = parseFloat(payload.gross_amount);

    // Dapatkan data user & transaksi dari format order_id: "topup_{userId}_{timestamp/uuid}"
    const parts = orderId.split('_');
    if (parts[0] !== 'topup' || parts.length < 3) {
      throw new BadRequestException('Format order_id tidak valid');
    }
    const userId = parts[1];
    const idempotencyKey = orderId; // Gunakan order_id sebagai idempotency key

    if (transactionStatus === 'capture' || transactionStatus === 'settlement') {
      if (fraudStatus === 'challenge') {
        // Log status challenge (perlu peninjauan manual)
        return { status: 'challenged' };
      } else if (fraudStatus === 'accept') {
        // Konversi IDR ke CC. Misal 1 IDR = 1 CC (atau sesuaikan rate)
        const ccAmount = grossAmount;
        await this.addBalance(userId, ccAmount, WalletTxType.TOP_UP, idempotencyKey, orderId);
        return { status: 'success' };
      }
    } else if (transactionStatus === 'pending') {
      return { status: 'pending' };
    } else if (
      transactionStatus === 'deny' ||
      transactionStatus === 'expire' ||
      transactionStatus === 'cancel'
    ) {
      // Pembayaran gagal atau dibatalkan
      return { status: 'failed' };
    }

    return { status: 'ignored' };
  }

  /**
   * Menginisiasi Top-up melalui Midtrans Snap API
   */
  async initiateTopUp(userId: string, amount: number) {
    const timestamp = Date.now();
    const orderId = `topup_${userId}_${timestamp}`;
    const idrAmount = amount; // Asumsi 1 CC = 1 IDR

    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    if (serverKey) {
      try {
        const authHeader = Buffer.from(`${serverKey}:`).toString('base64');
        const response = await fetch('https://app.sandbox.midtrans.com/snap/v1/transactions', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Basic ${authHeader}`,
          },
          body: JSON.stringify({
            transaction_details: {
              order_id: orderId,
              gross_amount: idrAmount,
            },
            credit_card: {
              secure: true,
            },
          }),
        });

        if (response.ok) {
          const data = await response.json();
          return {
            orderId,
            snapToken: data.token,
            redirectUrl: data.redirect_url,
            amount,
          };
        }
      } catch (err) {
        console.error('Midtrans API Error, falling back to mock:', err);
      }
    }

    // Fallback Mock jika serverKey kosong atau gagal connect
    const mockSnapToken = `snap-token-mock-${userId}-${timestamp}`;
    const redirectUrl = `https://app.sandbox.midtrans.com/snap/v2/vtweb/${mockSnapToken}`;

    return {
      orderId,
      snapToken: mockSnapToken,
      redirectUrl,
      amount,
    };
  }
}
