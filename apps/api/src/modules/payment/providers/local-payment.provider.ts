import { Injectable, Logger } from '@nestjs/common';
import * as qrcode from 'qrcode';
import { PaymentProvider } from '../interfaces/payment-provider.interface';
import { PaymentMethod } from '../interfaces/payment-method.enum';
import {
  BankTransferDetails,
  CreatePaymentRequest,
  EWalletDetails,
  PaymentProviderConfig,
  PaymentResponse,
  PaymentStatusResponse,
  QRISDetails,
  StripeDetails,
  VirtualAccountDetails,
  WebhookResult,
} from '../interfaces/payment-types';

@Injectable()
export class LocalPaymentProvider implements PaymentProvider {
  private readonly logger = new Logger(LocalPaymentProvider.name);
  readonly name = 'LOCAL';
  readonly supportedMethods = [
    PaymentMethod.QRIS,
    PaymentMethod.VIRTUAL_ACCOUNT,
    PaymentMethod.EWALLET,
    PaymentMethod.STRIPE,
    PaymentMethod.BANK_TRANSFER,
  ];

  private readonly payments = new Map<string, PaymentStatusResponse>();

  async initialize(_config: PaymentProviderConfig): Promise<void> {
    this.logger.log('LocalPaymentProvider initialized as demo/fallback provider');
  }

  async createPayment(request: CreatePaymentRequest): Promise<PaymentResponse> {
    const transactionId = `local-${request.method.toLowerCase()}-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`;
    const expiresAt = this.getExpiry(request.method);

    this.payments.set(transactionId, { transactionId, status: 'PENDING' });

    switch (request.method) {
      case PaymentMethod.QRIS:
        return {
          transactionId,
          expiresAt,
          paymentDetails: await this.createQrisDetails(transactionId, request),
        };
      case PaymentMethod.VIRTUAL_ACCOUNT:
        return {
          transactionId,
          expiresAt,
          paymentDetails: this.createVirtualAccountDetails(transactionId, request),
        };
      case PaymentMethod.EWALLET:
        return {
          transactionId,
          expiresAt,
          paymentDetails: this.createEWalletDetails(transactionId, request),
        };
      case PaymentMethod.STRIPE:
        return {
          transactionId,
          expiresAt,
          paymentDetails: this.createStripeDetails(transactionId),
        };
      case PaymentMethod.BANK_TRANSFER:
        return {
          transactionId,
          expiresAt,
          paymentDetails: this.createBankTransferDetails(transactionId),
        };
      default:
        throw new Error(`Unsupported local payment method: ${request.method}`);
    }
  }

  async checkPaymentStatus(transactionId: string): Promise<PaymentStatusResponse> {
    return this.payments.get(transactionId) ?? { transactionId, status: 'EXPIRED' };
  }

  async validateWebhook(_payload: any, _signature: string): Promise<boolean> {
    return true;
  }

  async processWebhook(payload: any): Promise<WebhookResult> {
    const transactionId = payload.transactionId || payload.transaction_id || payload.order_id;
    const status = payload.status === 'CANCELLED' || payload.status === 'EXPIRED' ? payload.status : 'PAID';
    const paidAt = status === 'PAID' ? new Date(payload.paidAt || Date.now()) : undefined;

    this.payments.set(transactionId, { transactionId, status, paidAt });
    return { transactionId, status, paidAt };
  }

  private getExpiry(method: PaymentMethod): Date {
    const minutes = method === PaymentMethod.BANK_TRANSFER || method === PaymentMethod.VIRTUAL_ACCOUNT ? 24 * 60 : 15;
    return new Date(Date.now() + minutes * 60_000);
  }

  private async createQrisDetails(transactionId: string, request: CreatePaymentRequest): Promise<QRISDetails> {
    const qrString = [
      'EMERALD_KINGDOM_QRIS',
      transactionId,
      `IDR:${request.fiatAmount}`,
      `CC:${request.amount}`,
    ].join('|');
    const qrCodeBase64 = await qrcode.toDataURL(qrString, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 320,
    });

    return { transactionId, qrString, qrCodeBase64 };
  }

  private createVirtualAccountDetails(
    transactionId: string,
    request: CreatePaymentRequest,
  ): VirtualAccountDetails {
    const bankName = (request.bank || 'BCA').toUpperCase();
    return {
      transactionId,
      accountNumber: this.createVirtualAccountNumber(bankName),
      bankName,
      bankCode: bankName.toLowerCase(),
    };
  }

  private createEWalletDetails(transactionId: string, request: CreatePaymentRequest): EWalletDetails {
    const walletType = (request.walletType || 'GOPAY').toUpperCase();
    const encodedId = encodeURIComponent(transactionId);
    const redirectUrl = `https://payments.emerald-kingdom.local/ewallet/${walletType.toLowerCase()}?id=${encodedId}`;

    return {
      transactionId,
      walletType,
      redirectUrl,
      deepLink: `${walletType.toLowerCase()}://pay?transaction=${encodedId}`,
    };
  }

  private createStripeDetails(transactionId: string): StripeDetails {
    const sessionUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/topup?payment=${transactionId}`;
    return {
      sessionId: transactionId,
      sessionUrl,
      redirectUrl: sessionUrl,
    };
  }

  private createBankTransferDetails(transactionId: string): BankTransferDetails {
    return {
      transactionId,
      bankName: process.env.MANUAL_TRANSFER_BANK_NAME || 'Bank BCA',
      accountName: process.env.MANUAL_TRANSFER_ACCOUNT_NAME || 'Emerald Kingdom Treasury',
      accountNumber: process.env.MANUAL_TRANSFER_ACCOUNT_NUMBER || '888001234567890',
      instructions:
        '1. Transfer sesuai nominal yang tertera.<br />2. Simpan bukti transfer.<br />3. Upload bukti pembayaran.<br />4. Admin akan memverifikasi saldo.',
    };
  }

  private createVirtualAccountNumber(bankName: string): string {
    const bankPrefix: Record<string, string> = {
      BCA: '8801',
      BNI: '8802',
      MANDIRI: '8803',
      BRI: '8804',
      PERMATA: '8805',
    };
    const suffix = `${Date.now()}${Math.floor(Math.random() * 1000)}`
      .replace(/\D/g, '')
      .slice(-12)
      .padStart(12, '0');
    return `${bankPrefix[bankName] || '8899'}${suffix}`;
  }
}
