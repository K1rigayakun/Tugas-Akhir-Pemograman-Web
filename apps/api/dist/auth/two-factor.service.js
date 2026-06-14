"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwoFactorService = void 0;
const common_1 = require("@nestjs/common");
const otplib_1 = require("otplib");
const qrcode = __importStar(require("qrcode"));
const prisma_service_1 = require("../prisma/prisma.service");
const password_service_1 = require("../common/auth/password.service");
let TwoFactorService = class TwoFactorService {
    constructor(prisma, passwordService) {
        this.prisma = prisma;
        this.passwordService = passwordService;
        otplib_1.authenticator.options = { window: 1 }; // Allow 1 step before/after
    }
    async generateTwoFactorSecret(user) {
        const secret = otplib_1.authenticator.generateSecret();
        const otpauthUrl = otplib_1.authenticator.keyuri(user.email, 'Aurum Imperium', secret);
        // Save the secret temporarily or update user
        await this.prisma.user.update({
            where: { id: user.id },
            data: { twoFactorSecret: secret }, // Note: In production, encrypt this
        });
        const qrCodeUrl = await qrcode.toDataURL(otpauthUrl);
        return { secret, qrCodeUrl };
    }
    async verifyTwoFactorCode(user, code) {
        const userRecord = await this.prisma.user.findUnique({
            where: { id: user.id },
            select: { twoFactorSecret: true },
        });
        if (!userRecord || !userRecord.twoFactorSecret) {
            return false;
        }
        return otplib_1.authenticator.verify({
            token: code,
            secret: userRecord.twoFactorSecret,
        });
    }
    async enableTwoFactor(user, code) {
        const isValid = await this.verifyTwoFactorCode(user, code);
        if (!isValid)
            return false;
        await this.prisma.user.update({
            where: { id: user.id },
            data: { twoFactorEnabled: true },
        });
        return true;
    }
};
exports.TwoFactorService = TwoFactorService;
exports.TwoFactorService = TwoFactorService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        password_service_1.PasswordService])
], TwoFactorService);
//# sourceMappingURL=two-factor.service.js.map