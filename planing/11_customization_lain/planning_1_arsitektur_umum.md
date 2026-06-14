# Planning 1: Sistem Customization Lain (Profile, Border, Name, dll)

## Tujuan
Membangun sistem customization untuk elemen-elemen selain web theme: border profil, name card, kartu CC, nama effect, dll. Konsepnya mirip web customization — masing-masing punya folder sendiri.

---

## Konsep

### Sama seperti web customization:
- Setiap cosmetic type punya folder masing-masing
- User pilih yang mana yang aktif
- Jika tidak valid → fallback ke default
- Jika user punya customization profil terpisah → pakai itu
- Jika tidak punya → pakai yang ada di web customization yang dipilih

### Hierarki Pemilihan
```
1. Cek apakah user punya customization spesifik (misal: border profil X)
2. Jika ya → pakai itu
3. Jika tidak → cek web customization yang dipilih user
4. Ambil border profil dari web customization tersebut
5. Jika web customization tidak punya → pakai default
```

---

## Tipe Customization

### 1. Border/Frame Profil
- Folder: `customization/frame/`
- Menampilkan border di sekitar foto profil
- Preview: foto profil user dengan border diterapkan
- Tier rendah: border warna solid
- Tier tinggi: border animasi (api, kristal, dll)

### 2. Name Effect
- Folder: `customization/name_effect/`
- Efek pada nama user (glow, warna, animasi)
- Tier rendah: warna nama berbeda
- Tier tinggi: nama berkilau, efek api, dll

### 3. Wallet Skin
- Folder: `customization/wallet_skin/`
- Tampilan kartu Crown Coin (WalletCard3D)
- Tier rendah: warna kartu berbeda
- Tier tinggi: kartu 3D dengan efek khusus

### 4. Chat Effect
- Folder: `customization/chat_effect/`
- Efek saat user chat di live auction
- Tier rendah: warna chat berbeda
- Tier tinggi: animasi di sekitar pesan chat

### 5. Banner Profil
- Folder: `customization/banner/`
- Background banner di halaman profil
- Bisa gambar statis atau animasi

---

## Tampilan di Halaman Pengaturan

Setiap item customization harus punya:
- Thumbnail gambar
- Nama item
- Tier/rarity badge
- Deskripsi singkat apa yang berubah
- Preview visual (misal frame ditampilkan di foto profil user)
- Tombol "Aktifkan" / "Nonaktifkan"

---

## Checklist
- [ ] Buat struktur folder untuk setiap tipe customization
- [ ] Buat loader yang membaca folder dan apply ke elemen yang benar
- [ ] Implementasi hierarki pemilihan (spesifik → web theme → default)
- [ ] Buat halaman pengaturan untuk pilih cosmetic aktif
- [ ] Tampilkan preview visual untuk setiap cosmetic
- [ ] Buat minimal 2 variasi per tipe cosmetic
- [ ] Test: user pilih frame → foto profil berubah border
