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
exports.JwtRefreshStrategy = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const passport_jwt_1 = require("passport-jwt");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../../prisma/prisma.service");
const auth_service_1 = require("../auth.service");
let JwtRefreshStrategy = class JwtRefreshStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy, 'jwt-refresh') {
    constructor(configService, prisma, authService) {
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get('JWT_REFRESH_SECRET'),
            passReqToCallback: true,
        });
        this.prisma = prisma;
        this.authService = authService;
    }
    async validate(req, payload) {
        if (payload.type !== 'refresh') {
            throw new common_1.UnauthorizedException('Invalid token type');
        }
        const refreshToken = req
            .get('Authorization')
            ?.replace('Bearer', '')
            .trim();
        if (!refreshToken) {
            throw new common_1.UnauthorizedException('Refresh token not found');
        }
        const session = await this.prisma.session.findUnique({
            where: { id: payload.sessionId },
            include: {
                user: {
                    select: { id: true, email: true, role: true, isActive: true },
                },
            },
        });
        if (!session || !session.isActive || !session.user.isActive) {
            throw new common_1.UnauthorizedException('Session not found or expired');
        }
        const isTokenValid = await this.authService.verifyRefreshTokenHash(session.refreshTokenHash, refreshToken);
        if (!isTokenValid) {
            await this.prisma.session.updateMany({
                where: { userId: session.userId },
                data: { isActive: false },
            });
            throw new common_1.UnauthorizedException('Token reuse detected. All sessions terminated.');
        }
        return { ...session.user, sessionId: session.id };
    }
};
exports.JwtRefreshStrategy = JwtRefreshStrategy;
exports.JwtRefreshStrategy = JwtRefreshStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        prisma_service_1.PrismaService,
        auth_service_1.AuthService])
], JwtRefreshStrategy);
//# sourceMappingURL=jwt-refresh.strategy.js.map