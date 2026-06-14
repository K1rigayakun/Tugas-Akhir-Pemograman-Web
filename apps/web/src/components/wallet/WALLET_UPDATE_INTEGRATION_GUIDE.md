# Wallet Balance Update Integration Guide

## Overview

This guide shows how to integrate the wallet balance update notification system into your application features. The WalletBalance component automatically updates the displayed balance within 2 seconds when wallet changes occur.

---

## Quick Start

### 1. Import the Trigger Function

```typescript
import { triggerWalletUpdate } from '@/components/wallet/WalletBalance';
```

### 2. Call After Wallet Changes

```typescript
// After any successful wallet transaction
triggerWalletUpdate();
```

### 3. Display the Balance

```typescript
import WalletBalance from '@/components/wallet/WalletBalance';

// In your component
<WalletBalance />
```

---

## Update Mechanisms

The system uses three mechanisms to keep balance synchronized:

### 1. ⚡ Custom Event System (Instant - <2 seconds)

**Best for**: Immediate updates after user actions

```typescript
import { triggerWalletUpdate } from '@/components/wallet/WalletBalance';

const handleTransaction = async () => {
  const response = await fetch('/api/v1/wallet/transaction', {
    method: 'POST',
    // ... transaction data
  });
  
  if (response.ok) {
    // ✅ Trigger instant update
    triggerWalletUpdate();
  }
};
```

**How it works**:
1. `triggerWalletUpdate()` dispatches a `walletUpdated` DOM event
2. All WalletBalance components listen for this event
3. Each component immediately fetches fresh balance from API
4. UI updates within ~100-500ms (API response time)

### 2. 🔄 Polling Mechanism (Every 30 seconds)

**Best for**: Background synchronization

The component automatically polls every 30 seconds. No code needed!

```typescript
// This happens automatically in WalletBalance component
const intervalId = setInterval(fetchBalance, 30000);
```

**Use cases**:
- Catch updates from external sources (admin approvals)
- Provide fallback when WebSocket is unavailable
- Ensure eventual consistency

### 3. 🌐 WebSocket Support (Real-time)

**Best for**: Instant updates from backend events

The backend already emits payment status changes via WebSocket:

```typescript
// Backend (already implemented)
@OnEvent('payment.status.changed')
handlePaymentStatusChanged(payload) {
  this.server.to(`user_${payload.userId}`)
    .emit('payment:status:changed', payload);
}
```

To integrate WebSocket updates (optional):

```typescript
import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { triggerWalletUpdate } from '@/components/wallet/WalletBalance';

export function useWalletSocket(userId: string) {
  useEffect(() => {
    const socket = io(`${process.env.NEXT_PUBLIC_API_URL}/payments`);
    
    socket.on('connect', () => {
      socket.emit('subscribe:user', userId);
    });
    
    socket.on('payment:status:changed', (data) => {
      if (data.status === 'APPROVED') {
        // ✅ Trigger wallet update when payment approved
        triggerWalletUpdate();
      }
    });
    
    return () => {
      socket.disconnect();
    };
  }, [userId]);
}
```

---

## Integration Patterns

### Pattern 1: Top-Up Success Page

```typescript
// apps/web/src/app/topup/success/page.tsx
'use client';

import { useEffect } from 'react';
import { triggerWalletUpdate } from '@/components/wallet/WalletBalance';
import WalletBalance from '@/components/wallet/WalletBalance';

export default function TopUpSuccessPage() {
  useEffect(() => {
    // Trigger update when user lands on success page
    triggerWalletUpdate();
  }, []);

  return (
    <div className="success-container">
      <h1>✅ Top-Up Successful!</h1>
      <p>Your new balance:</p>
      <WalletBalance className="text-3xl font-bold" />
      <a href="/dashboard">Go to Dashboard</a>
    </div>
  );
}
```

### Pattern 2: Bid Placement

```typescript
// apps/web/src/components/auction/BidButton.tsx
import { triggerWalletUpdate } from '@/components/wallet/WalletBalance';

const handlePlaceBid = async (amount: number) => {
  try {
    const response = await fetch('/api/v1/bids/place', {
      method: 'POST',
      body: JSON.stringify({ auctionId, amount }),
    });
    
    if (response.ok) {
      // ✅ Update wallet balance after successful bid
      triggerWalletUpdate();
      
      toast.success('Bid placed successfully!');
    } else {
      const error = await response.json();
      toast.error(error.message);
    }
  } catch (error) {
    console.error('Bid placement failed:', error);
    toast.error('Failed to place bid');
  }
};
```

### Pattern 3: Shop Purchase

```typescript
// apps/web/src/app/shop/purchase/page.tsx
import { triggerWalletUpdate } from '@/components/wallet/WalletBalance';

const handlePurchase = async (itemId: string, price: number) => {
  const confirmed = confirm(`Purchase item for ${price} CC?`);
  if (!confirmed) return;
  
  try {
    const response = await fetch('/api/v1/shop/purchase', {
      method: 'POST',
      body: JSON.stringify({ itemId }),
    });
    
    if (response.ok) {
      // ✅ Update wallet after purchase
      triggerWalletUpdate();
      
      toast.success('Purchase successful!');
      router.push('/inventory');
    }
  } catch (error) {
    console.error('Purchase failed:', error);
  }
};
```

### Pattern 4: Transaction History Page

```typescript
// apps/web/src/app/wallet/transactions/page.tsx
'use client';

import { useEffect } from 'react';
import { triggerWalletUpdate } from '@/components/wallet/WalletBalance';
import WalletBalance from '@/components/wallet/WalletBalance';

export default function TransactionsPage() {
  // Optional: Refresh balance when user views transaction history
  useEffect(() => {
    triggerWalletUpdate();
  }, []);

  return (
    <div>
      <header>
        <h1>Transaction History</h1>
        <WalletBalance inline />
      </header>
      
      <TransactionList />
      
      <button onClick={() => triggerWalletUpdate()}>
        🔄 Refresh Balance
      </button>
    </div>
  );
}
```

### Pattern 5: Admin Panel (Optional Enhancement)

The admin panel is a separate application, so direct integration isn't required. However, you can optionally enhance it to provide feedback:

```typescript
// apps/admin/src/app/topups/page.tsx (optional enhancement)
const handleApprove = async (id: string) => {
  const res = await fetchWithAuth(`/v1/payment/admin/${id}/approve`, {
    method: "POST",
    body: JSON.stringify({ notes: approveNotes || undefined }),
  });
  
  if (res.ok) {
    alert("Top Up berhasil disetujui! Saldo user akan diupdate otomatis.");
    
    // The user's browser will receive the update via:
    // 1. WebSocket (if connected) - instant
    // 2. Polling (30 seconds) - automatic
    // 3. Manual refresh - when they navigate
    
    fetchTopups();
  }
};
```

**Note**: Admin approval automatically updates the user's wallet in the database. The user's browser will receive updates through polling or WebSocket without additional code.

---

## Multiple WalletBalance Components

All instances stay synchronized automatically when `triggerWalletUpdate()` is called:

```typescript
// Example: Dashboard with multiple balance displays
export default function Dashboard() {
  return (
    <div>
      {/* Header balance */}
      <header>
        <WalletBalance showIcon={true} />
      </header>
      
      {/* Sidebar widget */}
      <aside>
        <h3>Quick Stats</h3>
        <WalletBalance inline className="text-emerald-500" />
      </aside>
      
      {/* Main content */}
      <main>
        <section className="wallet-overview">
          <h2>Wallet Overview</h2>
          <WalletBalance 
            showIcon={false} 
            className="text-4xl font-bold"
          />
        </section>
      </main>
      
      {/* Footer */}
      <footer>
        Balance: <WalletBalance inline showIcon={false} />
      </footer>
    </div>
  );
}

// When you call triggerWalletUpdate() anywhere in the app:
// → ALL 4 components update simultaneously! ✨
```

---

## Testing Your Integration

### Manual Testing

1. **Test Immediate Update**:
   ```javascript
   // Open browser console
   window.dispatchEvent(new Event('walletUpdated'));
   // ✅ Balance should refresh immediately
   ```

2. **Test After Transaction**:
   - Complete a transaction (top-up, bid, purchase)
   - Verify balance updates within 2 seconds
   - Check Network tab for API call to `/wallet/balance`

3. **Test Polling**:
   - Open app with WalletBalance component
   - Wait 30 seconds
   - Check Network tab for automatic balance refresh

4. **Test Offline Mode**:
   - Go offline (DevTools → Network → Offline)
   - Refresh page
   - Verify cached balance displays with warning indicator (⚠)

### Debugging

Enable console logs to see update flow:

```typescript
// Add to your component
useEffect(() => {
  const handler = () => {
    console.log('🔔 walletUpdated event received!');
  };
  
  window.addEventListener('walletUpdated', handler);
  return () => window.removeEventListener('walletUpdated', handler);
}, []);
```

---

## Common Patterns & Best Practices

### ✅ DO: Call After Successful Transactions

```typescript
if (response.ok) {
  triggerWalletUpdate(); // ✅ Good
  toast.success('Transaction successful!');
}
```

### ✅ DO: Use in Success Callbacks

```typescript
onSuccess: () => {
  triggerWalletUpdate(); // ✅ Good
  router.push('/success');
}
```

### ✅ DO: Call Once Per Transaction

```typescript
await createTransaction();
triggerWalletUpdate(); // ✅ Call once
```

### ❌ DON'T: Call in Loops

```typescript
// ❌ Bad - creates unnecessary API calls
items.forEach(item => {
  processItem(item);
  triggerWalletUpdate(); // ❌ Don't do this
});

// ✅ Good - call once after all items processed
items.forEach(item => processItem(item));
triggerWalletUpdate(); // ✅ Call once
```

### ❌ DON'T: Call Before Transaction Completes

```typescript
// ❌ Bad - premature update
fetch('/api/transaction', { method: 'POST' });
triggerWalletUpdate(); // ❌ Transaction not confirmed yet

// ✅ Good - wait for confirmation
const response = await fetch('/api/transaction', { method: 'POST' });
if (response.ok) {
  triggerWalletUpdate(); // ✅ Transaction confirmed
}
```

### ⚠️ OPTIONAL: Call on Page Navigation

```typescript
// Optional enhancement: Refresh when user navigates to wallet pages
useEffect(() => {
  triggerWalletUpdate(); // Ensures fresh data
}, []);
```

---

## API Reference

### `triggerWalletUpdate()`

Triggers an immediate wallet balance refresh for all WalletBalance components.

**Signature**:
```typescript
function triggerWalletUpdate(): void
```

**Usage**:
```typescript
import { triggerWalletUpdate } from '@/components/wallet/WalletBalance';

// Call after any wallet transaction
triggerWalletUpdate();
```

**Internal Implementation**:
```typescript
export function triggerWalletUpdate() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('walletUpdated'));
  }
}
```

### `WalletBalance` Component

Displays the user's wallet balance with automatic updates.

**Props**:
```typescript
interface WalletBalanceComponentProps {
  className?: string;   // Custom CSS classes
  showIcon?: boolean;   // Show wallet icon (default: true)
  inline?: boolean;     // Inline text display (default: false)
}
```

**Example**:
```typescript
import WalletBalance from '@/components/wallet/WalletBalance';

<WalletBalance 
  className="text-2xl font-bold text-emerald-500"
  showIcon={true}
  inline={false}
/>
```

---

## Performance Considerations

| Action | Frequency | Impact |
|--------|-----------|--------|
| `triggerWalletUpdate()` | On-demand | Low (single API call ~100-500ms) |
| Polling | Every 30s | Low (background request) |
| WebSocket | Real-time | Minimal (push notification) |

**Recommendations**:
- ✅ Call `triggerWalletUpdate()` after user-initiated transactions
- ✅ Let polling handle background sync
- ⚠️ Avoid calling `triggerWalletUpdate()` more than once per second
- ⚠️ Don't call in render loops or useEffect without dependencies

---

## Troubleshooting

### Balance Not Updating

1. **Check if API is responding**:
   ```javascript
   // Browser console
   fetch('/api/v1/wallet/balance')
     .then(r => r.json())
     .then(console.log);
   ```

2. **Verify event is firing**:
   ```javascript
   // Browser console
   window.addEventListener('walletUpdated', () => {
     console.log('✅ Event received!');
   });
   window.dispatchEvent(new Event('walletUpdated'));
   ```

3. **Check for errors in console**:
   - Open DevTools → Console
   - Look for "Failed to fetch wallet balance" errors
   - Verify authentication token is valid

### Cached Balance Showing

If you see the warning indicator (⚠):
- API is currently unavailable
- Balance shown is from localStorage cache
- Will auto-update when API recovers
- Polling will retry every 30 seconds

### Update Delayed

If balance takes longer than 2 seconds:
- Check network conditions (DevTools → Network)
- Verify API response time
- Consider network latency
- Polling fallback will sync within 30 seconds

---

## Summary Checklist

Integration checklist for wallet-affecting features:

- [ ] Import `triggerWalletUpdate` from `@/components/wallet/WalletBalance`
- [ ] Call `triggerWalletUpdate()` after successful transaction
- [ ] Add `<WalletBalance />` component to display balance
- [ ] Test update occurs within 2 seconds
- [ ] Verify multiple instances stay synchronized
- [ ] Check offline mode shows cached balance with warning
- [ ] Confirm polling works (wait 30 seconds, check Network tab)

---

## Need Help?

Refer to these files for more information:

- **Implementation Details**: `.kiro/specs/comprehensive-bug-fixes-and-improvements/TASK_3.4_IMPLEMENTATION.md`
- **Usage Examples**: `apps/web/src/components/wallet/WalletBalance.example.tsx`
- **Component Source**: `apps/web/src/components/wallet/WalletBalance.tsx`
- **Tests**: `apps/web/src/components/wallet/WalletBalance.test.tsx`
- **WebSocket Backend**: `apps/api/src/modules/payment/payment.gateway.ts`

---

**Happy coding!** 🚀
