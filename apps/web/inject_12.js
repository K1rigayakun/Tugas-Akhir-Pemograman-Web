const { PrismaClient } = require('@emerald-kingdom/db');
const prisma = new PrismaClient();

const cos = {
  id: "web_radical_12",
  name: "Celestial Forge",
  type: "WEB_CODE",
  rarity: "MYTHIC",
  obtainMethod: "ACHIEVEMENT",
  shopPrice: 0,
  imageUrl: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800&q=80",
  description: "Tungku dewa yang tak pernah padam. Percikan bintang saling bertabrakan, menciptakan ledakan kosmik setiap kali kamu menyentuhnya.",
  webCode: `
/* 1. Sembunyikan Kanvas Bawaan Secara Total */
#emerald-bg-canvas {
  display: none !important;
}

/* 2. Latar Belakang Tungku Bintang */
html::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: -3;
  pointer-events: none;
  background: radial-gradient(circle at 50% 0%, rgba(251, 191, 36, 0.2) 0%, #0f0a29 80%) !important;
}

/* Serpihan Bintang yang Mengapung (Efek Bintang Jatuh Halus) */
html::after {
  content: '';
  position: fixed;
  top: -50%;
  left: 0;
  width: 100%;
  height: 200%;
  z-index: -2;
  pointer-events: none;
  background-image: radial-gradient(2px 2px at 20px 30px, #ffffff, rgba(0,0,0,0)), radial-gradient(2px 2px at 40px 70px, #fbbf24, rgba(0,0,0,0)), radial-gradient(2px 2px at 50px 160px, rgba(255,255,255,0.5), rgba(0,0,0,0));
  background-size: 200px 200px;
  animation: star-drift 40s linear infinite;
}

@keyframes star-drift {
  0% { transform: translateY(0); }
  100% { transform: translateY(200px); }
}

/* 3. Warna Putih & Emas Kosmik */
:root {
  --color-emerald: #ffffff !important;
  --color-gold: #fbbf24 !important;
}

body * {
  text-shadow: 0 0 5px rgba(251, 191, 36, 0.2) !important;
}

/* 4. Transformasi Kartu: Tilt 3D Lembut & Supernova Hover */
.content-card {
  background: rgba(30, 20, 60, 0.4) !important;
  backdrop-filter: blur(10px) !important;
  border: 1px solid rgba(251, 191, 36, 0.3) !important;
  border-radius: 12px !important;
  transform-style: preserve-3d !important;
  transform: perspective(1200px) 
             rotateX(calc((var(--mouse-y) - 50vh) * -0.01deg)) 
             rotateY(calc((var(--mouse-x) - 50vw) * 0.01deg)) !important;
  transition: transform 0.1s ease-out, border-color 0.4s, box-shadow 0.4s, background 0.4s !important;
  will-change: transform;
}

.content-card:hover {
  background: rgba(60, 40, 100, 0.8) !important;
  border-color: #ffffff !important;
  transform: perspective(1200px) 
             rotateX(calc((var(--mouse-y) - 50vh) * -0.015deg)) 
             rotateY(calc((var(--mouse-x) - 50vw) * 0.015deg)) 
             scale(1.06) translateZ(10px) !important;
  animation: supernova-burst 1s cubic-bezier(0.165, 0.84, 0.44, 1) forwards !important;
}

@keyframes supernova-burst {
  0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.8), inset 0 0 20px rgba(251, 191, 36, 0.8); }
  50% { box-shadow: 0 0 50px 20px rgba(251, 191, 36, 0.1), inset 0 0 10px rgba(251, 191, 36, 0.4); }
  100% { box-shadow: 0 15px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(251, 191, 36, 0.3), inset 0 0 5px rgba(251, 191, 36, 0.2); }
}

/* 5. Header Bintang */
header {
  border-bottom: 2px solid rgba(251, 191, 36, 0.5) !important;
  background: rgba(15, 10, 41, 0.9) !important;
}
  `
};

async function main() {
  console.log("Injecting Cosmetic No.12...");
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
