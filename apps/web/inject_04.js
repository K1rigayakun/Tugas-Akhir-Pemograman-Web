const { PrismaClient } = require('@emerald-kingdom/db');
const prisma = new PrismaClient();

const cos = {
  id: "web_radical_04",
  name: "The Emperor's Aura",
  type: "WEB_CODE",
  rarity: "MYTHIC",
  obtainMethod: "RANK",
  shopPrice: 0,
  imageUrl: "https://images.unsplash.com/photo-1614850715649-1d0106293cb1?w=800&q=80",
  description: "Hanya untuk penguasa sejati. Aura emas yang bergejolak membakar elemen web dengan animasi 3D reaktif terhadap kursor.",
  webCode: `
/* 1. Sembunyikan Kanvas Bawaan Secara Total */
#emerald-bg-canvas {
  display: none !important;
}

/* 2. Latar Belakang Aura Emas (Reaktif terhadap Mouse) */
html::before {
  content: '';
  position: fixed;
  inset: -100px;
  z-index: -2;
  pointer-events: none;
  background: radial-gradient(circle at calc(var(--mouse-x) * 1px) calc(var(--mouse-y) * 1px), rgba(245, 158, 11, 0.2) 0%, rgba(0, 0, 0, 1) 60%) !important;
  transition: background 0.1s ease-out;
}

html::after {
  content: '';
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background: repeating-radial-gradient(circle at 50% 50%, rgba(251, 191, 36, 0.03) 0%, rgba(251, 191, 36, 0.05) 5%, transparent 10%);
  animation: emperor-pulse 8s infinite alternate ease-in-out;
}

@keyframes emperor-pulse {
  0% { transform: scale(1); opacity: 0.5; }
  100% { transform: scale(1.5); opacity: 1; }
}

/* 3. Warna Emas Cair */
:root {
  --color-emerald: #f59e0b !important;
  --color-gold: #fbbf24 !important;
}

/* 4. Interaksi 3D Kartu Berdasarkan Mouse */
.content-card {
  background: rgba(30, 20, 0, 0.6) !important;
  border: 1px solid rgba(245, 158, 11, 0.4) !important;
  border-radius: 12px !important;
  transform-style: preserve-3d !important;
  transform: perspective(1000px) 
             rotateX(calc((var(--mouse-y) - 50vh) * -0.015deg)) 
             rotateY(calc((var(--mouse-x) - 50vw) * 0.015deg)) !important;
  transition: transform 0.1s ease-out, border-color 0.3s, box-shadow 0.3s !important;
  will-change: transform;
}

.content-card:hover {
  border-color: #fbbf24 !important;
  background: rgba(60, 40, 0, 0.8) !important;
  transform: perspective(1000px) 
             rotateX(calc((var(--mouse-y) - 50vh) * -0.02deg)) 
             rotateY(calc((var(--mouse-x) - 50vw) * 0.02deg)) 
             scale(1.05) translateZ(20px) !important;
  box-shadow: 0 20px 40px rgba(245, 158, 11, 0.5), inset 0 0 15px rgba(251, 191, 36, 0.3) !important;
}

/* 5. Header Menyala */
header {
  border-bottom: 2px solid #f59e0b !important;
  background: rgba(15, 10, 0, 0.9) !important;
  box-shadow: 0 5px 25px rgba(245, 158, 11, 0.2) !important;
}

/* Elemen teks emas di dalam kartu dibuat pop-out */
.content-card * {
  transform: translateZ(10px) !important;
}
  `
};

async function main() {
  console.log("Injecting Cosmetic No.4...");
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
      create: { userId: admin.id, cosmeticId: cos.id, obtainedFrom: "RANK" },
    });
    console.log("Gave to admin!");
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
