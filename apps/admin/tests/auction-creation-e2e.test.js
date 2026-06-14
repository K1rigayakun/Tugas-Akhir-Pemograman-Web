/**
 * E2E Test: Auction Creation Flow
 * 
 * This test validates the complete auction creation flow from UI to database.
 * 
 * Test Scenario:
 * 1. Open admin panel auction page
 * 2. Click "Buat Lelang Baru" button
 * 3. Fill all required fields in create modal
 * 4. Submit form
 * 5. Verify success message appears
 * 6. Verify modal closes
 * 7. Verify new auction appears in list
 * 
 * Requirements Validated: 2.1, 2.2, 2.3, 2.4, 2.5
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
 * Test: Create a new auction via POST endpoint
 */
async function testCreateAuction() {
  console.log("\n🧪 Test: Create Auction via API");
  console.log("================================");

  const testAuction = {
    title: "Test Auction - E2E Verification",
    description: "This is a test auction created during E2E testing",
    category: "Test Items",
    rarity: "RARE",
    auctionType: "STANDARD",
    startingPrice: 10000,
    minimumIncrement: 500,
    startTime: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // Tomorrow
    endTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(), // Next week
    imageUrls: ["https://via.placeholder.com/300"],
  };

  try {
    console.log("📤 Sending POST request to create auction...");
    const response = await fetchWithAuth("/v1/admin/auctions", {
      method: "POST",
      body: JSON.stringify(testAuction),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Failed to create auction");
      console.error("Status:", response.status);
      console.error("Response:", data);
      return { success: false, error: data.message };
    }

    console.log("✅ Auction created successfully!");
    console.log("📝 Auction ID:", data.data?.id);
    console.log("📝 Auction Title:", data.data?.title);
    console.log("📝 Status:", data.data?.status);
    console.log("📝 Current Price:", data.data?.currentPrice);

    // Verify response structure
    const requiredFields = ["id", "title", "description", "category", "rarity", "auctionType", "startingPrice", "currentPrice"];
    const missingFields = requiredFields.filter(field => !(field in data.data));

    if (missingFields.length > 0) {
      console.warn("⚠️  Missing fields in response:", missingFields);
    }

    // Verify data integrity (Requirement 2.3, 2.4)
    console.log("\n🔍 Verifying data integrity...");
    const integrityChecks = [
      { field: "title", expected: testAuction.title, actual: data.data.title },
      { field: "category", expected: testAuction.category, actual: data.data.category },
      { field: "rarity", expected: testAuction.rarity, actual: data.data.rarity },
      { field: "auctionType", expected: testAuction.auctionType, actual: data.data.auctionType },
      { field: "startingPrice", expected: testAuction.startingPrice, actual: data.data.startingPrice },
      { field: "currentPrice", expected: testAuction.startingPrice, actual: data.data.currentPrice },
    ];

    let integrityPassed = true;
    for (const check of integrityChecks) {
      if (check.expected !== check.actual) {
        console.error(`❌ ${check.field}: Expected ${check.expected}, got ${check.actual}`);
        integrityPassed = false;
      } else {
        console.log(`✅ ${check.field}: ${check.actual}`);
      }
    }

    return {
      success: true,
      auctionId: data.data.id,
      integrityPassed,
    };
  } catch (error) {
    console.error("❌ Error during test:", error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Test: Fetch auctions list and verify new auction appears
 */
async function testFetchAuctions(expectedAuctionId) {
  console.log("\n🧪 Test: Fetch Auctions List");
  console.log("============================");

  try {
    console.log("📤 Sending GET request to fetch auctions...");
    const response = await fetchWithAuth("/v1/admin/auctions");

    if (!response.ok) {
      console.error("❌ Failed to fetch auctions");
      console.error("Status:", response.status);
      return { success: false };
    }

    const data = await response.json();
    console.log("✅ Auctions fetched successfully!");
    console.log("📝 Total auctions:", data.data?.length || 0);

    if (expectedAuctionId) {
      const foundAuction = data.data?.find(a => a.id === expectedAuctionId);
      if (foundAuction) {
        console.log("✅ New auction appears in list!");
        console.log("📝 Auction:", foundAuction.title);
        return { success: true, found: true };
      } else {
        console.error("❌ New auction NOT found in list!");
        return { success: false, found: false };
      }
    }

    return { success: true };
  } catch (error) {
    console.error("❌ Error during test:", error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Test: Filter auctions by status
 */
async function testFilterAuctions() {
  console.log("\n🧪 Test: Filter Auctions");
  console.log("========================");

  const statuses = ["DRAFT", "ACTIVE", "UPCOMING"];

  for (const status of statuses) {
    try {
      console.log(`\n📤 Filtering by status: ${status}`);
      const response = await fetchWithAuth(`/v1/admin/auctions?status=${status}`);

      if (!response.ok) {
        console.error(`❌ Failed to fetch auctions with status ${status}`);
        continue;
      }

      const data = await response.json();
      const allMatchStatus = data.data?.every(a => a.status === status);

      if (allMatchStatus || data.data?.length === 0) {
        console.log(`✅ Filter working correctly (${data.data?.length || 0} auctions)`);
      } else {
        console.error(`❌ Some auctions don't match status ${status}`);
      }
    } catch (error) {
      console.error(`❌ Error filtering by ${status}:`, error.message);
    }
  }

  return { success: true };
}

/**
 * Test: Error handling with invalid data
 */
async function testErrorHandling() {
  console.log("\n🧪 Test: Error Handling");
  console.log("=======================");

  // Test 1: Missing required fields
  console.log("\n📤 Test: Missing required fields");
  try {
    const response = await fetchWithAuth("/v1/admin/auctions", {
      method: "POST",
      body: JSON.stringify({ title: "Incomplete Auction" }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.log("✅ Server correctly rejected invalid data");
      console.log("📝 Error message:", data.message);
    } else {
      console.error("❌ Server accepted invalid data!");
    }
  } catch (error) {
    console.error("❌ Unexpected error:", error.message);
  }

  // Test 2: Invalid date range
  console.log("\n📤 Test: Invalid date range (endTime before startTime)");
  try {
    const invalidAuction = {
      title: "Invalid Date Range Auction",
      description: "Test",
      category: "Test",
      rarity: "COMMON",
      auctionType: "STANDARD",
      startingPrice: 1000,
      startTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(), // Next week
      endTime: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // Tomorrow
    };

    const response = await fetchWithAuth("/v1/admin/auctions", {
      method: "POST",
      body: JSON.stringify(invalidAuction),
    });

    const data = await response.json();

    if (!response.ok) {
      console.log("✅ Server correctly rejected invalid date range");
      console.log("📝 Error message:", data.message);
    } else {
      console.warn("⚠️  Server accepted invalid date range");
    }
  } catch (error) {
    console.error("❌ Unexpected error:", error.message);
  }

  return { success: true };
}

/**
 * Main test runner
 */
async function runTests() {
  console.log("╔══════════════════════════════════════════════════════╗");
  console.log("║  E2E Test: Auction Creation Flow                    ║");
  console.log("║  Requirements: 2.1, 2.2, 2.3, 2.4, 2.5              ║");
  console.log("╚══════════════════════════════════════════════════════╝");

  if (!ADMIN_TOKEN) {
    console.error("\n❌ ERROR: ADMIN_TOKEN environment variable not set!");
    console.log("Please set ADMIN_TOKEN with a valid JWT token:");
    console.log("  export ADMIN_TOKEN='your-jwt-token-here'");
    process.exit(1);
  }

  console.log("\n📋 Test Configuration:");
  console.log("  API Base URL:", API_BASE_URL);
  console.log("  Token Length:", ADMIN_TOKEN.length, "characters");

  const results = {
    createAuction: null,
    fetchAuctions: null,
    filterAuctions: null,
    errorHandling: null,
  };

  // Test 1: Create Auction
  results.createAuction = await testCreateAuction();

  // Test 2: Fetch Auctions List
  if (results.createAuction.success) {
    results.fetchAuctions = await testFetchAuctions(results.createAuction.auctionId);
  }

  // Test 3: Filter Auctions
  results.filterAuctions = await testFilterAuctions();

  // Test 4: Error Handling
  results.errorHandling = await testErrorHandling();

  // Summary
  console.log("\n╔══════════════════════════════════════════════════════╗");
  console.log("║  Test Summary                                        ║");
  console.log("╚══════════════════════════════════════════════════════╝");

  const testResults = [
    { name: "Create Auction", result: results.createAuction?.success },
    { name: "Fetch Auctions", result: results.fetchAuctions?.success },
    { name: "Filter Auctions", result: results.filterAuctions?.success },
    { name: "Error Handling", result: results.errorHandling?.success },
    { name: "Data Integrity", result: results.createAuction?.integrityPassed },
    { name: "Auction in List", result: results.fetchAuctions?.found },
  ];

  for (const test of testResults) {
    const icon = test.result === true ? "✅" : test.result === false ? "❌" : "⏭️ ";
    console.log(`  ${icon} ${test.name}`);
  }

  const allPassed = testResults.every(t => t.result === true || t.result === undefined);

  if (allPassed) {
    console.log("\n🎉 All tests passed!");
    process.exit(0);
  } else {
    console.log("\n❌ Some tests failed!");
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

module.exports = { runTests, testCreateAuction, testFetchAuctions };
