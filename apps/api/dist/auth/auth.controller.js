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
const swagger_1 = require("@nestjs/swagger");
const throttler_1 = require("@nestjs/throttler");
const common_2 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const two_factor_service_1 = require("./two-factor.service");
const jwt_service_1 = require("../common/auth/jwt.service");
const login_dto_1 = require("./dto/login.dto");
const refresh_token_dto_1 = require("./dto/refresh-token.dto");
const register_dto_1 = require("./dto/register.dto");
const verify_email_dto_1 = require("./dto/verify-email.dto");
const auth_guard_1 = require("../common/auth/auth.guard");
let AuthController = class AuthController {
    constructor(authService, twoFactorService, jwtService) {
        this.authService = authService;
        this.twoFactorService = twoFactorService;
        this.jwtService = jwtService;
    }
    register(dto) {
        return this.authService.register(dto);
    }
    verifyEmail(dto, request) {
        return this.authService.verifyEmail(dto, this.clientIp(request), request.headers["user-agent"] || "unknown");
    }
    login(dto, request) {
        return this.authService.login(dto, this.clientIp(request), request.headers["user-agent"] || "unknown");
    }
    refresh(dto) {
        return this.authService.refreshToken(dto);
    }
    async logout(request) {
        const token = request.headers.authorization?.replace('Bearer ', '');
        try {
            // Update all active sessions for the user to inactive
            await this.authService.logoutAllSessions(request.user.id);
        }
        catch (error) {
            // Log error but don't fail the request
            console.log('Logout error (non-critical):', error);
        }
        // Always return 200 status with success message
        return { success: true, message: 'Logged out successfully' };
    }
    async setup2fa(dto, request) {
        try {
            const payload = this.jwtService.verify(dto.tempToken);
            if (!payload || payload.type !== "2fa_setup")
                throw new common_2.UnauthorizedException("Token tidak valid.");
            const userId = payload.sub;
            const success = await this.twoFactorService.enableTwoFactor({ id: userId }, dto.code);
            if (!success)
                throw new common_2.UnauthorizedException("Kode 2FA tidak valid.");
            return this.authService.finalizeLogin(userId, this.clientIp(request), request.headers["user-agent"] || "unknown");
        }
        catch (e) {
            throw new common_2.UnauthorizedException("Token 2FA atau kode tidak valid.");
        }
    }
    async verify2fa(dto, request) {
        try {
            const payload = this.jwtService.verify(dto.tempToken);
            if (!payload || payload.type !== "2fa_verify")
                throw new common_2.UnauthorizedException("Token tidak valid.");
            const userId = payload.sub;
            const success = await this.twoFactorService.verifyTwoFactorCode({ id: userId }, dto.code);
            if (!success)
                throw new common_2.UnauthorizedException("Kode 2FA tidak valid.");
            return this.authService.finalizeLogin(userId, this.clientIp(request), request.headers["user-agent"] || "unknown");
        }
        catch (e) {
            throw new common_2.UnauthorizedException("Token 2FA atau kode tidak valid.");
        }
    }
    sessions(request) {
        return this.authService.listSessions(request.user.id);
    }
    revokeSession(request, sessionId) {
        return this.authService.revokeSession(request.user.id, sessionId);
    }
    async me(request) {
        return this.authService.getProfile(request.user.id);
    }
    myCosmetics(request) {
        return this.authService.myCosmetics(request.user.id);
    }
    changeUsername(request, dto) {
        if (!dto.newUsername)
            throw new common_2.UnauthorizedException("newUsername harus diisi.");
        return this.authService.changeUsername(request.user.id, dto.newUsername);
    }
    changeAvatar(request, dto) {
        if (!dto.avatarUrl)
            throw new common_2.UnauthorizedException("avatarUrl harus diisi.");
        return this.authService.changeAvatar(request.user.id, dto.avatarUrl);
    }
    clientIp(request) {
        const forwarded = request.headers["x-forwarded-for"];
        if (typeof forwarded === "string")
            return forwarded.split(",")[0].trim();
        if (Array.isArray(forwarded))
            return forwarded[0] || "unknown";
        return request.socket.remoteAddress || "unknown";
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)("register"),
    (0, throttler_1.Throttle)({ default: { limit: 5, ttl: 300000 } }),
    (0, swagger_1.ApiOperation)({ summary: "Daftarkan akun dan kirim OTP" }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_dto_1.RegisterDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)("verify-email"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, throttler_1.Throttle)({ default: { limit: 5, ttl: 300000 } }),
    (0, swagger_1.ApiOperation)({ summary: "Verifikasi email menggunakan OTP" }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [verify_email_dto_1.VerifyEmailDto, Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "verifyEmail", null);
__decorate([
    (0, common_1.Post)("login"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, throttler_1.Throttle)({ default: { limit: 5, ttl: 300000 } }),
    (0, swagger_1.ApiOperation)({ summary: "Login user" }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto, Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)("refresh"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, throttler_1.Throttle)({ default: { limit: 10, ttl: 300000 } }),
    (0, swagger_1.ApiOperation)({ summary: "Rotasi refresh token" }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [refresh_token_dto_1.RefreshTokenDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "refresh", null);
__decorate([
    (0, common_1.Post)("logout"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiOperation)({ summary: "Nonaktifkan sesi login" }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Post)("2fa/setup"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: "Setup 2FA dan dapatkan token penuh" }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "setup2fa", null);
__decorate([
    (0, common_1.Post)("2fa/verify"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: "Verifikasi 2FA saat login" }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verify2fa", null);
__decorate([
    (0, common_1.Get)("sessions"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "sessions", null);
__decorate([
    (0, common_1.Delete)("sessions/:id"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "revokeSession", null);
__decorate([
    (0, common_1.Get)("me"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "me", null);
__decorate([
    (0, common_1.Get)("me/cosmetics"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "myCosmetics", null);
__decorate([
    (0, common_1.Post)("me/change-username"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, throttler_1.Throttle)({ default: { limit: 3, ttl: 600000 } }) // max 3 tries per 10 mins
    ,
    (0, swagger_1.ApiOperation)({ summary: "Ganti username dengan memotong 500 CC" }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "changeUsername", null);
__decorate([
    (0, common_1.Post)("me/change-avatar"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiOperation)({ summary: "Ubah foto profil" }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "changeAvatar", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)("Authentication"),
    (0, common_1.Controller)("auth"),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        two_factor_service_1.TwoFactorService,
        jwt_service_1.JwtService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map