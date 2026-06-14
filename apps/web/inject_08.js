const { PrismaClient } = require('@emerald-kingdom/db');
const prisma = new PrismaClient();

const cos = {
  id: "web_radical_08",
  name: "Ethereal Phantom",
  type: "WEB_CODE",
  rarity: "RARE",
  obtainMethod: "EVENT",
  shopPrice: 0,
  imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80",
  description: "Melayang di antara dua dunia. Seluruh antarmuka menjadi sangat transparan layaknya penampakan roh, bergerak halus tanpa henti.",
  webCode: `
/* 1. Sembunyikan Kanvas Bawaan Secara Total */
#emerald-bg-canvas {
  display: none !important;
}

/* 2. Latar Belakang & Kabut Roh */
html::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: -2;
  pointer-events: none;
  background: #020617 !important;
}

html::after {
  content: '';
  position: fixed;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  z-index: -1;
  pointer-events: none;
  background: radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.05) 0%, transparent 60%);
  animation: ghost-fog 25s ease-in-out infinite alternate;
}

@keyframes ghost-fog {
  0% { transform: translateX(-10%) translateY(-5%) scale(1); }
  100% { transform: translateX(10%) translateY(5%) scale(1.2); }
}

/* 3. Warna Cyan Pudar & Putih Roh */
:root {
  --color-emerald: #67e8f9 !important;
  --color-gold: #f1f5f9 !important;
}

/* 4. Transformasi Kartu: Mengambang & Batas Putus-Putus */
.content-card {
  background: rgba(255, 255, 255, 0.02) !important;
  border: 1px dashed rgba(103, 232, 249, 0.2) !important;
  border-radius: 20px !important;
  opacity: 0.8 !important;
  animation: levitate 6s ease-in-out infinite alternate !important;
  transition: all 0.5s ease !important;
}

.content-card:nth-child(even) {
  animation-delay: -3s !important;
}

@keyframes levitate {
  0% { transform: translateY(0); }
  100% { transform: translateY(-15px); }
}

.content-card:hover {
  opacity: 1 !important;
  background: rgba(103, 232, 249, 0.1) !important;
  border: 1px solid rgba(103, 232, 249, 0.6) !important;
  animation-play-state: paused !important;
  transform: translateY(-5px) scale(1.02) !important;
  box-shadow: 0 0 25px rgba(241, 245, 249, 0.3) !important;
}

/* 5. Header Transparan Pudar */
header {
  border-bottom: 1px dashed rgba(103, 232, 249, 0.3) !important;
  background: transparent !important;
  backdrop-filter: blur(5px) !important;
}
  `
};

async function main() {
  console.log("Injecting Cosmetic No.8...");
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
      create: { userId: admin.id, cosmeticId: cos.id, obtainedFrom: "EVENT" },
    });
    console.log("Gave to admin!");
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
