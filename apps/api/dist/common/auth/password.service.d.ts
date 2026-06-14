/**
 * PasswordService — Hash dan verifikasi password menggunakan Argon2id.
 *
 * Argon2id dipilih karena:
 * - Pemenang Password Hashing Competition
 * - Tahan terhadap GPU attacks (memory-hard)
 * - Tahan terhadap side-channel attacks (Argon2id varian)
 *
 * JANGAN gunakan bcrypt, scrypt, atau SHA — semua sudah inferior.
 */
export declare class PasswordService {
    /**
     * Hash password sebelum disimpan ke database.
     *
     * Argon2id default settings sudah cukup kuat:
     * - Memory: 65536 KiB (64 MB)
     * - Iterations: 3
     * - Parallelism: 4
     */
    hash(password: string): Promise<string>;
    /**
     * Verifikasi password yang diinput user dengan hash di database.
     * Otomatis menangani timing-safe comparison.
     */
    verify(hash: string, password: string): Promise<boolean>;
    /**
     * Cek apakah hash perlu di-rehash (misalnya parameter berubah).
     * Dipanggil setiap login berhasil — kalau perlu rehash, update di database.
     */
    needsRehash(hash: string): Promise<boolean>;
}
//# sourceMappingURL=password.service.d.ts.map