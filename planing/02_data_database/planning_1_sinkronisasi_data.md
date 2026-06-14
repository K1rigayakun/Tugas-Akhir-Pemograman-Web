# Planning 1: Sinkronisasi Data Website dan Admin

## Tujuan
Memastikan semua data yang ditampilkan di website lelang DAN admin panel berasal dari database PostgreSQL yang sama. Tidak ada data hardcode.

---

## Yang Harus Dilakukan

### 1. Audit semua halaman web dan admin
Periksa setiap halaman apakah data-nya dari API (database) atau hardcode di frontend.

**Halaman Web yang harus dicek:**
- Homepage (`apps/web/src/app/page.tsx`) — featured auctions, berita, statistik
- Halaman Auction (`apps/web/src/app/auction/`) — daftar item lelang
- Leaderboard (`apps/web/src/app/leaderboard/`) — ranking user
- Museum (`apps/web/src/app/museum/`) — item yang di-feature
- Shop (`apps/web/src/app/shop/`) — item di toko
- Profile (`apps/web/src/app/profile/`) — data user

**Halaman Admin yang harus dicek:**
- Dashboard (`apps/admin/src/app/page.tsx`) — statistik
- Auctions (`apps/admin/src/app/auctions/`) — daftar lelang
- Users (`apps/admin/src/app/users/`) — daftar user
- Finance (`apps/admin/src/app/finance/`) — transaksi

### 2. Perbaiki flow data
Semua data harus mengikuti alur ini:
```
Database (PostgreSQL) → API (NestJS) → Frontend (Next.js)
```

Jangan pernah:
- Hardcode daftar item di frontend
- Buat data dummy di komponen React
- Bypass API langsung ke database dari frontend

### 3. Pastikan API endpoint lengkap
Setiap data yang ditampilkan harus punya endpoint API:
- `GET /api/auctions` — daftar lelang aktif
- `GET /api/auctions/:id` — detail lelang
- `GET /api/leaderboard` — ranking user
- `GET /api/admin/auctions` — daftar lelang untuk admin
- `GET /api/admin/users` — daftar user untuk admin
- `GET /api/admin/dashboard` — statistik dashboard

---

## Checklist
- [x] Audit halaman web — semua halaman sudah pakai serverGetApi / fetchApi
- [x] Audit halaman admin — semua halaman sudah pakai fetchWithAuth
- [x] Pastikan semua endpoint API tersedia — 11+ endpoints verified 200 OK
- [x] Ganti semua hardcode dengan fetch ke API — demo.ts tidak lagi di-import
- [ ] Test: Data yang ditambah via admin muncul di web
- [ ] Test: Data yang dihapus via admin hilang dari web
