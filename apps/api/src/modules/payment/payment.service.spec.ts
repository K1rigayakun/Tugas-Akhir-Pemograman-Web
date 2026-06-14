import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PrismaService } from '../../prisma/prisma.service';
import { PaymentProviderRegistry } from './payment-provider-registry.service';
import { PaymentMethod } from './interfaces/payment-method.enum';
import { TopUpStatus } from '@prisma/client';
import { PaymentProvider } from './interfaces/payment-provider.interface';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('PaymentService', () => {
  let service: PaymentService;
  let prismaService: PrismaService;
  let providerRegistry: PaymentProviderRegistry;

  const mockPrismaService = {
    topUpRequest: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    walletAccount: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    walletTransaction: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const mockProvider: PaymentProvider = {
    name: 'TEST_PROVIDER',
    supportedMethods: [PaymentMethod.TESTING],
    initialize: jest.fn(),
    createPayment: jest.fn(),
    checkPaymentStatus: jest.fn(),
    validateWebhook: jest.fn(),
    processWebhook: jest.fn(),
  };

  const mockProviderRegistry = {
    getProviderForMethod: jest.fn(),
    getProviderByName: jest.fn(),
    registerProvider: jest.fn(),
  };

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: PaymentProviderRegistry,
          useValue: mockProviderRegistry,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
    prismaService = module.get<PrismaService>(PrismaService);
    providerRegistry = module.get<PaymentProviderRegistry>(PaymentProviderRegistry);

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('initiatePayment', () => {
    const userId = 'user-123';
    const amount = 1000;
    const fiatAmount = 50000;
    const method = PaymentMethod.TESTING;

    const mockPaymentResponse = {
      transactionId: 'txn-123',
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes from now
      paymentDetails: {
        message: 'Test payment',
        instructions: ['Step 1', 'Step 2'],
        transactionId: 'txn-123',
      },
    };

    const mockTopUpRequest = {
      id: 'topup-123',
      userId,
      amount,
      fiatAmount,
      method,
      provider: 'TEST_PROVIDER',
      status: TopUpStatus.PENDING,
      paymentDetails: mockPaymentResponse.paymentDetails,
      expiresAt: mockPaymentResponse.expiresAt,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should validate amount greater than zero - CC amount', async () => {
      // Requirement 2.1: Validate amount is greater than zero
      await expect(
        service.initiatePayment(userId, 0, fiatAmount, method)
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.initiatePayment(userId, -100, fiatAmount, method)
      ).rejects.toThrow(BadRequestException);
    });

    it('should validate amount greater than zero - Fiat amount', async () => {
      // Requirement 2.1: Validate amount is greater than zero
      await expect(
        service.initiatePayment(userId, amount, 0, method)
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.initiatePayment(userId, amount, -100, method)
      ).rejects.toThrow(BadRequestException);
    });

    it('should get appropriate provider from registry', async () => {
      // Requirement 2.3: Use registry.getProviderForMethod()
      mockProviderRegistry.getProviderForMethod.mockReturnValue(mockProvider);
      mockProvider.createPayment = jest.fn().mockResolvedValue(mockPaymentResponse);
      mockPrismaService.topUpRequest.create.mockResolvedValue(mockTopUpRequest);

      await service.initiatePayment(userId, amount, fiatAmount, method);

      expect(mockProviderRegistry.getProviderForMethod).toHaveBeenCalledWith(method);
    });

    it('should call provider.createPayment with correct data', async () => {
      // Requirement 2.3: Call provider.createPayment()
      mockProviderRegistry.getProviderForMethod.mockReturnValue(mockProvider);
      mockProvider.createPayment = jest.fn().mockResolvedValue(mockPaymentResponse);
      mockPrismaService.topUpRequest.create.mockResolvedValue(mockTopUpRequest);

      const options = { bank: 'BCA', walletType: 'GOPAY' };
      await service.initiatePayment(userId, amount, fiatAmount, method, options);

      expect(mockProvider.createPayment).toHaveBeenCalledWith({
        userId,
        amount,
        fiatAmount,
        method,
        bank: options.bank,
        walletType: options.walletType,
        metadata: undefined,
      });
    });

    it('should create TopUpRequest record with payment details', async () => {
      // Requirements 2.2, 2.7, 2.8: Create record with PENDING status and payment details
      mockProviderRegistry.getProviderForMethod.mockReturnValue(mockProvider);
      mockProvider.createPayment = jest.fn().mockResolvedValue(mockPaymentResponse);
      mockPrismaService.topUpRequest.create.mockResolvedValue(mockTopUpRequest);

      await service.initiatePayment(userId, amount, fiatAmount, method);

      expect(mockPrismaService.topUpRequest.create).toHaveBeenCalledWith({
        data: {
          userId,
          amount,
          fiatAmount,
          method,
          provider: mockProvider.name,
          bank: undefined,
          walletType: undefined,
          status: TopUpStatus.PENDING,
          paymentDetails: mockPaymentResponse.paymentDetails,
          expiresAt: mockPaymentResponse.expiresAt,
        },
      });
    });

    it('should return the created TopUpRequest', async () => {
      // Requirement 2.2: Return created TopUpRequest
      mockProviderRegistry.getProviderForMethod.mockReturnValue(mockProvider);
      mockProvider.createPayment = jest.fn().mockResolvedValue(mockPaymentResponse);
      mockPrismaService.topUpRequest.create.mockResolvedValue(mockTopUpRequest);

      const result = await service.initiatePayment(userId, amount, fiatAmount, method);

      expect(result).toEqual(mockTopUpRequest);
    });

    it('should handle provider errors gracefully', async () => {
      // Error handling
      mockProviderRegistry.getProviderForMethod.mockReturnValue(mockProvider);
      mockProvider.createPayment = jest.fn().mockRejectedValue(new Error('Gateway API failed'));

      await expect(
        service.initiatePayment(userId, amount, fiatAmount, method)
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when provider not found', async () => {
      // Requirement 9.5: Handle provider initialization failures
      mockProviderRegistry.getProviderForMethod.mockImplementation(() => {
        throw new NotFoundException('No provider available for method');
      });

      await expect(
        service.initiatePayment(userId, amount, fiatAmount, method)
      ).rejects.toThrow(NotFoundException);
    });

    it('should schedule expiration check', async () => {
      // Requirement 2.8: Schedule expiration check using setTimeout
      jest.useFakeTimers();
      
      mockProviderRegistry.getProviderForMethod.mockReturnValue(mockProvider);
      mockProvider.createPayment = jest.fn().mockResolvedValue(mockPaymentResponse);
      mockPrismaService.topUpRequest.create.mockResolvedValue(mockTopUpRequest);
      mockPrismaService.topUpRequest.findUnique.mockResolvedValue(mockTopUpRequest);
      mockPrismaService.topUpRequest.update.mockResolvedValue({
        ...mockTopUpRequest,
        status: TopUpStatus.EXPIRED,
      });

      await service.initiatePayment(userId, amount, fiatAmount, method);

      // Fast-forward time to expiration
      jest.advanceTimersByTime(15 * 60 * 1000 + 1000); // 15 minutes + 1 second

      // Wait for async operations
      await new Promise(resolve => setImmediate(resolve));

      expect(mockPrismaService.topUpRequest.update).toHaveBeenCalledWith({
        where: { id: mockTopUpRequest.id },
        data: { status: TopUpStatus.EXPIRED },
      });

      jest.useRealTimers();
    });
  });

  describe('handleWebhook', () => {
    const providerName = 'MIDTRANS';
    const signature = 'test-signature-123';
    const transactionId = 'txn-webhook-123';

    const webhookPayload = {
      order_id: transactionId,
      transaction_status: 'settlement',
      gross_amount: '50000',
    };

    const webhookResult = {
      transactionId,
      status: 'PAID' as const,
      paidAt: new Date('2024-01-15T10:00:00Z'),
    };

    const mockTopUpRequest = {
      id: 'topup-webhook-123',
      userId: 'user-456',
      amount: 1000,
      fiatAmount: 50000,
      method: PaymentMethod.QRIS,
      provider: 'MIDTRANS',
      status: TopUpStatus.PENDING,
      paymentDetails: {
        transactionId,
        qrCodeBase64: 'base64string',
        qrString: 'qrstring',
      },
      expiresAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should get provider by name from registry (Requirement 5.2)', async () => {
      mockProviderRegistry.getProviderByName.mockReturnValue(mockProvider);
      mockProvider.validateWebhook = jest.fn().mockResolvedValue(true);
      mockProvider.processWebhook = jest.fn().mockResolvedValue(webhookResult);
      mockPrismaService.topUpRequest.findFirst.mockResolvedValue(mockTopUpRequest);
      mockPrismaService.topUpRequest.update.mockResolvedValue({
        ...mockTopUpRequest,
        status: TopUpStatus.PAID,
      });

      await service.handleWebhook(providerName, webhookPayload, signature);

      expect(mockProviderRegistry.getProviderByName).toHaveBeenCalledWith(providerName);
    });

    it('should validate webhook signature (Requirements 5.2, 5.3)', async () => {
      mockProviderRegistry.getProviderByName.mockReturnValue(mockProvider);
      mockProvider.validateWebhook = jest.fn().mockResolvedValue(true);
      mockProvider.processWebhook = jest.fn().mockResolvedValue(webhookResult);
      mockPrismaService.topUpRequest.findFirst.mockResolvedValue(mockTopUpRequest);
      mockPrismaService.topUpRequest.update.mockResolvedValue({
        ...mockTopUpRequest,
        status: TopUpStatus.PAID,
      });

      await service.handleWebhook(providerName, webhookPayload, signature);

      expect(mockProvider.validateWebhook).toHaveBeenCalledWith(webhookPayload, signature);
    });

    it('should throw UnauthorizedException for invalid signature (Requirement 5.6)', async () => {
      mockProviderRegistry.getProviderByName.mockReturnValue(mockProvider);
      mockProvider.validateWebhook = jest.fn().mockResolvedValue(false);

      await expect(
        service.handleWebhook(providerName, webhookPayload, signature)
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should log security warning for invalid signature (Requirement 5.6)', async () => {
      const loggerWarnSpy = jest.spyOn(service['logger'], 'warn');
      
      mockProviderRegistry.getProviderByName.mockReturnValue(mockProvider);
      mockProvider.validateWebhook = jest.fn().mockResolvedValue(false);

      try {
        await service.handleWebhook(providerName, webhookPayload, signature);
      } catch (e) {
        // Expected to throw
      }

      expect(loggerWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('SECURITY')
      );
    });

    it('should process webhook payload after validation (Requirement 5.2)', async () => {
      mockProviderRegistry.getProviderByName.mockReturnValue(mockProvider);
      mockProvider.validateWebhook = jest.fn().mockResolvedValue(true);
      mockProvider.processWebhook = jest.fn().mockResolvedValue(webhookResult);
      mockPrismaService.topUpRequest.findFirst.mockResolvedValue(mockTopUpRequest);
      mockPrismaService.topUpRequest.update.mockResolvedValue({
        ...mockTopUpRequest,
        status: TopUpStatus.PAID,
      });

      await service.handleWebhook(providerName, webhookPayload, signature);

      expect(mockProvider.processWebhook).toHaveBeenCalledWith(webhookPayload);
    });

    it('should query database for TopUpRequest by transactionId (Requirement 5.3)', async () => {
      mockProviderRegistry.getProviderByName.mockReturnValue(mockProvider);
      mockProvider.validateWebhook = jest.fn().mockResolvedValue(true);
      mockProvider.processWebhook = jest.fn().mockResolvedValue(webhookResult);
      mockPrismaService.topUpRequest.findFirst.mockResolvedValue(mockTopUpRequest);
      mockPrismaService.topUpRequest.update.mockResolvedValue({
        ...mockTopUpRequest,
        status: TopUpStatus.PAID,
      });

      await service.handleWebhook(providerName, webhookPayload, signature);

      expect(mockPrismaService.topUpRequest.findFirst).toHaveBeenCalledWith({
        where: {
          paymentDetails: {
            path: ['transactionId'],
            equals: transactionId,
          },
        },
      });
    });

    it('should update TopUpRequest status to PAID (Requirement 5.3)', async () => {
      mockProviderRegistry.getProviderByName.mockReturnValue(mockProvider);
      mockProvider.validateWebhook = jest.fn().mockResolvedValue(true);
      mockProvider.processWebhook = jest.fn().mockResolvedValue(webhookResult);
      mockPrismaService.topUpRequest.findFirst.mockResolvedValue(mockTopUpRequest);
      mockPrismaService.topUpRequest.update.mockResolvedValue({
        ...mockTopUpRequest,
        status: TopUpStatus.PAID,
        paidAt: webhookResult.paidAt,
      });

      await service.handleWebhook(providerName, webhookPayload, signature);

      expect(mockPrismaService.topUpRequest.update).toHaveBeenCalledWith({
        where: { id: mockTopUpRequest.id },
        data: {
          status: TopUpStatus.PAID,
          paidAt: webhookResult.paidAt,
        },
      });
    });

    it('should update paidAt timestamp (Requirement 5.3)', async () => {
      mockProviderRegistry.getProviderByName.mockReturnValue(mockProvider);
      mockProvider.validateWebhook = jest.fn().mockResolvedValue(true);
      mockProvider.processWebhook = jest.fn().mockResolvedValue(webhookResult);
      mockPrismaService.topUpRequest.findFirst.mockResolvedValue(mockTopUpRequest);
      mockPrismaService.topUpRequest.update.mockResolvedValue({
        ...mockTopUpRequest,
        status: TopUpStatus.PAID,
        paidAt: webhookResult.paidAt,
      });

      await service.handleWebhook(providerName, webhookPayload, signature);

      const updateCall = mockPrismaService.topUpRequest.update.mock.calls[0][0];
      expect(updateCall.data.paidAt).toEqual(webhookResult.paidAt);
    });

    it('should emit payment.status.changed event (Requirement 5.5)', async () => {
      mockProviderRegistry.getProviderByName.mockReturnValue(mockProvider);
      mockProvider.validateWebhook = jest.fn().mockResolvedValue(true);
      mockProvider.processWebhook = jest.fn().mockResolvedValue(webhookResult);
      mockPrismaService.topUpRequest.findFirst.mockResolvedValue(mockTopUpRequest);
      mockPrismaService.topUpRequest.update.mockResolvedValue({
        ...mockTopUpRequest,
        status: TopUpStatus.PAID,
        paidAt: webhookResult.paidAt,
      });

      await service.handleWebhook(providerName, webhookPayload, signature);

      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'payment.status.changed',
        expect.objectContaining({
          topUpRequestId: mockTopUpRequest.id,
          userId: mockTopUpRequest.userId,
          status: TopUpStatus.PAID,
          amount: mockTopUpRequest.amount,
          fiatAmount: mockTopUpRequest.fiatAmount,
          method: mockTopUpRequest.method,
          provider: mockTopUpRequest.provider,
          paidAt: webhookResult.paidAt,
        })
      );
    });

    it('should handle EXPIRED webhook status', async () => {
      const expiredWebhookResult = {
        transactionId,
        status: 'EXPIRED' as const,
      };

      mockProviderRegistry.getProviderByName.mockReturnValue(mockProvider);
      mockProvider.validateWebhook = jest.fn().mockResolvedValue(true);
      mockProvider.processWebhook = jest.fn().mockResolvedValue(expiredWebhookResult);
      mockPrismaService.topUpRequest.findFirst.mockResolvedValue(mockTopUpRequest);
      mockPrismaService.topUpRequest.update.mockResolvedValue({
        ...mockTopUpRequest,
        status: TopUpStatus.EXPIRED,
      });

      await service.handleWebhook(providerName, webhookPayload, signature);

      expect(mockPrismaService.topUpRequest.update).toHaveBeenCalledWith({
        where: { id: mockTopUpRequest.id },
        data: {
          status: TopUpStatus.EXPIRED,
          paidAt: undefined,
        },
      });
    });

    it('should handle CANCELLED webhook status', async () => {
      const cancelledWebhookResult = {
        transactionId,
        status: 'CANCELLED' as const,
      };

      mockProviderRegistry.getProviderByName.mockReturnValue(mockProvider);
      mockProvider.validateWebhook = jest.fn().mockResolvedValue(true);
      mockProvider.processWebhook = jest.fn().mockResolvedValue(cancelledWebhookResult);
      mockPrismaService.topUpRequest.findFirst.mockResolvedValue(mockTopUpRequest);
      mockPrismaService.topUpRequest.update.mockResolvedValue({
        ...mockTopUpRequest,
        status: TopUpStatus.REJECTED,
      });

      await service.handleWebhook(providerName, webhookPayload, signature);

      expect(mockPrismaService.topUpRequest.update).toHaveBeenCalledWith({
        where: { id: mockTopUpRequest.id },
        data: {
          status: TopUpStatus.REJECTED,
          paidAt: undefined,
        },
      });
    });

    it('should not throw if TopUpRequest not found', async () => {
      mockProviderRegistry.getProviderByName.mockReturnValue(mockProvider);
      mockProvider.validateWebhook = jest.fn().mockResolvedValue(true);
      mockProvider.processWebhook = jest.fn().mockResolvedValue(webhookResult);
      mockPrismaService.topUpRequest.findFirst.mockResolvedValue(null);

      await expect(
        service.handleWebhook(providerName, webhookPayload, signature)
      ).resolves.not.toThrow();

      expect(mockPrismaService.topUpRequest.update).not.toHaveBeenCalled();
      expect(mockEventEmitter.emit).not.toHaveBeenCalled();
    });

    it('should log all webhook events (Requirement 5.5)', async () => {
      const loggerLogSpy = jest.spyOn(service['logger'], 'log');
      
      mockProviderRegistry.getProviderByName.mockReturnValue(mockProvider);
      mockProvider.validateWebhook = jest.fn().mockResolvedValue(true);
      mockProvider.processWebhook = jest.fn().mockResolvedValue(webhookResult);
      mockPrismaService.topUpRequest.findFirst.mockResolvedValue(mockTopUpRequest);
      mockPrismaService.topUpRequest.update.mockResolvedValue({
        ...mockTopUpRequest,
        status: TopUpStatus.PAID,
      });

      await service.handleWebhook(providerName, webhookPayload, signature);

      expect(loggerLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Received webhook from provider')
      );
      expect(loggerLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Webhook signature validated successfully')
      );
      expect(loggerLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Webhook processed successfully')
      );
    });

    it('should handle provider validation errors', async () => {
      mockProviderRegistry.getProviderByName.mockReturnValue(mockProvider);
      mockProvider.validateWebhook = jest.fn().mockRejectedValue(new Error('Validation error'));

      await expect(
        service.handleWebhook(providerName, webhookPayload, signature)
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should handle provider processing errors', async () => {
      mockProviderRegistry.getProviderByName.mockReturnValue(mockProvider);
      mockProvider.validateWebhook = jest.fn().mockResolvedValue(true);
      mockProvider.processWebhook = jest.fn().mockRejectedValue(new Error('Processing error'));

      await expect(
        service.handleWebhook(providerName, webhookPayload, signature)
      ).rejects.toThrow(BadRequestException);
    });
  });
});
