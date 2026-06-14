# Admin Panel Application

This is the administrative interface for the Emerald Kingdom platform. It allows authorized administrators to manage auctions, users, and other platform resources.

## Environment Configuration

The admin panel requires environment variables to be configured in `.env.local` file at the root of this directory.

### Required Environment Variables

#### `NEXT_PUBLIC_API_URL`

The base URL for the backend API service that the admin panel communicates with.

**Development:**
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

**Production:**
```
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
```

Replace `https://api.yourdomain.com` with your actual production API domain.

### Setup Instructions

1. Copy the example environment file (if available) or create a new `.env.local` file:
   ```bash
   # If .env.local doesn't exist, create it:
   touch .env.local
   ```

2. Add the required environment variables to `.env.local`:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   ```

3. Restart the development server for changes to take effect:
   ```bash
   npm run dev
   ```

### Notes

- The `NEXT_PUBLIC_` prefix is required for Next.js to expose this variable to the browser
- Changes to `.env.local` require a server restart
- Never commit `.env.local` to version control (it's already in `.gitignore`)
- For production deployments, set this environment variable in your hosting platform's configuration

## Authentication

The admin panel uses JWT token-based authentication stored in `localStorage` under the key `admin_token`. The API utility module (`src/lib/api.ts`) automatically:

- Includes the token in all API requests via `Authorization: Bearer <token>` header
- Redirects to `/login` when the token is invalid or expired (401 response)
- Handles network errors gracefully

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Project Structure

```
apps/admin/
├── src/
│   ├── app/          # Next.js app directory with pages and layouts
│   ├── lib/          # Utility modules and helpers
│   │   └── api.ts    # Authenticated API client
│   └── components/   # Reusable React components
├── .env.local        # Environment variables (not in git)
└── package.json      # Dependencies and scripts
```

## API Integration

All API calls should use the `fetchWithAuth` function from `src/lib/api.ts`:

```typescript
import { fetchWithAuth } from "@/lib/api";

// GET request
const response = await fetchWithAuth("/v1/admin/auctions?status=ACTIVE");
const data = await response.json();

// POST request
const response = await fetchWithAuth("/v1/admin/auctions", {
  method: "POST",
  body: JSON.stringify({ title: "New Auction", ... })
});
```

This ensures consistent authentication and error handling across all API calls.
