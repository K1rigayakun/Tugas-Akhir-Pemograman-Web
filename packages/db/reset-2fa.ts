import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Reset 2FA untuk admin - supaya bisa setup ulang
  const result = await prisma.user.update({
    where: { email: "admin@emeraldkingdom.id" },
    data: {
      twoFactorEnabled: false,
      twoFactorSecret: null,
    },
    select: { email: true, twoFactorEnabled: true },
  });
  
  console.log("2FA reset untuk:", result.email);
  console.log("twoFactorEnabled:", result.twoFactorEnabled);
  console.log("\nSekarang login lagi ke admin panel - akan tampil QR code baru untuk di-scan.");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
