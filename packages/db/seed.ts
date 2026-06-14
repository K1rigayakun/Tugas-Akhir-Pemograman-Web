import { PrismaClient, AdminRole, Rank, PrivacyMode, AuctionType, AuctionStatus, ItemRarity } from "@prisma/client";
import * as argon2 from "argon2";

/**
 * Database Seeder — Data demo realistis untuk development berdasarkan planning 1.
 *
 * Jalankan: npx ts-node packages/db/seed.ts
 */
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database (Realistic Data Version)...");

  const adminPassword = await argon2.hash("admin123!", { type: argon2.argon2id });
  const userPassword = await argon2.hash("user123!", { type: argon2.argon2id });

  // ============================================================
  // 1. ADMIN USERS
  // ============================================================

  await prisma.user.upsert({
    where: { email: "admin@emeraldkingdom.id" },
    update: { avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=Emperor" },
    create: {
      email: "admin@emeraldkingdom.id",
      username: "TheEmperor",
      passwordHash: adminPassword,
      emailVerified: true,
      rank: "EMPEROR",
      totalExp: 999999,
      kycStatus: "APPROVED",
      adminRole: "SUPER_ADMIN",
      avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=Emperor",
    },
  });

  await prisma.user.upsert({
    where: { email: "auction@emeraldkingdom.id" },
    update: { avatarUrl: "https://i.pravatar.cc/250?u=auctionmaster" },
    create: {
      email: "auction@emeraldkingdom.id",
      username: "AuctionMaster",
      passwordHash: adminPassword,
      emailVerified: true,
      rank: "DUKE",
      totalExp: 50000,
      kycStatus: "APPROVED",
      adminRole: "AUCTION_MANAGER",
      avatarUrl: "https://i.pravatar.cc/250?u=auctionmaster",
    },
  });

  // ============================================================
  // 2. REGULAR USERS (Sesuai Planning)
  // ============================================================

  const targetUsers = [
    { username: "DragonSlayer42", email: "dragon@demo.id", rank: "DUKE" as Rank, exp: 105000, priv: "PUBLIC" as PrivacyMode },
    { username: "The Silent Knight", email: "silent@demo.id", rank: "KNIGHT" as Rank, exp: 3500, priv: "ANONYMOUS" as PrivacyMode },
    { username: "CrystalMage", email: "mage@demo.id", rank: "BARON" as Rank, exp: 7200, priv: "PUBLIC" as PrivacyMode },
    { username: "ShadowBidder", email: "shadow@demo.id", rank: "EARL" as Rank, exp: 30000, priv: "SHADOW" as PrivacyMode },
    { username: "GoldenQueen", email: "queen@demo.id", rank: "SOVEREIGN" as Rank, exp: 280000, priv: "PUBLIC" as PrivacyMode },
    { username: "NoobTrader", email: "noob@demo.id", rank: "CIVIS" as Rank, exp: 100, priv: "PUBLIC" as PrivacyMode },
    { username: "SuspendedRonin", email: "ronin@demo.id", rank: "VISCOUNT" as Rank, exp: 15000, priv: "PUBLIC" as PrivacyMode, suspended: true },
    { username: "DukeOfWealth", email: "duke@demo.id", rank: "DUKE" as Rank, exp: 150000, priv: "PUBLIC" as PrivacyMode },
    { username: "MysteryWhale", email: "whale@demo.id", rank: "MARQUIS" as Rank, exp: 45000, priv: "SHADOW" as PrivacyMode },
    { username: "SirGalahad", email: "galahad@demo.id", rank: "KNIGHT" as Rank, exp: 4800, priv: "PUBLIC" as PrivacyMode },
  ];

  // Tambahkan 15 user random untuk memenuhi kuota 20+
  const ranks = ["CIVIS", "MERCHANT", "KNIGHT", "BARON", "VISCOUNT", "EARL", "MARQUIS", "DUKE"] as Rank[];
  for (let i = 1; i <= 15; i++) {
    targetUsers.push({
      username: `Wanderer${i * 77}`,
      email: `user${i}@demo.id`,
      rank: ranks[i % ranks.length],
      exp: i * 2000,
      priv: i % 4 === 0 ? "ANONYMOUS" : "PUBLIC",
    });
  }

  const createdUsers = [];
  for (const u of targetUsers) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${u.username.replace(/\s+/g, '')}`,
        isSuspended: u.suspended || false,
      },
      create: {
        email: u.email,
        username: u.username,
        passwordHash: userPassword,
        emailVerified: true,
        rank: u.rank,
        totalExp: u.exp,
        privacyMode: u.priv,
        kycStatus: "APPROVED",
        isSuspended: u.suspended || false,
        avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${u.username.replace(/\s+/g, '')}`,
      },
    });
    createdUsers.push(user);
    
    // Create Wallet
    await prisma.walletAccount.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        balance: user.rank === "CIVIS" ? 500 : (user.totalExp * 2), // random balance
        totalTopUp: user.totalExp * 2,
      },
    });
  }

  console.log("Users & Wallets created");

  // ============================================================
  // 3. AUCTION ITEMS (Sesuai Planning)
  // ============================================================
  await prisma.phantomBid.deleteMany({});
  await prisma.bid.deleteMany({});
  await prisma.auctionWatchlist.deleteMany({});
  await prisma.museumItem.deleteMany({});
  await prisma.delivery.deleteMany({});
  await prisma.auction.deleteMany({});

  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const next2Hours = new Date(now.getTime() + 2 * 60 * 60 * 1000);

  const auctionsData = [
    // Seni & Antik
    { title: "Lukisan 'Starry Night' Replika Limited", desc: "Replika bersertifikat dari karya master Van Gogh.", cat: "Seni & Antik", rarity: "EPIC" as ItemRarity, img: "https://upload.wikimedia.org/wikipedia/commons/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg", start: 5000, type: "STANDARD" as AuctionType, stat: "ACTIVE" as AuctionStatus, startTime: yesterday, endTime: tomorrow },
    { title: "Vas Dinasti Ming Replika", desc: "Vas keramik cantik bermotif biru putih era Dinasti Ming.", cat: "Seni & Antik", rarity: "RARE" as ItemRarity, img: "https://upload.wikimedia.org/wikipedia/commons/9/9f/Ming_vase.jpg", start: 2000, type: "STANDARD" as AuctionType, stat: "UPCOMING" as AuctionStatus, startTime: tomorrow, endTime: nextWeek },
    { title: "Patung Athena Bronze", desc: "Patung perunggu murni dewi kebijaksanaan Yunani.", cat: "Seni & Antik", rarity: "LEGENDARY" as ItemRarity, img: "https://upload.wikimedia.org/wikipedia/commons/0/07/Athena_Parthenos_Altemps_Inv8622_n2.jpg", start: 15000, type: "LIVE" as AuctionType, stat: "UPCOMING" as AuctionStatus, startTime: tomorrow, endTime: nextWeek },

    // Perhiasan
    { title: "Cincin Ruby Imperial", desc: "Cincin bertahtakan ruby merah darah yang sangat langka.", cat: "Perhiasan", rarity: "TRANSCENDENT" as ItemRarity, img: "https://upload.wikimedia.org/wikipedia/commons/1/1a/Gold_ring_with_diamonds.jpg", start: 50000, type: "LIVE" as AuctionType, stat: "ACTIVE" as AuctionStatus, startTime: yesterday, endTime: tomorrow },
    { title: "Kalung Emerald Sovereign", desc: "Kalung indah dengan batu zamrud besar di tengah.", cat: "Perhiasan", rarity: "EPIC" as ItemRarity, img: "https://upload.wikimedia.org/wikipedia/commons/7/77/Sapphire_ring.jpg", start: 25000, type: "DESCENDING" as AuctionType, stat: "ACTIVE" as AuctionStatus, startTime: yesterday, endTime: tomorrow },
    { title: "Jam Tangan Rolex Submariner Vintage", desc: "Rolex klasik incaran para kolektor.", cat: "Perhiasan", rarity: "LEGENDARY" as ItemRarity, img: "https://upload.wikimedia.org/wikipedia/commons/e/e5/Rolex_Submariner_114060.jpg", start: 30000, type: "STANDARD" as AuctionType, stat: "ENDED" as AuctionStatus, startTime: yesterday, endTime: now },

    // Kendaraan
    { title: "Porsche 911 Classic 1973", desc: "Mobil sport legendaris dari era 70-an.", cat: "Kendaraan", rarity: "TRANSCENDENT" as ItemRarity, img: "https://upload.wikimedia.org/wikipedia/commons/4/4b/Porsche_911_Carrera_RS_2.7.jpg", start: 150000, type: "RANK_EXCL" as AuctionType, stat: "UPCOMING" as AuctionStatus, startTime: tomorrow, endTime: nextWeek },
    { title: "Harley Davidson Heritage", desc: "Motor gede klasik untuk petualang sejati.", cat: "Kendaraan", rarity: "EPIC" as ItemRarity, img: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Harley-Davidson_Fatboy.jpg", start: 45000, type: "STANDARD" as AuctionType, stat: "ACTIVE" as AuctionStatus, startTime: yesterday, endTime: nextWeek },
    { title: "Ferrari F40", desc: "Supercar merah garang ikon tahun 80-an.", cat: "Kendaraan", rarity: "TRANSCENDENT" as ItemRarity, img: "https://upload.wikimedia.org/wikipedia/commons/c/cb/F40_Ferrari_20090509.jpg", start: 300000, type: "LIVE" as AuctionType, stat: "UPCOMING" as AuctionStatus, startTime: tomorrow, endTime: nextWeek },

    // Elektronik
    { title: "MacBook Pro M3 Max", desc: "Laptop buas untuk productivity tanpa batas.", cat: "Elektronik", rarity: "RARE" as ItemRarity, img: "https://upload.wikimedia.org/wikipedia/commons/9/90/Apple_MacBook_Pro_13_inch.jpg", start: 6000, type: "DESCENDING" as AuctionType, stat: "ACTIVE" as AuctionStatus, startTime: yesterday, endTime: tomorrow },
    { title: "Sony A7IV Camera Kit", desc: "Kamera mirrorless andalan kreator konten.", cat: "Elektronik", rarity: "RARE" as ItemRarity, img: "https://upload.wikimedia.org/wikipedia/commons/1/13/Sony_Alpha_7_IV.jpg", start: 4000, type: "STANDARD" as AuctionType, stat: "UPCOMING" as AuctionStatus, startTime: tomorrow, endTime: nextWeek },
    { title: "PS5 Pro Limited Edition", desc: "Konsol gaming generasi terbaru edisi khusus.", cat: "Elektronik", rarity: "UNCOMMON" as ItemRarity, img: "https://upload.wikimedia.org/wikipedia/commons/1/1b/PlayStation_5_and_DualSense_with_disc.jpg", start: 1500, type: "SEALED_CHEST" as AuctionType, stat: "ACTIVE" as AuctionStatus, startTime: yesterday, endTime: next2Hours },

    // Fashion
    { title: "Hermes Birkin Bag", desc: "Tas desainer paling dicari di seluruh dunia.", cat: "Fashion", rarity: "LEGENDARY" as ItemRarity, img: "https://upload.wikimedia.org/wikipedia/commons/2/23/Herm%C3%A8s_Birkin_bag.jpg", start: 40000, type: "STANDARD" as AuctionType, stat: "ACTIVE" as AuctionStatus, startTime: yesterday, endTime: tomorrow },
    { title: "Nike Air Jordan 1 OG", desc: "Sneaker basket paling ikonik sepanjang masa.", cat: "Fashion", rarity: "EPIC" as ItemRarity, img: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Air_Jordan_1_Bred.jpg", start: 5000, type: "LIVE" as AuctionType, stat: "ACTIVE" as AuctionStatus, startTime: yesterday, endTime: tomorrow },
    { title: "Rolex Daytona", desc: "Jam tangan racing kelas atas dari Rolex.", cat: "Fashion", rarity: "LEGENDARY" as ItemRarity, img: "https://upload.wikimedia.org/wikipedia/commons/8/87/Rolex_Cosmograph_Daytona.jpg", start: 35000, type: "DESCENDING" as AuctionType, stat: "UPCOMING" as AuctionStatus, startTime: tomorrow, endTime: nextWeek },

    // Gaming & Hobi
    { title: "Pokemon Card Charizard 1st Edition", desc: "Kartu TCG Pokemon termahal sedunia.", cat: "Gaming & Hobi", rarity: "LEGENDARY" as ItemRarity, img: "https://upload.wikimedia.org/wikipedia/commons/2/22/Charizard.jpg", start: 20000, type: "STANDARD" as AuctionType, stat: "ACTIVE" as AuctionStatus, startTime: yesterday, endTime: tomorrow },
    { title: "LEGO Star Wars UCS Millennium Falcon", desc: "Set LEGO raksasa yang sangat detail.", cat: "Gaming & Hobi", rarity: "EPIC" as ItemRarity, img: "https://upload.wikimedia.org/wikipedia/commons/a/af/Lego_Star_Wars.jpg", start: 2000, type: "STANDARD" as AuctionType, stat: "ENDED" as AuctionStatus, startTime: yesterday, endTime: now },
    { title: "Gundam PG Unicorn", desc: "Model kit Gundam berskala Perfect Grade.", cat: "Gaming & Hobi", rarity: "RARE" as ItemRarity, img: "https://upload.wikimedia.org/wikipedia/commons/6/64/Gundam_RX-78-2.jpg", start: 800, type: "STANDARD" as AuctionType, stat: "ACTIVE" as AuctionStatus, startTime: yesterday, endTime: tomorrow },

    // Olahraga
    { title: "Jersey Messi Bertandatangan", desc: "Jersey original yang ditandatangani oleh La Pulga.", cat: "Olahraga", rarity: "LEGENDARY" as ItemRarity, img: "https://upload.wikimedia.org/wikipedia/commons/1/18/Lionel-Messi-Argentina-2022-FIFA-World-Cup_%28cropped%29.jpg", start: 12000, type: "LIVE" as AuctionType, stat: "UPCOMING" as AuctionStatus, startTime: tomorrow, endTime: nextWeek },
    { title: "Bola Piala Dunia 2022 Official", desc: "Bola Al Rihla resmi yang dipakai di pertandingan.", cat: "Olahraga", rarity: "EPIC" as ItemRarity, img: "https://upload.wikimedia.org/wikipedia/commons/d/de/Al_Rihla_World_Cup_2022_ball.jpg", start: 2500, type: "STANDARD" as AuctionType, stat: "ACTIVE" as AuctionStatus, startTime: yesterday, endTime: tomorrow },

    // Item Bertema Medieval
    { title: "Pedang Excalibur Replika", desc: "Replika 1:1 pedang legendaris King Arthur.", cat: "Medieval", rarity: "LEGENDARY" as ItemRarity, img: "https://upload.wikimedia.org/wikipedia/commons/4/4c/Sword_of_state.jpg", start: 10000, type: "RANK_EXCL" as AuctionType, stat: "ACTIVE" as AuctionStatus, startTime: yesterday, endTime: tomorrow },
    { title: "Mahkota Kerajaan Gold Plated", desc: "Mahkota raja berlapis emas asli dengan batu rubi.", cat: "Medieval", rarity: "TRANSCENDENT" as ItemRarity, img: "https://upload.wikimedia.org/wikipedia/commons/4/4e/Crown_of_Saint_Edward_%281661%29.jpg", start: 40000, type: "LIVE" as AuctionType, stat: "ACTIVE" as AuctionStatus, startTime: yesterday, endTime: tomorrow },
    { title: "Baju Zirah Knight Full Set", desc: "Armor tempur lengkap era abad pertengahan.", cat: "Medieval", rarity: "EPIC" as ItemRarity, img: "https://upload.wikimedia.org/wikipedia/commons/2/2c/Armour_of_Ferdinand_I%2C_Holy_Roman_Emperor.jpg", start: 15000, type: "STANDARD" as AuctionType, stat: "UPCOMING" as AuctionStatus, startTime: tomorrow, endTime: nextWeek },
    { title: "Perisai Templar", desc: "Perisai ksatria templar bersejarah tinggi.", cat: "Medieval", rarity: "RARE" as ItemRarity, img: "https://upload.wikimedia.org/wikipedia/commons/0/07/Templar_shield.svg", start: 5000, type: "SEALED_CHEST" as AuctionType, stat: "ACTIVE" as AuctionStatus, startTime: yesterday, endTime: tomorrow },
  ];

  const createdAuctions = [];
  for (const auc of auctionsData) {
    const created = await prisma.auction.create({
      data: {
        title: auc.title,
        description: auc.desc,
        category: auc.cat,
        rarity: auc.rarity,
        auctionType: auc.type,
        status: auc.stat,
        startingPrice: auc.start,
        currentPrice: auc.stat === "ACTIVE" ? auc.start + 500 : 0,
        minimumIncrement: 500,
        minimumPrice: auc.type === "DESCENDING" ? auc.start / 2 : undefined,
        decrementAmount: auc.type === "DESCENDING" ? 100 : undefined,
        startTime: auc.startTime,
        endTime: auc.endTime,
        minimumRank: auc.type === "RANK_EXCL" ? "VISCOUNT" : "CIVIS",
        isSealed: auc.type === "SEALED_CHEST",
        imageUrls: [auc.img],
      }
    });
    createdAuctions.push(created);
  }

  // Tambahkan dummy sisa (agar > 30 items)
  for (let i = 1; i <= 6; i++) {
    await prisma.auction.create({
      data: {
        title: `Mystery Vault Treasure #${i}`,
        description: `Harta karun dari deep vault emerald kingdom.`,
        category: "Mystery",
        rarity: "UNCOMMON",
        auctionType: "STANDARD",
        status: "ACTIVE",
        startingPrice: 1000,
        currentPrice: 1000,
        minimumIncrement: 100,
        startTime: yesterday,
        endTime: nextWeek,
        imageUrls: ["https://upload.wikimedia.org/wikipedia/commons/7/7f/Treasure_chest_01.jpg"],
      }
    });
  }

  console.log("Auction items created");

  // ============================================================
  // 4. BIDS HISTORY
  // ============================================================
  // Simulasikan bid history pada auction yang aktif
  const activeAuctions = createdAuctions.filter(a => a.status === "ACTIVE");
  const randomUsers = createdUsers.slice(0, 5); // 5 top user

  if (activeAuctions.length > 0 && randomUsers.length > 1) {
    // Lelang 1 (Sengit)
    const auc1 = activeAuctions[0];
    await prisma.bid.create({ data: { auctionId: auc1.id, userId: randomUsers[0].id, amount: auc1.startingPrice + 500, placedAt: new Date(now.getTime() - 10000) }});
    await prisma.bid.create({ data: { auctionId: auc1.id, userId: randomUsers[1].id, amount: auc1.startingPrice + 1000, placedAt: new Date(now.getTime() - 5000) }});
    await prisma.bid.create({ data: { auctionId: auc1.id, userId: randomUsers[0].id, amount: auc1.startingPrice + 1500, placedAt: new Date(now.getTime() - 1000) }});
    await prisma.auction.update({ where: { id: auc1.id }, data: { currentPrice: auc1.startingPrice + 1500 }});

    // Lelang 2 (Baru 1 bid)
    const auc2 = activeAuctions[1];
    await prisma.bid.create({ data: { auctionId: auc2.id, userId: randomUsers[2].id, amount: auc2.startingPrice + 500, placedAt: new Date(now.getTime() - 20000) }});
    await prisma.auction.update({ where: { id: auc2.id }, data: { currentPrice: auc2.startingPrice + 500 }});
  }

  console.log("Bid history created");

  // ============================================================
  // 5. ACHIEVEMENTS & NOTIFICATIONS
  // ============================================================

  const achievements = [
    { name: "First Blood", description: "Menang lelang pertama", tier: "COMMON" as const, trigger: "AUCTION_WON", condition: { count: 1 }, expReward: 100, titleReward: "The Initiate" },
    { name: "Streak Master", description: "Win streak 5 kali", tier: "RARE" as const, trigger: "WIN_STREAK", condition: { streak: 5 }, expReward: 500, titleReward: "The Relentless" },
  ];

  const achRecords = [];
  for (const ach of achievements) {
    achRecords.push(await prisma.achievement.upsert({ where: { name: ach.name }, update: {}, create: ach }));
  }

  // Beri achievement ke DragonSlayer42
  const dragon = createdUsers.find(u => u.username === "DragonSlayer42");
  if (dragon && achRecords[0]) {
    await prisma.userAchievement.upsert({
      where: { userId_achievementId: { userId: dragon.id, achievementId: achRecords[0].id } },
      update: {},
      create: { userId: dragon.id, achievementId: achRecords[0].id, unlockedAt: now }
    });
    // Kirim notifikasi
    await prisma.notification.create({
      data: {
        userId: dragon.id,
        payload: { title: "Achievement Unlocked!", message: "Kamu membuka 'First Blood'." },
        type: "NEW_ACHIEVEMENT",
      }
    });
    await prisma.notification.create({
      data: {
        userId: dragon.id,
        payload: { title: "Item Lelang Tiba", message: "Mahkota raja emas telah dikirim ke alamatmu." },
        type: "YOU_WON",
      }
    });
  }

  console.log("Achievements & Notifications created");

  console.log("\nSeeding complete!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
