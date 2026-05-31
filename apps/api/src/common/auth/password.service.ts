import { Injectable } from "@nestjs/common";
import * as argon2 from "argon2";

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
@Injectable()
export class PasswordService {
  /**
   * Hash password sebelum disimpan ke database.
   *
   * Argon2id default settings sudah cukup kuat:
   * - Memory: 65536 KiB (64 MB)
   * - Iterations: 3
   * - Parallelism: 4
   */
  async hash(password: string): Promise<string> {
    return argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });
  }

  /**
   * Verifikasi password yang diinput user dengan hash di database.
   * Otomatis menangani timing-safe comparison.
   */
  async verify(hash: string, password: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, password);
    } catch {
      // Kalau hash corrupt atau format salah, return false
      return false;
    }
  }

  /**
   * Cek apakah hash perlu di-rehash (misalnya parameter berubah).
   * Dipanggil setiap login berhasil — kalau perlu rehash, update di database.
   */
  async needsRehash(hash: string): Promise<boolean> {
    return argon2.needsRehash(hash, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });
  }
}
