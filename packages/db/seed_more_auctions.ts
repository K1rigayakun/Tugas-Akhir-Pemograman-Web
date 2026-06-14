import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const NEW_AUCTIONS = [
  {
    title: "The Phantom Chariot",
    description: "Kereta kencana peninggalan bangsa Phantom. Dikatakan bisa berjalan menembus dimensi. Saat ini direstorasi secara sempurna.",
    category: "ARTIFACT",
    rarity: "TRANSCENDENT",
    auctionType: "STANDARD",
    status: "ACTIVE",
    startingPrice: 500000,
    currentPrice: 500000,
    minimumIncrement: 10000,
    startTime: new Date(),
    endTime: new Date(Date.now() + 86400000 * 4), // +4 days
    imageUrls: ["https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&q=80"],
  },
  {
    title: "Aegis Shield of Valor",
    description: "Perisai baja putih yang konon menahan nafas naga. Beratnya hampir 1 ton, hanya bisa diangkat oleh ksatria sejati.",
    category: "WEAPON",
    rarity: "LEGENDARY",
    auctionType: "STANDARD",
    status: "ACTIVE",
    startingPrice: 80000,
    currentPrice: 80000,
    minimumIncrement: 2000,
    startTime: new Date(),
    endTime: new Date(Date.now() + 86400000 * 2), // +2 days
    imageUrls: ["https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?w=800&q=80"],
  },
  {
    title: "Eye of the Leviathan",
    description: "Mutiara raksasa seukuran bola basket, diambil dari dasar laut terdalam. Bersinar kebiruan di malam hari.",
    category: "ARTIFACT",
    rarity: "EPIC",
    auctionType: "LIVE",
    status: "UPCOMING",
    startingPrice: 30000,
    currentPrice: 30000,
    minimumIncrement: 1000,
    startTime: new Date(Date.now() + 86400000 * 1), // Starts in 1 day
    endTime: new Date(Date.now() + 86400000 * 3), // Ends in 3 days
    imageUrls: ["https://images.unsplash.com/photo-1590403757659-1bc9de564175?w=800&q=80"],
  },
  {
    title: "Tears of the Forest Spirit",
    description: "Botol kecil berisi cairan hijau bercahaya. Menurut legenda, satu tetesnya dapat menyembuhkan segala penyakit mematikan.",
    category: "ART",
    rarity: "LEGENDARY",
    auctionType: "SEALED_CHEST",
    status: "ACTIVE",
    startingPrice: 150000,
    currentPrice: 150000,
    minimumIncrement: 5000,
    startTime: new Date(),
    endTime: new Date(Date.now() + 86400000 * 5),
    isSealed: true,
    imageUrls: ["https://images.unsplash.com/photo-1590212356877-3e4b78913b82?w=800&q=80"],
  },
  {
    title: "Cursed Ruby of the Sands",
    description: "Permata merah darah dari kuil padang pasir. Konon membawa kesialan bagi siapa pun yang menyentuhnya secara langsung.",
    category: "ARTIFACT",
    rarity: "EPIC",
    auctionType: "DESCENDING",
    status: "ACTIVE",
    startingPrice: 200000,
    currentPrice: 200000,
    minimumPrice: 50000,
    decrementAmount: 5000,
    minimumIncrement: 1000,
    startTime: new Date(),
    endTime: new Date(Date.now() + 86400000 * 1),
    imageUrls: ["https://images.unsplash.com/photo-1610488972847-f472f8dd6069?w=800&q=80"],
  },
  {
    title: "Gauntlets of the Titan",
    description: "Sarung tangan besi dengan ukiran dewa kuno. Memberikan kekuatan destruktif yang tidak terbatas.",
    category: "WEAPON",
    rarity: "LEGENDARY",
    auctionType: "STANDARD",
    status: "ACTIVE",
    startingPrice: 250000,
    currentPrice: 250000,
    minimumIncrement: 10000,
    startTime: new Date(),
    endTime: new Date(Date.now() + 86400000 * 2),
    imageUrls: ["https://images.unsplash.com/photo-1614026480418-ba01a613be3b?w=800&q=80"],
  },
  {
    title: "Tome of Forbidden Spells",
    description: "Buku sihir kuno yang ditulis dengan darah iblis. Halamannya terbakar tapi tak pernah habis.",
    category: "ARTIFACT",
    rarity: "TRANSCENDENT",
    auctionType: "STANDARD",
    status: "UPCOMING",
    startingPrice: 500000,
    currentPrice: 500000,
    minimumIncrement: 20000,
    startTime: new Date(Date.now() + 86400000 * 2), // Starts in 2 days
    endTime: new Date(Date.now() + 86400000 * 7),
    imageUrls: ["https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&q=80"],
  },
  {
    title: "Silver Pegasus Wings",
    description: "Sayap mekanik berlapis perak murni peninggalan teknologi era sebelum runtuh.",
    category: "ART",
    rarity: "EPIC",
    auctionType: "STANDARD",
    status: "ACTIVE",
    startingPrice: 60000,
    currentPrice: 75000,
    minimumIncrement: 2000,
    startTime: new Date(),
    endTime: new Date(Date.now() + 86400000 * 3),
    imageUrls: ["https://images.unsplash.com/photo-1502444330042-d1a1ddf9bb5b?w=800&q=80"],
  },
];

async function main() {
  console.log("Seeding more auctions...");
  
  for (const item of NEW_AUCTIONS) {
    await prisma.auction.create({
      data: item as any
    });
    console.log(`Created auction: ${item.title}`);
  }

  console.log("Finished seeding more auctions.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
