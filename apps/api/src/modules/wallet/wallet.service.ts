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

  private assertPositiveAmount(amount: number) {
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new BadRequestException("Jumlah harus lebih besar dari nol");
    }
  }
}
