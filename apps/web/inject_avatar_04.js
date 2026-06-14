const { PrismaClient } = require('@emerald-kingdom/db');
const prisma = new PrismaClient();

const cos = {
  id: "avatar_frame_04",
  name: "Sapphire Knight",
  type: "FRAME",
  rarity: "RARE",
  obtainMethod: "SHOP",
  shopPrice: 600,
  imageUrl: "https://images.unsplash.com/photo-1574691456906-8d6ceb8089dc?w=800&q=80",
  description: "Pelindung safir para ksatria. Ketangguhan baja biru yang memancarkan kilatan cahaya pedang secara konstan.",
  webCode: `
%SCOPE%::after {
  content: '';
  position: absolute;
  top: -6px; left: -6px; right: -6px; bottom: -6px;
  border-radius: 50%;
  pointer-events: none;
  z-index: 10;
  border: 4px solid #1e40af;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.5), 0 5px 15px rgba(30, 64, 175, 0.5);
}

%SCOPE%::before {
  content: '';
  position: absolute;
  top: -6px; left: -6px; right: -6px; bottom: -6px;
  border-radius: 50%;
  pointer-events: none;
  z-index: 11;
  border: 4px solid transparent;
  background: conic-gradient(from 0deg, transparent 70%, rgba(255,255,255,0.8) 85%, transparent 100%) border-box;
  -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: destination-out;
  mask-composite: exclude;
  animation: sapphire-sweep 3s linear infinite;
}

@keyframes sapphire-sweep {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
  `
};

async function main() {
  console.log("Injecting Avatar Frame No.4...");
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
