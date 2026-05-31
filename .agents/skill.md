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

### 2026-05-30 — Audit & Perbaikan Kritis

**Situasi:** Audit jujur mengungkap banyak gap kritis

**Temuan KRITIS:**
- **SELALU gunakan `prisma.$transaction()`** untuk operasi yang melibatkan beberapa tabel (refund, cancel auction, dll). Tanpa ini, data bisa corrupt kalau gagal di tengah
- **AuthGuard WAJIB dijalankan sebelum RolesGuard** — urutan di `@UseGuards()` penting. AuthGuard set `req.user`, RolesGuard cek `req.user.adminRole`
- **JANGAN pakai `@Body() body: any`** — selalu pakai DTO dengan class-validator. Input user TIDAK BISA dipercaya
- **ThrottlerGuard harus global** — pakai `APP_GUARD` di module, bukan per-controller. Kalau per-controller, endpoint yang lupa akan terbuka
- **banFromAuction harus benar-benar melakukan sesuatu** — audit log saja TIDAK CUKUP. Harus ada flag di database
- **Agora token HMAC biasa TIDAK AKAN diterima Agora** — harus pakai builder yang benar dengan privilege system
- **Redis Adapter wajib di-setup** kalau mau scale WebSocket — `Map<>` hilang saat restart
- **Tailwind WAJIB ada tailwind.config.js dan postcss.config.js** di setiap Next.js app

**Pola yang Benar:**
```typescript
// BENAR: $transaction untuk operasi multi-tabel
await prisma.$transaction(async (tx) => {
  await tx.auction.update({ ... });
  await tx.bid.update({ ... });
  await tx.walletAccount.update({ ... });
});

// SALAH: sequential tanpa transaction
await prisma.auction.update({ ... });
await prisma.bid.update({ ... }); // kalau ini gagal, auction udah ke-update
```

**Berlaku untuk:** Seluruh backend

