const { PrismaClient } = require('@emerald-kingdom/db');
const prisma = new PrismaClient();

const cos = {
  id: "web_radical_01",
  name: "Verdant Sovereign",
  type: "WEB_CODE",
  rarity: "COMMON",
  obtainMethod: "SHOP",
  shopPrice: 500,
  imageUrl: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&q=80",
  description: "Menghapus identitas lama. Hutan zamrud purba mengambil alih seluruh tampilan web dengan kabut yang bergerak lambat.",
  webCode: `
/* 1. Sembunyikan Kanvas Bawaan Secara Total */
#emerald-bg-canvas {
  display: none !important;
}

/* 2. Latar Belakang Baru Radikal (Idle Background Animation) */
html::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background: 
    radial-gradient(circle at 0% 0%, rgba(16, 185, 129, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 100% 100%, rgba(4, 120, 87, 0.15) 0%, transparent 50%),
    #050f0a !important;
  background-size: 200% 200%;
  animation: verdant-nebula 15s ease-in-out infinite alternate;
}

@keyframes verdant-nebula {
  0% { background-position: 0% 0%; }
  100% { background-position: 100% 100%; }
}

/* 3. Warna Utama & Aksesoris Teks */
:root {
  --color-emerald: #10b981 !important;
  --color-gold: #34d399 !important;
}

/* 4. Transformasi Kartu & Hover Radikal */
.content-card {
  background: rgba(6, 78, 59, 0.3) !important;
  backdrop-filter: blur(10px) !important;
  border: 1px solid rgba(16, 185, 129, 0.2) !important;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
}

.content-card:hover {
  transform: translateY(-8px) scale(1.02) !important;
  border-color: rgba(16, 185, 129, 0.8) !important;
  box-shadow: 0 15px 30px rgba(16, 185, 129, 0.4) !important;
  background: rgba(6, 78, 59, 0.6) !important;
}

/* 5. Header Berdenyut (Idle Animation pada Header) */
header {
  border-bottom: 2px solid rgba(16, 185, 129, 0.2) !important;
  animation: verdant-pulse 3s infinite alternate !important;
  background: rgba(5, 15, 10, 0.9) !important;
}

@keyframes verdant-pulse {
  0% { box-shadow: 0 4px 10px rgba(16, 185, 129, 0); }
  100% { box-shadow: 0 4px 20px rgba(16, 185, 129, 0.3); }
}
  `
};

async function main() {
  console.log("Injecting Cosmetic No.1...");
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
