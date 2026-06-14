import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const auctions = await prisma.auction.findMany();

  for (let i = 0; i < auctions.length; i++) {
    const a = auctions[i];
    let needsUpdate = false;
    let newUrls = [...a.imageUrls];

    if (newUrls.length === 0) {
      needsUpdate = true;
      newUrls = [`https://picsum.photos/seed/${a.id}/800/600`];
    } else {
      for (let j = 0; j < newUrls.length; j++) {
        if (newUrls[j].includes('unsplash')) {
          needsUpdate = true;
          newUrls[j] = `https://picsum.photos/seed/${a.id}_${j}/800/600`;
        }
      }
    }

    if (needsUpdate) {
      await prisma.auction.update({
        where: { id: a.id },
        data: { imageUrls: newUrls }
      });
    }
  }

  console.log("Images fixed!");
}

main().finally(() => prisma.$disconnect());
