import { WalletService } from './wallet.service';
export declare class WalletController {
    private readonly walletService;
    constructor(walletService: WalletService);
    /**
     * Get current wallet balance - optimized for quick response
     * Returns just the balance field, handling null wallets by returning 0
     * Uses indexed query for < 200ms response time
     */
    getBalance(req: any): Promise<{
        balance: number;
    }>;
    /**
     * Get detailed wallet information (total, hold, available)
     * Legacy endpoint for backward compatibility
     */
    getDetailedBalance(req: any): Promise<{
        totalBalance: number;
        pendingHold: number;
        availableBalance: number;
        totalTopUp: number;
        totalSpent: number;
    }>;
    /**
     * Riwayat transaksi dompet (paginated)
     */
    getTransactions(req: any, page: string, limit: string): Promise<{
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
    initiateTopUp(req: any, body: {
        amount: number;
    }): Promise<{
        orderId: string;
        amount: number;
        snapToken: string;
        redirectUrl: string;
    }>;
    /**
     * Webhook Callback dari Midtrans Sandbox
     */
    handleCallback(payload: any): Promise<{
        status: string;
    }>;
    /**
     * Endpoint Dummy Top Up untuk testing (Instan nambah saldo)
     */
    dummyTopUp(req: any, body: {
        amount: number;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
}
//# sourceMappingURL=wallet.controller.d.ts.map