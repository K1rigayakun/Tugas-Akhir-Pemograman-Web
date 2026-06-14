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
exports.DiscoveryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let DiscoveryService = class DiscoveryService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async leaderboard(category, limit = 50) {
        const take = Math.min(Math.max(limit, 3), 100);
        if (category === "top-spender") {
            const wallets = await this.prisma.walletAccount.findMany({
                take,
                orderBy: { totalSpent: "desc" },
                include: { user: true },
            });
            return wallets.map((entry, index) => this.leaderEntry(entry.user, index, entry.totalSpent));
        }
        const field = {
            "most-wins": "totalWins",
            "highest-streak": "longestStreak",
            "highest-rank": "totalExp",
            "event-champion": "totalExp",
            "live-auction-king": "totalWins",
        }[category];
        if (field) {
            const users = await this.prisma.user.findMany({
                where: { deletedAt: null, isSuspended: false },
                take,
                orderBy: { [field]: "desc" },
            });
            return users.map((user, index) => this.leaderEntry(user, index, user[field]));
        }
        if (category === "rare-collector") {
            const users = await this.prisma.user.findMany({
                where: { deletedAt: null, isSuspended: false },
                take: 100,
                include: { _count: { select: { cosmetics: true } } },
            });
            return users
                .sort((a, b) => b._count.cosmetics - a._count.cosmetics)
                .slice(0, take)
                .map((user, index) => this.leaderEntry(user, index, user._count.cosmetics));
        }
        throw new common_1.NotFoundException("Kategori leaderboard tidak ditemukan.");
    }
    museumItems(limit = 20, rarity) {
        return this.prisma.museumItem.findMany({
            take: Math.min(Math.max(limit, 1), 100),
            where: rarity ? { auction: { rarity: rarity } } : undefined,
            orderBy: { featuredAt: "desc" },
            include: {
                auction: {
                    include: {
                        winner: { select: { username: true, privacyMode: true, rank: true } },
                        _count: { select: { bids: true } },
                    },
                },
            },
        });
    }
    museumItem(id) {
        return this.prisma.museumItem.findUnique({
            where: { id },
            include: { auction: { include: { winner: true, bids: { orderBy: { amount: "desc" }, take: 10 } } } },
        });
    }
    async museumRecords() {
        const [highestPrice, mostBids, longestStreak] = await Promise.all([
            this.prisma.auction.findFirst({ where: { status: "ENDED" }, orderBy: { finalPrice: "desc" } }),
            this.prisma.auction.findFirst({
                where: { status: "ENDED" },
                orderBy: { bids: { _count: "desc" } },
                include: { _count: { select: { bids: true } } },
            }),
            this.prisma.user.findFirst({ orderBy: { longestStreak: "desc" }, select: { username: true, longestStreak: true } }),
        ]);
        return { highestPrice, mostBids, longestStreak };
    }
    firstEmperor() {
        return this.prisma.user.findFirst({
            where: { rank: "EMPEROR" },
            orderBy: { createdAt: "asc" },
            select: { id: true, username: true, createdAt: true, totalWins: true, totalExp: true },
        });
    }
    eventHighlights() {
        return this.prisma.event.findMany({ where: { endTime: { lt: new Date() } }, orderBy: { endTime: "desc" } });
    }
    events() {
        return this.prisma.event.findMany({ orderBy: [{ isActive: "desc" }, { startTime: "asc" }] });
    }
    async event(id) {
        const event = await this.prisma.event.findUnique({ where: { id } });
        if (!event)
            throw new common_1.NotFoundException("Event tidak ditemukan.");
        return event;
    }
    leaderEntry(user, index, value) {
        return {
            position: index + 1,
            userId: user.id,
            username: user.privacyMode === "PUBLIC" ? user.username : "The Unknown",
            rank: user.rank,
            value,
        };
    }
};
exports.DiscoveryService = DiscoveryService;
exports.DiscoveryService = DiscoveryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DiscoveryService);
//# sourceMappingURL=discovery.service.js.map