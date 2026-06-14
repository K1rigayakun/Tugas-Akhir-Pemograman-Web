const { PrismaClient } = require('@emerald-kingdom/db');
const prisma = new PrismaClient();

const cos = {
  id: "web_radical_05",
  name: "Glacial Prism",
  type: "WEB_CODE",
  rarity: "RARE",
  obtainMethod: "SHOP",
  shopPrice: 1500,
  imageUrl: "https://images.unsplash.com/photo-1518342416301-4470fc335804?w=800&q=80",
  description: "Membekukan waktu. Tampilan menjadi kaca es tebal yang membiaskan cahaya dingin dari kedalaman samudera.",
  webCode: `
/* 1. Sembunyikan Kanvas Bawaan Secara Total */
#emerald-bg-canvas {
  display: none !important;
}

/* 2. Latar Belakang Beku Bergerak */
html::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: -2;
  pointer-events: none;
  background: linear-gradient(135deg, #0f172a 0%, #082f49 50%, #1e1b4b 100%) !important;
}

html::after {
  content: '';
  position: fixed;
  inset: -50%;
  z-index: -1;
  pointer-events: none;
  background: radial-gradient(circle at 50% 50%, rgba(56, 189, 248, 0.15) 0%, transparent 60%);
  animation: glacial-drift 20s linear infinite;
}

@keyframes glacial-drift {
  0% { transform: rotate(0deg) translateY(0); }
  50% { transform: rotate(180deg) translateY(-20px); }
  100% { transform: rotate(360deg) translateY(0); }
}

/* 3. Warna Biru Es */
:root {
  --color-emerald: #38bdf8 !important;
  --color-gold: #22d3ee !important;
}

body * {
  text-shadow: 0 0 5px rgba(34,211,238,0.2) !important;
}

/* 4. Transformasi Kartu: Kaca Es Tebal */
.content-card {
  background: rgba(255, 255, 255, 0.05) !important;
  backdrop-filter: blur(25px) saturate(120%) !important;
  -webkit-backdrop-filter: blur(25px) saturate(120%) !important;
  border: 1px solid rgba(255, 255, 255, 0.15) !important;
  border-top: 1px solid rgba(255, 255, 255, 0.3) !important;
  border-bottom: 2px solid transparent !important;
  border-radius: 16px !important;
  transition: all 0.4s ease !important;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5) !important;
}

.content-card:hover {
  transform: translateY(-5px) !important;
  background: rgba(255, 255, 255, 0.1) !important;
  backdrop-filter: blur(25px) brightness(1.3) saturate(150%) !important;
  -webkit-backdrop-filter: blur(25px) brightness(1.3) saturate(150%) !important;
  border-bottom: 2px solid #22d3ee !important;
  box-shadow: 0 15px 40px rgba(34,211,238,0.2) !important;
}

/* 5. Header Transparan Beku */
header {
  border-bottom: 1px solid rgba(255,255,255,0.1) !important;
  background: rgba(15, 23, 42, 0.5) !important;
  backdrop-filter: blur(30px) !important;
}
  `
};

async function main() {
  console.log("Injecting Cosmetic No.5...");
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
