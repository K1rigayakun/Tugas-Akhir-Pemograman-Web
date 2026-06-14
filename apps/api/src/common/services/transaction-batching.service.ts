import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

/**
 * Transaction Batching Service
 * 
 * Provides helper methods for batching multiple database operations in a single transaction.
 * This ensures proper connection management and prevents connection pool exhaustion.
 * 
 * Key Features:
 * - Reuses a single connection for multiple operations within a transaction
 * - Implements timeout handling to prevent long-running transactions
 * - Ensures connections are released within 1 second after transaction completion
 * - Provides proper error handling and cleanup
 * 
 * Usage:
 * ```typescript
 * await this.transactionBatchingService.executeInTransaction(async (tx) => {
 *   // All operations here share the same connection
 *   const user = await tx.user.findUnique({ where: { id: userId } });
 *   await tx.walletAccount.update({ where: { userId }, data: { balance: newBalance } });
 *   await tx.walletTransaction.create({ data: { ... } });
 *   return result;
 * });
 * ```
 */
@Injectable()
export class TransactionBatchingService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Execute multiple database operations within a single transaction
   * 
   * This method ensures:
   * 1. All operations use a single database connection
   * 2. Operations are atomic (all succeed or all fail)
   * 3. Connection is released promptly after completion
   * 4. Transaction respects the specified timeout limit
   * 
   * @param operations - Callback function that receives a transaction client and performs database operations
   * @param timeoutMs - Maximum time allowed for the transaction (default: 10000ms = 10 seconds)
   * @returns Promise resolving to the result of the operations callback
   * @throws Error if transaction times out or operations fail
   * 
   * @example
   * ```typescript
   * const result = await this.executeInTransaction(async (tx) => {
   *   const wallet = await tx.walletAccount.findUnique({ where: { userId } });
   *   await tx.walletAccount.update({ 
   *     where: { id: wallet.id }, 
   *     data: { balance: { increment: 100 } } 
   *   });
   *   return wallet;
   * }, 5000); // 5 second timeout
   * ```
   */
  async executeInTransaction<T>(
    operations: (tx: Prisma.TransactionClient) => Promise<T>,
    timeoutMs: number = 10000
  ): Promise<T> {
    // Start timer to track transaction duration
    const startTime = Date.now();
    
    try {
      // Execute the transaction with a timeout
      const result = await this.prisma.$transaction(async (tx) => {
        // Race between the actual operations and a timeout
        return await Promise.race([
          operations(tx),
          this.createTimeoutPromise<T>(timeoutMs)
        ]);
      }, {
        // Transaction options to ensure proper connection management
        maxWait: 5000, // Maximum time to wait for a connection from the pool (5s)
        timeout: timeoutMs, // Maximum time the transaction can run
      });
      
      // Log successful completion with duration
      const duration = Date.now() - startTime;
      if (process.env.NODE_ENV === 'development') {
        console.log('[TransactionBatching]', {
          status: 'success',
          duration: `${duration}ms`,
          withinTimeout: duration < timeoutMs,
        });
      }
      
      return result;
    } catch (error) {
      // Log transaction failure
      const duration = Date.now() - startTime;
      console.error('[TransactionBatching]', {
        status: 'failed',
        duration: `${duration}ms`,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      
      throw error;
    }
  }

  /**
   * Creates a promise that rejects after the specified timeout
   * 
   * @param ms - Timeout duration in milliseconds
   * @returns Promise that rejects with a timeout error after the specified duration
   */
  private createTimeoutPromise<T>(ms: number): Promise<T> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Transaction timeout: operation exceeded ${ms}ms limit`));
      }, ms);
    });
  }

  /**
   * Execute multiple independent queries in parallel within a transaction
   * 
   * This is useful when you have multiple queries that don't depend on each other
   * but should be executed atomically as a group.
   * 
   * @param queries - Array of query functions that each receive the transaction client
   * @param timeoutMs - Maximum time allowed for all queries to complete
   * @returns Promise resolving to an array of results in the same order as the input queries
   * 
   * @example
   * ```typescript
   * const [user, wallet, transactions] = await this.executeParallelInTransaction([
   *   (tx) => tx.user.findUnique({ where: { id: userId } }),
   *   (tx) => tx.walletAccount.findUnique({ where: { userId } }),
   *   (tx) => tx.walletTransaction.findMany({ where: { walletId } })
   * ]);
   * ```
   */
  async executeParallelInTransaction<T extends any[]>(
    queries: Array<(tx: Prisma.TransactionClient) => Promise<any>>,
    timeoutMs: number = 10000
  ): Promise<T> {
    return this.executeInTransaction(async (tx) => {
      // Execute all queries in parallel using Promise.all
      return await Promise.all(
        queries.map(query => query(tx))
      ) as T;
    }, timeoutMs);
  }

  /**
   * Execute operations with automatic retry logic for transient failures
   * 
   * Retries the transaction if it fails due to connection issues or deadlocks.
   * Uses exponential backoff between retries.
   * 
   * @param operations - Callback function with database operations
   * @param options - Configuration for retries and timeout
   * @returns Promise resolving to the result of the operations
   * 
   * @example
   * ```typescript
   * const result = await this.executeWithRetry(
   *   async (tx) => { ... },
   *   { maxRetries: 3, timeoutMs: 5000, initialDelayMs: 100 }
   * );
   * ```
   */
  async executeWithRetry<T>(
    operations: (tx: Prisma.TransactionClient) => Promise<T>,
    options: {
      maxRetries?: number;
      timeoutMs?: number;
      initialDelayMs?: number;
    } = {}
  ): Promise<T> {
    const {
      maxRetries = 3,
      timeoutMs = 10000,
      initialDelayMs = 100
    } = options;

    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await this.executeInTransaction(operations, timeoutMs);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        // Check if error is retryable (connection issues, deadlocks, etc.)
        const isRetryable = this.isRetryableError(lastError);
        
        // If this is the last attempt or error is not retryable, throw immediately
        if (attempt === maxRetries - 1 || !isRetryable) {
          throw lastError;
        }
        
        // Calculate backoff delay with exponential increase
        const delay = initialDelayMs * Math.pow(2, attempt);
        
        console.warn('[TransactionBatching]', {
          message: 'Transaction failed, retrying...',
          attempt: attempt + 1,
          maxRetries,
          delayMs: delay,
          error: lastError.message,
        });
        
        // Wait before retrying
        await this.sleep(delay);
      }
    }
    
    // This should never be reached, but TypeScript needs it
    throw lastError || new Error('Transaction failed after retries');
  }

  /**
   * Determines if an error is retryable
   * 
   * @param error - The error to check
   * @returns true if the error is transient and retryable
   */
  private isRetryableError(error: Error): boolean {
    const message = error.message.toLowerCase();
    
    // Common retryable error patterns
    const retryablePatterns = [
      'connection',
      'timeout',
      'deadlock',
      'lock',
      'econnrefused',
      'enotfound',
      'etimedout',
      'transaction',
    ];
    
    return retryablePatterns.some(pattern => message.includes(pattern));
  }

  /**
   * Sleep utility for retry delays
   * 
   * @param ms - Duration to sleep in milliseconds
   * @returns Promise that resolves after the specified duration
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
