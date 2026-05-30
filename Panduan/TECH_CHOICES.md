# 🛠️ Emerald Kingdom — Tech Choices

Keputusan teknologi yang sudah disepakati tim — apa yang dipakai, kenapa, dan rencana ke depannya.

---

## Stack Final

| Layer | Teknologi | Platform |
|---|---|---|
| Frontend | Next.js 14, Tailwind CSS, GSAP, Three.js, Framer Motion | Vercel |
| Backend | NestJS, Prisma, Socket.io, BullMQ | Railway |
| Database | PostgreSQL | Neon |
| Cache & Lock | Redis | Upstash |
| File Storage | Foto, video, model 3D | Cloudflare R2 |
| AI Service | FastAPI Python | Railway (instance terpisah) |

---

## Keputusan Per Layanan

### KYC Verifikasi Identitas
**Dipakai: Manual Review oleh Admin**

Layanan AI otomatis (Verihubs, Privy ID) berbayar per verifikasi dan tidak ada free tier.
Untuk development dan presentasi, admin review manual dari admin panel.

Cara kerja: user upload foto KTP dan selfie → file masuk ke R2 → admin lihat di panel → approve atau reject.

Saat presentasi: approve akun-akun demo sebelum sesi dimulai. Jelaskan bahwa di production, proses ini otomatis menggunakan AI dalam hitungan detik.

### Live Auction Streaming
**Dipakai: Agora.io (Free Tier)**

10.000 menit gratis per bulan = 167 jam streaming. Lebih dari cukup untuk development dan presentasi.
Setup hanya butuh API key — tidak perlu konfigurasi server sendiri.

LiveKit self-hosted lebih murah jangka panjang tapi setup-nya jauh lebih kompleks untuk skala project ini.

### Payment Gateway
**Dipakai: Midtrans Sandbox**

Mode simulasi resmi dari Midtrans. Tidak ada uang nyata, tidak perlu kartu kredit, tidak perlu dokumen bisnis.
Midtrans sudah menyediakan data test lengkap: nomor kartu test, virtual account test, semua metode pembayaran.

Untuk production: ganti API key dari sandbox ke live — tidak ada perubahan kode.

### OTP & Two-Factor Authentication
**Dipakai: Email OTP via Resend + Authenticator App (TOTP)**

SMS via Twilio di-skip — berbayar setelah trial habis.
Email OTP sudah cukup dan gratis (Resend: 3.000 email/bulan).
2FA via Authenticator App menggunakan TOTP (`otplib`) — gratis, tidak butuh SMS.

### Push Notification
**Dipakai: Socket.io (in-app) + Resend (email) + Firebase FCM (web push)**

FCM dipakai karena gratis sepenuhnya dari Google. Tidak hanya untuk HP — browser modern (Chrome, Edge, Firefox) juga bisa terima push notification dari website. Jadi kalau user tutup tab, notifikasi "kamu di-outbid" tetap muncul di pojok layar.

Setup FCM: daftar di Firebase Console dengan akun Google — tidak perlu kartu kredit.

### Server Sleep Mode
**Dipakai: Railway free tier + ping manual sebelum presentasi**

Railway free tier punya kelemahan: server tidur kalau tidak ada request beberapa menit.
Untuk presentasi yang waktunya sudah terjadwal: akses backend sekali beberapa menit sebelum mulai supaya server "bangun".

Untuk production nyata: upgrade ke Railway Hobby ($5/bulan) agar server selalu nyala.

### Database Storage
**Dipakai: Neon free tier (0.5 GB)**

Untuk data test presentasi, 0.5 GB lebih dari cukup.
Foto dan file disimpan di Cloudflare R2 — bukan di database — jadi database hanya berisi teks dan angka.

---

## Biaya

### Selama Development

**Total: Rp 0**

| Layanan | Batas Gratis |
|---|---|
| Vercel | Gratis untuk hobby |
| Railway | $5 free credit/bulan |
| Neon | 0.5 GB storage |
| Upstash | 10.000 command/hari |
| Cloudflare R2 | 10 GB + 1 juta request/bulan |
| Resend | 3.000 email/bulan |
| Agora | 10.000 menit/bulan |
| Midtrans | Gratis (sandbox mode) |
| Firebase FCM | Gratis sepenuhnya |
| GitHub | Gratis (repo private + Actions 2000 menit/bulan) |

### Tidak Ada Layanan yang Butuh Kartu Kredit

Semua layanan di atas bisa didaftar hanya dengan email. Tidak ada yang meminta kartu kredit untuk free tier-nya.

---

## Upgrade Path ke Production

Kalau project dilanjutkan ke production nyata, ini yang perlu diubah — semua hanya perubahan konfigurasi, bukan perubahan kode:

| Komponen | Development | Production |
|---|---|---|
| KYC | Manual admin | Integrasi Verihubs/Privy ID |
| Payment | Midtrans Sandbox | Midtrans Live (ganti API key) |
| Server | Railway free + ping manual | Railway Hobby ($5/bulan) |
| Database | Neon free (0.5 GB) | Neon Launch ($19/bulan, 10 GB) |
| Streaming | Agora free tier | Agora pay-as-you-go |
| SMS | Tidak ada | Twilio |
| Domain | vercel.app | Domain custom (.com) |
