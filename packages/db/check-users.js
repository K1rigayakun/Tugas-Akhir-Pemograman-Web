const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  const user = await p.user.findUnique({
    where: { email: 'civis@test.com' },
    select: { email: true, username: true, rank: true }
  });
  console.log('CIVIS:', JSON.stringify(user));
  
  const allUsers = await p.user.findMany({
    select: { email: true, username: true, rank: true }
  });
  console.log('ALL USERS:', JSON.stringify(allUsers));
}

main().finally(() => p.$disconnect());
