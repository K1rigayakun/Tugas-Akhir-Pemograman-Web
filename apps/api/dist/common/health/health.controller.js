"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthController = void 0;
const common_1 = require("@nestjs/common");
const db_1 = require("@emerald-kingdom/db");
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
let HealthController = class HealthController {
    healthCheck() {
        return {
            status: "ok",
            service: "emerald-kingdom-api",
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
        };
    }
    async readinessCheck() {
        const checks = {};
        // Database check
        const dbStart = Date.now();
        try {
            await db_1.prisma.$queryRaw `SELECT 1`;
            checks.database = { status: "ok", latency: Date.now() - dbStart };
        }
        catch (error) {
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
    async detailedCheck() {
        const memory = process.memoryUsage();
        const checks = {};
        // Database
        const dbStart = Date.now();
        try {
            const result = await db_1.prisma.$queryRaw `SELECT COUNT(*) as count FROM users`;
            checks.database = {
                status: "ok",
                latency: Date.now() - dbStart,
                userCount: Number(result[0]?.count || 0),
            };
        }
        catch (error) {
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
};
exports.HealthController = HealthController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "healthCheck", null);
__decorate([
    (0, common_1.Get)("ready"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "readinessCheck", null);
__decorate([
    (0, common_1.Get)("detailed"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "detailedCheck", null);
exports.HealthController = HealthController = __decorate([
    (0, common_1.Controller)("health")
], HealthController);
//# sourceMappingURL=health.controller.js.map