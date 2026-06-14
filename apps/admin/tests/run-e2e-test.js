/**
 * E2E Test Runner with Authentication
 * 
 * This script:
 * 1. Authenticates as admin
 * 2. Runs the E2E auction creation test
 * 3. Reports results
 */

const API_BASE_URL = process.env.API_URL || "http://localhost:3001/api";

// Admin credentials from seed data
const ADMIN_CREDENTIALS = {
  email: "admin@emeraldkingdom.id",
  password: "admin123!",
};

/**
 * Authenticate and get JWT token
 */
async function authenticate() {
  console.log("🔐 Authenticating as admin...");
  
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
    return data.token;
  } catch (error) {
    console.error("❌ Authentication failed:", error.message);
    throw error;
  }
}

/**
 * Main test runner
 */
async function main() {
  console.log("╔══════════════════════════════════════════════════════╗");
  console.log("║  Auction Creation E2E Test Runner                   ║");
  console.log("╚══════════════════════════════════════════════════════╝\n");

  try {
    // Step 1: Authenticate
    const token = await authenticate();
    
    // Step 2: Set token as environment variable
    process.env.ADMIN_TOKEN = token;
    
    // Step 3: Run E2E tests
    console.log("\n🧪 Running E2E tests...\n");
    const testModule = require("./auction-creation-e2e.test.js");
    await testModule.runTests();
    
  } catch (error) {
    console.error("\n❌ Test runner failed:", error.message);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { main, authenticate };
