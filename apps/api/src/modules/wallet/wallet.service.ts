import { BadRequestException, Injectable } from "@nestjs/common";
import { WalletTxType } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";

export { WalletTxType } from "@prisma/client";

@Injectable()
export class WalletService {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureWallet(userId: string) {
    return this.prisma.walletAccount.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });
  }

  /**
   * Get simple wallet balance - optimized for quick response < 200ms
   * Returns only the balance field, handling null wallets by returning 0
   * Uses indexed query on userId (unique index ensures fast lookup)
   */
  async getSimpleBalance(userId: string) {
    const wallet = await this.prisma.walletAccount.findUnique({
      where: { userId },
      select: { balance: true },
    });
    
    return { balance: wallet?.balance ?? 0 };
  }

  async getBalance(userId: string) {
    const wallet = await this.ensureWallet(userId);
    return {
      totalBalance: wallet.balance,
      pendingHold: wallet.pendingHold,
      availableBalance: wallet.balance - wallet.pendingHold,
      totalTopUp: wallet.totalTopUp,
      totalSpent: wallet.totalSpent,
    };
  }

  async getTransactions(userId: string, page = 1, limit = 10) {
    const wallet = await this.ensureWallet(userId);
    const take = Math.min(Math.max(limit, 1), 100);
    const skip = (Math.max(page, 1) - 1) * take;
    const where = { walletId: wallet.id };
    const [data, total] = await Promise.all([
      this.prisma.walletTransaction.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      this.prisma.walletTransaction.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit: take, totalPages: Math.ceil(total / take) },
    };
  }

  async holdBalance(
    userId: string,
    amount: number,
    idempotencyKey: string,
    referenceId?: string,
  ) {
    this.assertPositiveAmount(amount);
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.walletTransaction.findUnique({ where: { idempotencyKey } });
      if (existing) return existing;

      const wallet = await tx.walletAccount.upsert({
        where: { userId },
        update: {},
        create: { userId },
      });
      if (wallet.balance - wallet.pendingHold < amount) {
        throw new BadRequestException("Saldo Crown Coin tidak mencukupi");
      }

      await tx.walletAccount.update({
        where: { id: wallet.id },
        data: { pendingHold: { increment: amount } },
      });
      return tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: WalletTxType.BID_HOLD,
          amount,
          description: `Menahan ${amount.toLocaleString("id-ID")} CC untuk bid`,
          referenceId,
          idempotencyKey,
        },
      });
    });
  }

  async releaseBalance(
    userId: string,
    amount: number,
    idempotencyKey: string,
    referenceId?: string,
  ) {
    this.assertPositiveAmount(amount);
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.walletTransaction.findUnique({ where: { idempotencyKey } });
      if (existing) return existing;

      const wallet = await tx.walletAccount.findUnique({ where: { userId } });
      if (!wallet || wallet.pendingHold < amount) {
        throw new BadRequestException("Saldo hold tidak mencukupi");
      }

      await tx.walletAccount.update({
        where: { id: wallet.id },
        data: { pendingHold: { decrement: amount } },
      });
      return tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: WalletTxType.BID_RELEASE,
          amount,
          description: `Melepas ${amount.toLocaleString("id-ID")} CC dari hold`,
          referenceId,
          idempotencyKey,
        },
      });
    });
  }

  async deductBalance(
    userId: string,
    amount: number,
    type: "BID_DEDUCT" | "SHOP_PURCHASE",
    idempotencyKey: string,
    referenceId?: string,
    deductPendingHold = true,
  ) {
    this.assertPositiveAmount(amount);
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.walletTransaction.findUnique({ where: { idempotencyKey } });
      if (existing) return existing;

      const wallet = await tx.walletAccount.findUnique({ where: { userId } });
      if (!wallet || wallet.balance < amount) {
        throw new BadRequestException("Saldo Crown Coin tidak mencukupi");
      }
      if (deductPendingHold && wallet.pendingHold < amount) {
        throw new BadRequestException("Saldo hold tidak mencukupi");
      }

      await tx.walletAccount.update({
        where: { id: wallet.id },
        data: {
          balance: { decrement: amount },
          pendingHold: deductPendingHold ? { decrement: amount } : undefined,
          totalSpent: { increment: amount },
        },
      });
      return tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type,
          amount,
          description:
            type === WalletTxType.BID_DEDUCT
              ? `Pembayaran kemenangan lelang ${amount.toLocaleString("id-ID")} CC`
              : `Pembelian shop ${amount.toLocaleString("id-ID")} CC`,
          referenceId,
          idempotencyKey,
        },
      });
    });
  }

  async addBalance(
    userId: string,
    amount: number,
    type: "TOP_UP" | "CASHBACK" | "BONUS" | "REFUND",
    idempotencyKey: string,
    referenceId?: string,
  ) {
    this.assertPositiveAmount(amount);
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.walletTransaction.findUnique({ where: { idempotencyKey } });
      if (existing) return existing;

      const wallet = await tx.walletAccount.upsert({
        where: { userId },
        update: {},
        create: { userId },
      });
      await tx.walletAccount.update({
        where: { id: wallet.id },
        data: {
          balance: { increment: amount },
          totalTopUp: type === WalletTxType.TOP_UP ? { increment: amount } : undefined,
        },
      });
      return tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type,
          amount,
          description: `${type.replace(/_/g, " ")} ${amount.toLocaleString("id-ID")} CC`,
          referenceId,
          idempotencyKey,
        },
      });
    });
  }

  async handleMidtransCallback(payload: Record<string, string>) {
    const orderId = payload.order_id;
    const accepted = ["capture", "settlement"].includes(payload.transaction_status);
    if (!orderId?.startsWith("topup_") || !accepted || payload.fraud_status === "challenge") {
      return { status: accepted ? "challenged" : "ignored" };
    }

    const userId = orderId.split("_")[1];
    const amount = Number(payload.gross_amount);
    await this.addBalance(userId, amount, WalletTxType.TOP_UP, orderId, orderId);
    return { status: "success" };
  }

  async initiateTopUp(userId: string, amount: number) {
    this.assertPositiveAmount(amount);
    const orderId = `topup_${userId}_${Date.now()}`;
    return {
      orderId,
      amount,
      snapToken: `sandbox-${orderId}`,
      redirectUrl: `https://app.sandbox.midtrans.com/snap/v2/vtweb/sandbox-${orderId}`,
    };
  }

  /**
   * Generic method to create a wallet transaction with atomic balance update
   * Implements the design pattern for all transaction types
   * 
   * @param walletId - The wallet account ID
   * @param type - Type of transaction from WalletTxType enum
   * @param amount - Transaction amount (always positive)
   * @param description - Human-readable transaction description
   * @param idempotencyKey - Unique key to prevent duplicate transactions
   * @param referenceId - Optional reference to related entity (auction, topup, etc.)
   * @returns The created WalletTransaction record
   */
  async createTransaction(
    walletId: string,
    type: WalletTxType,
    amount: number,
    description: string,
    idempotencyKey: string,
    referenceId?: string,
  ) {
    this.assertPositiveAmount(amount);
    
    return await this.prisma.$transaction(async (tx) => {
      // Check idempotency - prevent duplicate transactions
      const existing = await tx.walletTransaction.findUnique({
        where: { idempotencyKey },
      });
      if (existing) return existing;

      // Create transaction record
      const transaction = await tx.walletTransaction.create({
        data: {
          walletId,
          type,
          amount,
          description,
          referenceId,
          idempotencyKey,
        },
      });

      // Update wallet balance atomically based on transaction type
      const balanceChange = this.calculateBalanceChange(type, amount);
      await tx.walletAccount.update({
        where: { id: walletId },
        data: { balance: { increment: balanceChange } },
      });

      return transaction;
    });
  }

  /**
   * Calculate the balance change for a given transaction type
   * Handles all WalletTxType enum values:
   * - Positive (increment): TOP_UP, CASHBACK, REFUND, BONUS
   * - Negative (decrement): BID_DEDUCT, SHOP_PURCHASE
   * - No change: BID_HOLD, BID_RELEASE (these only affect pendingHold field)
   * 
   * Note: BID_HOLD and BID_RELEASE don't change actual balance, only pendingHold.
   * This method is for the balance field specifically.
   * Use holdBalance() or releaseBalance() methods for operations affecting pendingHold.
   * 
   * @param type - Transaction type
   * @param amount - Transaction amount (always positive)
   * @returns The balance change (positive, negative, or zero)
   */
  private calculateBalanceChange(type: WalletTxType, amount: number): number {
    switch (type) {
      // Positive balance changes (add to wallet)
      case WalletTxType.TOP_UP:
      case WalletTxType.CASHBACK:
      case WalletTxType.REFUND:
      case WalletTxType.BONUS:
        return amount;

      // Negative balance changes (deduct from wallet)
      case WalletTxType.BID_DEDUCT:
      case WalletTxType.SHOP_PURCHASE:
        return -amount;

      // No balance change (only affect pendingHold via dedicated methods)
      case WalletTxType.BID_HOLD:
      case WalletTxType.BID_RELEASE:
        return 0;

      default:
        throw new BadRequestException(`Unknown transaction type: ${type}`);
    }
  }

  private assertPositiveAmount(amount: number) {
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new BadRequestException("Jumlah harus lebih besar dari nol");
    }
  }
}
