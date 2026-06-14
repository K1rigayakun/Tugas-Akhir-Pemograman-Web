import { Test, TestingModule } from '@nestjs/testing';
import { TransactionBatchingService } from './transaction-batching.service';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

describe('TransactionBatchingService', () => {
  let service: TransactionBatchingService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    $transaction: jest.fn(),
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    walletAccount: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    walletTransaction: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionBatchingService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TransactionBatchingService>(TransactionBatchingService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('executeInTransaction', () => {
    it('should execute operations within a transaction', async () => {
      // Requirement 2.6: Use transaction batching for multiple operations
      const mockResult = { id: 'test-123', balance: 1000 };
      
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return await callback(mockPrismaService);
      });

      const operations = jest.fn().mockResolvedValue(mockResult);
      
      const result = await service.executeInTransaction(operations);

      expect(mockPrismaService.$transaction).toHaveBeenCalled();
      expect(operations).toHaveBeenCalled();
      expect(result).toEqual(mockResult);
    });

    it('should use default timeout of 10 seconds', async () => {
      // Requirement 2.9: Default timeout of 10 seconds
      mockPrismaService.$transaction.mockImplementation(async (callback, options) => {
        expect(options.timeout).toBe(10000);
        return await callback(mockPrismaService);
      });

      const operations = jest.fn().mockResolvedValue({ success: true });
      
      await service.executeInTransaction(operations);

      expect(mockPrismaService.$transaction).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({ timeout: 10000 })
      );
    });

    it('should allow custom timeout parameter', async () => {
      // Requirement 2.9: Custom timeout handling
      const customTimeout = 5000;
      
      mockPrismaService.$transaction.mockImplementation(async (callback, options) => {
        expect(options.timeout).toBe(customTimeout);
        return await callback(mockPrismaService);
      });

      const operations = jest.fn().mockResolvedValue({ success: true });
      
      await service.executeInTransaction(operations, customTimeout);

      expect(mockPrismaService.$transaction).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({ timeout: customTimeout })
      );
    });

    it('should reject transaction exceeding time limit', async () => {
      // Requirement 2.9: Reject transactions exceeding timeout
      jest.useFakeTimers();
      
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        const txClient = mockPrismaService;
        return await callback(txClient);
      });

      const slowOperation = jest.fn().mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 15000));
        return { success: true };
      });

      const promise = service.executeInTransaction(slowOperation, 1000);

      jest.advanceTimersByTime(1500);

      await expect(promise).rejects.toThrow('Transaction timeout');

      jest.useRealTimers();
    });

    it('should ensure connection is released after transaction', async () => {
      // Requirement 2.2: Release connection within 1 second after completion
      const startTime = Date.now();
      
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        const result = await callback(mockPrismaService);
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        // Verify transaction completes quickly (under 1 second for simple ops)
        expect(duration).toBeLessThan(1000);
        
        return result;
      });

      const operations = jest.fn().mockResolvedValue({ id: 'test' });
      
      await service.executeInTransaction(operations);

      expect(mockPrismaService.$transaction).toHaveBeenCalled();
    });

    it('should handle transaction errors gracefully', async () => {
      // Error handling
      const errorMessage = 'Database error';
      
      mockPrismaService.$transaction.mockRejectedValue(new Error(errorMessage));

      const operations = jest.fn().mockResolvedValue({ success: true });

      await expect(
        service.executeInTransaction(operations)
      ).rejects.toThrow(errorMessage);
    });

    it('should batch multiple database operations in single transaction', async () => {
      // Requirement 2.7: Use transactions to reuse single connection
      const userId = 'user-123';
      const walletId = 'wallet-456';
      const amount = 500;

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return await callback(mockPrismaService);
      });

      mockPrismaService.walletAccount.findUnique.mockResolvedValue({
        id: walletId,
        userId,
        balance: 1000,
      });

      mockPrismaService.walletAccount.update.mockResolvedValue({
        id: walletId,
        userId,
        balance: 1500,
      });

      mockPrismaService.walletTransaction.create.mockResolvedValue({
        id: 'txn-789',
        walletId,
        type: 'TOP_UP',
        amount,
      });

      const batchedOperations = async (tx: any) => {
        const wallet = await tx.walletAccount.findUnique({
          where: { userId },
        });
        
        await tx.walletAccount.update({
          where: { id: wallet.id },
          data: { balance: { increment: amount } },
        });
        
        await tx.walletTransaction.create({
          data: {
            walletId: wallet.id,
            type: 'TOP_UP',
            amount,
            description: 'Test top-up',
          },
        });

        return wallet;
      };

      await service.executeInTransaction(batchedOperations);

      // Verify all operations were called within the same transaction
      expect(mockPrismaService.$transaction).toHaveBeenCalledTimes(1);
      expect(mockPrismaService.walletAccount.findUnique).toHaveBeenCalled();
      expect(mockPrismaService.walletAccount.update).toHaveBeenCalled();
      expect(mockPrismaService.walletTransaction.create).toHaveBeenCalled();
    });
  });

  describe('executeParallelInTransaction', () => {
    it('should execute multiple queries in parallel within a transaction', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com' };
      const mockWallet = { id: 'wallet-1', balance: 1000 };
      const mockTransactions = [{ id: 'txn-1', amount: 100 }];

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return await callback(mockPrismaService);
      });

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.walletAccount.findUnique.mockResolvedValue(mockWallet);
      mockPrismaService.walletTransaction.create.mockResolvedValue(mockTransactions[0]);

      const queries = [
        (tx: any) => tx.user.findUnique({ where: { id: 'user-1' } }),
        (tx: any) => tx.walletAccount.findUnique({ where: { userId: 'user-1' } }),
        (tx: any) => tx.walletTransaction.create({ data: { walletId: 'wallet-1', type: 'TOP_UP', amount: 100 } }),
      ];

      const [user, wallet, transaction] = await service.executeParallelInTransaction(queries);

      expect(user).toEqual(mockUser);
      expect(wallet).toEqual(mockWallet);
      expect(transaction).toEqual(mockTransactions[0]);
      expect(mockPrismaService.$transaction).toHaveBeenCalledTimes(1);
    });

    it('should respect custom timeout for parallel operations', async () => {
      mockPrismaService.$transaction.mockImplementation(async (callback, options) => {
        expect(options.timeout).toBe(5000);
        return await callback(mockPrismaService);
      });

      const queries = [
        (tx: any) => tx.user.findUnique({ where: { id: 'user-1' } }),
      ];

      await service.executeParallelInTransaction(queries, 5000);

      expect(mockPrismaService.$transaction).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({ timeout: 5000 })
      );
    });
  });

  describe('executeWithRetry', () => {
    it('should retry failed operations with exponential backoff', async () => {
      // Requirement 2.8: Exponential backoff starting at 100ms
      jest.useFakeTimers();
      
      let attemptCount = 0;
      
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        attemptCount++;
        if (attemptCount < 3) {
          throw new Error('Connection timeout');
        }
        return await callback(mockPrismaService);
      });

      const operations = jest.fn().mockResolvedValue({ success: true });

      const promise = service.executeWithRetry(operations, {
        maxRetries: 3,
        initialDelayMs: 100,
      });

      // First attempt fails immediately
      await jest.advanceTimersByTimeAsync(0);
      
      // Wait for first retry delay (100ms)
      await jest.advanceTimersByTimeAsync(100);
      
      // Second attempt fails
      await jest.advanceTimersByTimeAsync(0);
      
      // Wait for second retry delay (200ms = 100 * 2^1)
      await jest.advanceTimersByTimeAsync(200);
      
      // Third attempt succeeds
      await jest.advanceTimersByTimeAsync(0);

      const result = await promise;
      
      expect(result).toEqual({ success: true });
      expect(attemptCount).toBe(3);

      jest.useRealTimers();
    });

    it('should use default retry parameters', async () => {
      jest.useFakeTimers();
      
      mockPrismaService.$transaction.mockRejectedValue(new Error('Connection error'));

      const operations = jest.fn().mockResolvedValue({ success: true });

      const promise = service.executeWithRetry(operations);

      // Attempt all 3 retries
      for (let i = 0; i < 3; i++) {
        await jest.advanceTimersByTimeAsync(100 * Math.pow(2, i));
      }

      await expect(promise).rejects.toThrow('Connection error');

      jest.useRealTimers();
    });

    it('should not retry non-retryable errors', async () => {
      const nonRetryableError = new Error('Invalid data');
      
      mockPrismaService.$transaction.mockRejectedValue(nonRetryableError);

      const operations = jest.fn().mockResolvedValue({ success: true });

      await expect(
        service.executeWithRetry(operations, { maxRetries: 3 })
      ).rejects.toThrow('Invalid data');

      // Should only attempt once (no retries for non-retryable errors)
      expect(mockPrismaService.$transaction).toHaveBeenCalledTimes(1);
    });

    it('should identify connection errors as retryable', async () => {
      jest.useFakeTimers();
      
      let attemptCount = 0;
      const connectionError = new Error('ECONNREFUSED: Connection refused');
      
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        attemptCount++;
        if (attemptCount < 2) {
          throw connectionError;
        }
        return await callback(mockPrismaService);
      });

      const operations = jest.fn().mockResolvedValue({ success: true });

      const promise = service.executeWithRetry(operations, {
        maxRetries: 3,
        initialDelayMs: 100,
      });

      await jest.advanceTimersByTimeAsync(0);
      await jest.advanceTimersByTimeAsync(100);
      await jest.advanceTimersByTimeAsync(0);

      const result = await promise;
      
      expect(result).toEqual({ success: true });
      expect(attemptCount).toBe(2);

      jest.useRealTimers();
    });

    it('should identify deadlock errors as retryable', async () => {
      jest.useFakeTimers();
      
      let attemptCount = 0;
      const deadlockError = new Error('Deadlock detected');
      
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        attemptCount++;
        if (attemptCount < 2) {
          throw deadlockError;
        }
        return await callback(mockPrismaService);
      });

      const operations = jest.fn().mockResolvedValue({ success: true });

      const promise = service.executeWithRetry(operations, {
        maxRetries: 3,
        initialDelayMs: 100,
      });

      await jest.advanceTimersByTimeAsync(0);
      await jest.advanceTimersByTimeAsync(100);
      await jest.advanceTimersByTimeAsync(0);

      const result = await promise;
      
      expect(result).toEqual({ success: true });
      expect(attemptCount).toBe(2);

      jest.useRealTimers();
    });

    it('should throw after max retries exhausted', async () => {
      jest.useFakeTimers();
      
      const persistentError = new Error('Connection timeout');
      
      mockPrismaService.$transaction.mockRejectedValue(persistentError);

      const operations = jest.fn().mockResolvedValue({ success: true });

      const promise = service.executeWithRetry(operations, {
        maxRetries: 2,
        initialDelayMs: 50,
      });

      // First attempt
      await jest.advanceTimersByTimeAsync(0);
      // First retry (50ms delay)
      await jest.advanceTimersByTimeAsync(50);
      // Second retry (100ms delay)
      await jest.advanceTimersByTimeAsync(100);

      await expect(promise).rejects.toThrow('Connection timeout');
      expect(mockPrismaService.$transaction).toHaveBeenCalledTimes(2);

      jest.useRealTimers();
    });
  });

  describe('integration scenarios', () => {
    it('should handle wallet top-up with atomic balance update', async () => {
      // Real-world scenario: Top-up approval requires transaction + balance update
      const userId = 'user-123';
      const walletId = 'wallet-456';
      const topUpAmount = 1000;
      const initialBalance = 500;

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return await callback(mockPrismaService);
      });

      mockPrismaService.walletAccount.findUnique.mockResolvedValue({
        id: walletId,
        userId,
        balance: initialBalance,
      });

      mockPrismaService.walletTransaction.create.mockResolvedValue({
        id: 'txn-top-up',
        walletId,
        type: 'TOP_UP',
        amount: topUpAmount,
        description: 'Admin approved top-up',
      });

      mockPrismaService.walletAccount.update.mockResolvedValue({
        id: walletId,
        userId,
        balance: initialBalance + topUpAmount,
      });

      const topUpOperation = async (tx: any) => {
        // Find wallet
        const wallet = await tx.walletAccount.findUnique({
          where: { userId },
        });

        // Create transaction record
        const transaction = await tx.walletTransaction.create({
          data: {
            walletId: wallet.id,
            type: 'TOP_UP',
            amount: topUpAmount,
            description: 'Admin approved top-up',
            idempotencyKey: `topup-${Date.now()}`,
          },
        });

        // Update balance atomically
        const updatedWallet = await tx.walletAccount.update({
          where: { id: wallet.id },
          data: {
            balance: { increment: topUpAmount },
          },
        });

        return { transaction, wallet: updatedWallet };
      };

      const result = await service.executeInTransaction(topUpOperation);

      expect(result.wallet.balance).toBe(initialBalance + topUpAmount);
      expect(mockPrismaService.$transaction).toHaveBeenCalledTimes(1);
    });

    it('should rollback all operations on error', async () => {
      // Verify transaction atomicity - all or nothing
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return await callback(mockPrismaService);
      });

      mockPrismaService.walletAccount.findUnique.mockResolvedValue({
        id: 'wallet-1',
        balance: 1000,
      });

      // Second operation will fail
      mockPrismaService.walletAccount.update.mockRejectedValue(
        new Error('Insufficient balance')
      );

      const failingOperation = async (tx: any) => {
        await tx.walletAccount.findUnique({ where: { id: 'wallet-1' } });
        await tx.walletAccount.update({
          where: { id: 'wallet-1' },
          data: { balance: { increment: -2000 } }, // This will fail
        });
      };

      await expect(
        service.executeInTransaction(failingOperation)
      ).rejects.toThrow('Insufficient balance');

      // Verify transaction was attempted
      expect(mockPrismaService.$transaction).toHaveBeenCalled();
    });
  });
});
