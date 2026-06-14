import { PrismaClient } from "@prisma/client";
import * as argon2 from "argon2";

const prisma = new PrismaClient();

async function main() {
  // 1. Cek user di database
  const user = await prisma.user.findUnique({
    where: { email: "knight@demo.id" },
    select: {
      id: true,
      email: true,
      passwordHash: true,
      emailVerified: true,
      isSuspended: true,
      deletedAt: true,
    },
  });

  if (!user) {
    console.log("USER TIDAK DITEMUKAN DI DATABASE!");
    return;
  }

  console.log("User ditemukan:");
  console.log("  ID:", user.id);
  console.log("  Email:", user.email);
  console.log("  Email Verified:", user.emailVerified);
  console.log("  Suspended:", user.isSuspended);
  console.log("  Deleted:", user.deletedAt);
  console.log("  Hash (50 char):", user.passwordHash.substring(0, 50) + "...");

  // 2. Verifikasi password dengan argon2
  const testPassword = "user123!";
  
  // Test dengan argon2.verify langsung
  try {
    const result = await argon2.verify(user.passwordHash, testPassword);
    console.log("\n  argon2.verify result:", result);
  } catch (err) {
    console.log("\n  argon2.verify ERROR:", err);
  }

  // 3. Test hash baru dan bandingkan format
  const newHash = await argon2.hash(testPassword, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });
  console.log("\n  New hash format:", newHash.substring(0, 50) + "...");
  console.log("  DB  hash format:", user.passwordHash.substring(0, 50) + "...");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
