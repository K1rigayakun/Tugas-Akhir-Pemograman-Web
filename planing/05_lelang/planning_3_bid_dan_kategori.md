# Planning 3: Perbaikan Tampilan Bid & Kategori Lengkap

## Tujuan
1. Memperbaiki tampilan pemasangan bid agar lebih menarik dan user-friendly
2. Menambahkan semua kategori item yang sering dilelangkan

---

## Perbaikan Tampilan Bid

### Masalah Sekarang
- Tampilan pemasangan bid kurang bagus dan tidak informatif

### Tampilan Bid yang Seharusnya
Komponen bid harus menampilkan:
- Harga saat ini (besar, jelas)
- Minimum bid selanjutnya (harga saat ini + increment)
- Input jumlah bid (dengan tombol +/- untuk cepat)
- Tombol "PASANG BID" yang besar dan menonjol
- Riwayat bid terakhir (5 bid terakhir)
- Jumlah bidder unik
- Timer countdown yang jelas
- Animasi saat ada bid baru masuk (highlight, confetti kecil)
- Notifikasi real-time "Anda telah di-outbid!"

---

## Daftar Kategori Lengkap

Semua kategori ini harus tersedia di database dan bisa dipilih admin:

### Barang Antik & Koleksi
- Lukisan & Seni Rupa
- Koin & Perangko
- Memorabilia & Vintage
- Artefak Sejarah
- Buku Langka & Manuskrip

### Perhiasan & Aksesoris
- Cincin & Gelang
- Kalung & Liontin
- Jam Tangan Mewah
- Permata & Batu Mulia

### Kendaraan
- Mobil Klasik
- Mobil Sport & Supercar
- Motor Custom
- Sepeda Premium

### Elektronik & Gadget
- Smartphone & Tablet
- Laptop & PC Gaming
- Kamera & Lensa
- Konsol Game & Retro Gaming
- Audio High-End

### Fashion & Lifestyle
- Tas Branded
- Sepatu Limited Edition
- Pakaian Designer
- Parfum Langka

### Olahraga & Outdoor
- Jersey Bertandatangan
- Perlengkapan Golf Premium
- Alat Fitness Premium

### Properti & Investasi
- Properti Mewah
- NFT & Digital Art
- Wine & Spirits Langka

### Mainan & Hobi
- Action Figure Langka
- LEGO Collector Edition
- Model Kit & Diecast
- Trading Card (Pokemon, YuGiOh, MTG)

### Alat Musik
- Gitar Vintage
- Piano & Keyboard
- Instrumen Klasik

### Lainnya
- Perabot Antik
- Alat Tulis Premium
- Tanaman Hias Langka

---

## Checklist
- [ ] Redesign komponen Bid Panel
- [ ] Tambahkan animasi untuk bid baru
- [ ] Implementasi real-time outbid notification
- [ ] Seed semua kategori ke database
- [ ] Buat halaman admin untuk kelola kategori
- [ ] Test tampilan bid di mobile dan desktop
