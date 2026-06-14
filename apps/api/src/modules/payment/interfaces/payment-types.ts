import { PaymentMethod } from './payment-method.enum';

/**
 * Request to create a payment
 * Validates Requirements 9.1, 9.2
 */
export interface CreatePaymentRequest {
  userId: string;
  amount: number;
  fiatAmount: number;
  method: PaymentMethod;
  bank?: string;        // For Virtual Account (e.g., BCA, BNI, MANDIRI, BRI, PERMATA)
  walletType?: string;  // For E-Wallet (e.g., GOPAY, OVO, DANA, SHOPEEPAY, LINKAJA)
  metadata?: Record<string, any>;
}

/**
 * QRIS payment details
 */
export interface QRISDetails {
  qrCodeBase64: string;  // Base64 encoded QR image
  qrString: string;      // QR code text content
  transactionId: string; // Gateway transaction ID
}

/**
 * Virtual Account payment details
 */
export interface VirtualAccountDetails {
  accountNumber: string;  // Virtual account number
  bankName: string;       // BCA, BNI, etc.
  bankCode: string;       // Bank identifier
  transactionId: string;  // Gateway transaction ID
}

/**
 * E-Wallet payment details
 */
export interface EWalletDetails {
  redirectUrl: string;    // Web redirect URL
  deepLink: string;       // Mobile app deep link
  walletType: string;     // GOPAY, OVO, etc.
  transactionId: string;  // Gateway transaction ID
}

/**
 * Stripe payment details
 */
export interface StripeDetails {
  sessionId: string;      // Stripe checkout session ID
  sessionUrl: string;     // Stripe checkout URL
  redirectUrl?: string;   // UI-compatible redirect URL
}

/**
 * Manual bank transfer payment details
 */
export interface BankTransferDetails {
  accountNumber: string;
  accountName: string;
  bankName: string;
  instructions: string;
  transactionId: string;
}

/**
 * Testing payment details
 */
export interface TestingDetails {
  message: string;
  instructions: string[];
  transactionId: string;
}

/**
 * Union type for all payment details
 */
export type PaymentDetails = QRISDetails | VirtualAccountDetails | EWalletDetails | StripeDetails | BankTransferDetails | TestingDetails;

/**
 * Response from creating a payment
 * Validates Requirements 9.1, 9.2
 */
export interface PaymentResponse {
  transactionId: string;
  expiresAt: Date;
  paymentDetails: PaymentDetails;
}

/**
 * Response from checking payment status
 * Validates Requirements 9.1, 9.2
 */
export interface PaymentStatusResponse {
  transactionId: string;
  status: 'PENDING' | 'PAID' | 'EXPIRED' | 'CANCELLED';
  paidAt?: Date;
}

/**
 * Result from processing a webhook
 * Validates Requirements 9.1, 9.2
 */
export interface WebhookResult {
  transactionId: string;
  status: 'PAID' | 'EXPIRED' | 'CANCELLED';
  paidAt?: Date;
}

/**
 * Configuration for payment provider initialization
 */
export interface PaymentProviderConfig {
  environment: 'sandbox' | 'production';
  serverKey: string;
  clientKey?: string;
  webhookSecret?: string;
  [key: string]: any; // Allow additional provider-specific config
}
