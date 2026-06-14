# Planning 1: Sistem Pembayaran Lengkap

## Tujuan
Membuat sistem pembayaran yang berfungsi penuh dengan berbagai metode pembayaran lokal Indonesia dan metode testing.

---

## Metode Pembayaran yang Harus Ada

### 1. QRIS (QR Code Indonesia Standard)
- Saat user pilih QRIS, tampilkan QR code yang bisa di-zoom dan di-download
- QR code di-generate oleh backend (bisa pakai library `qrcode`)
- Ada countdown timer (misal 15 menit) untuk expired
- Ada tombol "Saya Sudah Bayar" yang cek status pembayaran
- Tampilan: Gambar QR besar di tengah, nominal di atas, timer di bawah

### 2. Virtual Account (VA)
- Saat user pilih VA, generate nomor VA random (16 digit)
- Tersedia bank: BCA, BNI, Mandiri, BRI, Permata
- Tampilkan nomor VA yang bisa di-copy ke clipboard
- Ada panduan langkah-langkah pembayaran per bank
- Ada countdown timer untuk expired

### 3. E-Wallet
- GoPay, OVO, Dana, ShopeePay, LinkAja
- Redirect ke aplikasi atau tampilkan deep link
- Atau tampilkan QR code spesifik e-wallet

### 4. Kartu Kredit/Debit
- Menggunakan Stripe yang sudah ada
- Tampilkan form kartu yang aman (Stripe Elements)

### 5. Transfer Bank Manual
- Tampilkan nomor rekening platform
- User upload bukti transfer
- Admin approve manual di panel admin

### 6. Metode Testing (BARU - PENTING)
- Metode khusus untuk demonstrasi dan testing
- Saat user pilih "Testing Payment", langsung buat request top-up
- Request ini masuk ke panel admin
- Admin harus approve/reject di halaman admin khusus
- Setelah admin approve, saldo user langsung bertambah
- Flow: User pilih Testing → Admin approve → Saldo masuk

---

## Arsitektur Backend

### Model database (tambah ke schema.prisma jika belum ada)
```
TopUpRequest:
  - id
  - userId (FK ke users)
  - amount (jumlah CC)
  - fiatAmount (jumlah rupiah)
  - method (QRIS/VA/EWALLET/CARD/TRANSFER/TESTING)
  - provider (BCA/BNI/GOPAY/dll)
  - status (PENDING/APPROVED/REJECTED/EXPIRED)
  - paymentCode (nomor VA/session ID)
  - reviewedBy (admin yang approve)
  - createdAt
  - expiresAt
```

### Endpoint API
- `POST /api/payment/create` — Buat request pembayaran baru
- `GET /api/payment/status/:id` — Cek status pembayaran
- `GET /api/payment/methods` — Daftar metode yang tersedia
- `POST /api/admin/payment/approve/:id` — Admin approve
- `POST /api/admin/payment/reject/:id` — Admin reject
- `GET /api/admin/payment/pending` — Daftar pending di admin

---

## Tampilan Frontend

### Halaman Top Up (`apps/web/src/app/topup/`)
1. User pilih jumlah CC yang mau dibeli (50, 100, 500, 1000, atau custom)
2. Tampilkan harga dalam Rupiah
3. User pilih metode pembayaran (grid card yang bisa dipilih)
4. Setelah pilih metode, tampilkan panduan spesifik:
   - QRIS → QR Code + timer + tombol download
   - VA → Nomor VA + instruksi bank + tombol copy
   - Testing → Pesan "Menunggu persetujuan admin" + status real-time

### Halaman Admin Approval (`apps/admin/src/app/topups/`)
- Tabel daftar top-up request pending
- Tombol Approve (hijau) dan Reject (merah) per request
- Tampilkan info user, jumlah, metode, waktu request

---

## Checklist
- [ ] Buat/update model TopUpRequest di schema.prisma
- [ ] Buat endpoint payment lengkap di backend
- [ ] Buat halaman top up di web dengan pilihan metode
- [ ] Implementasi generate QR code untuk QRIS
- [ ] Implementasi generate nomor VA random
- [ ] Implementasi metode Testing
- [ ] Buat halaman admin approval top-up
- [ ] Test end-to-end: User request → Admin approve → Saldo bertambah
