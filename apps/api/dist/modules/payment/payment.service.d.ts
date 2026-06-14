import { PrismaService } from '../../prisma/prisma.service';
import { PaymentProviderRegistry } from './payment-provider-registry.service';
import { PaymentMethod } from './interfaces/payment-method.enum';
import { TopUpRequest } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';
interface PaymentOptions {
    bank?: string;
    walletType?: string;
    metadata?: Record<string, any>;
}
export declare class PaymentService {
    private readonly prisma;
    private readonly providerRegistry;
    private readonly eventEmitter;
    private stripe;
    private readonly logger;
    constructor(prisma: PrismaService, providerRegistry: PaymentProviderRegistry, eventEmitter: EventEmitter2);
    /**
     * Initiate a payment transaction
     * Validates Requirements 2.1, 2.2, 2.3, 2.7, 2.8
     */
    initiatePayment(userId: string, amount: number, fiatAmount: number, method: PaymentMethod, options?: PaymentOptions): Promise<TopUpRequest>;
    getAvailablePaymentMethods(): {
        id: PaymentMethod;
        label: string;
        description: string;
        provider: string;
        priority: number;
    }[];
    /**
     * Get a single payment by ID
     * Validates Requirements 12.1
     */
    getPaymentById(paymentId: string, userId?: string): Promise<TopUpRequest>;
    /**
     * Get user's payment history with pagination
     * Validates Requirements 12.1, 12.2, 12.3, 12.4, 12.5
     */
    getUserPaymentHistory(userId: string, page?: number, limit?: number): Promise<{
        data: TopUpRequest[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    /**
     * Get payments list for admin with filters
     * Validates Requirements 6.1, 6.2, 4.8 (auto-expiry)
     */
    getAdminPaymentList(status?: string, method?: string, dateFrom?: string, dateTo?: string, page?: number, limit?: number): Promise<{
        data: TopUpRequest[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    /**
     * Approve a top-up request — atomic balance update
     * Uses $transaction to ensure atomicity
     * Validates Requirements 6.3, 6.5, 6.6, 11.6
     */
    approveTopUpRequest(requestId: string, adminId: string, notes?: string): Promise<TopUpRequest>;
    /**
     * Reject a top-up request
     * Validates Requirements 6.4, 6.7
     */
    rejectTopUpRequest(requestId: string, adminId: string, notes: string): Promise<TopUpRequest>;
    /**
     * Upload proof of payment image
     * Validates Requirements 10.2, 10.3, 10.4, 10.6
     */
    uploadProofImage(requestId: string, userId: string, file: Express.Multer.File): Promise<string>;
    /**
     * Complete a test payment (simulate payment success)
     * Validates Requirements 3.5
     */
    completeTestPayment(requestId: string, userId: string): Promise<TopUpRequest>;
    /**
     * Handle incoming webhook from payment gateways
     * Validates Requirements 5.1, 5.2, 5.3, 5.5, 5.6
     */
    handleWebhook(providerName: string, payload: any, signature: string): Promise<void>;
    /**
     * Schedule automatic expiration check for a payment
     * Validates Requirement 2.8, 4.4
     */
    private scheduleExpirationCheck;
    createCheckoutSession(userId: string, amount: number, ccAmount: number): Promise<{
        url: any;
    }>;
    handleStripeWebhook(signature: string, body: Buffer): Promise<{
        received: boolean;
    }>;
    createManualTopup(userId: string, data: {
        amount: number;
        fiatAmount: number;
        method: string;
        provider?: string;
    }): Promise<{
        id: string;
        userId: string;
        amount: number;
        fiatAmount: number;
        method: string;
        provider: string | null;
        bank: string | null;
        walletType: string | null;
        status: import(".prisma/client").$Enums.TopUpStatus;
        proofImageUrl: string | null;
        paymentDetails: import(".prisma/client").Prisma.JsonValue | null;
        expiresAt: Date | null;
        paidAt: Date | null;
        adminNotes: string | null;
        reviewedBy: string | null;
        reviewedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getPendingTopups(): Promise<({
        user: {
            email: string;
            username: string;
        };
    } & {
        id: string;
        userId: string;
        amount: number;
        fiatAmount: number;
        method: string;
        provider: string | null;
        bank: string | null;
        walletType: string | null;
        status: import(".prisma/client").$Enums.TopUpStatus;
        proofImageUrl: string | null;
        paymentDetails: import(".prisma/client").Prisma.JsonValue | null;
        expiresAt: Date | null;
        paidAt: Date | null;
        adminNotes: string | null;
        reviewedBy: string | null;
        reviewedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    approveTopup(adminId: string, topupId: string, approve: boolean): Promise<{
        id: string;
        userId: string;
        amount: number;
        fiatAmount: number;
        method: string;
        provider: string | null;
        bank: string | null;
        walletType: string | null;
        status: import(".prisma/client").$Enums.TopUpStatus;
        proofImageUrl: string | null;
        paymentDetails: import(".prisma/client").Prisma.JsonValue | null;
        expiresAt: Date | null;
        paidAt: Date | null;
        adminNotes: string | null;
        reviewedBy: string | null;
        reviewedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    private mapWebhookStatusToTopUpStatus;
}
export {};
//# sourceMappingURL=payment.service.d.ts.map