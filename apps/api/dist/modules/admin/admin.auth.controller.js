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
exports.AdminAuthController = void 0;
const common_1 = require("@nestjs/common");
const jwt_service_1 = require("../../common/auth/jwt.service");
const password_service_1 = require("../../common/auth/password.service");
const db_1 = require("@emerald-kingdom/db");
let AdminAuthController = class AdminAuthController {
    constructor(jwtService, passwordService) {
        this.jwtService = jwtService;
        this.passwordService = passwordService;
    }
    async login(body) {
        const { email, password } = body;
        const user = await db_1.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            throw new common_1.UnauthorizedException("Email atau password tidak valid");
        }
        if (!user.adminRole) {
            throw new common_1.ForbiddenException("Akses ditolak: Bukan akun admin");
        }
        const isPasswordValid = await this.passwordService.verify(user.passwordHash, password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException("Email atau password tidak valid");
        }
        const token = this.jwtService.generateAccessToken({
            userId: user.id,
            email: user.email,
            role: user.adminRole,
            adminRole: user.adminRole,
        });
        return {
            success: true,
            accessToken: token,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                adminRole: user.adminRole,
            }
        };
    }
};
exports.AdminAuthController = AdminAuthController;
__decorate([
    (0, common_1.Post)("login"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminAuthController.prototype, "login", null);
exports.AdminAuthController = AdminAuthController = __decorate([
    (0, common_1.Controller)("admin/auth"),
    __metadata("design:paramtypes", [jwt_service_1.JwtService,
        password_service_1.PasswordService])
], AdminAuthController);
//# sourceMappingURL=admin.auth.controller.js.map