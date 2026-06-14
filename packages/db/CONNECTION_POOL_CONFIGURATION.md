# Prisma Client Connection Pool Configuration

## Overview

This document describes the connection pool configuration implemented for the Emerald Kingdom platform's Prisma Client. The configuration addresses Requirement 2 (Database Connection Pool Management) from the comprehensive bug fixes specification.

## Requirements Addressed

### Requirement 2.1: Connection Pool Size
- **Requirement**: Configure Prisma Client with a connection pool size of 3 connections maximum
- **Implementation**: Set via `connection_limit=3` parameter in DATABASE_URL
- **Location**: `.env` file - `DATABASE_URL` environment variable

### Requirement 2.3: PgBouncer Configuration
- **Requirement**: Use DATABASE_URL with pgbouncer=true parameter for all runtime operations
- **Implementation**: DATABASE_URL includes `?pgbouncer=true&connection_limit=3&connect_timeout=10`
- **Location**: `.env` file

### Requirement 2.4: Connection Timeout
- **Requirement**: Implement connection timeouts of 10 seconds maximum
- **Implementation**: 
  - Method 1: `connect_timeout=10` parameter in DATABASE_URL
  - Method 2: `withTimeout()` wrapper function in `packages/db/src/client.ts`
- **Location**: `.env` and `packages/db/src/client.ts`

### Requirement 2.10: Connection Pool Metrics Logging
- **Requirement**: Log connection pool metrics every 60 seconds including active connections, idle connections, and queue depth
- **Implementation**: `startConnectionPoolMonitoring()` function with automatic initialization
- **Location**: `packages/db/src/client.ts`

## Configuration Details

### DATABASE_URL Configuration

```env
DATABASE_URL="postgresql://user:pass@host:port/db?pgbouncer=true&connection_limit=3&connect_timeout=10"
```

**Parameters:**
- `pgbouncer=true` - Enables PgBouncer connection pooling mode
- `connection_limit=3` - Limits the connection pool to 3 connections maximum
- `connect_timeout=10` - Sets connection timeout to 10 seconds

### Prisma Client Configuration

Located in `packages/db/src/client.ts`:

```typescript
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" 
    ? ["query", "error", "warn", "info"] 
    : ["error"],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});
```

## Connection Timeout Implementation

### withTimeout() Function

Ensures operations don't hang indefinitely:

```typescript
export async function withTimeout<T>(
  operation: Promise<T>,
  timeoutMs: number = 10000
): Promise<T> {
  return Promise.race([
    operation,
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new Error(`Operation timed out after ${timeoutMs}ms`)),
        timeoutMs
      )
    ),
  ]);
}
```

**Usage Example:**
```typescript
const result = await withTimeout(
  prisma.user.findMany(),
  10000 // 10 second timeout
);
```

## Connection Pool Monitoring

### Automatic Monitoring

Connection pool monitoring starts automatically in non-test environments:

```typescript
if (typeof setInterval !== "undefined" && process.env.NODE_ENV !== "test") {
  startConnectionPoolMonitoring();
}
```

### Manual Control

```typescript
// Start monitoring
startConnectionPoolMonitoring();

// Stop monitoring
stopConnectionPoolMonitoring();
```

### Metrics Logged

The monitoring function logs the following metrics every 60 seconds:

1. **Basic Metrics:**
   - Timestamp
   - Configured pool size (3)
   - Query response time
   - Health status (healthy/degraded/critical)

2. **Detailed PostgreSQL Metrics** (if pg_stat_activity access is available):
   - Active connections count
   - Idle connections count
   - Total connections
   - Queue depth (calculated: totalConnections - maxPoolSize)
   - Pool utilization percentage

3. **Warnings:**
   - Alerts when pool is at or near capacity
   - Recommendations for optimization

### Example Log Output

```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "configuredPoolSize": 3,
  "responseTime": "45ms",
  "status": "healthy",
  "note": "Pool size limited to 3 connections via DATABASE_URL"
}

{
  "activeConnections": 2,
  "idleConnections": 1,
  "totalConnections": 3,
  "maxPoolSize": 3,
  "queueDepth": 0,
  "poolUtilization": "100%"
}
```

## Connection Pool Behavior

### Normal Operation
- Maximum 3 concurrent database connections
- Connections are reused from the pool
- Operations timeout after 10 seconds
- Metrics logged every 60 seconds

### Pool Exhaustion
When all 3 connections are in use:
- Additional requests are queued by Prisma Client
- Queue depth is monitored and logged
- Warning messages are generated when pool is at capacity

### Connection Release
- Connections are automatically returned to the pool after query completion
- Idle connections are managed by PgBouncer
- Timeout ensures connections don't hang indefinitely

## Testing

### Verification Script

Run the verification script to confirm configuration:

```bash
npx ts-node packages/db/verify-config.ts
```

This script verifies:
- ✓ Connection pool size configuration
- ✓ DATABASE_URL parameters
- ✓ Connection timeout settings
- ✓ Metrics logging configuration

### Connection Test

Test database connectivity:

```bash
npx ts-node packages/db/test-connection.ts
```

This script tests:
- Basic database connectivity
- Query timeout handling
- Database information retrieval
- Connection statistics (if available)

### Unit Tests

Located in `packages/db/src/client.test.ts`:

```bash
npm test --workspace=packages/db
```

Tests cover:
- Successful database connection
- Query execution with timeout wrapper
- Timeout enforcement for slow queries
- DATABASE_URL parameter verification
- Monitoring start/stop functionality
- Connection pool capacity handling

## Monitoring and Troubleshooting

### Health Checks

Response time status:
- **Healthy**: < 100ms
- **Degraded**: 100ms - 500ms
- **Critical**: > 500ms

### Common Issues

**Issue: "max clients reached in session mode"**
- Cause: Database server pool is at capacity
- Solution: Wait for connections to be released, or optimize queries to reduce connection time

**Issue: "Operation timed out after 10000ms"**
- Cause: Query taking longer than timeout setting
- Solution: Optimize the query, or increase timeout for specific operations

**Issue: High queue depth**
- Cause: More concurrent operations than available connections
- Solution: Use transaction batching, optimize query patterns, or consider increasing pool size

### Performance Optimization

1. **Use Transactions for Related Operations**
   ```typescript
   await prisma.$transaction(async (tx) => {
     await tx.user.update({...});
     await tx.walletAccount.update({...});
   });
   ```

2. **Batch Operations When Possible**
   ```typescript
   await prisma.user.createMany({
     data: [...],
   });
   ```

3. **Select Only Needed Fields**
   ```typescript
   await prisma.user.findMany({
     select: { id: true, email: true },
   });
   ```

## Related Requirements

This configuration also supports:

- **Requirement 2.2**: Connection release within 1 second (handled by PgBouncer)
- **Requirement 2.5**: Request queuing when pool is full (handled by Prisma Client)
- **Requirement 2.6**: Transaction batching for related operations
- **Requirement 2.7**: Prisma transactions for sequential operations
- **Requirement 2.8**: Connection retry logic (to be implemented)
- **Requirement 2.9**: Idle connection cleanup (handled by connect_timeout)

## References

- Prisma Documentation: https://www.prisma.io/docs/concepts/components/prisma-client/connection-management
- Supabase Connection Pooling: https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooling
- PostgreSQL pg_stat_activity: https://www.postgresql.org/docs/current/monitoring-stats.html

## Version History

- **v1.0** (2024-01-15): Initial implementation
  - Connection pool size: 3
  - Connection timeout: 10 seconds
  - PgBouncer enabled
  - Metrics logging every 60 seconds
