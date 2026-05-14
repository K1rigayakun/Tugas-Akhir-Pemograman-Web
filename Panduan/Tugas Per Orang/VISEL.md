# 🏆 Visel — Leaderboard, Museum, Achievement, Halaman Statis

**Domain:** Halaman-halaman yang menampilkan sejarah, kompetisi, dan pencapaian platform.

Kamu bekerja di `apps/web` untuk halaman-halamannya.
Kamu tidak membuat backend sendiri — kamu mengonsumsi endpoint yang sudah ada.
Baca `SHARED_VARIABLES.md` dan `ASSETS.md` sebelum mulai.

---

## Tanggung Jawab Utama

1. **Leaderboard** — The Grand Rankings (`/leaderboard`)
2. **Museum** — The Imperial Museum (`/museum`)
3. **Achievement Display** — The Triumph Registry (`/achievements`)
4. **Halaman Event** — The Festival Calendar (`/events`)
5. **Halaman Statis** — Help/FAQ (`/help`) dan 404 (`/not-found`)

---

## 1 — Leaderboard — `/leaderboard`

### Apa Ini

Papan peringkat yang menampilkan kompetisi antar user dalam 7 kategori berbeda.
Data sudah disiapkan Fatih sebagai cache di Redis yang diperbarui setiap 5 menit.
Tugasmu menampilkannya dengan tampilan yang mengesankan.

### Data yang Dipakai

```
GET /api/v1/leaderboard/:category?period=weekly
GET /api/v1/leaderboard/:category?period=monthly
GET /api/v1/leaderboard/:category?period=all-time
GET /api/v1/leaderboard/my-position/:category?period=weekly
```

Kategori yang tersedia:

| Value di API | Nama di Platform |
|---|---|
| `top-spender` | The Grand Treasurer Board |
| `most-wins` | The Conqueror's Board |
| `highest-streak` | Chain of Glory Board |
| `rare-collector` | The Rare Vault Board |
| `highest-rank` | Order of Nobility Board |
| `event-champion` | Seasonal Champion Board |
| `live-auction-king` | The Arena Board |

### Yang Ditampilkan

- **Tab kategori** — 7 tab untuk berpindah kategori
- **Tab periode** — Weekly, Monthly, All Time
- **Podium Top 3** — Posisi 1, 2, 3 tampil berbeda dari yang lain. Layout podium: posisi 2 di kiri, posisi 1 di tengah (lebih tinggi), posisi 3 di kanan. Posisi 1 punya animasi mahkota, warna emas. Posisi 2 warna silver. Posisi 3 warna bronze.
- **Tabel peringkat** — Posisi 4 ke bawah dalam tabel. Tiap baris: nomor, avatar, nama (atau "The Unknown" kalau anonim), rank badge, nilai sesuai kategori
- **Posisi user sendiri** — Selalu tampil di bawah tabel meskipun user ada di posisi 200, dengan highlight berbeda

**Saran:**
Pakai `TanStack Query` dengan `refetchInterval: 5 * 60 * 1000` agar data refresh otomatis setiap 5 menit. Tidak perlu real-time — cukup polling.

---

## 2 — Museum — `/museum`

### Apa Ini

Galeri yang mengabadikan sejarah platform — item legendaris, rekor harga tertinggi, momen terbaik.
Tampilan harus seperti galeri seni premium, bukan daftar biasa.

### Data yang Dipakai

```
GET /api/v1/museum/items               → Item museum (paginated, filter rarity)
GET /api/v1/museum/items/:id           → Detail satu item
GET /api/v1/museum/records             → Rekor platform
GET /api/v1/museum/first-emperor       → Data Emperor pertama (jika sudah ada)
GET /api/v1/museum/event-highlights    → Highlight tiap event besar
```

### Yang Ditampilkan

**Galeri Item:**
Layout masonry atau grid tidak seragam — item rarity tinggi dapat card yang lebih besar.
Setiap card item menampilkan: foto barang, nama, rarity tag, harga akhir lelang, nama pemenang (jika tidak anonim), tanggal, jumlah bidder.

Item Legendary dan Transcendent mendapat perlakuan visual khusus:
- Border berwarna dengan aura dari `ASSETS.md`
- Badge "Imperial Relic" atau "Transcendent Artifact"
- Hover effect lebih dramatis

**Section Rekor:**
Tampilan card untuk rekor-rekor platform: harga lelang tertinggi, lelang paling banyak bidder, win streak terpanjang, dll.

**Section First Emperor:**
Kalau Emperor pertama sudah ada, tampilkan section khusus yang sangat dramatis — ini momen sejarah platform.

**Filter & Search:**
- Filter berdasarkan rarity
- Filter berdasarkan event
- Search berdasarkan nama item

**Saran:**
Semua gambar wajib pakai `next/image`. Halaman ini berat gambar — pastikan lazy loading aktif.

---

## 3 — Achievement Display — `/achievements`

### Apa Ini

Halaman yang menampilkan semua achievement yang ada di platform dan progress user terhadapnya.
Engine achievement dikelola Fatih — kamu hanya menampilkannya.

### Data yang Dipakai

```
GET /api/v1/achievements              → Semua achievement + status unlock user
GET /api/v1/achievements/:id          → Detail satu achievement
GET /api/v1/users/:id/achievements    → Achievement yang sudah diraih user tertentu
```

### Yang Ditampilkan

**Grid achievement dikelompokkan per tier:**
Common → Uncommon → Rare → Epic → Legendary → Mythic.
Setiap tier punya warna header yang berbeda.

Achievement yang sudah diraih tampil penuh berwarna.
Achievement yang belum diraih tampil redup/grayscale.

**Hover/klik achievement:**
Muncul card atau modal dengan:
- Nama dan deskripsi
- Kondisi untuk meraihnya
- Reward (EXP, gelar, cosmetic)
- Tanggal unlock (kalau sudah diraih)
- Berapa user yang sudah meraihnya — menunjukkan kelangkaan

**Achievement Legendary & Mythic:**
Badge animasi dengan glow dari `ASSETS.md`. Partikel kecil saat di-hover. Ini pencapaian yang sangat jarang — tampilkan seperti itu.

**Progress bar:**
Untuk achievement yang bisa ditracking progress-nya (misal "Menang 100 lelang"), tampilkan progress bar dengan angka saat ini vs target.

**Saran:**
Kalau ada lebih dari 100 achievement, pertimbangkan virtualisasi list menggunakan `@tanstack/react-virtual` agar halaman tidak lambat.

---

## 4 — Halaman Event — `/events`

### Apa Ini

Halaman yang menampilkan event yang sedang aktif dan yang akan datang.
Data event dikelola admin (Michael), logika EXP multiplier dikelola Fatih.

### Data yang Dipakai

```
GET /api/v1/events                    → Semua event (aktif, mendatang, selesai)
GET /api/v1/events/:id                → Detail satu event
GET /api/v1/events/:id/achievements   → Achievement khusus event ini
GET /api/v1/events/:id/leaderboard    → Leaderboard khusus event ini
```

### Yang Ditampilkan

**Halaman Utama `/events`:**
- Banner besar untuk event yang sedang aktif, dengan countdown berakhirnya event
- Grid card event mendatang
- Arsip event yang sudah selesai

**Halaman Detail `/events/[id]`:**
- Hero banner event dengan visual sesuai tema event (warna dari `ASSETS.md` bagian Event Seasonal)
- Penjelasan event (apa yang berubah selama event: EXP multiplier, item eksklusif, dll.)
- Achievement khusus event beserta reward-nya
- Leaderboard khusus event ini
- Daftar item lelang eksklusif event

---

## 5 — Help & FAQ — `/help`

### Yang Ditampilkan

- Kategori FAQ: Registrasi & KYC, Sistem Lelang, Wallet & Top Up, Rank & Achievement, Cosmetic & Shop, Keamanan
- Search dalam FAQ
- Setiap pertanyaan bisa di-expand untuk lihat jawaban (accordion)
- Tombol kontak support (link ke email)
- Panduan singkat cara pertama kali menggunakan platform

**Saran:**
Konten FAQ bisa disimpan sebagai file JSON statis di `apps/web/src/data/faq.json` — tidak perlu endpoint API khusus untuk ini.

---

## 6 — 404 — `/not-found`

### Yang Ditampilkan

- Background platform penuh — bukan halaman error putih generik
- Teks: *"The path you seek lies beyond the known kingdom."*
- Tombol kembali ke homepage dengan styling kerajaan
- Animasi kecil: obor berkedip atau kabut bergerak tipis

---

## Komponen yang Perlu Dibuat

Buat komponen-komponen ini di `apps/web/src/components/` (khusus untuk halamanmu):

| Komponen | Dipakai Di |
|---|---|
| `LeaderboardTable` | `/leaderboard` |
| `TopThreePodium` | `/leaderboard` |
| `MyPositionBar` | `/leaderboard` |
| `MuseumGallery` | `/museum` |
| `MuseumItemCard` | `/museum` |
| `RecordsSection` | `/museum` |
| `AchievementGrid` | `/achievements` |
| `AchievementDetail` | `/achievements` |
| `EventBanner` | `/events` |
| `EventCard` | `/events` |
| `FaqAccordion` | `/help` |

Komponen yang bisa dipakai orang lain (seperti `AchievementBadge`) taruh di `packages/ui/src/`.

---

## Yang Tidak Perlu Dikhawatirkan

- Semua halaman ini **bisa diakses tanpa login** — guest user boleh browse museum, leaderboard, achievements
- Data personal (posisi user di leaderboard, achievement yang sudah unlock) baru muncul kalau user sudah login
- Backend dan cache sudah disiapkan Fatih dan Michael — kamu tinggal konsumsi endpoint-nya

---

## Koneksi dengan Tim

| Orang | Hubungan |
|---|---|
| **Fatih** | Achievement engine dan leaderboard cache disiapkan Fatih. Kamu konsumsi endpoint-nya |
| **Michael** | Data museum dan event dikelola dari admin panel Michael |
| **Syaikah** | Komponen shared seperti `RankBadge`, `RarityTag`, `CountdownTimer` sudah ada di `packages/ui`. Pakai langsung |

---

## Checklist Visel

- [ ] Leaderboard 7 kategori tampil dengan filter Weekly/Monthly/All Time
- [ ] Podium top 3 punya tampilan berbeda — posisi 1 paling menonjol
- [ ] Posisi user sendiri selalu terlihat meskipun bukan top 50
- [ ] Museum gallery tampil dengan layout masonry/grid bertema galeri
- [ ] Item Legendary/Transcendent di museum punya visual khusus (aura, badge)
- [ ] Achievement grid: locked vs unlocked jelas dibedakan
- [ ] Achievement Legendary/Mythic punya animasi
- [ ] Progress bar muncul untuk achievement yang bisa ditracking
- [ ] Event banner menampilkan countdown berakhirnya event aktif
- [ ] Halaman detail event punya leaderboard event tersendiri
- [ ] FAQ accordion berfungsi dan bisa di-search
- [ ] Halaman 404 bertema kerajaan, bukan error generik
- [ ] Semua halaman bisa diakses tanpa login
- [ ] Semua gambar pakai `next/image`
- [ ] Leaderboard auto-refresh setiap 5 menit
