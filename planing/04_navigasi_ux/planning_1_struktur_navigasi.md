# Planning 1: Perbaikan Struktur Navigasi

## Tujuan
Memperbaiki navigasi website agar user tidak bingung membedakan pengaturan website, pengaturan akun, top up, dan fitur lainnya.

---

## Masalah Sekarang
- User bingung di mana pengaturan website vs pengaturan akun
- Tidak jelas mana menu untuk top up
- Menu navigasi terlalu banyak atau kurang terorganisir

## Solusi: Reorganisasi Navigasi

### Header Navigation (SiteHeader)
Menu utama yang selalu terlihat:
```
[Logo] [Beranda] [Lelang] [Live] [Shop] [Museum] [Leaderboard]  ... [Notifikasi] [Wallet: 500 CC] [Avatar/Profile ▾]
```

### Dropdown Profile Menu
Saat klik avatar/profile, tampilkan dropdown:
```
┌─────────────────────────┐
│ 👤 Username              │
│ ⚔️  Rank: Knight          │
│ ✨ 2,500 EXP             │
├─────────────────────────┤
│ Profil Saya             │
│ Wallet & Top Up         │
│ Koleksi Saya            │
│ Pencapaian              │
│ Watchlist               │
├─────────────────────────┤
│ Pengaturan Akun         │
│ Pengaturan Tampilan     │
│ Privasi                 │
├─────────────────────────┤
│ Keluar                  │
└─────────────────────────┘
```

### Halaman Pengaturan - Pisahkan dengan tab/sidebar
```
Pengaturan Akun:        Pengaturan Tampilan:
- Email & Password      - Tema Website (customization)
- 2FA                   - Tampilan Profil
- Notifikasi            - Cosmetic Aktif
- KYC                   - Efek & Animasi
- Privasi               - Bahasa
```

---

## Checklist
- [ ] Reorganisasi SiteHeader dengan menu yang jelas
- [ ] Buat dropdown menu profile dengan section yang terpisah
- [ ] Pisahkan halaman Settings menjadi tab Akun dan Tampilan
- [ ] Tambahkan breadcrumb di setiap halaman
- [ ] Test navigasi di mobile dan desktop
