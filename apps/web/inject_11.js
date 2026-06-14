const { PrismaClient } = require('@emerald-kingdom/db');
const prisma = new PrismaClient();

const cos = {
  id: "web_radical_11",
  name: "Abyssal Void",
  type: "WEB_CODE",
  rarity: "LEGENDARY",
  obtainMethod: "SHOP",
  shopPrice: 2500,
  imageUrl: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&q=80",
  description: "Tenggelam dalam tekanan gravitasi tak terbatas. Cahaya dibengkokkan oleh lubang hitam raksasa yang menyedot segalanya.",
  webCode: `
/* 1. Sembunyikan Kanvas Bawaan Secara Total */
#emerald-bg-canvas {
  display: none !important;
}

/* 2. Latar Belakang & Lubang Hitam (Vortex) */
html::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: -3;
  pointer-events: none;
  background: radial-gradient(circle at 50% 50%, #1e1b4b 0%, #000000 100%) !important;
}

/* Pusaran Cahaya Lubang Hitam */
html::after {
  content: '';
  position: fixed;
  top: 50%;
  left: 50%;
  width: 150vw;
  height: 150vw;
  margin-top: -75vw;
  margin-left: -75vw;
  z-index: -2;
  pointer-events: none;
  background: conic-gradient(
    from 0deg,
    rgba(192, 132, 252, 0.05) 0deg,
    transparent 60deg,
    rgba(79, 70, 229, 0.1) 120deg,
    transparent 180deg,
    rgba(192, 132, 252, 0.05) 240deg,
    transparent 300deg,
    rgba(79, 70, 229, 0.1) 360deg
  );
  border-radius: 50%;
  animation: vortex-spin 8s linear infinite;
  mask-image: radial-gradient(circle, transparent 15%, black 40%);
  -webkit-mask-image: radial-gradient(circle, transparent 15%, black 40%);
}

@keyframes vortex-spin {
  0% { transform: rotate(0deg) scale(1); }
  50% { transform: rotate(180deg) scale(1.1); }
  100% { transform: rotate(360deg) scale(1); }
}

/* 3. Warna Indigo & Ungu */
:root {
  --color-emerald: #4f46e5 !important;
  --color-gold: #c084fc !important;
}

/* 4. Transformasi Kartu: Gelembung Distorsi (Gravity Pull Hover) */
.content-card {
  background: rgba(15, 10, 40, 0.7) !important;
  backdrop-filter: blur(15px) !important;
  border: 1px solid rgba(192, 132, 252, 0.2) !important;
  border-radius: 40px !important;
  transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
}

.content-card:hover {
  transform: scale(0.85) skewX(5deg) skewY(-3deg) rotate(-2deg) !important;
  background: rgba(0, 0, 0, 0.9) !important;
  border-color: #c084fc !important;
  box-shadow: 0 0 50px rgba(79, 70, 229, 0.8), inset 0 0 20px rgba(192, 132, 252, 0.5) !important;
  border-radius: 100px !important;
}

/* 5. Header Distorsi */
header {
  border-bottom: 1px solid rgba(79, 70, 229, 0.4) !important;
  background: transparent !important;
  backdrop-filter: blur(20px) !important;
}
  `
};

async function main() {
  console.log("Injecting Cosmetic No.11...");
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
