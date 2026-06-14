import { PrismaClient, Prisma } from "@prisma/client";
export declare function getPrismaDatabaseUrl(databaseUrl?: string | undefined): string | undefined;
export declare const prismaDatabaseUrl: string | undefined;
/**
 * Configure Prisma Client with connection pool limits and timeout settings
 * - Connection pool size: 3 (configured via DATABASE_URL connection_limit=3)
 * - Connection timeout: 10 seconds (configured via connect_timeout parameter)
 * - PgBouncer enabled for connection pooling
 */
export declare const prisma: PrismaClient<Prisma.PrismaClientOptions, never, import(".prisma/client/runtime/library").DefaultArgs>;
/**
 * Wrapper function to execute queries with a 10-second timeout
 * This ensures connections don't hang indefinitely
 */
export declare function withTimeout<T>(operation: Promise<T>, timeoutMs?: number): Promise<T>;
export declare function startConnectionPoolMonitoring(): void;
/**
 * Stop connection pool monitoring (for cleanup)
 */
export declare function stopConnectionPoolMonitoring(): void;
export * from "@prisma/client";
//# sourceMappingURL=client.d.ts.map