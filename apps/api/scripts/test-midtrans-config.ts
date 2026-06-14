/**
 * Test script to verify Midtrans SDK installation and configuration
 * 
 * Usage:
 *   npx ts-node -r tsconfig-paths/register scripts/test-midtrans-config.ts
 */

import { config } from 'dotenv';
import * as path from 'path';

// Load environment variables from root .env
config({ path: path.resolve(__dirname, '../../../.env') });

console.log('='.repeat(60));
console.log('Midtrans Configuration Test');
console.log('='.repeat(60));

// Test 1: Check if midtrans-client package is installed
console.log('\n1️⃣  Testing midtrans-client package installation...');
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const midtransClient = require('midtrans-client');
  console.log('✅ midtrans-client package is installed');
  console.log('   Available modules:', Object.keys(midtransClient).join(', '));
} catch (error) {
  console.error('❌ midtrans-client package not found');
  console.error('   Run: cd apps/api && npm install midtrans-client');
  process.exit(1);
}

// Test 2: Check environment variables
console.log('\n2️⃣  Testing environment variables...');
const serverKey = process.env.MIDTRANS_SERVER_KEY;
const clientKey = process.env.MIDTRANS_CLIENT_KEY;
const isSandbox = process.env.MIDTRANS_IS_SANDBOX;

if (!serverKey) {
  console.error('❌ MIDTRANS_SERVER_KEY is not set in .env');
  process.exit(1);
}
if (!clientKey) {
  console.error('❌ MIDTRANS_CLIENT_KEY is not set in .env');
  process.exit(1);
}

console.log('✅ Environment variables found:');
console.log(`   MIDTRANS_SERVER_KEY: ${serverKey.substring(0, 10)}...${serverKey.substring(serverKey.length - 4)}`);
console.log(`   MIDTRANS_CLIENT_KEY: ${clientKey.substring(0, 10)}...${clientKey.substring(clientKey.length - 4)}`);
console.log(`   MIDTRANS_IS_SANDBOX: ${isSandbox}`);

// Check for placeholder values
if (serverKey.includes('your-key-here') || clientKey.includes('your-key-here')) {
  console.log('\n⚠️  WARNING: Using placeholder credentials!');
  console.log('   Update your .env with real keys from:');
  console.log('   https://dashboard.sandbox.midtrans.com/settings/config_info');
} else {
  console.log('✅ Using real credentials (not placeholders)');
}

// Test 3: Test SDK initialization
console.log('\n3️⃣  Testing SDK initialization...');
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { Snap, CoreApi } = require('midtrans-client');
  
  const snapClient = new Snap({
    isProduction: isSandbox !== 'true',
    serverKey: serverKey,
    clientKey: clientKey,
  });
  
  const coreApiClient = new CoreApi({
    isProduction: isSandbox !== 'true',
    serverKey: serverKey,
    clientKey: clientKey,
  });
  
  console.log('✅ Snap client initialized successfully');
  console.log('   Mode:', isSandbox === 'true' ? 'SANDBOX' : 'PRODUCTION');
  console.log('✅ Core API client initialized successfully');
} catch (error) {
  console.error('❌ SDK initialization failed:', error instanceof Error ? error.message : String(error));
  process.exit(1);
}

// Test 4: Verify configuration module
console.log('\n4️⃣  Testing configuration module...');
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { loadMidtransConfig } = require('../src/config/midtrans.config');
  const config = loadMidtransConfig();
  console.log('✅ Configuration module loaded successfully');
  console.log('   Config:', {
    serverKey: config.serverKey.substring(0, 10) + '...',
    clientKey: config.clientKey.substring(0, 10) + '...',
    isSandbox: config.isSandbox,
  });
} catch (error) {
  console.error('❌ Configuration module test failed:', error instanceof Error ? error.message : String(error));
  process.exit(1);
}

console.log('\n' + '='.repeat(60));
console.log('✅ All tests passed! Midtrans is configured correctly.');
console.log('='.repeat(60));

console.log('\n📝 Next steps:');
console.log('   1. If using placeholder keys, update .env with real Midtrans keys');
console.log('   2. Proceed to Task 4.2: Implement MidtransProvider class');
console.log('   3. Configure webhook URL in Midtrans dashboard');
console.log('\n');
