'use client';

import { useState, useCallback, useEffect } from 'react';
import { dataCache, generateCacheKey } from '../lib/dataCache';

interface DataSyncOptions {
  endpoint: string;
  refreshInterval?: number;
  cacheKey?: string;
}

export function useDataSync<T>(options: DataSyncOptions) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const cacheKey = options.cacheKey || generateCacheKey(options.endpoint);

  const fetchData = useCallback(async () => {
    // Check cache first
    const cached = dataCache.get(cacheKey);
    if (cached) {
      setData(cached);
      return;
    }

    // Check for pending request (deduplication)
    const pending = dataCache.getPendingRequest(cacheKey);
    if (pending) {
      try {
        const result = await pending;
        setData(result);
        return;
      } catch (err) {
        // Pending request failed, continue with new request
      }
    }

    setLoading(true);
    setError(null);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const fetchPromise = fetch(options.endpoint, {
      signal: controller.signal
    })
      .then(response => {
        clearTimeout(timeoutId);
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        return response.json();
      })
      .then(result => {
        setData(result);
        dataCache.set(cacheKey, result, 60000); // 60s TTL
        return result;
      })
      .catch(err => {
        const error = err as Error;
        setError(error);
        console.error(`Data sync error for ${options.endpoint}:`, error);
        throw error;
      })
      .finally(() => {
        setLoading(false);
      });

    // Register pending request for deduplication
    dataCache.setPendingRequest(cacheKey, fetchPromise);

    try {
      await fetchPromise;
    } catch {
      // Error already handled above
    }
  }, [options.endpoint, cacheKey]);

  useEffect(() => {
    if (options.refreshInterval) {
      const interval = setInterval(fetchData, options.refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, options.refreshInterval]);

  return { data, loading, error, refetch: fetchData };
}
