"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletService = exports.WalletTxType = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
var client_2 = require("@prisma/client");
Object.defineProperty(exports, "WalletTxType", { enumerable: true, get: function () { return client_2.WalletTxType; } });
let WalletService = class WalletService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async ensureWallet(userId) {
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
    async getSimpleBalance(userId) {
        const wallet = await this.prisma.walletAccount.findUnique({
            where: { userId },
            select: { balance: true },
        });
        return { balance: wallet?.balance ?? 0 };
    }
    async getBalance(userId) {
        const wallet = await this.ensureWallet(userId);
        return {
            totalBalance: wallet.balance,
            pendingHold: wallet.pendingHold,
            availableBalance: wallet.balance - wallet.pendingHold,
            totalTopUp: wallet.totalTopUp,
            totalSpent: wallet.totalSpent,
        };
    }
    async getTransactions(userId, page = 1, limit = 10) {
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
    async holdBalance(userId, amount, idempotencyKey, referenceId) {
        this.assertPositiveAmount(amount);
        return this.prisma.$transaction(async (tx) => {
            const existing = await tx.walletTransaction.findUnique({ where: { idempotencyKey } });
            if (existing)
                return existing;
            const wallet = await tx.walletAccount.upsert({
                where: { userId },
                update: {},
                create: { userId },
            });
            if (wallet.balance - wallet.pendingHold < amount) {
                throw new common_1.BadRequestException("Saldo Crown Coin tidak mencukupi");
            }
            await tx.walletAccount.update({
                where: { id: wallet.id },
                data: { pendingHold: { increment: amount } },
            });
            return tx.walletTransaction.create({
                data: {
                    walletId: wallet.id,
                    type: client_1.WalletTxType.BID_HOLD,
                    amount,
                    description: `Menahan ${amount.toLocaleString("id-ID")} CC untuk bid`,
                    referenceId,
                    idempotencyKey,
                },
            });
        });
    }
    async releaseBalance(userId, amount, idempotencyKey, referenceId) {
        this.assertPositiveAmount(amount);
        return this.prisma.$transaction(async (tx) => {
            const existing = await tx.walletTransaction.findUnique({ where: { idempotencyKey } });
            if (existing)
                return existing;
            const wallet = await tx.walletAccount.findUnique({ where: { userId } });
            if (!wallet || wallet.pendingHold < amount) {
                throw new common_1.BadRequestException("Saldo hold tidak mencukupi");
            }
            await tx.walletAccount.update({
                where: { id: wallet.id },
                data: { pendingHold: { decrement: amount } },
            });
            return tx.walletTransaction.create({
                data: {
                    walletId: wallet.id,
                    type: client_1.WalletTxType.BID_RELEASE,
                    amount,
                    description: `Melepas ${amount.toLocaleString("id-ID")} CC dari hold`,
                    referenceId,
                    idempotencyKey,
                },
            });
        });
    }
    async deductBalance(userId, amount, type, idempotencyKey, referenceId, deductPendingHold = true) {
        this.assertPositiveAmount(amount);
        return this.prisma.$transaction(async (tx) => {
            const existing = await tx.walletTransaction.findUnique({ where: { idempotencyKey } });
            if (existing)
                return existing;
            const wallet = await tx.walletAccount.findUnique({ where: { userId } });
            if (!wallet || wallet.balance < amount) {
                throw new common_1.BadRequestException("Saldo Crown Coin tidak mencukupi");
            }
            if (deductPendingHold && wallet.pendingHold < amount) {
                throw new common_1.BadRequestException("Saldo hold tidak mencukupi");
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
                    description: type === client_1.WalletTxType.BID_DEDUCT
                        ? `Pembayaran kemenangan lelang ${amount.toLocaleString("id-ID")} CC`
                        : `Pembelian shop ${amount.toLocaleString("id-ID")} CC`,
                    referenceId,
                    idempotencyKey,
                },
            });
        });
    }
    async addBalance(userId, amount, type, idempotencyKey, referenceId) {
        this.assertPositiveAmount(amount);
        return this.prisma.$transaction(async (tx) => {
            const existing = await tx.walletTransaction.findUnique({ where: { idempotencyKey } });
            if (existing)
                return existing;
            const wallet = await tx.walletAccount.upsert({
                where: { userId },
                update: {},
                create: { userId },
            });
            await tx.walletAccount.update({
                where: { id: wallet.id },
                data: {
                    balance: { increment: amount },
                    totalTopUp: type === client_1.WalletTxType.TOP_UP ? { increment: amount } : undefined,
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
    async handleMidtransCallback(payload) {
        const orderId = payload.order_id;
        const accepted = ["capture", "settlement"].includes(payload.transaction_status);
        if (!orderId?.startsWith("topup_") || !accepted || payload.fraud_status === "challenge") {
            return { status: accepted ? "challenged" : "ignored" };
        }
        const userId = orderId.split("_")[1];
        const amount = Number(payload.gross_amount);
        await this.addBalance(userId, amount, client_1.WalletTxType.TOP_UP, orderId, orderId);
        return { status: "success" };
    }
    async initiateTopUp(userId, amount) {
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
    async createTransaction(walletId, type, amount, description, idempotencyKey, referenceId) {
        this.assertPositiveAmount(amount);
        return await this.prisma.$transaction(async (tx) => {
            // Check idempotency - prevent duplicate transactions
            const existing = await tx.walletTransaction.findUnique({
                where: { idempotencyKey },
            });
            if (existing)
                return existing;
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
    calculateBalanceChange(type, amount) {
        switch (type) {
            // Positive balance changes (add to wallet)
            case client_1.WalletTxType.TOP_UP:
            case client_1.WalletTxType.CASHBACK:
            case client_1.WalletTxType.REFUND:
            case client_1.WalletTxType.BONUS:
                return amount;
            // Negative balance changes (deduct from wallet)
            case client_1.WalletTxType.BID_DEDUCT:
            case client_1.WalletTxType.SHOP_PURCHASE:
                return -amount;
            // No balance change (only affect pendingHold via dedicated methods)
            case client_1.WalletTxType.BID_HOLD:
            case client_1.WalletTxType.BID_RELEASE:
                return 0;
            default:
                throw new common_1.BadRequestException(`Unknown transaction type: ${type}`);
        }
    }
    assertPositiveAmount(amount) {
        if (!Number.isFinite(amount) || amount <= 0) {
            throw new common_1.BadRequestException("Jumlah harus lebih besar dari nol");
        }
    }
};
exports.WalletService = WalletService;
exports.WalletService = WalletService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WalletService);
//# sourceMappingURL=wallet.service.js.map