"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PaymentModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentModule = void 0;
const common_1 = require("@nestjs/common");
const payment_service_1 = require("./payment.service");
const payment_controller_1 = require("./payment.controller");
const payment_provider_registry_service_1 = require("./payment-provider-registry.service");
const payment_gateway_1 = require("./payment.gateway");
const prisma_module_1 = require("../../prisma/prisma.module");
const testing_provider_1 = require("./providers/testing.provider");
const midtrans_provider_1 = require("./providers/midtrans.provider");
const local_payment_provider_1 = require("./providers/local-payment.provider");
const midtrans_config_1 = require("../../config/midtrans.config");
let PaymentModule = PaymentModule_1 = class PaymentModule {
    constructor(registry, testingProvider, midtransProvider, localPaymentProvider) {
        this.registry = registry;
        this.testingProvider = testingProvider;
        this.midtransProvider = midtransProvider;
        this.localPaymentProvider = localPaymentProvider;
        this.logger = new common_1.Logger(PaymentModule_1.name);
    }
    /**
     * Initialize and register payment providers on module initialization
     * Validates Requirements 9.4, 9.5, 8.3
     */
    async onModuleInit() {
        // Initialize TestingProvider
        await this.testingProvider.initialize({
            environment: 'sandbox',
            serverKey: 'test-key',
        });
        // Register TestingProvider with the registry
        this.registry.registerProvider(this.testingProvider);
        // Initialize MidtransProvider with configuration
        try {
            await this.midtransProvider.initialize({
                environment: midtrans_config_1.midtransConfig.isSandbox ? 'sandbox' : 'production',
                serverKey: midtrans_config_1.midtransConfig.serverKey,
                clientKey: midtrans_config_1.midtransConfig.clientKey,
            });
            // Register MidtransProvider with the registry
            this.registry.registerProvider(this.midtransProvider);
            this.logger.log('✅ MidtransProvider registered successfully');
        }
        catch (error) {
            this.logger.error('❌ Failed to initialize MidtransProvider. Indonesian payment methods will not be available.', error);
            // Continue application startup - graceful degradation per Requirement 9.5
        }
        await this.localPaymentProvider.initialize({
            environment: 'sandbox',
            serverKey: 'local-demo',
        });
        this.registry.registerProvider(this.localPaymentProvider);
        this.logger.log('LocalPaymentProvider registered for missing demo payment methods');
    }
};
exports.PaymentModule = PaymentModule;
exports.PaymentModule = PaymentModule = PaymentModule_1 = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [payment_controller_1.PaymentController],
        providers: [
            payment_service_1.PaymentService,
            payment_provider_registry_service_1.PaymentProviderRegistry,
            payment_gateway_1.PaymentGateway,
            testing_provider_1.TestingProvider,
            midtrans_provider_1.MidtransProvider,
            local_payment_provider_1.LocalPaymentProvider
        ],
        exports: [payment_service_1.PaymentService, payment_provider_registry_service_1.PaymentProviderRegistry],
    }),
    __metadata("design:paramtypes", [payment_provider_registry_service_1.PaymentProviderRegistry,
        testing_provider_1.TestingProvider,
        midtrans_provider_1.MidtransProvider,
        local_payment_provider_1.LocalPaymentProvider])
], PaymentModule);
//# sourceMappingURL=payment.module.js.map