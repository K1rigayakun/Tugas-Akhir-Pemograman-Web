import { ConfigService } from "@nestjs/config";
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
export declare class EncryptionService {
    private configService;
    private readonly key;
    constructor(configService: ConfigService);
    /**
     * Enkripsi teks sebelum disimpan ke database.
     * @param plaintext - Teks asli yang akan dienkripsi
     * @returns String dalam format "iv:authTag:ciphertext" (hex)
     */
    encrypt(plaintext: string): string;
    /**
     * Dekripsi teks setelah diambil dari database.
     * @param encryptedText - String dalam format "iv:authTag:ciphertext" (hex)
     * @returns Teks asli yang sudah didekripsi
     */
    decrypt(encryptedText: string): string;
    /**
     * Hash satu arah — untuk data yang perlu dicari tapi tidak perlu didekripsi.
     * Contoh: nationalId untuk cek duplikasi (1 NIK = 1 akun).
     */
    hash(plaintext: string): string;
}
//# sourceMappingURL=encryption.service.d.ts.map