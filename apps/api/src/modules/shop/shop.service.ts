import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class ShopService {
  constructor(private readonly prisma: PrismaService) {}

  list(type?: string) {
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

  async purchase(userId: string, itemId: string, idempotencyKey: string) {
    if (!idempotencyKey?.trim()) throw new BadRequestException("idempotencyKey wajib diisi.");

    const result = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.shopTransaction.findUnique({ where: { idempotencyKey } });
      if (existing) return existing;

      const [user, item, wallet] = await Promise.all([
        tx.user.findUnique({ where: { id: userId }, select: { kycStatus: true } }),
        tx.shopItem.findUnique({ where: { id: itemId } }),
        tx.walletAccount.findUnique({ where: { userId } }),
      ]);
      if (!user || user.kycStatus !== "APPROVED") {
        throw new BadRequestException("KYC harus disetujui sebelum membeli item.");
      }
      if (!item || !item.isActive) throw new NotFoundException("Item shop tidak ditemukan.");
      if (item.stock !== null && item.stock <= 0) throw new ConflictException("Stok item habis.");
      const flashActive = item.flashSalePrice !== null && item.flashSaleEnd && item.flashSaleEnd > new Date();
      const price = flashActive ? item.flashSalePrice! : item.price;
      if (!wallet || wallet.balance - wallet.pendingHold < price) {
        throw new BadRequestException("Saldo Crown Coin tidak mencukupi.");
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
}
