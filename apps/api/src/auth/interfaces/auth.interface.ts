/**
 * Interfaces & Types untuk Auth Module — Emerald Kingdom
 * Updated: Step 2 — Register
 */

/** Payload yang disimpan di dalam JWT Access Token */
export interface JwtPayload {
  sub: string;       // userId (subject — standard JWT claim)
  email: string;
  role: string;
  type: 'access' | 'refresh';
  iat?: number;
  exp?: number;
}

/** Pasangan token yang dikembalikan ke client */
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/** User object yang di-attach ke req.user oleh JwtAccessStrategy */
export interface UserFromToken {
  id: string;
  email: string;
  role: string;
  isActive: boolean;
  emailVerified: boolean;
}

/** Response body endpoint POST /auth/register */
export interface RegisterResponse {
  message: string;
  userId: string;
  email: string;
}

/** Konteks OTP yang di-generate untuk verifikasi email */
export interface OtpContext {
  plainOtp: string;       // OTP 6-digit yang dikirim via email
  otpHash: string;        // Hash OTP yang disimpan di database
  otpExpiresAt: Date;     // Waktu kedaluwarsa (now + 10 menit)
}
