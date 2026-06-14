import { PrismaClient } from '@prisma/client'

async function main() {
  const prisma = new PrismaClient()
  try {
    await prisma.$executeRawUnsafe(`DELETE FROM "cosmetics" WHERE type = 'BADGE'`);
    console.log("Deleted BADGE cosmetics successfully.");
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect()
  }
}

main()

