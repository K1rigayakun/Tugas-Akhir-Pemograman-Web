# Planning 1: Seed Data Item Lelang & Profil User

## Tujuan
Membuat data realistis di database untuk demonstrasi: item lelang dengan gambar dari internet, dan user dengan variasi profil yang beragam.

---

## Item Lelang (Seed ke database)

Setiap item harus punya: nama, deskripsi, kategori, gambar (URL dari internet), harga awal, dan atribut lainnya.

### Contoh Item yang Harus Dibuat (minimal 30 item)

**Seni & Antik**
- Lukisan "Starry Night" Replika Limited → gambar lukisan starry night
- Vas Dinasti Ming Replika → gambar vas keramik Cina antik
- Patung Athena Bronze → gambar patung perunggu Yunani

**Perhiasan**
- Cincin Ruby Imperial → gambar cincin ruby mewah
- Kalung Emerald Sovereign → gambar kalung emerald
- Jam Tangan Rolex Submariner Vintage → gambar rolex vintage

**Kendaraan**
- Porsche 911 Classic 1973 → gambar porsche klasik
- Harley Davidson Heritage → gambar harley davidson
- Ferrari F40 → gambar ferrari F40

**Elektronik**
- MacBook Pro M3 Max → gambar macbook pro
- Sony A7IV Camera Kit → gambar kamera sony
- PS5 Pro Limited Edition → gambar PS5

**Fashion**
- Hermes Birkin Bag → gambar tas hermes
- Nike Air Jordan 1 OG → gambar jordan 1 retro
- Rolex Daytona → gambar rolex daytona

**Gaming & Hobi**
- Pokemon Card Charizard 1st Edition → gambar pokemon card
- LEGO Star Wars UCS Millennium Falcon → gambar lego star wars
- Gundam PG Unicorn → gambar gundam model kit

**Olahraga**
- Jersey Messi Bertandatangan → gambar jersey messi signed
- Bola Piala Dunia 2022 Official → gambar bola piala dunia

**Item Bertema Medieval (untuk event/exclusive)**
- Pedang Excalibur Replika → gambar pedang excalibur
- Mahkota Kerajaan Gold Plated → gambar mahkota kerajaan
- Baju Zirah Knight Full Set → gambar armor knight
- Perisai Templar → gambar perisai templar

### Catatan Gambar
- Gunakan URL gambar dari sumber bebas (Unsplash, Pexels, atau URL produk)
- Pastikan gambar BERBEDA untuk setiap item
- Gambar harus MIRIP dengan apa yang dideskripsikan

---

## Profil User Demo (Seed ke database)

Buat minimal 20 user dengan variasi:

### Variasi yang Harus Ada
- Rank berbeda-beda (dari CIVIS sampai SOVEREIGN, minimal 1 per rank)
- XP bervariasi (sesuai rank threshold)
- Beberapa user punya foto profil (URL gambar karakter anime/avatar)
- Beberapa user dalam mode ANONYMOUS (nama medieval random)
- Beberapa user dalam mode SHADOW (tidak bisa dilihat)
- Beberapa user punya achievement (bid pertama, win streak, dll)
- Beberapa user punya cosmetic aktif (frame, name effect)
- Beberapa user punya bid history di berbagai auction
- 1-2 user yang suspended sebagai contoh
- Saldo CC bervariasi (dari 0 sampai 100,000)

### Contoh Profil
```
User 1: "DragonSlayer42" — DUKE — 105,000 XP — foto anime warrior — PUBLIC
User 2: "The Silent Knight" — KNIGHT — 3,500 XP — ANONYMOUS
User 3: "CrystalMage" — BARON — 7,200 XP — foto anime mage — PUBLIC
User 4: "ShadowBidder" — EARL — 30,000 XP — SHADOW mode
User 5: "GoldenQueen" — SOVEREIGN — 280,000 XP — foto anime queen — PUBLIC
... dst
```

---

## Checklist
- [ ] Buat file seed script (`packages/db/seed.ts` atau `prisma/seed.ts`)
- [ ] Seed 30+ item lelang dengan gambar dari internet
- [ ] Seed 20+ user dengan variasi rank, XP, privasi
- [ ] Seed achievement untuk beberapa user
- [ ] Seed bid history untuk beberapa auction
- [ ] Seed wallet balance bervariasi
- [ ] Seed beberapa auction dengan status ACTIVE, UPCOMING, ENDED
- [ ] Seed beberapa live auction (1 aktif, 2 upcoming)
- [ ] Test: data muncul di web dan admin
