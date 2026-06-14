import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MuseumService {
  constructor(private prisma: PrismaService) {}

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

  async getMuseumItems(limit: number) {
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
}
