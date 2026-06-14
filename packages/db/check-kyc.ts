import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // 1. Cek adminRole semua admin user
  const admins = await prisma.user.findMany({
    where: { email: { in: ["admin@emeraldkingdom.id", "auction@emeraldkingdom.id", "kyc@emeraldkingdom.id"] } },
    select: { email: true, adminRole: true, rank: true, username: true },
  });
  console.log("=== ADMIN USERS ===");
  admins.forEach(a => console.log(`  ${a.email} | adminRole: ${a.adminRole} | rank: ${a.rank}`));

  // 2. Cek semua data KYC
  const kycSubmissions = await prisma.userKYC.findMany({
    include: { user: { select: { email: true, username: true, kycStatus: true } } },
  });
  console.log(`\n=== KYC SUBMISSIONS (${kycSubmissions.length} total) ===`);
  kycSubmissions.forEach(k => {
    console.log(`  ID: ${k.id} | User: ${k.user?.email} | Status: ${k.kycStatus} | Submitted: ${k.submittedAt}`);
  });

  // 3. Cek semua user dan kycStatus mereka
  const allUsers = await prisma.user.findMany({
    select: { email: true, kycStatus: true },
  });
  console.log(`\n=== ALL USERS KYC STATUS ===`);
  allUsers.forEach(u => console.log(`  ${u.email} | kycStatus: ${u.kycStatus}`));
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
