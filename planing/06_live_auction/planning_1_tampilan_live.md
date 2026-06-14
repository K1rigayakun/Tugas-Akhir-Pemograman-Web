# Planning 1: Perbaikan Tampilan Live Auction

## Tujuan
Membuat tampilan live auction yang profesional dengan data real dari database dan WebSocket.

---

## Layout Live Auction

### Area Utama (Kiri - 70%)
- Video stream / gambar item besar
- Jika ada 3D model, tampilkan viewer yang bisa diputar
- Di bawah video: galeri gambar item, deskripsi lengkap, spesifikasi

### Panel Bid (Kanan - 30%)
- Harga saat ini (besar, real-time update)
- Timer countdown
- Jumlah penonton REAL (dari WebSocket room)
- Jumlah bidder unik REAL (dari database)
- Form input bid
- Tombol bid besar
- Riwayat 10 bid terakhir (real-time scroll)
- Nama bidder (atau anonim jika privasi aktif)

### Info Bar (Atas)
- Nama item
- Kategori
- Host/pembawa lelang
- Status: LIVE / AKAN DIMULAI / SELESAI

---

## Data Real yang Harus Ditampilkan

### Dari Database
- Jumlah bidder unik = `SELECT COUNT(DISTINCT userId) FROM bids WHERE auctionId = ?`
- Bid saat ini = `currentPrice` dari tabel `auctions`
- Daftar bid terakhir = query `bids` ORDER BY `placedAt` DESC

### Dari WebSocket (Real-time)
- Jumlah penonton = jumlah client di room `auction:{id}`
- Update bid baru = event `bid:new`
- Timer update = event `timer:update`
- Auction ended = event `auction:ended`

---

## Checklist
- [ ] Redesign layout live auction (video + panel bid)
- [ ] Tampilkan jumlah penonton real dari WebSocket room
- [ ] Tampilkan jumlah bidder unik dari database
- [ ] Current bid dari database, update real-time via WebSocket
- [ ] Riwayat bid real-time (auto-scroll saat bid baru)
- [ ] Galeri gambar/video/3D di bawah video stream
- [ ] Responsive layout untuk mobile
