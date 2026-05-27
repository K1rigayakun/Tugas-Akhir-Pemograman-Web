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
exports.VerifyEmailDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class VerifyEmailDto {
}
exports.VerifyEmailDto = VerifyEmailDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'peter@emeraldkingdom.com',
        description: 'Email yang digunakan saat registrasi',
    }),
    (0, class_validator_1.IsEmail)({}, { message: 'Format email tidak valid' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Email tidak boleh kosong' }),
    (0, class_transformer_1.Transform)(({ value }) => typeof value === 'string' ? value.toLowerCase().trim() : value),
    __metadata("design:type", String)
], VerifyEmailDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '048291',
        description: 'Kode OTP 6 digit yang dikirim ke email',
    }),
    (0, class_validator_1.IsString)({ message: 'OTP harus berupa string' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'OTP tidak boleh kosong' }),
    (0, class_transformer_1.Transform)(({ value }) => typeof value === 'string' ? value.trim() : value),
    (0, class_validator_1.Length)(6, 6, { message: 'OTP harus tepat 6 digit' }),
    (0, class_validator_1.Matches)(/^\d{6}$/, { message: 'OTP hanya boleh mengandung angka' }),
    __metadata("design:type", String)
], VerifyEmailDto.prototype, "otp", void 0);
//# sourceMappingURL=verify-email.dto.js.map