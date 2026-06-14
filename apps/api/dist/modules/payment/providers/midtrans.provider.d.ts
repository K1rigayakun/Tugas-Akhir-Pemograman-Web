import { PaymentProvider } from '../interfaces/payment-provider.interface';
import { PaymentMethod } from '../interfaces/payment-method.enum';
import { CreatePaymentRequest, PaymentResponse, PaymentStatusResponse, WebhookResult, PaymentProviderConfig } from '../interfaces/payment-types';
/**
 * MidtransProvider
 *
 * Payment provider implementation for Midtrans gateway.
 * Supports Indonesian payment methods: QRIS, Virtual Account, and E-Wallet.
 *
 * Features:
 * - QRIS payment generation with QR code image
 * - Virtual Account for multiple banks (BCA, BNI, MANDIRI, BRI, PERMATA)
 * - E-Wallet integration (GOPAY, OVO, DANA, SHOPEEPAY, LINKAJA)
 * - Webhook signature validation
 * - Sandbox and production mode support
 *
 * Validates Requirements 2.3, 2.4, 2.5, 2.6, 8.3
 */
export declare class MidtransProvider implements PaymentProvider {
    private readonly logger;
    readonly name = "MIDTRANS";
    readonly supportedMethods: PaymentMethod[];
    private snapClient;
    private coreApiClient;
    private serverKey;
    private clientKey;
    private isSandbox;
    /**
     * Initialize the Midtrans provider with API credentials
     *
     * Creates Snap and CoreApi client instances configured for either
     * sandbox or production environment.
     *
     * @param config - Provider configuration including API keys and environment
     * @throws Error if initialization fails or credentials are invalid
     *
     * Validates Requirements 8.3
     */
    initialize(config: PaymentProviderConfig): Promise<void>;
    /**
     * Create a payment transaction
     *
     * Generates payment details for the specified method (QRIS, VA, or E-Wallet).
     * Constructs method-specific parameters and calls the appropriate Midtrans API.
     *
     * @param request - Payment creation request containing user, amount, and method details
     * @returns Payment response with transaction ID, expiration, and payment-specific details
     * @throws BadRequestException if the request is invalid
     * @throws Error if the Midtrans API fails
     *
     * Validates Requirements 2.3, 2.4, 2.5, 2.6
     */
    createPayment(request: CreatePaymentRequest): Promise<PaymentResponse>;
    /**
     * Parse QRIS transaction response
     *
     * Extracts QR code data and transaction details from Midtrans QRIS response.
     *
     * @param transaction - Midtrans transaction response
     * @param orderId - Order ID for this transaction
     * @returns Payment response with QRIS details
     */
    private parseQRISResponse;
    /**
     * Parse Virtual Account transaction response
     *
     * Extracts virtual account number and bank details from Midtrans response.
     *
     * @param transaction - Midtrans transaction response
     * @param orderId - Order ID for this transaction
     * @param bankName - Bank name from request
     * @returns Payment response with Virtual Account details
     */
    private parseVirtualAccountResponse;
    /**
     * Parse E-Wallet transaction response
     *
     * Extracts redirect URL and deep link from Midtrans E-Wallet response.
     *
     * @param transaction - Midtrans transaction response
     * @param orderId - Order ID for this transaction
     * @param walletType - Wallet type from request
     * @returns Payment response with E-Wallet details
     */
    private parseEWalletResponse;
    /**
     * Check the current status of a payment transaction
     *
     * @param transactionId - The transaction ID returned from createPayment
     * @returns Current payment status and paid timestamp if applicable
     * @throws Error if the Midtrans API fails
     */
    checkPaymentStatus(transactionId: string): Promise<PaymentStatusResponse>;
    /**
     * Validate a webhook signature from Midtrans
     *
     * Verifies that the webhook actually came from Midtrans by checking
     * the SHA512 signature against the expected hash.
     *
     * @param payload - The webhook payload received
     * @param signature - The signature header from the webhook request
     * @returns true if signature is valid, false otherwise
     */
    validateWebhook(payload: any, signature: string): Promise<boolean>;
    /**
     * Process a webhook notification from Midtrans
     *
     * Called after webhook signature validation succeeds.
     * Extracts transaction status and timestamp from the webhook payload.
     *
     * @param payload - The validated webhook payload
     * @returns Webhook result containing transaction ID and updated status
     */
    processWebhook(payload: any): Promise<WebhookResult>;
    /**
     * Map Midtrans transaction status to internal status
     *
     * @param midtransStatus - Status from Midtrans API
     * @returns Internal payment status
     */
    private mapMidtransStatus;
    /**
     * Map bank name to Midtrans bank code
     *
     * @param bankName - Bank name from request (BCA, BNI, etc.)
     * @returns Midtrans bank code
     */
    private mapBankCode;
    /**
     * Map wallet type to Midtrans payment type key
     *
     * @param walletType - Wallet type from request (GOPAY, OVO, etc.)
     * @returns Midtrans payment type key
     */
    private mapWalletType;
}
//# sourceMappingURL=midtrans.provider.d.ts.map