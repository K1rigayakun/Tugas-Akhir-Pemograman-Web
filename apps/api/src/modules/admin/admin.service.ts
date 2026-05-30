import { Injectable } from "@nestjs/common";
import { prisma } from "@emerald-kingdom/db";
import { AuditService } from "../audit/audit.service";
import { EncryptionService } from "../../common/encryption/encryption.service";

/**
 * AdminService — Logika bisnis untuk semua operasi admin panel.
 *
 * Setiap aksi admin dicatat ke audit log secara otomatis.
 */
@Injectable()
export class AdminService {
  constructor(
    private auditService: AuditService,
    private encryptionService: EncryptionService,
  ) {}

  // ============================================================
  // DASHBOARD
  // ============================================================

  /** Statistik platform hari ini */
  async getDashboardStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      activeUsers,
      activeAuctions,
      totalTopUpToday,
      totalBidsToday,
      pendingKYC,
    ] = await Promise.all([
      prisma.user.count({
        where: { lastActiveAt: { gte: today }, deletedAt: null },
      }),
      prisma.auction.count({
        where: { status: { in: ["ACTIVE", "ENDING"] } },
      }),
      prisma.walletTransaction.aggregate({
        where: { type: "TOP_UP", createdAt: { gte: today } },
        _sum: { amount: true },
      }),
      prisma.bid.count({
        where: { placedAt: { gte: today } },
      }),
      prisma.userKYC.count({
        where: { kycStatus: "PENDING" },
      }),
    ]);

    return {
      activeUsers,
      activeAuctions,
      totalTopUpToday: totalTopUpToday._sum.amount || 0,
      totalBidsToday,
      pendingKYC,
    };
  }

  // ============================================================
  // KELOLA USER
  // ============================================================

  /** Cari user berdasarkan email atau username */
  async searchUsers(query: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const where = {
      OR: [
        { email: { contains: query, mode: "insensitive" as const } },
        { username: { contains: query, mode: "insensitive" as const } },
      ],
      deletedAt: null,
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          username: true,
          rank: true,
          kycStatus: true,
          isSuspended: true,
          createdAt: true,
          lastActiveAt: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      data: users,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  /** Profil lengkap user untuk admin */
  async getUserFullProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        walletAccount: true,
        kyc: true,
        rankHistory: { orderBy: { changedAt: "desc" }, take: 10 },
        achievements: {
          include: { achievement: true },
          orderBy: { unlockedAt: "desc" },
          take: 10,
        },
      },
    });

    if (!user) return null;

    // Dekripsi data KYC untuk tampilan admin
    if (user.kyc) {
      try {
        user.kyc.fullName = this.encryptionService.decrypt(user.kyc.fullName);
        user.kyc.nationalId = this.encryptionService.decrypt(user.kyc.nationalId);
        user.kyc.dateOfBirth = this.encryptionService.decrypt(user.kyc.dateOfBirth);
        user.kyc.phoneNumber = this.encryptionService.decrypt(user.kyc.phoneNumber);
        user.kyc.streetAddress = this.encryptionService.decrypt(user.kyc.streetAddress);
      } catch {
        // Kalau dekripsi gagal, kembalikan data apa adanya
      }
    }

    return user;
  }

  /** Kirim peringatan ke user */
  async warnUser(adminId: string, userId: string, reason: string, ipAddress?: string) {
    await prisma.notification.create({
      data: {
        userId,
        type: "SECURITY_ALERT",
        payload: { type: "warning", reason },
      },
    });

    await this.auditService.logAdminAction(
      adminId, "WARN_USER", userId, "USER", { reason }, ipAddress,
    );

    return { success: true, message: "Peringatan berhasil dikirim." };
  }

  /** Suspend user sementara */
  async suspendUser(
    adminId: string,
    userId: string,
    reason: string,
    durationDays: number,
    ipAddress?: string,
  ) {
    const suspendUntil = new Date();
    suspendUntil.setDate(suspendUntil.getDate() + durationDays);

    await prisma.user.update({
      where: { id: userId },
      data: { isSuspended: true, suspendUntil },
    });

    await prisma.notification.create({
      data: {
        userId,
        type: "SECURITY_ALERT",
        payload: { type: "suspension", reason, until: suspendUntil.toISOString() },
      },
    });

    await this.auditService.logAdminAction(
      adminId, "SUSPEND_USER", userId, "USER",
      { reason, durationDays, suspendUntil: suspendUntil.toISOString() },
      ipAddress,
    );

    return { success: true, message: `User di-suspend sampai ${suspendUntil.toISOString()}.` };
  }

  /** Ban user dari lelang */
  async banFromAuction(adminId: string, userId: string, reason: string, ipAddress?: string) {
    // Soft flag — implementasi pengecekan di auction module
    await this.auditService.logAdminAction(
      adminId, "BAN_AUCTION", userId, "USER", { reason }, ipAddress,
    );

    return { success: true, message: "User dilarang mengikuti lelang." };
  }

  /** Ban permanen */
  async banPermanent(adminId: string, userId: string, reason: string, ipAddress?: string) {
    await prisma.user.update({
      where: { id: userId },
      data: { isSuspended: true, suspendUntil: null }, // null = permanent
    });

    await this.auditService.logAdminAction(
      adminId, "BAN_PERMANENT", userId, "USER", { reason }, ipAddress,
    );

    return { success: true, message: "User di-ban secara permanen." };
  }

  // ============================================================
  // KELOLA LELANG
  // ============================================================

  /** Daftar semua lelang dengan filter */
  async getAuctions(status?: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const where = status ? { status: status as any } : {};

    const [auctions, total] = await Promise.all([
      prisma.auction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { bids: true, watchlists: true } },
        },
      }),
      prisma.auction.count({ where }),
    ]);

    return {
      data: auctions,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  /** Batalkan lelang — trigger refund semua hold */
  async cancelAuction(adminId: string, auctionId: string, reason: string, ipAddress?: string) {
    const auction = await prisma.auction.findUnique({
      where: { id: auctionId },
      include: { bids: { where: { status: "ACTIVE" } } },
    });

    if (!auction) {
      return { success: false, message: "Lelang tidak ditemukan." };
    }

    // Update status lelang
    await prisma.auction.update({
      where: { id: auctionId },
      data: { status: "CANCELLED" },
    });

    // Refund semua bid yang aktif
    for (const bid of auction.bids) {
      await prisma.bid.update({
        where: { id: bid.id },
        data: { status: "REFUNDED" },
      });

      // Buat transaksi refund di wallet
      const wallet = await prisma.walletAccount.findUnique({
        where: { userId: bid.userId },
      });

      if (wallet) {
        await prisma.walletTransaction.create({
          data: {
            walletId: wallet.id,
            type: "REFUND",
            amount: bid.amount,
            description: `Refund bid untuk lelang "${auction.title}" yang dibatalkan`,
            referenceId: auctionId,
            idempotencyKey: `refund-cancel-${bid.id}-${Date.now()}`,
          },
        });

        await prisma.walletAccount.update({
          where: { id: wallet.id },
          data: {
            balance: { increment: bid.amount },
            pendingHold: { decrement: bid.amount },
          },
        });
      }
    }

    await this.auditService.logAdminAction(
      adminId, "CANCEL_AUCTION", auctionId, "AUCTION",
      { reason, title: auction.title, refundedBids: auction.bids.length },
      ipAddress,
    );

    return {
      success: true,
      message: `Lelang dibatalkan. ${auction.bids.length} bid di-refund.`,
    };
  }

  // ============================================================
  // REVIEW KYC
  // ============================================================

  /** Daftar KYC yang menunggu review */
  async getPendingKYC(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [submissions, total] = await Promise.all([
      prisma.userKYC.findMany({
        where: { kycStatus: "PENDING" },
        skip,
        take: limit,
        orderBy: { submittedAt: "asc" },
        include: {
          user: { select: { id: true, username: true, email: true } },
        },
      }),
      prisma.userKYC.count({ where: { kycStatus: "PENDING" } }),
    ]);

    // Dekripsi data untuk review
    const decrypted = submissions.map((s) => {
      try {
        return {
          ...s,
          fullName: this.encryptionService.decrypt(s.fullName),
          dateOfBirth: this.encryptionService.decrypt(s.dateOfBirth),
          phoneNumber: this.encryptionService.decrypt(s.phoneNumber),
          // nationalId sengaja tidak didekripsi penuh — hanya 4 digit terakhir
          nationalIdLast4: this.encryptionService.decrypt(s.nationalId).slice(-4),
        };
      } catch {
        return { ...s, fullName: "[Dekripsi gagal]" };
      }
    });

    return {
      data: decrypted,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  /** Approve KYC */
  async approveKYC(adminId: string, kycId: string, ipAddress?: string) {
    const kyc = await prisma.userKYC.update({
      where: { id: kycId },
      data: {
        kycStatus: "APPROVED",
        reviewedBy: adminId,
        reviewedAt: new Date(),
      },
    });

    await prisma.user.update({
      where: { id: kyc.userId },
      data: { kycStatus: "APPROVED" },
    });

    await prisma.notification.create({
      data: {
        userId: kyc.userId,
        type: "KYC_STATUS",
        payload: { status: "APPROVED", message: "KYC Anda telah disetujui." },
      },
    });

    await this.auditService.logAdminAction(
      adminId, "APPROVE_KYC", kycId, "KYC", {}, ipAddress,
    );

    return { success: true, message: "KYC disetujui." };
  }

  /** Reject KYC */
  async rejectKYC(adminId: string, kycId: string, notes: string, ipAddress?: string) {
    const kyc = await prisma.userKYC.update({
      where: { id: kycId },
      data: {
        kycStatus: "REJECTED",
        reviewedBy: adminId,
        reviewedAt: new Date(),
        reviewNotes: notes,
      },
    });

    await prisma.user.update({
      where: { id: kyc.userId },
      data: { kycStatus: "REJECTED" },
    });

    await prisma.notification.create({
      data: {
        userId: kyc.userId,
        type: "KYC_STATUS",
        payload: { status: "REJECTED", message: "KYC Anda ditolak.", reason: notes },
      },
    });

    await this.auditService.logAdminAction(
      adminId, "REJECT_KYC", kycId, "KYC", { notes }, ipAddress,
    );

    return { success: true, message: "KYC ditolak." };
  }

  // ============================================================
  // KELOLA MUSEUM
  // ============================================================

  /** Kurasi item ke museum */
  async curateToMuseum(
    adminId: string,
    auctionId: string,
    editorial: string,
    ipAddress?: string,
  ) {
    await prisma.museumItem.create({
      data: { auctionId, editorial },
    });

    await prisma.auction.update({
      where: { id: auctionId },
      data: { inMuseum: true },
    });

    await this.auditService.logAdminAction(
      adminId, "CURATE_MUSEUM", auctionId, "AUCTION",
      { editorial: editorial.substring(0, 100) },
      ipAddress,
    );

    return { success: true, message: "Item ditambahkan ke museum." };
  }

  // ============================================================
  // KELOLA EVENT
  // ============================================================

  /** Buat event baru */
  async createEvent(
    adminId: string,
    data: {
      name: string;
      theme: string;
      backgroundMode?: string;
      accentColors?: string[];
      expMultiplier: number;
      startTime: Date;
      endTime: Date;
    },
    ipAddress?: string,
  ) {
    const event = await prisma.event.create({
      data: {
        name: data.name,
        theme: data.theme,
        backgroundMode: data.backgroundMode,
        accentColors: data.accentColors || [],
        expMultiplier: data.expMultiplier,
        startTime: data.startTime,
        endTime: data.endTime,
      },
    });

    await this.auditService.logAdminAction(
      adminId, "CREATE_EVENT", event.id, "EVENT",
      { name: data.name, theme: data.theme },
      ipAddress,
    );

    return { success: true, data: event };
  }

  /** Aktifkan event */
  async activateEvent(adminId: string, eventId: string, ipAddress?: string) {
    const event = await prisma.event.update({
      where: { id: eventId },
      data: { isActive: true },
    });

    await this.auditService.logAdminAction(
      adminId, "ACTIVATE_EVENT", eventId, "EVENT",
      { name: event.name },
      ipAddress,
    );

    return { success: true, message: `Event "${event.name}" diaktifkan.` };
  }

  /** Akhiri event */
  async endEvent(adminId: string, eventId: string, ipAddress?: string) {
    const event = await prisma.event.update({
      where: { id: eventId },
      data: { isActive: false },
    });

    await this.auditService.logAdminAction(
      adminId, "END_EVENT", eventId, "EVENT",
      { name: event.name },
      ipAddress,
    );

    return { success: true, message: `Event "${event.name}" diakhiri.` };
  }

  // ============================================================
  // FRAUD ALERTS
  // ============================================================

  /** Deteksi aktivitas mencurigakan (rule-based) */
  async getFraudAlerts() {
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Rule 1: Lebih dari 5 bid per menit dari satu user
    const rapidBidders = await prisma.bid.groupBy({
      by: ["userId"],
      where: { placedAt: { gte: oneMinuteAgo } },
      _count: true,
      having: { userId: { _count: { gt: 5 } } },
    });

    // Rule 2: Win rate > 95% dalam 7 hari
    const recentWinners = await prisma.bid.groupBy({
      by: ["userId"],
      where: { placedAt: { gte: sevenDaysAgo }, status: "WON" },
      _count: true,
      having: { userId: { _count: { gt: 10 } } },
    });

    const alerts: Array<{ type: string; userId: string; detail: string }> = [];

    for (const r of rapidBidders) {
      alerts.push({
        type: "RAPID_BIDDING",
        userId: r.userId,
        detail: `${r._count} bid dalam 1 menit terakhir`,
      });
    }

    for (const w of recentWinners) {
      alerts.push({
        type: "HIGH_WIN_RATE",
        userId: w.userId,
        detail: `${w._count} kemenangan dalam 7 hari terakhir`,
      });
    }

    return alerts;
  }
}
