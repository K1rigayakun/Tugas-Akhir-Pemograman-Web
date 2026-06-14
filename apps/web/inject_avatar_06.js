const { PrismaClient } = require('@emerald-kingdom/db');
const prisma = new PrismaClient();

const cos = {
  id: "avatar_frame_06",
  name: "Golden Crown",
  type: "FRAME",
  rarity: "EPIC",
  obtainMethod: "SHOP",
  shopPrice: 1500,
  imageUrl: "https://images.unsplash.com/photo-1595168499318-7b49cf525367?w=800&q=80",
  splineUrl: "https://prod.spline.design/qZcwlZ6i9Kz8Gj0S/scene.splinecode", // Spline 3D Halo
  description: "Lingkaran emas murni yang memancarkan aura kemuliaan. Cahaya sucinya tidak pernah padam.",
  webCode: `
%SCOPE%::before {
  content: '';
  position: absolute;
  top: -8px; left: -8px; right: -8px; bottom: -8px;
  border-radius: 50%;
  pointer-events: none;
  z-index: 9;
  background: conic-gradient(
    from 0deg, 
    transparent 0%, 
    rgba(255, 215, 0, 0.2) 25%, 
    rgba(255, 215, 0, 0.8) 50%, 
    rgba(255, 255, 255, 1) 55%, 
    rgba(255, 215, 0, 0.8) 60%, 
    rgba(255, 215, 0, 0.2) 75%, 
    transparent 100%
  );
  -webkit-mask: radial-gradient(circle, transparent 65%, black 66%);
  mask: radial-gradient(circle, transparent 65%, black 66%);
  animation: golden-crown-spin 4s linear infinite;
  filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.5));
}

%SCOPE%::after {
  content: '';
  position: absolute;
  top: -4px; left: -4px; right: -4px; bottom: -4px;
  border-radius: 50%;
  pointer-events: none;
  z-index: 10;
  border: 3px solid #fbbf24;
  box-shadow: inset 0 0 15px rgba(251, 191, 36, 0.4), 0 0 20px rgba(251, 191, 36, 0.3);
}

@keyframes golden-crown-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
  `
};

async function main() {
  console.log("Injecting Avatar Frame No.6...");
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
