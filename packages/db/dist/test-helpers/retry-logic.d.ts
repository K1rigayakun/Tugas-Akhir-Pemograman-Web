/**
 * Test helper for retry logic with exponential backoff
 * Duplicated from connection-retry.interceptor for testing purposes
 */
/**
 * Standalone retry function with exponential backoff
 *
 * @param operation - Async function to retry
 * @param maxRetries - Maximum number of retry attempts (default: 3)
 * @param initialDelay - Initial delay in milliseconds (default: 100)
 * @returns Promise resolving to the operation result
 * @throws Last error encountered if all retries fail
 */
export declare function retryWithBackoff<T>(operation: () => Promise<T>, maxRetries?: number, initialDelay?: number): Promise<T>;
//# sourceMappingURL=retry-logic.d.ts.map