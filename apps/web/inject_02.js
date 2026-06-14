const { PrismaClient } = require('@emerald-kingdom/db');
const prisma = new PrismaClient();

const cos = {
  id: "web_radical_02",
  name: "Obsidian Twilight",
  type: "WEB_CODE",
  rarity: "COMMON",
  obtainMethod: "SHOP",
  shopPrice: 500,
  imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80",
  description: "Kehampaan elegan. Menelan cahaya dengan mode gelap super pekat. Seluruh sudut desain menjadi tajam dan presisi bagai silet.",
  webCode: `
/* 1. Sembunyikan Kanvas Bawaan Secara Total */
#emerald-bg-canvas {
  display: none !important;
}

/* 2. Latar Belakang Hitam & Spotlight Halus */
html::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background: 
    radial-gradient(circle at 10% 10%, rgba(255,255,255,0.03) 0%, transparent 60%),
    #050505 !important;
}

/* 3. Warna Platinum/Silver & Modifikasi Huruf */
:root {
  --color-emerald: #737373 !important;
  --color-gold: #d4d4d4 !important;
}

body * {
  letter-spacing: 0.02em !important;
}

/* 4. Transformasi Kartu: Sudut Tajam & Interaksi Berat (Heavy Compression) */
.content-card, button, input {
  border-radius: 0 !important;
}

.content-card {
  background: rgba(15, 15, 15, 0.9) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.2s, box-shadow 0.2s !important;
}

.content-card:hover {
  transform: scale(0.98) !important;
  border-color: rgba(255, 255, 255, 0.5) !important;
  box-shadow: inset 0 0 20px rgba(255, 255, 255, 0.05) !important;
}

/* 5. Header Monokrom Kaku */
header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
  background: rgba(5, 5, 5, 0.8) !important;
  backdrop-filter: grayscale(100%) blur(15px) !important;
}
  `
};

async function main() {
  console.log("Injecting Cosmetic No.2...");
  await prisma.cosmetic.upsert({
    where: { id: cos.id },
    update: cos,
    create: cos,
  });
  console.log("Upserted:", cos.name);

  // Assign to admin
  const admin = await prisma.user.findFirst({ where: { username: "admin" } });
  if (admin) {
    await prisma.userCosmetic.upsert({
      where: { userId_cosmeticId: { userId: admin.id, cosmeticId: cos.id } },
      update: {},
      create: { userId: admin.id, cosmeticId: cos.id, obtainedFrom: "SHOP" },
    });
    console.log("Gave to admin!");
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
