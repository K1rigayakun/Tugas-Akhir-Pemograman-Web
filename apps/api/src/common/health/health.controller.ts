import { Controller, Get } from "@nestjs/common";
import { prisma } from "@emerald-kingdom/db";

/**
 * HealthController — Health check dan readiness probe.
 *
 * Endpoints:
 * - GET /api/v1/health — Liveness check (selalu 200 kalau app berjalan)
 * - GET /api/v1/health/ready — Readiness check (cek koneksi database)
 * - GET /api/v1/health/detailed — Status detail semua komponen
 *
 * Digunakan oleh Railway/Kubernetes untuk monitoring.
 */
@Controller("health")
export class HealthController {
  @Get()
  healthCheck() {
    return {
      status: "ok",
      service: "emerald-kingdom-api",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  @Get("ready")
  async readinessCheck() {
    const checks: Record<string, { status: string; latency?: number; error?: string }> = {};

    // Database check
    const dbStart = Date.now();
    try {
      await prisma.$queryRaw`SELECT 1`;
      checks.database = { status: "ok", latency: Date.now() - dbStart };
    } catch (error) {
      checks.database = {
        status: "error",
        latency: Date.now() - dbStart,
        error: error instanceof Error ? error.message : "Unknown database error",
      };
    }

    const allOk = Object.values(checks).every((c) => c.status === "ok");

    return {
      status: allOk ? "ready" : "not_ready",
      checks,
      timestamp: new Date().toISOString(),
    };
  }

  @Get("detailed")
  async detailedCheck() {
    const memory = process.memoryUsage();
    const checks: Record<string, any> = {};

    // Database
    const dbStart = Date.now();
    try {
      const result = await prisma.$queryRaw`SELECT COUNT(*) as count FROM users` as any[];
      checks.database = {
        status: "ok",
        latency: Date.now() - dbStart,
        userCount: Number(result[0]?.count || 0),
      };
    } catch (error) {
      checks.database = {
        status: "error",
        latency: Date.now() - dbStart,
        error: error instanceof Error ? error.message : "Connection failed",
      };
    }

    return {
      status: "ok",
      service: "emerald-kingdom-api",
      version: "1.0.0",
      environment: process.env.NODE_ENV || "development",
      uptime: Math.floor(process.uptime()),
      memory: {
        rss: `${Math.round(memory.rss / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(memory.heapUsed / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memory.heapTotal / 1024 / 1024)}MB`,
      },
      checks,
      timestamp: new Date().toISOString(),
    };
  }
}
