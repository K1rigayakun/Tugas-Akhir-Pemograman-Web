const { PrismaClient } = require('@emerald-kingdom/db');
const prisma = new PrismaClient();

const cos = {
  id: "avatar_frame_08",
  name: "Infernal Halo",
  type: "FRAME",
  rarity: "LEGENDARY",
  obtainMethod: "AUCTION",
  shopPrice: null,
  imageUrl: "https://images.unsplash.com/photo-1542281286-9e0a16bb7366?w=800&q=80",
  splineUrl: "https://prod.spline.design/qZcwlZ6i9Kz8Gj0S/scene.splinecode", // Spline 3D Api
  description: "Lingkaran api neraka murni. Berkedip liar dan membakar apa pun yang terlalu dekat.",
  webCode: `
%SCOPE%::after {
  content: '';
  position: absolute;
  top: -6px; left: -6px; right: -6px; bottom: -6px;
  border-radius: 50%;
  pointer-events: none;
  z-index: 10;
  border: 4px solid #ff4500;
  animation: infernal-flicker 0.15s infinite alternate;
}

%SCOPE%::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  border-radius: 50%;
  pointer-events: none;
  z-index: 11;
  box-shadow: inset 0 0 20px rgba(255, 69, 0, 0.8), inset 0 0 40px rgba(255, 0, 0, 0.6);
  animation: infernal-glow 2s ease-in-out infinite alternate;
}

@keyframes infernal-flicker {
  0% {
    box-shadow: 0 0 10px #ff4500, 0 0 20px #ff0000, 0 0 30px #8b0000;
    opacity: 0.9;
    transform: scale(1);
  }
  50% {
    box-shadow: 0 0 15px #ff4500, 0 0 25px #ff6347, 0 0 35px #ff0000;
    opacity: 1;
    transform: scale(1.02);
  }
  100% {
    box-shadow: 0 0 12px #ff4500, 0 0 22px #ff0000, 0 0 32px #8b0000;
    opacity: 0.85;
    transform: scale(0.99);
  }
}

@keyframes infernal-glow {
  0% { filter: contrast(1.2) brightness(1); }
  100% { filter: contrast(1.5) brightness(1.2); }
}
  `
};

async function main() {
  console.log("Injecting Avatar Frame No.8...");
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
