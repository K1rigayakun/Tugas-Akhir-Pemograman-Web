const { PrismaClient } = require('@emerald-kingdom/db');
const prisma = new PrismaClient();

const cos = {
  id: "avatar_frame_01",
  name: "Noble Brass",
  type: "FRAME",
  rarity: "COMMON",
  obtainMethod: "SHOP",
  shopPrice: 100,
  imageUrl: "https://images.unsplash.com/photo-1542382156909-92f9f1f2a33f?w=800&q=80",
  description: "Cincin kuningan solid yang menunjukkan awal dari sebuah perjalanan. Sederhana, namun abadi.",
  webCode: `
%SCOPE%::after {
  content: '';
  position: absolute;
  top: -4px; left: -4px; right: -4px; bottom: -4px;
  border-radius: 50%;
  pointer-events: none;
  z-index: 10;
  border: 4px solid #b4a072;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.1);
}
  `
};

async function main() {
  console.log("Injecting Avatar Frame No.1...");
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
