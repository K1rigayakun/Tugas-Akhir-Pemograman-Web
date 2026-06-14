const { PrismaClient } = require('@emerald-kingdom/db');
const prisma = new PrismaClient();

const cos = {
  id: "web_radical_10",
  name: "Infernal Matrix",
  type: "WEB_CODE",
  rarity: "LEGENDARY",
  obtainMethod: "AUCTION",
  shopPrice: 0,
  imageUrl: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&q=80",
  description: "Jaringan kode yang merusak sistem. Visual terbakar dengan elemen digital yang kacau bagai hujan api.",
  webCode: `
/* 1. Sembunyikan Kanvas Bawaan Secara Total */
#emerald-bg-canvas {
  display: none !important;
}

/* 2. Latar Belakang & Hujan Api Matriks */
html::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: -3;
  pointer-events: none;
  background: #0f0500 !important;
}

html::after {
  content: '';
  position: fixed;
  top: -100%;
  left: 0;
  width: 100%;
  height: 300%;
  z-index: -2;
  pointer-events: none;
  background-image: 
    linear-gradient(rgba(249, 115, 22, 0) 50%, rgba(249, 115, 22, 0.4) 100%),
    repeating-linear-gradient(90deg, transparent, transparent 10px, rgba(220, 38, 38, 0.1) 10px, rgba(220, 38, 38, 0.1) 12px);
  background-size: 100% 50%, 100% 100%;
  animation: rain-fire 3s linear infinite;
}

@keyframes rain-fire {
  0% { transform: translateY(0); }
  100% { transform: translateY(100vh); }
}

/* 3. Warna Oranye & Merah */
:root {
  --color-emerald: #f97316 !important;
  --color-gold: #dc2626 !important;
}

/* 4. Transformasi Kartu: Dotted Fire & Kedipan */
.content-card {
  background: rgba(20, 5, 0, 0.8) !important;
  border: 2px dotted #dc2626 !important;
  border-radius: 0 !important;
  box-shadow: inset 0 0 10px rgba(249, 115, 22, 0.1) !important;
  transition: all 0.2s !important;
}

.content-card:hover {
  background: rgba(40, 10, 0, 0.9) !important;
  border: 2px dashed #f97316 !important;
  animation: flicker-flame 0.15s infinite alternate !important;
}

@keyframes flicker-flame {
  0% { box-shadow: 0 0 10px rgba(249, 115, 22, 0.3), inset 0 0 20px rgba(220, 38, 38, 0.5); transform: translateX(-1px); }
  100% { box-shadow: 0 0 30px rgba(249, 115, 22, 0.6), inset 0 0 5px rgba(220, 38, 38, 0.2); transform: translateX(1px); }
}

/* 5. Header Api */
header {
  border-bottom: 2px dotted #f97316 !important;
  background: rgba(15, 5, 0, 0.95) !important;
}
  `
};

async function main() {
  console.log("Injecting Cosmetic No.10...");
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
