import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
/**
 * Connection Retry Interceptor
 *
 * Automatically retries failed database connection attempts with exponential backoff.
 * This interceptor helps handle transient connection failures and improves system resilience.
 *
 * Key Features:
 * - Exponential backoff starting at 100ms
 * - Retries up to 3 times before throwing error
 * - Logs retry attempts and final failures
 * - Only retries connection-related errors
 *
 * Configuration:
 * - Initial delay: 100ms
 * - Max retries: 3
 * - Backoff multiplier: 2x (100ms → 200ms → 400ms)
 *
 * Usage:
 * Apply to controllers or methods that interact with the database:
 * ```typescript
 * @UseInterceptors(ConnectionRetryInterceptor)
 * @Controller('wallet')
 * export class WalletController { ... }
 * ```
 */
export declare class ConnectionRetryInterceptor implements NestInterceptor {
    private readonly logger;
    private readonly maxRetries;
    private readonly initialDelay;
    intercept(context: ExecutionContext, next: CallHandler): Observable<any>;
    /**
     * Retry with exponential backoff for observables
     *
     * @param operation - The operation to retry
     * @param requestId - Request identifier for logging
     * @param path - Request path for logging
     * @returns Observable with retry logic applied
     */
    private retryWithBackoffObservable;
    /**
     * Determines if an error is connection-related and should be retried
     *
     * @param error - The error to check
     * @returns true if the error is a connection error that should be retried
     */
    private isConnectionError;
}
/**
 * Standalone retry function with exponential backoff
 *
 * Retries a promise-based operation up to maxRetries times with exponential backoff.
 * This function can be used outside of the interceptor context for service-level retries.
 *
 * @param operation - Async function to retry
 * @param maxRetries - Maximum number of retry attempts (default: 3)
 * @param initialDelay - Initial delay in milliseconds (default: 100)
 * @returns Promise resolving to the operation result
 * @throws Last error encountered if all retries fail
 *
 * @example
 * ```typescript
 * const result = await retryWithBackoff(
 *   async () => await prisma.user.findUnique({ where: { id } }),
 *   3,
 *   100
 * );
 * ```
 */
export declare function retryWithBackoff<T>(operation: () => Promise<T>, maxRetries?: number, initialDelay?: number): Promise<T>;
//# sourceMappingURL=connection-retry.interceptor.d.ts.map