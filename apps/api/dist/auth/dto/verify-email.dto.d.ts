/**
 * VerifyEmailDto — Validasi input POST /api/v1/auth/verify-email
 *
 * ─── Email ───────────────────────────────────────────────────
 * - Sama persis dengan email yang dipakai saat register
 * - Di-lowercase & trim otomatis (konsisten dengan RegisterDto)
 *
 * ─── OTP ─────────────────────────────────────────────────────
 * - Tepat 6 karakter
 * - Hanya boleh digit 0–9 (tidak boleh huruf atau simbol)
 * - Whitespace di-strip otomatis (UX: cegah salah copy-paste)
 */
export declare class VerifyEmailDto {
    email: string;
    otp: string;
}
//# sourceMappingURL=verify-email.dto.d.ts.map