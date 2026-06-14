import { ConnectionRetryInterceptor, retryWithBackoff } from './connection-retry.interceptor';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of, throwError } from 'rxjs';

describe('ConnectionRetryInterceptor', () => {
  let interceptor: ConnectionRetryInterceptor;
  let mockExecutionContext: ExecutionContext;
  let mockCallHandler: CallHandler;

  beforeEach(() => {
    interceptor = new ConnectionRetryInterceptor();
    
    // Mock ExecutionContext
    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          id: 'test-request-id',
          url: '/test/path',
        }),
      }),
    } as any;

    // Mock CallHandler
    mockCallHandler = {
      handle: jest.fn(),
    } as any;
  });

  describe('intercept', () => {
    it('should pass through successful requests without retry', (done) => {
      const mockResponse = { data: 'success' };
      (mockCallHandler.handle as jest.Mock).mockReturnValue(of(mockResponse));

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (value) => {
          expect(value).toEqual(mockResponse);
          expect(mockCallHandler.handle).toHaveBeenCalledTimes(1);
          done();
        },
      });
    });

    it('should throw non-connection errors immediately without retry', (done) => {
      const mockError = new Error('Validation error');
      (mockCallHandler.handle as jest.Mock).mockReturnValue(
        throwError(() => mockError)
      );

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        error: (error) => {
          expect(error).toBe(mockError);
          expect(mockCallHandler.handle).toHaveBeenCalledTimes(1);
          done();
        },
      });
    });

    it('should retry connection errors with exponential backoff', (done) => {
      const connectionError = new Error('ECONNREFUSED: Connection refused');
      let attemptCount = 0;

      (mockCallHandler.handle as jest.Mock).mockImplementation(() => {
        attemptCount++;
        if (attemptCount < 3) {
          return throwError(() => connectionError);
        }
        return of({ data: 'success after retries' });
      });

      const startTime = Date.now();

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (value) => {
          const duration = Date.now() - startTime;
          
          expect(value).toEqual({ data: 'success after retries' });
          expect(attemptCount).toBe(3);
          
          // Verify exponential backoff timing (100ms + 200ms = 300ms minimum)
          // Allow some variance for test execution
          expect(duration).toBeGreaterThanOrEqual(250);
          
          done();
        },
        error: (error) => {
          done(error);
        },
      });
    }, 10000); // Increase timeout for this test

    it('should fail after max retries with connection errors', (done) => {
      const connectionError = new Error('ECONNREFUSED: Connection refused');
      (mockCallHandler.handle as jest.Mock).mockReturnValue(
        throwError(() => connectionError)
      );

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        error: (error) => {
          expect(error.message).toContain('ECONNREFUSED');
          // Initial attempt + 3 retries = 4 total
          expect(mockCallHandler.handle).toHaveBeenCalledTimes(4);
          done();
        },
      });
    }, 10000);

    it('should recognize various connection error patterns', () => {
      const connectionErrors = [
        new Error('ECONNREFUSED'),
        new Error('ETIMEDOUT'),
        new Error('ENOTFOUND'),
        new Error('Connection pool exhausted'),
        new Error('Socket timeout'),
        { message: 'Network error', code: 'ECONNRESET' },
      ];

      connectionErrors.forEach((error) => {
        const isConnectionError = (interceptor as any).isConnectionError(error);
        expect(isConnectionError).toBe(true);
      });
    });

    it('should not recognize non-connection errors', () => {
      const nonConnectionErrors = [
        new Error('Validation failed'),
        new Error('User not found'),
        new Error('Invalid token'),
        { message: 'Bad request' },
      ];

      nonConnectionErrors.forEach((error) => {
        const isConnectionError = (interceptor as any).isConnectionError(error);
        expect(isConnectionError).toBe(false);
      });
    });
  });
});

describe('retryWithBackoff', () => {
  it('should return result on first successful attempt', async () => {
    const mockOperation = jest.fn().mockResolvedValue('success');

    const result = await retryWithBackoff(mockOperation, 3, 100);

    expect(result).toBe('success');
    expect(mockOperation).toHaveBeenCalledTimes(1);
  });

  it('should retry with exponential backoff on connection errors', async () => {
    let attemptCount = 0;
    const mockOperation = jest.fn().mockImplementation(async () => {
      attemptCount++;
      if (attemptCount < 3) {
        const error = new Error('ECONNREFUSED: Connection refused');
        throw error;
      }
      return 'success after retries';
    });

    const startTime = Date.now();
    const result = await retryWithBackoff(mockOperation, 3, 100);
    const duration = Date.now() - startTime;

    expect(result).toBe('success after retries');
    expect(attemptCount).toBe(3);
    
    // Should have delayed: 100ms + 200ms = 300ms minimum
    expect(duration).toBeGreaterThanOrEqual(250);
  });

  it('should throw error after max retries', async () => {
    const connectionError = new Error('ECONNREFUSED: Connection refused');
    const mockOperation = jest.fn().mockRejectedValue(connectionError);

    await expect(retryWithBackoff(mockOperation, 3, 50)).rejects.toThrow(
      'ECONNREFUSED'
    );

    expect(mockOperation).toHaveBeenCalledTimes(3);
  });

  it('should not retry non-connection errors', async () => {
    const validationError = new Error('Validation failed');
    const mockOperation = jest.fn().mockRejectedValue(validationError);

    await expect(retryWithBackoff(mockOperation, 3, 100)).rejects.toThrow(
      'Validation failed'
    );

    // Should fail immediately without retries
    expect(mockOperation).toHaveBeenCalledTimes(1);
  });

  it('should respect custom maxRetries parameter', async () => {
    const connectionError = new Error('ECONNREFUSED: Connection refused');
    const mockOperation = jest.fn().mockRejectedValue(connectionError);

    await expect(retryWithBackoff(mockOperation, 5, 50)).rejects.toThrow();

    expect(mockOperation).toHaveBeenCalledTimes(5);
  });

  it('should respect custom initialDelay parameter', async () => {
    let attemptCount = 0;
    const mockOperation = jest.fn().mockImplementation(async () => {
      attemptCount++;
      if (attemptCount < 2) {
        throw new Error('ECONNREFUSED: Connection refused');
      }
      return 'success';
    });

    const startTime = Date.now();
    await retryWithBackoff(mockOperation, 3, 200);
    const duration = Date.now() - startTime;

    // First retry should wait 200ms (initialDelay * 2^0)
    expect(duration).toBeGreaterThanOrEqual(180);
  });

  it('should handle promise rejections correctly', async () => {
    const mockOperation = jest.fn().mockImplementation(async () => {
      return Promise.reject(new Error('ETIMEDOUT: Timeout'));
    });

    await expect(retryWithBackoff(mockOperation, 2, 50)).rejects.toThrow(
      'ETIMEDOUT'
    );

    expect(mockOperation).toHaveBeenCalledTimes(2);
  });

  it('should handle connection errors with various error codes', async () => {
    const errorCodes = ['ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND', 'ECONNRESET'];
    
    for (const code of errorCodes) {
      let attemptCount = 0;
      const mockOperation = jest.fn().mockImplementation(async () => {
        attemptCount++;
        if (attemptCount < 2) {
          const error: any = new Error(`${code}: Connection error`);
          error.code = code;
          throw error;
        }
        return 'success';
      });

      const result = await retryWithBackoff(mockOperation, 3, 50);
      expect(result).toBe('success');
      expect(attemptCount).toBe(2);
    }
  });
});
