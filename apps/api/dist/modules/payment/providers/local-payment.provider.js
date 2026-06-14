"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var LocalPaymentProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalPaymentProvider = void 0;
const common_1 = require("@nestjs/common");
const qrcode = __importStar(require("qrcode"));
const payment_method_enum_1 = require("../interfaces/payment-method.enum");
let LocalPaymentProvider = LocalPaymentProvider_1 = class LocalPaymentProvider {
    constructor() {
        this.logger = new common_1.Logger(LocalPaymentProvider_1.name);
        this.name = 'LOCAL';
        this.supportedMethods = [
            payment_method_enum_1.PaymentMethod.QRIS,
            payment_method_enum_1.PaymentMethod.VIRTUAL_ACCOUNT,
            payment_method_enum_1.PaymentMethod.EWALLET,
            payment_method_enum_1.PaymentMethod.STRIPE,
            payment_method_enum_1.PaymentMethod.BANK_TRANSFER,
        ];
        this.payments = new Map();
    }
    async initialize(_config) {
        this.logger.log('LocalPaymentProvider initialized as demo/fallback provider');
    }
    async createPayment(request) {
        const transactionId = `local-${request.method.toLowerCase()}-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 8)}`;
        const expiresAt = this.getExpiry(request.method);
        this.payments.set(transactionId, { transactionId, status: 'PENDING' });
        switch (request.method) {
            case payment_method_enum_1.PaymentMethod.QRIS:
                return {
                    transactionId,
                    expiresAt,
                    paymentDetails: await this.createQrisDetails(transactionId, request),
                };
            case payment_method_enum_1.PaymentMethod.VIRTUAL_ACCOUNT:
                return {
                    transactionId,
                    expiresAt,
                    paymentDetails: this.createVirtualAccountDetails(transactionId, request),
                };
            case payment_method_enum_1.PaymentMethod.EWALLET:
                return {
                    transactionId,
                    expiresAt,
                    paymentDetails: this.createEWalletDetails(transactionId, request),
                };
            case payment_method_enum_1.PaymentMethod.STRIPE:
                return {
                    transactionId,
                    expiresAt,
                    paymentDetails: this.createStripeDetails(transactionId),
                };
            case payment_method_enum_1.PaymentMethod.BANK_TRANSFER:
                return {
                    transactionId,
                    expiresAt,
                    paymentDetails: this.createBankTransferDetails(transactionId),
                };
            default:
                throw new Error(`Unsupported local payment method: ${request.method}`);
        }
    }
    async checkPaymentStatus(transactionId) {
        return this.payments.get(transactionId) ?? { transactionId, status: 'EXPIRED' };
    }
    async validateWebhook(_payload, _signature) {
        return true;
    }
    async processWebhook(payload) {
        const transactionId = payload.transactionId || payload.transaction_id || payload.order_id;
        const status = payload.status === 'CANCELLED' || payload.status === 'EXPIRED' ? payload.status : 'PAID';
        const paidAt = status === 'PAID' ? new Date(payload.paidAt || Date.now()) : undefined;
        this.payments.set(transactionId, { transactionId, status, paidAt });
        return { transactionId, status, paidAt };
    }
    getExpiry(method) {
        const minutes = method === payment_method_enum_1.PaymentMethod.BANK_TRANSFER || method === payment_method_enum_1.PaymentMethod.VIRTUAL_ACCOUNT ? 24 * 60 : 15;
        return new Date(Date.now() + minutes * 60000);
    }
    async createQrisDetails(transactionId, request) {
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
    createVirtualAccountDetails(transactionId, request) {
        const bankName = (request.bank || 'BCA').toUpperCase();
        return {
            transactionId,
            accountNumber: this.createVirtualAccountNumber(bankName),
            bankName,
            bankCode: bankName.toLowerCase(),
        };
    }
    createEWalletDetails(transactionId, request) {
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
    createStripeDetails(transactionId) {
        const sessionUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/topup?payment=${transactionId}`;
        return {
            sessionId: transactionId,
            sessionUrl,
            redirectUrl: sessionUrl,
        };
    }
    createBankTransferDetails(transactionId) {
        return {
            transactionId,
            bankName: process.env.MANUAL_TRANSFER_BANK_NAME || 'Bank BCA',
            accountName: process.env.MANUAL_TRANSFER_ACCOUNT_NAME || 'Emerald Kingdom Treasury',
            accountNumber: process.env.MANUAL_TRANSFER_ACCOUNT_NUMBER || '888001234567890',
            instructions: '1. Transfer sesuai nominal yang tertera.<br />2. Simpan bukti transfer.<br />3. Upload bukti pembayaran.<br />4. Admin akan memverifikasi saldo.',
        };
    }
    createVirtualAccountNumber(bankName) {
        const bankPrefix = {
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
};
exports.LocalPaymentProvider = LocalPaymentProvider;
exports.LocalPaymentProvider = LocalPaymentProvider = LocalPaymentProvider_1 = __decorate([
    (0, common_1.Injectable)()
], LocalPaymentProvider);
//# sourceMappingURL=local-payment.provider.js.map