# Planning 1: Perbaikan Tampilan Profil User

## Tujuan
Membuat tampilan profil user yang menarik, informatif, dan sesuai dengan fitur customization.

---

## Layout Profil

### Header Profil
- Foto profil (bisa upload: JPG, PNG, GIF untuk rank tertentu, atau URL)
- Border/frame profil (sesuai cosmetic yang dipilih)
- Username dengan name effect (jika punya)
- Rank badge + level progression bar
- Total EXP saat ini
- Gelar/title aktif
- Status online/offline
- Tombol edit profil (jika profil sendiri)

### Info Section
- Statistik: Total bid, total win, win streak, longest streak
- Tanggal bergabung
- Win rate percentage

### Showcase Section (bisa di-custom user)
- Achievement yang dipilih untuk ditampilkan (user pilih mana yang ditampilkan)
- Item lelang yang dimenangkan (user pilih mana yang ditampilkan)
- Koleksi cosmetic yang dimiliki (user pilih mana yang ditampilkan)

### Pengaturan Privasi Profil
User bisa mengatur:
- Mode PUBLIC: semua orang bisa lihat semua
- Mode ANONYMOUS: nama ditampilkan sebagai nama anonim medieval
- Mode SHADOW: profil tidak bisa dilihat orang lain sama sekali

### Daftar Nama Anonim Medieval
Nama random bertema medieval:
- "The Silent Knight"
- "Shadow of Dusk"
- "The Iron Vassal"
- "Crimson Herald"
- "The Veiled Pilgrim"
- dll (minimal 50 variasi)

---

## Upload Foto Profil
- Format: JPG, PNG, WebP
- GIF: hanya untuk rank DUKE ke atas
- URL: bisa masukkan URL gambar dari internet
- Max size: 5MB
- Auto-crop ke square (1:1)
- Upload ke Cloudflare R2 / Storage Service

---

## Tampilan Cosmetic di Profil
Setiap item cosmetic harus punya:
- Thumbnail preview
- Nama item
- Tier/rarity dengan warna badge
- Deskripsi singkat
- Preview visual (misal border profile ditampilkan di foto profil user sebagai demo)

---

## Checklist
- [ ] Redesign halaman profil dengan layout baru
- [ ] Implementasi upload foto profil (JPG, PNG, GIF, URL)
- [ ] Buat showcase section yang bisa di-custom user
- [ ] Implementasi mode privasi (PUBLIC, ANONYMOUS, SHADOW)
- [ ] Buat daftar nama anonim medieval (50+ variasi)
- [ ] Tampilkan thumbnail dan preview cosmetic
- [ ] Tampilkan progression bar rank dan EXP
- [ ] Test profil dengan berbagai kombinasi setting
