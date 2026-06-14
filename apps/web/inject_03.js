const { PrismaClient } = require('@emerald-kingdom/db');
const prisma = new PrismaClient();

const cos = {
  id: "web_radical_03",
  name: "Amethyst Pulse",
  type: "WEB_CODE",
  rarity: "UNCOMMON",
  obtainMethod: "EVENT",
  shopPrice: 750,
  imageUrl: "https://images.unsplash.com/photo-1550684376-efcbd6e3f031?w=800&q=80",
  description: "Dunia di bawah pengaruh kristal Amethyst. UI tidak lagi diam, melainkan seakan bernapas berkat energi kuno.",
  webCode: `
/* 1. Sembunyikan Kanvas Bawaan Secara Total */
#emerald-bg-canvas {
  display: none !important;
}

/* 2. Latar Belakang Ungu Gelap + Animasi Scanlines */
html::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: -2;
  pointer-events: none;
  background: radial-gradient(circle at 50% 50%, #2e1065 0%, #000 100%) !important;
}

html::after {
  content: '';
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background: repeating-linear-gradient(
    0deg,
    rgba(0, 0, 0, 0.1),
    rgba(0, 0, 0, 0.1) 2px,
    rgba(168, 85, 247, 0.05) 2px,
    rgba(168, 85, 247, 0.05) 4px
  );
  animation: scanlines 10s linear infinite;
}

@keyframes scanlines {
  0% { transform: translateY(0); }
  100% { transform: translateY(-40px); }
}

/* 3. Warna Ungu Neon & Magenta */
:root {
  --color-emerald: #a855f7 !important;
  --color-gold: #ec4899 !important;
}

/* 4. Transformasi Kartu: Bernapas (Idle Breathing) & Hover */
.content-card {
  background: rgba(88, 28, 135, 0.2) !important;
  border: 1px solid rgba(168, 85, 247, 0.3) !important;
  border-radius: 16px !important;
  animation: amethyst-breathe 4s infinite alternate ease-in-out !important;
  transition: all 0.3s ease !important;
}

.content-card:nth-child(even) {
  animation-delay: -2s !important;
}

@keyframes amethyst-breathe {
  0% { transform: scale(1); box-shadow: 0 0 5px rgba(168, 85, 247, 0.1); }
  100% { transform: scale(1.015); box-shadow: 0 0 15px rgba(168, 85, 247, 0.4); }
}

.content-card:hover {
  animation-play-state: paused !important;
  transform: scale(1.05) !important;
  background: linear-gradient(135deg, rgba(88, 28, 135, 0.6) 0%, rgba(157, 23, 77, 0.6) 100%) !important;
  border-color: #ec4899 !important;
  box-shadow: 0 10px 30px rgba(236, 72, 153, 0.5) !important;
}

/* 5. Header Hue Rotate */
header {
  border-bottom: 2px solid #a855f7 !important;
  background: rgba(10, 0, 20, 0.8) !important;
  animation: hue-cycle 5s linear infinite !important;
}

@keyframes hue-cycle {
  0% { filter: hue-rotate(0deg); }
  100% { filter: hue-rotate(360deg); }
}
  `
};

async function main() {
  console.log("Injecting Cosmetic No.3...");
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
