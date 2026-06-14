const { PrismaClient } = require('@emerald-kingdom/db');
const prisma = new PrismaClient();

const cos = {
  id: "web_radical_07",
  name: "Neon Cyberpunk",
  type: "WEB_CODE",
  rarity: "LEGENDARY",
  obtainMethod: "AUCTION",
  shopPrice: 0,
  imageUrl: "https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800&q=80",
  description: "Sistem telah diretas. Distorsi realitas dengan paduan grid retro synthwave dan garis neon yang tajam menyala.",
  webCode: `
/* 1. Sembunyikan Kanvas Bawaan Secara Total */
#emerald-bg-canvas {
  display: none !important;
}

/* 2. Latar Belakang Synthwave Grid Bergerak */
html::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: -2;
  pointer-events: none;
  background: linear-gradient(180deg, #050117 0%, #15023a 100%) !important;
}

html::after {
  content: '';
  position: fixed;
  bottom: 0;
  left: -50%;
  width: 200%;
  height: 60vh;
  z-index: -1;
  pointer-events: none;
  background-image: 
    linear-gradient(rgba(0, 243, 255, 0.4) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 0, 127, 0.4) 1px, transparent 1px);
  background-size: 50px 50px;
  transform: perspective(600px) rotateX(70deg) translateY(0);
  animation: cyber-grid 2s linear infinite;
}

@keyframes cyber-grid {
  0% { transform: perspective(600px) rotateX(70deg) translateY(0); }
  100% { transform: perspective(600px) rotateX(70deg) translateY(50px); }
}

/* 3. Warna Neon Cyan & Hot Pink */
:root {
  --color-emerald: #00f3ff !important;
  --color-gold: #ff007f !important;
}

body * {
  text-shadow: 1px 0px 1px rgba(0,243,255,0.5), -1px 0px 1px rgba(255,0,127,0.5) !important;
}

/* 4. Transformasi Kartu: Garis Tajam & Animasi Glitch saat Hover */
.content-card {
  background: rgba(10, 2, 30, 0.8) !important;
  border: 1px solid #00f3ff !important;
  border-right: 1px solid #ff007f !important;
  border-bottom: 1px solid #ff007f !important;
  border-radius: 4px !important;
  transition: background 0.3s !important;
}

.content-card:hover {
  background: rgba(20, 5, 50, 0.9) !important;
  animation: cyber-glitch 0.2s linear infinite !important;
  box-shadow: -5px 5px 0px rgba(0, 243, 255, 0.3), 5px -5px 0px rgba(255, 0, 127, 0.3) !important;
}

@keyframes cyber-glitch {
  0% { transform: translate(0); }
  20% { transform: translate(-2px, 1px); }
  40% { transform: translate(-1px, -1px); }
  60% { transform: translate(2px, 1px); }
  80% { transform: translate(1px, -1px); }
  100% { transform: translate(0); }
}

/* 5. Header Neon */
header {
  border-bottom: 2px solid #00f3ff !important;
  background: rgba(5, 1, 23, 0.9) !important;
  box-shadow: 0 0 15px rgba(0, 243, 255, 0.4) !important;
}
  `
};

async function main() {
  console.log("Injecting Cosmetic No.7...");
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
      create: { userId: admin.id, cosmeticId: cos.id, obtainedFrom: "AUCTION" },
    });
    console.log("Gave to admin!");
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
