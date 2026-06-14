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
exports.JwtService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const crypto_1 = require("crypto");
/**
 * JwtService — Generate dan verifikasi JWT token secara manual.
 *
 * Implementasi ini TIDAK menggunakan library jwt tambahan — cukup
 * pakai crypto bawaan Node.js. Formatnya standar JWT (header.payload.signature).
 *
 * Untuk production-scale, bisa diganti dengan @nestjs/jwt + passport.
 * Tapi untuk skala project ini, implementasi manual sudah cukup dan
 * menunjukkan pemahaman arsitektur.
 */
let JwtService = class JwtService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger("JwtService");
        this.secret = this.configService.get("JWT_SECRET") || "";
        if (!this.secret || this.secret.length < 32) {
            this.logger.warn("JWT_SECRET belum dikonfigurasi atau terlalu pendek. " +
                "Generate: node -e \"console.log(require('crypto').randomBytes(48).toString('hex'))\"");
            // Fallback untuk development — JANGAN pakai di production
            this.secret = this.secret || (0, crypto_1.randomBytes)(48).toString("hex");
        }
        this.accessTokenTTL = parseInt(this.configService.get("JWT_ACCESS_TTL") || "7200");
        this.refreshTokenTTL = parseInt(this.configService.get("JWT_REFRESH_TTL") || "604800");
    }
    /**
     * Generate access token (pendek — 15 menit).
     * Berisi: userId, email, role
     */
    generateAccessToken(payload) {
        return this.sign({
            sub: payload.userId,
            email: payload.email,
            role: payload.role || "user",
            adminRole: payload.adminRole,
            type: "access",
        }, this.accessTokenTTL);
    }
    /**
     * Generate refresh token (panjang — 7 hari).
     * Berisi: userId saja
     */
    generateRefreshToken(userId, sessionId) {
        return this.sign({
            sub: userId,
            sessionId,
            type: "refresh",
        }, this.refreshTokenTTL);
    }
    /**
     * Verifikasi dan decode token.
     * Return null kalau token invalid atau expired.
     */
    verify(token) {
        try {
            const parts = token.split(".");
            if (parts.length !== 3)
                return null;
            const [headerB64, payloadB64, signature] = parts;
            // Verifikasi signature
            const expectedSignature = this.createSignature(`${headerB64}.${payloadB64}`);
            if (signature !== expectedSignature)
                return null;
            // Decode payload
            const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
            // Cek expiry
            if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
                return null;
            }
            return payload;
        }
        catch {
            return null;
        }
    }
    // ============================================================
    // Private helpers
    // ============================================================
    sign(payload, ttlSeconds) {
        const header = {
            alg: "HS256",
            typ: "JWT",
        };
        const now = Math.floor(Date.now() / 1000);
        const fullPayload = {
            ...payload,
            iat: now,
            exp: now + ttlSeconds,
        };
        const headerB64 = Buffer.from(JSON.stringify(header)).toString("base64url");
        const payloadB64 = Buffer.from(JSON.stringify(fullPayload)).toString("base64url");
        const signature = this.createSignature(`${headerB64}.${payloadB64}`);
        return `${headerB64}.${payloadB64}.${signature}`;
    }
    createSignature(data) {
        return (0, crypto_1.createHmac)("sha256", this.secret).update(data).digest("base64url");
    }
};
exports.JwtService = JwtService;
exports.JwtService = JwtService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], JwtService);
//# sourceMappingURL=jwt.service.js.map