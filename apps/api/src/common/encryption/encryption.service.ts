import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
} from "crypto";

/**
 * EncryptionService — Enkripsi/dekripsi data sensitif (KYC, phantom bid)
 *
 * Menggunakan AES-256-GCM yang menyediakan:
 * - Enkripsi (kerahasiaan data)
 * - Authentication tag (integritas data — tahu kalau data dimodifikasi)
 *
 * Format output: iv:authTag:encryptedData (semua dalam hex)
 * ENCRYPTION_KEY disimpan di environment variable — tidak pernah di kode.
 */
@Injectable()
export class EncryptionService {
  private readonly key: Buffer;

  constructor(private configService: ConfigService) {
    const keyHex = this.configService.get<string>("ENCRYPTION_KEY");
    if (!keyHex || keyHex.length !== 64) {
      throw new Error(
        "ENCRYPTION_KEY harus 64 karakter hex (32 bytes). " +
          "Generate dengan: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"",
      );
    }
    this.key = Buffer.from(keyHex, "hex");
  }

  /**
   * Enkripsi teks sebelum disimpan ke database.
   * @param plaintext - Teks asli yang akan dienkripsi
   * @returns String dalam format "iv:authTag:ciphertext" (hex)
   */
  encrypt(plaintext: string): string {
    const iv = randomBytes(16);
    const cipher = createCipheriv("aes-256-gcm", this.key, iv);

    let encrypted = cipher.update(plaintext, "utf8", "hex");
    encrypted += cipher.final("hex");

    const authTag = cipher.getAuthTag().toString("hex");

    // Format: iv:authTag:ciphertext
    return `${iv.toString("hex")}:${authTag}:${encrypted}`;
  }

  /**
   * Dekripsi teks setelah diambil dari database.
   * @param encryptedText - String dalam format "iv:authTag:ciphertext" (hex)
   * @returns Teks asli yang sudah didekripsi
   */
  decrypt(encryptedText: string): string {
    const parts = encryptedText.split(":");
    if (parts.length !== 3) {
      throw new Error("Format encrypted text tidak valid. Harus iv:authTag:ciphertext");
    }

    const [ivHex, authTagHex, ciphertext] = parts;

    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");
    const decipher = createDecipheriv("aes-256-gcm", this.key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(ciphertext, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  }

  /**
   * Hash satu arah — untuk data yang perlu dicari tapi tidak perlu didekripsi.
   * Contoh: nationalId untuk cek duplikasi (1 NIK = 1 akun).
   */
  hash(plaintext: string): string {
    const salt = this.configService.get<string>("ENCRYPTION_KEY")!.slice(0, 32);
    return scryptSync(plaintext, salt, 32).toString("hex");
  }
}
