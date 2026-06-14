import { Injectable, BadRequestException } from '@nestjs/common';
import { prisma } from '@emerald-kingdom/db';

@Injectable()
export class VaultService {
  async submitItem(userId: string, data: { title: string; description: string; rarity: string; startingPrice: number; imageUrls: string[] }) {
    if (!data.title || !data.description || !data.startingPrice || !data.imageUrls?.length) {
      throw new BadRequestException("Data pengajuan tidak lengkap.");
    }
    
    return prisma.vaultSubmission.create({
      data: {
        userId,
        title: data.title,
        description: data.description,
        rarity: data.rarity || 'COMMON',
        startingPrice: data.startingPrice,
        imageUrls: data.imageUrls,
        status: 'PENDING'
      }
    });
  }

  async getMySubmissions(userId: string) {
    return prisma.vaultSubmission.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }
}
