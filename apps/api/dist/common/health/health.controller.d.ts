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
export declare class HealthController {
    healthCheck(): {
        status: string;
        service: string;
        timestamp: string;
        uptime: number;
    };
    readinessCheck(): Promise<{
        status: string;
        checks: Record<string, {
            status: string;
            latency?: number;
            error?: string;
        }>;
        timestamp: string;
    }>;
    detailedCheck(): Promise<{
        status: string;
        service: string;
        version: string;
        environment: string;
        uptime: number;
        memory: {
            rss: string;
            heapUsed: string;
            heapTotal: string;
        };
        checks: Record<string, any>;
        timestamp: string;
    }>;
}
//# sourceMappingURL=health.controller.d.ts.map