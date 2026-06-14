const { PrismaClient } = require('@emerald-kingdom/db');
const prisma = new PrismaClient();

const cos = {
  id: "avatar_frame_02",
  name: "Emerald Scholar",
  type: "FRAME",
  rarity: "UNCOMMON",
  obtainMethod: "ACHIEVEMENT",
  shopPrice: 0,
  imageUrl: "https://images.unsplash.com/photo-1599839619722-39751411ea63?w=800&q=80",
  description: "Cincin hijau zamrud yang melambangkan pengetahuan. Memancarkan cahaya tenang yang menyejukkan.",
  webCode: `
%SCOPE%::after {
  content: '';
  position: absolute;
  top: -4px; left: -4px; right: -4px; bottom: -4px;
  border-radius: 50%;
  pointer-events: none;
  z-index: 10;
  border: 4px solid rgba(16, 185, 129, 0.8);
  box-shadow: 0 0 15px rgba(16, 185, 129, 0.4), inset 0 0 10px rgba(16, 185, 129, 0.5);
}
  `
};

async function main() {
  console.log("Injecting Avatar Frame No.2...");
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
