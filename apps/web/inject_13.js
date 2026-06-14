const { PrismaClient } = require('@emerald-kingdom/db');
const prisma = new PrismaClient();

const cos = {
  id: "web_radical_13",
  name: "Sovereign's Ascendance",
  type: "WEB_CODE",
  rarity: "MYTHIC",
  obtainMethod: "EVENT",
  shopPrice: 0,
  imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80",
  description: "Puncak evolusi sang penguasa. Realitas pecah berkeping-keping dan dimensi membentuk ulang dirinya mengikuti kemauanmu.",
  webCode: `
/* 1. Sembunyikan Kanvas Bawaan Secara Total */
#emerald-bg-canvas {
  display: none !important;
}

/* 2. Latar Belakang Cahaya Prisma Berputar */
html::before {
  content: '';
  position: fixed;
  inset: -50%;
  z-index: -3;
  pointer-events: none;
  background: conic-gradient(from 0deg, #050510, #1a0b2e, #0a1f2e, #1a0b2e, #050510);
  animation: prism-rotate 20s linear infinite;
}

@keyframes prism-rotate {
  0% { transform: rotate(0deg) scale(2); }
  100% { transform: rotate(360deg) scale(2); }
}

/* Pecahan Realitas (Debu Prisma) */
html::after {
  content: '';
  position: fixed;
  inset: 0;
  z-index: -2;
  pointer-events: none;
  background: radial-gradient(circle at 50% 50%, rgba(255,255,255,0.02) 0%, transparent 60%);
  box-shadow: inset 0 0 100px rgba(0,0,0,0.8);
}

/* 3. Warna Dasar Berlian */
:root {
  --color-emerald: #ffffff !important;
  --color-gold: #e2e8f0 !important;
}

/* 4. Transformasi Kartu: Prisma Border & Dimensional Split Hover */
.content-card {
  position: relative !important;
  background: rgba(10, 10, 15, 0.6) !important;
  backdrop-filter: blur(10px) !important;
  border-radius: 12px !important;
  transform-style: preserve-3d !important;
  transform: perspective(1000px) 
             rotateX(calc((var(--mouse-y) - 50vh) * -0.015deg)) 
             rotateY(calc((var(--mouse-x) - 50vw) * 0.015deg)) !important;
  transition: transform 0.2s ease-out, box-shadow 0.3s !important;
  box-shadow: 0 0 0 1px rgba(255,255,255,0.1) !important;
  will-change: transform;
}

/* Pseudo element untuk Animasi Pelangi di Border */
.content-card::before {
  content: '' !important;
  position: absolute !important;
  inset: -2px !important;
  z-index: -1 !important;
  background: linear-gradient(45deg, #ff0000, #ff7300, #fffb00, #48ff00, #00ffd5, #002bff, #7a00ff, #ff00c8, #ff0000) !important;
  background-size: 400% !important;
  border-radius: 14px !important;
  opacity: 0 !important;
  transition: opacity 0.3s !important;
  animation: rainbow-border 20s linear infinite !important;
}

@keyframes rainbow-border {
  0% { background-position: 0 0; }
  100% { background-position: 400% 0; }
}

/* Hover: Pembelahan Dimensi (RGB Split) */
.content-card:hover {
  transform: perspective(1000px) 
             rotateX(calc((var(--mouse-y) - 50vh) * -0.02deg)) 
             rotateY(calc((var(--mouse-x) - 50vw) * 0.02deg)) 
             scale(1.05) translateZ(15px) !important;
  box-shadow: -15px 0 30px rgba(255,0,0,0.3), 15px 0 30px rgba(0,0,255,0.3), 0 15px 30px rgba(0,255,0,0.3) !important;
  background: rgba(10, 10, 20, 0.9) !important;
}

/* Nyalakan Border Pelangi saat Hover */
.content-card:hover::before {
  opacity: 1 !important;
}

/* Teks/Isi kartu melayang ekstrem saat dihover */
.content-card:hover * {
  transform: translateZ(30px) !important;
  text-shadow: -2px 0 0 rgba(255,0,0,0.5), 2px 0 0 rgba(0,255,255,0.5) !important;
}

/* 5. Header Realitas Baru */
header {
  border-bottom: 2px solid transparent !important;
  border-image: linear-gradient(90deg, #ff0000, #fffb00, #00ffd5, #7a00ff) 1 !important;
  background: rgba(5, 5, 10, 0.9) !important;
  box-shadow: 0 10px 30px rgba(0,0,0,0.8) !important;
}
  `
};

async function main() {
  console.log("Injecting Cosmetic No.13...");
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
