import { Controller, Get } from "@nestjs/common";
import { prisma } from "@emerald-kingdom/db";

/**
 * HealthController — Endpoint untuk monitoring dan deployment check.
 *
 * Railway dan platform deploy lain memerlukan health check endpoint
 * untuk menentukan apakah service sudah siap menerima traffic.
 */
@Controller("health")
export class HealthController {
  @Get()
  async check() {
    const checks: Record<string, string> = {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: `${Math.floor(process.uptime())}s`,
    };

    // Cek koneksi database
    try {
      await prisma.$queryRaw`SELECT 1`;
      checks.database = "connected";
    } catch {
      checks.database = "disconnected";
      checks.status = "degraded";
    }

    return checks;
  }

  @Get("ready")
  async readiness() {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return { ready: true };
    } catch {
      return { ready: false };
    }
  }
}
