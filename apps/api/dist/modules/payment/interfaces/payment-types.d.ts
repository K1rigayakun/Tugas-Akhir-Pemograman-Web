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
    bank?: string;
    walletType?: string;
    metadata?: Record<string, any>;
}
/**
 * QRIS payment details
 */
export interface QRISDetails {
    qrCodeBase64: string;
    qrString: string;
    transactionId: string;
}
/**
 * Virtual Account payment details
 */
export interface VirtualAccountDetails {
    accountNumber: string;
    bankName: string;
    bankCode: string;
    transactionId: string;
}
/**
 * E-Wallet payment details
 */
export interface EWalletDetails {
    redirectUrl: string;
    deepLink: string;
    walletType: string;
    transactionId: string;
}
/**
 * Stripe payment details
 */
export interface StripeDetails {
    sessionId: string;
    sessionUrl: string;
    redirectUrl?: string;
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
    [key: string]: any;
}
//# sourceMappingURL=payment-types.d.ts.map