/**
 * AuditService — Mencatat semua aksi admin.
 *
 * ATURAN KRITIS:
 * - Semua aksi admin WAJIB dicatat
 * - Data audit log TIDAK BOLEH diubah atau dihapus (append-only)
 * - Ini adalah sumber kebenaran untuk investigasi
 */
export declare class AuditService {
    /**
     * Catat aksi admin ke audit log.
     * Tidak ada update atau delete — append only.
     */
    logAdminAction(adminId: string, action: string, targetId: string | null, targetType: string | null, details?: Record<string, unknown>, ipAddress?: string): Promise<void>;
    /**
     * Ambil audit log dengan pagination. Read-only.
     */
    getLogs(page?: number, limit?: number): Promise<{
        data: ({
            admin: {
                id: string;
                email: string;
                username: string;
            };
        } & {
            id: string;
            adminId: string;
            action: string;
            targetId: string | null;
            targetType: string | null;
            details: import(".prisma/client").Prisma.JsonValue;
            ipAddress: string | null;
            timestamp: Date;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    /**
     * Ambil audit log berdasarkan target (user/auction/etc).
     */
    getLogsByTarget(targetId: string, targetType?: string): Promise<({
        admin: {
            id: string;
            username: string;
        };
    } & {
        id: string;
        adminId: string;
        action: string;
        targetId: string | null;
        targetType: string | null;
        details: import(".prisma/client").Prisma.JsonValue;
        ipAddress: string | null;
        timestamp: Date;
    })[]>;
}
//# sourceMappingURL=audit.service.d.ts.map