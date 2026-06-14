# Planning 2: Pemisahan Kategori Lelang

## Tujuan
Memisahkan tampilan lelang berdasarkan tipe, bukan mencampur semuanya dalam satu halaman.

---

## Kategori yang Harus Dipisah

### 1. Lelang Biasa (Standard/Scheduled)
- Bisa dilihat semua user
- Halaman utama `/auction`
- Filter: kategori item, harga, waktu

### 2. Lelang Live
- Halaman terpisah `/auction/live`
- Tampilkan daftar live yang sedang berlangsung dan yang akan datang
- Badge "LIVE NOW" untuk yang sedang aktif
- Badge "SEGERA" untuk yang akan mulai dalam 24 jam

### 3. Lelang Eksklusif (Rank-Exclusive)
- Halaman terpisah `/auction/exclusive`
- Dipisahkan per rank requirement
- User hanya bisa lihat dan bid jika rank-nya memenuhi
- Tampilkan label rank minimum (misal "Khusus Duke ke atas")
- Item yang rank-nya belum tercapai ditampilkan tapi dengan overlay lock

### 4. Lelang Event
- Halaman terpisah `/auction/event`
- Hanya muncul saat ada event aktif
- Selalu ditampilkan paling atas di homepage
- Semua rank bisa ikut (event terbuka untuk semua)

---

## Navigasi Sub-Menu Lelang
```
[Lelang] → Dropdown:
  - Semua Lelang
  - Lelang Live
  - Lelang Eksklusif
  - Lelang Event (hanya muncul saat ada event)
```

## Sistem Rekomendasi
- Event selalu paling atas
- Live yang sedang berlangsung di bawah event
- Rekomendasi berdasarkan kategori yang sering dilihat user
- Atribut filter: live/tidak, rank requirement, event, kategori item

---

## Checklist
- [ ] Buat halaman `/auction/live`
- [ ] Buat halaman `/auction/exclusive`
- [ ] Buat halaman `/auction/event`
- [ ] Pisahkan query di backend berdasarkan tipe
- [ ] Implementasi filter rank untuk exclusive
- [ ] Tambahkan sub-menu navigasi lelang
- [ ] Buat sistem rekomendasi otomatis
