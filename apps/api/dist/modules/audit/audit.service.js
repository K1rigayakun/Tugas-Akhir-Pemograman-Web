"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
const common_1 = require("@nestjs/common");
const db_1 = require("@emerald-kingdom/db");
/**
 * AuditService — Mencatat semua aksi admin.
 *
 * ATURAN KRITIS:
 * - Semua aksi admin WAJIB dicatat
 * - Data audit log TIDAK BOLEH diubah atau dihapus (append-only)
 * - Ini adalah sumber kebenaran untuk investigasi
 */
let AuditService = class AuditService {
    /**
     * Catat aksi admin ke audit log.
     * Tidak ada update atau delete — append only.
     */
    async logAdminAction(adminId, action, targetId, targetType, details = {}, ipAddress) {
        await db_1.prisma.auditLog.create({
            data: {
                adminId,
                action,
                targetId,
                targetType,
                details: details,
                ipAddress: ipAddress || null,
                timestamp: new Date(),
            },
        });
    }
    /**
     * Ambil audit log dengan pagination. Read-only.
     */
    async getLogs(page = 1, limit = 50) {
        const skip = (page - 1) * limit;
        const [logs, total] = await Promise.all([
            db_1.prisma.auditLog.findMany({
                skip,
                take: limit,
                orderBy: { timestamp: "desc" },
                include: {
                    admin: {
                        select: { id: true, username: true, email: true },
                    },
                },
            }),
            db_1.prisma.auditLog.count(),
        ]);
        return {
            data: logs,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    /**
     * Ambil audit log berdasarkan target (user/auction/etc).
     */
    async getLogsByTarget(targetId, targetType) {
        return db_1.prisma.auditLog.findMany({
            where: {
                targetId,
                ...(targetType ? { targetType } : {}),
            },
            orderBy: { timestamp: "desc" },
            include: {
                admin: {
                    select: { id: true, username: true },
                },
            },
        });
    }
};
exports.AuditService = AuditService;
exports.AuditService = AuditService = __decorate([
    (0, common_1.Injectable)()
], AuditService);
//# sourceMappingURL=audit.service.js.map