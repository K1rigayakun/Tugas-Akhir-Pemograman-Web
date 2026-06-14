"use strict";
// Emerald Kingdom — Prisma Client Configuration with Connection Pool Management
// This file handles connection pool configuration, timeouts, and metrics logging
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = exports.prismaDatabaseUrl = void 0;
exports.getPrismaDatabaseUrl = getPrismaDatabaseUrl;
exports.withTimeout = withTimeout;
exports.startConnectionPoolMonitoring = startConnectionPoolMonitoring;
exports.stopConnectionPoolMonitoring = stopConnectionPoolMonitoring;
const client_1 = require("@prisma/client");
const DEFAULT_CONNECTION_LIMIT = process.env.PRISMA_CONNECTION_LIMIT || "3";
const DEFAULT_CONNECT_TIMEOUT = process.env.PRISMA_CONNECT_TIMEOUT || "10";
function getPrismaDatabaseUrl(databaseUrl = process.env.DATABASE_URL) {
    if (!databaseUrl)
        return databaseUrl;
    try {
        const url = new URL(databaseUrl);
        if (!url.searchParams.has("connection_limit")) {
            url.searchParams.set("connection_limit", DEFAULT_CONNECTION_LIMIT);
        }
        if (!url.searchParams.has("connect_timeout")) {
            url.searchParams.set("connect_timeout", DEFAULT_CONNECT_TIMEOUT);
        }
        return url.toString();
    }
    catch {
        return databaseUrl;
    }
}
exports.prismaDatabaseUrl = getPrismaDatabaseUrl();
const globalForPrisma = globalThis;
/**
 * Configure Prisma Client with connection pool limits and timeout settings
 * - Connection pool size: 3 (configured via DATABASE_URL connection_limit=3)
 * - Connection timeout: 10 seconds (configured via connect_timeout parameter)
 * - PgBouncer enabled for connection pooling
 */
exports.prisma = globalForPrisma.prisma ??
    new client_1.PrismaClient({
        log: process.env.NODE_ENV === "development"
            ? ["query", "error", "warn", "info"]
            : ["error"],
        datasources: {
            db: {
                url: exports.prismaDatabaseUrl,
            },
        },
    });
if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = exports.prisma;
}
/**
 * Wrapper function to execute queries with a 10-second timeout
 * This ensures connections don't hang indefinitely
 */
async function withTimeout(operation, timeoutMs = 10000) {
    return Promise.race([
        operation,
        new Promise((_, reject) => setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs)),
    ]);
}
/**
 * Connection pool metrics logging
 * Logs metrics every 60 seconds including:
 * - Active connections
 * - Idle connections
 * - Queue depth (approximated)
 * - Response time
 */
let metricsInterval = null;
function startConnectionPoolMonitoring() {
    // Prevent duplicate intervals
    if (metricsInterval) {
        return;
    }
    metricsInterval = setInterval(async () => {
        try {
            // Measure query response time as an indicator of pool health
            const startTime = Date.now();
            await withTimeout(exports.prisma.$queryRaw `SELECT 1 as health_check`, 5000);
            const responseTime = Date.now() - startTime;
            // Log basic metrics
            console.log("[Connection Pool Metrics]", {
                timestamp: new Date().toISOString(),
                configuredPoolSize: 3,
                responseTime: `${responseTime}ms`,
                status: responseTime < 100 ? "healthy" : responseTime < 500 ? "degraded" : "critical",
                note: "Pool size limited to 3 connections via DATABASE_URL",
            });
            // Attempt to get detailed PostgreSQL connection stats
            try {
                const connections = await withTimeout(exports.prisma.$queryRaw `
            SELECT state, COUNT(*) as count
            FROM pg_stat_activity
            WHERE datname = current_database()
              AND pid != pg_backend_pid()
              AND usename = current_user
            GROUP BY state
          `, 5000);
                const activeCount = Number(connections.find((c) => c.state === "active")?.count) || 0;
                const idleCount = Number(connections.find((c) => c.state === "idle")?.count) || 0;
                const totalConnections = activeCount + idleCount;
                // Calculate queue depth (approximation based on pool utilization)
                const queueDepth = Math.max(0, totalConnections - 3);
                console.log("[Database Connection Stats]", {
                    activeConnections: activeCount,
                    idleConnections: idleCount,
                    totalConnections,
                    maxPoolSize: 3,
                    queueDepth,
                    poolUtilization: `${Math.round((totalConnections / 3) * 100)}%`,
                });
                // Warn if pool is near or at capacity
                if (totalConnections >= 3) {
                    console.warn("[Connection Pool Warning]", {
                        message: "Connection pool at or near capacity",
                        activeConnections: activeCount,
                        recommendation: "Consider optimizing query patterns or increasing pool size",
                    });
                }
            }
            catch (pgError) {
                // If we can't query pg_stat_activity, log basic metrics only
                console.log("[Connection Pool]", {
                    note: "Detailed PostgreSQL stats unavailable (requires pg_stat_activity access)",
                    responseTime: `${responseTime}ms`,
                });
            }
        }
        catch (error) {
            console.error("[Connection Pool Metrics Error]", {
                error: error instanceof Error ? error.message : "Unknown error",
                timestamp: new Date().toISOString(),
                note: "Failed to collect connection pool metrics",
            });
        }
    }, 60000); // Log every 60 seconds
    console.log("[Connection Pool Monitoring]", {
        message: "Started connection pool monitoring",
        interval: "60 seconds",
        poolSize: 3,
        timeout: "10 seconds",
    });
}
/**
 * Stop connection pool monitoring (for cleanup)
 */
function stopConnectionPoolMonitoring() {
    if (metricsInterval) {
        clearInterval(metricsInterval);
        metricsInterval = null;
        console.log("[Connection Pool Monitoring]", {
            message: "Stopped connection pool monitoring",
        });
    }
}
// Enable explicitly; auto-monitoring can keep extra pool sessions open in Next/API dev.
if (typeof setInterval !== "undefined" &&
    process.env.NODE_ENV !== "test" &&
    process.env.PRISMA_POOL_MONITORING === "true") {
    startConnectionPoolMonitoring();
}
__exportStar(require("@prisma/client"), exports);
//# sourceMappingURL=client.js.map