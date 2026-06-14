const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  try {
    await prisma.$executeRawUnsafe('ALTER TABLE "auctions" ADD COLUMN "requiredAchievementId" text;');
    console.log('Column added');
  } catch (e) {
    console.error('Error adding column:', e.message);
  }
}
main().finally(() => prisma.$disconnect());
