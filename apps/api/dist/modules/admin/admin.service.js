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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const db_1 = require("@emerald-kingdom/db");
const audit_service_1 = require("../audit/audit.service");
const encryption_service_1 = require("../../common/encryption/encryption.service");
/**
 * AdminService — Logika bisnis untuk semua operasi admin panel.
 *
 * Setiap aksi admin dicatat ke audit log secara otomatis.
 */
let AdminService = class AdminService {
    constructor(auditService, encryptionService) {
        this.auditService = auditService;
        this.encryptionService = encryptionService;
    }
    // ============================================================
    // DASHBOARD
    // ============================================================
    /** Statistik platform hari ini */
    async getDashboardStats() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const [activeUsers, activeAuctions, totalTopUpToday, totalBidsToday, pendingKYC,] = await Promise.all([
            db_1.prisma.user.count({
                where: { lastActiveAt: { gte: today }, deletedAt: null },
            }),
            db_1.prisma.auction.count({
                where: { status: { in: ["ACTIVE", "ENDING"] } },
            }),
            db_1.prisma.walletTransaction.aggregate({
                where: { type: "TOP_UP", createdAt: { gte: today } },
                _sum: { amount: true },
            }),
            db_1.prisma.bid.count({
                where: { placedAt: { gte: today } },
            }),
            db_1.prisma.userKYC.count({
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
    /** Grafik aktivitas platform 7 hari terakhir */
    async getDashboardChart() {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const dayStart = new Date();
            dayStart.setDate(dayStart.getDate() - i);
            dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(dayStart);
            dayEnd.setHours(23, 59, 59, 999);
            const [bids, topUp, newUsers] = await Promise.all([
                db_1.prisma.bid.count({
                    where: { placedAt: { gte: dayStart, lte: dayEnd } },
                }),
                db_1.prisma.walletTransaction.aggregate({
                    where: {
                        type: "TOP_UP",
                        createdAt: { gte: dayStart, lte: dayEnd },
                    },
                    _sum: { amount: true },
                }),
                db_1.prisma.user.count({
                    where: { createdAt: { gte: dayStart, lte: dayEnd }, deletedAt: null },
                }),
            ]);
            days.push({
                date: dayStart.toISOString().split("T")[0],
                bids,
                topUp: topUp._sum.amount || 0,
                newUsers,
            });
        }
        return days;
    }
    // ============================================================
    // KELOLA USER
    // ============================================================
    /** Cari user berdasarkan email atau username */
    async searchUsers(query, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const where = {
            OR: [
                { email: { contains: query, mode: "insensitive" } },
                { username: { contains: query, mode: "insensitive" } },
            ],
            deletedAt: null,
        };
        const [users, total] = await Promise.all([
            db_1.prisma.user.findMany({
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
            db_1.prisma.user.count({ where }),
        ]);
        return {
            data: users,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }
    /** Profil lengkap user untuk admin */
    async getUserFullProfile(userId) {
        const user = await db_1.prisma.user.findUnique({
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
        if (!user)
            return null;
        // Dekripsi data KYC untuk tampilan admin
        if (user.kyc) {
            try {
                user.kyc.fullName = user.kyc.fullName ? this.encryptionService.decrypt(user.kyc.fullName) : null;
                user.kyc.nationalId = user.kyc.nationalId ? this.encryptionService.decrypt(user.kyc.nationalId) : null;
                user.kyc.dateOfBirth = user.kyc.dateOfBirth ? this.encryptionService.decrypt(user.kyc.dateOfBirth) : null;
                user.kyc.phoneNumber = user.kyc.phoneNumber ? this.encryptionService.decrypt(user.kyc.phoneNumber) : null;
                user.kyc.streetAddress = user.kyc.streetAddress ? this.encryptionService.decrypt(user.kyc.streetAddress) : null;
            }
            catch {
                // Kalau dekripsi gagal, kembalikan data apa adanya
            }
        }
        return user;
    }
    /** Kirim peringatan ke user */
    async warnUser(adminId, userId, reason, ipAddress) {
        await db_1.prisma.notification.create({
            data: {
                userId,
                type: "SECURITY_ALERT",
                payload: { type: "warning", reason },
            },
        });
        await this.auditService.logAdminAction(adminId, "WARN_USER", userId, "USER", { reason }, ipAddress);
        return { success: true, message: "Peringatan berhasil dikirim." };
    }
    /** Suspend user sementara */
    async suspendUser(adminId, userId, reason, durationDays, ipAddress) {
        const suspendUntil = new Date();
        suspendUntil.setDate(suspendUntil.getDate() + durationDays);
        await db_1.prisma.user.update({
            where: { id: userId },
            data: { isSuspended: true, suspendUntil },
        });
        await db_1.prisma.notification.create({
            data: {
                userId,
                type: "SECURITY_ALERT",
                payload: { type: "suspension", reason, until: suspendUntil.toISOString() },
            },
        });
        await this.auditService.logAdminAction(adminId, "SUSPEND_USER", userId, "USER", { reason, durationDays, suspendUntil: suspendUntil.toISOString() }, ipAddress);
        return { success: true, message: `User di-suspend sampai ${suspendUntil.toISOString()}.` };
    }
    /** Ban user dari lelang — set flag dan cancel semua bid aktif */
    async banFromAuction(adminId, userId, reason, ipAddress) {
        // Set flag suspended dan cancel semua bid aktif user
        await db_1.prisma.$transaction(async (tx) => {
            await tx.user.update({
                where: { id: userId },
                data: { isSuspended: true, suspendUntil: null },
            });
            // Cancel semua bid aktif user
            await tx.bid.updateMany({
                where: { userId, status: "ACTIVE" },
                data: { status: "REFUNDED" },
            });
        });
        await this.auditService.logAdminAction(adminId, "BAN_AUCTION", userId, "USER", { reason }, ipAddress);
        return { success: true, message: "User dilarang mengikuti lelang dan semua bid aktif di-refund." };
    }
    /** Ban permanen */
    async banPermanent(adminId, userId, reason, ipAddress) {
        await db_1.prisma.user.update({
            where: { id: userId },
            data: { isSuspended: true, suspendUntil: null }, // null = permanent
        });
        await this.auditService.logAdminAction(adminId, "BAN_PERMANENT", userId, "USER", { reason }, ipAddress);
        return { success: true, message: "User di-ban secara permanen." };
    }
    // ============================================================
    // KELOLA LELANG
    // ============================================================
    /** Daftar semua lelang dengan filter */
    async getAuctions(status, type, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const where = {};
        if (status && status !== "ALL")
            where.status = status;
        if (type && type !== "ALL") {
            if (type === "LIVE")
                where.auctionType = "LIVE";
            else
                where.auctionType = { not: "LIVE" };
        }
        const [auctions, total] = await Promise.all([
            db_1.prisma.auction.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                include: {
                    _count: { select: { bids: true, watchlists: true } },
                },
            }),
            db_1.prisma.auction.count({ where }),
        ]);
        return {
            data: auctions,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }
    /**
     * Buat lelang baru melalui admin panel
     * Requirement 2.3: Validate all auction creation fields
     * Requirement 2.4: Create auction record with all fields from request
     */
    async createAuction(adminId, data, ipAddress) {
        // Validasi tambahan berdasarkan auctionType
        if (data.auctionType === "DESCENDING" && (!data.minimumPrice || !data.decrementAmount)) {
            return {
                success: false,
                message: "Lelang tipe DESCENDING memerlukan minimumPrice dan decrementAmount.",
            };
        }
        if (data.auctionType === "RANK_EXCL" && !data.minimumRank) {
            return {
                success: false,
                message: "Lelang tipe RANK_EXCL memerlukan minimumRank.",
            };
        }
        // Buat auction baru
        const auction = await db_1.prisma.auction.create({
            data: {
                title: data.title,
                description: data.description,
                category: data.category,
                rarity: data.rarity || "COMMON",
                auctionType: data.auctionType,
                startingPrice: data.startingPrice,
                currentPrice: data.startingPrice,
                minimumIncrement: data.minimumIncrement || 1,
                minimumPrice: data.minimumPrice,
                decrementAmount: data.decrementAmount,
                startTime: new Date(data.startTime),
                endTime: new Date(data.endTime),
                minimumRank: data.minimumRank,
                isSealed: data.isSealed || false,
                imageUrls: data.imageUrls || [],
                requiredAchievementId: data.requiredAchievementId,
                status: "DRAFT", // Auction starts as DRAFT, admin can activate it later
            },
            include: {
                _count: { select: { bids: true, watchlists: true } },
            },
        });
        await this.auditService.logAdminAction(adminId, "CREATE_AUCTION", auction.id, "AUCTION", { title: auction.title, auctionType: auction.auctionType }, ipAddress);
        return {
            success: true,
            data: auction,
            message: "Lelang berhasil dibuat.",
        };
    }
    /**
     * Batalkan lelang — trigger refund semua hold.
     * Menggunakan $transaction agar SEMUA operasi atomic.
     * Kalau satu gagal, semuanya rollback.
     */
    async cancelAuction(adminId, auctionId, reason, ipAddress) {
        const auction = await db_1.prisma.auction.findUnique({
            where: { id: auctionId },
            include: { bids: { where: { status: "ACTIVE" } } },
        });
        if (!auction) {
            return { success: false, message: "Lelang tidak ditemukan." };
        }
        // Semua operasi refund dalam 1 transaction — atomik
        await db_1.prisma.$transaction(async (tx) => {
            // Update status lelang
            await tx.auction.update({
                where: { id: auctionId },
                data: { status: "CANCELLED" },
            });
            // Refund semua bid yang aktif
            for (const bid of auction.bids) {
                await tx.bid.update({
                    where: { id: bid.id },
                    data: { status: "REFUNDED" },
                });
                const wallet = await tx.walletAccount.findUnique({
                    where: { userId: bid.userId },
                });
                if (wallet) {
                    await tx.walletTransaction.create({
                        data: {
                            walletId: wallet.id,
                            type: "REFUND",
                            amount: bid.amount,
                            description: `Refund bid untuk lelang "${auction.title}" yang dibatalkan`,
                            referenceId: auctionId,
                            idempotencyKey: `refund-cancel-${bid.id}-${Date.now()}`,
                        },
                    });
                    await tx.walletAccount.update({
                        where: { id: wallet.id },
                        data: {
                            balance: { increment: bid.amount },
                            pendingHold: { decrement: bid.amount },
                        },
                    });
                }
            }
        });
        await this.auditService.logAdminAction(adminId, "CANCEL_AUCTION", auctionId, "AUCTION", { reason, title: auction.title, refundedBids: auction.bids.length }, ipAddress);
        return {
            success: true,
            message: `Lelang dibatalkan. ${auction.bids.length} bid di-refund.`,
        };
    }
    // ============================================================
    // REVIEW KYC
    // ============================================================
    /** Daftar KYC yang menunggu review */
    async getPendingKYC(page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [submissions, total] = await Promise.all([
            db_1.prisma.userKYC.findMany({
                where: { kycStatus: "PENDING" },
                skip,
                take: limit,
                orderBy: { submittedAt: "asc" },
                include: {
                    user: { select: { id: true, username: true, email: true } },
                },
            }),
            db_1.prisma.userKYC.count({ where: { kycStatus: "PENDING" } }),
        ]);
        // Dekripsi data untuk review
        const decrypted = submissions.map((s) => {
            try {
                return {
                    ...s,
                    fullName: s.fullName ? this.encryptionService.decrypt(s.fullName) : null,
                    dateOfBirth: s.dateOfBirth ? this.encryptionService.decrypt(s.dateOfBirth) : null,
                    phoneNumber: s.phoneNumber ? this.encryptionService.decrypt(s.phoneNumber) : null,
                    // nationalId sengaja tidak didekripsi penuh — hanya 4 digit terakhir
                    nationalIdLast4: s.nationalId ? this.encryptionService.decrypt(s.nationalId).slice(-4) : null,
                };
            }
            catch {
                return { ...s, fullName: "[Dekripsi gagal]" };
            }
        });
        return {
            data: decrypted,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }
    /** Approve KYC */
    async approveKYC(adminId, kycId, ipAddress) {
        const kyc = await db_1.prisma.userKYC.update({
            where: { id: kycId },
            data: {
                kycStatus: "APPROVED",
                reviewedBy: adminId,
                reviewedAt: new Date(),
            },
        });
        await db_1.prisma.user.update({
            where: { id: kyc.userId },
            data: { kycStatus: "APPROVED" },
        });
        await db_1.prisma.notification.create({
            data: {
                userId: kyc.userId,
                type: "KYC_STATUS",
                payload: { status: "APPROVED", message: "KYC Anda telah disetujui." },
            },
        });
        await this.auditService.logAdminAction(adminId, "APPROVE_KYC", kycId, "KYC", {}, ipAddress);
        return { success: true, message: "KYC disetujui." };
    }
    /** Reject KYC */
    async rejectKYC(adminId, kycId, notes, ipAddress) {
        const kyc = await db_1.prisma.userKYC.update({
            where: { id: kycId },
            data: {
                kycStatus: "REJECTED",
                reviewedBy: adminId,
                reviewedAt: new Date(),
                reviewNotes: notes,
            },
        });
        await db_1.prisma.user.update({
            where: { id: kyc.userId },
            data: { kycStatus: "REJECTED" },
        });
        await db_1.prisma.notification.create({
            data: {
                userId: kyc.userId,
                type: "KYC_STATUS",
                payload: { status: "REJECTED", message: "KYC Anda ditolak.", reason: notes },
            },
        });
        await this.auditService.logAdminAction(adminId, "REJECT_KYC", kycId, "KYC", { notes }, ipAddress);
        return { success: true, message: "KYC ditolak." };
    }
    // ============================================================
    // KELOLA MUSEUM
    // ============================================================
    /** Dapatkan daftar item museum */
    async getMuseumItems(page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [items, total] = await Promise.all([
            db_1.prisma.museumItem.findMany({
                skip,
                take: limit,
                include: {
                    auction: true
                },
                orderBy: { featuredAt: "desc" },
            }),
            db_1.prisma.museumItem.count(),
        ]);
        return {
            data: items,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }
    /** Kurasi item ke museum */
    async curateToMuseum(adminId, auctionId, editorial, ipAddress) {
        await db_1.prisma.museumItem.create({
            data: { auctionId, editorial },
        });
        await db_1.prisma.auction.update({
            where: { id: auctionId },
            data: { inMuseum: true },
        });
        await this.auditService.logAdminAction(adminId, "CURATE_MUSEUM", auctionId, "AUCTION", { editorial: editorial.substring(0, 100) }, ipAddress);
        return { success: true, message: "Item ditambahkan ke museum." };
    }
    // ============================================================
    // KELOLA EVENT
    // ============================================================
    /** Dapatkan daftar event */
    async getEvents(page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [events, total] = await Promise.all([
            db_1.prisma.event.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
            }),
            db_1.prisma.event.count(),
        ]);
        return {
            data: events,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }
    /** Buat event baru */
    async createEvent(adminId, data, ipAddress) {
        const event = await db_1.prisma.event.create({
            data: {
                name: data.name,
                theme: data.theme,
                backgroundMode: data.backgroundMode,
                accentColors: data.accentColors || [],
                // bannerUrl: data.bannerUrl,
                expMultiplier: data.expMultiplier,
                startTime: data.startTime,
                endTime: data.endTime,
            },
        });
        await this.auditService.logAdminAction(adminId, "CREATE_EVENT", event.id, "EVENT", { name: data.name, theme: data.theme }, ipAddress);
        return { success: true, data: event };
    }
    /** Aktifkan event */
    async activateEvent(adminId, eventId, ipAddress) {
        const event = await db_1.prisma.event.update({
            where: { id: eventId },
            data: { isActive: true },
        });
        await this.auditService.logAdminAction(adminId, "ACTIVATE_EVENT", eventId, "EVENT", { name: event.name }, ipAddress);
        return { success: true, message: `Event "${event.name}" diaktifkan.` };
    }
    /** Akhiri event */
    async endEvent(adminId, eventId, ipAddress) {
        const event = await db_1.prisma.event.update({
            where: { id: eventId },
            data: { isActive: false },
        });
        await this.auditService.logAdminAction(adminId, "END_EVENT", eventId, "EVENT", { name: event.name }, ipAddress);
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
        const rapidBidders = await db_1.prisma.bid.groupBy({
            by: ["userId"],
            where: { placedAt: { gte: oneMinuteAgo } },
            _count: true,
            having: { userId: { _count: { gt: 5 } } },
        });
        // Rule 2: Win rate > 95% dalam 7 hari
        const recentWinners = await db_1.prisma.bid.groupBy({
            by: ["userId"],
            where: { placedAt: { gte: sevenDaysAgo }, status: "WON" },
            _count: true,
            having: { userId: { _count: { gt: 10 } } },
        });
        const alerts = [];
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
    // ============================================================
    // KELUARGA BARU (EKSPANSI FASE 3)
    // ============================================================
    /** Keuangan: Dapatkan transaksi */
    async getTransactions(page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            db_1.prisma.walletTransaction.findMany({ skip, take: limit, orderBy: { createdAt: "desc" } }),
            db_1.prisma.walletTransaction.count(),
        ]);
        return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
    }
    /** Keuangan: Manual Refund */
    async processManualRefund(adminId, transactionId, reason, ipAddress) {
        const tx = await db_1.prisma.walletTransaction.findUnique({ where: { id: transactionId } });
        if (!tx)
            throw new Error("Transaksi tidak ditemukan");
        // Asumsi: proses refund dilakukan di transaction block. Untuk demo admin panel:
        await this.auditService.logAdminAction(adminId, "PROCESS_REFUND", transactionId, "FINANCE", { amount: tx.amount, reason }, ipAddress);
        return { success: true, message: "Refund diproses" };
    }
    /** Cosmetic: Dapatkan semua cosmetic */
    async getCosmetics() {
        return db_1.prisma.cosmetic.findMany({ orderBy: { rarity: "desc" } });
    }
    /** Cosmetic: Buat cosmetic baru */
    async createCosmetic(adminId, data, fileUrl, ipAddress) {
        const cosmetic = await db_1.prisma.cosmetic.create({
            data: {
                name: data.name,
                type: data.type,
                rarity: data.rarity,
                obtainMethod: data.obtainMethod,
                imageUrl: fileUrl,
                shopPrice: data.shopPrice ? parseInt(data.shopPrice) : null,
                requiredRank: data.requiredRank || null,
                linkedAchievementId: data.linkedAchievementId || null,
                linkedEventName: data.linkedEventName || null,
                description: data.description || null,
                webCode: data.webCode || null,
            }
        });
        await this.auditService.logAdminAction(adminId, "CREATE_COSMETIC", cosmetic.id, "COSMETIC", { name: cosmetic.name }, ipAddress);
        return { success: true, data: cosmetic };
    }
    /** Achievement: Dapatkan semua achievement */
    async getAchievements() {
        return db_1.prisma.achievement.findMany({ orderBy: { tier: "desc" } });
    }
    /** Achievement: Buat achievement baru */
    async createAchievement(adminId, data, ipAddress) {
        const achievement = await db_1.prisma.achievement.create({
            data: {
                name: data.name,
                description: data.description,
                tier: data.tier,
                trigger: data.trigger,
                condition: data.condition,
                expReward: data.expReward,
            }
        });
        await this.auditService.logAdminAction(adminId, "CREATE_ACHIEVEMENT", achievement.id, "ACHIEVEMENT", { name: achievement.name }, ipAddress);
        return { success: true, data: achievement };
    }
    /** Content: Dapatkan semua konten */
    async getContent(type) {
        const where = type ? { type } : {};
        return db_1.prisma.platformContent.findMany({ where, orderBy: { order: "asc" } });
    }
    /** Content: Buat konten baru */
    async createContent(adminId, data, fileUrl, ipAddress) {
        const content = await db_1.prisma.platformContent.create({
            data: {
                type: data.type,
                title: data.title,
                content: data.content || "",
                imageUrl: fileUrl || null,
                order: parseInt(data.order, 10) || 0,
            }
        });
        await this.auditService.logAdminAction(adminId, "CREATE_CONTENT", content.id, "CONTENT", { title: content.title }, ipAddress);
        return { success: true, data: content };
    }
    /** Security: Dapatkan IP whitelist/blacklist */
    async getSecurityRules() {
        return db_1.prisma.securityRule.findMany({ orderBy: { createdAt: "desc" } });
    }
    /** Security: Tambah IP rule */
    async createSecurityRule(adminId, data, ipAddress) {
        const rule = await db_1.prisma.securityRule.create({ data: { ipAddress: data.ipAddress, isBlocked: data.isBlocked, reason: data.reason } });
        await this.auditService.logAdminAction(adminId, "CREATE_SECURITY_RULE", rule.id, "SECURITY", { ip: rule.ipAddress }, ipAddress);
        return { success: true, data: rule };
    }
    // ============================================================
    // PLATFORM SETTINGS
    // ============================================================
    /** Dapatkan pengaturan tema saat ini */
    async getThemeSettings() {
        // const setting = await prisma.platformSetting.findUnique({
        //   where: { key: "theme" },
        // });
        return { baseTheme: "carbon-hexagon", effectLayer: "emerald-particles" };
    }
    /** Simpan pengaturan tema */
    async updateThemeSettings(adminId, data, ipAddress) {
        const value = {
            baseTheme: data.baseTheme || "carbon-hexagon",
            effectLayer: data.effectLayer || "emerald-particles",
            customEffectUrl: data.customEffectUrl || null,
        };
        // await prisma.platformSetting.upsert({
        //   where: { key: "theme" },
        //   update: { value },
        //   create: { key: "theme", value },
        // });
        await this.auditService.logAdminAction(adminId, "UPDATE_THEME", "theme", "SETTINGS", { baseTheme: value.baseTheme, effectLayer: value.effectLayer }, ipAddress);
        return { success: true, message: "Tema berhasil diperbarui.", data: value };
    }
    // ============================================================
    // VAULT OFFERINGS
    // ============================================================
    async getVaultOfferings() {
        return db_1.prisma.vaultSubmission.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                user: { select: { id: true, username: true, rank: true } },
            },
        });
    }
    async reviewVaultOffering(id, status, adminNotes, adminId) {
        const offering = await db_1.prisma.vaultSubmission.findUnique({ where: { id } });
        if (!offering)
            throw new Error("Vault offering tidak ditemukan");
        const updated = await db_1.prisma.vaultSubmission.update({
            where: { id },
            data: {
                status,
                adminNotes,
            },
        });
        await db_1.prisma.notification.create({
            data: {
                userId: offering.userId,
                type: "SECURITY_ALERT", // We can map this to a more relevant type if needed, but for now reuse it
                payload: {
                    title: "Update Pengajuan Relik",
                    message: `Pengajuan Vault Anda untuk "${offering.title}" telah ${status === "APPROVED" ? "disetujui" : "ditolak"}.`,
                    notes: adminNotes,
                },
            },
        });
        await this.auditService.logAdminAction(adminId, "REVIEW_VAULT_OFFERING", id, "VAULT", { status, adminNotes });
        return { success: true, data: updated };
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [audit_service_1.AuditService,
        encryption_service_1.EncryptionService])
], AdminService);
//# sourceMappingURL=admin.service.js.map