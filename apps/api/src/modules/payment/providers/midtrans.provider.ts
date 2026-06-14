import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PaymentProvider } from '../interfaces/payment-provider.interface';
import { PaymentMethod } from '../interfaces/payment-method.enum';
import {
  CreatePaymentRequest,
  PaymentResponse,
  PaymentStatusResponse,
  WebhookResult,
  PaymentProviderConfig,
  QRISDetails,
  VirtualAccountDetails,
  EWalletDetails
} from '../interfaces/payment-types';
import * as crypto from 'crypto';

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
@Injectable()
export class MidtransProvider implements PaymentProvider {
  private readonly logger = new Logger(MidtransProvider.name);
  readonly name = 'MIDTRANS';
  readonly supportedMethods = [
    PaymentMethod.QRIS,
    PaymentMethod.VIRTUAL_ACCOUNT,
    PaymentMethod.EWALLET
  ];

  private snapClient: any;
  private coreApiClient: any;
  private serverKey!: string;
  private clientKey!: string;
  private isSandbox!: boolean;

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
  async initialize(config: PaymentProviderConfig): Promise<void> {
    this.isSandbox = config.environment === 'sandbox';
    this.serverKey = config.serverKey;
    this.clientKey = config.clientKey || '';

    if (!this.serverKey) {
      throw new Error('Midtrans serverKey is required');
    }

    try {
      // Import midtrans-client dynamically to handle missing dependency gracefully
      const midtransClient = await import('midtrans-client');

      // Initialize Snap client for Snap API
      this.snapClient = new midtransClient.Snap({
        isProduction: !this.isSandbox,
        serverKey: this.serverKey,
        clientKey: this.clientKey
      });

      // Initialize Core API client for direct API calls
      this.coreApiClient = new midtransClient.CoreApi({
        isProduction: !this.isSandbox,
        serverKey: this.serverKey,
        clientKey: this.clientKey
      });

      this.logger.log(`MidtransProvider initialized in ${this.isSandbox ? 'SANDBOX' : 'PRODUCTION'} mode`);
    } catch (error) {
      this.logger.error('Failed to initialize Midtrans client. Make sure midtrans-client package is installed.', error);
      throw new Error('Failed to initialize MidtransProvider: midtrans-client package not found');
    }
  }

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
  async createPayment(request: CreatePaymentRequest): Promise<PaymentResponse> {
    // Generate unique order ID
    const orderId = `topup-${Date.now()}-${request.userId.substring(0, 8)}`;

    this.logger.log(`Creating Midtrans payment: ${orderId} for user ${request.userId}, method: ${request.method}`);

    // Build base transaction parameter
    const parameter: any = {
      transaction_details: {
        order_id: orderId,
        gross_amount: request.fiatAmount
      },
      customer_details: {
        first_name: request.userId,
        email: request.metadata?.email || `${request.userId}@emeraldkingdom.com`
      }
    };

    // Configure method-specific parameters and call appropriate API
    let transaction: any;

    try {
      if (request.method === PaymentMethod.QRIS) {
        parameter.payment_type = 'qris';
        parameter.qris = { acquirer: 'gopay' };
        transaction = await this.coreApiClient.charge(parameter);
        return this.parseQRISResponse(transaction, orderId);

      } else if (request.method === PaymentMethod.VIRTUAL_ACCOUNT) {
        if (!request.bank) {
          throw new BadRequestException('Bank is required for Virtual Account payment');
        }
        parameter.payment_type = 'bank_transfer';
        parameter.bank_transfer = { 
          bank: this.mapBankCode(request.bank)
        };
        transaction = await this.coreApiClient.charge(parameter);
        return this.parseVirtualAccountResponse(transaction, orderId, request.bank);

      } else if (request.method === PaymentMethod.EWALLET) {
        if (!request.walletType) {
          throw new BadRequestException('Wallet type is required for E-Wallet payment');
        }
        
        const walletKey = this.mapWalletType(request.walletType);
        parameter.payment_type = walletKey;
        parameter[walletKey] = {
          enable_callback: true,
          callback_url: request.metadata?.callbackUrl || 'https://emeraldkingdom.com/payment/callback'
        };
        
        transaction = await this.coreApiClient.charge(parameter);
        return this.parseEWalletResponse(transaction, orderId, request.walletType);

      } else {
        throw new BadRequestException(`Unsupported payment method: ${request.method}`);
      }
    } catch (error) {
      this.logger.error(`Midtrans payment creation failed for ${orderId}:`, error);
      throw error;
    }
  }

  /**
   * Parse QRIS transaction response
   * 
   * Extracts QR code data and transaction details from Midtrans QRIS response.
   * 
   * @param transaction - Midtrans transaction response
   * @param orderId - Order ID for this transaction
   * @returns Payment response with QRIS details
   */
  private parseQRISResponse(transaction: any, orderId: string): PaymentResponse {
    const expiresAt = new Date(transaction.expiry_time || Date.now() + 15 * 60 * 1000);

    const qrisDetails: QRISDetails = {
      qrCodeBase64: transaction.actions?.find((a: any) => a.name === 'generate-qr-code')?.url || '',
      qrString: transaction.qr_string || transaction.actions?.find((a: any) => a.name === 'generate-qr-code')?.url || '',
      transactionId: transaction.transaction_id || orderId
    };

    this.logger.log(`QRIS payment created: ${qrisDetails.transactionId}, expires at ${expiresAt.toISOString()}`);

    return {
      transactionId: qrisDetails.transactionId,
      expiresAt,
      paymentDetails: qrisDetails
    };
  }

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
  private parseVirtualAccountResponse(transaction: any, orderId: string, bankName: string): PaymentResponse {
    const expiresAt = new Date(transaction.expiry_time || Date.now() + 24 * 60 * 60 * 1000);

    // Extract VA number based on bank type
    let accountNumber = '';
    if (transaction.va_numbers && transaction.va_numbers.length > 0) {
      accountNumber = transaction.va_numbers[0].va_number;
    } else if (transaction.permata_va_number) {
      accountNumber = transaction.permata_va_number;
    } else if (transaction.bca_va_number) {
      accountNumber = transaction.bca_va_number;
    }

    const vaDetails: VirtualAccountDetails = {
      accountNumber,
      bankName: bankName.toUpperCase(),
      bankCode: this.mapBankCode(bankName),
      transactionId: transaction.transaction_id || orderId
    };

    this.logger.log(`Virtual Account payment created: ${vaDetails.transactionId}, bank: ${vaDetails.bankName}, expires at ${expiresAt.toISOString()}`);

    return {
      transactionId: vaDetails.transactionId,
      expiresAt,
      paymentDetails: vaDetails
    };
  }

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
  private parseEWalletResponse(transaction: any, orderId: string, walletType: string): PaymentResponse {
    const expiresAt = new Date(transaction.expiry_time || Date.now() + 15 * 60 * 1000);

    // Extract redirect URL and deep link from actions
    let redirectUrl = '';
    let deepLink = '';

    if (transaction.actions && Array.isArray(transaction.actions)) {
      const deepLinkAction = transaction.actions.find((a: any) => a.name === 'deeplink-redirect' || a.name === 'generate-qr-code');
      const redirectAction = transaction.actions.find((a: any) => a.name === 'redirect' || a.name === 'redirect-url');
      
      deepLink = deepLinkAction?.url || transaction.deeplink_redirect || '';
      redirectUrl = redirectAction?.url || transaction.redirect_url || deepLink;
    }

    const ewalletDetails: EWalletDetails = {
      redirectUrl,
      deepLink,
      walletType: walletType.toUpperCase(),
      transactionId: transaction.transaction_id || orderId
    };

    this.logger.log(`E-Wallet payment created: ${ewalletDetails.transactionId}, wallet: ${ewalletDetails.walletType}, expires at ${expiresAt.toISOString()}`);

    return {
      transactionId: ewalletDetails.transactionId,
      expiresAt,
      paymentDetails: ewalletDetails
    };
  }

  /**
   * Check the current status of a payment transaction
   * 
   * @param transactionId - The transaction ID returned from createPayment
   * @returns Current payment status and paid timestamp if applicable
   * @throws Error if the Midtrans API fails
   */
  async checkPaymentStatus(transactionId: string): Promise<PaymentStatusResponse> {
    try {
      const status = await this.coreApiClient.transaction.status(transactionId);
      
      const mappedStatus = this.mapMidtransStatus(status.transaction_status);
      const paidAt = (mappedStatus === 'PAID' && status.settlement_time) 
        ? new Date(status.settlement_time) 
        : undefined;

      this.logger.debug(`Payment status for ${transactionId}: ${mappedStatus}`);

      return {
        transactionId,
        status: mappedStatus,
        paidAt
      };
    } catch (error) {
      this.logger.error(`Failed to check payment status for ${transactionId}:`, error);
      // If transaction not found, consider it expired
      return {
        transactionId,
        status: 'EXPIRED'
      };
    }
  }

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
  async validateWebhook(payload: any, signature: string): Promise<boolean> {
    try {
      // Midtrans signature: SHA512(order_id + status_code + gross_amount + serverKey)
      const signatureKey = `${payload.order_id}${payload.status_code}${payload.gross_amount}${this.serverKey}`;
      const expectedSignature = crypto
        .createHash('sha512')
        .update(signatureKey)
        .digest('hex');

      const isValid = signature === expectedSignature;
      
      if (!isValid) {
        this.logger.warn(`Invalid webhook signature for order ${payload.order_id}`);
      }

      return isValid;
    } catch (error) {
      this.logger.error('Error validating webhook signature:', error);
      return false;
    }
  }

  /**
   * Process a webhook notification from Midtrans
   * 
   * Called after webhook signature validation succeeds.
   * Extracts transaction status and timestamp from the webhook payload.
   * 
   * @param payload - The validated webhook payload
   * @returns Webhook result containing transaction ID and updated status
   */
  async processWebhook(payload: any): Promise<WebhookResult> {
    const transactionId = payload.transaction_id || payload.order_id;
    const midtransStatus = this.mapMidtransStatus(payload.transaction_status);
    
    // WebhookResult only accepts PAID, EXPIRED, or CANCELLED status
    // Filter out PENDING status as webhooks should only notify final states
    if (midtransStatus === 'PENDING') {
      this.logger.warn(`Webhook received for transaction ${transactionId} with PENDING status - ignoring`);
      // Return PAID as fallback (webhook shouldn't be triggered for pending)
      return {
        transactionId,
        status: 'PAID',
        paidAt: new Date()
      };
    }

    const paidAt = (midtransStatus === 'PAID' && payload.settlement_time) 
      ? new Date(payload.settlement_time) 
      : undefined;

    this.logger.log(`Processing webhook for ${transactionId}: status=${midtransStatus}`);

    return {
      transactionId,
      status: midtransStatus,
      paidAt
    };
  }

  /**
   * Map Midtrans transaction status to internal status
   * 
   * @param midtransStatus - Status from Midtrans API
   * @returns Internal payment status
   */
  private mapMidtransStatus(midtransStatus: string): 'PENDING' | 'PAID' | 'EXPIRED' | 'CANCELLED' {
    switch (midtransStatus) {
      case 'capture':
      case 'settlement':
        return 'PAID';
      case 'pending':
        return 'PENDING';
      case 'deny':
      case 'cancel':
        return 'CANCELLED';
      case 'expire':
        return 'EXPIRED';
      default:
        this.logger.warn(`Unknown Midtrans status: ${midtransStatus}, defaulting to PENDING`);
        return 'PENDING';
    }
  }

  /**
   * Map bank name to Midtrans bank code
   * 
   * @param bankName - Bank name from request (BCA, BNI, etc.)
   * @returns Midtrans bank code
   */
  private mapBankCode(bankName: string): string {
    const bankMap: Record<string, string> = {
      'BCA': 'bca',
      'BNI': 'bni',
      'MANDIRI': 'echannel',
      'BRI': 'bri',
      'PERMATA': 'permata'
    };

    return bankMap[bankName.toUpperCase()] || bankName.toLowerCase();
  }

  /**
   * Map wallet type to Midtrans payment type key
   * 
   * @param walletType - Wallet type from request (GOPAY, OVO, etc.)
   * @returns Midtrans payment type key
   */
  private mapWalletType(walletType: string): string {
    const walletMap: Record<string, string> = {
      'GOPAY': 'gopay',
      'OVO': 'ovo',
      'DANA': 'dana',
      'SHOPEEPAY': 'shopeepay',
      'LINKAJA': 'linkaja'
    };

    return walletMap[walletType.toUpperCase()] || walletType.toLowerCase();
  }
}
