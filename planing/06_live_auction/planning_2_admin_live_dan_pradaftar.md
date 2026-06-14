# Planning 2: Admin Bisa Live & Pra-Daftar Lelang

## Tujuan
1. Admin bisa memulai dan mengelola live auction
2. Sistem pra-daftar (pre-register) untuk live auction

---

## Admin Live Auction

### Yang Harus Bisa Dilakukan Admin
- Memulai live auction (ubah status UPCOMING → ACTIVE)
- Mengubah tema live auction (warna, background, efek)
- Menampilkan item satu per satu selama live
- Memperpanjang timer jika diperlukan
- Menutup/membatalkan live auction
- Melihat daftar penonton dan bidder real-time

### Halaman Admin Live Control
```
┌──────────────────────────────────────┐
│ LIVE CONTROL PANEL                   │
│                                      │
│ Status: [AKTIF]  Penonton: 127       │
│ Item Saat Ini: Pedang Arthur         │
│ Bid Tertinggi: 5,000 CC (Knight42)   │
│                                      │
│ [Mulai Live] [Jeda] [Akhiri]         │
│ [Ganti Item] [Perpanjang Timer]      │
│ [Ubah Tema]                          │
│                                      │
│ Antrian Item:                        │
│ 1. ✅ Pedang Arthur (sedang)         │
│ 2. ⏳ Mahkota Emas                   │
│ 3. ⏳ Baju Zirah Silver              │
└──────────────────────────────────────┘
```

### Fix Izin Tema
- Masalah: Admin tidak bisa ubah tema, error permission
- Solusi: Pastikan endpoint `PUT /api/admin/live/theme` punya guard yang benar
- Role yang boleh: SUPER_ADMIN, AUCTION_MANAGER, CONTENT_MANAGER

---

## Sistem Pra-Daftar Live Auction

### Flow
1. Admin jadwalkan live auction dengan waktu mulai
2. User bisa pra-daftar (klik "Ingatkan Saya")
3. Sistem kirim notifikasi 30 menit dan 5 menit sebelum mulai
4. Saat live dimulai, user yang pra-daftar otomatis dapat push notification

### Halaman Pra-Daftar
Sebelum live dimulai, tampilkan:
- Nama live auction
- Tema (opsional)
- Siapa host/pembawa lelang
- Kapan dimulai (countdown)
- Daftar item yang akan dilelang
- Tombol "Pra-Daftar / Ingatkan Saya"
- Jumlah user yang sudah pra-daftar

---

## Checklist
- [ ] Buat halaman Admin Live Control
- [ ] Fix permission untuk ubah tema live
- [ ] Implementasi tombol Start/Pause/End live
- [ ] Buat fitur pra-daftar live auction
- [ ] Kirim notifikasi ke user yang pra-daftar
- [ ] Tampilkan halaman waiting room sebelum live mulai
