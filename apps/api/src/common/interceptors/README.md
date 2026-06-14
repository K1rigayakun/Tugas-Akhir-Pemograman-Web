# Connection Retry Interceptor

## Overview

The Connection Retry Interceptor automatically retries failed database connection attempts with exponential backoff. This interceptor helps handle transient connection failures and improves system resilience.

## Features

- **Exponential Backoff**: Starting at 100ms, doubling with each retry (100ms → 200ms → 400ms)
- **Max Retries**: Attempts up to 3 retries before throwing error
- **Smart Error Detection**: Only retries connection-related errors (ECONNREFUSED, ETIMEDOUT, etc.)
- **Comprehensive Logging**: Logs retry attempts and final failures for debugging

## Usage

### 1. Apply to Controller

Apply the interceptor to an entire controller:

```typescript
import { Controller, UseInterceptors } from '@nestjs/common';
import { ConnectionRetryInterceptor } from '../../common/interceptors';

@UseInterceptors(ConnectionRetryInterceptor)
@Controller('wallet')
export class WalletController {
  // All methods in this controller will have retry logic
  
  @Get('balance')
  async getBalance(@CurrentUser() user: User) {
    // This will automatically retry on connection errors
    return await this.walletService.getBalance(user.id);
  }
}
```

### 2. Apply to Specific Methods

Apply the interceptor to specific methods only:

```typescript
import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { ConnectionRetryInterceptor } from '../../common/interceptors';

@Controller('payment')
export class PaymentController {
  @UseInterceptors(ConnectionRetryInterceptor)
  @Post('create')
  async createPayment(@Body() dto: CreatePaymentDto) {
    // Only this method will have retry logic
    return await this.paymentService.createPayment(dto);
  }
  
  @Get('list')
  async listPayments() {
    // This method does not have retry logic
    return await this.paymentService.listPayments();
  }
}
```

### 3. Apply Globally

Apply the interceptor to all controllers in your application:

```typescript
// In app.module.ts or main.ts
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ConnectionRetryInterceptor } from './common/interceptors';

@Module({
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ConnectionRetryInterceptor,
    },
  ],
})
export class AppModule {}
```

### 4. Use Standalone Function

For service-level retry logic outside of HTTP requests:

```typescript
import { retryWithBackoff } from '../../common/interceptors';

@Injectable()
export class DataService {
  constructor(private prisma: PrismaService) {}
  
  async fetchCriticalData(id: string) {
    // Retry this operation up to 3 times with exponential backoff
    return await retryWithBackoff(
      async () => {
        return await this.prisma.data.findUnique({
          where: { id },
        });
      },
      3,    // maxRetries (default: 3)
      100   // initialDelay in ms (default: 100)
    );
  }
}
```

## How It Works

### Retry Logic

1. **Initial Attempt**: The operation is executed normally
2. **Error Detection**: If a connection error occurs, the interceptor catches it
3. **Exponential Backoff**: 
   - Retry 1: Wait 100ms
   - Retry 2: Wait 200ms
   - Retry 3: Wait 400ms
4. **Success or Failure**: Either the operation succeeds, or all retries are exhausted

### Connection Error Patterns

The interceptor recognizes the following connection error patterns:

- `ECONNREFUSED` - Connection refused
- `ENOTFOUND` - DNS lookup failed
- `ETIMEDOUT` - Connection timeout
- `ECONNRESET` - Connection reset by peer
- `EPIPE` - Broken pipe
- Keywords: `connection`, `connect`, `pool`, `socket`, `network`

### Non-Retryable Errors

The following errors are **NOT** retried (they fail immediately):

- Validation errors
- Business logic errors
- Authentication/authorization errors
- Not found errors
- Any non-connection-related errors

## Logging

The interceptor logs important events:

### Retry Attempt
```json
{
  "message": "Retrying connection",
  "requestId": "abc-123",
  "path": "/api/v1/wallet/balance",
  "attempt": 2,
  "maxRetries": 3,
  "delayMs": 200
}
```

### Final Failure
```json
{
  "message": "Final failure after retries",
  "requestId": "abc-123",
  "path": "/api/v1/wallet/balance",
  "attempts": 3,
  "error": "ECONNREFUSED: Connection refused",
  "stack": "..."
}
```

## Configuration

Currently, the interceptor is configured with sensible defaults:

- **Max Retries**: 3
- **Initial Delay**: 100ms
- **Backoff Multiplier**: 2x

To customize these values, you can extend the interceptor or use the standalone `retryWithBackoff` function with custom parameters.

## Requirements Validation

This interceptor satisfies **Requirement 2.8**:

> THE API_Server SHALL implement connection retry logic with exponential backoff starting at 100ms for failed connection attempts

✅ Exponential backoff starting at 100ms  
✅ Retries failed connection attempts (up to 3 times)  
✅ Logs retry attempts and final failures  
✅ Only retries connection-related errors

## Best Practices

1. **Apply Selectively**: Don't apply retry logic to all endpoints. Focus on:
   - Database-heavy operations
   - Critical business transactions
   - Operations where transient failures are expected

2. **Avoid Idempotency Issues**: Be careful with operations that have side effects:
   - ❌ Don't use on operations that create unique records without idempotency keys
   - ✅ Do use on read operations
   - ✅ Do use on idempotent write operations

3. **Monitor Logs**: Watch for patterns of retry failures to identify systemic issues:
   - Frequent retries may indicate connection pool exhaustion
   - Consistent failures may indicate a larger infrastructure problem

4. **Combine with Circuit Breaker**: For production systems, consider combining with a circuit breaker pattern to prevent cascading failures

## Related Components

- **Transaction Batching Service** (`src/common/services/transaction-batching.service.ts`): Provides transaction-level retry logic with exponential backoff
- **Prisma Client Configuration** (`packages/db/src/client.ts`): Configures connection pool settings

## Examples

### Example 1: Wallet Service with Retry

```typescript
@Injectable()
export class WalletService {
  async getBalance(userId: string): Promise<number> {
    // Use standalone retry function for service methods
    return await retryWithBackoff(async () => {
      const wallet = await this.prisma.walletAccount.findUnique({
        where: { userId },
        select: { balance: true },
      });
      
      return wallet?.balance || 0;
    });
  }
}
```

### Example 2: Admin Controller with Retry

```typescript
@UseInterceptors(ConnectionRetryInterceptor)
@Controller('admin/auctions')
export class AdminAuctionsController {
  @Get()
  async listAuctions() {
    // Automatically retries on connection errors
    return await this.auctionService.findAll();
  }
}
```

### Example 3: Payment Processing with Custom Retry

```typescript
@Injectable()
export class PaymentService {
  async processPayment(paymentId: string) {
    // Custom retry configuration: 5 retries, 200ms initial delay
    return await retryWithBackoff(
      async () => {
        return await this.prisma.$transaction(async (tx) => {
          const payment = await tx.topUpRequest.findUnique({
            where: { id: paymentId },
          });
          
          // Process payment logic...
          
          return payment;
        });
      },
      5,    // More retries for critical operations
      200   // Longer initial delay
    );
  }
}
```

## Testing

The interceptor includes comprehensive tests covering:

- Successful requests (no retry needed)
- Connection errors (retries with backoff)
- Non-connection errors (no retry)
- Max retries exhaustion
- Various error codes and patterns

To run tests (when test infrastructure is configured):

```bash
npm test -- connection-retry.interceptor.spec.ts
```

## Troubleshooting

### Issue: Too Many Retries

**Symptom**: Requests take too long due to multiple retries

**Solution**: 
- Review connection pool configuration
- Check database server health
- Consider reducing max retries for non-critical endpoints

### Issue: Not Retrying Expected Errors

**Symptom**: Some connection errors are not being retried

**Solution**:
- Check if the error matches recognized patterns
- Add custom error patterns to `isConnectionError()` method
- Review error logs to identify the actual error message/code

### Issue: Retrying Non-Idempotent Operations

**Symptom**: Duplicate records or side effects occurring multiple times

**Solution**:
- Remove interceptor from non-idempotent operations
- Implement idempotency keys in your data model
- Use transaction-level retry logic instead

## Future Enhancements

Potential improvements for the interceptor:

1. **Configurable Parameters**: Allow per-endpoint customization of retry settings
2. **Circuit Breaker Integration**: Automatically stop retries when system is degraded
3. **Metrics Collection**: Track retry rates and success rates for monitoring
4. **Jitter**: Add randomization to backoff delays to prevent thundering herd
5. **Custom Error Patterns**: Allow registration of custom error patterns per service
