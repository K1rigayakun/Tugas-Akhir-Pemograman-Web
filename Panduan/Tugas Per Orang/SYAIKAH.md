# 👑 Syaikah — Frontend & Visual

**Domain:** Tampilan, animasi, komponen UI, dan semua halaman yang dilihat user.

Kamu yang menentukan apakah platform ini terasa seperti istana atau website biasa.
Baca `ASSETS.md` dan `SHARED_VARIABLES.md` sebelum mulai apapun.
Kamu bekerja di `apps/web` dan `packages/ui`.

---

## Tanggung Jawab Utama

1. **Design System** — Pondasi visual yang dipakai seluruh tim
2. **Background & Atmosfer** — Platform harus selalu terasa hidup
3. **Komponen Shared** — Komponen yang dipakai di banyak halaman
4. **Halaman-halaman** — Semua halaman user-facing

---

## Design System (Kerjakan Duluan — Fase 0)

Ini harus selesai sebelum anggota lain bisa mulai membuat UI.

### Yang Harus Ada

**CSS Custom Properties** — Tempel semua variabel warna, font, dan gradient dari `ASSETS.md` ke `apps/web/src/app/globals.css`. Ini sumber kebenaran visual seluruh project.

**Komponen Dasar di `packages/ui/src/`** — Komponen ini dipakai di semua halaman:

| Komponen | Kegunaan |
|---|---|
| `Button` | Tombol dengan variant: `primary`, `secondary`, `ghost`, `danger` |
| `Card` | Container card untuk item lelang, achievement, cosmetic |
| `Modal` | Overlay dengan animasi masuk/keluar |
| `Input` | Input field bertema gelap |
| `Badge` | Badge rarity, rank, dan status |
| `RarityTag` | Tag berwarna sesuai rarity dengan glow effect |
| `RankBadge` | Badge rank dengan warna sesuai rank |
| `CountdownTimer` | Timer countdown dengan font Orbitron |
| `CrownCoinDisplay` | Tampilkan saldo CC dengan simbol ♛ |
| `Toast` | Notifikasi toast bertema kerajaan |
| `Skeleton` | Loading placeholder bertema gelap |

**Icon System** — Pasang semua SVG icon dari daftar di `ASSETS.md` ke `packages/ui/src/icons/`. Gunakan sumber yang direkomendasikan di `ASSETS.md`. Tidak ada emoji di UI manapun.

**Smooth Scroll** — Pasang Lenis di `apps/web/src/app/layout.tsx` satu kali, berlaku untuk semua halaman.

### Background Platform (Three.js)

Buat komponen `BackgroundCanvas` yang jalan sebagai layer paling bawah, `position: fixed`, di belakang semua konten.

Yang ada di background:
- Gradient animated (dari `ASSETS.md` — class `bg-platform`)
- Particle system: titik-titik emas kecil melayang ke atas perlahan (~500–800 partikel)
- Emerald fog: kabut hijau tipis di bagian bawah layar

Background punya beberapa mode yang bisa diubah via Zustand store:

```ts
// Store untuk mode background
const useBackgroundStore = create((set) => ({
  mode: "default",
  setMode: (mode) => set({ mode }),
}));

// Mode yang ada:
// "default" → normal
// "live"    → partikel lebih cepat, sisi layar berdenyut amber
// "event"   → warna bergeser ke tema event
// "emperor" → bintang emas bergerak
```

Fatih akan trigger perubahan mode ini via WebSocket event.

---

## Halaman-halaman

---

### Homepage — `/`

**Tujuan:** Kesan pertama platform. Harus terasa seperti memasuki istana.

**Yang ditampilkan:**

- **Hero Section** — Visual megah berlapis, dua tagline platform, dua tombol: "Enter the Colosseum" (ke `/auction`) dan "Join the Empire" (ke `/register`). Teks muncul bertahap dengan animasi reveal GSAP.
- **Live Banner** — Muncul otomatis kalau ada lelang live aktif. Tampilkan judul lelang dan countdown. Data dari endpoint `GET /api/v1/auctions/live`.
- **Event Banner** — Muncul kalau ada event aktif. Visual sesuai tema event. Data dari endpoint `GET /api/v1/events/active`.
- **Featured Items** — Grid 6 item lelang pilihan admin. Hover card menampilkan detail singkat dengan animasi smooth.
- **Ending Soon** — Daftar lelang yang hampir berakhir (< 6 jam).
- **Upcoming Auctions** — Jadwal lelang mendatang dengan countdown mulai.
- **The Oracle's Vision** — Section rekomendasi item personal. Tampil hanya kalau user sudah login. Data dari endpoint `GET /api/v1/recommendations`.
- **Leaderboard Snapshot** — Top 3 leaderboard minggu ini. Data dari endpoint `GET /api/v1/leaderboard/top-spender?period=weekly&limit=3`.
- **Museum Highlight** — Satu item museum terbaru. Data dari endpoint `GET /api/v1/museum/items?limit=1`.

**Saran animasi:**
Setiap section muncul saat discroll ke sana menggunakan GSAP ScrollTrigger. Elemen masuk dari bawah ke atas secara berurutan (stagger). Jangan semua langsung tampil — reveal bertahap terasa lebih dramatis.

---

### Daftar Lelang — `/auction`

**Tujuan:** Tempat user browse dan cari semua lelang.

**Yang ditampilkan:**

- Filter bar: tipe lelang, rarity, status (aktif/upcoming/ending soon), range harga CC
- Search bar dengan icon crystal ball / magnifier
- Toggle tampilan grid / list
- Section terpisah untuk: Live Now, Ending Soon (< 6 jam), Active, Upcoming
- Card lelang: foto item, nama, rarity tag dengan glow, harga saat ini, countdown timer, jumlah bidder
- Item Legendary dan Transcendent mendapat efek partikel kecil saat di-hover

**Saran:**
Gunakan TanStack Query dengan `refetchInterval` agar harga dan countdown terupdate otomatis tanpa refresh halaman.

---

### Detail Lelang — `/auction/[id]`

**Tujuan:** Halaman utama tempat keputusan bid dibuat. Harus terasa seperti arena pertempuran.

**Yang ditampilkan:**

- Galeri foto item — bisa dibuka lightbox saat diklik
- Untuk item Epic ke atas: 3D viewer (Three.js / React Three Fiber)
- Harga saat ini — besar, font Orbitron, beranimasi saat angkanya berubah
- Countdown timer — makin intens saat mendekati akhir
- Riwayat bid: siapa yang bid, berapa, kapan — update real-time via WebSocket
- Tombol "Place Bid" — buka modal konfirmasi saat diklik
- Toggle Phantom Bid (Shadow Pledge) dengan input batas maksimal
- Tombol Watchlist (icon mata)
- Info item: kategori, rarity, deskripsi, kondisi
- Info platform: "Verified & Stored by Emerald Kingdom" — bukan identitas seller asli

**Saat 60 detik terakhir (status ENDING):**
Tampilan berubah lebih dramatis — warna lebih intens, timer berdenyut, muncul banner pesan anti-snipe dari `ANTI_SNIPE_MESSAGE` di `SHARED_VARIABLES.md`.

**Saran:**
Koneksi WebSocket untuk halaman ini — listen event `bid:new`, `timer:update`, dan `timer:extended` dari `WS_EVENTS` di `SHARED_VARIABLES.md`.

---

### Profil User — `/profile/[username]`

**Tujuan:** "Istana digital" milik setiap user. Harus bisa mencerminkan status dan pencapaian.

**Yang ditampilkan:**

- **Header / Hero Profil** — Banner cosmetic di bagian atas (kalau user punya), avatar dengan frame cosmetic, nama user dengan effect cosmetic, rank badge, gelar lengkap dari `RANK_TITLES`
- **Stats Bar** — Total kemenangan, total bid, win rate, EXP bar menuju rank berikutnya, win streak
- **Trophy Hall** — Grid badge achievement yang dipilih user untuk dipamerkan. Badge Legendary/Mythic punya animasi glow
- **Showcase Vault** — Item lelang terbaik yang pernah dimenangkan. Jumlah slot dari `SHOWCASE_SLOTS` di `SHARED_VARIABLES.md`
- **Aktivitas Terkini** — Bisa disembunyikan sesuai privacy setting user

**UI berbeda per rank:**

| Rank | Tampilan |
|---|---|
| Civis – Merchant | Standar, bersih |
| Knight – Baron | Border bergaya baja/perunggu mulai muncul |
| Viscount – Earl | Aksen emas, nama berwarna gold |
| Marquis – Duke | Glow zamrud di avatar, partikel emas melayang di halaman |
| Sovereign | Aura silver-emas, animasi masuk sinematik |
| Emperor | Langit malam bergerak, nama berkilau corona emas, semua interaksi punya micro-animation |

**Saran:**
Buat satu komponen besar `ProfileLayout` yang menerima prop `rank` dan otomatis menerapkan class CSS yang sesuai. Jangan buat 10 halaman terpisah.

---

### Wallet — `/wallet`

**Tujuan:** Halaman keuangan. Harus terasa premium dan terpercaya.

**Yang ditampilkan:**

- **Wallet Card 3D** — Kartu interaktif yang bisa di-tilt saat di-hover (Three.js atau CSS 3D transform). Menampilkan: nama user, saldo CC dengan simbol ♛, rank badge, wallet ID. Skin kartu berubah sesuai cosmetic aktif user.
- **Saldo Tersedia** — Angka besar dengan font Orbitron, animated saat berubah (Anime.js counter)
- **Saldo Pending Hold** — CC yang sedang di-hold karena ada bid aktif
- **Tombol Top Up** — Buka modal top up
- **Riwayat Transaksi** — List dengan filter: semua, top up, bid, cashback, pembelian shop
- **Cashback Tracker** — Total cashback yang pernah diterima

**Saran:**
Saat cashback masuk (via WebSocket atau refetch), animasikan perubahan angka saldo dari nilai lama ke nilai baru menggunakan Anime.js. Jangan langsung ganti angkanya.

---

### Shop — `/shop`

**Tujuan:** Toko cosmetic dan item akselerasi.

**Yang ditampilkan:**

- Grid semua item dengan filter: tipe cosmetic, rarity, harga
- Card item: preview visual, nama, rarity tag, harga CC, tombol beli
- **Flash Sale Section** — Item diskon dengan countdown berakhirnya sale
- **Limited Items** — Item yang stoknya terbatas dengan indikator stok tersisa
- Preview cosmetic di profil sebelum membeli — modal preview yang menunjukkan seperti apa tampilan profil dengan cosmetic tersebut dipasang

---

### Leaderboard — `/leaderboard`

**Halaman ini dikerjakan Visel.** Syaikah cukup pastikan komponen shared (`RankBadge`, `Card`, dll.) sudah tersedia.

---

### Museum — `/museum`

**Halaman ini dikerjakan Visel.**

---

### Achievement — `/achievements`

**Halaman ini dikerjakan Visel.** Syaikah buat komponen `AchievementBadge` di `packages/ui` yang bisa dipakai Visel.

---

### Events — `/events`

**Halaman ini sebagian besar dikerjakan Visel.** Syaikah bertanggung jawab untuk perubahan visual background saat event aktif.

---

### Login — `/login`

**Yang ditampilkan:**

- Background platform penuh (bukan halaman putih biasa)
- Form: email dan password
- Link ke halaman register
- Link "Lupa password"
- Kalau 2FA aktif: setelah submit form, muncul step kedua — input kode Authenticator App

---

### Register — `/register`

**Yang ditampilkan:**

- Background platform penuh
- Form: email, password, konfirmasi password
- Setelah submit: tampilan "Check your email" — instruksi untuk cek OTP
- Form input OTP 6 digit (bisa pakai 6 input terpisah yang auto-focus ke kotak berikutnya)

---

### KYC — `/kyc`

**Yang ditampilkan:**

Wizard multi-step dengan progress indicator di atas yang jelas menunjukkan user ada di step berapa.

- **Step 1** — Nama lengkap, NIK, tanggal lahir, nomor HP
- **Step 2** — Alamat (jalan, kota, provinsi, kode pos)
- **Step 3** — Upload foto KTP dan selfie dengan KTP. Tampilkan preview foto yang diupload sebelum lanjut
- **Step 4** — Persetujuan syarat, konfirmasi usia 18+, tombol submit
- **Status Page** — Setelah submit: tampilan "Under Review" dengan estimasi waktu. Kalau sudah diputuskan: tampilan approved atau rejected dengan alasan

---

### Settings — `/settings`

**Yang ditampilkan:**

Dibagi jadi beberapa tab atau section:
- **Profil** — Ubah foto, username, bio, gelar aktif
- **Cosmetic** — Pilih cosmetic aktif: frame avatar, banner, name effect, dll.
- **Privasi** — Atur siapa yang bisa lihat apa (privacy mode dari `SHARED_VARIABLES.md`)
- **Notifikasi** — Toggle notifikasi per tipe dan per channel
- **Keamanan** — Ubah password, aktifkan/nonaktifkan 2FA, lihat sesi aktif

---

### Notifikasi — `/notifications`

**Yang ditampilkan:**

- Daftar semua notifikasi dengan filter: semua, belum dibaca, per tipe
- Setiap notifikasi: icon sesuai tipe, teks, timestamp, status baca
- Tombol "Mark all as read"
- Notifikasi tipe `RANK_UP` dan `NEW_ACHIEVEMENT` punya tampilan yang lebih besar dan dramatis dari notifikasi biasa

---

### 404 — `/not-found`

**Yang ditampilkan:**

- Background platform penuh — bukan halaman error putih
- Teks tematis: *"The path you seek lies beyond the known kingdom."*
- Tombol kembali ke homepage dengan styling kerajaan
- Animasi kecil: obor berkedip atau kabut bergerak

---

### Halaman Help — `/help`

**Halaman ini dikerjakan Visel.**

---

## Momen Animasi Khusus

Beberapa animasi yang sangat penting untuk feel platform:

### Victory Animation

Muncul sebagai overlay fullscreen saat user memenangkan lelang (trigger dari WebSocket event `auction:ended` dimana `winnerId` = user yang login).

Yang ditampilkan:
- Partikel emas menyebar dari tengah layar
- Teks kemenangan muncul dengan animasi reveal dramatis
- Tombol "Share Victory Card" — generate kartu bergaya kerajaan yang bisa di-share ke media sosial

### Rank Up Animation

Muncul saat backend kirim WebSocket event `rank:changed`.

Yang ditampilkan:
- Overlay dengan animasi mahkota
- Teks rank baru muncul dengan efek glow
- CSS variable rank langsung berubah via `applyRankTheme()` dari `ASSETS.md`

---

## Checklist Syaikah

- [ ] Semua CSS variable sudah dipasang di `globals.css`
- [ ] Lenis smooth scroll aktif global
- [ ] Komponen dasar di `packages/ui` sudah siap dipakai tim lain
- [ ] Icon SVG sudah ada di `packages/ui/src/icons/`
- [ ] Background canvas (particle system) berjalan 60fps
- [ ] Semua halaman sudah ada dan bisa diakses
- [ ] Dynamic rank UI: CSS variable berubah saat rank berubah
- [ ] Victory animation dan rank up animation berfungsi
- [ ] Tidak ada warna hardcode di komponen manapun
- [ ] Tidak ada emoji di UI manapun
