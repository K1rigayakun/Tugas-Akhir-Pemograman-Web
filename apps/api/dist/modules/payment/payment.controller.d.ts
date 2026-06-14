import { RawBodyRequest } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { InitiatePaymentDto, ApprovePaymentDto, RejectPaymentDto } from './payment.dto';
import { PaymentMethod } from './interfaces/payment-method.enum';
export declare class PaymentController {
    private readonly paymentService;
    constructor(paymentService: PaymentService);
    /**
     * POST /payment/initiate - Create new payment
     * Validates Requirements 2.1, 2.2
     */
    initiatePayment(req: any, dto: InitiatePaymentDto): Promise<{
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
    /**
     * GET /payment/methods - List currently available payment methods
     */
    getPaymentMethods(): Promise<{
        id: PaymentMethod;
        label: string;
        description: string;
        provider: string;
        priority: number;
    }[]>;
    /**
     * POST /payment/:id/complete-test - Complete test payment
     * Validates Requirements 3.5
     */
    completeTestPayment(req: any, id: string): Promise<{
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
    /**
     * POST /payment/:id/upload-proof - Upload payment proof image
     * Validates Requirements 10.1, 10.2, 10.3
     */
    uploadProof(req: any, id: string, file: Express.Multer.File): Promise<{
        proofImageUrl: string;
    }>;
    /**
     * GET /payment/user/history - Get user's payment history
     * Validates Requirements 12.1, 12.2, 12.3
     */
    getUserHistory(req: any, page: number, limit: number): Promise<{
        data: import(".prisma/client").TopUpRequest[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    /**
     * POST /payment/webhook - Stripe webhook
     */
    handleStripeWebhook(signature: string, req: RawBodyRequest<Request>): Promise<{
        received: boolean;
    }>;
    /**
     * POST /payment/webhook/:provider - Provider webhook
     * Validates Requirements 5.1
     */
    handleProviderWebhook(provider: string, signature: string, payload: any): Promise<{
        received: boolean;
        error: string;
    } | {
        received: boolean;
        error?: undefined;
    }>;
    /**
     * GET /payment/admin/list - List payments for admin
     * Validates Requirements 6.1, 6.2
     */
    getAdminPaymentList(req: any, status?: string, method?: string, dateFrom?: string, dateTo?: string, page?: number, limit?: number): Promise<{
        data: import(".prisma/client").TopUpRequest[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    /**
     * POST /payment/admin/:id/approve - Approve payment
     * Validates Requirements 6.3, 6.5
     */
    approvePayment(req: any, id: string, dto: ApprovePaymentDto): Promise<{
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
    /**
     * POST /payment/admin/:id/reject - Reject payment
     * Validates Requirements 6.4, 6.7
     */
    rejectPayment(req: any, id: string, dto: RejectPaymentDto): Promise<{
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
    createCheckout(req: any, body: {
        amount: number;
        ccAmount: number;
    }): Promise<{
        url: any;
    }>;
    createManualTopup(req: any, body: {
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
    getPendingTopups(req: any): Promise<({
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
    approveTopup(req: any, id: string, body: {
        approve: boolean;
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
    /**
     * GET /payment/:id - Get payment details
     * Keep this after all static GET routes so /user/history and /admin/list
     * are not interpreted as payment IDs.
     */
    getPayment(req: any, id: string): Promise<{
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
}
//# sourceMappingURL=payment.controller.d.ts.map