import { PaymentMethod } from './payment-method.enum';
import {
  CreatePaymentRequest,
  PaymentResponse,
  PaymentStatusResponse,
  WebhookResult,
  PaymentProviderConfig
} from './payment-types';

/**
 * Abstract interface for payment gateway providers
 * This interface defines the contract that all payment providers must implement
 * Validates Requirements 9.1, 9.2
 * 
 * Providers implementing this interface:
 * - MidtransProvider: QRIS, Virtual Account, E-Wallet
 * - XenditProvider: QRIS, Virtual Account, E-Wallet
 * - StripeProvider: Credit Card payments
 * - TestingProvider: Mock payments for development
 */
export interface PaymentProvider {
  /**
   * The unique name of the provider (e.g., 'MIDTRANS', 'XENDIT', 'STRIPE', 'TESTING')
   */
  readonly name: string;

  /**
   * Payment methods supported by this provider
   */
  readonly supportedMethods: PaymentMethod[];

  /**
   * Initialize the payment provider with configuration
   * Called once during application startup
   * 
   * @param config - Provider configuration including API keys and environment
   * @throws Error if initialization fails
   */
  initialize(config: PaymentProviderConfig): Promise<void>;

  /**
   * Create a new payment transaction
   * 
   * @param request - Payment creation request containing user, amount, and method details
   * @returns Payment response with transaction ID, expiration, and payment-specific details
   * @throws BadRequestException if the request is invalid
   * @throws Error if the gateway API fails
   */
  createPayment(request: CreatePaymentRequest): Promise<PaymentResponse>;

  /**
   * Check the current status of a payment transaction
   * 
   * @param transactionId - The transaction ID returned from createPayment
   * @returns Current payment status and paid timestamp if applicable
   * @throws NotFoundException if transaction not found
   * @throws Error if the gateway API fails
   */
  checkPaymentStatus(transactionId: string): Promise<PaymentStatusResponse>;

  /**
   * Validate a webhook signature from the payment gateway
   * This ensures the webhook actually came from the payment provider
   * 
   * @param payload - The webhook payload received
   * @param signature - The signature header from the webhook request
   * @returns true if signature is valid, false otherwise
   */
  validateWebhook(payload: any, signature: string): Promise<boolean>;

  /**
   * Process a webhook notification from the payment gateway
   * Called after webhook signature validation succeeds
   * 
   * @param payload - The validated webhook payload
   * @returns Webhook result containing transaction ID and updated status
   * @throws Error if webhook processing fails
   */
  processWebhook(payload: any): Promise<WebhookResult>;
}
