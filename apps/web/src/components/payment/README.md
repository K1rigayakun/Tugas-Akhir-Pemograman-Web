# Payment Components

This directory contains all payment-related components for the Emerald Kingdom auction platform's multiple payment methods feature.

## PaymentHistory Component

**Task 17.1** - Displays user's payment transaction history with pagination.

### Features

- ✅ Fetches payment history from `GET /payment/user/history` endpoint
- ✅ Displays paginated list (20 items per page)
- ✅ Shows amount (both CC and fiat), method, status, and timestamp for each transaction
- ✅ Displays admin notes for rejected payments
- ✅ Implements pagination controls (Previous/Next)
- ✅ Sorts by createdAt descending (newest first)
- ✅ Real-time loading and error states
- ✅ Empty state for users with no transactions

### Requirements Validated

- **Requirement 12.1**: Paginated list ordered by createdAt descending ✓
- **Requirement 12.2**: Display amount, method, status, timestamp ✓
- **Requirement 12.3**: Maximum 20 transactions per page ✓
- **Requirement 12.4**: Pagination controls ✓
- **Requirement 12.5**: Admin notes for REJECTED status ✓

### Usage

```tsx
import PaymentHistory from "@/components/payment/PaymentHistory";

export default function PaymentHistoryPage() {
  return (
    <div className="container">
      <h1>Riwayat Pembayaran</h1>
      <PaymentHistory />
    </div>
  );
}
```

### Example Integration in Profile Page

```tsx
// In apps/web/src/app/profile/page.tsx or similar

import PaymentHistory from "@/components/payment/PaymentHistory";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("info");
  
  return (
    <div>
      <Tabs>
        <Tab label="Info" onClick={() => setActiveTab("info")} />
        <Tab label="Riwayat Pembayaran" onClick={() => setActiveTab("history")} />
      </Tabs>
      
      {activeTab === "history" && <PaymentHistory />}
    </div>
  );
}
```

### API Endpoint

The component consumes the following endpoint:

- **GET** `/payment/user/history`
- **Query Parameters**:
  - `page` (number, default: 1) - Current page number
  - `limit` (number, default: 20) - Items per page
- **Response**:
  ```typescript
  {
    data: TopUpRequest[];
    total: number;
    page: number;
    totalPages: number;
  }
  ```

### Data Structure

```typescript
interface TopUpRequest {
  id: string;
  userId: string;
  amount: number;           // CC amount
  fiatAmount: number;       // IDR amount
  method: string;           // QRIS, VIRTUAL_ACCOUNT, EWALLET, STRIPE, TESTING
  provider?: string | null; // MIDTRANS, XENDIT, STRIPE
  bank?: string | null;     // For VA: BCA, BNI, etc.
  walletType?: string | null; // For E-Wallet: GOPAY, OVO, etc.
  status: "PENDING" | "PAID" | "APPROVED" | "REJECTED" | "EXPIRED";
  proofImageUrl?: string | null;
  paymentDetails?: any;
  expiresAt?: string | null;
  paidAt?: string | null;
  adminNotes?: string | null;  // Shown for REJECTED status
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}
```

### Styling

The component uses inline styles matching the existing Emerald Kingdom design system:

- **Gold accents**: `var(--color-gold)`, `var(--color-gold-light)`
- **Dark backgrounds**: `rgba(14, 14, 18, 0.6)`
- **Emerald colors**: `var(--color-emerald-primary)`
- **Typography**: `var(--font-heading)`, `var(--font-subheading)`
- **Status colors**:
  - PENDING: Gold (`#C9A84C`)
  - PAID: Green (`#22c55e`)
  - APPROVED: Emerald (`#10b981`)
  - REJECTED: Red (`#dc2626`)
  - EXPIRED: Gray (`rgba(245, 240, 232, 0.4)`)

### Testing

Tests are located in `PaymentHistory.test.ts` and validate:

- ✅ Data structure integrity
- ✅ Pagination logic (20 items per page)
- ✅ Sorting order (createdAt descending)
- ✅ Required fields display (amount, method, status, timestamp)
- ✅ Admin notes for REJECTED status
- ✅ Status configuration mapping
- ✅ Method label mapping

Run tests:
```bash
npx ts-node apps/web/src/components/payment/PaymentHistory.test.ts
```

## Other Payment Components

- **PaymentMethodGrid** - Displays available payment method options
- **QRISPaymentDisplay** - Shows QR code for QRIS payments
- **VirtualAccountDisplay** - Displays VA number and bank details
- **EWalletPaymentDisplay** - E-wallet payment flow
- **TestingPaymentDisplay** - Demo/testing payment method
- **PaymentStatusTracker** - Real-time payment status tracking
- **ProofUploader** - Upload payment proof images
- **CountdownTimer** - Payment expiration countdown

## Design System Integration

All components follow the Emerald Kingdom luxury aesthetic:

- Dark backgrounds with subtle gradients
- Gold and emerald color accents
- Elegant typography hierarchy
- Smooth transitions and hover effects
- Responsive grid layouts
- Accessible form controls
