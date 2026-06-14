import { PrismaClient, AuctionStatus, AuctionType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Museum Items...');

  // Pastikan ada Emperor rank user
  const user = await prisma.user.findFirst({
    where: { rank: 'EMPEROR' }
  });

  if (!user) {
    console.error("No EMPEROR user found, skipping museum seed.");
    return;
  }

  const pastAuctions = [
    {
      title: "The Sovereign's Crown",
      description: "Mahkota peninggalan Raja Pertama Aurum Imperium. Terbuat dari emas murni dan bertahtakan batu ruby sebesar kepalan tangan. Simbol kekuasaan absolut.",
      imageUrls: "https://images.unsplash.com/photo-1621360841013-c76831f1db87?q=80&w=800",
      rarity: "TRANSCENDENT",
      auctionType: "STANDARD",
      startingPrice: 5000000,
      currentPrice: 12500000,
      category: "Artifacts",
      status: "ENDED",
      winnerId: user.id,
      endTime: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 1 month ago
    },
    {
      title: "Blade of the Fallen King",
      description: "Pedang pusaka yang digunakan saat Perang Besar. Dipercaya memiliki aura yang dapat meredam emosi lawan. Ditempa oleh Master Blacksmith legendaris.",
      imageUrls: "https://images.unsplash.com/photo-1595590424283-b8f1784cb2c8?q=80&w=800",
      rarity: "LEGENDARY",
      auctionType: "STANDARD",
      startingPrice: 2000000,
      currentPrice: 8900000,
      category: "Weapons",
      status: "ENDED",
      winnerId: user.id,
      endTime: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
    },
    {
      title: "Celestial Astrolabe",
      description: "Alat navigasi kuno peninggalan ras Celestial yang telah punah. Tidak ada yang tahu cara kerjanya, namun selalu menunjuk ke arah harta karun tersembunyi.",
      imageUrls: "https://images.unsplash.com/photo-1534081333815-ae5019106622?q=80&w=800",
      rarity: "LEGENDARY",
      auctionType: "SEALED_CHEST",
      startingPrice: 1500000,
      currentPrice: 6500000,
      category: "Artifacts",
      status: "ENDED",
      winnerId: user.id,
      endTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    }
  ];

  for (const item of pastAuctions) {
    // Check if exists
    const existing = await prisma.auction.findFirst({ where: { title: item.title } });
    let auctionId = existing?.id;

    if (!existing) {
      const created = await prisma.auction.create({
        data: {
          title: item.title,
          description: item.description,
          imageUrls: [item.imageUrls],
          rarity: item.rarity as any,
          auctionType: item.auctionType as any,
          startingPrice: item.startingPrice,
          currentPrice: item.currentPrice,
          minimumIncrement: 100000,
          startTime: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
          endTime: item.endTime,
          category: item.category,
          status: item.status as any,
          winnerId: item.winnerId,
        }
      });
      auctionId = created.id;
    }

    if (auctionId) {
      await prisma.museumItem.upsert({
        where: { auctionId },
        update: {
          editorial: `Sebuah memorabilia yang mengingatkan kita pada kejayaan masa lalu. Berhasil diamankan oleh ${user.username}.`
        },
        create: {
          auctionId,
          editorial: `Sebuah memorabilia yang mengingatkan kita pada kejayaan masa lalu. Berhasil diamankan oleh ${user.username}.`
        }
      });
      console.log(`Added ${item.title} to Museum.`);
    }
  }

  console.log('Seeding Museum Items Complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
