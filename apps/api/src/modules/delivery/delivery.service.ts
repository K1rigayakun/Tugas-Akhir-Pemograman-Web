import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { NotifType } from '@prisma/client';

@Injectable()
export class DeliveryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  // --- ADDRESS MANAGEMENT ---

  async getUserAddress(userId: string) {
    return this.prisma.userAddress.findUnique({
      where: { userId },
    });
  }

  async upsertUserAddress(userId: string, data: { recipient: string; phoneNumber: string; address: string; city: string; province: string; postalCode: string }) {
    return this.prisma.userAddress.upsert({
      where: { userId },
      update: data,
      create: { ...data, userId },
    });
  }

  // --- DELIVERY TRACKING ---

  async getDeliveriesByUser(userId: string) {
    return this.prisma.delivery.findMany({
      where: { userId },
      include: {
        auction: {
          select: { title: true, imageUrls: true, rarity: true, finalPrice: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getAllDeliveries() {
    return this.prisma.delivery.findMany({
      include: {
        auction: { select: { title: true } },
        user: { select: { username: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async updateDeliveryStatus(id: string, adminId: string, status: string, trackingResi?: string, courier?: string) {
    const delivery = await this.prisma.delivery.findUnique({ where: { id } });
    if (!delivery) throw new NotFoundException("Delivery not found");

    const updateData: any = { status };
    if (trackingResi !== undefined) updateData.trackingResi = trackingResi;
    if (courier !== undefined) updateData.courier = courier;
    
    if (status === 'SHIPPED' && delivery.status !== 'SHIPPED') {
      updateData.shippedAt = new Date();
    } else if (status === 'DELIVERED' && delivery.status !== 'DELIVERED') {
      updateData.deliveredAt = new Date();
    }

    const updated = await this.prisma.delivery.update({
      where: { id },
      data: updateData
    });

    if (status === 'SHIPPED') {
      await this.notificationService.send(
        delivery.userId,
        NotifType.YOU_WON,
        { deliveryId: updated.id, message: `Barang lelang Anda telah dikirim! Resi: ${trackingResi || '-'}` }
      );
    }

    return updated;
  }

  // Called automatically when an auction ends and someone wins
  async createDeliveryForWinner(auctionId: string, userId: string) {
    const address = await this.prisma.userAddress.findUnique({ where: { userId } });
    if (!address) {
      return null; 
    }

    const existing = await this.prisma.delivery.findUnique({ where: { auctionId } });
    if (existing) return existing;

    const delivery = await this.prisma.delivery.create({
      data: {
        auctionId,
        userId,
        recipient: address.recipient,
        phoneNumber: address.phoneNumber,
        address: address.address,
        city: address.city,
        province: address.province,
        postalCode: address.postalCode,
        status: 'PENDING'
      }
    });

    return delivery;
  }
}
