"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentMethod = void 0;
/**
 * Payment methods supported by the payment system
 * Validates Requirements 9.1, 9.2
 */
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["QRIS"] = "QRIS";
    PaymentMethod["VIRTUAL_ACCOUNT"] = "VIRTUAL_ACCOUNT";
    PaymentMethod["EWALLET"] = "EWALLET";
    PaymentMethod["STRIPE"] = "STRIPE";
    PaymentMethod["BANK_TRANSFER"] = "BANK_TRANSFER";
    PaymentMethod["TESTING"] = "TESTING";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
//# sourceMappingURL=payment-method.enum.js.map