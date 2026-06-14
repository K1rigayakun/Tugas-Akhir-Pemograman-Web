import { PrismaClient, Rank } from '@prisma/client';


const prisma = new PrismaClient();

async function main() {
  console.log('Seeding dummy users for rankings...');

  const ranks = [
    { rank: Rank.EMPEROR, count: 2, baseExp: 1000000, baseSpent: 5000000, maxStreak: 30, baseWins: 50 },
    { rank: Rank.SOVEREIGN, count: 3, baseExp: 500000, baseSpent: 2000000, maxStreak: 20, baseWins: 30 },
    { rank: Rank.DUKE, count: 4, baseExp: 250000, baseSpent: 1000000, maxStreak: 15, baseWins: 20 },
    { rank: Rank.MARQUIS, count: 5, baseExp: 100000, baseSpent: 500000, maxStreak: 10, baseWins: 10 },
    { rank: Rank.EARL, count: 6, baseExp: 50000, baseSpent: 200000, maxStreak: 5, baseWins: 5 },
    { rank: Rank.VISCOUNT, count: 10, baseExp: 25000, baseSpent: 100000, maxStreak: 2, baseWins: 2 },
  ];

  const defaultPassword = "$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa"; // password123

  for (const group of ranks) {
    for (let i = 0; i < group.count; i++) {
      const username = `${group.rank.toString().toLowerCase()}_dummy_${i + 1}`;
      const email = `${username}@test.com`;

      const totalExp = group.baseExp + Math.floor(Math.random() * (group.baseExp * 0.2));
      const totalSpent = group.baseSpent + Math.floor(Math.random() * (group.baseSpent * 0.2));
      const totalTopUp = totalSpent + Math.floor(Math.random() * 50000);
      const balance = Math.floor(Math.random() * 100000);
      
      const winStreak = Math.floor(Math.random() * group.maxStreak);
      const longestStreak = winStreak + Math.floor(Math.random() * 5);
      const totalWins = group.baseWins + Math.floor(Math.random() * 20);
      const totalBids = totalWins * 5 + Math.floor(Math.random() * 50);

      // Upsert User
      const user = await prisma.user.upsert({
        where: { email },
        update: {
          rank: group.rank,
          totalExp,
          winStreak,
          longestStreak,
          totalWins,
          totalBids,
        },
        create: {
          username: `Lord_${username}`,
          email,
          passwordHash: defaultPassword,
          rank: group.rank,
          totalExp,
          winStreak,
          longestStreak,
          totalWins,
          totalBids,
          emailVerified: true,
        }
      });

      // Upsert Wallet
      await prisma.walletAccount.upsert({
        where: { userId: user.id },
        update: {
          totalSpent,
          totalTopUp,
          balance,
        },
        create: {
          userId: user.id,
          totalSpent,
          totalTopUp,
          balance,
        }
      });

      console.log(`Created ${username} - Rank: ${group.rank}, EXP: ${totalExp}, Spent: ${totalSpent}`);
    }
  }

  console.log('Seeding dummy rankings complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
