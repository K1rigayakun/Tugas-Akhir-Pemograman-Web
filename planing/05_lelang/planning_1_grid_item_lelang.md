# Planning 1: Perbaikan Grid & Layout Item Lelang

## Tujuan
Memperbaiki tampilan grid item lelang agar rapi, dinamis, dan responsive.

---

## Masalah Sekarang
- Widget item terlalu kecil dan susunannya aneh
- Tidak dinamis / tidak mengikuti ukuran layar
- Tidak bisa di-scroll horizontal

## Aturan Layout Baru

### Desktop (Layar Lebar)
- Maksimal **5 item per baris** ke samping
- Maksimal **3 baris** ke bawah sebelum scroll
- Pengisian: ke samping dulu → kalau sudah 5, baru ke bawah
- Jika total item > 15 (5x3), bisa di-scroll horizontal
- Jumlah item per baris harus SAMA (ratakan distribusinya)

### Contoh Distribusi
```
6 item  → 3 | 3         (2 baris, masing-masing 3)
10 item → 5 | 5         (2 baris, masing-masing 5)
12 item → 4 | 4 | 4     (3 baris, masing-masing 4)
15 item → 5 | 5 | 5     (3 baris, masing-masing 5)
20 item → 5 | 5 | 5 | 5 (4 baris tapi bisa scroll, tampil 3 baris)
```

### Logika Pembagian Baris
```
Jika item habis dibagi 2 → 2 baris
Jika item habis dibagi 3 → 3 baris
Jika tidak habis → bulatkan ke atas, bagi rata
Maksimal per baris tetap 5
```

### Kartu Item Lelang
Setiap kartu harus menampilkan:
- Gambar item (ratio 4:3 atau 1:1)
- Nama item
- Harga saat ini / harga awal
- Timer countdown (sisa waktu)
- Jumlah bidder
- Badge kategori / rarity
- Badge khusus (LIVE, EXCLUSIVE, EVENT) jika ada

---

## Checklist
- [ ] Buat komponen `AuctionGrid` dengan logika distribusi baris
- [ ] Buat komponen `AuctionCard` yang rapi dan informatif
- [ ] Implementasi horizontal scroll jika item > 15
- [ ] Responsive: tablet (3 per baris), mobile (2 per baris)
- [ ] Test dengan berbagai jumlah item (1, 5, 10, 15, 20, 30)
