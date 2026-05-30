# Emerald Kingdom — Skill Log

## Cara Update
Update file ini setiap kali ada:
- Error yang butuh waktu lama untuk debug
- Cara yang lebih efisien ditemukan
- Library/tool yang bermasalah
- Pattern berguna yang bisa dipakai ulang

## Log Entries

### 2026-05-30 — Setup Monorepo Awal

**Situasi:** Setup monorepo Turborepo dari nol

**Temuan:**
- Prisma client singleton pattern wajib dipakai di Next.js supaya tidak ada multiple instance saat hot reload
- `transpilePackages` di next.config.js wajib untuk workspace packages
- CSS variables untuk warna HARUS didefinisikan di globals.css, bukan di komponen individual
- Migration file yang sudah ada TIDAK BOLEH diedit — selalu buat baru

**Berlaku untuk:** Seluruh project

### 2026-05-30 — Enkripsi Data KYC

**Situasi:** Implementasi enkripsi untuk data sensitif KYC

**Temuan:**
- Format encrypted: `iv:authTag:ciphertext` (semua hex)
- ENCRYPTION_KEY harus 64 karakter hex (32 bytes)
- Generate key: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- nationalId di-hash satu arah untuk cek duplikasi (1 NIK = 1 akun)
- Dekripsi bisa gagal kalau key berubah — handle error-nya

**Berlaku untuk:** `apps/api/src/common/encryption/`

### 2026-05-30 — Append-Only Tables

**Situasi:** Implementasi constraint untuk wallet_transactions dan audit_logs

**Temuan:**
- Gunakan PostgreSQL trigger BEFORE UPDATE/DELETE yang RAISE EXCEPTION
- Trigger harus dijalankan via migration SQL manual (bukan Prisma schema)
- File migration ada di `packages/db/migrations/00_append_only_constraints/`

**Berlaku untuk:** `packages/db/migrations/`
