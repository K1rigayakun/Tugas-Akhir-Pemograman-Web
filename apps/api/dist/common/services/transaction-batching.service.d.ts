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
export declare class TransactionBatchingService {
    private readonly prisma;
    constructor(prisma: PrismaService);
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
    executeInTransaction<T>(operations: (tx: Prisma.TransactionClient) => Promise<T>, timeoutMs?: number): Promise<T>;
    /**
     * Creates a promise that rejects after the specified timeout
     *
     * @param ms - Timeout duration in milliseconds
     * @returns Promise that rejects with a timeout error after the specified duration
     */
    private createTimeoutPromise;
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
    executeParallelInTransaction<T extends any[]>(queries: Array<(tx: Prisma.TransactionClient) => Promise<any>>, timeoutMs?: number): Promise<T>;
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
    executeWithRetry<T>(operations: (tx: Prisma.TransactionClient) => Promise<T>, options?: {
        maxRetries?: number;
        timeoutMs?: number;
        initialDelayMs?: number;
    }): Promise<T>;
    /**
     * Determines if an error is retryable
     *
     * @param error - The error to check
     * @returns true if the error is transient and retryable
     */
    private isRetryableError;
    /**
     * Sleep utility for retry delays
     *
     * @param ms - Duration to sleep in milliseconds
     * @returns Promise that resolves after the specified duration
     */
    private sleep;
}
//# sourceMappingURL=transaction-batching.service.d.ts.map