import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, retryWhen, mergeMap, delay } from 'rxjs/operators';

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
@Injectable()
export class ConnectionRetryInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ConnectionRetryInterceptor.name);
  private readonly maxRetries = 3;
  private readonly initialDelay = 100;

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const requestId = request.id || 'unknown';
    const path = request.url || 'unknown-path';

    return next.handle().pipe(
      catchError((error) => {
        // Check if error is connection-related and should be retried
        if (this.isConnectionError(error)) {
          this.logger.warn({
            message: 'Connection error detected, will retry',
            requestId,
            path,
            error: error.message,
          });

          // Use the standalone retry function for the retry logic
          return this.retryWithBackoffObservable(
            () => next.handle(),
            requestId,
            path
          );
        }

        // Non-connection errors are thrown immediately
        return throwError(() => error);
      })
    );
  }

  /**
   * Retry with exponential backoff for observables
   * 
   * @param operation - The operation to retry
   * @param requestId - Request identifier for logging
   * @param path - Request path for logging
   * @returns Observable with retry logic applied
   */
  private retryWithBackoffObservable(
    operation: () => Observable<any>,
    requestId: string,
    path: string
  ): Observable<any> {
    let attempt = 0;

    return operation().pipe(
      retryWhen((errors) =>
        errors.pipe(
          mergeMap((error) => {
            attempt++;

            // Check if we should retry
            if (attempt >= this.maxRetries || !this.isConnectionError(error)) {
              this.logger.error({
                message: 'Max retries reached or non-retryable error',
                requestId,
                path,
                attempts: attempt,
                error: error.message,
              });
              return throwError(() => error);
            }

            // Calculate backoff delay: 100ms * 2^attempt
            const delayMs = this.initialDelay * Math.pow(2, attempt - 1);

            this.logger.log({
              message: 'Retrying connection',
              requestId,
              path,
              attempt,
              maxRetries: this.maxRetries,
              delayMs,
            });

            // Wait before retrying
            return new Observable((subscriber) => {
              setTimeout(() => {
                subscriber.next(null);
                subscriber.complete();
              }, delayMs);
            });
          })
        )
      ),
      catchError((error) => {
        this.logger.error({
          message: 'Final failure after retries',
          requestId,
          path,
          attempts: attempt,
          error: error.message,
          stack: error.stack,
        });
        return throwError(() => error);
      })
    );
  }

  /**
   * Determines if an error is connection-related and should be retried
   * 
   * @param error - The error to check
   * @returns true if the error is a connection error that should be retried
   */
  private isConnectionError(error: any): boolean {
    if (!error) return false;

    const message = error.message?.toLowerCase() || '';
    const code = error.code?.toLowerCase() || '';

    // Connection error patterns
    const connectionPatterns = [
      'econnrefused',
      'enotfound',
      'etimedout',
      'econnreset',
      'epipe',
      'connection',
      'connect',
      'pool',
      'socket',
      'network',
    ];

    return connectionPatterns.some(
      (pattern) => message.includes(pattern) || code.includes(pattern)
    );
  }
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
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 100
): Promise<T> {
  const logger = new Logger('retryWithBackoff');
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Attempt the operation
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');

      // Check if error is connection-related
      const isConnectionError = isConnectionRelatedError(lastError);

      // If this is the last attempt or not a connection error, throw
      if (attempt === maxRetries - 1 || !isConnectionError) {
        logger.error({
          message: 'Operation failed after retries',
          attempt: attempt + 1,
          maxRetries,
          error: lastError.message,
          isConnectionError,
        });
        throw lastError;
      }

      // Calculate exponential backoff delay
      const delayMs = initialDelay * Math.pow(2, attempt);

      logger.warn({
        message: 'Connection failed, retrying with backoff',
        attempt: attempt + 1,
        maxRetries,
        delayMs,
        error: lastError.message,
      });

      // Wait before retrying
      await sleep(delayMs);
    }
  }

  // This should never be reached, but TypeScript needs it
  throw lastError || new Error('Operation failed after all retries');
}

/**
 * Helper function to check if an error is connection-related
 * 
 * @param error - The error to check
 * @returns true if the error is related to connection issues
 */
function isConnectionRelatedError(error: Error): boolean {
  const message = error.message?.toLowerCase() || '';
  const code = (error as any).code?.toLowerCase() || '';

  const connectionPatterns = [
    'econnrefused',
    'enotfound',
    'etimedout',
    'econnreset',
    'epipe',
    'connection',
    'connect',
    'pool',
    'socket',
    'network',
  ];

  return connectionPatterns.some(
    (pattern) => message.includes(pattern) || code.includes(pattern)
  );
}

/**
 * Sleep utility for delays between retries
 * 
 * @param ms - Duration to sleep in milliseconds
 * @returns Promise that resolves after the specified duration
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
