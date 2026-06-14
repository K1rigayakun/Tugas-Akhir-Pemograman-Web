import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const allAuctions = await prisma.auction.findMany();
  const emptyAuctions = allAuctions.filter(a => !a.imageUrls || a.imageUrls.length === 0);

  const placeholders = [
    "https://images.unsplash.com/photo-1605806616949-1e87b487bc2a?w=800&q=80",
    "https://images.unsplash.com/photo-1599839619722-39751411ea63?w=800&q=80",
    "https://images.unsplash.com/photo-1522223832742-5ba0534c05cb?w=800&q=80",
    "https://images.unsplash.com/photo-1596492348545-06a59b6572e9?w=800&q=80",
    "https://images.unsplash.com/photo-1453230806017-56d81464b6c5?w=800&q=80"
  ];

  for (let i = 0; i < emptyAuctions.length; i++) {
    await prisma.auction.update({
      where: { id: emptyAuctions[i].id },
      data: {
        imageUrls: [placeholders[i % placeholders.length]]
      }
    });
  }

  console.log(`Fixed ${emptyAuctions.length} auctions with empty images`);
}

main().finally(() => prisma.$disconnect());
