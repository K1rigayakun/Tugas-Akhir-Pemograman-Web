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
exports.AuthGuard = void 0;
const common_1 = require("@nestjs/common");
const jwt_service_1 = require("./jwt.service");
/**
 * AuthGuard — Memverifikasi JWT token dari header Authorization.
 *
 * Cara kerja:
 * 1. Ambil token dari header: `Authorization: Bearer <token>`
 * 2. Verifikasi signature dan expiry
 * 3. Decode payload dan set ke `req.user`
 * 4. Endpoint yang pakai @UseGuards(AuthGuard) akan terlindungi
 *
 * req.user berisi: { id, email, role, adminRole }
 */
let AuthGuard = class AuthGuard {
    constructor(jwtService) {
        this.jwtService = jwtService;
    }
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new common_1.UnauthorizedException("Token tidak ditemukan. Silakan login terlebih dahulu.");
        }
        const token = authHeader.split(" ")[1];
        const payload = this.jwtService.verify(token);
        if (!payload) {
            throw new common_1.UnauthorizedException("Token tidak valid atau sudah expired. Silakan login ulang.");
        }
        if (payload.type !== "access") {
            throw new common_1.UnauthorizedException("Token type tidak valid. Gunakan access token.");
        }
        // Set user ke request — dipakai oleh RolesGuard dan controller
        request.user = {
            id: payload.sub,
            email: payload.email,
            role: payload.role,
            adminRole: payload.adminRole,
        };
        return true;
    }
};
exports.AuthGuard = AuthGuard;
exports.AuthGuard = AuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_service_1.JwtService])
], AuthGuard);
//# sourceMappingURL=auth.guard.js.map