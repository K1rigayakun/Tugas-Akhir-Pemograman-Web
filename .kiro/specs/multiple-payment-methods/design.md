# Design Document: Multiple Payment Methods

## Overview

This document outlines the architectural design for implementing a comprehensive multiple payment methods feature for the Emerald Kingdom auction platform. The system integrates various Indonesian payment methods (QRIS, Virtual Account, E-Wallet), testing capabilities, and existing Stripe integration into a unified payment experience with real-time status tracking, countdown timers, and admin approval workflows.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          Frontend (Next.js)                      │
│  ┌────────────────┐  ┌──────────────────┐  ┌─────────────────┐ │
│  │ Payment Method │  │  Payment Status  │  │  Admin Panel    │ │
│  │   Selection    │  │   Tracking UI    │  │   Review UI     │ │
│  └────────────────┘  └──────────────────┘  └─────────────────┘ │
└──────────────────┬──────────────────────────────────┬───────────┘
                   │                                  │
                   │  REST API / WebSocket            │
                   │                                  │
┌──────────────────┴──────────────────────────────────┴───────────┐
│                       Backend (NestJS)                           │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              Payment Service Module                        │ │
│  │  ┌──────────────┐  ┌────────────────┐  ┌──────────────┐  │ │
│  │  │   Payment    │  │    Provider    │  │   Webhook    │  │ │
│  │  │  Controller  │  │    Registry    │  │   Handler    │  │ │
│  │  └──────────────┘  └────────────────┘  └──────────────┘  │ │
│  └────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              Payment Provider Interface                    │ │
│  │  ┌──────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌───────┐ │ │
│  │  │ Midtrans │ │ Xendit │ │ Stripe │ │  Test  │ │ Mock  │ │ │
│  │  │ Provider │ │Provider│ │Provider│ │Provider│ │Provider│ │ │
│  │  └──────────┘ └────────┘ └────────┘ └────────┘ └───────┘ │ │
│  └────────────────────────────────────────────────────────────┘ │
└──────────────────┬──────────────────────────────────┬───────────┘
                   │                                  │
┌──────────────────┴──────────────────────────────────┴───────────┐
│                  Database (PostgreSQL + Prisma)                  │
│  ┌────────────────┐  ┌──────────────┐  ┌───────────────────┐   │
│  │ TopUpRequest   │  │     User     │  │  TransactionLog   │   │
│  └────────────────┘  └──────────────┘  └───────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

**Frontend Components:**
- **PaymentMethodGrid**: Displays available payment methods with icons and labels
- **PaymentFlow**: Method-specific UI for QRIS, VA, E-Wallet, Stripe, Testing
- **CountdownTimer**: Real-time countdown display with MM:SS format
- **PaymentStatusTracker**: Displays current payment status with appropriate messaging
- **ProofUploader**: File upload component for payment proof images
- **AdminReviewPanel**: Admin interface for reviewing and approving payments
- **PaymentHistory**: Paginated list of user's past transactions

**Backend Services:**
- **PaymentService**: Core business logic for payment processing
- **PaymentProviderRegistry**: Manages registration and selection of payment providers
- **WebhookHandler**: Processes and validates payment gateway webhooks
- **PaymentProvider Interface**: Abstract interface for payment gateway implementations
- **MidtransProvider**: Implementation for QRIS, VA, and E-Wallet via Midtrans
- **XenditProvider**: Alternative implementation for QRIS, VA, and E-Wallet via Xendit
- **StripeProvider**: Existing Stripe integration wrapped in provider interface
- **TestingProvider**: Mock provider for development and testing
- **AdminService**: Handles admin approval/rejection workflows and balance updates

## Data Model

### Database Schema Extensions

The existing `TopUpRequest` model will be extended to support multiple payment methods:

```typescript
model TopUpRequest {
  id                String      @id @default(cuid())
  userId            String
  amount            Int         // CC amount to be credited
  fiatAmount        Int         // Fiat currency amount (IDR)
  method            String      // QRIS, VA, EWALLET, STRIPE, TESTING
  provider          String?     // MIDTRANS, XENDIT, STRIPE
  bank              String?     // For VA: BCA, BNI, MANDIRI, BRI, PERMATA
  walletType        String?     // For E-Wallet: GOPAY, OVO, DANA, SHOPEEPAY, LINKAJA
  status            TopUpStatus @default(PENDING)
  proofImageUrl     String?
  paymentDetails    Json?       // Gateway-specific payment data (QR code, VA number, etc.)
  expiresAt         DateTime?   // Payment expiration timestamp
  paidAt            DateTime?   // When payment was received by gateway
  adminNotes        String?
  reviewedBy        String?
  reviewedAt        DateTime?
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
  
  admin             User?       @relation("AdminTopUps", fields: [reviewedBy], references: [id])
  user              User        @relation("UserTopUps", fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([status])
  @@index([method])
  @@index([expiresAt])
  @@map("topup_requests")
}

enum TopUpStatus {
  PENDING   // Initial state after creation
  PAID      // Payment received by gateway, awaiting admin approval
  APPROVED  // Admin approved, balance credited
  REJECTED  // Admin rejected
  EXPIRED   // Payment window expired
  CANCELLED // User cancelled
}
```

### Payment Details JSON Structure

The `paymentDetails` field stores gateway-specific data:

**QRIS:**
```typescript
{
  qrCodeBase64: string;  // Base64 encoded QR image
  qrString: string;      // QR code text content
  transactionId: string; // Gateway transaction ID
}
```

**Virtual Account:**
```typescript
{
  accountNumber: string;  // Virtual account number
  bankName: string;       // BCA, BNI, etc.
  bankCode: string;       // Bank identifier
  transactionId: string;  // Gateway transaction ID
}
```

**E-Wallet:**
```typescript
{
  redirectUrl: string;    // Web redirect URL
  deepLink: string;       // Mobile app deep link
  walletType: string;     // GOPAY, OVO, etc.
  transactionId: string;  // Gateway transaction ID
}
```

**Stripe:**
```typescript
{
  sessionId: string;      // Stripe checkout session ID
  sessionUrl: string;     // Stripe checkout URL
}
```

## Payment Provider Interface

### Abstract Provider Interface

```typescript
interface PaymentProvider {
  readonly name: string;
  readonly supportedMethods: PaymentMethod[];
  
  initialize(config: PaymentProviderConfig): Promise<void>;
  
  createPayment(request: CreatePaymentRequest): Promise<PaymentResponse>;
  
  checkPaymentStatus(transactionId: string): Promise<PaymentStatusResponse>;
  
  validateWebhook(payload: any, signature: string): Promise<boolean>;
  
  processWebhook(payload: any): Promise<WebhookResult>;
}

interface CreatePaymentRequest {
  userId: string;
  amount: number;
  fiatAmount: number;
  method: PaymentMethod;
  bank?: string;        // For VA
  walletType?: string;  // For E-Wallet
  metadata?: Record<string, any>;
}

interface PaymentResponse {
  transactionId: string;
  expiresAt: Date;
  paymentDetails: QRISDetails | VirtualAccountDetails | EWalletDetails | StripeDetails;
}

interface PaymentStatusResponse {
  transactionId: string;
  status: 'PENDING' | 'PAID' | 'EXPIRED' | 'CANCELLED';
  paidAt?: Date;
}

interface WebhookResult {
  transactionId: string;
  status: 'PAID' | 'EXPIRED' | 'CANCELLED';
  paidAt?: Date;
}

enum PaymentMethod {
  QRIS = 'QRIS',
  VIRTUAL_ACCOUNT = 'VIRTUAL_ACCOUNT',
  EWALLET = 'EWALLET',
  STRIPE = 'STRIPE',
  TESTING = 'TESTING'
}
```

### Midtrans Provider Implementation

```typescript
@Injectable()
export class MidtransProvider implements PaymentProvider {
  readonly name = 'MIDTRANS';
  readonly supportedMethods = [
    PaymentMethod.QRIS,
    PaymentMethod.VIRTUAL_ACCOUNT,
    PaymentMethod.EWALLET
  ];
  
  private snapClient: any;
  private coreApiClient: any;
  private isSandbox: boolean;
  
  async initialize(config: PaymentProviderConfig): Promise<void> {
    this.isSandbox = config.environment === 'sandbox';
    this.snapClient = new MidtransSnap({
      isProduction: !this.isSandbox,
      serverKey: config.serverKey,
      clientKey: config.clientKey
    });
    this.coreApiClient = new MidtransCoreApi({
      isProduction: !this.isSandbox,
      serverKey: config.serverKey,
      clientKey: config.clientKey
    });
  }
  
  async createPayment(request: CreatePaymentRequest): Promise<PaymentResponse> {
    const orderId = `topup-${Date.now()}-${request.userId}`;
    
    const parameter: any = {
      transaction_details: {
        order_id: orderId,
        gross_amount: request.fiatAmount
      },
      customer_details: {
        user_id: request.userId
      }
    };
    
    // Method-specific configuration
    if (request.method === PaymentMethod.QRIS) {
      parameter.payment_type = 'qris';
      parameter.qris = { acquirer: 'gopay' };
    } else if (request.method === PaymentMethod.VIRTUAL_ACCOUNT) {
      parameter.payment_type = 'bank_transfer';
      parameter.bank_transfer = { bank: request.bank?.toLowerCase() };
    } else if (request.method === PaymentMethod.EWALLET) {
      parameter.payment_type = request.walletType?.toLowerCase();
      parameter[request.walletType?.toLowerCase() || ''] = {
        enable_callback: true
      };
    }
    
    const transaction = await this.coreApiClient.charge(parameter);
    
    return this.parseTransactionResponse(transaction, request.method);
  }
  
  async validateWebhook(payload: any, signature: string): Promise<boolean> {
    const expectedSignature = crypto
      .createHash('sha512')
      .update(`${payload.order_id}${payload.status_code}${payload.gross_amount}${this.serverKey}`)
      .digest('hex');
    return signature === expectedSignature;
  }
  
  async processWebhook(payload: any): Promise<WebhookResult> {
    const status = this.mapMidtransStatus(payload.transaction_status);
    return {
      transactionId: payload.order_id,
      status,
      paidAt: status === 'PAID' ? new Date(payload.settlement_time) : undefined
    };
  }
}
```

### Testing Provider Implementation

```typescript
@Injectable()
export class TestingProvider implements PaymentProvider {
  readonly name = 'TESTING';
  readonly supportedMethods = [PaymentMethod.TESTING];
  
  private mockPayments = new Map<string, PaymentStatusResponse>();
  
  async initialize(config: PaymentProviderConfig): Promise<void> {
    // No initialization needed for testing provider
  }
  
  async createPayment(request: CreatePaymentRequest): Promise<PaymentResponse> {
    const transactionId = `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    
    this.mockPayments.set(transactionId, {
      transactionId,
      status: 'PENDING',
    });
    
    return {
      transactionId,
      expiresAt,
      paymentDetails: {
        message: 'This is a test payment. Click the complete button to simulate payment success.',
        instructions: [
          'Review the payment amount',
          'Click "Complete Test Payment" button',
          'Payment will be marked as PAID immediately'
        ]
      }
    };
  }
  
  async completeTestPayment(transactionId: string): Promise<void> {
    const payment = this.mockPayments.get(transactionId);
    if (payment) {
      payment.status = 'PAID';
      payment.paidAt = new Date();
    }
  }
  
  async checkPaymentStatus(transactionId: string): Promise<PaymentStatusResponse> {
    return this.mockPayments.get(transactionId) || {
      transactionId,
      status: 'EXPIRED'
    };
  }
  
  async validateWebhook(payload: any, signature: string): Promise<boolean> {
    return true; // Always valid for testing
  }
  
  async processWebhook(payload: any): Promise<WebhookResult> {
    return {
      transactionId: payload.transactionId,
      status: payload.status,
      paidAt: payload.paidAt ? new Date(payload.paidAt) : undefined
    };
  }
}
```

## Payment Service Logic

### Core Payment Service

```typescript
@Injectable()
export class PaymentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly providerRegistry: PaymentProviderRegistry,
    private readonly eventEmitter: EventEmitter2
  ) {}
  
  async initiatePayment(
    userId: string,
    amount: number,
    fiatAmount: number,
    method: PaymentMethod,
    options?: PaymentOptions
  ): Promise<TopUpRequest> {
    // Validate amount
    if (amount <= 0 || fiatAmount <= 0) {
      throw new BadRequestException('Amount must be greater than zero');
    }
    
    // Get appropriate provider
    const provider = this.providerRegistry.getProviderForMethod(method);
    
    // Create payment with gateway
    const paymentResponse = await provider.createPayment({
      userId,
      amount,
      fiatAmount,
      method,
      bank: options?.bank,
      walletType: options?.walletType
    });
    
    // Create database record
    const topUpRequest = await this.prisma.topUpRequest.create({
      data: {
        userId,
        amount,
        fiatAmount,
        method,
        provider: provider.name,
        bank: options?.bank,
        walletType: options?.walletType,
        status: TopUpStatus.PENDING,
        paymentDetails: paymentResponse.paymentDetails,
        expiresAt: paymentResponse.expiresAt
      }
    });
    
    // Start expiration monitoring
    this.scheduleExpirationCheck(topUpRequest.id, paymentResponse.expiresAt);
    
    return topUpRequest;
  }
  
  async handleWebhook(
    providerName: string,
    payload: any,
    signature: string
  ): Promise<void> {
    const provider = this.providerRegistry.getProviderByName(providerName);
    
    // Validate webhook signature
    const isValid = await provider.validateWebhook(payload, signature);
    if (!isValid) {
      this.logger.warn(`Invalid webhook signature from ${providerName}`);
      throw new UnauthorizedException('Invalid webhook signature');
    }
    
    // Process webhook
    const result = await provider.processWebhook(payload);
    
    // Update database
    const topUpRequest = await this.prisma.topUpRequest.findFirst({
      where: {
        paymentDetails: {
          path: ['transactionId'],
          equals: result.transactionId
        }
      }
    });
    
    if (!topUpRequest) {
      this.logger.warn(`TopUpRequest not found for transaction ${result.transactionId}`);
      return;
    }
    
    await this.prisma.topUpRequest.update({
      where: { id: topUpRequest.id },
      data: {
        status: this.mapWebhookStatusToTopUpStatus(result.status),
        paidAt: result.paidAt
      }
    });
    
    // Emit event for real-time updates
    this.eventEmitter.emit('payment.status.changed', {
      topUpRequestId: topUpRequest.id,
      userId: topUpRequest.userId,
      status: result.status
    });
  }
  
  async approveTopUpRequest(
    requestId: string,
    adminId: string,
    notes?: string
  ): Promise<TopUpRequest> {
    const request = await this.prisma.topUpRequest.findUnique({
      where: { id: requestId },
      include: { user: true }
    });
    
    if (!request) {
      throw new NotFoundException('Top-up request not found');
    }
    
    if (request.status !== TopUpStatus.PENDING && request.status !== TopUpStatus.PAID) {
      throw new BadRequestException('Only PENDING or PAID requests can be approved');
    }
    
    // Update request status and increment balance in a transaction
    const [updatedRequest] = await this.prisma.$transaction([
      this.prisma.topUpRequest.update({
        where: { id: requestId },
        data: {
          status: TopUpStatus.APPROVED,
          reviewedBy: adminId,
          reviewedAt: new Date(),
          adminNotes: notes
        }
      }),
      this.prisma.user.update({
        where: { id: request.userId },
        data: {
          balance: { increment: request.amount }
        }
      })
    ]);
    
    return updatedRequest;
  }
  
  async rejectTopUpRequest(
    requestId: string,
    adminId: string,
    notes: string
  ): Promise<TopUpRequest> {
    const request = await this.prisma.topUpRequest.findUnique({
      where: { id: requestId }
    });
    
    if (!request) {
      throw new NotFoundException('Top-up request not found');
    }
    
    return this.prisma.topUpRequest.update({
      where: { id: requestId },
      data: {
        status: TopUpStatus.REJECTED,
        reviewedBy: adminId,
        reviewedAt: new Date(),
        adminNotes: notes
      }
    });
  }
  
  async uploadProofImage(
    requestId: string,
    file: Express.Multer.File
  ): Promise<string> {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Only JPEG, PNG, and WebP images are allowed');
    }
    
    // Validate file size (5 MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('Image size must be less than 5 MB');
    }
    
    // Upload to storage (e.g., S3, Cloudinary)
    const imageUrl = await this.storageService.upload(file);
    
    // Update database
    await this.prisma.topUpRequest.update({
      where: { id: requestId },
      data: { proofImageUrl: imageUrl }
    });
    
    return imageUrl;
  }
  
  private scheduleExpirationCheck(requestId: string, expiresAt: Date): void {
    const delay = expiresAt.getTime() - Date.now();
    if (delay > 0) {
      setTimeout(async () => {
        const request = await this.prisma.topUpRequest.findUnique({
          where: { id: requestId }
        });
        
        if (request && request.status === TopUpStatus.PENDING) {
          await this.prisma.topUpRequest.update({
            where: { id: requestId },
            data: { status: TopUpStatus.EXPIRED }
          });
        }
      }, delay);
    }
  }
}
```

## Frontend Components

### Payment Method Selection Grid

```typescript
interface PaymentMethodOption {
  id: PaymentMethod;
  label: string;
  icon: React.ComponentType;
  description: string;
  priority: number;
}

export function PaymentMethodGrid() {
  const paymentMethods: PaymentMethodOption[] = [
    {
      id: PaymentMethod.TESTING,
      label: 'Testing/Demo Payment',
      icon: TestTubeIcon,
      description: 'For testing and demonstration',
      priority: 1
    },
    {
      id: PaymentMethod.QRIS,
      label: 'QRIS',
      icon: QrCodeIcon,
      description: 'Scan QR code with any bank app',
      priority: 2
    },
    // ... other methods
  ].sort((a, b) => a.priority - b.priority);
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {paymentMethods.map(method => (
        <PaymentMethodCard
          key={method.id}
          method={method}
          onClick={() => handleMethodSelect(method.id)}
        />
      ))}
    </div>
  );
}
```

### Countdown Timer Component

```typescript
export function CountdownTimer({ expiresAt }: { expiresAt: Date }) {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = Math.max(0, expiresAt.getTime() - Date.now());
      setTimeRemaining(remaining);
      
      if (remaining === 0) {
        clearInterval(interval);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [expiresAt]);
  
  const minutes = Math.floor(timeRemaining / 60000);
  const seconds = Math.floor((timeRemaining % 60000) / 1000);
  const isUrgent = timeRemaining < 5 * 60 * 1000; // Less than 5 minutes
  
  if (timeRemaining === 0) {
    return <div className="text-red-600">Payment expired</div>;
  }
  
  return (
    <div className={`text-2xl font-mono ${isUrgent ? 'text-red-600 font-bold' : 'text-gray-700'}`}>
      {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </div>
  );
}
```

### QRIS Payment Display

```typescript
export function QRISPaymentDisplay({ paymentDetails }: { paymentDetails: QRISDetails }) {
  return (
    <div className="flex flex-col items-center space-y-4">
      <h2 className="text-xl font-semibold">Scan QR Code to Pay</h2>
      
      <div className="bg-white p-4 rounded-lg shadow-md">
        <img
          src={`data:image/png;base64,${paymentDetails.qrCodeBase64}`}
          alt="QR Code"
          className="w-64 h-64"
        />
      </div>
      
      <div className="text-center space-y-2">
        <p className="text-sm text-gray-600">
          Open any bank app with QRIS support
        </p>
        <ol className="text-sm text-left space-y-1">
          <li>1. Open your bank or e-wallet app</li>
          <li>2. Select QRIS scan</li>
          <li>3. Scan the QR code above</li>
          <li>4. Confirm the payment amount</li>
          <li>5. Complete the payment</li>
        </ol>
      </div>
      
      <CountdownTimer expiresAt={new Date(paymentDetails.expiresAt)} />
    </div>
  );
}
```

### Virtual Account Payment Display

```typescript
export function VirtualAccountDisplay({ paymentDetails }: { paymentDetails: VirtualAccountDetails }) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };
  
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Virtual Account Payment</h2>
      
      <div className="bg-gray-50 p-4 rounded-lg space-y-3">
        <div>
          <label className="text-sm text-gray-600">Bank</label>
          <p className="text-lg font-semibold">{paymentDetails.bankName}</p>
        </div>
        
        <div>
          <label className="text-sm text-gray-600">Virtual Account Number</label>
          <div className="flex items-center gap-2">
            <p className="text-lg font-mono">{paymentDetails.accountNumber}</p>
            <button onClick={() => copyToClipboard(paymentDetails.accountNumber)}>
              Copy
            </button>
          </div>
        </div>
        
        <div>
          <label className="text-sm text-gray-600">Amount to Transfer</label>
          <p className="text-xl font-bold">Rp {paymentDetails.amount.toLocaleString('id-ID')}</p>
        </div>
      </div>
      
      <div className="text-sm space-y-1">
        <p className="font-semibold">Instructions:</p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Open your mobile banking or ATM</li>
          <li>Select Transfer to Virtual Account</li>
          <li>Enter the virtual account number above</li>
          <li>Enter the exact amount shown</li>
          <li>Complete the transfer</li>
        </ol>
      </div>
      
      <CountdownTimer expiresAt={new Date(paymentDetails.expiresAt)} />
    </div>
  );
}
```

### Payment Status Tracker

```typescript
export function PaymentStatusTracker({ request }: { request: TopUpRequest }) {
  const statusConfig = {
    PENDING: {
      icon: ClockIcon,
      color: 'text-yellow-600',
      message: 'Waiting for payment...',
      showTimer: true
    },
    PAID: {
      icon: CheckCircleIcon,
      color: 'text-blue-600',
      message: 'Payment received! Waiting for admin approval...',
      showTimer: false
    },
    APPROVED: {
      icon: CheckCircleIcon,
      color: 'text-green-600',
      message: 'Payment approved! Your balance has been updated.',
      showTimer: false
    },
    REJECTED: {
      icon: XCircleIcon,
      color: 'text-red-600',
      message: 'Payment rejected.',
      showTimer: false
    },
    EXPIRED: {
      icon: XCircleIcon,
      color: 'text-gray-600',
      message: 'Payment expired.',
      showTimer: false
    }
  };
  
  const config = statusConfig[request.status];
  const Icon = config.icon;
  
  return (
    <div className="space-y-4">
      <div className={`flex items-center gap-2 ${config.color}`}>
        <Icon className="w-6 h-6" />
        <span className="text-lg font-semibold">{config.message}</span>
      </div>
      
      {config.showTimer && request.expiresAt && (
        <CountdownTimer expiresAt={new Date(request.expiresAt)} />
      )}
      
      {request.status === TopUpStatus.REJECTED && request.adminNotes && (
        <div className="bg-red-50 p-3 rounded">
          <p className="text-sm text-red-800">
            <strong>Admin notes:</strong> {request.adminNotes}
          </p>
        </div>
      )}
      
      {request.status === TopUpStatus.EXPIRED && (
        <button
          onClick={() => handleRetry()}
          className="btn-primary"
        >
          Create New Payment
        </button>
      )}
    </div>
  );
}
```

## Error Handling

### Error Categories

**Validation Errors:**
- Invalid payment amount (≤ 0)
- Invalid file type for proof upload
- File size exceeds limit

**Provider Errors:**
- Gateway API failure
- Network timeout
- Invalid credentials

**State Errors:**
- Attempting to approve already-processed request
- Processing expired payment
- Duplicate webhook processing

### Error Response Format

```typescript
interface ErrorResponse {
  statusCode: number;
  message: string;
  error: string;
  timestamp: string;
  path: string;
  details?: Record<string, any>;
}
```

### Retry Strategy

- Gateway API calls: Exponential backoff with 3 retries
- Webhook processing: Idempotent with transaction ID deduplication
- Balance updates: Database transaction to ensure atomicity

## Security Considerations

### Webhook Security

1. **Signature Verification**: All webhooks must have valid signatures
2. **Idempotency**: Process each transaction ID only once
3. **Timestamp Validation**: Reject webhooks older than 5 minutes
4. **IP Whitelist**: Accept webhooks only from gateway IPs (configurable)

### Payment Security

1. **Amount Validation**: Server-side validation of all amounts
2. **User Authorization**: Users can only access their own payments
3. **Admin Authorization**: Only verified admins can approve/reject
4. **Audit Trail**: Log all status changes with admin ID and timestamp

### Data Protection

1. **Sensitive Data**: Never log complete payment details or credentials
2. **PII Protection**: Mask account numbers in logs
3. **HTTPS Only**: All API communication over HTTPS
4. **Environment Separation**: Separate credentials for sandbox and production


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Payment Method Display Completeness

*For any* payment method grid configuration, all enabled payment methods SHALL appear in the rendered output with both icon and label.

**Validates: Requirements 1.1, 1.3**

### Property 2: Payment Amount Validation

*For any* non-positive number (zero or negative), the payment system SHALL reject the amount and prevent payment creation.

**Validates: Requirements 2.1**

### Property 3: Payment Creation Initializes Pending Status

*For any* valid payment amount and method, creating a payment request SHALL result in a TopUpRequest record with status PENDING.

**Validates: Requirements 2.2**

### Property 4: Payment Details Persistence

*For any* payment details returned by a gateway, storing and retrieving the details from the database SHALL preserve the data without loss or corruption.

**Validates: Requirements 2.7**

### Property 5: Expiration Timestamp Calculation

*For any* gateway expiration duration, the calculated expiration timestamp SHALL equal the current time plus the duration with accuracy within 1 second.

**Validates: Requirements 2.8**

### Property 6: Method-Specific UI Content

*For any* payment method (QRIS, VA, E-Wallet), the rendered payment UI SHALL contain the method-specific required information (QR code for QRIS, account number for VA, wallet button for E-Wallet).

**Validates: Requirements 3.1, 3.2, 3.3, 3.6**

### Property 7: Payment Amount Display Accuracy

*For any* payment amount, the displayed amount in the UI SHALL exactly match the requested amount without rounding or formatting errors.

**Validates: Requirements 3.7**

### Property 8: Countdown Timer Format

*For any* time duration in seconds, the formatted countdown timer string SHALL match the MM:SS pattern with zero-padding.

**Validates: Requirements 4.5**

### Property 9: Countdown Timer Urgency Styling

*For any* remaining time under 5 minutes, the countdown timer SHALL apply emphasis styling; for time over 5 minutes, no emphasis SHALL be applied.

**Validates: Requirements 4.6**

### Property 10: Payment Expiration Status Transition

*For any* payment request with current time past its expiresAt timestamp and status PENDING, the system SHALL update the status to EXPIRED.

**Validates: Requirements 4.4**

### Property 11: Webhook Signature Verification

*For any* webhook payload with valid signature, signature verification SHALL return true; for any webhook with invalid signature, verification SHALL return false.

**Validates: Requirements 5.2**

### Property 12: Webhook Status Update

*For any* valid webhook with status PAID, processing the webhook SHALL update the corresponding TopUpRequest status to PAID.

**Validates: Requirements 5.3**

### Property 13: Invalid Webhook Rejection

*For any* webhook with invalid signature, the system SHALL reject the webhook and create a security warning log entry.

**Validates: Requirements 5.6**

### Property 14: Webhook Logging

*For any* webhook received, the system SHALL create a log entry containing timestamp and payload details.

**Validates: Requirements 5.5**

### Property 15: Admin Panel Status Filtering

*For any* collection of TopUpRequest records with mixed statuses, the admin panel query SHALL return only records with status PENDING or PAID.

**Validates: Requirements 6.1**

### Property 16: Admin View Completeness

*For any* TopUpRequest record displayed in admin panel, the rendered view SHALL contain user details, amount, payment method, and timestamp.

**Validates: Requirements 6.2**

### Property 17: Admin Approval Status Transition

*For any* TopUpRequest with status PENDING or PAID, approving the request SHALL update the status to APPROVED.

**Validates: Requirements 6.3**

### Property 18: Admin Rejection Status Transition

*For any* TopUpRequest with status PENDING or PAID, rejecting the request SHALL update the status to REJECTED.

**Validates: Requirements 6.4**

### Property 19: Balance Increment on Approval

*For any* TopUpRequest approval with amount X, the associated user's balance SHALL increase by exactly X.

**Validates: Requirements 6.5**

### Property 20: Reviewer Audit Trail

*For any* admin approval or rejection action, the TopUpRequest reviewedBy field SHALL contain the admin's user ID.

**Validates: Requirements 6.6**

### Property 21: Admin Notes Persistence

*For any* admin review action with provided notes, the notes SHALL be stored in the adminNotes field of the TopUpRequest.

**Validates: Requirements 6.7**

### Property 22: Payment Status Display

*For any* TopUpRequest with any valid status, the payment UI SHALL display the current status value.

**Validates: Requirements 7.1**

### Property 23: File Type Validation

*For any* uploaded file with MIME type not in [image/jpeg, image/png, image/webp], the system SHALL reject the file with a validation error.

**Validates: Requirements 10.2**

### Property 24: File Size Validation

*For any* uploaded file with size ≥ 5 MB, the system SHALL reject the file with a size validation error; for any file < 5 MB with valid type, the system SHALL accept the file.

**Validates: Requirements 10.3**

### Property 25: Proof Image URL Storage

*For any* successfully uploaded proof image, the TopUpRequest proofImageUrl field SHALL contain the uploaded image's URL.

**Validates: Requirements 10.4**

### Property 26: Validation Error Messaging

*For any* file upload validation failure (type or size), the system SHALL display an error message specifying the validation requirement.

**Validates: Requirements 10.6**

### Property 27: Payment Request Creation

*For any* payment initiation, the system SHALL create a corresponding TopUpRequest record in the database.

**Validates: Requirements 11.1**

### Property 28: Creation Timestamp Recording

*For any* created TopUpRequest, the createdAt timestamp SHALL be within 2 seconds of the current time at creation.

**Validates: Requirements 11.2**

### Property 29: Update Timestamp Increment

*For any* TopUpRequest status change, the updatedAt timestamp SHALL be greater than its previous value.

**Validates: Requirements 11.3**

### Property 30: Required Fields Population

*For any* created TopUpRequest, the record SHALL contain non-null values for userId, amount, fiatAmount, method, provider, and status fields.

**Validates: Requirements 11.4**

### Property 31: Payment History Sorting

*For any* set of TopUpRequest records belonging to a user, the payment history query SHALL return results ordered by createdAt in descending order.

**Validates: Requirements 12.1**

### Property 32: Payment History Record Completeness

*For any* TopUpRequest in payment history, the rendered UI SHALL display amount, method, status, and timestamp.

**Validates: Requirements 12.2**

### Property 33: Pagination Limit

*For any* payment history query result with more than 20 records, a single page SHALL display exactly 20 records.

**Validates: Requirements 12.3**

## Testing Strategy

### Unit Tests

Unit tests will cover specific examples, edge cases, and individual function behavior:

- Payment amount validation with zero, negative, and positive values
- Countdown timer formatting edge cases (0 seconds, 59 seconds, hours)
- Status-specific UI rendering for each status enum value
- File type and size validation boundary conditions
- Timestamp calculation accuracy
- Error message content verification

### Property-Based Tests

Property-based tests will verify universal properties across randomized inputs with minimum 100 iterations per property:

- **Property 1-33**: Each correctness property will have a dedicated property test
- Input generators will produce:
  - Random payment amounts (positive and negative)
  - Random time durations for countdown timer
  - Random file sizes and types
  - Random payment statuses
  - Random user balances for increment testing
  - Random webhook payloads with valid and invalid signatures
  
### Integration Tests

Integration tests will verify external service interactions and end-to-end flows:

- Payment gateway API calls in sandbox mode (1-2 scenarios per method)
- Webhook reception and processing (1-2 scenarios)
- Real-time status updates via WebSocket (1-2 scenarios)
- Admin approval workflow with balance updates (1-2 scenarios)

### Test Configuration

All property-based tests must:
- Run minimum 100 iterations
- Tag format: `Feature: multiple-payment-methods, Property N: [property text]`
- Reference design document property number
- Use appropriate generators for the property domain


## API Endpoints

### Payment Endpoints

**POST /api/payment/initiate**
```typescript
Request: {
  amount: number;          // CC amount
  fiatAmount: number;      // IDR amount
  method: PaymentMethod;
  bank?: string;           // For VA
  walletType?: string;     // For E-Wallet
}

Response: {
  topUpRequestId: string;
  status: TopUpStatus;
  paymentDetails: object;
  expiresAt: string;
}
```

**GET /api/payment/request/:id**
```typescript
Response: TopUpRequest
```

**GET /api/payment/history**
```typescript
Query: {
  page?: number;
  limit?: number;  // Default 20, max 50
}

Response: {
  data: TopUpRequest[];
  total: number;
  page: number;
  totalPages: number;
}
```

**POST /api/payment/upload-proof/:id**
```typescript
Request: multipart/form-data
  - file: image file

Response: {
  imageUrl: string;
}
```

**POST /api/payment/webhook/:provider**
```typescript
Headers: {
  'x-webhook-signature': string;
}

Request: any (provider-specific)

Response: 200 OK
```

### Admin Endpoints

**GET /api/admin/topup-requests**
```typescript
Query: {
  status?: 'PENDING' | 'PAID';
  page?: number;
  limit?: number;
}

Response: {
  data: TopUpRequest[];
  total: number;
}
```

**POST /api/admin/topup-requests/:id/approve**
```typescript
Request: {
  notes?: string;
}

Response: TopUpRequest
```

**POST /api/admin/topup-requests/:id/reject**
```typescript
Request: {
  notes: string;  // Required for rejection
}

Response: TopUpRequest
```

## Environment Configuration

```env
# Payment Gateway - Midtrans
MIDTRANS_SERVER_KEY=your_server_key
MIDTRANS_CLIENT_KEY=your_client_key
MIDTRANS_ENVIRONMENT=sandbox  # or production

# Payment Gateway - Xendit (Optional)
XENDIT_API_KEY=your_api_key
XENDIT_WEBHOOK_TOKEN=your_webhook_token
XENDIT_ENVIRONMENT=test  # or production

# Payment Gateway - Stripe (Existing)
STRIPE_SECRET_KEY=your_secret_key
STRIPE_PUBLISHABLE_KEY=your_publishable_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# Feature Flags
ENABLE_QRIS=true
ENABLE_VIRTUAL_ACCOUNT=true
ENABLE_EWALLET=true
ENABLE_TESTING_PAYMENT=true

# Payment Configuration
DEFAULT_PAYMENT_EXPIRY_MINUTES=15
MAX_PROOF_IMAGE_SIZE_MB=5
```

## Implementation Phases

### Phase 1: Foundation (Backend Core)
- Extend database schema with new fields
- Implement PaymentProvider interface
- Create PaymentProviderRegistry
- Implement TestingProvider

### Phase 2: Gateway Integration
- Implement MidtransProvider for QRIS
- Implement MidtransProvider for Virtual Account
- Implement MidtransProvider for E-Wallet
- Configure sandbox credentials

### Phase 3: Backend Services
- Implement payment initiation logic
- Implement webhook handling
- Implement expiration monitoring
- Implement proof image upload

### Phase 4: Admin Workflow
- Implement admin approval/rejection endpoints
- Add admin authorization guards
- Implement balance update transaction logic

### Phase 5: Frontend UI
- Create payment method selection grid
- Implement QRIS payment display
- Implement VA payment display
- Implement E-Wallet payment display
- Implement countdown timer component

### Phase 6: Real-time Updates
- Implement WebSocket for status updates
- Add event emitters for status changes
- Update frontend to listen for real-time events

### Phase 7: Payment History
- Implement pagination for payment history
- Create payment history UI component
- Add filtering and sorting capabilities

### Phase 8: Testing & QA
- Write unit tests for core logic
- Write property-based tests for all properties
- Write integration tests for gateway interactions
- Perform end-to-end testing in sandbox

## Performance Considerations

### Database Optimization
- Add indexes on `TopUpRequest.status`, `TopUpRequest.expiresAt`, `TopUpRequest.method`
- Use database transactions for atomic balance updates
- Implement connection pooling for high throughput

### Caching Strategy
- Cache payment method configurations (1 hour TTL)
- Cache user balance for display (invalidate on approval)
- No caching for TopUpRequest status (always fetch fresh)

### Real-time Updates
- Use WebSocket connections for active payment tracking
- Implement heartbeat to detect disconnections
- Fall back to polling if WebSocket fails

## Monitoring and Logging

### Metrics to Track
- Payment initiation success rate by method
- Payment completion rate by method
- Average time to payment completion
- Webhook processing latency
- Admin approval latency

### Logs to Maintain
- All payment initiations with user ID and amount
- All webhook receptions with validation result
- All admin actions with admin ID and timestamp
- All gateway API errors with error codes
- All security warnings for invalid webhooks

## Migration Plan

### Database Migration

```sql
-- Add new fields to topup_requests table
ALTER TABLE topup_requests
  ADD COLUMN bank VARCHAR(50),
  ADD COLUMN wallet_type VARCHAR(50),
  ADD COLUMN payment_details JSONB,
  ADD COLUMN expires_at TIMESTAMP,
  ADD COLUMN paid_at TIMESTAMP,
  ADD COLUMN reviewed_at TIMESTAMP;

-- Add new indexes
CREATE INDEX idx_topup_requests_method ON topup_requests(method);
CREATE INDEX idx_topup_requests_expires_at ON topup_requests(expires_at);

-- Add new status values to enum (if not exists)
ALTER TYPE TopUpStatus ADD VALUE IF NOT EXISTS 'PAID';
ALTER TYPE TopUpStatus ADD VALUE IF NOT EXISTS 'EXPIRED';
ALTER TYPE TopUpStatus ADD VALUE IF NOT EXISTS 'CANCELLED';
```

### Backward Compatibility
- Existing Stripe integration continues to work
- Old TopUpRequest records remain valid
- New fields are nullable for existing records
- Admin panel shows both old and new payment types

## Documentation

- API documentation via Swagger/OpenAPI
- Payment provider integration guide
- Admin user guide for payment approval
- Frontend component storybook
- Troubleshooting guide for common issues
