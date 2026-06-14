const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const auctions = [];
  for (let i = 1; i <= 5; i++) {
    auctions.push({
      title: 'Koleksi Antik #' + i,
      description: 'Sebuah mahakarya dari zaman kuno yang memancarkan aura mistis.',
      category: 'Koleksi Barang Antik Bersejarah',
      rarity: 'LEGENDARY',
      auctionType: 'STANDARD',
      status: 'ACTIVE',
      startingPrice: 5000 * i,
      currentPrice: 5000 * i,
      minimumIncrement: 500 * i,
      startTime: new Date(),
      endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      minimumRank: i > 2 ? 'EARL' : 'CIVIS', // Gating logic
      imageUrls: ['https://loremflickr.com/300/200/antik?lock=' + i],
    });
  }

  // Emperor's Gala item
  auctions.push({
    title: "The Emperor's Gala Ticket",
    description: "Undangan eksklusif ke pelelangan paling bergengsi tahun ini.",
    category: "Lainnya",
    rarity: "TRANSCENDENT",
    auctionType: "RANK_EXCL",
    status: "UPCOMING",
    startingPrice: 100000,
    currentPrice: 100000,
    minimumIncrement: 5000,
    startTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    endTime: new Date(Date.now() + 26 * 60 * 60 * 1000), 
    minimumRank: 'EMPEROR', // Gating logic
    imageUrls: ['https://loremflickr.com/300/200/luxury?lock=999'],
  });

  for (const a of auctions) {
    await prisma.auction.create({ data: a });
  }
  console.log('Seeded ' + auctions.length + ' auctions.');
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
