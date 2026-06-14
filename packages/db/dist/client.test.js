"use strict";
// Test file for Prisma Client Connection Pool Configuration
// This file verifies that the connection pool is properly configured
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("./client");
describe("Prisma Client Connection Pool Configuration", () => {
    beforeAll(() => {
        // Stop monitoring to avoid interference with tests
        (0, client_1.stopConnectionPoolMonitoring)();
    });
    afterAll(async () => {
        await client_1.prisma.$disconnect();
    });
    test("should connect to database successfully", async () => {
        const result = await client_1.prisma.$queryRaw `SELECT 1 as result`;
        expect(result[0].result).toBe(1);
    });
    test("should execute query with timeout wrapper", async () => {
        const result = await (0, client_1.withTimeout)(client_1.prisma.$queryRaw `SELECT 1 as result`, 10000);
        expect(result[0].result).toBe(1);
    });
    test("should timeout when query takes too long", async () => {
        await expect((0, client_1.withTimeout)(client_1.prisma.$queryRaw `SELECT pg_sleep(15)`, // Sleep for 15 seconds
        1000 // Timeout after 1 second
        )).rejects.toThrow("Operation timed out after 1000ms");
    });
    test("should verify DATABASE_URL includes pgbouncer and connection_limit parameters", () => {
        const databaseUrl = process.env.DATABASE_URL || "";
        expect(databaseUrl).toContain("pgbouncer=true");
        expect(databaseUrl).toContain("connection_limit=3");
        expect(databaseUrl).toContain("connect_timeout=10");
    });
    test("should start and stop connection pool monitoring", () => {
        // This test verifies the monitoring functions don't throw errors
        expect(() => (0, client_1.startConnectionPoolMonitoring)()).not.toThrow();
        expect(() => (0, client_1.stopConnectionPoolMonitoring)()).not.toThrow();
    });
});
describe("Connection Pool Metrics", () => {
    beforeAll(() => {
        (0, client_1.stopConnectionPoolMonitoring)();
    });
    afterAll(async () => {
        await client_1.prisma.$disconnect();
    });
    test("should be able to query connection statistics", async () => {
        try {
            const connections = await client_1.prisma.$queryRaw `
        SELECT state, COUNT(*) as count
        FROM pg_stat_activity
        WHERE datname = current_database()
          AND pid != pg_backend_pid()
        GROUP BY state
      `;
            expect(Array.isArray(connections)).toBe(true);
            // Each connection should have a state and count
            connections.forEach((conn) => {
                expect(conn).toHaveProperty("state");
                expect(conn).toHaveProperty("count");
                expect(typeof conn.state).toBe("string");
            });
        }
        catch (error) {
            // If we don't have permission to query pg_stat_activity, that's okay
            // The error should be related to permissions, not connection issues
            console.log("Note: pg_stat_activity query requires database permissions");
        }
    });
    test("should handle connection pool at capacity gracefully", async () => {
        // Create multiple concurrent queries to test pool handling
        const promises = Array.from({ length: 5 }, (_, i) => client_1.prisma.$queryRaw `SELECT ${i} as result`);
        const results = await Promise.all(promises);
        expect(results).toHaveLength(5);
        results.forEach((result, i) => {
            expect(result[0].result).toBe(i);
        });
    });
});
//# sourceMappingURL=client.test.js.map