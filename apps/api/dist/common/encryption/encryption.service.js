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
exports.EncryptionService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const crypto_1 = require("crypto");
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
let EncryptionService = class EncryptionService {
    constructor(configService) {
        this.configService = configService;
        const keyHex = this.configService.get("ENCRYPTION_KEY");
        if (!keyHex || keyHex.length !== 64) {
            throw new Error("ENCRYPTION_KEY harus 64 karakter hex (32 bytes). " +
                "Generate dengan: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"");
        }
        this.key = Buffer.from(keyHex, "hex");
    }
    /**
     * Enkripsi teks sebelum disimpan ke database.
     * @param plaintext - Teks asli yang akan dienkripsi
     * @returns String dalam format "iv:authTag:ciphertext" (hex)
     */
    encrypt(plaintext) {
        const iv = (0, crypto_1.randomBytes)(16);
        const cipher = (0, crypto_1.createCipheriv)("aes-256-gcm", this.key, iv);
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
    decrypt(encryptedText) {
        const parts = encryptedText.split(":");
        if (parts.length !== 3) {
            throw new Error("Format encrypted text tidak valid. Harus iv:authTag:ciphertext");
        }
        const [ivHex, authTagHex, ciphertext] = parts;
        const iv = Buffer.from(ivHex, "hex");
        const authTag = Buffer.from(authTagHex, "hex");
        const decipher = (0, crypto_1.createDecipheriv)("aes-256-gcm", this.key, iv);
        decipher.setAuthTag(authTag);
        let decrypted = decipher.update(ciphertext, "hex", "utf8");
        decrypted += decipher.final("utf8");
        return decrypted;
    }
    /**
     * Hash satu arah — untuk data yang perlu dicari tapi tidak perlu didekripsi.
     * Contoh: nationalId untuk cek duplikasi (1 NIK = 1 akun).
     */
    hash(plaintext) {
        const salt = this.configService.get("ENCRYPTION_KEY").slice(0, 32);
        return (0, crypto_1.scryptSync)(plaintext, salt, 32).toString("hex");
    }
};
exports.EncryptionService = EncryptionService;
exports.EncryptionService = EncryptionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EncryptionService);
//# sourceMappingURL=encryption.service.js.map