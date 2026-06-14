# Design Document: Data Synchronization System

## Overview

This document outlines the technical design for replacing hardcoded homepage data with dynamic API-driven content using a hybrid SSR (Server-Side Rendering) and client-side data fetching approach. The system will integrate leaderboard and museum data from backend APIs while maintaining the existing auction functionality and ensuring consistency with the admin dashboard.

## Architecture

### System Components

The Data Synchronization System consists of the following key components:

1. **Backend API Layer (NestJS)**
   - Leaderboard API endpoint
   - Museum API endpoint
   - Existing auction and admin APIs (unchanged)

2. **Frontend SSR Layer (Next.js)**
   - Server-side data fetching during initial page render
   - HTML generation with embedded data

3. **Frontend Client Layer (React)**
   - Client-side data fetching and updates
   - State management for loading and error states
   - UI components for data display

4. **Data Synchronization Orchestrator**
   - Coordinates SSR and client-side fetching
   - Manages error handling and retry logic
   - Implements caching strategy

### Component Interaction Flow

```
Initial Page Load (SSR):
User Request → Next.js Server → API Endpoints (parallel) → Data Aggregation → HTML Render → Client

Client-Side Updates:
User Action/Timer → React Component → API Endpoints (parallel) → State Update → DOM Update
```


## API Endpoints

### Leaderboard API

**Endpoint:** `GET /api/leaderboard`

**Response Schema:**
```typescript
interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  points: number;
  avatar?: string;
}

interface LeaderboardResponse {
  data: LeaderboardEntry[];
  timestamp: string;
}
```

**Error Responses:**
- `500 Internal Server Error`: Database or server error
- `503 Service Unavailable`: Temporary service issue

### Museum API

**Endpoint:** `GET /api/museum/featured`

**Response Schema:**
```typescript
interface MuseumItem {
  id: string;
  name: string;
  description: string;
  image: string;
  category: string;
  owner?: string;
}

interface MuseumResponse {
  data: MuseumItem[];
  timestamp: string;
}
```

**Error Responses:**
- `500 Internal Server Error`: Database or server error
- `503 Service Unavailable`: Temporary service issue


## Frontend Components

### Data Fetching Architecture

#### Server-Side Fetching (Next.js)

```typescript
// app/page.tsx or pages/index.tsx
export async function getServerSideProps() {
  const [leaderboardRes, museumRes] = await Promise.all([
    fetch(`${API_BASE_URL}/api/leaderboard`, { 
      signal: AbortSignal.timeout(2000) 
    }),
    fetch(`${API_BASE_URL}/api/museum/featured`, { 
      signal: AbortSignal.timeout(2000) 
    })
  ]);

  const leaderboard = leaderboardRes.ok 
    ? await leaderboardRes.json() 
    : { error: true, message: 'Failed to load leaderboard' };
  
  const museum = museumRes.ok 
    ? await museumRes.json() 
    : { error: true, message: 'Failed to load museum items' };

  return {
    props: {
      initialLeaderboard: leaderboard,
      initialMuseum: museum,
    }
  };
}
```

#### Client-Side Fetching (React)

```typescript
// hooks/useDataSync.ts
interface DataSyncOptions {
  endpoint: string;
  refreshInterval?: number;
}

function useDataSync<T>(options: DataSyncOptions) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      
      const response = await fetch(options.endpoint, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err as Error);
      console.error(`Data sync error for ${options.endpoint}:`, err);
    } finally {
      setLoading(false);
    }
  }, [options.endpoint]);

  useEffect(() => {
    if (options.refreshInterval) {
      const interval = setInterval(fetchData, options.refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, options.refreshInterval]);

  return { data, loading, error, refetch: fetchData };
}
```


### UI Components

#### Leaderboard Component

```typescript
// components/Leaderboard.tsx
interface LeaderboardProps {
  initialData?: LeaderboardResponse;
}

export function Leaderboard({ initialData }: LeaderboardProps) {
  const { data, loading, error } = useDataSync<LeaderboardResponse>({
    endpoint: '/api/leaderboard'
  });

  const displayData = data || initialData;

  if (error && !displayData) {
    return <ErrorMessage message="Failed to load leaderboard. Please try again later." />;
  }

  if (loading && !displayData) {
    return <LeaderboardSkeleton />;
  }

  return (
    <div className="leaderboard-container">
      {loading && <LoadingIndicator />}
      {displayData?.data.map((entry) => (
        <LeaderboardEntry key={entry.userId} entry={entry} />
      ))}
    </div>
  );
}
```

#### Museum Component

```typescript
// components/Museum.tsx
interface MuseumProps {
  initialData?: MuseumResponse;
}

export function Museum({ initialData }: MuseumProps) {
  const { data, loading, error } = useDataSync<MuseumResponse>({
    endpoint: '/api/museum/featured'
  });

  const displayData = data || initialData;

  if (error && !displayData) {
    return <ErrorMessage message="Failed to load museum items. Please try again later." />;
  }

  if (loading && !displayData) {
    return <MuseumSkeleton />;
  }

  return (
    <div className="museum-container">
      {loading && <LoadingIndicator />}
      {displayData?.data.map((item) => (
        <MuseumCard key={item.id} item={item} />
      ))}
    </div>
  );
}
```


#### Loading UI Components

```typescript
// components/LoadingUI.tsx
export function LeaderboardSkeleton() {
  return (
    <div className="leaderboard-skeleton">
      {[...Array(10)].map((_, i) => (
        <div key={i} className="skeleton-entry">
          <div className="skeleton-rank" />
          <div className="skeleton-avatar" />
          <div className="skeleton-name" />
          <div className="skeleton-points" />
        </div>
      ))}
    </div>
  );
}

export function MuseumSkeleton() {
  return (
    <div className="museum-skeleton">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="skeleton-card">
          <div className="skeleton-image" />
          <div className="skeleton-title" />
          <div className="skeleton-description" />
        </div>
      ))}
    </div>
  );
}

export function LoadingIndicator() {
  return (
    <div className="loading-indicator">
      <div className="spinner" />
      <span>Updating...</span>
    </div>
  );
}
```

#### Error Display Component

```typescript
// components/ErrorMessage.tsx
interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="error-container">
      <div className="error-icon">⚠️</div>
      <p className="error-message">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="retry-button">
          Try Again
        </button>
      )}
    </div>
  );
}
```


## Data Flow

### Initial Page Load (SSR)

1. User navigates to homepage
2. Next.js server receives request
3. Server initiates parallel API calls to:
   - `/api/leaderboard`
   - `/api/museum/featured`
4. Server waits for responses (with 2000ms timeout)
5. Server aggregates data (or error states)
6. Server renders HTML with data embedded
7. Client receives fully-rendered HTML
8. React hydrates the page with interactive components

### Client-Side Updates

1. Component mounts or refresh trigger fires
2. `useDataSync` hook initiates fetch
3. Loading state activates (shows loading indicator)
4. API request sent with 2000ms timeout
5. On success:
   - Data state updated
   - Loading state cleared
   - DOM updates with new data
6. On error:
   - Error state set
   - Error logged to console
   - Error UI displayed
   - Previous data retained (if exists)

### Parallel Fetching Strategy

Both SSR and client-side fetching use `Promise.all()` to execute API calls in parallel:

```typescript
const [leaderboardData, museumData] = await Promise.all([
  fetchLeaderboard(),
  fetchMuseum()
]);
```

This ensures:
- Minimum total fetch time (max of individual times, not sum)
- Independent error handling per endpoint
- Consistent data timestamp across sections


## Error Handling Strategy

### Error Categories

1. **Network Errors**
   - Connection failures
   - DNS resolution failures
   - SSL/TLS errors

2. **Timeout Errors**
   - Request exceeds 2000ms
   - AbortController triggers cancellation

3. **HTTP Errors**
   - 4xx Client errors
   - 5xx Server errors

4. **Parse Errors**
   - Invalid JSON responses
   - Malformed data structures

### Error Handling Per Layer

#### SSR Error Handling

```typescript
try {
  const response = await fetch(endpoint, { 
    signal: AbortSignal.timeout(2000) 
  });
  
  if (!response.ok) {
    return { 
      error: true, 
      statusCode: response.status,
      message: `API returned ${response.status}` 
    };
  }
  
  return await response.json();
} catch (error) {
  console.error('SSR fetch error:', error);
  return { 
    error: true, 
    message: error.name === 'TimeoutError' 
      ? 'Request timed out' 
      : 'Failed to load data' 
  };
}
```

Key principles:
- Never crash the page on API failure
- Always return a valid props object
- Log errors for debugging
- Provide error state to components

#### Client-Side Error Handling

```typescript
try {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2000);
  
  const response = await fetch(endpoint, { signal: controller.signal });
  clearTimeout(timeoutId);
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  const data = await response.json();
  setData(data);
  setError(null);
} catch (err) {
  console.error(`Fetch error for ${endpoint}:`, err);
  setError(err as Error);
  // Retain previous data if available
}
```

Key principles:
- Display error UI without removing previous data
- Log all errors with context
- Allow user retry
- Don't block UI interaction


## State Management

### Component State Structure

```typescript
interface DataSyncState<T> {
  data: T | null;           // Current data
  loading: boolean;         // Is fetch in progress
  error: Error | null;      // Last error
  lastUpdated: Date | null; // Timestamp of last successful fetch
}
```

### State Transitions

```
Initial State: { data: null, loading: false, error: null, lastUpdated: null }

Fetch Started:
  { data: previous, loading: true, error: null, lastUpdated: previous }

Fetch Success:
  { data: newData, loading: false, error: null, lastUpdated: now }

Fetch Error:
  { data: previous, loading: false, error: errorObj, lastUpdated: previous }
```

### Caching Strategy

```typescript
// Simple in-memory cache with TTL
class DataCache {
  private cache = new Map<string, CacheEntry>();
  
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
}

const dataCache = new DataCache();

// Use in fetch logic
const cacheKey = `${endpoint}-${JSON.stringify(params)}`;
const cached = dataCache.get(cacheKey);

if (cached) {
  return cached;
}

const fresh = await fetchFromAPI();
dataCache.set(cacheKey, fresh, 60000); // 60 second TTL
return fresh;
```


## Performance Optimizations

### 1. Parallel API Calls

Execute all data fetches concurrently to minimize total loading time:

```typescript
// Bad: Sequential (total time = sum of all requests)
const leaderboard = await fetch('/api/leaderboard');
const museum = await fetch('/api/museum/featured');

// Good: Parallel (total time = max of all requests)
const [leaderboard, museum] = await Promise.all([
  fetch('/api/leaderboard'),
  fetch('/api/museum/featured')
]);
```

### 2. Response Caching

Implement client-side caching to reduce redundant API calls:
- Cache TTL: 60 seconds for leaderboard and museum data
- Cache invalidation on manual refresh
- Cache key includes endpoint + params

### 3. Skeleton Screens

Use skeleton screens instead of spinners for better perceived performance:
- Skeleton layout matches actual content structure
- Reduces layout shift
- Provides visual feedback immediately

### 4. Incremental Hydration

Next.js automatically handles incremental hydration:
- Server-rendered HTML displays immediately
- JavaScript hydration happens progressively
- Interactive elements become functional as they hydrate

### 5. Request Deduplication

Prevent duplicate requests for the same data:

```typescript
const pendingRequests = new Map<string, Promise<any>>();

async function fetchWithDeduplication(url: string) {
  if (pendingRequests.has(url)) {
    return pendingRequests.get(url);
  }
  
  const promise = fetch(url).then(r => r.json());
  pendingRequests.set(url, promise);
  
  try {
    const result = await promise;
    return result;
  } finally {
    pendingRequests.delete(url);
  }
}
```


## Backend API Implementation

### NestJS Controller Structure

```typescript
// src/controllers/leaderboard.controller.ts
import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { LeaderboardService } from '../services/leaderboard.service';

@Controller('api/leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get()
  async getLeaderboard() {
    try {
      const data = await this.leaderboardService.getTopUsers(10);
      return {
        data,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Leaderboard fetch error:', error);
      throw new HttpException(
        'Failed to fetch leaderboard data',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}

// src/controllers/museum.controller.ts
import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { MuseumService } from '../services/museum.service';

@Controller('api/museum')
export class MuseumController {
  constructor(private readonly museumService: MuseumService) {}

  @Get('featured')
  async getFeaturedItems() {
    try {
      const data = await this.museumService.getFeaturedItems();
      return {
        data,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Museum fetch error:', error);
      throw new HttpException(
        'Failed to fetch museum data',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
```

### Service Layer

```typescript
// src/services/leaderboard.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@emerald-kingdom/db';

@Injectable()
export class LeaderboardService {
  constructor(private prisma: PrismaService) {}

  async getTopUsers(limit: number = 10) {
    return this.prisma.user.findMany({
      take: limit,
      orderBy: { points: 'desc' },
      select: {
        id: true,
        username: true,
        points: true,
        avatar: true
      }
    }).then(users => users.map((user, index) => ({
      rank: index + 1,
      userId: user.id,
      username: user.username,
      points: user.points,
      avatar: user.avatar
    })));
  }
}
```


## Testing Strategy

### Unit Tests

**Backend API Tests:**
- Test controller response format
- Test service data transformation
- Test error handling for database failures
- Test input validation

**Frontend Component Tests:**
- Test rendering with initial data
- Test loading state display
- Test error state display
- Test data update flow

### Integration Tests

**SSR Integration:**
- Test server-side data fetching
- Test HTML includes fetched data
- Test SSR error handling
- Test page renders without crashing on API failure

**Client-Side Integration:**
- Test client fetch after mount
- Test client fetch on refresh
- Test parallel API calls
- Test cache behavior

**End-to-End Tests:**
- Test full page load with SSR data
- Test client-side updates after initial load
- Test error recovery flow
- Test data consistency with admin dashboard

### Property-Based Tests

Property-based tests will validate universal correctness properties across randomly generated inputs (see Correctness Properties section below).

Minimum 100 iterations per property test.


## Migration Strategy

### Phase 1: Backend API Setup
1. Implement leaderboard controller and service
2. Implement museum controller and service
3. Test endpoints in isolation
4. Verify response formats match requirements

### Phase 2: SSR Implementation
1. Add server-side fetch logic to homepage
2. Pass fetched data as initial props
3. Test SSR with real API calls
4. Verify HTML includes data

### Phase 3: Component Refactoring
1. Replace hardcoded leaderboard with dynamic component
2. Replace hardcoded museum with dynamic component
3. Verify visual layout maintained
4. Verify no auction functionality affected

### Phase 4: Client-Side Updates
1. Implement `useDataSync` hook
2. Add client-side fetching to components
3. Implement loading and error UI
4. Test data refresh flow

### Phase 5: Optimization & Polish
1. Add caching layer
2. Optimize parallel fetching
3. Refine loading UI transitions
4. Performance testing

### Phase 6: Verification
1. Compare homepage data with admin dashboard
2. Test error scenarios
3. Performance benchmarking
4. User acceptance testing


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Error Status Code Mapping

*For any* API error condition (network failure, timeout, server error, client error), the Data_Synchronization_System SHALL return an appropriate HTTP status code that correctly categorizes the error type.

**Validates: Requirements 1.6**

### Property 2: Client-Side Content Updates Without Reload

*For any* valid data payload fetched client-side, the Data_Synchronization_System SHALL update the displayed content in the DOM without triggering a full page reload, preserving scroll position and maintaining interactive state.

**Validates: Requirements 3.4**

### Property 3: Loading to Loaded State Transition

*For any* successful data fetch completion, the Data_Synchronization_System SHALL replace the loading UI with the actual data within 500ms, ensuring the loading indicator is no longer visible.

**Validates: Requirements 4.3, 4.5**

### Property 4: Visual Layout Consistency

*For any* valid data payload (varying in content length, structure, and values), rendering the data SHALL preserve the existing visual layout constraints including positioning, spacing, and responsive breakpoints.

**Validates: Requirements 5.3**


### Property 5: Error Message Display in Correct Sections

*For any* API endpoint failure (leaderboard or museum) and any error type (network, timeout, HTTP error), the Data_Synchronization_System SHALL display an error message in the corresponding section (leaderboard errors in leaderboard section, museum errors in museum section) without affecting other sections.

**Validates: Requirements 6.1, 6.2**

### Property 6: Comprehensive Error Logging

*For any* API request failure (regardless of error type or endpoint), the Data_Synchronization_System SHALL log the error to the console with sufficient context including endpoint, error type, and error message for debugging purposes.

**Validates: Requirements 6.3**

### Property 7: Graceful SSR Error Handling

*For any* API error occurring during server-side rendering (network failure, timeout, server error), the Data_Synchronization_System SHALL render and return a valid HTML page with an error state rather than crashing or returning a 500 error response.

**Validates: Requirements 6.4**

### Property 8: Data Consistency with Admin Dashboard

*For any* data payload fetched from the API endpoints, the homepage display SHALL produce output identical to the admin dashboard when both consume the same API response, ensuring no divergent data transformation or filtering.

**Validates: Requirements 7.2, 7.3**

### Property 9: Cache Effectiveness

*For any* sequence of identical API requests within the cache TTL window (60 seconds), the Data_Synchronization_System SHALL serve data from cache for subsequent requests, reducing the number of actual HTTP requests to one per unique endpoint per TTL period.

**Validates: Requirements 8.4**


## Security Considerations

### API Security

1. **Rate Limiting:** Implement throttling on API endpoints to prevent abuse
2. **CORS Configuration:** Configure CORS to allow only trusted origins
3. **Input Validation:** Validate all query parameters and request headers
4. **Authentication:** Maintain existing authentication for admin APIs

### Client-Side Security

1. **XSS Prevention:** Sanitize all data before rendering to DOM
2. **HTTPS Only:** Enforce HTTPS for all API communication
3. **Error Message Safety:** Don't expose sensitive system information in error messages
4. **Timeout Enforcement:** Always use AbortController to prevent hanging requests

## Monitoring and Observability

### Metrics to Track

1. **API Performance:**
   - Response time (p50, p95, p99)
   - Error rate
   - Request volume

2. **SSR Performance:**
   - Server-side fetch duration
   - HTML generation time
   - Total TTFB (Time to First Byte)

3. **Client-Side Performance:**
   - Client-side fetch duration
   - UI update latency
   - Cache hit rate

4. **Error Tracking:**
   - Error frequency by type
   - Error frequency by endpoint
   - Failed request recovery rate

### Logging Strategy

```typescript
// Structured logging for observability
logger.info('SSR fetch started', {
  endpoint: '/api/leaderboard',
  timestamp: Date.now()
});

logger.error('API fetch failed', {
  endpoint: '/api/museum/featured',
  errorType: error.name,
  errorMessage: error.message,
  statusCode: response?.status,
  duration: fetchDuration
});
```


## Backward Compatibility Guarantees

### Preserved Functionality

1. **Auction System:** All existing auction data fetching, bidding, and real-time updates remain unchanged
2. **Admin Dashboard:** All admin API integrations continue to function identically
3. **Routing:** All existing routes and navigation paths remain functional
4. **Styling:** CSS classes and visual design maintained
5. **Third-Party Integrations:** Stripe, Socket.io, and other integrations unaffected

### Non-Breaking Changes

The implementation will:
- Add new API endpoints (no modifications to existing ones)
- Replace only hardcoded data sections (no functional changes)
- Use existing UI component patterns and styling
- Maintain existing state management approach
- Preserve all event handlers and user interactions

### Rollback Strategy

If issues arise during deployment:
1. Keep hardcoded data as fallback in code (commented out)
2. Feature flag for enabling/disabling dynamic fetching
3. Quick rollback by reverting to hardcoded data
4. Independent deployment of backend and frontend

## Future Enhancements

### Potential Improvements

1. **Real-Time Updates:** WebSocket integration for live data push
2. **Optimistic Updates:** Update UI before API confirmation
3. **Offline Support:** Service worker caching for offline viewing
4. **Pagination:** Support for large leaderboards
5. **Filtering:** User-controlled data filtering and sorting
6. **Personalization:** User-specific data views

### Scalability Considerations

1. **API Caching:** Add Redis caching layer on backend
2. **CDN Integration:** Cache API responses at CDN edge
3. **Database Optimization:** Add indexes for leaderboard queries
4. **Load Balancing:** Distribute API load across instances

