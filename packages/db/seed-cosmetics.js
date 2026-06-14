const { PrismaClient } = require('@prisma/client');


const prisma = new PrismaClient();

async function main() {
  console.log("Seeding dummy users and cosmetics...");

  // 1. Create Cosmetics
  const cosmeticsData = [
    {
      name: "Hexagon Matrix Web Code",
      description: "Latar belakang hexagon interaktif yang bereaksi terhadap kursor Anda.",
      type: "WEB_CODE",
      rarity: "MYTHIC",
      obtainMethod: "SHOP",
      shopPrice: 50000,
      requiredRank: "DUKE",
      imageUrl: "",
      webCode: `
/* Hexagon Matrix Web Code */
body {
  background-color: #050505;
  background-image: radial-gradient(circle at 50% 50%, rgba(20, 24, 28, 0.8) 0%, rgba(5, 5, 5, 1) 100%), url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4af37' fill-opacity='0.05'%3E%3Cpath d='M30 60L15 34.02 30 8.04l15 25.98zm0-51.96L17.32 34.02 30 55.98 42.68 34.02z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  background-attachment: fixed;
}
.page-wrap {
  animation: bg-pulse 10s infinite alternate;
}
@keyframes bg-pulse {
  0% { backdrop-filter: hue-rotate(0deg); }
  100% { backdrop-filter: hue-rotate(30deg); }
}
/* Aura on widgets/panels */
.panel {
  transition: all 0.3s ease;
}
.panel:hover {
  box-shadow: 0 0 30px rgba(212, 175, 55, 0.3), inset 0 0 20px rgba(212, 175, 55, 0.1);
  transform: translateY(-5px);
  border-color: rgba(212, 175, 55, 0.8);
}
      `
    },
    {
      name: "Abyssal Fire Frame",
      description: "Bingkai profil dengan kobaran api abadi dari jurang kehampaan.",
      type: "FRAME",
      rarity: "LEGENDARY",
      obtainMethod: "ACHIEVEMENT",
      imageUrl: "", // We use CSS for rendering
      webCode: `
/* Abyssal Fire Frame */
.profile-frame-container {
  box-shadow: 0 0 20px #ef4444, 0 0 40px #b91c1c, inset 0 0 15px #ef4444 !important;
  animation: fire-pulse 2s infinite alternate !important;
  border-color: #ef4444 !important;
}
@keyframes fire-pulse {
  0% { box-shadow: 0 0 15px #ef4444, inset 0 0 10px #ef4444; }
  100% { box-shadow: 0 0 30px #ef4444, 0 0 50px #f97316, inset 0 0 20px #ef4444; border-color: #f97316; }
}
      `
    },
    {
      name: "Nebula Starfall Banner",
      description: "Banner profil interaktif dengan hujan bintang.",
      type: "BANNER",
      rarity: "EPIC",
      obtainMethod: "RANK",
      requiredRank: "VISCOUNT",
      imageUrl: "",
      webCode: `
/* Nebula Starfall Banner */
.profile-panel {
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(88, 28, 135, 0.9)) !important;
  position: relative;
  overflow: hidden;
}
.profile-panel::before {
  content: "";
  position: absolute;
  top: -50%; left: -50%; right: -50%; bottom: -50%;
  background: radial-gradient(circle, #fff 1px, transparent 1px);
  background-size: 50px 50px;
  opacity: 0.3;
  animation: starfall 20s linear infinite;
  z-index: 0;
}
@keyframes starfall {
  0% { transform: translateY(0); }
  100% { transform: translateY(50px); }
}
      `
    },
    {
      name: "Neon Cyberpunk Name Effect",
      description: "Nama profil dengan efek glitch cyberpunk neon.",
      type: "NAME_EFFECT",
      rarity: "RARE",
      obtainMethod: "SHOP",
      shopPrice: 15000,
      imageUrl: "",
      webCode: `
/* Cyberpunk Name */
.profile-name {
  color: #0ff !important;
  text-shadow: 2px 2px 0px #f0f, -2px -2px 0px #0ff !important;
  animation: glitch 1.5s infinite alternate !important;
}
@keyframes glitch {
  0% { text-shadow: 2px 2px 0px #f0f, -2px -2px 0px #0ff; transform: skewX(0deg); }
  10% { text-shadow: -2px -2px 0px #f0f, 2px 2px 0px #0ff; transform: skewX(-5deg); }
  20% { text-shadow: 2px 2px 0px #f0f, -2px -2px 0px #0ff; transform: skewX(0deg); }
  100% { text-shadow: 2px 2px 0px #f0f, -2px -2px 0px #0ff; transform: skewX(0deg); }
}
      `
    },
    {
      name: "Golden Sovereignty Widget",
      description: "Menambahkan warna emas kerajaan ke seluruh komponen aplikasi.",
      type: "WEB_CODE",
      rarity: "MYTHIC",
      obtainMethod: "RANK",
      requiredRank: "EMPEROR",
      imageUrl: "",
      webCode: `
/* Golden Sovereignty */
:root {
  --color-emerald: #d4af37; /* Override emerald with gold */
  --emerald-deep: #b8860b;
}
.primary-action {
  background: linear-gradient(135deg, #d4af37, #b8860b) !important;
  color: #000 !important;
  box-shadow: 0 0 15px rgba(212, 175, 55, 0.5) !important;
}
.panel {
  border-color: rgba(212, 175, 55, 0.4) !important;
}
      `
    },
    {
      name: "Frost Crystal Frame",
      description: "Bingkai avatar dengan kristal es yang berkilau dan beranimasi.",
      type: "FRAME",
      rarity: "EPIC",
      obtainMethod: "SHOP",
      shopPrice: 25000,
      imageUrl: "",
      webCode: `
/* Frost Crystal Frame */
.profile-frame-container {
  box-shadow: 0 0 15px #38bdf8, 0 0 30px #0ea5e9, inset 0 0 10px rgba(56,189,248,0.3) !important;
  animation: frost-shimmer 3s infinite alternate !important;
  border-color: #38bdf8 !important;
}
@keyframes frost-shimmer {
  0% { box-shadow: 0 0 10px #38bdf8, inset 0 0 8px rgba(56,189,248,0.2); filter: brightness(1); }
  50% { box-shadow: 0 0 25px #7dd3fc, 0 0 40px #38bdf8, inset 0 0 15px rgba(56,189,248,0.4); filter: brightness(1.1); }
  100% { box-shadow: 0 0 10px #38bdf8, inset 0 0 8px rgba(56,189,248,0.2); filter: brightness(1); }
}
      `
    },
    {
      name: "Emerald Royalty Wallet",
      description: "Skin dompet dengan motif kerajaan hijau zamrud dan aksen emas.",
      type: "WALLET_SKIN",
      rarity: "RARE",
      obtainMethod: "SHOP",
      shopPrice: 10000,
      imageUrl: "",
      webCode: `
/* Emerald Royalty Wallet */
.wallet-card, .panel:has(.wallet-balance) {
  background: linear-gradient(135deg, #064e3b, #0d3b2e, #065f46) !important;
  border: 1px solid rgba(16,185,129,0.5) !important;
  box-shadow: 0 4px 20px rgba(16,185,129,0.2) !important;
}
      `
    },
    {
      name: "Royal Herald Name",
      description: "Efek nama dengan gradien emas kerajaan dan bayangan dramatis.",
      type: "NAME_EFFECT",
      rarity: "UNCOMMON",
      obtainMethod: "SHOP",
      shopPrice: 5000,
      imageUrl: "",
      webCode: `
/* Royal Herald Name */
.profile-name {
  background: linear-gradient(90deg, #d4af37, #f5d060, #d4af37) !important;
  -webkit-background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  background-size: 200% auto !important;
  animation: gold-shine 3s linear infinite !important;
}
@keyframes gold-shine {
  0% { background-position: 0% center; }
  100% { background-position: 200% center; }
}
      `
    },
    {
      name: "Midnight Void Banner",
      description: "Banner dengan efek void gelap dan partikel berkilauan.",
      type: "BANNER",
      rarity: "LEGENDARY",
      obtainMethod: "EVENT",
      linkedEventName: "Winter Court 2026",
      imageUrl: "",
      webCode: `
/* Midnight Void Banner */
.profile-panel {
  background: linear-gradient(135deg, #0f0f1a 0%, #1a0a2e 50%, #0f0f1a 100%) !important;
  border-color: rgba(139,92,246,0.5) !important;
  box-shadow: inset 0 0 30px rgba(139,92,246,0.15) !important;
}
.profile-panel::after {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 30% 50%, rgba(139,92,246,0.2), transparent 50%), radial-gradient(circle at 70% 30%, rgba(236,72,153,0.15), transparent 40%);
  pointer-events: none;
  z-index: 0;
}
      `
    },
    {
      name: "Aurora Borealis Theme",
      description: "Tema web lengkap dengan efek aurora borealis di seluruh halaman.",
      type: "WEB_CODE",
      rarity: "LEGENDARY",
      obtainMethod: "ACHIEVEMENT",
      imageUrl: "",
      webCode: `
/* Aurora Borealis Theme */
body::before {
  content: "";
  position: fixed;
  top: 0; left: 0; right: 0;
  height: 300px;
  background: linear-gradient(180deg, rgba(6,182,212,0.15) 0%, rgba(139,92,246,0.1) 30%, rgba(236,72,153,0.05) 60%, transparent 100%);
  pointer-events: none;
  z-index: 0;
  animation: aurora 8s ease-in-out infinite alternate;
}
@keyframes aurora {
  0% { opacity: 0.6; filter: hue-rotate(0deg); }
  50% { opacity: 1; filter: hue-rotate(20deg); }
  100% { opacity: 0.6; filter: hue-rotate(-10deg); }
}
.panel {
  backdrop-filter: blur(10px) !important;
}
      `
    }
  ];

  const createdCosmetics = [];
  for (const c of cosmeticsData) {
    const cosmetic = await prisma.cosmetic.upsert({
      where: { name: c.name },
      update: c,
      create: c,
    });
    createdCosmetics.push(cosmetic);
    console.log("Created Cosmetic:", cosmetic.name);
  }

  // 2. Create Dummy Users
  const passwordHash = "$2a$10$tZ2E1.m.p1Z31XhB5n5QOu74G1yD9f7lQxY5xX6nE8I4Z2t3z1F4a"; // password123
  
  const emperor = await prisma.user.upsert({
    where: { email: 'emperor@test.com' },
    update: {},
    create: {
      email: 'emperor@test.com',
      username: 'Julius_Caesar',
      passwordHash,
      emailVerified: true,
      rank: 'EMPEROR',
      totalExp: 100000,
      totalWins: 50,
      kycStatus: 'APPROVED',
      walletAccount: {
        create: { balance: 9999999 }
      }
    }
  });

  const duke = await prisma.user.upsert({
    where: { email: 'duke@test.com' },
    update: {},
    create: {
      email: 'duke@test.com',
      username: 'Duke_Wellington',
      passwordHash,
      emailVerified: true,
      rank: 'DUKE',
      totalExp: 50000,
      totalWins: 10,
      kycStatus: 'APPROVED',
      walletAccount: {
        create: { balance: 500000 }
      }
    }
  });

  console.log("Dummy users created: emperor@test.com, duke@test.com");

  // 3. Assign Cosmetics to Emperor
  for (const c of createdCosmetics) {
    await prisma.userCosmetic.upsert({
      where: { userId_cosmeticId: { userId: emperor.id, cosmeticId: c.id } },
      update: {},
      create: {
        userId: emperor.id,
        cosmeticId: c.id,
        obtainedFrom: "seed"
      }
    });
  }

  console.log("Assigned all cosmetics to Emperor.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
