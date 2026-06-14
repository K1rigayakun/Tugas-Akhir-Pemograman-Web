import { Injectable, BadRequestException, NotFoundException, Logger, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import Stripe from 'stripe';
import { TopUpStatus } from '@prisma/client';
import { PaymentProviderRegistry } from './payment-provider-registry.service';
import { PaymentMethod } from './interfaces/payment-method.enum';
import { TopUpRequest } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TestingProvider } from './providers/testing.provider';

interface PaymentOptions {
  bank?: string;
  walletType?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class PaymentService {
  private stripe: any;
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly providerRegistry: PaymentProviderRegistry,
    private readonly eventEmitter: EventEmitter2
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2023-10-16' as any,
    });
  }

  // ═══════════════════════════════════════════════════════════
  //  CORE PAYMENT INITIATION
  // ═══════════════════════════════════════════════════════════

  /**
   * Initiate a payment transaction
   * Validates Requirements 2.1, 2.2, 2.3, 2.7, 2.8
   */
  async initiatePayment(
    userId: string,
    amount: number,
    fiatAmount: number,
    method: PaymentMethod,
    options?: PaymentOptions
  ): Promise<TopUpRequest> {
    // Validate amount greater than zero (Requirement 2.1)
    if (amount <= 0 || fiatAmount <= 0) {
      this.logger.warn(`Invalid payment amount: CC=${amount}, Fiat=${fiatAmount} for user ${userId}`);
      throw new BadRequestException('Amount must be greater than zero');
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
          status: TopUpStatus.PENDING,
          paymentDetails: paymentResponse.paymentDetails as any,
          expiresAt: paymentResponse.expiresAt
        }
      });

      this.logger.log(`TopUpRequest created: ${topUpRequest.id}`);

      // Schedule expiration check using setTimeout (Requirement 2.8)
      this.scheduleExpirationCheck(topUpRequest.id, paymentResponse.expiresAt);

      return topUpRequest;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to initiate payment for user ${userId}: ${errorMessage}`, errorStack);
      throw new BadRequestException(`Failed to initiate payment: ${errorMessage}`);
    }
  }

  // ═══════════════════════════════════════════════════════════
  //  PAYMENT QUERY METHODS
  // ═══════════════════════════════════════════════════════════

  getAvailablePaymentMethods() {
    return [
      {
        id: PaymentMethod.TESTING,
        label: 'Testing / Demo',
        description: 'Simulasi pembayaran untuk testing dan demonstrasi',
        provider: this.providerRegistry.getProviderForMethod(PaymentMethod.TESTING).name,
        priority: 1,
      },
      {
        id: PaymentMethod.QRIS,
        label: 'QRIS',
        description: 'Scan QR code dari aplikasi bank atau e-wallet',
        provider: this.providerRegistry.getProviderForMethod(PaymentMethod.QRIS).name,
        priority: 2,
      },
      {
        id: PaymentMethod.VIRTUAL_ACCOUNT,
        label: 'Virtual Account',
        description: 'Transfer melalui rekening virtual bank',
        provider: this.providerRegistry.getProviderForMethod(PaymentMethod.VIRTUAL_ACCOUNT).name,
        priority: 3,
      },
      {
        id: PaymentMethod.EWALLET,
        label: 'E-Wallet',
        description: 'GoPay, OVO, Dana, ShopeePay, atau LinkAja',
        provider: this.providerRegistry.getProviderForMethod(PaymentMethod.EWALLET).name,
        priority: 4,
      },
      {
        id: PaymentMethod.STRIPE,
        label: 'Kartu Kredit / Debit',
        description: 'Pembayaran kartu melalui checkout aman',
        provider: this.providerRegistry.getProviderForMethod(PaymentMethod.STRIPE).name,
        priority: 5,
      },
      {
        id: PaymentMethod.BANK_TRANSFER,
        label: 'Transfer Bank',
        description: 'Transfer manual dan upload bukti pembayaran',
        provider: this.providerRegistry.getProviderForMethod(PaymentMethod.BANK_TRANSFER).name,
        priority: 6,
      },
    ].filter((method) => this.providerRegistry.isMethodSupported(method.id));
  }

  /**
   * Get a single payment by ID
   * Validates Requirements 12.1
   */
  async getPaymentById(paymentId: string, userId?: string): Promise<TopUpRequest> {
    const whereClause: any = { id: paymentId };
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
      throw new NotFoundException('Pembayaran tidak ditemukan');
    }

    return payment;
  }

  /**
   * Get user's payment history with pagination
   * Validates Requirements 12.1, 12.2, 12.3, 12.4, 12.5
   */
  async getUserPaymentHistory(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ data: TopUpRequest[]; total: number; page: number; totalPages: number }> {
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
  async getAdminPaymentList(
    status?: string,
    method?: string,
    dateFrom?: string,
    dateTo?: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ data: TopUpRequest[]; total: number; page: number; totalPages: number }> {
    // Auto-expire pending requests past expiresAt (Requirement 4.8)
    const now = new Date();
    const expiredResult = await this.prisma.topUpRequest.updateMany({
      where: {
        status: TopUpStatus.PENDING,
        expiresAt: { lt: now }
      },
      data: { status: TopUpStatus.EXPIRED }
    });

    if (expiredResult.count > 0) {
      this.logger.log(`Auto-expired ${expiredResult.count} pending payment(s) in getAdminPaymentList`);
    }

    const where: any = {};

    if (status) {
      where.status = status as TopUpStatus;
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
  async approveTopUpRequest(
    requestId: string,
    adminId: string,
    notes?: string
  ): Promise<TopUpRequest> {
    const request = await this.prisma.topUpRequest.findUnique({
      where: { id: requestId },
      include: { user: true }
    });

    if (!request) {
      throw new NotFoundException('Top-up request tidak ditemukan');
    }

    if (request.status !== TopUpStatus.PENDING && request.status !== TopUpStatus.PAID) {
      throw new BadRequestException(
        `Hanya request dengan status PENDING atau PAID yang bisa diapprove. Status saat ini: ${request.status}`
      );
    }

    this.logger.log(`Approving TopUpRequest ${requestId} by admin ${adminId}`);

    // Atomic transaction: update status + increment balance + create wallet transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Update TopUpRequest status
      const updatedRequest = await tx.topUpRequest.update({
        where: { id: requestId },
        data: {
          status: TopUpStatus.APPROVED,
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
      status: TopUpStatus.APPROVED,
      amount: result.amount,
    });

    this.logger.log(`TopUpRequest ${requestId} approved. ${request.amount} CC credited to user ${request.userId}`);

    return result;
  }

  /**
   * Reject a top-up request
   * Validates Requirements 6.4, 6.7
   */
  async rejectTopUpRequest(
    requestId: string,
    adminId: string,
    notes: string
  ): Promise<TopUpRequest> {
    const request = await this.prisma.topUpRequest.findUnique({
      where: { id: requestId }
    });

    if (!request) {
      throw new NotFoundException('Top-up request tidak ditemukan');
    }

    if (request.status === TopUpStatus.APPROVED) {
      throw new BadRequestException('Request yang sudah diapprove tidak bisa direject');
    }

    this.logger.log(`Rejecting TopUpRequest ${requestId} by admin ${adminId}`);

    const updatedRequest = await this.prisma.topUpRequest.update({
      where: { id: requestId },
      data: {
        status: TopUpStatus.REJECTED,
        reviewedBy: adminId,
        reviewedAt: new Date(),
        adminNotes: notes,
      }
    });

    // Emit event for real-time updates
    this.eventEmitter.emit('payment.status.changed', {
      topUpRequestId: updatedRequest.id,
      userId: updatedRequest.userId,
      status: TopUpStatus.REJECTED,
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
  async uploadProofImage(
    requestId: string,
    userId: string,
    file: Express.Multer.File
  ): Promise<string> {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Hanya file JPEG, PNG, dan WebP yang diperbolehkan');
    }

    // Validate file size (5 MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('Ukuran file maksimal 5 MB');
    }

    // Verify the request belongs to user
    const request = await this.prisma.topUpRequest.findFirst({
      where: { id: requestId, userId }
    });

    if (!request) {
      throw new NotFoundException('Top-up request tidak ditemukan');
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
  async completeTestPayment(requestId: string, userId: string): Promise<TopUpRequest> {
    const request = await this.prisma.topUpRequest.findFirst({
      where: { id: requestId, userId, method: 'TESTING' }
    });

    if (!request) {
      throw new NotFoundException('Test payment tidak ditemukan');
    }

    if (request.status !== TopUpStatus.PENDING) {
      throw new BadRequestException(`Payment sudah dalam status ${request.status}`);
    }

    // Complete in the testing provider's in-memory store
    try {
      const paymentDetails = request.paymentDetails as any;
      const transactionId = paymentDetails?.transactionId;
      if (transactionId) {
        const provider = this.providerRegistry.getProviderByName('TESTING') as TestingProvider;
        await provider.completeTestPayment(transactionId);
      }
    } catch (error) {
      const err = error as Error;
      this.logger.warn(`Could not complete test payment in provider: ${err.message}`);
    }

    // Update database status to PAID
    const updatedRequest = await this.prisma.topUpRequest.update({
      where: { id: requestId },
      data: {
        status: TopUpStatus.PAID,
        paidAt: new Date(),
      }
    });

    // Emit event
    this.eventEmitter.emit('payment.status.changed', {
      topUpRequestId: updatedRequest.id,
      userId: updatedRequest.userId,
      status: TopUpStatus.PAID,
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
  async handleWebhook(
    providerName: string,
    payload: any,
    signature: string
  ): Promise<void> {
    this.logger.log(`Received webhook from provider: ${providerName}`);
    this.logger.debug(`Webhook payload: ${JSON.stringify(payload)}`);

    const provider = this.providerRegistry.getProviderByName(providerName);
    this.logger.log(`Using provider: ${provider.name} for webhook processing`);

    let isValid: boolean;
    try {
      isValid = await provider.validateWebhook(payload, signature);
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Webhook validation error from ${providerName}: ${err.message}`, err.stack);
      throw new UnauthorizedException('Webhook validation failed');
    }

    if (!isValid) {
      this.logger.warn(`⚠️ SECURITY: Invalid webhook signature from ${providerName}. Potential unauthorized access attempt.`);
      this.logger.warn(`Signature received: ${signature}`);
      throw new UnauthorizedException('Invalid webhook signature');
    }

    this.logger.log(`✓ Webhook signature validated successfully for provider: ${providerName}`);

    let webhookResult;
    try {
      webhookResult = await provider.processWebhook(payload);
      this.logger.log(`Webhook processed: TransactionID=${webhookResult.transactionId}, Status=${webhookResult.status}`);
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to process webhook from ${providerName}: ${err.message}`, err.stack);
      throw new BadRequestException(`Failed to process webhook: ${err.message}`);
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
  private scheduleExpirationCheck(requestId: string, expiresAt: Date): void {
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

        if (request && request.status === TopUpStatus.PENDING) {
          await this.prisma.topUpRequest.update({
            where: { id: requestId },
            data: { status: TopUpStatus.EXPIRED }
          });

          this.eventEmitter.emit('payment.status.changed', {
            topUpRequestId: requestId,
            userId: request.userId,
            status: TopUpStatus.EXPIRED,
          });

          this.logger.log(`Payment ${requestId} automatically marked as EXPIRED`);
        } else if (request) {
          this.logger.log(`Payment ${requestId} status is ${request.status}, skipping expiration update`);
        }
      } catch (error) {
        const err = error as Error;
        this.logger.error(`Failed to process expiration for payment ${requestId}: ${err.message}`);
      }
    }, delay);
  }

  // ═══════════════════════════════════════════════════════════
  //  LEGACY METHODS (kept for backward compatibility)
  // ═══════════════════════════════════════════════════════════

  async createCheckoutSession(userId: string, amount: number, ccAmount: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('User tidak ditemukan');

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

  async handleStripeWebhook(signature: string, body: Buffer) {
    let event: any;

    try {
      event = this.stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET || ''
      );
    } catch (err: any) {
      this.logger.error(`Webhook signature verification failed: ${err.message}`);
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;

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

  async createManualTopup(userId: string, data: { amount: number; fiatAmount: number; method: string; provider?: string }) {
    return this.prisma.topUpRequest.create({
      data: {
        userId,
        amount: data.amount,
        fiatAmount: data.fiatAmount,
        method: data.method,
        provider: data.provider,
        status: TopUpStatus.PENDING,
      },
    });
  }

  async getPendingTopups() {
    // Auto-expire pending requests past expiresAt (Requirement 4.8)
    const now = new Date();
    const expiredResult = await this.prisma.topUpRequest.updateMany({
      where: {
        status: TopUpStatus.PENDING,
        expiresAt: { lt: now }
      },
      data: { status: TopUpStatus.EXPIRED }
    });

    if (expiredResult.count > 0) {
      this.logger.log(`Auto-expired ${expiredResult.count} pending payment(s) in getPendingTopups`);
    }

    return this.prisma.topUpRequest.findMany({
      where: { status: TopUpStatus.PENDING },
      include: { user: { select: { username: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async approveTopup(adminId: string, topupId: string, approve: boolean) {
    // Delegate to the new enhanced methods
    if (approve) {
      return this.approveTopUpRequest(topupId, adminId);
    } else {
      return this.rejectTopUpRequest(topupId, adminId, 'Rejected by admin');
    }
  }

  // ═══════════════════════════════════════════════════════════
  //  PRIVATE HELPERS
  // ═══════════════════════════════════════════════════════════

  private mapWebhookStatusToTopUpStatus(webhookStatus: 'PAID' | 'EXPIRED' | 'CANCELLED'): TopUpStatus {
    const statusMap: Record<string, TopUpStatus> = {
      'PAID': TopUpStatus.PAID,
      'EXPIRED': TopUpStatus.EXPIRED,
      'CANCELLED': TopUpStatus.REJECTED
    };

    return statusMap[webhookStatus] || TopUpStatus.PENDING;
  }
}
