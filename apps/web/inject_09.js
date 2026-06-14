const { PrismaClient } = require('@emerald-kingdom/db');
const prisma = new PrismaClient();

const cos = {
  id: "web_radical_09",
  name: "Lunar Eclipse",
  type: "WEB_CODE",
  rarity: "EPIC",
  obtainMethod: "SHOP",
  shopPrice: 2000,
  imageUrl: "https://images.unsplash.com/photo-1532692225339-16625890885c?w=800&q=80",
  description: "Saat malam melahap segalanya. Kegelapan total menyelimuti UI, membiarkan elemen web bersinar layaknya cahaya bulan putih-perak yang langka.",
  webCode: `
/* 1. Sembunyikan Kanvas Bawaan Secara Total */
#emerald-bg-canvas {
  display: none !important;
}

/* 2. Latar Belakang & Animasi Gerhana (Lunar Eclipse) */
html::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: -3;
  pointer-events: none;
  background: #000000 !important;
}

/* Bulan Putih Bersinar */
html::after {
  content: '';
  position: fixed;
  top: 10%;
  left: 50%;
  width: 50vw;
  height: 50vw;
  transform: translateX(-50%);
  border-radius: 50%;
  z-index: -2;
  pointer-events: none;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, transparent 60%);
  box-shadow: 0 0 100px rgba(255, 255, 255, 0.1);
}

/* Bayangan Hitam yang Menutupi (Gerhana) */
body::before {
  content: '';
  position: fixed;
  top: 10%;
  left: 50%;
  width: 50vw;
  height: 50vw;
  border-radius: 50%;
  z-index: -1;
  pointer-events: none;
  background: #000000;
  animation: eclipse-move 20s ease-in-out infinite alternate;
}

@keyframes eclipse-move {
  0% { transform: translate(-80%, -10%); }
  50% { transform: translate(-50%, 0%); }
  100% { transform: translate(-20%, 10%); }
}

/* 3. Warna Putih & Perak */
:root {
  --color-emerald: #ffffff !important;
  --color-gold: #d1d5db !important;
}

/* 4. Transformasi Kartu: Monokrom & Restorasi Warna */
.content-card {
  background: rgba(10, 10, 10, 0.8) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 50% 10px 50px 10px !important;
  filter: grayscale(100%) !important;
  transition: all 0.5s ease !important;
}

/* Restorasi Warna Saat Hover + Halo Putih */
.content-card:hover {
  filter: grayscale(0%) !important;
  background: rgba(20, 20, 20, 0.9) !important;
  border-color: #ffffff !important;
  border-radius: 10px !important;
  box-shadow: 0 0 30px rgba(255, 255, 255, 0.3) !important;
  transform: scale(1.03) !important;
}

/* 5. Header Gerhana */
header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.3) !important;
  background: rgba(0, 0, 0, 0.95) !important;
  box-shadow: 0 5px 25px rgba(255, 255, 255, 0.05) !important;
}
  `
};

async function main() {
  console.log("Injecting Cosmetic No.9...");
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
