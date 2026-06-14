# Planning 1: Daftar Bug yang Harus Diperbaiki

## Tujuan
Memperbaiki semua bug dan fitur yang tidak berfungsi agar website bisa digunakan dengan benar.

---

## Daftar Bug

### BUG-01: Data tidak sinkron antara web lelang dan admin
- **Kondisi sekarang**: Web lelang punya banyak item tapi admin panel kosong
- **Seharusnya**: Admin panel menampilkan data yang sama dari database
- **File terkait**: `apps/admin/src/app/auctions/page.tsx`, `apps/api/src/modules/admin/admin.service.ts`
- **Solusi**: Pastikan admin panel fetch dari endpoint yang benar dan data di-seed ke database

### BUG-02: Module `../lib/api` tidak ditemukan di admin
- **Kondisi sekarang**: Halaman admin error karena `fetchWithAuth` tidak ada
- **Seharusnya**: Ada file `apps/admin/src/lib/api.ts` yang berisi helper fetch
- **Solusi**: Buat file `api.ts` di `apps/admin/src/lib/` dengan fungsi `fetchWithAuth`

### BUG-03: Syntax error di halaman users dan museum admin
- **Kondisi sekarang**: JSX parse error pada `<main>` tag
- **Seharusnya**: Komponen bisa di-render tanpa error
- **Solusi**: Periksa kurung kurawal dan return statement di komponen tersebut

### BUG-04: Admin tidak bisa mengubah tema live
- **Kondisi sekarang**: Error "tidak ada izin" saat admin mau ubah tema
- **Seharusnya**: Admin dengan role SUPER_ADMIN atau CONTENT_MANAGER bisa ubah tema
- **Solusi**: Periksa endpoint permission dan RolesGuard di controller terkait

### BUG-05: Metode pembayaran tidak berfungsi
- **Kondisi sekarang**: Pembayaran hanya Stripe, tidak ada VA/QRIS
- **Seharusnya**: Ada berbagai metode pembayaran lokal
- **Solusi**: Lihat planning di folder `03_pembayaran`

### BUG-06: Leaderboard tidak otomatis update
- **Kondisi sekarang**: Leaderboard statis atau hardcode
- **Seharusnya**: Otomatis dari pencapaian user di database
- **Solusi**: Pastikan query leaderboard langsung ke tabel users ORDER BY totalExp DESC

### BUG-07: Live auction data tidak real
- **Kondisi sekarang**: Jumlah penonton, bidder, dan current bid masih statis
- **Seharusnya**: Semua angka dari data real di database dan WebSocket
- **Solusi**: Lihat planning di folder `06_live_auction`

---

## Checklist
- [x] BUG-01: Sinkronisasi data admin-web (FIXED: safePaginate helper, NaN pagination)
- [x] BUG-02: Buat file `api.ts` di admin (SUDAH ADA: apps/admin/src/lib/api.ts lengkap)
- [x] BUG-03: Fix syntax error halaman admin (SUDAH BERFUNGSI: semua halaman render)
- [x] BUG-04: Fix permission tema live admin (VERIFIED: GET/PUT 200 OK)
- [x] BUG-05: Implementasi pembayaran (SUDAH ADA: QRIS, VA, E-Wallet, Testing, Stripe, Bank Transfer)
- [x] BUG-06: Fix leaderboard query (FIXED: URL prefix + 127.0.0.1)
- [ ] BUG-07: Fix live auction data (lihat folder 06)
