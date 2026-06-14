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
exports.ShopService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let ShopService = class ShopService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    list(type) {
        return this.prisma.shopItem.findMany({
            where: { isActive: true, ...(type ? { type } : {}) },
            orderBy: [{ isLimited: "desc" }, { createdAt: "desc" }],
        });
    }
    flashSales() {
        return this.prisma.shopItem.findMany({
            where: { isActive: true, flashSalePrice: { not: null }, flashSaleEnd: { gt: new Date() } },
            orderBy: { flashSaleEnd: "asc" },
        });
    }
    limited() {
        return this.prisma.shopItem.findMany({
            where: { isActive: true, isLimited: true, OR: [{ stock: null }, { stock: { gt: 0 } }] },
            orderBy: { createdAt: "desc" },
        });
    }
    async purchase(userId, itemId, idempotencyKey) {
        if (!idempotencyKey?.trim())
            throw new common_1.BadRequestException("idempotencyKey wajib diisi.");
        const result = await this.prisma.$transaction(async (tx) => {
            const existing = await tx.shopTransaction.findUnique({ where: { idempotencyKey } });
            if (existing)
                return existing;
            const [user, item, wallet] = await Promise.all([
                tx.user.findUnique({ where: { id: userId }, select: { kycStatus: true } }),
                tx.shopItem.findUnique({ where: { id: itemId } }),
                tx.walletAccount.findUnique({ where: { userId } }),
            ]);
            if (!user || user.kycStatus !== "APPROVED") {
                throw new common_1.BadRequestException("KYC harus disetujui sebelum membeli item.");
            }
            if (!item || !item.isActive)
                throw new common_1.NotFoundException("Item shop tidak ditemukan.");
            if (item.stock !== null && item.stock <= 0)
                throw new common_1.ConflictException("Stok item habis.");
            const flashActive = item.flashSalePrice !== null && item.flashSaleEnd && item.flashSaleEnd > new Date();
            const price = flashActive ? item.flashSalePrice : item.price;
            if (!wallet || wallet.balance - wallet.pendingHold < price) {
                throw new common_1.BadRequestException("Saldo Crown Coin tidak mencukupi.");
            }
            const purchase = await tx.shopTransaction.create({
                data: { userId, shopItemId: item.id, pricePaid: price, idempotencyKey },
            });
            await tx.walletAccount.update({
                where: { id: wallet.id },
                data: { balance: { decrement: price }, totalSpent: { increment: price } },
            });
            await tx.walletTransaction.create({
                data: {
                    walletId: wallet.id,
                    type: "SHOP_PURCHASE",
                    amount: price,
                    description: `Pembelian ${item.name}`,
                    referenceId: purchase.id,
                    idempotencyKey: `wallet-${idempotencyKey}`,
                },
            });
            if (item.cosmeticId) {
                await tx.userCosmetic.upsert({
                    where: { userId_cosmeticId: { userId, cosmeticId: item.cosmeticId } },
                    update: {},
                    create: { userId, cosmeticId: item.cosmeticId, obtainedFrom: "shop" },
                });
            }
            if (item.stock !== null) {
                await tx.shopItem.update({ where: { id: item.id }, data: { stock: { decrement: 1 } } });
            }
            return purchase;
        });
        await this.prisma.notification.create({
            data: {
                userId,
                type: "CASHBACK_RECEIVED",
                payload: { kind: "SHOP_PURCHASE", itemId, transactionId: result.id },
            },
        });
        return result;
    }
};
exports.ShopService = ShopService;
exports.ShopService = ShopService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ShopService);
//# sourceMappingURL=shop.service.js.map