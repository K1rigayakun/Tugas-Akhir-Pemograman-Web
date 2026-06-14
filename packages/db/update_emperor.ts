import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  await prisma.user.update({
    where: { email: 'emperor@test.com' },
    data: { adminRole: 'SUPER_ADMIN' }
  });
  console.log("Updated emperor role");
}
main().finally(() => prisma.$disconnect());
