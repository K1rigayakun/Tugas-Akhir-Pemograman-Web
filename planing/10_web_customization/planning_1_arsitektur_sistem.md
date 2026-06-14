# Planning 1: Arsitektur Sistem Web Customization

## Tujuan
Membangun sistem customization web yang memungkinkan setiap user menggunakan tampilan website yang berbeda berdasarkan pilihan mereka.

---

## Konsep Utama

### Bagaimana Sistem Ini Bekerja
1. Semua kode tampilan disimpan dalam folder-folder terpisah
2. Ada satu folder `default` yang merupakan tampilan website saat ini
3. Setiap folder customization punya CSS, JS, animasi, dan aset sendiri
4. Saat user memilih customization tertentu, website membaca file dari folder yang dipilih
5. Jika folder tidak valid atau ada error, otomatis kembali ke folder default

### Struktur Folder
```
public/
└── tampilan/
    ├── default/                    ← Tampilan website saat ini
    │   ├── index.css
    │   ├── index.js
    │   ├── assets/
    │   └── events/
    │       ├── default/            ← Event default
    │       ├── natal/              ← Tampilan event natal
    │       └── halloween/          ← Tampilan event halloween
    │
    ├── golden_empire/              ← Customization Tier 1
    │   ├── index.css
    │   ├── index.js
    │   ├── manifest.json
    │   ├── assets/
    │   └── events/
    │       └── natal/
    │
    ├── crimson_throne/             ← Customization Tier 2
    │   ├── index.css
    │   ├── index.js
    │   ├── three-scene.js          ← Custom 3D scene
    │   ├── manifest.json
    │   ├── assets/
    │   └── events/
    │
    └── ethereal_void/              ← Customization Tier 3
        ├── index.css
        ├── index.js
        ├── spline-scene.js         ← Custom Spline 3D
        ├── anime-effects.js        ← Custom Anime.js effects
        ├── particle-system.js      ← Custom particles
        ├── manifest.json
        ├── assets/
        └── events/
```

### Global Variables
Setiap customization HARUS menggunakan global variable name yang sama agar backend bisa berinteraksi:
```javascript
// Variables yang HARUS ada di setiap customization:
window.EK_AUCTION_LIST      // Daftar item lelang
window.EK_CURRENT_BID       // Bid saat ini
window.EK_USER_PROFILE      // Data profil user
window.EK_WALLET_BALANCE    // Saldo wallet
window.EK_LEADERBOARD       // Data leaderboard
window.EK_LIVE_AUCTION      // Data live auction
window.EK_NOTIFICATIONS     // Notifikasi
// ... dan variabel lain yang dibutuhkan
```

Customization bebas menambah variabel sendiri, tapi variabel di atas WAJIB ada karena backend menggunakannya.

### Logika Pemilihan Tampilan
```
1. Cek user pilih customization apa
2. Cek apakah folder customization ada dan valid
3. Jika valid → load CSS/JS dari folder tersebut
4. Jika tidak valid → otomatis ke folder default
5. Cek apakah ada event aktif
6. Cek pengaturan user:
   a. "Ikuti event platform" → cari folder event di customization user
   b. "Pakai tampilan sendiri" → abaikan event, tetap di customization pilihan
   c. "Event platform full" → gunakan tampilan event dari platform (folder default)
7. Jika folder event tidak ada di customization user → gunakan default event
```

---

## Yang Bisa Di-Custom
Customization ini mengubah KESELURUHAN website:
- Homepage
- Halaman lelang
- Live auction room
- Profil
- Settings
- Wallet
- Shop
- Semua halaman lainnya

---

## Checklist
- [ ] Buat folder `public/tampilan/default/` dengan kode website saat ini
- [ ] Buat manifest.json schema
- [ ] Buat loader yang baca folder dan apply CSS/JS
- [ ] Implementasi fallback ke default jika error
- [ ] Buat sistem global variables
- [ ] Implementasi logika pemilihan event vs custom
- [ ] Buat halaman settings untuk user pilih tampilan
