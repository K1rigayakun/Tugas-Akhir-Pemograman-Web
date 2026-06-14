const { PrismaClient } = require('@emerald-kingdom/db');
const prisma = new PrismaClient();

const cos = {
  id: "avatar_frame_03",
  name: "Ruby Aristocrat",
  type: "FRAME",
  rarity: "RARE",
  obtainMethod: "SHOP",
  shopPrice: 500,
  imageUrl: "https://images.unsplash.com/photo-1596766782299-1bd91e6b3eb1?w=800&q=80",
  description: "Permata merah yang mengelilingi avatar. Memancarkan aura bangsawan yang menawan dengan kedipan merah darah secara perlahan.",
  webCode: `
%SCOPE%::after {
  content: '';
  position: absolute;
  top: -4px; left: -4px; right: -4px; bottom: -4px;
  border-radius: 50%;
  pointer-events: none;
  z-index: 10;
  border: 4px solid #be123c;
  animation: ruby-pulse 3s infinite alternate;
}

@keyframes ruby-pulse {
  0% {
    box-shadow: 0 0 5px rgba(225, 29, 72, 0.2), inset 0 0 5px rgba(225, 29, 72, 0.2);
    border-color: #9f1239;
  }
  100% {
    box-shadow: 0 0 25px rgba(225, 29, 72, 0.8), inset 0 0 15px rgba(225, 29, 72, 0.8);
    border-color: #f43f5e;
  }
}
  `
};

async function main() {
  console.log("Injecting Avatar Frame No.3...");
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
