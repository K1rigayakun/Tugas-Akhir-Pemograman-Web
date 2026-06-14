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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentListQueryDto = exports.RejectPaymentDto = exports.ApprovePaymentDto = exports.InitiatePaymentDto = exports.PaymentMethodDto = void 0;
const class_validator_1 = require("class-validator");
/**
 * Payment method enum for DTO validation
 */
var PaymentMethodDto;
(function (PaymentMethodDto) {
    PaymentMethodDto["QRIS"] = "QRIS";
    PaymentMethodDto["VIRTUAL_ACCOUNT"] = "VIRTUAL_ACCOUNT";
    PaymentMethodDto["EWALLET"] = "EWALLET";
    PaymentMethodDto["STRIPE"] = "STRIPE";
    PaymentMethodDto["BANK_TRANSFER"] = "BANK_TRANSFER";
    PaymentMethodDto["TESTING"] = "TESTING";
})(PaymentMethodDto || (exports.PaymentMethodDto = PaymentMethodDto = {}));
/**
 * DTO for initiating a new payment
 * Validates Requirements 2.1, 10.2, 10.3
 */
class InitiatePaymentDto {
}
exports.InitiatePaymentDto = InitiatePaymentDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1, { message: 'Jumlah CC harus minimal 1' }),
    __metadata("design:type", Number)
], InitiatePaymentDto.prototype, "amount", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1, { message: 'Jumlah fiat harus minimal 1' }),
    __metadata("design:type", Number)
], InitiatePaymentDto.prototype, "fiatAmount", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(PaymentMethodDto, { message: 'Metode pembayaran tidak valid' }),
    __metadata("design:type", String)
], InitiatePaymentDto.prototype, "method", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], InitiatePaymentDto.prototype, "bank", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], InitiatePaymentDto.prototype, "walletType", void 0);
/**
 * DTO for approving a payment
 * Validates Requirements 6.3, 6.5
 */
class ApprovePaymentDto {
}
exports.ApprovePaymentDto = ApprovePaymentDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ApprovePaymentDto.prototype, "notes", void 0);
/**
 * DTO for rejecting a payment
 * Validates Requirements 6.4, 6.7
 */
class RejectPaymentDto {
}
exports.RejectPaymentDto = RejectPaymentDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Catatan admin wajib diisi saat menolak pembayaran' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RejectPaymentDto.prototype, "notes", void 0);
/**
 * DTO for payment list query parameters
 */
class PaymentListQueryDto {
}
exports.PaymentListQueryDto = PaymentListQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PaymentListQueryDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PaymentListQueryDto.prototype, "method", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PaymentListQueryDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PaymentListQueryDto.prototype, "limit", void 0);
//# sourceMappingURL=payment.dto.js.map