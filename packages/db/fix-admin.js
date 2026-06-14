const { PrismaClient } = require('@prisma/client');
const argon2 = require('argon2');

const p = new PrismaClient();

async function main() {
  // Fix admin password with argon2
  const newHash = await argon2.hash('admin123', {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });

  await p.user.update({
    where: { email: 'admin@aurumimperium.com' },
    data: { 
      passwordHash: newHash,
      emailVerified: true,
    }
  });
  console.log('Admin password updated (argon2id)');

  // Fix all test users too
  const testUsers = [
    'civis@test.com',
    'baron@test.com', 
    'earl@test.com',
    'duke@test.com',
    'emperor@test.com',
  ];

  const testHash = await argon2.hash('password123', {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });

  for (const email of testUsers) {
    await p.user.update({
      where: { email },
      data: { 
        passwordHash: testHash,
        emailVerified: true,
      }
    });
    console.log(`Fixed: ${email}`);
  }

  // Also fix other seeded users
  const otherUsers = [
    'auction@emeraldkingdom.id',
    'kyc@emeraldkingdom.id',
    'baron@demo.id',
    'earl@demo.id',
    'marquis@demo.id',
    'civis@demo.id',
    'knight@demo.id',
    'admin@emeraldkingdom.id',
  ];

  for (const email of otherUsers) {
    try {
      await p.user.update({
        where: { email },
        data: { 
          passwordHash: testHash,
          emailVerified: true,
        }
      });
      console.log(`Fixed: ${email}`);
    } catch (e) {
      // user might not exist, skip
    }
  }

  console.log('\nAll passwords fixed to argon2id!');
  console.log('Admin: admin@aurumimperium.com / admin123');
  console.log('Test users: password123');
}

main().finally(() => p.$disconnect());
