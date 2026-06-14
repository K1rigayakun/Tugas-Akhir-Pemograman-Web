const { PrismaClient } = require('@emerald-kingdom/db');
const prisma = new PrismaClient();

const cos = {
  id: "web_radical_06",
  name: "Crimson Tide",
  type: "WEB_CODE",
  rarity: "EPIC",
  obtainMethod: "ACHIEVEMENT",
  shopPrice: 0,
  imageUrl: "https://images.unsplash.com/photo-1542614343-4cb7c82c61d5?w=800&q=80",
  description: "Aliran yang tak pernah berhenti. Jantung kerajaan berdetak kuat dalam balutan warna merah darah yang pekat dan mengancam.",
  webCode: `
/* 1. Sembunyikan Kanvas Bawaan Secara Total */
#emerald-bg-canvas {
  display: none !important;
}

/* 2. Latar Belakang Aliran Merah Darah Gelap */
html::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: -2;
  pointer-events: none;
  background: radial-gradient(circle at 50% 0%, #3f0909 0%, #050000 70%) !important;
}

html::after {
  content: '';
  position: fixed;
  inset: -50%;
  z-index: -1;
  pointer-events: none;
  background: linear-gradient(
    135deg,
    rgba(220, 38, 38, 0) 0%,
    rgba(153, 27, 27, 0.05) 50%,
    rgba(220, 38, 38, 0) 100%
  );
  background-size: 200% 200%;
  animation: blood-flow 15s ease-in-out infinite alternate;
}

@keyframes blood-flow {
  0% { background-position: 0% 0%; }
  100% { background-position: 100% 100%; }
}

/* 3. Warna Merah Vampirik */
:root {
  --color-emerald: #991b1b !important;
  --color-gold: #ef4444 !important;
}

/* 4. Transformasi Kartu: Animasi Detak Jantung saat Hover */
.content-card {
  background: rgba(20, 0, 0, 0.75) !important;
  border: 1px solid rgba(153, 27, 27, 0.3) !important;
  border-radius: 8px !important;
  transition: background 0.3s, box-shadow 0.3s !important;
}

.content-card:hover {
  animation: heartbeat 0.8s ease-in-out forwards !important;
  background: rgba(40, 0, 0, 0.9) !important;
  border-color: #ef4444 !important;
  box-shadow: 0 0 20px rgba(220, 38, 38, 0.4), inset 0 0 10px rgba(153, 27, 27, 0.5) !important;
}

@keyframes heartbeat {
  0% { transform: scale(1); }
  15% { transform: scale(1.04); }
  30% { transform: scale(1); }
  45% { transform: scale(1.04); }
  100% { transform: scale(1.02); }
}

/* 5. Header Tumpahan Merah */
header {
  border-bottom: 2px solid #991b1b !important;
  background: rgba(10, 0, 0, 0.95) !important;
  box-shadow: 0 5px 20px rgba(153, 27, 27, 0.3) !important;
}
  `
};

async function main() {
  console.log("Injecting Cosmetic No.6...");
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
      create: { userId: admin.id, cosmeticId: cos.id, obtainedFrom: "ACHIEVEMENT" },
    });
    console.log("Gave to admin!");
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
