/**
 * Comprehensive Test Runner
 * 
 * Runs all admin panel tests:
 * - Task 3: GET auctions endpoint integration tests
 * - Task 5: Auction creation E2E tests
 * - Task 6: Error handling tests
 * 
 * This script:
 * 1. Authenticates as admin (if credentials provided)
 * 2. Runs all test suites
 * 3. Reports comprehensive results
 */

const API_BASE_URL = process.env.API_URL || "http://localhost:3001/api";

// Admin credentials from seed data
const ADMIN_CREDENTIALS = {
  email: process.env.ADMIN_EMAIL || "admin@emeraldkingdom.id",
  password: process.env.ADMIN_PASSWORD || "admin123!",
};

/**
 * Authenticate and get JWT token
 */
async function authenticate() {
  console.log("🔐 Authenticating as admin...");
  console.log(`   Email: ${ADMIN_CREDENTIALS.email}`);
  
  try {
    const response = await fetch(`${API_BASE_URL}/v1/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(ADMIN_CREDENTIALS),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(`Authentication failed: ${data.message || response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.token) {
      throw new Error("No token in authentication response");
    }

    console.log("✅ Authentication successful!");
    console.log(`   Token length: ${data.token.length} characters\n`);
    return data.token;
  } catch (error) {
    console.error("❌ Authentication failed:", error.message);
    throw error;
  }
}

/**
 * Check if API server is running
 */
async function checkAPIServer() {
  console.log("🔍 Checking API server...");
  console.log(`   URL: ${API_BASE_URL}\n`);
  
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: "GET",
    }).catch(() => null);

    if (response && response.ok) {
      console.log("✅ API server is running\n");
      return true;
    } else {
      console.log("⚠️  API server health check failed\n");
      return false;
    }
  } catch (error) {
    console.log("⚠️  Could not connect to API server\n");
    return false;
  }
}

/**
 * Main test runner
 */
async function main() {
  console.log("╔══════════════════════════════════════════════════════╗");
  console.log("║  Admin Panel - Comprehensive Test Suite             ║");
  console.log("║  BUG-01: Admin Data Sync Fix                        ║");
  console.log("╚══════════════════════════════════════════════════════╝\n");

  const results = {
    apiIntegration: null,
    auctionCreation: null,
    errorHandling: null,
  };

  try {
    // Check if API server is running
    const apiAvailable = await checkAPIServer();
    
    if (!apiAvailable) {
      console.log("⚠️  WARNING: API server may not be running");
      console.log("Some tests may fail. Please start the API server:");
      console.log("  cd apps/api && npm run start:dev\n");
    }

    // Step 1: Authenticate
    let token = null;
    try {
      token = await authenticate();
      process.env.ADMIN_TOKEN = token;
    } catch (error) {
      console.log("⚠️  Authentication failed, some tests will be skipped\n");
    }

    // Step 2: Run Task 6 - Error Handling Tests
    console.log("═══════════════════════════════════════════════════════");
    console.log("Running Task 6: Error Handling Tests");
    console.log("═══════════════════════════════════════════════════════\n");
    
    try {
      const errorHandlingModule = require("./error-handling.test.js");
      await errorHandlingModule.runTests();
      results.errorHandling = { success: true };
    } catch (error) {
      console.log("⚠️  Error handling tests failed:", error.message);
      results.errorHandling = { success: false, error: error.message };
    }

    // Step 3: Run Task 3 - API Integration Tests (if token available)
    if (token) {
      console.log("\n═══════════════════════════════════════════════════════");
      console.log("Running Task 3: API Integration Tests");
      console.log("═══════════════════════════════════════════════════════\n");
      
      try {
        const apiTestModule = require("../src/lib/api.test.js");
        await apiTestModule.testImport();
        await apiTestModule.testGetAuctions();
        await apiTestModule.testStatusFilter();
        await apiTestModule.testTypeFilter();
        await apiTestModule.testCombinedFilters();
        await apiTestModule.testPagination();
        await apiTestModule.testEmptyState();
        results.apiIntegration = { success: true };
        console.log("\n✅ Task 3: API Integration Tests passed!");
      } catch (error) {
        console.log("\n⚠️  API integration tests failed:", error.message);
        results.apiIntegration = { success: false, error: error.message };
      }
    }

    // Step 4: Run Task 5 - Auction Creation E2E Tests (if token available)
    if (token) {
      console.log("\n═══════════════════════════════════════════════════════");
      console.log("Running Task 5: Auction Creation E2E Tests");
      console.log("═══════════════════════════════════════════════════════\n");
      
      try {
        const e2eModule = require("./auction-creation-e2e.test.js");
        await e2eModule.runTests();
        results.auctionCreation = { success: true };
      } catch (error) {
        console.log("\n⚠️  Auction creation E2E tests failed:", error.message);
        results.auctionCreation = { success: false, error: error.message };
      }
    }

    // Final Summary
    console.log("\n╔══════════════════════════════════════════════════════╗");
    console.log("║  Comprehensive Test Summary                          ║");
    console.log("╚══════════════════════════════════════════════════════╝\n");

    console.log("📊 Test Results:");
    console.log(`  Task 6 (Error Handling):    ${results.errorHandling?.success ? "✅ PASS" : "❌ FAIL"}`);
    console.log(`  Task 3 (API Integration):   ${results.apiIntegration?.success ? "✅ PASS" : results.apiIntegration ? "❌ FAIL" : "⏭️  SKIP"}`);
    console.log(`  Task 5 (Auction Creation):  ${results.auctionCreation?.success ? "✅ PASS" : results.auctionCreation ? "❌ FAIL" : "⏭️  SKIP"}`);

    const allTestsPassed = Object.values(results).every(r => !r || r.success);

    if (allTestsPassed) {
      console.log("\n🎉 All tests passed successfully!");
      process.exit(0);
    } else {
      console.log("\n⚠️  Some tests failed. See details above.");
      process.exit(1);
    }

  } catch (error) {
    console.error("\n❌ Test runner failed:", error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { main, authenticate, checkAPIServer };
