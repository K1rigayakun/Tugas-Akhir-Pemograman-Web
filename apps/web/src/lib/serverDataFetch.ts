// Server-side data fetching utility for SSR
import { DataSyncError } from '../types/data-sync';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001/api/v1';

interface FetchResult<T> {
  data?: T;
  error?: DataSyncError;
}

export async function serverFetchWithTimeout<T>(
  endpoint: string,
  timeout: number = 2000
): Promise<FetchResult<T>> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      signal: controller.signal,
      cache: 'no-store'
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.error(`SSR fetch error for ${endpoint}: HTTP ${response.status}`);
      return {
        error: {
          error: true,
          statusCode: response.status,
          message: `API returned ${response.status}`
        }
      };
    }
    
    const data = await response.json();
    return { data };
  } catch (error) {
    const err = error as Error;
    console.error('SSR fetch error:', err);
    return {
      error: {
        error: true,
        message: err.name === 'AbortError' 
          ? 'Request timed out' 
          : 'Failed to load data'
      }
    };
  }
}

// Parallel fetch utility for multiple endpoints
export async function serverFetchParallel<T1, T2>(
  endpoint1: string,
  endpoint2: string
): Promise<[FetchResult<T1>, FetchResult<T2>]> {
  return Promise.all([
    serverFetchWithTimeout<T1>(endpoint1),
    serverFetchWithTimeout<T2>(endpoint2)
  ]);
}
