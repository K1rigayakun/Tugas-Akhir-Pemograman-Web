import { OnModuleInit } from '@nestjs/common';
import { PaymentProviderRegistry } from './payment-provider-registry.service';
import { TestingProvider } from './providers/testing.provider';
import { MidtransProvider } from './providers/midtrans.provider';
import { LocalPaymentProvider } from './providers/local-payment.provider';
export declare class PaymentModule implements OnModuleInit {
    private readonly registry;
    private readonly testingProvider;
    private readonly midtransProvider;
    private readonly localPaymentProvider;
    private readonly logger;
    constructor(registry: PaymentProviderRegistry, testingProvider: TestingProvider, midtransProvider: MidtransProvider, localPaymentProvider: LocalPaymentProvider);
    /**
     * Initialize and register payment providers on module initialization
     * Validates Requirements 9.4, 9.5, 8.3
     */
    onModuleInit(): Promise<void>;
}
//# sourceMappingURL=payment.module.d.ts.map