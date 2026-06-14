# Planning 1: Fitur Admin Panel Lengkap

## Tujuan
Melengkapi semua fitur admin agar bisa mengontrol seluruh aspek platform.

---

## Fitur Admin yang Harus Ada

### 1. Dashboard
- Statistik real-time: total user, total auction aktif, total bid hari ini, revenue
- Grafik tren (7 hari/30 hari): user baru, transaksi, bid
- Alert: KYC pending, top-up pending, laporan user

### 2. Kelola User (sudah ada, perlu ditingkatkan)
- Cari user berdasarkan username/email
- Lihat detail lengkap user (profil, transaksi, bid history)
- Suspend/ban/warning user
- Reset password user
- Ubah rank user (dengan alasan di audit log)

### 3. Kelola Lelang (sudah ada, perlu ditingkatkan)
- Buat lelang baru dengan semua field yang lengkap
- Upload gambar/video/3D model
- Set harga awal, increment, waktu mulai/selesai
- Set rank minimum untuk exclusive auction
- Set sebagai event auction
- Edit/batalkan lelang

### 4. Kelola Kategori
- CRUD kategori item
- Atur urutan kategori
- Aktifkan/nonaktifkan kategori

### 5. Kelola Live Auction
- Jadwalkan live auction
- Mulai/jeda/akhiri live
- Ubah tema live (TANPA error permission)
- Kelola antrian item

### 6. Kelola Pembayaran & Top-Up
- Lihat daftar top-up pending
- Approve/reject top-up (terutama metode Testing)
- Riwayat semua transaksi pembayaran
- Proses refund manual

### 7. Kelola Cosmetic (perlu ditingkatkan)
- Tambah cosmetic baru dengan DETAIL LENGKAP:
  - Nama, deskripsi, gambar thumbnail, preview
  - Tier/rarity
  - Metode perolehan (shop/achievement/rank/event)
  - Jika dari SHOP: harga CC
  - Jika dari ACHIEVEMENT: pilih achievement mana, atau buat achievement baru
  - Jika dari EVENT: pilih event mana, cara dapatnya
  - Jika dari RANK: rank berapa
- Upload kode folder customization (lihat folder 10_web_customization)
- Download folder cosmetic sebagai ZIP
- Edit/nonaktifkan/hapus cosmetic (dengan pesan ke user jika global)

### 8. Kelola Achievement (perlu ditingkatkan)
- Tambah achievement baru dengan:
  - Nama, deskripsi, tier
  - Trigger event dan kondisi (logika)
  - Reward: EXP, title, cosmetic
  - Upload kode folder efek animasi achievement
- Jika saat tambah cosmetic butuh achievement baru, ada link ke form tambah achievement
- Edit/nonaktifkan achievement

### 9. Kelola Event
- Buat event baru: nama, tema, waktu, EXP multiplier
- Upload aset visual event
- Buat achievement event eksklusif
- Buat cosmetic event eksklusif
- Upload kode folder tampilan event

### 10. Kelola Konten
- Banner homepage
- Berita/pengumuman
- FAQ
- Rekomendasi admin (item yang di-highlight)
- Quest harian/mingguan

### 11. Keamanan
- IP whitelist/blacklist
- Log audit (read-only)
- Deteksi multi-akun
- Review laporan user

---

## Checklist
- [ ] Perbaiki dashboard statistik dari data real
- [ ] Lengkapi form tambah cosmetic dengan metode perolehan detail
- [ ] Tambahkan link "Buat Achievement Baru" di form cosmetic
- [ ] Buat fitur upload & download folder code
- [ ] Buat halaman admin kelola kategori
- [ ] Buat halaman admin kelola quest
- [ ] Lengkapi fitur approve/reject top-up
- [ ] Test semua fitur admin end-to-end
