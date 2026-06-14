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
exports.AdminAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const jwt_service_1 = require("../../common/auth/jwt.service");
/**
 * AdminAuthGuard — Verifies JWT token and checks user has valid admin role.
 *
 * How it works:
 * 1. Extract token from Authorization header: `Authorization: Bearer <token>`
 * 2. Verify JWT signature and expiry
 * 3. Check user has valid adminRole field (SUPER_ADMIN, AUCTION_MANAGER, KYC_OFFICER, CONTENT_MANAGER, SUPPORT_OFFICER)
 * 4. Throw UnauthorizedException if token invalid or user lacks admin role
 * 5. Set validated user object to req.user for use in controllers
 *
 * Usage:
 * @UseGuards(AdminAuthGuard)
 * @Controller('admin')
 * export class AdminController { ... }
 */
let AdminAuthGuard = class AdminAuthGuard {
    constructor(jwtService) {
        this.jwtService = jwtService;
    }
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;
        // Check Authorization header exists and has Bearer format
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new common_1.UnauthorizedException("Token tidak ditemukan. Silakan login sebagai admin.");
        }
        // Extract token from header
        const token = authHeader.split(" ")[1];
        // Verify JWT token
        const payload = this.jwtService.verify(token);
        if (!payload) {
            throw new common_1.UnauthorizedException("Token tidak valid atau sudah expired. Silakan login ulang.");
        }
        // Check token type is access token
        if (payload.type !== "access") {
            throw new common_1.UnauthorizedException("Token type tidak valid. Gunakan access token.");
        }
        // Check user has admin role
        const validAdminRoles = [
            "SUPER_ADMIN",
            "AUCTION_MANAGER",
            "KYC_OFFICER",
            "CONTENT_MANAGER",
            "SUPPORT_OFFICER",
        ];
        if (!payload.adminRole || !validAdminRoles.includes(payload.adminRole)) {
            throw new common_1.UnauthorizedException("Akses ditolak. Hanya admin yang dapat mengakses resource ini.");
        }
        // Set user to request for use in controllers
        request.user = {
            id: payload.sub,
            email: payload.email,
            role: payload.role,
            adminRole: payload.adminRole,
        };
        return true;
    }
};
exports.AdminAuthGuard = AdminAuthGuard;
exports.AdminAuthGuard = AdminAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_service_1.JwtService])
], AdminAuthGuard);
//# sourceMappingURL=admin-auth.guard.js.map