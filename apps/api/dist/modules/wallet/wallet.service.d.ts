import { WalletTxType } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
export { WalletTxType } from "@prisma/client";
export declare class WalletService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private ensureWallet;
    /**
     * Get simple wallet balance - optimized for quick response < 200ms
     * Returns only the balance field, handling null wallets by returning 0
     * Uses indexed query on userId (unique index ensures fast lookup)
     */
    getSimpleBalance(userId: string): Promise<{
        balance: number;
    }>;
    getBalance(userId: string): Promise<{
        totalBalance: number;
        pendingHold: number;
        availableBalance: number;
        totalTopUp: number;
        totalSpent: number;
    }>;
    getTransactions(userId: string, page?: number, limit?: number): Promise<{
        data: {
            id: string;
            walletId: string;
            type: import(".prisma/client").$Enums.WalletTxType;
            amount: number;
            description: string;
            referenceId: string | null;
            idempotencyKey: string;
            createdAt: Date;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    holdBalance(userId: string, amount: number, idempotencyKey: string, referenceId?: string): Promise<{
        id: string;
        walletId: string;
        type: import(".prisma/client").$Enums.WalletTxType;
        amount: number;
        description: string;
        referenceId: string | null;
        idempotencyKey: string;
        createdAt: Date;
    }>;
    releaseBalance(userId: string, amount: number, idempotencyKey: string, referenceId?: string): Promise<{
        id: string;
        walletId: string;
        type: import(".prisma/client").$Enums.WalletTxType;
        amount: number;
        description: string;
        referenceId: string | null;
        idempotencyKey: string;
        createdAt: Date;
    }>;
    deductBalance(userId: string, amount: number, type: "BID_DEDUCT" | "SHOP_PURCHASE", idempotencyKey: string, referenceId?: string, deductPendingHold?: boolean): Promise<{
        id: string;
        walletId: string;
        type: import(".prisma/client").$Enums.WalletTxType;
        amount: number;
        description: string;
        referenceId: string | null;
        idempotencyKey: string;
        createdAt: Date;
    }>;
    addBalance(userId: string, amount: number, type: "TOP_UP" | "CASHBACK" | "BONUS" | "REFUND", idempotencyKey: string, referenceId?: string): Promise<{
        id: string;
        walletId: string;
        type: import(".prisma/client").$Enums.WalletTxType;
        amount: number;
        description: string;
        referenceId: string | null;
        idempotencyKey: string;
        createdAt: Date;
    }>;
    handleMidtransCallback(payload: Record<string, string>): Promise<{
        status: string;
    }>;
    initiateTopUp(userId: string, amount: number): Promise<{
        orderId: string;
        amount: number;
        snapToken: string;
        redirectUrl: string;
    }>;
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
    createTransaction(walletId: string, type: WalletTxType, amount: number, description: string, idempotencyKey: string, referenceId?: string): Promise<{
        id: string;
        walletId: string;
        type: import(".prisma/client").$Enums.WalletTxType;
        amount: number;
        description: string;
        referenceId: string | null;
        idempotencyKey: string;
        createdAt: Date;
    }>;
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
    private calculateBalanceChange;
    private assertPositiveAmount;
}
//# sourceMappingURL=wallet.service.d.ts.map