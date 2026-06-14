import { PrismaClient, Rank, AchievementTier, CosmeticType, ObtainMethod } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database (Phase 4: Full Cosmetics & Flexing)...");

  // 1. Create Admin User
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@aurumimperium.com' },
    update: {},
    create: {
      email: 'admin@aurumimperium.com',
      username: 'admin',
      passwordHash: adminPassword,
      rank: Rank.EMPEROR,
      kycStatus: 'APPROVED',
      adminRole: 'SUPER_ADMIN',
    },
  });
  console.log(`Created admin user: ${admin.username}`);

  // 2. Create Dummy Users & Veterans
  const defaultPassword = await bcrypt.hash('password123', 10);
  const dummyUsers = [
    { email: 'civis@test.com', username: 'CivisUser', rank: Rank.CIVIS, exp: 100, wins: 0, streak: 0, createdDaysAgo: 5 },
    { email: 'baron@test.com', username: 'BaronUser', rank: Rank.BARON, exp: 5000, wins: 1, streak: 1, createdDaysAgo: 15 },
    { email: 'earl@test.com', username: 'EarlUser', rank: Rank.EARL, exp: 15000, wins: 5, streak: 2, createdDaysAgo: 30 },
    { email: 'duke@test.com', username: 'DukeUser', rank: Rank.DUKE, exp: 50000, wins: 15, streak: 5, createdDaysAgo: 100 },
    { email: 'emperor@test.com', username: 'EmperorUser', rank: Rank.EMPEROR, exp: 1000000, wins: 100, streak: 20, createdDaysAgo: 365 },
    
    // Veterans for Leaderboard
    { email: 'veteran1@test.com', username: 'Lord_Aethel', rank: Rank.SOVEREIGN, exp: 5000000, wins: 300, streak: 45, createdDaysAgo: 1000 },
    { email: 'veteran2@test.com', username: 'Sir_Galahad', rank: Rank.EMPEROR, exp: 2500000, wins: 210, streak: 30, createdDaysAgo: 850 },
    { email: 'veteran3@test.com', username: 'Lady_Guinevere', rank: Rank.DUKE, exp: 800000, wins: 95, streak: 12, createdDaysAgo: 700 },
    { email: 'veteran4@test.com', username: 'Dark_Knight', rank: Rank.SOVEREIGN, exp: 4200000, wins: 280, streak: 40, createdDaysAgo: 950 },
    { email: 'veteran5@test.com', username: 'MerchantKing', rank: Rank.EMPEROR, exp: 3100000, wins: 250, streak: 35, createdDaysAgo: 900 },
  ];

  for (const du of dummyUsers) {
    const createdAtDate = new Date();
    createdAtDate.setDate(createdAtDate.getDate() - du.createdDaysAgo);
    
    await prisma.user.upsert({
      where: { email: du.email },
      update: { 
        rank: du.rank, 
        totalExp: du.exp,
        totalWins: du.wins,
        winStreak: du.streak,
        longestStreak: du.streak
      },
      create: {
        email: du.email,
        username: du.username,
        passwordHash: defaultPassword,
        rank: du.rank,
        totalExp: du.exp,
        totalWins: du.wins,
        winStreak: du.streak,
        longestStreak: du.streak,
        kycStatus: 'APPROVED',
        createdAt: createdAtDate
      },
    });
  }
  console.log('Created dummy users and veterans.');

  // 3. Create Events
  await prisma.event.deleteMany(); // Reset events
  await prisma.event.createMany({
    data: [
      {
        name: 'The Obsidian Eclipse',
        theme: 'ABYSSAL_TIDES',
        startTime: new Date('2026-06-01T00:00:00Z'),
        endTime: new Date('2026-06-30T23:59:59Z'),
        isActive: true,
      },
      {
        name: 'Festival of Stars',
        theme: 'WINTER_COURT',
        startTime: new Date('2026-12-01T00:00:00Z'),
        endTime: new Date('2026-12-31T23:59:59Z'),
        isActive: false,
      }
    ]
  });
  console.log('Created events.');

  // 4. Create Achievements
  const achievements = [
    { name: 'First Blood', description: 'Memasang bid pertama kali', tier: AchievementTier.COMMON, trigger: 'BID_PLACED', condition: { count: 1 }, expReward: 50 },
    { name: 'Auction Winner', description: 'Memenangkan lelang pertama', tier: AchievementTier.RARE, trigger: 'AUCTION_WON', condition: { count: 1 }, expReward: 150 },
    { name: 'High Roller', description: 'Memenangkan 10 lelang', tier: AchievementTier.EPIC, trigger: 'AUCTION_WON', condition: { count: 10 }, expReward: 500 },
    { name: 'The Collector', description: 'Memiliki 5 Kosmetik', tier: AchievementTier.RARE, trigger: 'COSMETIC_OWNED', condition: { count: 5 }, expReward: 200 },
    { name: 'Identity Verified', description: 'Menyelesaikan KYC', tier: AchievementTier.COMMON, trigger: 'KYC_APPROVED', condition: { count: 1 }, expReward: 100 },
  ];

  for (const ach of achievements) {
    await prisma.achievement.upsert({
      where: { name: ach.name },
      update: {},
      create: {
        name: ach.name,
        description: ach.description,
        tier: ach.tier,
        trigger: ach.trigger,
        condition: ach.condition,
        expReward: ach.expReward,
      },
    });
  }
  console.log('Created preset achievements.');

  // 5. Create Dynamic CSS Cosmetics
  // We use `webCode` to store the raw CSS for each cosmetic.
  const cosmetics = [
    // WEB_CODE (Backgrounds)
    { name: 'Hexagon Matrix', type: CosmeticType.WEB_CODE, obtainMethod: ObtainMethod.SHOP, shopPrice: 5000, 
      webCode: `
        body { 
          background-color: #0f172a !important; 
          background-image: radial-gradient(#334155 1px, transparent 1px) !important;
          background-size: 20px 20px !important;
        }
        body:hover {
          background-image: radial-gradient(#3b82f6 2px, transparent 2px) !important;
          transition: background 0.5s ease;
        }
      `
    },
    { name: 'Cyberpunk Glitch', type: CosmeticType.WEB_CODE, obtainMethod: ObtainMethod.RANK, requiredRank: Rank.DUKE,
      webCode: `
        @keyframes glitch { 0% { transform: translate(0) } 20% { transform: translate(-2px, 2px) } 40% { transform: translate(-2px, -2px) } 60% { transform: translate(2px, 2px) } 80% { transform: translate(2px, -2px) } 100% { transform: translate(0) } }
        body::after { content: ""; position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; background: rgba(0,255,255,0.03); mix-blend-mode: overlay; animation: glitch 4s infinite; z-index: 9999; }
      `
    },
    { name: 'Deep Void', type: CosmeticType.WEB_CODE, obtainMethod: ObtainMethod.SHOP, shopPrice: 1000, webCode: `body { background: #000 !important; }` },
    { name: 'Royal Velvet', type: CosmeticType.WEB_CODE, obtainMethod: ObtainMethod.RANK, requiredRank: Rank.EARL, webCode: `body { background: linear-gradient(135deg, #450a0a, #7f1d1d) !important; }` },
    { name: 'Aurora Lights', type: CosmeticType.WEB_CODE, obtainMethod: ObtainMethod.EVENT, linkedEventName: 'Festival of Stars',
      webCode: `
        @keyframes aurora { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        body { background: linear-gradient(-45deg, #0f172a, #064e3b, #1e3a8a, #312e81) !important; background-size: 400% 400% !important; animation: aurora 15s ease infinite !important; }
      `
    },

    // FRAME (Profile Borders)
    { name: 'Infernal Fire', type: CosmeticType.FRAME, obtainMethod: ObtainMethod.SHOP, shopPrice: 10000,
      webCode: `
        .profile-frame-container { position: relative; padding: 4px; border-radius: 50%; background: linear-gradient(45deg, #ff0000, #ff7f00, #ffff00); animation: rotate-fire 2s linear infinite; }
        .profile-frame-container > img { border-radius: 50%; background: #000; z-index: 2; position: relative; }
        @keyframes rotate-fire { 100% { filter: hue-rotate(360deg); } }
      `
    },
    { name: 'Celestial Star', type: CosmeticType.FRAME, obtainMethod: ObtainMethod.EVENT, linkedEventName: 'Festival of Stars',
      webCode: `
        .profile-frame-container { border: 3px solid transparent; border-radius: 50%; box-shadow: 0 0 15px #fde047, inset 0 0 10px #fde047; }
      `
    },
    { name: 'Solid Gold', type: CosmeticType.FRAME, obtainMethod: ObtainMethod.RANK, requiredRank: Rank.BARON, webCode: `.profile-frame-container { border: 4px solid #fbbf24; border-radius: 50%; }` },
    { name: 'Diamond Edge', type: CosmeticType.FRAME, obtainMethod: ObtainMethod.ACHIEVEMENT, linkedAchievementName: 'The Collector', webCode: `.profile-frame-container { border: 4px solid #67e8f9; border-radius: 50%; box-shadow: 0 0 8px #67e8f9; }` },
    { name: 'Shadow Aura', type: CosmeticType.FRAME, obtainMethod: ObtainMethod.EVENT, linkedEventName: 'The Obsidian Eclipse',
      webCode: `
        .profile-frame-container { border-radius: 50%; box-shadow: 0 0 20px #000, 0 0 40px #4c1d95; animation: pulse-shadow 2s infinite alternate; }
        @keyframes pulse-shadow { from { box-shadow: 0 0 10px #000, 0 0 20px #4c1d95; } to { box-shadow: 0 0 30px #000, 0 0 60px #4c1d95; } }
      `
    },

    // NAME_EFFECT (Text styling)
    { name: 'Glowing Crimson', type: CosmeticType.NAME_EFFECT, obtainMethod: ObtainMethod.EVENT, linkedEventName: 'The Obsidian Eclipse',
      webCode: `.profile-name { color: #fca5a5; text-shadow: 0 0 5px #ef4444, 0 0 10px #b91c1c; animation: flicker 1.5s infinite alternate; } @keyframes flicker { from { opacity: 0.8; } to { opacity: 1; text-shadow: 0 0 8px #ef4444, 0 0 15px #b91c1c; } }`
    },
    { name: 'Royal Gold', type: CosmeticType.NAME_EFFECT, obtainMethod: ObtainMethod.SHOP, shopPrice: 2000, webCode: `.profile-name { background: linear-gradient(to right, #fbbf24, #d97706); -webkit-background-clip: text; color: transparent; font-weight: bold; }` },
    { name: 'Void Pulse', type: CosmeticType.NAME_EFFECT, obtainMethod: ObtainMethod.RANK, requiredRank: Rank.EARL, webCode: `.profile-name { color: #a78bfa; animation: void-pulse 2s infinite; } @keyframes void-pulse { 50% { color: #4c1d95; text-shadow: 0 0 10px #4c1d95; } }` },
    { name: 'Neon Blue', type: CosmeticType.NAME_EFFECT, obtainMethod: ObtainMethod.ACHIEVEMENT, linkedAchievementName: 'First Blood', webCode: `.profile-name { color: #60a5fa; text-shadow: 0 0 5px #2563eb; }` },
    { name: 'Rainbow Flow', type: CosmeticType.NAME_EFFECT, obtainMethod: ObtainMethod.RANK, requiredRank: Rank.EMPEROR, webCode: `.profile-name { background: linear-gradient(90deg, red, orange, yellow, green, blue, indigo, violet); background-size: 200% auto; color: transparent; -webkit-background-clip: text; animation: rainbow 3s linear infinite; } @keyframes rainbow { to { background-position: 200% center; } }` },

    // BANNER (Profile Banners)
    { name: "Emperor's Decree", type: CosmeticType.BANNER, obtainMethod: ObtainMethod.RANK, requiredRank: Rank.EMPEROR, webCode: `.profile-banner { background: linear-gradient(to right, #7f1d1d, #000) !important; border-bottom: 2px solid #fbbf24; }` },
    { name: 'Winter Banner', type: CosmeticType.BANNER, obtainMethod: ObtainMethod.EVENT, linkedEventName: 'Festival of Stars', webCode: `.profile-banner { background: url('/images/events/stars-banner.webp') center/cover !important; }` },
    { name: 'Abyssal Depths', type: CosmeticType.BANNER, obtainMethod: ObtainMethod.EVENT, linkedEventName: 'The Obsidian Eclipse', webCode: `.profile-banner { background: linear-gradient(to bottom, #020617, #1e1b4b) !important; position: relative; overflow: hidden; } .profile-banner::after { content: ''; position: absolute; bottom: 0; width: 100%; height: 20px; background: rgba(56, 189, 248, 0.2); filter: blur(10px); }` },
    { name: 'Starlight Nebula', type: CosmeticType.BANNER, obtainMethod: ObtainMethod.SHOP, shopPrice: 3000, webCode: `.profile-banner { background: radial-gradient(circle at center, #312e81, #000) !important; }` },
    { name: "Merchant's Silk", type: CosmeticType.BANNER, obtainMethod: ObtainMethod.ACHIEVEMENT, linkedAchievementName: 'Auction Winner', webCode: `.profile-banner { background: repeating-linear-gradient(45deg, #064e3b, #064e3b 10px, #047857 10px, #047857 20px) !important; }` },

    // WALLET_SKIN
    { name: 'Imperial Treasury', type: CosmeticType.WALLET_SKIN, obtainMethod: ObtainMethod.RANK, requiredRank: Rank.DUKE, webCode: `.wallet-card { background: linear-gradient(135deg, #d97706, #78350f) !important; border-color: #fbbf24 !important; }` },
    { name: 'Shadow Vault', type: CosmeticType.WALLET_SKIN, obtainMethod: ObtainMethod.EVENT, linkedEventName: 'The Obsidian Eclipse', webCode: `.wallet-card { background: #000 !important; box-shadow: inset 0 0 15px #4c1d95 !important; border-color: #4c1d95 !important; }` },
    { name: 'Crystal Card', type: CosmeticType.WALLET_SKIN, obtainMethod: ObtainMethod.SHOP, shopPrice: 2000, webCode: `.wallet-card { background: rgba(255,255,255,0.1) !important; backdrop-filter: blur(10px) !important; border: 1px solid rgba(255,255,255,0.2) !important; }` },
    { name: 'Emerald Ledger', type: CosmeticType.WALLET_SKIN, obtainMethod: ObtainMethod.ACHIEVEMENT, linkedAchievementName: 'The Collector', webCode: `.wallet-card { background: linear-gradient(to right, #064e3b, #047857) !important; }` },
    { name: 'Ruby Cache', type: CosmeticType.WALLET_SKIN, obtainMethod: ObtainMethod.SHOP, shopPrice: 1500, webCode: `.wallet-card { background: linear-gradient(135deg, #7f1d1d, #991b1b) !important; animation: ruby-glow 3s infinite alternate !important; } @keyframes ruby-glow { to { box-shadow: 0 0 20px #ef4444; } }` },
  ];

  for (const cos of cosmetics) {
    let linkedAchievementId = null;
    let linkedEventName = cos.linkedEventName || null;
    let requiredRank = cos.requiredRank || null;

    if (cos.linkedAchievementName) {
      const ach = await prisma.achievement.findUnique({ where: { name: cos.linkedAchievementName } });
      if (ach) linkedAchievementId = ach.id;
    }

    await prisma.cosmetic.upsert({
      where: { name: cos.name },
      update: {
        webCode: cos.webCode, // Update the CSS code if changed
      },
      create: {
        name: cos.name,
        type: cos.type,
        obtainMethod: cos.obtainMethod,
        shopPrice: cos.shopPrice || null,
        requiredRank: requiredRank,
        linkedAchievementId: linkedAchievementId,
        linkedEventName: linkedEventName,
        imageUrl: `https://source.unsplash.com/random/400x400/?${cos.name.split(' ')[0]},neon,${cos.type}`,
        webCode: cos.webCode,
      },
    });
  }
  console.log(`Created 25 dynamic cosmetics.`);

  // 6. Give some cosmetics to Dummy Users so they can flex
  const emperor = await prisma.user.findUnique({ where: { email: 'emperor@test.com' } });
  if (emperor) {
    const allCosmetics = await prisma.cosmetic.findMany();
    for (const c of allCosmetics) {
      await prisma.userCosmetic.upsert({
        where: {
          userId_cosmeticId: {
            userId: emperor.id,
            cosmeticId: c.id
          }
        },
        update: {},
        create: {
          userId: emperor.id,
          cosmeticId: c.id,
          obtainedAt: new Date(),
          obtainedFrom: "SEED_SCRIPT",
        }
      });
    }
    
    // Equip some default ones to Emperor
    const fireFrame = allCosmetics.find(c => c.name === 'Infernal Fire');
    const voidPulse = allCosmetics.find(c => c.name === 'Rainbow Flow');
    const empBanner = allCosmetics.find(c => c.name === "Emperor's Decree");
    const hexMatrix = allCosmetics.find(c => c.name === 'Hexagon Matrix');

    await prisma.user.update({
      where: { id: emperor.id },
      data: {
        activeCoatFrame: fireFrame?.id,
        activeNameEffect: voidPulse?.id,
        activeBannerId: empBanner?.id,
        activeWebCodeId: hexMatrix?.id,
      }
    });
  }

  console.log("Seeding complete!");

  // 7. Seed Auctions
  const adminUser = await prisma.user.findUnique({ where: { username: 'admin' } });
  if (adminUser) {
    await prisma.auction.deleteMany(); // Reset auctions for seeding
    const auctions = await prisma.auction.createManyAndReturn({
      data: [
        {
          title: "Crown of the First Emperor",
          description: "A legendary artifact from the ancient era. Glowing with eternal light. Discovered in the deep ruins of an ancient kingdom.",
          category: "ARTIFACT",
          rarity: "TRANSCENDENT",
          auctionType: "LIVE",
          status: "ACTIVE",
          startingPrice: 100000,
          currentPrice: 150000,
          minimumIncrement: 5000,
          startTime: new Date(),
          endTime: new Date(Date.now() + 86400000 * 3), // +3 days
          imageUrls: ["https://images.unsplash.com/photo-1595168499318-7b49cf525367?w=800&q=80", "https://images.unsplash.com/photo-1605806616949-1e87b487bc2a?w=800&q=80"],
        },
        {
          title: "Abyssal Dagger",
          description: "A cursed dagger retrieved from the deep ocean trench. It hums with dark energy.",
          category: "WEAPON",
          rarity: "EPIC",
          auctionType: "STANDARD",
          status: "ACTIVE",
          startingPrice: 5000,
          currentPrice: 5000,
          minimumIncrement: 500,
          startTime: new Date(),
          endTime: new Date(Date.now() + 86400000 * 5), // +5 days
          imageUrls: ["https://images.unsplash.com/photo-1589656966895-2f33e7653819?w=800&q=80"],
        },
        {
          title: "Neon Cyber-Katana",
          description: "Forged in the undercity of Neo-Tokyo. Cuts through steel like butter.",
          category: "WEAPON",
          rarity: "TRANSCENDENT",
          auctionType: "DESCENDING",
          status: "ACTIVE",
          startingPrice: 50000,
          currentPrice: 50000,
          minimumPrice: 10000,
          decrementAmount: 1000,
          minimumIncrement: 100,
          startTime: new Date(),
          endTime: new Date(Date.now() + 86400000 * 1), // +1 days
          imageUrls: ["https://images.unsplash.com/photo-1614026480209-cd9934144671?w=800&q=80"],
        },
        {
          title: "Starry Night Fragment",
          description: "An original piece of art showing a vibrant night sky. Believed to be painted by a famous historical artist.",
          category: "ART",
          rarity: "LEGENDARY",
          auctionType: "SEALED_CHEST",
          status: "ACTIVE",
          startingPrice: 20000,
          currentPrice: 20000,
          minimumIncrement: 1000,
          startTime: new Date(),
          endTime: new Date(Date.now() + 86400000 * 2), // +2 days
          isSealed: true,
          imageUrls: ["https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&q=80"],
        },
        {
          title: "Golden Dragon Statue",
          description: "A solid gold statue of a dragon holding a ruby orb.",
          category: "ARTIFACT",
          rarity: "EPIC",
          auctionType: "STANDARD",
          status: "ACTIVE",
          startingPrice: 15000,
          currentPrice: 21000,
          minimumIncrement: 500,
          startTime: new Date(Date.now() - 86400000 * 2),
          endTime: new Date(Date.now() + 86400000 * 2), // Ends in 2 days
          imageUrls: ["https://images.unsplash.com/photo-1599839619722-39751411ea63?w=800"],
        },
        {
          title: "Excalibur Replica",
          description: "A masterfully crafted replica of the legendary sword. It shines brightly in the sun.",
          category: "WEAPON",
          rarity: "LEGENDARY",
          auctionType: "STANDARD",
          status: "ENDED",
          startingPrice: 50000,
          currentPrice: 120000,
          minimumIncrement: 5000,
          startTime: new Date(Date.now() - 86400000 * 10),
          endTime: new Date(Date.now() - 86400000 * 1), // Ended 1 day ago
          imageUrls: ["https://images.unsplash.com/photo-1590212356877-3e4b78913b82?w=800&q=80"],
        },
        {
          title: "Ancient Pharaoh's Mask",
          description: "A priceless mask discovered in a hidden tomb. Said to carry a powerful curse.",
          category: "ARTIFACT",
          rarity: "TRANSCENDENT",
          auctionType: "LIVE",
          status: "ENDED",
          startingPrice: 200000,
          currentPrice: 550000,
          minimumIncrement: 10000,
          startTime: new Date(Date.now() - 86400000 * 30),
          endTime: new Date(Date.now() - 86400000 * 28), // Ended 28 days ago
          imageUrls: ["https://images.unsplash.com/photo-1601662916120-0012297920af?w=800&q=80"],
        }
      ]
    });
    console.log(`Created ${auctions.length} auctions (LIVE, STANDARD, DUTCH, SEALED).`);

    // 8. Seed Museum Items from ENDED auctions
    await prisma.museumItem.deleteMany();
    const endedAuctions = auctions.filter(a => a.status === 'ENDED');
    for (const ea of endedAuctions) {
      await prisma.museumItem.create({
        data: {
          auctionId: ea.id,
          editorial: `This remarkable ${ea.category.toLowerCase()} was sold for a staggering ${ea.currentPrice.toLocaleString()} Aurum! A true masterpiece that will forever remain in the annals of Emerald Kingdom history.`
        }
      });
    }
    console.log(`Created ${endedAuctions.length} museum items.`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


