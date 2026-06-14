import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createHmac, randomBytes } from "crypto";

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
@Injectable()
export class JwtService {
  private readonly secret: string;
  private readonly accessTokenTTL: number; // detik
  private readonly refreshTokenTTL: number; // detik
  private readonly logger = new Logger("JwtService");

  constructor(private configService: ConfigService) {
    this.secret = this.configService.get<string>("JWT_SECRET") || "";
    if (!this.secret || this.secret.length < 32) {
      this.logger.warn(
        "JWT_SECRET belum dikonfigurasi atau terlalu pendek. " +
          "Generate: node -e \"console.log(require('crypto').randomBytes(48).toString('hex'))\"",
      );
      // Fallback untuk development — JANGAN pakai di production
      this.secret = this.secret || randomBytes(48).toString("hex");
    }

    this.accessTokenTTL = parseInt(
      this.configService.get<string>("JWT_ACCESS_TTL") || "7200", // 2 jam
    );
    this.refreshTokenTTL = parseInt(
      this.configService.get<string>("JWT_REFRESH_TTL") || "604800", // 7 hari
    );
  }

  /**
   * Generate access token (pendek — 15 menit).
   * Berisi: userId, email, role
   */
  generateAccessToken(payload: {
    userId: string;
    email: string;
    role?: string;
    adminRole?: string;
  }): string {
    return this.sign(
      {
        sub: payload.userId,
        email: payload.email,
        role: payload.role || "user",
        adminRole: payload.adminRole,
        type: "access",
      },
      this.accessTokenTTL,
    );
  }

  /**
   * Generate refresh token (panjang — 7 hari).
   * Berisi: userId saja
   */
  generateRefreshToken(userId: string, sessionId?: string): string {
    return this.sign(
      {
        sub: userId,
        sessionId,
        type: "refresh",
      },
      this.refreshTokenTTL,
    );
  }

  /**
   * Verifikasi dan decode token.
   * Return null kalau token invalid atau expired.
   */
  verify(token: string): Record<string, unknown> | null {
    try {
      const parts = token.split(".");
      if (parts.length !== 3) return null;

      const [headerB64, payloadB64, signature] = parts;

      // Verifikasi signature
      const expectedSignature = this.createSignature(
        `${headerB64}.${payloadB64}`,
      );
      if (signature !== expectedSignature) return null;

      // Decode payload
      const payload = JSON.parse(
        Buffer.from(payloadB64, "base64url").toString("utf8"),
      );

      // Cek expiry
      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        return null;
      }

      return payload;
    } catch {
      return null;
    }
  }

  // ============================================================
  // Private helpers
  // ============================================================

  public sign(payload: Record<string, unknown>, ttlSeconds: number): string {
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

    const headerB64 = Buffer.from(JSON.stringify(header)).toString(
      "base64url",
    );
    const payloadB64 = Buffer.from(JSON.stringify(fullPayload)).toString(
      "base64url",
    );

    const signature = this.createSignature(`${headerB64}.${payloadB64}`);

    return `${headerB64}.${payloadB64}.${signature}`;
  }

  private createSignature(data: string): string {
    return createHmac("sha256", this.secret).update(data).digest("base64url");
  }
}
