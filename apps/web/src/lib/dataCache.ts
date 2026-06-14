// Client-side data cache with TTL

interface CacheEntry {
  data: any;
  expiry: number;
}

class DataCache {
  private cache = new Map<string, CacheEntry>();
  private pendingRequests = new Map<string, Promise<any>>();

  set(key: string, data: any, ttl: number = 60000) {
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttl
    });
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  clear(key?: string) {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  // Request deduplication
  setPendingRequest(key: string, promise: Promise<any>) {
    this.pendingRequests.set(key, promise);
    promise.finally(() => {
      this.pendingRequests.delete(key);
    });
  }

  getPendingRequest(key: string): Promise<any> | null {
    return this.pendingRequests.get(key) || null;
  }

  hasPendingRequest(key: string): boolean {
    return this.pendingRequests.has(key);
  }
}

export const dataCache = new DataCache();

// Helper function to generate cache key
export function generateCacheKey(endpoint: string, params?: Record<string, any>): string {
  if (!params) return endpoint;
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');
  return `${endpoint}?${sortedParams}`;
}
