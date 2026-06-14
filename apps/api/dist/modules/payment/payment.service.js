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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var PaymentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const stripe_1 = __importDefault(require("stripe"));
const client_1 = require("@prisma/client");
const payment_provider_registry_service_1 = require("./payment-provider-registry.service");
const payment_method_enum_1 = require("./interfaces/payment-method.enum");
const event_emitter_1 = require("@nestjs/event-emitter");
let PaymentService = PaymentService_1 = class PaymentService {
    constructor(prisma, providerRegistry, eventEmitter) {
        this.prisma = prisma;
        this.providerRegistry = providerRegistry;
        this.eventEmitter = eventEmitter;
        this.logger = new common_1.Logger(PaymentService_1.name);
        this.stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY || '', {
            apiVersion: '2023-10-16',
        });
    }
    // ═══════════════════════════════════════════════════════════
    //  CORE PAYMENT INITIATION
    // ═══════════════════════════════════════════════════════════
    /**
     * Initiate a payment transaction
     * Validates Requirements 2.1, 2.2, 2.3, 2.7, 2.8
     */
    async initiatePayment(userId, amount, fiatAmount, method, options) {
        // Validate amount greater than zero (Requirement 2.1)
        if (amount <= 0 || fiatAmount <= 0) {
            this.logger.warn(`Invalid payment amount: CC=${amount}, Fiat=${fiatAmount} for user ${userId}`);
            throw new common_1.BadRequestException('Amount must be greater than zero');
        }
        this.logger.log(`Initiating payment for user ${userId}: ${amount} CC (${fiatAmount} IDR) via ${method}`);
        // Get appropriate provider from registry (Requirement 2.3)
        const provider = this.providerRegistry.getProviderForMethod(method);
        this.logger.log(`Using provider: ${provider.name} for method: ${method}`);
        try {
            // Call provider.createPayment with request data (Requirement 2.3)
            const paymentResponse = await provider.createPayment({
                userId,
                amount,
                fiatAmount,
                method,
                bank: options?.bank,
                walletType: options?.walletType,
                metadata: options?.metadata
            });
            this.logger.log(`Payment created with transaction ID: ${paymentResponse.transactionId}`);
            // Create TopUpRequest record in database with payment details (Requirements 2.2, 2.7, 2.8)
            const topUpRequest = await this.prisma.topUpRequest.create({
                data: {
                    userId,
                    amount,
                    fiatAmount,
                    method,
                    provider: provider.name,
                    bank: options?.bank,
                    walletType: options?.walletType,
                    status: client_1.TopUpStatus.PENDING,
                    paymentDetails: paymentResponse.paymentDetails,
                    expiresAt: paymentResponse.expiresAt
                }
            });
            this.logger.log(`TopUpRequest created: ${topUpRequest.id}`);
            // Schedule expiration check using setTimeout (Requirement 2.8)
            this.scheduleExpirationCheck(topUpRequest.id, paymentResponse.expiresAt);
            return topUpRequest;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            const errorStack = error instanceof Error ? error.stack : undefined;
            this.logger.error(`Failed to initiate payment for user ${userId}: ${errorMessage}`, errorStack);
            throw new common_1.BadRequestException(`Failed to initiate payment: ${errorMessage}`);
        }
    }
    // ═══════════════════════════════════════════════════════════
    //  PAYMENT QUERY METHODS
    // ═══════════════════════════════════════════════════════════
    getAvailablePaymentMethods() {
        return [
            {
                id: payment_method_enum_1.PaymentMethod.TESTING,
                label: 'Testing / Demo',
                description: 'Simulasi pembayaran untuk testing dan demonstrasi',
                provider: this.providerRegistry.getProviderForMethod(payment_method_enum_1.PaymentMethod.TESTING).name,
                priority: 1,
            },
            {
                id: payment_method_enum_1.PaymentMethod.QRIS,
                label: 'QRIS',
                description: 'Scan QR code dari aplikasi bank atau e-wallet',
                provider: this.providerRegistry.getProviderForMethod(payment_method_enum_1.PaymentMethod.QRIS).name,
                priority: 2,
            },
            {
                id: payment_method_enum_1.PaymentMethod.VIRTUAL_ACCOUNT,
                label: 'Virtual Account',
                description: 'Transfer melalui rekening virtual bank',
                provider: this.providerRegistry.getProviderForMethod(payment_method_enum_1.PaymentMethod.VIRTUAL_ACCOUNT).name,
                priority: 3,
            },
            {
                id: payment_method_enum_1.PaymentMethod.EWALLET,
                label: 'E-Wallet',
                description: 'GoPay, OVO, Dana, ShopeePay, atau LinkAja',
                provider: this.providerRegistry.getProviderForMethod(payment_method_enum_1.PaymentMethod.EWALLET).name,
                priority: 4,
            },
            {
                id: payment_method_enum_1.PaymentMethod.STRIPE,
                label: 'Kartu Kredit / Debit',
                description: 'Pembayaran kartu melalui checkout aman',
                provider: this.providerRegistry.getProviderForMethod(payment_method_enum_1.PaymentMethod.STRIPE).name,
                priority: 5,
            },
            {
                id: payment_method_enum_1.PaymentMethod.BANK_TRANSFER,
                label: 'Transfer Bank',
                description: 'Transfer manual dan upload bukti pembayaran',
                provider: this.providerRegistry.getProviderForMethod(payment_method_enum_1.PaymentMethod.BANK_TRANSFER).name,
                priority: 6,
            },
        ].filter((method) => this.providerRegistry.isMethodSupported(method.id));
    }
    /**
     * Get a single payment by ID
     * Validates Requirements 12.1
     */
    async getPaymentById(paymentId, userId) {
        const whereClause = { id: paymentId };
        if (userId) {
            whereClause.userId = userId;
        }
        const payment = await this.prisma.topUpRequest.findFirst({
            where: whereClause,
            include: {
                user: { select: { username: true, email: true } }
            }
        });
        if (!payment) {
            throw new common_1.NotFoundException('Pembayaran tidak ditemukan');
        }
        return payment;
    }
    /**
     * Get user's payment history with pagination
     * Validates Requirements 12.1, 12.2, 12.3, 12.4, 12.5
     */
    async getUserPaymentHistory(userId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.prisma.topUpRequest.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.topUpRequest.count({ where: { userId } })
        ]);
        return {
            data,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }
    /**
     * Get payments list for admin with filters
     * Validates Requirements 6.1, 6.2, 4.8 (auto-expiry)
     */
    async getAdminPaymentList(status, method, dateFrom, dateTo, page = 1, limit = 20) {
        // Auto-expire pending requests past expiresAt (Requirement 4.8)
        const now = new Date();
        const expiredResult = await this.prisma.topUpRequest.updateMany({
            where: {
                status: client_1.TopUpStatus.PENDING,
                expiresAt: { lt: now }
            },
            data: { status: client_1.TopUpStatus.EXPIRED }
        });
        if (expiredResult.count > 0) {
            this.logger.log(`Auto-expired ${expiredResult.count} pending payment(s) in getAdminPaymentList`);
        }
        const where = {};
        if (status) {
            where.status = status;
        }
        if (method) {
            where.method = method;
        }
        // Date range filtering
        if (dateFrom || dateTo) {
            where.createdAt = {};
            if (dateFrom) {
                where.createdAt.gte = new Date(dateFrom);
            }
            if (dateTo) {
                // Set to end of day
                const endDate = new Date(dateTo);
                endDate.setHours(23, 59, 59, 999);
                where.createdAt.lte = endDate;
            }
        }
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.prisma.topUpRequest.findMany({
                where,
                include: {
                    user: { select: { id: true, username: true, email: true } },
                    admin: { select: { id: true, username: true } }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.topUpRequest.count({ where })
        ]);
        return {
            data,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }
    // ═══════════════════════════════════════════════════════════
    //  ADMIN APPROVAL / REJECTION
    // ═══════════════════════════════════════════════════════════
    /**
     * Approve a top-up request — atomic balance update
     * Uses $transaction to ensure atomicity
     * Validates Requirements 6.3, 6.5, 6.6, 11.6
     */
    async approveTopUpRequest(requestId, adminId, notes) {
        const request = await this.prisma.topUpRequest.findUnique({
            where: { id: requestId },
            include: { user: true }
        });
        if (!request) {
            throw new common_1.NotFoundException('Top-up request tidak ditemukan');
        }
        if (request.status !== client_1.TopUpStatus.PENDING && request.status !== client_1.TopUpStatus.PAID) {
            throw new common_1.BadRequestException(`Hanya request dengan status PENDING atau PAID yang bisa diapprove. Status saat ini: ${request.status}`);
        }
        this.logger.log(`Approving TopUpRequest ${requestId} by admin ${adminId}`);
        // Atomic transaction: update status + increment balance + create wallet transaction
        const result = await this.prisma.$transaction(async (tx) => {
            // 1. Update TopUpRequest status
            const updatedRequest = await tx.topUpRequest.update({
                where: { id: requestId },
                data: {
                    status: client_1.TopUpStatus.APPROVED,
                    reviewedBy: adminId,
                    reviewedAt: new Date(),
                    adminNotes: notes || null,
                }
            });
            // 2. Get or create wallet account
            let wallet = await tx.walletAccount.findUnique({
                where: { userId: request.userId }
            });
            if (!wallet) {
                wallet = await tx.walletAccount.create({
                    data: { userId: request.userId, balance: 0 }
                });
            }
            // 3. Increment user balance
            await tx.walletAccount.update({
                where: { userId: request.userId },
                data: {
                    balance: { increment: request.amount },
                    totalTopUp: { increment: request.amount }
                },
            });
            // 4. Create wallet transaction record
            await tx.walletTransaction.create({
                data: {
                    walletId: wallet.id,
                    type: 'TOP_UP',
                    amount: request.amount,
                    description: `Top Up ${request.method}: ${request.amount} CC (Rp ${request.fiatAmount.toLocaleString('id-ID')})`,
                    idempotencyKey: `topup-approve-${request.id}`,
                },
            });
            return updatedRequest;
        });
        // Emit event for real-time updates
        this.eventEmitter.emit('payment.status.changed', {
            topUpRequestId: result.id,
            userId: result.userId,
            status: client_1.TopUpStatus.APPROVED,
            amount: result.amount,
        });
        this.logger.log(`TopUpRequest ${requestId} approved. ${request.amount} CC credited to user ${request.userId}`);
        return result;
    }
    /**
     * Reject a top-up request
     * Validates Requirements 6.4, 6.7
     */
    async rejectTopUpRequest(requestId, adminId, notes) {
        const request = await this.prisma.topUpRequest.findUnique({
            where: { id: requestId }
        });
        if (!request) {
            throw new common_1.NotFoundException('Top-up request tidak ditemukan');
        }
        if (request.status === client_1.TopUpStatus.APPROVED) {
            throw new common_1.BadRequestException('Request yang sudah diapprove tidak bisa direject');
        }
        this.logger.log(`Rejecting TopUpRequest ${requestId} by admin ${adminId}`);
        const updatedRequest = await this.prisma.topUpRequest.update({
            where: { id: requestId },
            data: {
                status: client_1.TopUpStatus.REJECTED,
                reviewedBy: adminId,
                reviewedAt: new Date(),
                adminNotes: notes,
            }
        });
        // Emit event for real-time updates
        this.eventEmitter.emit('payment.status.changed', {
            topUpRequestId: updatedRequest.id,
            userId: updatedRequest.userId,
            status: client_1.TopUpStatus.REJECTED,
        });
        this.logger.log(`TopUpRequest ${requestId} rejected with notes: ${notes}`);
        return updatedRequest;
    }
    // ═══════════════════════════════════════════════════════════
    //  PROOF OF PAYMENT UPLOAD
    // ═══════════════════════════════════════════════════════════
    /**
     * Upload proof of payment image
     * Validates Requirements 10.2, 10.3, 10.4, 10.6
     */
    async uploadProofImage(requestId, userId, file) {
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.mimetype)) {
            throw new common_1.BadRequestException('Hanya file JPEG, PNG, dan WebP yang diperbolehkan');
        }
        // Validate file size (5 MB)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            throw new common_1.BadRequestException('Ukuran file maksimal 5 MB');
        }
        // Verify the request belongs to user
        const request = await this.prisma.topUpRequest.findFirst({
            where: { id: requestId, userId }
        });
        if (!request) {
            throw new common_1.NotFoundException('Top-up request tidak ditemukan');
        }
        // Convert to base64 data URL for simple storage (MVP approach)
        // In production, replace with Cloudflare R2 or Supabase Storage
        const base64 = file.buffer.toString('base64');
        const imageUrl = `data:${file.mimetype};base64,${base64}`;
        // Update database
        await this.prisma.topUpRequest.update({
            where: { id: requestId },
            data: { proofImageUrl: imageUrl }
        });
        this.logger.log(`Proof image uploaded for TopUpRequest ${requestId}`);
        return imageUrl;
    }
    // ═══════════════════════════════════════════════════════════
    //  TEST PAYMENT COMPLETION
    // ═══════════════════════════════════════════════════════════
    /**
     * Complete a test payment (simulate payment success)
     * Validates Requirements 3.5
     */
    async completeTestPayment(requestId, userId) {
        const request = await this.prisma.topUpRequest.findFirst({
            where: { id: requestId, userId, method: 'TESTING' }
        });
        if (!request) {
            throw new common_1.NotFoundException('Test payment tidak ditemukan');
        }
        if (request.status !== client_1.TopUpStatus.PENDING) {
            throw new common_1.BadRequestException(`Payment sudah dalam status ${request.status}`);
        }
        // Complete in the testing provider's in-memory store
        try {
            const paymentDetails = request.paymentDetails;
            const transactionId = paymentDetails?.transactionId;
            if (transactionId) {
                const provider = this.providerRegistry.getProviderByName('TESTING');
                await provider.completeTestPayment(transactionId);
            }
        }
        catch (error) {
            const err = error;
            this.logger.warn(`Could not complete test payment in provider: ${err.message}`);
        }
        // Update database status to PAID
        const updatedRequest = await this.prisma.topUpRequest.update({
            where: { id: requestId },
            data: {
                status: client_1.TopUpStatus.PAID,
                paidAt: new Date(),
            }
        });
        // Emit event
        this.eventEmitter.emit('payment.status.changed', {
            topUpRequestId: updatedRequest.id,
            userId: updatedRequest.userId,
            status: client_1.TopUpStatus.PAID,
        });
        this.logger.log(`Test payment ${requestId} completed (marked as PAID)`);
        return updatedRequest;
    }
    // ═══════════════════════════════════════════════════════════
    //  WEBHOOK HANDLING
    // ═══════════════════════════════════════════════════════════
    /**
     * Handle incoming webhook from payment gateways
     * Validates Requirements 5.1, 5.2, 5.3, 5.5, 5.6
     */
    async handleWebhook(providerName, payload, signature) {
        this.logger.log(`Received webhook from provider: ${providerName}`);
        this.logger.debug(`Webhook payload: ${JSON.stringify(payload)}`);
        const provider = this.providerRegistry.getProviderByName(providerName);
        this.logger.log(`Using provider: ${provider.name} for webhook processing`);
        let isValid;
        try {
            isValid = await provider.validateWebhook(payload, signature);
        }
        catch (error) {
            const err = error;
            this.logger.error(`Webhook validation error from ${providerName}: ${err.message}`, err.stack);
            throw new common_1.UnauthorizedException('Webhook validation failed');
        }
        if (!isValid) {
            this.logger.warn(`⚠️ SECURITY: Invalid webhook signature from ${providerName}. Potential unauthorized access attempt.`);
            this.logger.warn(`Signature received: ${signature}`);
            throw new common_1.UnauthorizedException('Invalid webhook signature');
        }
        this.logger.log(`✓ Webhook signature validated successfully for provider: ${providerName}`);
        let webhookResult;
        try {
            webhookResult = await provider.processWebhook(payload);
            this.logger.log(`Webhook processed: TransactionID=${webhookResult.transactionId}, Status=${webhookResult.status}`);
        }
        catch (error) {
            const err = error;
            this.logger.error(`Failed to process webhook from ${providerName}: ${err.message}`, err.stack);
            throw new common_1.BadRequestException(`Failed to process webhook: ${err.message}`);
        }
        const topUpRequest = await this.prisma.topUpRequest.findFirst({
            where: {
                paymentDetails: {
                    path: ['transactionId'],
                    equals: webhookResult.transactionId
                }
            }
        });
        if (!topUpRequest) {
            this.logger.warn(`TopUpRequest not found for transaction ID: ${webhookResult.transactionId}`);
            return;
        }
        this.logger.log(`Found TopUpRequest: ${topUpRequest.id} for user: ${topUpRequest.userId}`);
        const newStatus = this.mapWebhookStatusToTopUpStatus(webhookResult.status);
        const updatedRequest = await this.prisma.topUpRequest.update({
            where: { id: topUpRequest.id },
            data: {
                status: newStatus,
                paidAt: webhookResult.paidAt
            }
        });
        this.logger.log(`Updated TopUpRequest ${topUpRequest.id}: Status=${newStatus}, PaidAt=${webhookResult.paidAt}`);
        this.eventEmitter.emit('payment.status.changed', {
            topUpRequestId: updatedRequest.id,
            userId: updatedRequest.userId,
            status: newStatus,
            amount: updatedRequest.amount,
            fiatAmount: updatedRequest.fiatAmount,
            method: updatedRequest.method,
            provider: updatedRequest.provider,
            paidAt: webhookResult.paidAt
        });
        this.logger.log(`✓ Webhook processed successfully. Event emitted: payment.status.changed`);
    }
    // ═══════════════════════════════════════════════════════════
    //  EXPIRATION MONITORING
    // ═══════════════════════════════════════════════════════════
    /**
     * Schedule automatic expiration check for a payment
     * Validates Requirement 2.8, 4.4
     */
    scheduleExpirationCheck(requestId, expiresAt) {
        const delay = expiresAt.getTime() - Date.now();
        if (delay <= 0) {
            this.logger.warn(`Payment ${requestId} already expired at creation time`);
            return;
        }
        this.logger.log(`Scheduled expiration check for payment ${requestId} in ${Math.floor(delay / 1000)} seconds`);
        setTimeout(async () => {
            try {
                const request = await this.prisma.topUpRequest.findUnique({
                    where: { id: requestId }
                });
                if (request && request.status === client_1.TopUpStatus.PENDING) {
                    await this.prisma.topUpRequest.update({
                        where: { id: requestId },
                        data: { status: client_1.TopUpStatus.EXPIRED }
                    });
                    this.eventEmitter.emit('payment.status.changed', {
                        topUpRequestId: requestId,
                        userId: request.userId,
                        status: client_1.TopUpStatus.EXPIRED,
                    });
                    this.logger.log(`Payment ${requestId} automatically marked as EXPIRED`);
                }
                else if (request) {
                    this.logger.log(`Payment ${requestId} status is ${request.status}, skipping expiration update`);
                }
            }
            catch (error) {
                const err = error;
                this.logger.error(`Failed to process expiration for payment ${requestId}: ${err.message}`);
            }
        }, delay);
    }
    // ═══════════════════════════════════════════════════════════
    //  LEGACY METHODS (kept for backward compatibility)
    // ═══════════════════════════════════════════════════════════
    async createCheckoutSession(userId, amount, ccAmount) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.BadRequestException('User tidak ditemukan');
        const session = await this.stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'idr',
                        product_data: {
                            name: `${ccAmount} Crown Coins (CC)`,
                            description: `Top up untuk akun ${user.username}`,
                        },
                        unit_amount: amount * 100,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            metadata: {
                userId,
                ccAmount: ccAmount.toString(),
            },
            success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/wallet?topup=success`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/wallet?topup=canceled`,
        });
        return { url: session.url };
    }
    async handleStripeWebhook(signature, body) {
        let event;
        try {
            event = this.stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET || '');
        }
        catch (err) {
            this.logger.error(`Webhook signature verification failed: ${err.message}`);
            throw new common_1.BadRequestException(`Webhook Error: ${err.message}`);
        }
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const userId = session.metadata?.userId;
            const ccAmount = parseInt(session.metadata?.ccAmount || '0', 10);
            if (userId && ccAmount > 0) {
                const wallet = await this.prisma.walletAccount.findUnique({ where: { userId } });
                if (wallet) {
                    await this.prisma.$transaction([
                        this.prisma.walletAccount.update({
                            where: { userId },
                            data: { balance: { increment: ccAmount } },
                        }),
                        this.prisma.walletTransaction.create({
                            data: {
                                walletId: wallet.id,
                                type: 'TOP_UP',
                                amount: ccAmount,
                                description: `Stripe Topup (Session: ${session.id})`,
                                idempotencyKey: `stripe-${session.id}`,
                            },
                        })
                    ]);
                    this.logger.log(`Successfully topped up ${ccAmount} CC for user ${userId}`);
                }
            }
        }
        return { received: true };
    }
    async createManualTopup(userId, data) {
        return this.prisma.topUpRequest.create({
            data: {
                userId,
                amount: data.amount,
                fiatAmount: data.fiatAmount,
                method: data.method,
                provider: data.provider,
                status: client_1.TopUpStatus.PENDING,
            },
        });
    }
    async getPendingTopups() {
        // Auto-expire pending requests past expiresAt (Requirement 4.8)
        const now = new Date();
        const expiredResult = await this.prisma.topUpRequest.updateMany({
            where: {
                status: client_1.TopUpStatus.PENDING,
                expiresAt: { lt: now }
            },
            data: { status: client_1.TopUpStatus.EXPIRED }
        });
        if (expiredResult.count > 0) {
            this.logger.log(`Auto-expired ${expiredResult.count} pending payment(s) in getPendingTopups`);
        }
        return this.prisma.topUpRequest.findMany({
            where: { status: client_1.TopUpStatus.PENDING },
            include: { user: { select: { username: true, email: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }
    async approveTopup(adminId, topupId, approve) {
        // Delegate to the new enhanced methods
        if (approve) {
            return this.approveTopUpRequest(topupId, adminId);
        }
        else {
            return this.rejectTopUpRequest(topupId, adminId, 'Rejected by admin');
        }
    }
    // ═══════════════════════════════════════════════════════════
    //  PRIVATE HELPERS
    // ═══════════════════════════════════════════════════════════
    mapWebhookStatusToTopUpStatus(webhookStatus) {
        const statusMap = {
            'PAID': client_1.TopUpStatus.PAID,
            'EXPIRED': client_1.TopUpStatus.EXPIRED,
            'CANCELLED': client_1.TopUpStatus.REJECTED
        };
        return statusMap[webhookStatus] || client_1.TopUpStatus.PENDING;
    }
};
exports.PaymentService = PaymentService;
exports.PaymentService = PaymentService = PaymentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        payment_provider_registry_service_1.PaymentProviderRegistry,
        event_emitter_1.EventEmitter2])
], PaymentService);
//# sourceMappingURL=payment.service.js.map