import { PrismaClient, Rank, KYCStatus, PrivacyMode } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('michael123', 10);
  
  const user = await prisma.user.create({
    data: {
      username: 'Michael_Emperor',
      email: 'michael@museum.com',
      passwordHash,
      emailVerified: true,
      rank: Rank.EMPEROR,
      totalExp: 10000000, // 10 million exp
      winStreak: 100,
      longestStreak: 150,
      totalWins: 500,
      totalBids: 1000,
      kycStatus: KYCStatus.APPROVED,
      privacyMode: PrivacyMode.PUBLIC,
      walletAccount: {
        create: {
          balance: 1000000000, // 1 billion Crown Coins
        }
      }
    }
  });

  console.log('Created user:', user.username);
  console.log('Email: michael@museum.com');
  console.log('Password: michael123');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
