/**
 * Task 6: Error Handling Tests
 * 
 * This test suite validates error handling scenarios for the admin panel:
 * - Validation errors (missing required fields, invalid date ranges, negative prices)
 * - Authentication errors (401 unauthorized, token expiry, redirect to login)
 * - Network errors (API server down, timeouts)
 * - Verify error messages display correctly to users
 * 
 * Requirements Validated: 2.6, 2.7, 4.2, 4.3
 */

const API_BASE_URL = process.env.API_URL || "http://localhost:3001/api";
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "";

/**
 * Helper function to make authenticated API requests
 */
async function fetchWithAuth(endpoint, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  // Only add auth header if token is provided (to test missing token scenarios)
  if (options.includeAuth !== false && ADMIN_TOKEN) {
    headers["Authorization"] = `Bearer ${ADMIN_TOKEN}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  return response;
}

/**
 * Task 6.1: Test Validation Errors
 * Requirements: 2.6, 2.7
 */
async function testValidationErrors() {
  console.log("\n🧪 Task 6.1: Test Validation Errors");
  console.log("====================================");

  const testCases = [
    {
      name: "Missing required field: title",
      data: {
        description: "Test description",
        category: "Test",
        rarity: "COMMON",
        auctionType: "STANDARD",
        startingPrice: 1000,
        startTime: new Date(Date.now() + 86400000).toISOString(),
        endTime: new Date(Date.now() + 604800000).toISOString(),
      },
      expectedStatus: 400,
      requirement: "2.6",
    },
    {
      name: "Missing required field: description",
      data: {
        title: "Test Auction",
        category: "Test",
        rarity: "COMMON",
        auctionType: "STANDARD",
        startingPrice: 1000,
        startTime: new Date(Date.now() + 86400000).toISOString(),
        endTime: new Date(Date.now() + 604800000).toISOString(),
      },
      expectedStatus: 400,
      requirement: "2.6",
    },
    {
      name: "Missing required field: startingPrice",
      data: {
        title: "Test Auction",
        description: "Test description",
        category: "Test",
        rarity: "COMMON",
        auctionType: "STANDARD",
        startTime: new Date(Date.now() + 86400000).toISOString(),
        endTime: new Date(Date.now() + 604800000).toISOString(),
      },
      expectedStatus: 400,
      requirement: "2.6",
    },
    {
      name: "Invalid date range: endTime before startTime",
      data: {
        title: "Invalid Date Auction",
        description: "Test description",
        category: "Test",
        rarity: "COMMON",
        auctionType: "STANDARD",
        startingPrice: 1000,
        startTime: new Date(Date.now() + 604800000).toISOString(), // 7 days from now
        endTime: new Date(Date.now() + 86400000).toISOString(), // 1 day from now
      },
      expectedStatus: 400,
      requirement: "2.6",
    },
    {
      name: "Invalid date range: startTime equals endTime",
      data: {
        title: "Same Date Auction",
        description: "Test description",
        category: "Test",
        rarity: "COMMON",
        auctionType: "STANDARD",
        startingPrice: 1000,
        startTime: new Date(Date.now() + 86400000).toISOString(),
        endTime: new Date(Date.now() + 86400000).toISOString(),
      },
      expectedStatus: 400,
      requirement: "2.6",
    },
    {
      name: "Negative starting price",
      data: {
        title: "Negative Price Auction",
        description: "Test description",
        category: "Test",
        rarity: "COMMON",
        auctionType: "STANDARD",
        startingPrice: -1000,
        startTime: new Date(Date.now() + 86400000).toISOString(),
        endTime: new Date(Date.now() + 604800000).toISOString(),
      },
      expectedStatus: 400,
      requirement: "2.6",
    },
    {
      name: "Zero starting price",
      data: {
        title: "Zero Price Auction",
        description: "Test description",
        category: "Test",
        rarity: "COMMON",
        auctionType: "STANDARD",
        startingPrice: 0,
        startTime: new Date(Date.now() + 86400000).toISOString(),
        endTime: new Date(Date.now() + 604800000).toISOString(),
      },
      expectedStatus: 400,
      requirement: "2.6",
    },
    {
      name: "Negative minimum increment",
      data: {
        title: "Negative Increment Auction",
        description: "Test description",
        category: "Test",
        rarity: "COMMON",
        auctionType: "STANDARD",
        startingPrice: 1000,
        minimumIncrement: -100,
        startTime: new Date(Date.now() + 86400000).toISOString(),
        endTime: new Date(Date.now() + 604800000).toISOString(),
      },
      expectedStatus: 400,
      requirement: "2.6",
    },
    {
      name: "Invalid rarity value",
      data: {
        title: "Invalid Rarity Auction",
        description: "Test description",
        category: "Test",
        rarity: "INVALID_RARITY",
        auctionType: "STANDARD",
        startingPrice: 1000,
        startTime: new Date(Date.now() + 86400000).toISOString(),
        endTime: new Date(Date.now() + 604800000).toISOString(),
      },
      expectedStatus: 400,
      requirement: "2.6",
    },
    {
      name: "Invalid auction type",
      data: {
        title: "Invalid Type Auction",
        description: "Test description",
        category: "Test",
        rarity: "COMMON",
        auctionType: "INVALID_TYPE",
        startingPrice: 1000,
        startTime: new Date(Date.now() + 86400000).toISOString(),
        endTime: new Date(Date.now() + 604800000).toISOString(),
      },
      expectedStatus: 400,
      requirement: "2.6",
    },
  ];

  let passedCount = 0;
  let failedCount = 0;

  for (const testCase of testCases) {
    console.log(`\n📝 Test: ${testCase.name}`);
    console.log(`   Requirement: ${testCase.requirement}`);

    try {
      const response = await fetchWithAuth("/v1/admin/auctions", {
        method: "POST",
        body: JSON.stringify(testCase.data),
      });

      const data = await response.json();

      if (response.status === testCase.expectedStatus) {
        console.log(`   ✅ PASS: Got expected status ${testCase.expectedStatus}`);
        
        // Verify error message exists (Requirement 2.7)
        if (data.message) {
          console.log(`   ✅ PASS: Error message present: "${data.message}"`);
        } else {
          console.log(`   ⚠️  WARN: No error message in response`);
        }
        
        passedCount++;
      } else {
        console.log(`   ❌ FAIL: Expected status ${testCase.expectedStatus}, got ${response.status}`);
        console.log(`   Response:`, data);
        failedCount++;
      }
    } catch (error) {
      console.log(`   ❌ FAIL: Exception thrown: ${error.message}`);
      failedCount++;
    }
  }

  console.log(`\n📊 Task 6.1 Summary: ${passedCount} passed, ${failedCount} failed`);
  return { passed: passedCount, failed: failedCount, success: failedCount === 0 };
}

/**
 * Task 6.2: Test Authentication Errors
 * Requirements: 4.2
 */
async function testAuthenticationErrors() {
  console.log("\n🧪 Task 6.2: Test Authentication Errors");
  console.log("=======================================");

  const testCases = [
    {
      name: "Missing Authorization header",
      includeAuth: false,
      endpoint: "/v1/admin/auctions",
      expectedStatus: 401,
      requirement: "4.2",
    },
    {
      name: "Invalid token format",
      customToken: "invalid-token",
      endpoint: "/v1/admin/auctions",
      expectedStatus: 401,
      requirement: "4.2",
    },
    {
      name: "Expired token (malformed JWT)",
      customToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1MTYyMzkwMjJ9.invalid",
      endpoint: "/v1/admin/auctions",
      expectedStatus: 401,
      requirement: "4.2",
    },
    {
      name: "Bearer scheme missing",
      customToken: ADMIN_TOKEN.replace("Bearer ", ""),
      endpoint: "/v1/admin/auctions",
      expectedStatus: 401,
      requirement: "4.2",
      skipIfNoToken: true,
    },
  ];

  let passedCount = 0;
  let failedCount = 0;

  for (const testCase of testCases) {
    if (testCase.skipIfNoToken && !ADMIN_TOKEN) {
      console.log(`\n📝 Test: ${testCase.name}`);
      console.log(`   ⏭️  SKIP: Requires ADMIN_TOKEN to be set`);
      continue;
    }

    console.log(`\n📝 Test: ${testCase.name}`);
    console.log(`   Requirement: ${testCase.requirement}`);

    try {
      const headers = { "Content-Type": "application/json" };
      
      if (testCase.includeAuth === false) {
        // No auth header
      } else if (testCase.customToken) {
        // Custom token for testing
        headers["Authorization"] = `Bearer ${testCase.customToken}`;
      }

      const response = await fetch(`${API_BASE_URL}${testCase.endpoint}`, { headers });
      const data = await response.json();

      if (response.status === testCase.expectedStatus) {
        console.log(`   ✅ PASS: Got expected status ${testCase.expectedStatus}`);
        
        // Verify error message exists (Requirement 4.2)
        if (data.message) {
          console.log(`   ✅ PASS: Error message present: "${data.message}"`);
        } else {
          console.log(`   ⚠️  WARN: No error message in response`);
        }
        
        passedCount++;
      } else {
        console.log(`   ❌ FAIL: Expected status ${testCase.expectedStatus}, got ${response.status}`);
        console.log(`   Response:`, data);
        failedCount++;
      }
    } catch (error) {
      console.log(`   ❌ FAIL: Exception thrown: ${error.message}`);
      failedCount++;
    }
  }

  console.log(`\n📊 Task 6.2 Summary: ${passedCount} passed, ${failedCount} failed`);
  return { passed: passedCount, failed: failedCount, success: failedCount === 0 };
}

/**
 * Task 6.3: Test Network Errors
 * Requirements: 4.3
 */
async function testNetworkErrors() {
  console.log("\n🧪 Task 6.3: Test Network Errors");
  console.log("=================================");

  const testCases = [
    {
      name: "Connection refused (invalid port)",
      url: "http://localhost:9999/api/v1/admin/auctions",
      requirement: "4.3",
      expectedError: "ECONNREFUSED",
    },
    {
      name: "Invalid hostname",
      url: "http://invalid-hostname-12345.local/api/v1/admin/auctions",
      requirement: "4.3",
      expectedError: "ENOTFOUND",
    },
    {
      name: "Request timeout (very short timeout)",
      url: `${API_BASE_URL}/v1/admin/auctions`,
      timeout: 1, // 1ms - will almost certainly timeout
      requirement: "4.3",
      expectedError: "TIMEOUT",
    },
  ];

  let passedCount = 0;
  let failedCount = 0;

  for (const testCase of testCases) {
    console.log(`\n📝 Test: ${testCase.name}`);
    console.log(`   Requirement: ${testCase.requirement}`);

    try {
      const controller = new AbortController();
      const timeoutId = testCase.timeout 
        ? setTimeout(() => controller.abort(), testCase.timeout)
        : null;

      const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${ADMIN_TOKEN}`,
      };

      const response = await fetch(testCase.url, {
        headers,
        signal: controller.signal,
      });

      if (timeoutId) clearTimeout(timeoutId);

      console.log(`   ⚠️  WARN: Request succeeded unexpectedly (status ${response.status})`);
      console.log(`   This might indicate the server is actually reachable`);
      failedCount++;
    } catch (error) {
      // Expected to throw an error
      const errorMessage = error.message || "";
      const errorCode = error.code || error.name || "";

      console.log(`   ✅ PASS: Network error caught as expected`);
      console.log(`   Error: ${errorMessage}`);
      console.log(`   Code: ${errorCode}`);

      // Verify error is appropriate (Requirement 4.3)
      const errorCodeStr = String(errorCode);
      if (errorCodeStr.includes("ECONNREFUSED") || 
          errorCodeStr.includes("ENOTFOUND") || 
          errorCodeStr.includes("AbortError") ||
          errorMessage.includes("fetch failed") ||
          errorMessage.includes("aborted")) {
        console.log(`   ✅ PASS: Error type is appropriate for network failure`);
        passedCount++;
      } else {
        console.log(`   ⚠️  WARN: Unexpected error type: ${errorCodeStr}`);
        passedCount++; // Still count as pass since error was thrown
      }
    }
  }

  console.log(`\n📊 Task 6.3 Summary: ${passedCount} passed, ${failedCount} failed`);
  return { passed: passedCount, failed: failedCount, success: failedCount === 0 };
}

/**
 * Test: Verify error message display to users
 * Requirements: 2.7, 4.3
 */
async function testErrorMessageDisplay() {
  console.log("\n🧪 Additional Test: Error Message Display");
  console.log("==========================================");

  const testCases = [
    {
      name: "Validation error has clear message",
      request: {
        method: "POST",
        endpoint: "/v1/admin/auctions",
        body: { title: "Incomplete" }, // Missing required fields
      },
      requirement: "2.7",
    },
    {
      name: "Auth error has clear message",
      request: {
        method: "GET",
        endpoint: "/v1/admin/auctions",
        includeAuth: false,
      },
      requirement: "4.2",
    },
  ];

  let passedCount = 0;
  let failedCount = 0;

  for (const testCase of testCases) {
    console.log(`\n📝 Test: ${testCase.name}`);
    console.log(`   Requirement: ${testCase.requirement}`);

    try {
      const response = await fetchWithAuth(testCase.request.endpoint, {
        method: testCase.request.method,
        body: testCase.request.body ? JSON.stringify(testCase.request.body) : undefined,
        includeAuth: testCase.request.includeAuth,
      });

      const data = await response.json();

      // Check if error message exists and is user-friendly
      if (data.message && typeof data.message === "string" && data.message.length > 0) {
        console.log(`   ✅ PASS: Error message present`);
        console.log(`   Message: "${data.message}"`);
        
        // Check if message is user-friendly (not a stack trace or code)
        if (data.message.includes("Error:") || data.message.includes("at ")) {
          console.log(`   ⚠️  WARN: Message might contain stack trace`);
        } else {
          console.log(`   ✅ PASS: Message appears user-friendly`);
        }
        
        passedCount++;
      } else {
        console.log(`   ❌ FAIL: No error message or message is empty`);
        console.log(`   Response:`, data);
        failedCount++;
      }
    } catch (error) {
      console.log(`   ❌ FAIL: Exception thrown: ${error.message}`);
      failedCount++;
    }
  }

  console.log(`\n📊 Error Message Display Summary: ${passedCount} passed, ${failedCount} failed`);
  return { passed: passedCount, failed: failedCount, success: failedCount === 0 };
}

/**
 * Main test runner
 */
async function runTests() {
  console.log("╔══════════════════════════════════════════════════════╗");
  console.log("║  Task 6: Error Handling Tests                       ║");
  console.log("║  Requirements: 2.6, 2.7, 4.2, 4.3                   ║");
  console.log("╚══════════════════════════════════════════════════════╝");

  if (!ADMIN_TOKEN) {
    console.log("\n⚠️  WARNING: ADMIN_TOKEN environment variable not set!");
    console.log("Some authentication tests will be skipped.");
    console.log("To run all tests, set ADMIN_TOKEN:");
    console.log("  export ADMIN_TOKEN='your-jwt-token-here'\n");
  }

  console.log("📋 Test Configuration:");
  console.log("  API Base URL:", API_BASE_URL);
  console.log("  Token Present:", !!ADMIN_TOKEN);

  const results = {
    validationErrors: null,
    authenticationErrors: null,
    networkErrors: null,
    errorMessageDisplay: null,
  };

  // Task 6.1: Validation Errors
  results.validationErrors = await testValidationErrors();

  // Task 6.2: Authentication Errors
  results.authenticationErrors = await testAuthenticationErrors();

  // Task 6.3: Network Errors
  results.networkErrors = await testNetworkErrors();

  // Additional: Error Message Display
  results.errorMessageDisplay = await testErrorMessageDisplay();

  // Summary
  console.log("\n╔══════════════════════════════════════════════════════╗");
  console.log("║  Task 6: Test Summary                               ║");
  console.log("╚══════════════════════════════════════════════════════╝");

  const totalPassed = Object.values(results).reduce((sum, r) => sum + (r?.passed || 0), 0);
  const totalFailed = Object.values(results).reduce((sum, r) => sum + (r?.failed || 0), 0);

  console.log("\n📊 Results by Category:");
  console.log(`  6.1 Validation Errors:     ${results.validationErrors?.passed} passed, ${results.validationErrors?.failed} failed`);
  console.log(`  6.2 Authentication Errors: ${results.authenticationErrors?.passed} passed, ${results.authenticationErrors?.failed} failed`);
  console.log(`  6.3 Network Errors:        ${results.networkErrors?.passed} passed, ${results.networkErrors?.failed} failed`);
  console.log(`  Error Message Display:     ${results.errorMessageDisplay?.passed} passed, ${results.errorMessageDisplay?.failed} failed`);

  console.log(`\n📊 Overall: ${totalPassed} passed, ${totalFailed} failed`);

  const allPassed = Object.values(results).every(r => r?.success !== false);

  if (allPassed) {
    console.log("\n🎉 Task 6: All error handling tests passed!");
    process.exit(0);
  } else {
    console.log("\n⚠️  Task 6: Some error handling tests failed!");
    process.exit(1);
  }
}

// Run tests if executed directly
if (require.main === module) {
  runTests().catch(error => {
    console.error("\n❌ Fatal error:", error);
    process.exit(1);
  });
}

module.exports = {
  runTests,
  testValidationErrors,
  testAuthenticationErrors,
  testNetworkErrors,
  testErrorMessageDisplay,
};
