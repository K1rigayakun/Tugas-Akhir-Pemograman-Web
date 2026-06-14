import { PrismaClient } from "@prisma/client";
import * as argon2 from "argon2";

const prisma = new PrismaClient();

async function main() {
  console.log("Re-hashing passwords...\n");

  const adminHash = await argon2.hash("admin123!", {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });
  console.log("Admin hash sample:", adminHash.substring(0, 60));

  const userHash = await argon2.hash("user123!", {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });
  console.log("User  hash sample:", userHash.substring(0, 60));

  // Update admin users
  const adminEmails = [
    "admin@emeraldkingdom.id",
    "auction@emeraldkingdom.id",
    "kyc@emeraldkingdom.id",
  ];

  for (const email of adminEmails) {
    const res = await prisma.user.updateMany({
      where: { email },
      data: { passwordHash: adminHash },
    });
    console.log(`  Updated ${email}: ${res.count} row(s)`);
  }

  // Update regular users
  const userEmails = [
    "knight@demo.id",
    "baron@demo.id",
    "earl@demo.id",
    "marquis@demo.id",
    "civis@demo.id",
  ];

  for (const email of userEmails) {
    const res = await prisma.user.updateMany({
      where: { email },
      data: { passwordHash: userHash },
    });
    console.log(`  Updated ${email}: ${res.count} row(s)`);
  }

  // Verify
  const knight = await prisma.user.findUnique({
    where: { email: "knight@demo.id" },
    select: { passwordHash: true },
  });
  if (knight) {
    const ok = await argon2.verify(knight.passwordHash, "user123!");
    console.log(`\nVerification test (knight@demo.id / user123!): ${ok ? "SUCCESS" : "FAILED"}`);
  }

  console.log("\nDone! All passwords re-hashed with proper Argon2id format.");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
