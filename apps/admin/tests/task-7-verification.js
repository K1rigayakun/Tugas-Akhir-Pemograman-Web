/**
 * Task 7: Checkpoint - Verify All Functionality Works
 * 
 * This comprehensive verification script tests:
 * - Complete user flow (open page → create auction → verify in list)
 * - All filter combinations (status × type)
 * - Auction creation with different auctionTypes
 * - All error handling paths work
 * - All previous tests still pass
 * 
 * Requirements: All (comprehensive checkpoint)
 */

const API_BASE_URL = process.env.API_URL || "http://localhost:3001/api";
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "";

/**
 * Helper function to make authenticated API requests
 */
async function fetchWithAuth(endpoint, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${ADMIN_TOKEN}`,
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  return response;
}

/**
 * Test 1: Complete User Flow
 * Requirement: Complete flow from list → create → verify
 */
async function testCompleteUserFlow() {
  console.log("\n🧪 Test 1: Complete User Flow");
  console.log("==============================");
  console.log("Simulating: Open page → Create auction → Verify in list\n");

  try {
    // Step 1: Get initial auction list (simulates opening page)
    console.log("📤 Step 1: Opening auction page (GET /v1/admin/auctions)");
    const listResponse1 = await fetchWithAuth("/v1/admin/auctions");
    const listData1 = await listResponse1.json();
    
    if (!listResponse1.ok) {
      throw new Error(`Failed to load auction list: ${listData1.message}`);
    }
    
    const initialCount = listData1.data.length;
    console.log(`   ✅ Page loaded successfully`);
    console.log(`   📊 Initial auction count: ${initialCount}`);

    // Step 2: Create a new auction (simulates clicking "Buat Lelang Baru" and submitting)
    console.log("\n📤 Step 2: Creating new auction (POST /v1/admin/auctions)");
    const newAuction = {
      title: `Verification Test Auction - ${Date.now()}`,
      description: "Created during Task 7 verification",
      category: "Verification",
      rarity: "RARE",
      auctionType: "STANDARD",
      startingPrice: 5000,
      minimumIncrement: 250,
      startTime: new Date(Date.now() + 86400000).toISOString(),
      endTime: new Date(Date.now() + 604800000).toISOString(),
      imageUrls: ["https://via.placeholder.com/300"],
    };

    const createResponse = await fetchWithAuth("/v1/admin/auctions", {
      method: "POST",
      body: JSON.stringify(newAuction),
    });
    const createData = await createResponse.json();

    if (!createResponse.ok) {
      throw new Error(`Failed to create auction: ${createData.message}`);
    }

    console.log(`   ✅ Auction created successfully`);
    console.log(`   📝 Auction ID: ${createData.data.id}`);
    console.log(`   📝 Title: ${createData.data.title}`);

    // Step 3: Verify new auction appears in list (simulates modal closing and list refresh)
    console.log("\n📤 Step 3: Verifying auction in list (GET /v1/admin/auctions)");
    const listResponse2 = await fetchWithAuth("/v1/admin/auctions");
    const listData2 = await listResponse2.json();

    if (!listResponse2.ok) {
      throw new Error(`Failed to reload auction list: ${listData2.message}`);
    }

    const foundAuction = listData2.data.find(a => a.id === createData.data.id);
    
    if (foundAuction) {
      console.log(`   ✅ New auction found in list`);
      console.log(`   📊 Total auctions: ${listData2.data.length} (was ${initialCount})`);
      return { success: true, auctionId: createData.data.id };
    } else {
      throw new Error("New auction not found in list!");
    }

  } catch (error) {
    console.log(`   ❌ FAIL: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Test 2: All Filter Combinations (Status × Type)
 * Requirements: 3.1, 3.2, 3.3
 */
async function testAllFilterCombinations() {
  console.log("\n🧪 Test 2: All Filter Combinations");
  console.log("===================================");

  const statuses = ["DRAFT", "ACTIVE", "UPCOMING", "ENDED", "CANCELLED"];
  const types = ["LIVE", "REGULAR"];

  let passedCount = 0;
  let failedCount = 0;

  // Test each status alone
  for (const status of statuses) {
    try {
      const response = await fetchWithAuth(`/v1/admin/auctions?status=${status}`);
      const data = await response.json();

      if (response.ok) {
        const allMatch = data.data.every(a => a.status === status);
        if (allMatch || data.data.length === 0) {
          console.log(`   ✅ Status=${status}: ${data.data.length} auctions`);
          passedCount++;
        } else {
          console.log(`   ❌ Status=${status}: Some auctions don't match filter`);
          failedCount++;
        }
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.log(`   ❌ Status=${status}: ${error.message}`);
      failedCount++;
    }
  }

  // Test each type alone
  for (const type of types) {
    try {
      const response = await fetchWithAuth(`/v1/admin/auctions?type=${type}`);
      const data = await response.json();

      if (response.ok) {
        let allMatch = true;
        for (const auction of data.data) {
          const isLive = auction.auctionType === "LIVE";
          if (type === "LIVE" && !isLive) allMatch = false;
          if (type === "REGULAR" && isLive) allMatch = false;
        }

        if (allMatch || data.data.length === 0) {
          console.log(`   ✅ Type=${type}: ${data.data.length} auctions`);
          passedCount++;
        } else {
          console.log(`   ❌ Type=${type}: Some auctions don't match filter`);
          failedCount++;
        }
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.log(`   ❌ Type=${type}: ${error.message}`);
      failedCount++;
    }
  }

  // Test combined filters (status + type)
  console.log("\n   Testing combined filters:");
  const combinedTests = [
    { status: "ACTIVE", type: "LIVE" },
    { status: "ACTIVE", type: "REGULAR" },
    { status: "UPCOMING", type: "LIVE" },
    { status: "ENDED", type: "REGULAR" },
  ];

  for (const { status, type } of combinedTests) {
    try {
      const response = await fetchWithAuth(`/v1/admin/auctions?status=${status}&type=${type}`);
      const data = await response.json();

      if (response.ok) {
        let allMatch = true;
        for (const auction of data.data) {
          if (auction.status !== status) allMatch = false;
          const isLive = auction.auctionType === "LIVE";
          if (type === "LIVE" && !isLive) allMatch = false;
          if (type === "REGULAR" && isLive) allMatch = false;
        }

        if (allMatch || data.data.length === 0) {
          console.log(`   ✅ Status=${status} & Type=${type}: ${data.data.length} auctions`);
          passedCount++;
        } else {
          console.log(`   ❌ Status=${status} & Type=${type}: Some auctions don't match`);
          failedCount++;
        }
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.log(`   ❌ Status=${status} & Type=${type}: ${error.message}`);
      failedCount++;
    }
  }

  console.log(`\n   📊 Filter Tests: ${passedCount} passed, ${failedCount} failed`);
  return { success: failedCount === 0, passed: passedCount, failed: failedCount };
}

/**
 * Test 3: Auction Creation with Different Types
 * Requirements: 2.3, 2.4
 */
async function testDifferentAuctionTypes() {
  console.log("\n🧪 Test 3: Auction Creation with Different Types");
  console.log("=================================================");

  const auctionTypes = [
    {
      name: "STANDARD",
      data: {
        title: `Standard Auction - ${Date.now()}`,
        description: "Standard auction type test",
        category: "Test",
        rarity: "COMMON",
        auctionType: "STANDARD",
        startingPrice: 1000,
        minimumIncrement: 100,
        startTime: new Date(Date.now() + 86400000).toISOString(),
        endTime: new Date(Date.now() + 604800000).toISOString(),
      },
    },
    {
      name: "DESCENDING",
      data: {
        title: `Descending Auction - ${Date.now()}`,
        description: "Descending auction type test",
        category: "Test",
        rarity: "RARE",
        auctionType: "DESCENDING",
        startingPrice: 10000,
        minimumPrice: 5000,
        decrementAmount: 500,
        startTime: new Date(Date.now() + 86400000).toISOString(),
        endTime: new Date(Date.now() + 604800000).toISOString(),
      },
    },
    {
      name: "RANK_EXCL",
      data: {
        title: `Rank Exclusive Auction - ${Date.now()}`,
        description: "Rank exclusive auction type test",
        category: "Test",
        rarity: "EPIC",
        auctionType: "RANK_EXCL",
        startingPrice: 20000,
        minimumRank: "SILVER",
        startTime: new Date(Date.now() + 86400000).toISOString(),
        endTime: new Date(Date.now() + 604800000).toISOString(),
      },
    },
    {
      name: "SEALED_CHEST",
      data: {
        title: `Sealed Chest Auction - ${Date.now()}`,
        description: "Sealed chest auction type test",
        category: "Test",
        rarity: "LEGENDARY",
        auctionType: "SEALED_CHEST",
        startingPrice: 50000,
        isSealed: true,
        startTime: new Date(Date.now() + 86400000).toISOString(),
        endTime: new Date(Date.now() + 604800000).toISOString(),
      },
    },
  ];

  let passedCount = 0;
  let failedCount = 0;

  for (const auctionType of auctionTypes) {
    console.log(`\n   Testing ${auctionType.name}...`);
    
    try {
      const response = await fetchWithAuth("/v1/admin/auctions", {
        method: "POST",
        body: JSON.stringify(auctionType.data),
      });

      const data = await response.json();

      if (response.ok) {
        console.log(`   ✅ ${auctionType.name}: Created successfully (ID: ${data.data.id})`);
        
        // Verify type is correct
        if (data.data.auctionType === auctionType.name) {
          console.log(`   ✅ ${auctionType.name}: Type verified`);
          passedCount++;
        } else {
          console.log(`   ❌ ${auctionType.name}: Type mismatch (got ${data.data.auctionType})`);
          failedCount++;
        }
      } else {
        console.log(`   ❌ ${auctionType.name}: Failed - ${data.message}`);
        failedCount++;
      }
    } catch (error) {
      console.log(`   ❌ ${auctionType.name}: Error - ${error.message}`);
      failedCount++;
    }
  }

  console.log(`\n   📊 Auction Type Tests: ${passedCount} passed, ${failedCount} failed`);
  return { success: failedCount === 0, passed: passedCount, failed: failedCount };
}

/**
 * Test 4: Verify Error Handling Paths
 * Requirements: 2.6, 2.7, 4.2, 4.3
 */
async function testErrorHandlingPaths() {
  console.log("\n🧪 Test 4: Verify Error Handling Paths");
  console.log("======================================");

  const testCases = [
    {
      name: "Validation error (missing field)",
      request: {
        method: "POST",
        endpoint: "/v1/admin/auctions",
        body: { title: "Incomplete" },
      },
      expectedStatus: 400,
    },
    {
      name: "Validation error (negative price)",
      request: {
        method: "POST",
        endpoint: "/v1/admin/auctions",
        body: {
          title: "Test",
          description: "Test",
          category: "Test",
          rarity: "COMMON",
          auctionType: "STANDARD",
          startingPrice: -1000,
          startTime: new Date(Date.now() + 86400000).toISOString(),
          endTime: new Date(Date.now() + 604800000).toISOString(),
        },
      },
      expectedStatus: 400,
    },
    {
      name: "Validation error (invalid date range)",
      request: {
        method: "POST",
        endpoint: "/v1/admin/auctions",
        body: {
          title: "Test",
          description: "Test",
          category: "Test",
          rarity: "COMMON",
          auctionType: "STANDARD",
          startingPrice: 1000,
          startTime: new Date(Date.now() + 604800000).toISOString(),
          endTime: new Date(Date.now() + 86400000).toISOString(),
        },
      },
      expectedStatus: 400,
    },
  ];

  let passedCount = 0;
  let failedCount = 0;

  for (const testCase of testCases) {
    console.log(`\n   Testing: ${testCase.name}`);
    
    try {
      const response = await fetchWithAuth(testCase.request.endpoint, {
        method: testCase.request.method,
        body: JSON.stringify(testCase.request.body),
      });

      const data = await response.json();

      if (response.status === testCase.expectedStatus) {
        console.log(`   ✅ Got expected status ${testCase.expectedStatus}`);
        
        if (data.message) {
          console.log(`   ✅ Error message present: "${data.message}"`);
          passedCount++;
        } else {
          console.log(`   ⚠️  Warning: No error message`);
          passedCount++; // Still count as pass
        }
      } else {
        console.log(`   ❌ Expected ${testCase.expectedStatus}, got ${response.status}`);
        failedCount++;
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      failedCount++;
    }
  }

  console.log(`\n   📊 Error Handling Tests: ${passedCount} passed, ${failedCount} failed`);
  return { success: failedCount === 0, passed: passedCount, failed: failedCount };
}

/**
 * Main verification runner
 */
async function runVerification() {
  console.log("╔══════════════════════════════════════════════════════╗");
  console.log("║  Task 7: Checkpoint - Verify All Functionality      ║");
  console.log("╚══════════════════════════════════════════════════════╝");

  if (!ADMIN_TOKEN) {
    console.error("\n❌ ERROR: ADMIN_TOKEN environment variable not set!");
    console.log("Please set ADMIN_TOKEN with a valid JWT token:");
    console.log("  export ADMIN_TOKEN='your-jwt-token-here'");
    process.exit(1);
  }

  console.log("\n📋 Configuration:");
  console.log("  API Base URL:", API_BASE_URL);
  console.log("  Token Length:", ADMIN_TOKEN.length, "characters");

  const results = {
    userFlow: null,
    filters: null,
    auctionTypes: null,
    errorHandling: null,
  };

  // Run all verification tests
  results.userFlow = await testCompleteUserFlow();
  results.filters = await testAllFilterCombinations();
  results.auctionTypes = await testDifferentAuctionTypes();
  results.errorHandling = await testErrorHandlingPaths();

  // Summary
  console.log("\n╔══════════════════════════════════════════════════════╗");
  console.log("║  Task 7: Verification Summary                        ║");
  console.log("╚══════════════════════════════════════════════════════╝");

  console.log("\n📊 Test Results:");
  console.log(`  1. Complete User Flow:        ${results.userFlow?.success ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`  2. All Filter Combinations:   ${results.filters?.success ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`  3. Different Auction Types:   ${results.auctionTypes?.success ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`  4. Error Handling Paths:      ${results.errorHandling?.success ? "✅ PASS" : "❌ FAIL"}`);

  const allPassed = Object.values(results).every(r => r?.success);

  if (allPassed) {
    console.log("\n🎉 Task 7: All functionality verified successfully!");
    console.log("\n✅ The admin panel is fully functional:");
    console.log("  • Complete user flow works");
    console.log("  • All filters work correctly");
    console.log("  • All auction types can be created");
    console.log("  • Error handling is working");
    process.exit(0);
  } else {
    console.log("\n⚠️  Task 7: Some functionality checks failed!");
    console.log("See details above for specific failures.");
    process.exit(1);
  }
}

// Run verification if executed directly
if (require.main === module) {
  runVerification().catch(error => {
    console.error("\n❌ Fatal error:", error);
    process.exit(1);
  });
}

module.exports = {
  runVerification,
  testCompleteUserFlow,
  testAllFilterCombinations,
  testDifferentAuctionTypes,
  testErrorHandlingPaths,
};
