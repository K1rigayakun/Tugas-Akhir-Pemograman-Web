const { PrismaClient } = require('@emerald-kingdom/db');
const prisma = new PrismaClient();

const cos = {
  id: "avatar_frame_09",
  name: "Black Hole",
  type: "FRAME",
  rarity: "MYTHIC",
  obtainMethod: "RANK",
  shopPrice: null,
  requiredRank: "SOVEREIGN",
  imageUrl: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&q=80",
  splineUrl: "https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode", // Spline 3D Black Hole
  description: "Singularitas ruang dan waktu. Menyedot semua cahaya dan pandangan yang berani menatapnya.",
  webCode: `
%SCOPE%::before {
  content: '';
  position: absolute;
  top: -15px; left: -15px; right: -15px; bottom: -15px;
  border-radius: 50%;
  pointer-events: none;
  z-index: 9;
  background: conic-gradient(from 0deg, #000000 0%, #1a0b2e 20%, #000000 40%, #3b0764 60%, #000000 80%, #1a0b2e 100%);
  -webkit-mask: radial-gradient(circle, transparent 60%, black 75%);
  mask: radial-gradient(circle, transparent 60%, black 75%);
  animation: blackhole-spin 1.5s linear infinite;
}

%SCOPE%::after {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  border-radius: 50%;
  pointer-events: none;
  z-index: 10;
  box-shadow: inset 0 0 50px #000000, inset 0 0 20px #3b0764;
  border: 2px solid rgba(0, 0, 0, 0.8);
  animation: blackhole-suck 3s ease-in-out infinite alternate;
}

@keyframes blackhole-spin {
  0% { transform: rotate(0deg) scale(1); }
  50% { transform: rotate(180deg) scale(0.95); }
  100% { transform: rotate(360deg) scale(1); }
}

@keyframes blackhole-suck {
  0% { box-shadow: inset 0 0 40px #000, inset 0 0 10px #3b0764; }
  100% { box-shadow: inset 0 0 80px #000, inset 0 0 30px #4c1d95; }
}
  `
};

async function main() {
  console.log("Injecting Avatar Frame No.9...");
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
