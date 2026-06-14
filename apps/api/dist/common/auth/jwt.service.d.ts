import { ConfigService } from "@nestjs/config";
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
export declare class JwtService {
    private configService;
    private readonly secret;
    private readonly accessTokenTTL;
    private readonly refreshTokenTTL;
    private readonly logger;
    constructor(configService: ConfigService);
    /**
     * Generate access token (pendek — 15 menit).
     * Berisi: userId, email, role
     */
    generateAccessToken(payload: {
        userId: string;
        email: string;
        role?: string;
        adminRole?: string;
    }): string;
    /**
     * Generate refresh token (panjang — 7 hari).
     * Berisi: userId saja
     */
    generateRefreshToken(userId: string, sessionId?: string): string;
    /**
     * Verifikasi dan decode token.
     * Return null kalau token invalid atau expired.
     */
    verify(token: string): Record<string, unknown> | null;
    sign(payload: Record<string, unknown>, ttlSeconds: number): string;
    private createSignature;
}
//# sourceMappingURL=jwt.service.d.ts.map