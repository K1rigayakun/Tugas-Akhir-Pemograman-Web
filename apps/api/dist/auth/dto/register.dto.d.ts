/**
 * RegisterDto — Validasi input endpoint POST /api/v1/auth/register
 *
 * Aturan validasi:
 * ─── Email ──────────────────────────────────────────────────────
 * - Format email yang valid (RFC 5322)
 * - Di-lowercase & di-trim secara otomatis via @Transform
 * - Maks 255 karakter (batas umum DB varchar)
 *
 * ─── Password ───────────────────────────────────────────────────
 * - Min 8 karakter, maks 72 karakter
 *   (72 karakter adalah batas bcrypt; Argon2 tidak punya batas,
 *    tapi kita batasi untuk mencegah DoS via password sangat panjang)
 * - Wajib mengandung: huruf besar, huruf kecil, angka, simbol
 * - Tidak boleh mengandung spasi
 *
 * ─── ConfirmPassword ─────────────────────────────────────────────
 * - Wajib sama dengan field `password`
 * - Divalidasi dengan custom @Match decorator
 */
export declare class RegisterDto {
    email: string;
    password: string;
    confirmPassword: string;
}
//# sourceMappingURL=register.dto.d.ts.map