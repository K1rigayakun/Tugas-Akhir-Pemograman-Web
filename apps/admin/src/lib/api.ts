/**
 * Base API URL for admin panel requests.
 * Defaults to local development server if not configured.
 */
const DEFAULT_API_URL = "http://127.0.0.1:3001/api";

function normalizeApiUrl(value: string): string {
  const trimmed = value.replace(/\/+$/, "");

  if (trimmed.endsWith("/api/v1")) {
    return trimmed.slice(0, -3);
  }

  if (trimmed.endsWith("/api")) {
    return trimmed;
  }

  return `${trimmed}/api`;
}

export const API_URL = normalizeApiUrl(
  process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL
);

export function buildApiUrl(endpoint: string): string {
  if (/^https?:\/\//i.test(endpoint)) {
    return endpoint;
  }

  let path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  path = path.replace(/^\/api(?=\/|$)/, "");

  if (!path.startsWith("/v1/")) {
    path = `/v1${path}`;
  }

  return `${API_URL}${path}`;
}

/**
 * Makes an authenticated HTTP request to the API server.
 * 
 * Features:
 * - Automatically includes JWT token from localStorage in Authorization header
 * - Handles Content-Type headers appropriately for JSON and FormData
 * - Redirects to login on 401 Unauthorized responses
 * - Handles network errors gracefully
 * - Logs API responses for debugging data synchronization issues
 * 
 * @param endpoint - API endpoint path (e.g., "/v1/admin/auctions")
 * @param options - Fetch options (method, headers, body, etc.)
 * @returns Promise resolving to the Response object
 * @throws Error for network failures
 * 
 * @example
 * ```typescript
 * // GET request
 * const response = await fetchWithAuth("/v1/admin/auctions?status=ACTIVE");
 * const data = await response.json();
 * 
 * // POST request with JSON
 * const response = await fetchWithAuth("/v1/admin/auctions", {
 *   method: "POST",
 *   body: JSON.stringify({ title: "New Auction", ... })
 * });
 * 
 * // POST request with FormData
 * const formData = new FormData();
 * formData.append("file", file);
 * const response = await fetchWithAuth("/v1/upload", {
 *   method: "POST",
 *   body: formData
 * });
 * ```
 */
export async function fetchWithAuth(endpoint: string, options: RequestInit = {}): Promise<Response> {
  try {
    // Retrieve JWT token from localStorage (client-side only)
    // Note: localStorage is only available in browser context, not during SSR
    let token: string | null = null;
    if (typeof window !== "undefined") {
      token = window.localStorage.getItem("admin_token");
    }

    // Prepare headers, preserving any headers passed in options
    const headers = new Headers(options.headers);
    
    // Auto-add Content-Type for JSON requests, but not for FormData
    // Why: Browser automatically sets correct multipart/form-data boundary for FormData
    // Manual setting would break file uploads due to missing boundary parameter
    if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    // Add Authorization header if token exists
    // Format: "Bearer <jwt-token>" as per RFC 6750 (OAuth 2.0 Bearer Token Usage)
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    // Construct full URL
    const fullUrl = buildApiUrl(endpoint);

    // Make the API request with full URL (base + endpoint)
    const response = await fetch(fullUrl, {
      ...options,
      headers,
    });

    // Log request details for debugging (especially useful for data sync issues)
    if (process.env.NODE_ENV === "development") {
      console.debug("API Request:", {
        method: options.method || "GET",
        endpoint: fullUrl,
        status: response.status,
        ok: response.ok,
      });
    }

    // Handle authentication errors (401 Unauthorized)
    // This occurs when: token is missing, invalid, expired, or user lacks required role
    if (response.status === 401) {
      // Only redirect if we're in browser context and not already on login page
      // Prevents infinite redirect loops if login page itself has auth issues
      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        console.warn("Authentication failed (401). Redirecting to login page.");
        
        // Clear the invalid/expired token to prevent retry with bad token
        window.localStorage.removeItem("admin_token");
        window.localStorage.removeItem("admin_refresh_token");
        window.localStorage.removeItem("admin_user");
        
        // Redirect to login page - user will need to re-authenticate
        // Note: This is a hard redirect (full page reload)
        window.location.href = "/login";
      }
      
      // Throw error to prevent further processing
      throw new Error("Unauthorized. Please log in again.");
    }

    // Log response data for debugging data synchronization issues
    // This helps identify when API returns data but frontend doesn't display it
    if (process.env.NODE_ENV === "development" && response.ok) {
      // Clone response so we can read it without consuming the original
      const clonedResponse = response.clone();
      try {
        const data = await clonedResponse.json();
        if (Array.isArray(data) && data.length === 0) {
          console.warn("API returned empty array for endpoint:", fullUrl);
        }
      } catch {
        // Not JSON or can't parse - ignore
      }
    }

    // Return response for caller to handle
    // Caller is responsible for checking response.ok and parsing data
    return response;
  } catch (error) {
    // Catch and log network errors (connection refused, timeout, DNS failure, etc.)
    // These are thrown by fetch() when request cannot complete
    // Examples: ECONNREFUSED, ENOTFOUND, AbortError (timeout)
    console.error("Network error during API request:", {
      endpoint,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    
    // Re-throw error to allow caller to implement their own error handling
    // Caller can display user-friendly message, retry, etc.
    throw error;
  }
}

/**
 * Helper function to make GET requests with authentication
 * 
 * @param endpoint - API endpoint path
 * @returns Promise resolving to parsed JSON data
 * @throws Error if request fails or returns non-OK status
 */
export async function getWithAuth<T = any>(endpoint: string): Promise<T> {
  const response = await fetchWithAuth(endpoint, { method: "GET" });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Request failed with status ${response.status}`);
  }
  
  return await response.json();
}

/**
 * Helper function to make POST requests with authentication
 * 
 * @param endpoint - API endpoint path
 * @param data - Data to send in request body (will be JSON stringified)
 * @returns Promise resolving to parsed JSON data
 * @throws Error if request fails or returns non-OK status
 */
export async function postWithAuth<T = any>(endpoint: string, data: any): Promise<T> {
  const response = await fetchWithAuth(endpoint, {
    method: "POST",
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Request failed with status ${response.status}`);
  }
  
  return await response.json();
}

/**
 * Helper function to make PUT requests with authentication
 * 
 * @param endpoint - API endpoint path
 * @param data - Data to send in request body (will be JSON stringified)
 * @returns Promise resolving to parsed JSON data
 * @throws Error if request fails or returns non-OK status
 */
export async function putWithAuth<T = any>(endpoint: string, data: any): Promise<T> {
  const response = await fetchWithAuth(endpoint, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Request failed with status ${response.status}`);
  }
  
  return await response.json();
}

/**
 * Helper function to make PATCH requests with authentication
 * 
 * @param endpoint - API endpoint path
 * @param data - Data to send in request body (will be JSON stringified)
 * @returns Promise resolving to parsed JSON data
 * @throws Error if request fails or returns non-OK status
 */
export async function patchWithAuth<T = any>(endpoint: string, data: any): Promise<T> {
  const response = await fetchWithAuth(endpoint, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Request failed with status ${response.status}`);
  }
  
  return await response.json();
}

/**
 * Helper function to make DELETE requests with authentication
 * 
 * @param endpoint - API endpoint path
 * @returns Promise resolving to parsed JSON data
 * @throws Error if request fails or returns non-OK status
 */
export async function deleteWithAuth<T = any>(endpoint: string): Promise<T> {
  const response = await fetchWithAuth(endpoint, {
    method: "DELETE",
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Request failed with status ${response.status}`);
  }
  
  return await response.json();
}
