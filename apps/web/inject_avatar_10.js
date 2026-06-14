const { PrismaClient } = require('@emerald-kingdom/db');
const prisma = new PrismaClient();

const cos = {
  id: "avatar_frame_10",
  name: "The Emperor's Crown",
  type: "FRAME",
  rarity: "MYTHIC",
  obtainMethod: "RANK",
  shopPrice: null,
  requiredRank: "EMPEROR",
  imageUrl: "https://images.unsplash.com/photo-1574691456906-8d6ceb8089dc?w=800&q=80",
  splineUrl: "https://prod.spline.design/qZcwlZ6i9Kz8Gj0S/scene.splinecode", // Spline 3D Crown
  description: "Mahkota keagungan tertinggi. Melayang dalam gravitasi surgawi dengan pancaran cahaya yang tidak terhingga.",
  webCode: `
%SCOPE% {
  animation: emperor-levitate 4s ease-in-out infinite alternate !important;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8) !important;
}

%SCOPE%::before {
  content: '';
  position: absolute;
  top: -20px; left: -20px; right: -20px; bottom: -20px;
  border-radius: 50%;
  pointer-events: none;
  z-index: 9;
  background: conic-gradient(
    from 0deg,
    #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3, #ff0000
  );
  -webkit-mask: radial-gradient(circle, transparent 55%, black 70%);
  mask: radial-gradient(circle, transparent 55%, black 70%);
  animation: emperor-aurora 6s linear infinite;
  filter: blur(8px) brightness(1.5);
  opacity: 0.8;
}

%SCOPE%::after {
  content: '';
  position: absolute;
  top: -4px; left: -4px; right: -4px; bottom: -4px;
  border-radius: 50%;
  pointer-events: none;
  z-index: 10;
  border: 4px solid #fff;
  box-shadow: inset 0 0 20px #fbbf24, 0 0 30px #fbbf24, 0 0 60px #fff;
  border-color: #fbbf24;
}

@keyframes emperor-levitate {
  0% { transform: translateY(0px); }
  100% { transform: translateY(-15px); }
}

@keyframes emperor-aurora {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
  `
};

async function main() {
  console.log("Injecting Avatar Frame No.10...");
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
