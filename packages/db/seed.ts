import { PrismaClient, AdminRole } from "@prisma/client";
import * as argon2 from "argon2";

/**
 * Database Seeder — Data demo untuk development.
 *
 * Jalankan: npx ts-node packages/db/seed.ts
 *
 * Data yang di-seed:
 * - 1 Super Admin + 1 Auction Manager + 1 KYC Officer
 * - 5 User dengan rank berbeda
 * - 5 Achievement
 * - 10 Auction (berbagai tipe dan status)
 * - Wallet untuk semua user
 * - Beberapa bid dan transaksi
 */
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // ============================================================
  // 1. ADMIN USERS
  // ============================================================

  const adminPassword = await argon2.hash("admin123!", {
    type: argon2.argon2id,
  });

  const superAdmin = await prisma.user.upsert({
    where: { email: "admin@emeraldkingdom.id" },
    update: {
      adminRole: "SUPER_ADMIN" as AdminRole,
    },
    create: {
      email: "admin@emeraldkingdom.id",
      username: "TheEmperor",
      passwordHash: adminPassword,
      emailVerified: true,
      rank: "EMPEROR",
      totalExp: 99999,
      kycStatus: "APPROVED",
      adminRole: "SUPER_ADMIN" as AdminRole,
    },
  });

  const auctionManager = await prisma.user.upsert({
    where: { email: "auction@emeraldkingdom.id" },
    update: {
      adminRole: "AUCTION_MANAGER" as AdminRole,
    },
    create: {
      email: "auction@emeraldkingdom.id",
      username: "AuctionMaster",
      passwordHash: adminPassword,
      emailVerified: true,
      rank: "DUKE",
      totalExp: 50000,
      kycStatus: "APPROVED",
      adminRole: "AUCTION_MANAGER" as AdminRole,
    },
  });

  const kycOfficer = await prisma.user.upsert({
    where: { email: "kyc@emeraldkingdom.id" },
    update: {
      adminRole: "KYC_OFFICER" as AdminRole,
    },
    create: {
      email: "kyc@emeraldkingdom.id",
      username: "KYCOfficer",
      passwordHash: adminPassword,
      emailVerified: true,
      rank: "MARQUIS",
      totalExp: 30000,
      kycStatus: "APPROVED",
      adminRole: "KYC_OFFICER" as AdminRole,
    },
  });

  console.log("Admin users created");

  // ============================================================
  // 2. REGULAR USERS
  // ============================================================

  const userPassword = await argon2.hash("user123!", { type: argon2.argon2id });

  const users = [];
  const userData = [
    { email: "knight@demo.id", username: "SirLancelot", rank: "KNIGHT" as const, exp: 2000 },
    { email: "baron@demo.id", username: "BaronVonDuke", rank: "BARON" as const, exp: 5000 },
    { email: "earl@demo.id", username: "EarlGrey", rank: "EARL" as const, exp: 15000 },
    { email: "marquis@demo.id", username: "MarquisDeSade", rank: "MARQUIS" as const, exp: 30000 },
    { email: "civis@demo.id", username: "NewCivis", rank: "CIVIS" as const, exp: 0 },
  ];

  for (const u of userData) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        username: u.username,
        passwordHash: userPassword,
        emailVerified: true,
        rank: u.rank,
        totalExp: u.exp,
        kycStatus: "APPROVED",
      },
    });
    users.push(user);
  }

  console.log("Regular users created");

  // ============================================================
  // 3. WALLET ACCOUNTS
  // ============================================================

  const allUsers = [superAdmin, auctionManager, kycOfficer, ...users];

  for (const user of allUsers) {
    await prisma.walletAccount.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        balance: user.rank === "CIVIS" ? 1000 : 50000,
        totalTopUp: user.rank === "CIVIS" ? 1000 : 50000,
      },
    });
  }

  console.log("Wallet accounts created");

  // ============================================================
  // 4. ACHIEVEMENTS
  // ============================================================

  const achievements = [
    {
      name: "First Blood",
      description: "Menang lelang pertama kali",
      tier: "COMMON" as const,
      trigger: "AUCTION_WON",
      condition: { count: 1 },
      expReward: 100,
      titleReward: "The Initiate",
    },
    {
      name: "Streak Master",
      description: "Win streak 5 kali berturut-turut",
      tier: "RARE" as const,
      trigger: "WIN_STREAK",
      condition: { streak: 5 },
      expReward: 500,
      titleReward: "The Relentless",
    },
    {
      name: "High Roller",
      description: "Habiskan total 100,000 CC",
      tier: "EPIC" as const,
      trigger: "TOTAL_SPENT",
      condition: { amount: 100000 },
      expReward: 1000,
      titleReward: "The Magnate",
    },
    {
      name: "Bid Commander",
      description: "Pasang 100 bid total",
      tier: "RARE" as const,
      trigger: "TOTAL_BIDS",
      condition: { count: 100 },
      expReward: 300,
    },
    {
      name: "Night Owl",
      description: "Menang lelang yang berakhir antara 00:00-05:00",
      tier: "COMMON" as const,
      trigger: "LATE_NIGHT_WIN",
      condition: { hourRange: [0, 5] },
      expReward: 150,
      titleReward: "The Nocturnal",
    },
  ];

  for (const ach of achievements) {
    await prisma.achievement.upsert({
      where: { name: ach.name },
      update: {},
      create: ach,
    });
  }

  console.log("Achievements created");

  // ============================================================
  // 5. SAMPLE AUCTIONS
  // ============================================================

  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const auctions = [
    {
      title: "Ancient Dragon Scale Shield",
      description: "Perisai legendaris yang terbuat dari sisik naga purba. Ditemukan di Gua Kristal Utara.",
      category: "Weapons & Armor",
      rarity: "LEGENDARY" as const,
      auctionType: "STANDARD" as const,
      status: "ACTIVE" as const,
      startingPrice: 5000,
      currentPrice: 12500,
      minimumIncrement: 500,
      startTime: yesterday,
      endTime: tomorrow,
      imageUrls: [],
    },
    {
      title: "Royal Crown of Elysia",
      description: "Mahkota kerajaan yang dipakai oleh dinasti Elysia selama 300 tahun.",
      category: "Royal Artifacts",
      rarity: "TRANSCENDENT" as const,
      auctionType: "LIVE" as const,
      status: "UPCOMING" as const,
      startingPrice: 50000,
      currentPrice: 0,
      minimumIncrement: 5000,
      startTime: tomorrow,
      endTime: nextWeek,
      imageUrls: [],
    },
    {
      title: "Enchanted Sapphire Ring",
      description: "Cincin safir yang konon bisa memberikan keberuntungan dalam perdagangan.",
      category: "Jewelry",
      rarity: "EPIC" as const,
      auctionType: "DESCENDING" as const,
      status: "ACTIVE" as const,
      startingPrice: 20000,
      currentPrice: 15000,
      minimumIncrement: 1000,
      minimumPrice: 5000,
      decrementAmount: 1000,
      startTime: yesterday,
      endTime: tomorrow,
      imageUrls: [],
    },
    {
      title: "Mystery Sealed Chest #7",
      description: "Peti misterius dari reruntuhan Kastil Obsidian. Isinya tidak diketahui sampai lelang berakhir.",
      category: "Mystery",
      rarity: "RARE" as const,
      auctionType: "SEALED_CHEST" as const,
      status: "ACTIVE" as const,
      startingPrice: 3000,
      currentPrice: 7500,
      minimumIncrement: 250,
      isSealed: true,
      startTime: yesterday,
      endTime: tomorrow,
      imageUrls: [],
    },
    {
      title: "Emerald Kingdom Founding Scroll",
      description: "Scroll asli pendirian kerajaan. Hanya tersedia untuk Marquis ke atas.",
      category: "Historical",
      rarity: "LEGENDARY" as const,
      auctionType: "RANK_EXCL" as const,
      status: "UPCOMING" as const,
      startingPrice: 100000,
      currentPrice: 0,
      minimumIncrement: 10000,
      minimumRank: "MARQUIS" as const,
      startTime: nextWeek,
      endTime: new Date(nextWeek.getTime() + 3 * 24 * 60 * 60 * 1000),
      imageUrls: [],
    },
  ];

  for (const auc of auctions) {
    await prisma.auction.create({ data: auc });
  }

  console.log("Auctions created");

  // ============================================================
  // 6. DAILY QUESTS
  // ============================================================

  const quests = [
    {
      title: "First Bid of the Day",
      description: "Pasang minimal 1 bid hari ini",
      condition: { type: "BID_COUNT", count: 1 },
      expReward: 50,
    },
    {
      title: "Explorer",
      description: "Kunjungi 5 halaman lelang yang berbeda",
      condition: { type: "PAGE_VISIT", count: 5 },
      expReward: 30,
    },
    {
      title: "Watchlist Curator",
      description: "Tambahkan 3 item ke watchlist",
      condition: { type: "WATCHLIST_ADD", count: 3 },
      expReward: 20,
    },
  ];

  for (const q of quests) {
    await prisma.dailyQuest.create({ data: q });
  }

  console.log("Daily quests created");

  // ============================================================
  // 7. SAMPLE EVENT
  // ============================================================

  await prisma.event.create({
    data: {
      name: "The Grand Coronation",
      theme: "coronation",
      backgroundMode: "golden_particles",
      accentColors: ["#FFD700", "#B8860B"],
      expMultiplier: 2.0,
      startTime: now,
      endTime: nextWeek,
      isActive: true,
    },
  });

  console.log("Events created");

  // ============================================================
  // 8. COSMETICS & SHOP ITEMS
  // ============================================================

  const cosmetics = [
    {
      name: "The Emperor's Aura",
      type: "WEB_CODE" as const,
      rarity: "MYTHIC" as const,
      webCode: "body { background: linear-gradient(45deg, #FFD700 0%, #000 100%) !important; color: #FFF; }",
      imageUrl: "",
    },
    {
      name: "Abyssal Void",
      type: "WEB_CODE" as const,
      rarity: "EPIC" as const,
      webCode: "body { background: #0a0a0a !important; color: #b0b0b0; } .panel { border-color: #333 !important; box-shadow: 0 0 10px rgba(255,0,0,0.2) !important; }",
      imageUrl: "",
    },
    {
      name: "Emerald Glow",
      type: "WEB_CODE" as const,
      rarity: "RARE" as const,
      webCode: "body { background-color: #001a11 !important; } h1, h2, h3 { color: #00ff88 !important; text-shadow: 0 0 5px rgba(0,255,136,0.5); }",
      imageUrl: "",
    }
  ];

  const createdCosmetics = [];
  for (const c of cosmetics) {
    const created = await prisma.cosmetic.upsert({
      where: { name: c.name },
      update: c,
      create: c,
    });
    createdCosmetics.push(created);
  }

  const shopItems = [
    {
      name: "The Emperor's Aura Theme",
      type: "BANNER" as const,
      price: 150000,
      cosmeticId: createdCosmetics[0].id,
      isActive: true,
      isLimited: true,
      stock: 5,
    },
    {
      name: "Abyssal Void Theme",
      type: "AVATAR_FRAME" as const,
      price: 50000,
      cosmeticId: createdCosmetics[1].id,
      isActive: true,
    },
    {
      name: "Emerald Glow Theme",
      type: "BANNER" as const,
      price: 25000,
      flashSalePrice: 15000,
      flashSaleEnd: new Date(now.getTime() + 2 * 60 * 60 * 1000), // 2 jam dari sekarang
      cosmeticId: createdCosmetics[2].id,
      isActive: true,
    }
  ];

  await prisma.shopItem.deleteMany({});
  for (const s of shopItems) {
    await prisma.shopItem.create({ data: s });
  }

  console.log("Cosmetics and Shop Items created");

  console.log("\nSeeding complete!");
  console.log("Login credentials:");
  console.log("  Super Admin: admin@emeraldkingdom.id / admin123!");
  console.log("  Auction Mgr: auction@emeraldkingdom.id / admin123!");
  console.log("  KYC Officer: kyc@emeraldkingdom.id / admin123!");
  console.log("  Regular User: knight@demo.id / user123!");
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
