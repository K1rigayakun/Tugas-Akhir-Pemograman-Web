# 🗝️ Peter — Auth, KYC, Notifikasi, Shop, Upload

**Domain:** Semua sistem yang jadi gerbang antara user dan platform.

Kamu bekerja di `apps/api` untuk backend dan koordinasi dengan Syaikah untuk UI-nya.
Baca `SHARED_VARIABLES.md` sebelum mulai — semua enum dan konstanta yang kamu butuhkan sudah ada di sana.

---

## Tanggung Jawab Utama

1. **Authentication** — Registrasi, login, session, 2FA
2. **KYC** — Verifikasi identitas user
3. **Notification System** — Semua channel notifikasi
4. **Shop Backend** — Logika pembelian cosmetic dan akselerasi
5. **File Upload** — Foto profil dan dokumen KYC

---

## 1 — Authentication

### Apa Ini

Sistem yang mengatur siapa yang bisa masuk dan apa yang boleh mereka lakukan.
Menggunakan JWT (JSON Web Token) — dua token:
- **Access Token** — Umur pendek (15 menit). Dikirim di setiap request API.
- **Refresh Token** — Umur panjang (30 hari). Dipakai untuk dapat access token baru.

### Registrasi

Alur dua tahap:

**Tahap 1 — Daftar akun:**
User kirim email dan password. Backend simpan ke database, kirim OTP 6 digit ke email via Resend. OTP berlaku 10 menit.

```
POST /api/v1/auth/register
Body: { email, password, confirmPassword }
```

**Tahap 2 — Verifikasi email:**
User masukkan OTP yang diterima di email.

```
POST /api/v1/auth/verify-email
Body: { email, otp }
→ Return: accessToken, refreshToken
```

### Login

```
POST /api/v1/auth/login
Body: { email, password }

→ Cek password (Argon2)
→ Kalau 2FA aktif: jangan return token, minta kode 2FA dulu
→ Kalau tidak: return accessToken + refreshToken
→ Catat session ke database
```

Kalau login dari IP atau device yang berbeda dari biasanya, kirim email security alert ke user.

### Refresh Token

```
POST /api/v1/auth/refresh
Body: { refreshToken }
→ Return: accessToken baru
```

### Session Management

Simpan setiap sesi login di tabel `sessions`. User bisa lihat dan hapus sesi aktif dari halaman settings.

```
GET    /api/v1/auth/sessions       → Daftar sesi aktif
DELETE /api/v1/auth/sessions/:id   → Hapus satu sesi (logout perangkat itu)
DELETE /api/v1/auth/sessions/all   → Hapus semua sesi kecuali yang sekarang
```

### Two-Factor Authentication (2FA)

Pakai **TOTP** (Time-based One-Time Password) via Authenticator App (Google Authenticator, Authy, dll.).
Library yang dipakai: `otplib`.

```
POST /api/v1/auth/2fa/setup    → Generate secret + QR code untuk di-scan Authenticator App
POST /api/v1/auth/2fa/enable   → Konfirmasi aktifasi dengan kode TOTP pertama
POST /api/v1/auth/2fa/verify   → Verifikasi kode TOTP saat login
POST /api/v1/auth/2fa/disable  → Matikan 2FA (butuh verifikasi password)
```

### Keamanan Auth

- Password di-hash dengan **Argon2** — bukan bcrypt
- Rate limiting: maksimal 5 percobaan login gagal dalam 5 menit, lalu block 15 menit
- Semua endpoint auth pakai rate limiting ketat

---

## 2 — KYC

### Apa Ini

Proses verifikasi identitas user sebelum bisa bid atau top up.
Memastikan 1 NIK = 1 akun dan user berumur minimal 18 tahun.

Saat user pertama kali coba bid atau top up, sistem redirect ke `/kyc`.

### Alur KYC

**Step 1 — Data pribadi:**
```
POST /api/v1/kyc/step-1
Body: { fullName, nationalId, dateOfBirth, phoneNumber }

→ Validasi format NIK
→ Cek NIK belum dipakai akun lain — kalau sudah ada, tolak
→ Hitung usia dari dateOfBirth — kalau < 18 tahun, tolak
→ Kirim OTP ke phoneNumber untuk verifikasi nomor HP
```

**Step 2 — Alamat:**
```
POST /api/v1/kyc/step-2
Body: { streetAddress, city, province, postalCode }
```

**Step 3 — Upload dokumen:**
```
POST /api/v1/kyc/step-3
Content-Type: multipart/form-data
Body: { idDocument: File, selfieWithDocument: File }

→ Upload file ke Cloudflare R2
→ Ubah status KYC jadi PENDING
```

**Step 4 — Persetujuan:**
```
POST /api/v1/kyc/submit
Body: { agreedToTerms: true, agreedToPrivacy: true, confirmedAge: true }

→ Kirim notifikasi email: "Pengajuan diterima, menunggu review"
```

### Review Manual oleh Admin

Setelah user submit, admin review dari admin panel:
- Lihat foto KTP dan selfie
- Approve atau reject dengan alasan

```
GET /api/v1/admin/kyc/queue         → Antrian pengajuan
PUT /api/v1/admin/kyc/:id/approve   → Setujui
PUT /api/v1/admin/kyc/:id/reject    → Tolak dengan catatan alasan
```

Setelah diputuskan, kirim email notifikasi ke user.

### Status KYC

```
GET  /api/v1/kyc/status     → Status KYC user saat ini
POST /api/v1/kyc/resubmit   → Ajukan ulang setelah ditolak
```

### Aturan Data KYC

- Data sensitif (NIK, nama, tanggal lahir) disimpan di tabel `user_kyc` yang terpisah dari `users`
- Data dienkripsi sebelum disimpan ke database — konsultasi dengan Michael soal implementasi enkripsi
- File foto dokumen bisa dihapus dari R2 setelah KYC disetujui — hanya metadata yang disimpan

---

## 3 — Notification System

### Cara Kerjanya

Notifikasi dikirim dari berbagai modul (bid, lelang, rank, event) ke berbagai channel.
Kamu yang membangun infrastruktur distribusinya.

### Channel

| Channel | Dipakai Untuk |
|---|---|
| In-app (WebSocket) | Semua notifikasi real-time saat user online |
| Web Push (FCM) | Notifikasi browser saat tab tidak aktif |
| Email (Resend) | KYC, keamanan, transaksi penting, outbid |

### Endpoint Notifikasi

```
GET /api/v1/notifications                  → Daftar notifikasi (paginated)
PUT /api/v1/notifications/:id/read         → Tandai sudah dibaca
PUT /api/v1/notifications/read-all         → Tandai semua sudah dibaca
GET /api/v1/notifications/unread-count     → Jumlah belum dibaca (untuk badge bell icon)
```

### NotificationService

Buat `NotificationService` yang bisa dipanggil modul lain (Fatih, Michael):

```ts
class NotificationService {
  // Kirim ke satu user — semua channel sesuai preferensi user
  async send(userId: string, type: NotifType, payload: object): Promise<void>

  // Kirim ke semua user — untuk EMPEROR_ASCENSION
  async sendGlobal(type: NotifType, payload: object): Promise<void>
}
```

Tipe notifikasi sudah ada di `SHARED_VARIABLES.md` — enum `NotifType`.

### Preferensi Notifikasi

User bisa atur notifikasi mana yang diterima dan lewat channel mana:

```
GET /api/v1/notification-preferences   → Preferensi saat ini
PUT /api/v1/notification-preferences   → Update preferensi
```

---

## 4 — Shop Backend

### Apa yang Dijual

- Cosmetic (frame avatar, banner, name effect, wallet skin, dll.)
- Akselerasi rank (dengan syarat EXP minimum)
- EXP booster terbatas waktu
- Bundle cosmetic

### Endpoint Shop

```
GET  /api/v1/shop/items              → Semua item (dengan filter)
GET  /api/v1/shop/items/flash-sale   → Item flash sale aktif
GET  /api/v1/shop/items/limited      → Item limited edition
POST /api/v1/shop/purchase/:itemId   → Beli item
GET  /api/v1/shop/wishlist           → Wishlist user
POST /api/v1/shop/wishlist/:itemId   → Tambah ke wishlist
DELETE /api/v1/shop/wishlist/:itemId → Hapus dari wishlist
```

### Logika Pembelian

Saat user beli item:
1. Pastikan user sudah KYC
2. Cek item masih tersedia (stok dan waktu kalau limited)
3. Kalau akselerasi rank: cek EXP sudah cukup dan cooldown 30 hari sudah lewat
4. Cek saldo CC cukup
5. Panggil Wallet Service milik Fatih untuk potong saldo — sertakan idempotency key
6. Tambahkan item ke koleksi user (tabel `user_cosmetics`)
7. Kirim notifikasi konfirmasi

**Aturan akselerasi rank:**
- Hanya bisa naik satu rank per pembelian
- Harus memenuhi minimum EXP
- Cooldown 30 hari
- Duke → Sovereign dan Sovereign → Emperor **tidak bisa dibeli**

### Admin Shop

```
POST   /api/v1/admin/shop/items            → Tambah item baru
PUT    /api/v1/admin/shop/items/:id        → Update item
POST   /api/v1/admin/shop/flash-sale       → Buat flash sale
DELETE /api/v1/admin/shop/flash-sale/:id   → Akhiri flash sale
```

---

## 5 — File Upload

### Cara Kerjanya

File langsung diupload ke Cloudflare R2 — tidak disimpan di server backend.
Backend hanya menerima file, upload ke R2, lalu kembalikan URL-nya.

### Endpoint Upload

```
POST /api/v1/upload/avatar         → Upload foto profil
POST /api/v1/upload/kyc-document   → Upload dokumen KYC
```

### Validasi File

- Avatar: format JPG/PNG/WebP, maksimal 5MB
- Dokumen KYC: format JPG/PNG/PDF, maksimal 10MB

Respons yang dikembalikan:
```json
{
  "url": "https://r2.emeraldkingdom.com/avatars/user-id.webp",
  "key": "avatars/user-id.webp"
}
```

URL ini langsung disimpan ke kolom di tabel `users` atau `user_kyc`.

---

## Koneksi dengan Tim

| Orang | Hubungan |
|---|---|
| **Syaikah** | Kamu buat endpoint, Syaikah buat UI-nya. Koordinasi untuk form registrasi, KYC wizard, settings, dan shop |
| **Fatih** | Saat shop purchase, kamu panggil Wallet Service milik Fatih. Pastikan interface-nya jelas |
| **Michael** | Schema tabel `users`, `user_kyc`, `sessions`, `notifications` dari Michael |

---

## Checklist Peter

- [ ] Registrasi + verifikasi OTP email berfungsi end-to-end
- [ ] Login dengan 2FA (Authenticator App) berfungsi
- [ ] Session management: user bisa lihat dan hapus sesi aktif
- [ ] Email security alert dikirim saat login dari perangkat baru
- [ ] KYC: 4 step berfungsi, status terupdate
- [ ] 1 NIK = 1 akun — sistem tolak NIK duplikat
- [ ] Usia < 18 tahun ditolak di step KYC
- [ ] Upload file berhasil masuk ke R2
- [ ] `NotificationService` bisa dipanggil modul lain
- [ ] Web push FCM berfungsi di browser
- [ ] Shop: beli cosmetic → CC terpotong → item masuk koleksi user
- [ ] Flash sale: harga terpotong sesuai diskon, timer aktif
- [ ] Akselerasi rank: validasi EXP dan cooldown berjalan benar
- [ ] Rate limiting aktif di endpoint auth
- [ ] Password di-hash dengan Argon2
