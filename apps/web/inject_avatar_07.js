const { PrismaClient } = require('@emerald-kingdom/db');
const prisma = new PrismaClient();

const cos = {
  id: "avatar_frame_07",
  name: "Cyberpunk Ring",
  type: "FRAME",
  rarity: "LEGENDARY",
  obtainMethod: "AUCTION",
  shopPrice: null,
  imageUrl: "https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800&q=80",
  splineUrl: "https://prod.spline.design/7cE3LwXgZgKj5JbP/scene.splinecode", // Spline 3D Hologram
  description: "Cincin neon Pink & Cyan bergaya Sci-Fi. Teknologi tingkat tinggi yang memanipulasi ruang waktu dengan distorsi digital.",
  webCode: `
%SCOPE%::before {
  content: '';
  position: absolute;
  top: -10px; left: -10px; right: -10px; bottom: -10px;
  border-radius: 50%;
  pointer-events: none;
  z-index: 9;
  border: 3px dashed #00f3ff;
  box-shadow: 0 0 15px rgba(0, 243, 255, 0.6);
  animation: cyberpunk-spin 8s linear infinite, cyberpunk-glitch 5s infinite;
}

%SCOPE%::after {
  content: '';
  position: absolute;
  top: -4px; left: -4px; right: -4px; bottom: -4px;
  border-radius: 50%;
  pointer-events: none;
  z-index: 10;
  border: 4px dotted #ff00ff;
  box-shadow: inset 0 0 15px rgba(255, 0, 255, 0.4), 0 0 20px rgba(255, 0, 255, 0.6);
  animation: cyberpunk-spin-reverse 6s linear infinite;
}

@keyframes cyberpunk-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes cyberpunk-spin-reverse {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(-360deg); }
}

@keyframes cyberpunk-glitch {
  0%, 90%, 100% { transform: translate(0, 0) scale(1) skew(0deg); opacity: 1; }
  92% { transform: translate(-3px, 2px) scale(1.02) skew(2deg); opacity: 0.8; border-color: #ff00ff; }
  94% { transform: translate(3px, -2px) scale(0.98) skew(-2deg); opacity: 0.9; }
  96% { transform: translate(-2px, -3px) scale(1.05) skew(1deg); opacity: 0.5; border-color: #fff; }
  98% { transform: translate(2px, 3px) scale(1) skew(-1deg); opacity: 1; }
}
  `
};

async function main() {
  console.log("Injecting Avatar Frame No.7...");
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
