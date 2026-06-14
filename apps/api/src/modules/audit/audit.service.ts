import { Injectable } from "@nestjs/common";
import { prisma } from "@emerald-kingdom/db";

/**
 * AuditService — Mencatat semua aksi admin.
 *
 * ATURAN KRITIS:
 * - Semua aksi admin WAJIB dicatat
 * - Data audit log TIDAK BOLEH diubah atau dihapus (append-only)
 * - Ini adalah sumber kebenaran untuk investigasi
 */
@Injectable()
export class AuditService {
  /**
   * Catat aksi admin ke audit log.
   * Tidak ada update atau delete — append only.
   */
  async logAdminAction(
    adminId: string,
    action: string,
    targetId: string | null,
    targetType: string | null,
    details: Record<string, unknown> = {},
    ipAddress?: string,
  ): Promise<void> {
    await prisma.auditLog.create({
      data: {
        adminId,
        action,
        targetId,
        targetType,
        details: details as any,
        ipAddress: ipAddress || null,
        timestamp: new Date(),
      },
    });
  }

  /**
   * Ambil audit log dengan pagination. Read-only.
   */
  async getLogs(page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        skip,
        take: limit,
        orderBy: { timestamp: "desc" },
        include: {
          admin: {
            select: { id: true, username: true, email: true },
          },
        },
      }),
      prisma.auditLog.count(),
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
  async getLogsByTarget(targetId: string, targetType?: string) {
    return prisma.auditLog.findMany({
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
}
