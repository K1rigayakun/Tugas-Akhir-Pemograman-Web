const { PrismaClient } = require('@emerald-kingdom/db');
const prisma = new PrismaClient();

const cos = {
  id: "avatar_frame_05",
  name: "Toxic Aura",
  type: "FRAME",
  rarity: "EPIC",
  obtainMethod: "ACHIEVEMENT",
  shopPrice: 0,
  imageUrl: "https://images.unsplash.com/photo-1550684376-efcbd6e3f031?w=800&q=80",
  splineUrl: "https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode", // Spline 3D file URL
  description: "Kabut racun neon yang mematikan namun memikat. Diciptakan dengan partikel 3D yang selalu aktif.",
  webCode: `
%SCOPE%::after {
  content: '';
  position: absolute;
  top: -8px; left: -8px; right: -8px; bottom: -8px;
  border-radius: 50%;
  pointer-events: none;
  z-index: 9;
  border: 4px dashed #39ff14;
  box-shadow: 0 0 20px rgba(57, 255, 20, 0.6), inset 0 0 10px rgba(57, 255, 20, 0.4);
  animation: toxic-spin 10s linear infinite, toxic-pulse 2s ease-in-out infinite alternate;
}

@keyframes toxic-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes toxic-pulse {
  0% {
    box-shadow: 0 0 10px rgba(57, 255, 20, 0.4), inset 0 0 5px rgba(57, 255, 20, 0.2);
    filter: blur(1px);
  }
  100% {
    box-shadow: 0 0 30px rgba(57, 255, 20, 0.9), inset 0 0 15px rgba(57, 255, 20, 0.6);
    filter: blur(2px);
  }
}
  `
};

async function main() {
  console.log("Injecting Avatar Frame No.5...");
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
