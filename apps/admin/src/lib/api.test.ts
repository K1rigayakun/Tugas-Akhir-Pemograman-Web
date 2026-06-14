/**
 * Unit and Integration tests for API Client
 * Task 1.1: Create Admin Authentication Service and API Client
 * Task 3: Verify GET auctions endpoint integration
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 3.1, 3.2, 3.3, 3.4
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { fetchWithAuth, getWithAuth, postWithAuth, putWithAuth, patchWithAuth, deleteWithAuth, API_URL } from "./api";

/**
 * Unit Tests for fetchWithAuth helper
 * Requirements: 1.6 - fetchWithAuth helper with Bearer token attachment and 401 handling
 */
describe('fetchWithAuth', () => {
  const mockFetch = vi.fn();
  const originalFetch = global.fetch;
  const originalWindow = global.window;
  let localStorageMock: any;
  
  beforeEach(() => {
    global.fetch = mockFetch;
    vi.clearAllMocks();
    
    // Mock localStorage
    localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn(),
    };
    
    // Mock window
    Object.defineProperty(global, 'window', {
      writable: true,
      configurable: true,
      value: {
        location: {
          pathname: '/dashboard',
          href: '',
        },
        localStorage: localStorageMock,
      },
    });
  });
  
  afterEach(() => {
    global.fetch = originalFetch;
    global.window = originalWindow;
    vi.restoreAllMocks();
  });

  it('should attach Bearer token to request headers', async () => {
    // Requirement 1.6: Attach Bearer token to all requests
    localStorageMock.getItem.mockReturnValue('test-access-token');
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
    });

    await fetchWithAuth('/v1/admin/auctions');

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/v1/admin/auctions'),
      expect.objectContaining({
        headers: expect.any(Headers),
      })
    );

    const callArgs = mockFetch.mock.calls[0];
    const headers = callArgs[1].headers;
    
    // Verify the Authorization header was set
    expect(headers).toBeInstanceOf(Headers);
    expect(headers.get('Authorization')).toBe('Bearer test-access-token');
  });

  it('should set Content-Type to application/json by default', async () => {
    localStorageMock.getItem.mockReturnValue('test-token');
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
    });

    await fetchWithAuth('/v1/admin/auctions', { method: 'POST', body: JSON.stringify({ test: true }) });

    const callArgs = mockFetch.mock.calls[0];
    const headers = callArgs[1].headers;
    expect(headers.get('Content-Type')).toBe('application/json');
  });

  it('should not set Content-Type for FormData requests', async () => {
    localStorageMock.getItem.mockReturnValue('test-token');
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
    });

    const formData = new FormData();
    formData.append('file', 'test');

    await fetchWithAuth('/v1/admin/upload', { method: 'POST', body: formData });

    const callArgs = mockFetch.mock.calls[0];
    const headers = callArgs[1].headers;
    // Should not have Content-Type set (browser will set it with boundary)
    expect(headers.get('Content-Type')).toBeNull();
  });

  it('should redirect to login on 401 response', async () => {
    // Requirement 1.3: Redirect to login on 401 unauthorized
    const removeItemSpy = vi.fn();
    localStorageMock.getItem.mockReturnValue('expired-token');
    localStorageMock.removeItem = removeItemSpy;
    
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ message: 'Unauthorized' }),
    });

    await expect(fetchWithAuth('/v1/admin/auctions')).rejects.toThrow('Unauthorized');

    // Verify tokens were cleared
    expect(removeItemSpy).toHaveBeenCalledWith('admin_token');
    expect(removeItemSpy).toHaveBeenCalledWith('admin_refresh_token');
    expect(removeItemSpy).toHaveBeenCalledWith('admin_user');
    
    // Verify redirect
    expect(window.location.href).toBe('/login');
  });

  it('should not redirect if already on login page', async () => {
    localStorageMock.getItem.mockReturnValue(null);
    window.location.pathname = '/login';
    
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ message: 'Unauthorized' }),
    });

    await expect(fetchWithAuth('/v1/admin/auctions')).rejects.toThrow('Unauthorized');

    // Should not redirect (already on login page)
    expect(window.location.href).not.toBe('/login');
  });

  it('should handle network errors', async () => {
    localStorageMock.getItem.mockReturnValue('test-token');
    
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    await expect(fetchWithAuth('/v1/admin/auctions')).rejects.toThrow();
  });

  it('should construct full URL with API_URL', async () => {
    localStorageMock.getItem.mockReturnValue('test-token');
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
    });

    await fetchWithAuth('/v1/admin/auctions');

    expect(mockFetch).toHaveBeenCalledWith(
      `${API_URL}/v1/admin/auctions`,
      expect.any(Object)
    );
  });

  it('should preserve custom headers', async () => {
    localStorageMock.getItem.mockReturnValue('test-token');
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
    });

    await fetchWithAuth('/v1/admin/auctions', {
      headers: {
        'X-Custom-Header': 'custom-value',
      },
    });

    const callArgs = mockFetch.mock.calls[0];
    const headers = callArgs[1].headers;
    
    // Verify both custom and auth headers are present
    expect(headers).toBeInstanceOf(Headers);
    expect(headers.get('X-Custom-Header')).toBe('custom-value');
    expect(headers.get('Authorization')).toBe('Bearer test-token');
  });
});

/**
 * Unit Tests for helper functions
 * Requirements: 1.6 - Convenience wrappers for common HTTP methods
 */
describe('API Helper Functions', () => {
  const mockFetch = vi.fn();
  const originalFetch = global.fetch;
  let localStorageMock: any;
  
  beforeEach(() => {
    global.fetch = mockFetch;
    vi.clearAllMocks();
    
    // Mock localStorage
    localStorageMock = {
      getItem: vi.fn(() => 'test-token'),
      removeItem: vi.fn(),
    };
    
    // Mock window and localStorage
    Object.defineProperty(global, 'window', {
      writable: true,
      configurable: true,
      value: {
        location: { pathname: '/dashboard', href: '' },
        localStorage: localStorageMock,
      },
    });
  });
  
  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  describe('getWithAuth', () => {
    it('should make GET request and return JSON', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: 'test' }),
      });

      const result = await getWithAuth('/v1/admin/auctions');

      expect(result).toEqual({ data: 'test' });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/v1/admin/auctions'),
        expect.objectContaining({ method: 'GET' })
      );
    });

    it('should throw error on non-OK response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ message: 'Server error' }),
      });

      await expect(getWithAuth('/v1/admin/auctions')).rejects.toThrow('Server error');
    });
  });

  describe('postWithAuth', () => {
    it('should make POST request with JSON body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({ id: '123' }),
      });

      const result = await postWithAuth('/v1/admin/auctions', { title: 'New Auction' });

      expect(result).toEqual({ id: '123' });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/v1/admin/auctions'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ title: 'New Auction' }),
        })
      );
    });
  });

  describe('putWithAuth', () => {
    it('should make PUT request with JSON body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ updated: true }),
      });

      const result = await putWithAuth('/v1/admin/auctions/123', { title: 'Updated' });

      expect(result).toEqual({ updated: true });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/v1/admin/auctions/123'),
        expect.objectContaining({ method: 'PUT' })
      );
    });
  });

  describe('patchWithAuth', () => {
    it('should make PATCH request with JSON body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ patched: true }),
      });

      const result = await patchWithAuth('/v1/admin/auctions/123', { status: 'ACTIVE' });

      expect(result).toEqual({ patched: true });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/v1/admin/auctions/123'),
        expect.objectContaining({ method: 'PATCH' })
      );
    });
  });

  describe('deleteWithAuth', () => {
    it('should make DELETE request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ deleted: true }),
      });

      const result = await deleteWithAuth('/v1/admin/auctions/123');

      expect(result).toEqual({ deleted: true });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/v1/admin/auctions/123'),
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });
});

/**
 * Integration Tests for GET auctions endpoint
 */

/**
 * Manual Integration Test Suite
 * 
 * These tests verify:
 * - Admin panel correctly imports fetchWithAuth
 * - Existing auction list page loads
 * - Filters (status, type) work correctly
 * - Pagination works
 * - Empty state message when no auctions exist
 * 
 * To run these tests:
 * 1. Ensure the API server is running on http://localhost:3001
 * 2. Ensure you have a valid admin JWT token in localStorage (key: 'admin_token')
 * 3. Run: npx tsx apps/admin/src/lib/api.test.ts
 */

interface AuctionResponse {
  data: Array<{
    id: string;
    title: string;
    status: string;
    auctionType: string;
    currentPrice: number;
    _count?: {
      bids: number;
    };
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Test 1: Verify fetchWithAuth is correctly imported
 * Requirement: 1.1
 */
function testImport() {
  console.log("✓ Test 1: fetchWithAuth import");
  if (typeof fetchWithAuth !== "function") {
    throw new Error("fetchWithAuth is not a function");
  }
  if (typeof API_URL !== "string") {
    throw new Error("API_URL is not a string");
  }
  console.log(`  - fetchWithAuth: ${typeof fetchWithAuth}`);
  console.log(`  - API_URL: ${API_URL}`);
}

/**
 * Test 2: Verify GET /v1/admin/auctions returns data
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5
 */
async function testGetAuctions() {
  console.log("\n✓ Test 2: GET /v1/admin/auctions");
  
  try {
    const response = await fetchWithAuth("/v1/admin/auctions");
    const data: AuctionResponse = await response.json();
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${JSON.stringify(data)}`);
    }
    
    console.log(`  - Status: ${response.status}`);
    console.log(`  - Total auctions: ${data.pagination.total}`);
    console.log(`  - Page: ${data.pagination.page}/${data.pagination.totalPages}`);
    console.log(`  - Auctions returned: ${data.data.length}`);
    
    // Verify response structure
    if (!Array.isArray(data.data)) {
      throw new Error("Response data is not an array");
    }
    
    if (!data.pagination || typeof data.pagination.total !== "number") {
      throw new Error("Response pagination is missing or invalid");
    }
    
    // If there are auctions, verify structure
    if (data.data.length > 0) {
      const auction = data.data[0];
      console.log(`  - First auction: ${auction.title} (${auction.status})`);
      
      // Verify required fields exist (Requirement 1.4)
      const requiredFields = ["id", "title", "status", "currentPrice"];
      for (const field of requiredFields) {
        if (!(field in auction)) {
          throw new Error(`Auction missing required field: ${field}`);
        }
      }
      
      // Verify _count.bids exists (Requirement 1.4)
      if (!auction._count || typeof auction._count.bids !== "number") {
        throw new Error("Auction missing _count.bids field");
      }
    }
    
    return data;
  } catch (error) {
    console.error(`  ✗ Failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    throw error;
  }
}

/**
 * Test 3: Verify status filter works
 * Requirements: 3.1, 3.2, 3.3
 */
async function testStatusFilter() {
  console.log("\n✓ Test 3: Status filter");
  
  const statuses = ["ACTIVE", "UPCOMING", "ENDED", "CANCELLED"];
  
  for (const status of statuses) {
    try {
      const response = await fetchWithAuth(`/v1/admin/auctions?status=${status}`);
      const data: AuctionResponse = await response.json();
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} for status=${status}`);
      }
      
      console.log(`  - Status=${status}: ${data.data.length} auctions`);
      
      // Verify all returned auctions match the filter
      for (const auction of data.data) {
        if (auction.status !== status) {
          throw new Error(
            `Filter status=${status} returned auction with status=${auction.status}`
          );
        }
      }
    } catch (error) {
      console.error(`  ✗ Failed for status=${status}: ${error instanceof Error ? error.message : "Unknown error"}`);
      throw error;
    }
  }
}

/**
 * Test 4: Verify type filter works
 * Requirements: 3.1, 3.2, 3.3
 */
async function testTypeFilter() {
  console.log("\n✓ Test 4: Type filter");
  
  const types = [
    { filter: "LIVE", expected: "LIVE" },
    { filter: "REGULAR", expected: "not LIVE" },
  ];
  
  for (const { filter, expected } of types) {
    try {
      const response = await fetchWithAuth(`/v1/admin/auctions?type=${filter}`);
      const data: AuctionResponse = await response.json();
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} for type=${filter}`);
      }
      
      console.log(`  - Type=${filter}: ${data.data.length} auctions`);
      
      // Verify all returned auctions match the filter
      for (const auction of data.data) {
        const isLive = auction.auctionType === "LIVE";
        
        if (filter === "LIVE" && !isLive) {
          throw new Error(
            `Filter type=LIVE returned auction with type=${auction.auctionType}`
          );
        }
        
        if (filter === "REGULAR" && isLive) {
          throw new Error(
            `Filter type=REGULAR returned LIVE auction`
          );
        }
      }
    } catch (error) {
      console.error(`  ✗ Failed for type=${filter}: ${error instanceof Error ? error.message : "Unknown error"}`);
      throw error;
    }
  }
}

/**
 * Test 5: Verify combined filters work
 * Requirements: 3.3
 */
async function testCombinedFilters() {
  console.log("\n✓ Test 5: Combined filters (status + type)");
  
  try {
    const response = await fetchWithAuth("/v1/admin/auctions?status=ACTIVE&type=LIVE");
    const data: AuctionResponse = await response.json();
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    console.log(`  - Status=ACTIVE & Type=LIVE: ${data.data.length} auctions`);
    
    // Verify all returned auctions match both filters
    for (const auction of data.data) {
      if (auction.status !== "ACTIVE") {
        throw new Error(`Combined filter returned auction with status=${auction.status}`);
      }
      if (auction.auctionType !== "LIVE") {
        throw new Error(`Combined filter returned auction with type=${auction.auctionType}`);
      }
    }
  } catch (error) {
    console.error(`  ✗ Failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    throw error;
  }
}

/**
 * Test 6: Verify pagination works
 * Requirements: 3.4
 */
async function testPagination() {
  console.log("\n✓ Test 6: Pagination");
  
  try {
    // Get first page
    const response1 = await fetchWithAuth("/v1/admin/auctions?page=1");
    const data1: AuctionResponse = await response1.json();
    
    if (!response1.ok) {
      throw new Error(`HTTP ${response1.status}`);
    }
    
    console.log(`  - Page 1: ${data1.data.length} auctions`);
    console.log(`  - Total pages: ${data1.pagination.totalPages}`);
    
    // Verify pagination fields
    if (data1.pagination.page !== 1) {
      throw new Error(`Expected page=1, got page=${data1.pagination.page}`);
    }
    
    if (typeof data1.pagination.limit !== "number") {
      throw new Error("Pagination limit is not a number");
    }
    
    // If there are multiple pages, test page 2
    if (data1.pagination.totalPages > 1) {
      const response2 = await fetchWithAuth("/v1/admin/auctions?page=2");
      const data2: AuctionResponse = await response2.json();
      
      if (!response2.ok) {
        throw new Error(`HTTP ${response2.status} for page 2`);
      }
      
      console.log(`  - Page 2: ${data2.data.length} auctions`);
      
      // Verify different auctions are returned
      const page1Ids = new Set(data1.data.map((a) => a.id));
      const page2Ids = new Set(data2.data.map((a) => a.id));
      
      for (const id of page2Ids) {
        if (page1Ids.has(id)) {
          throw new Error(`Auction ${id} appears on both page 1 and page 2`);
        }
      }
    } else {
      console.log("  - Only 1 page, skipping page 2 test");
    }
  } catch (error) {
    console.error(`  ✗ Failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    throw error;
  }
}

/**
 * Test 7: Verify empty state handling
 * Requirements: 1.5
 */
async function testEmptyState() {
  console.log("\n✓ Test 7: Empty state (filter with no results)");
  
  try {
    // Use CANCELLED status which likely has few/no results
    const response = await fetchWithAuth("/v1/admin/auctions?status=CANCELLED");
    const data: AuctionResponse = await response.json();
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    console.log(`  - Status=CANCELLED: ${data.data.length} auctions`);
    console.log(`  - Empty state handling: ${data.data.length === 0 ? "Will show message" : "Has data"}`);
    
    // Verify response structure even when empty
    if (!Array.isArray(data.data)) {
      throw new Error("Empty response data is not an array");
    }
    
    if (!data.pagination) {
      throw new Error("Empty response missing pagination");
    }
  } catch (error) {
    console.error(`  ✗ Failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    throw error;
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log("========================================");
  console.log("Task 3: Verify GET Auctions Endpoint");
  console.log("========================================\n");
  
  try {
    // Test 1: Import verification
    testImport();
    
    // Test 2-7: API integration tests (require running server)
    console.log("\nRunning API integration tests...");
    console.log("Note: These tests require:");
    console.log("  1. API server running on http://localhost:3001");
    console.log("  2. Valid admin JWT token in localStorage");
    console.log("");
    
    await testGetAuctions();
    await testStatusFilter();
    await testTypeFilter();
    await testCombinedFilters();
    await testPagination();
    await testEmptyState();
    
    console.log("\n========================================");
    console.log("✓ All tests passed!");
    console.log("========================================\n");
    
    process.exit(0);
  } catch (error) {
    console.log("\n========================================");
    console.log("✗ Tests failed");
    console.log("========================================\n");
    console.error(error);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

export {
  testImport,
  testGetAuctions,
  testStatusFilter,
  testTypeFilter,
  testCombinedFilters,
  testPagination,
  testEmptyState,
};
