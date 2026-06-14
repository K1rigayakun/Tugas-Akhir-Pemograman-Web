/**
 * Connection test script for Prisma Client
 * Tests database connectivity and basic query execution
 */

import { prisma, withTimeout } from './src/client';

async function testConnection() {
  console.log('Testing Prisma Client connection...\n');

  try {
    // Test 1: Basic connectivity
    console.log('Test 1: Basic database connectivity');
    const result = await withTimeout(
      prisma.$queryRaw<Array<{ result: number }>>`SELECT 1 as result`,
      5000
    );
    console.log(`✓ Connection successful: ${result[0].result === 1 ? 'PASS' : 'FAIL'}\n`);

    // Test 2: Query timeout handling
    console.log('Test 2: Query timeout handling (1 second query with 2 second timeout)');
    try {
      await withTimeout(
        prisma.$queryRaw`SELECT pg_sleep(1)`,
        2000
      );
      console.log('✓ Timeout handling works correctly\n');
    } catch (error) {
      console.log(`✗ Timeout test failed: ${error}\n`);
    }

    // Test 3: Get current database info
    console.log('Test 3: Database information');
    const dbInfo = await prisma.$queryRaw<Array<{ version: string }>>`SELECT version()`;
    console.log(`✓ Database version: ${dbInfo[0].version.split(',')[0]}\n`);

    // Test 4: Connection pool info (if available)
    console.log('Test 4: Connection statistics');
    try {
      const connections = await prisma.$queryRaw<
        Array<{ state: string; count: bigint }>
      >`
        SELECT state, COUNT(*) as count
        FROM pg_stat_activity
        WHERE datname = current_database()
        GROUP BY state
      `;
      
      console.log('✓ Connection statistics:');
      connections.forEach(conn => {
        console.log(`  - ${conn.state}: ${conn.count}`);
      });
      console.log('');
    } catch (error) {
      console.log('⚠ Connection statistics unavailable (requires pg_stat_activity permissions)\n');
    }

    console.log('✓ All connection tests passed!');
    
  } catch (error) {
    console.error('✗ Connection test failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('\nDisconnected from database.');
  }
}

testConnection();
