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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const swagger_1 = require("@nestjs/swagger");
const auth_service_1 = require("./auth.service");
const register_dto_1 = require("./dto/register.dto");
const public_decorator_1 = require("./decorators/public.decorator");
const auth_throttler_guard_1 = require("./guards/auth-throttler.guard");
const verify_email_dto_1 = require("./dto/verify-email.dto");
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    async register(dto) {
        return this.authService.register(dto);
    }
    async verifyEmail(dto) {
        return this.authService.verifyEmail(dto);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, throttler_1.Throttle)({ auth: { limit: 5, ttl: 300_000 } }),
    (0, common_1.Post)('register'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({
        summary: 'Registrasi akun baru',
        description: 'Mendaftarkan user baru dan mengirimkan kode OTP ke email untuk verifikasi. ' +
            'Rate limited: maks 5 percobaan per 5 menit per IP.',
    }),
    (0, swagger_1.ApiBody)({ type: register_dto_1.RegisterDto }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Registrasi berhasil. OTP dikirim ke email.',
        schema: {
            example: {
                message: 'Registrasi berhasil! Kode OTP telah dikirim ke email Anda. Kode berlaku selama 10 menit.',
                userId: 'clxyz1234abcdef',
                email: 'peter@emeraldkingdom.com',
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 409,
        description: 'Email sudah terdaftar.',
        schema: {
            example: {
                statusCode: 409,
                message: 'Email ini sudah terdaftar. Silakan gunakan email lain atau login.',
                error: 'Conflict',
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 422,
        description: 'Validasi input gagal.',
        schema: {
            example: {
                statusCode: 422,
                message: [
                    'Format email tidak valid',
                    'Password harus mengandung minimal 1 huruf besar, 1 huruf kecil, 1 angka, dan 1 simbol',
                    'Password dan konfirmasi password tidak cocok',
                ],
                error: 'Unprocessable Entity',
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 429,
        description: 'Terlalu banyak percobaan. Coba lagi dalam 15 menit.',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_dto_1.RegisterDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, throttler_1.Throttle)({ auth: { limit: 5, ttl: 300_000 } }),
    (0, common_1.Post)('verify-email'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Verifikasi email dengan OTP',
        description: 'Memvalidasi kode OTP 6-digit yang dikirim ke email saat registrasi. ' +
            'Jika valid, mengembalikan Access Token & Refresh Token. ' +
            'Rate limited: maks 5 percobaan per 5 menit per IP.',
    }),
    (0, swagger_1.ApiBody)({ type: verify_email_dto_1.VerifyEmailDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Email berhasil diverifikasi. Token dikembalikan.',
        schema: {
            example: {
                message: 'Email berhasil diverifikasi! Selamat datang di Emerald Kingdom.',
                accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                user: {
                    id: 'clxyz1234abcdef',
                    email: 'peter@emeraldkingdom.com',
                    role: 'BUYER',
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'OTP tidak valid atau sudah kedaluwarsa.',
        schema: {
            example: {
                statusCode: 401,
                message: 'Kode OTP tidak valid atau sudah kedaluwarsa. Silakan minta kode baru.',
                error: 'Unauthorized',
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 409,
        description: 'Email sudah terverifikasi sebelumnya.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 429,
        description: 'Terlalu banyak percobaan. Coba lagi dalam 15 menit.',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [verify_email_dto_1.VerifyEmailDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyEmail", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('Authentication'),
    (0, common_1.UseGuards)(auth_throttler_guard_1.AuthThrottlerGuard),
    (0, common_1.Controller)({ path: 'auth', version: '1' }),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map