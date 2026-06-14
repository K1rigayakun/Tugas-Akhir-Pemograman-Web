import { PaymentProvider } from '../interfaces/payment-provider.interface';
import { PaymentMethod } from '../interfaces/payment-method.enum';
import { CreatePaymentRequest, PaymentProviderConfig, PaymentResponse, PaymentStatusResponse, WebhookResult } from '../interfaces/payment-types';
export declare class LocalPaymentProvider implements PaymentProvider {
    private readonly logger;
    readonly name = "LOCAL";
    readonly supportedMethods: PaymentMethod[];
    private readonly payments;
    initialize(_config: PaymentProviderConfig): Promise<void>;
    createPayment(request: CreatePaymentRequest): Promise<PaymentResponse>;
    checkPaymentStatus(transactionId: string): Promise<PaymentStatusResponse>;
    validateWebhook(_payload: any, _signature: string): Promise<boolean>;
    processWebhook(payload: any): Promise<WebhookResult>;
    private getExpiry;
    private createQrisDetails;
    private createVirtualAccountDetails;
    private createEWalletDetails;
    private createStripeDetails;
    private createBankTransferDetails;
    private createVirtualAccountNumber;
}
//# sourceMappingURL=local-payment.provider.d.ts.map