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
exports.RegisterDto = void 0;
const class_validator_1 = require("class-validator");
const match_decorator_1 = require("../decorators/match.decorator");
const swagger_1 = require("@nestjs/swagger");
/**
 * RegisterDto — Validasi input endpoint POST /api/v1/auth/register
 *
 * Aturan validasi:
 * ─── Email ──────────────────────────────────────────────────────
 * - Format email yang valid (RFC 5322)
 * - Di-lowercase & di-trim secara otomatis via @Transform
 * - Maks 255 karakter (batas umum DB varchar)
 *
 * ─── Password ───────────────────────────────────────────────────
 * - Min 8 karakter, maks 72 karakter
 *   (72 karakter adalah batas bcrypt; Argon2 tidak punya batas,
 *    tapi kita batasi untuk mencegah DoS via password sangat panjang)
 * - Wajib mengandung: huruf besar, huruf kecil, angka, simbol
 * - Tidak boleh mengandung spasi
 *
 * ─── ConfirmPassword ─────────────────────────────────────────────
 * - Wajib sama dengan field `password`
 * - Divalidasi dengan custom @Match decorator
 */
class RegisterDto {
}
exports.RegisterDto = RegisterDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'peter@emeraldkingdom.com',
        description: 'Alamat email yang valid dan belum terdaftar',
    }),
    (0, class_validator_1.IsEmail)({}, { message: 'Format email tidak valid' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Email tidak boleh kosong' }),
    (0, class_validator_1.MaxLength)(255, { message: 'Email tidak boleh melebihi 255 karakter' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'P@ssw0rd!2024',
        description: 'Password minimal 8 karakter, mengandung huruf besar, huruf kecil, angka, dan simbol',
    }),
    (0, class_validator_1.IsString)({ message: 'Password harus berupa string' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Password tidak boleh kosong' }),
    (0, class_validator_1.MinLength)(8, { message: 'Password minimal 8 karakter' }),
    (0, class_validator_1.MaxLength)(72, { message: 'Password tidak boleh melebihi 72 karakter' }),
    (0, class_validator_1.IsStrongPassword)({
        minUppercase: 1,
        minLowercase: 1,
        minNumbers: 1,
        minSymbols: 1,
    }, {
        message: 'Password harus mengandung minimal 1 huruf besar, 1 huruf kecil, 1 angka, dan 1 simbol',
    }),
    (0, class_validator_1.Matches)(/^\S*$/, { message: 'Password tidak boleh mengandung spasi' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'P@ssw0rd!2024',
        description: 'Harus sama dengan field password',
    }),
    (0, class_validator_1.IsString)({ message: 'Konfirmasi password harus berupa string' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Konfirmasi password tidak boleh kosong' }),
    (0, match_decorator_1.Match)('password', { message: 'Password dan konfirmasi password tidak cocok' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "confirmPassword", void 0);
//# sourceMappingURL=register.dto.js.map