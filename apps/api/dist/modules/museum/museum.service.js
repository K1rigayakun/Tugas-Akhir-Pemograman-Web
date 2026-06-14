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
exports.MuseumService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let MuseumService = class MuseumService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    // New method for homepage - get featured items
    async getFeaturedItems() {
        const items = await this.prisma.museumItem.findMany({
            orderBy: { featuredAt: 'desc' },
            take: 6,
            include: {
                auction: {
                    select: {
                        id: true,
                        title: true,
                        rarity: true,
                        imageUrls: true,
                        finalPrice: true,
                        category: true,
                        winner: {
                            select: {
                                username: true,
                                privacyMode: true,
                            }
                        }
                    }
                }
            }
        });
        return items.map(item => ({
            id: item.id,
            name: item.auction.title,
            description: `Won by ${item.auction.winner?.privacyMode ? 'Anonymous' : item.auction.winner?.username || 'Unknown'} for ${item.auction.finalPrice || 0} CC`,
            image: item.auction.imageUrls?.[0] || '',
            category: item.auction.category,
            owner: item.auction.winner?.privacyMode ? null : item.auction.winner?.username
        }));
    }
    async getMuseumItems(limit) {
        return this.prisma.museumItem.findMany({
            orderBy: { featuredAt: 'desc' },
            take: limit,
            include: {
                auction: {
                    select: {
                        id: true,
                        title: true,
                        rarity: true,
                        imageUrls: true,
                        finalPrice: true,
                        winner: {
                            select: {
                                username: true,
                                privacyMode: true,
                                rank: true,
                            }
                        },
                        _count: {
                            select: { bids: true }
                        }
                    }
                }
            }
        });
    }
};
exports.MuseumService = MuseumService;
exports.MuseumService = MuseumService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MuseumService);
//# sourceMappingURL=museum.service.js.map