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
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 100
): Promise<T> {
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
        throw lastError;
      }

      // Calculate exponential backoff delay
      const delayMs = initialDelay * Math.pow(2, attempt);

      // Wait before retrying
      await sleep(delayMs);
    }
  }

  // This should never be reached, but TypeScript needs it
  throw lastError || new Error('Operation failed after all retries');
}

/**
 * Helper function to check if an error is connection-related
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
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
