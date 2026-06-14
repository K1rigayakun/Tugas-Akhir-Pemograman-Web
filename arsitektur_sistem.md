# Arsitektur Sistem Emerald Kingdom

> **Platform**: Emerald Kingdom — Luxury Gamified Auction Platform  
> **Tagline**: "Where Fortune Meets Glory."  
> **Arsitektur**: Monorepo (Turborepo) — Full-Stack TypeScript + Python AI

---

## 1. Arsitektur Tingkat Tinggi (High-Level Architecture)

```mermaid
graph TB
    subgraph CLIENT["CLIENT LAYER"]
        WEB["apps/web<br/>Next.js 14+<br/>User-Facing Frontend"]
        ADMIN["apps/admin<br/>Next.js 14+<br/>Praetorian Console"]
    end

    subgraph GATEWAY["GATEWAY & PROTECTION"]
        CF["Cloudflare CDN<br/>+ WAF + DDoS Protection"]
        RL["Rate Limiter<br/>@nestjs/throttler"]
    end

    subgraph BACKEND["BACKEND SERVICES"]
        API["apps/api<br/>NestJS<br/>REST API + WebSocket"]
        ORACLE["apps/oracle<br/>Python / FastAPI<br/>AI Oracle Engine"]
    end

    subgraph DATA["DATA LAYER"]
        PG["PostgreSQL<br/>Supabase<br/>Primary Database"]
        REDIS["Redis / Upstash<br/>Cache, Bid Lock,<br/>Session, Leaderboard"]
        R2["Cloudflare R2<br/>Object Storage<br/>Foto, Video, Cosmetic"]
    end

    subgraph EXTERNAL["LAYANAN EKSTERNAL"]
        PAY["Payment Gateway<br/>Midtrans / Xendit / Stripe"]
        KYC["KYC Provider<br/>Verihubs / Privy ID"]
        AGORA["Agora.io<br/>Live Auction Streaming"]
        EMAIL["Email Service<br/>Resend / SendGrid"]
        FCM["Firebase Cloud Messaging<br/>Push Notification"]
        SENTRY["Sentry + Grafana<br/>Monitoring & Logging"]
    end

    WEB -- "HTTPS" --> CF
    ADMIN -- "HTTPS" --> CF
    CF --> RL
    RL --> API

    API -- "REST" --> ORACLE
    API -- "Prisma ORM" --> PG
    API -- "ioredis" --> REDIS
    API -- "AWS SDK S3" --> R2
    API -- "WebSocket<br/>Socket.io" --> WEB

    API --> PAY
    API --> KYC
    API --> AGORA
    API --> EMAIL
    API --> FCM
    API --> SENTRY

    ORACLE -- "Prisma" --> PG

    style CLIENT fill:#0d3320,stroke:#10b981,color:#fff
    style GATEWAY fill:#1a1a2e,stroke:#ffd700,color:#fff
    style BACKEND fill:#1a1a2e,stroke:#3b82f6,color:#fff
    style DATA fill:#1a1a2e,stroke:#a855f7,color:#fff
    style EXTERNAL fill:#1a1a2e,stroke:#ef4444,color:#fff
```

### Penjelasan Komponen

| Layer | Komponen | Teknologi | Fungsi |
|-------|----------|-----------|--------|
| **Client** | `apps/web` | Next.js 14+, Tailwind, Zustand, TanStack Query | Antarmuka pengguna: homepage, lelang, profil, wallet, shop |
| **Client** | `apps/admin` | Next.js 14+, Vanilla CSS | Panel admin (Praetorian Console): kelola user, lelang, keuangan, konten |
| **Gateway** | Cloudflare | CDN, WAF, DDoS Protection | Perlindungan edge, caching aset statis, SSL termination |
| **Backend** | `apps/api` | NestJS, Socket.io, Prisma | API utama: auth, CRUD, WebSocket real-time, business logic |
| **Backend** | `apps/oracle` | Python, FastAPI | AI engine: fraud detection, rekomendasi, pricing intelligence |
| **Database** | PostgreSQL | Supabase (managed) | Data utama: users, auctions, bids, wallet, audit logs |
| **Cache** | Redis | Upstash (managed) | Session, bid lock (distributed), leaderboard sorted sets |
| **Storage** | Cloudflare R2 | S3-compatible | Foto barang, video, aset cosmetic, dokumen KYC |

---

## 2. Struktur Monorepo Turborepo

```mermaid
graph LR
    subgraph MONOREPO["EMERALD KINGDOM MONOREPO"]
        subgraph APPS["apps/"]
            A1["web<br/>Next.js 14+<br/>User Frontend"]
            A2["admin<br/>Next.js 14+<br/>Admin Panel"]
            A3["api<br/>NestJS<br/>Backend API"]
            A4["oracle<br/>FastAPI<br/>AI Service"]
        end

        subgraph PACKAGES["packages/"]
            P1["db<br/>Prisma Schema<br/>+ Client"]
            P2["types<br/>Zod Schemas<br/>+ TS Types"]
            P3["ui<br/>Shared<br/>Components"]
        end
    end

    A1 --> P1
    A1 --> P2
    A1 --> P3
    A2 --> P1
    A2 --> P2
    A3 --> P1
    A3 --> P2
    A4 --> P1

    style MONOREPO fill:#0a0a0f,stroke:#10b981,color:#fff
    style APPS fill:#1a1a2e,stroke:#ffd700,color:#fff
    style PACKAGES fill:#1a1a2e,stroke:#a855f7,color:#fff
```

### Penjelasan Packages Shared

| Package | Fungsi | Dikonsumsi Oleh |
|---------|--------|-----------------|
| `packages/db` | Prisma schema tunggal untuk seluruh database. Semua app menggunakan client yang sama | web, admin, api, oracle |
| `packages/types` | Zod schemas dan TypeScript types yang dipakai bersama (contoh: `WS_EVENTS`, DTOs) | web, admin, api |
| `packages/ui` | Komponen UI yang di-share antara web dan admin (button, card, modal) | web, admin |

---

## 3. Alur Data Lelang Real-Time (Live Auction Flow)

```mermaid
sequenceDiagram
    participant U as User (Browser)
    participant WS as WebSocket Server<br/>(Socket.io)
    participant API as NestJS API
    participant REDIS as Redis<br/>(Distributed Lock)
    participant DB as PostgreSQL
    participant ALL as All Viewers

    U->>WS: bid:place {auctionId, amount}
    WS->>API: handlePlaceBid()

    API->>REDIS: SETNX bid_lock:{auctionId}
    alt Lock Acquired
        REDIS-->>API: OK
        API->>DB: Validate auction status & user balance
        DB-->>API: Valid
        API->>DB: INSERT bid + UPDATE auction currentPrice
        API->>DB: DEDUCT user wallet (hold)
        API->>REDIS: DEL bid_lock:{auctionId}
        API->>DB: LOG exp_event (EXP reward)

        API-->>WS: Broadcast bid:new
        WS-->>ALL: bid:new {bidder, amount, newPrice}
        WS-->>ALL: timer:update {remaining}

        Note over API,DB: Anti-Snipe Check
        alt Last 30 seconds
            API-->>WS: timer:extended {+30s}
            WS-->>ALL: timer:extended
        end
    else Lock Denied
        REDIS-->>API: FAIL
        API-->>WS: error:bid_conflict
        WS-->>U: "Bid sedang diproses, coba lagi"
    end
```

### Penjelasan Flow

1. **User** mengirim bid melalui WebSocket (`bid:place`)
2. **Redis distributed lock** mencegah race condition (hanya 1 bid diproses per waktu per auction)
3. **Validasi** dilakukan: status lelang, saldo user, increment minimum
4. **Database** diupdate secara atomik: bid baru disimpan, harga terakhir diperbarui, saldo user di-hold
5. **Broadcast** ke semua viewer yang sedang menonton lelang tersebut
6. **Anti-snipe**: jika bid masuk di 30 detik terakhir, timer otomatis diperpanjang

---

## 4. Arsitektur Keamanan (Security Architecture)

```mermaid
graph TB
    subgraph EDGE["EDGE PROTECTION"]
        SSL["SSL/TLS<br/>End-to-End Encryption"]
        WAF["Cloudflare WAF<br/>+ DDoS Protection"]
    end

    subgraph AUTH["AUTHENTICATION & AUTHORIZATION"]
        JWT["JWT Access Token<br/>(15 menit)"]
        REFRESH["JWT Refresh Token<br/>(7 hari)"]
        GUARD["AuthGuard<br/>+ RolesGuard (RBAC)"]
        ARGON["Argon2id<br/>Password Hashing"]
    end

    subgraph RATE["RATE LIMITING"]
        THROTTLE["@nestjs/throttler<br/>Per-endpoint Rate Limit"]
        CAPTCHA["CAPTCHA Adaptif<br/>Saat Anomali Terdeteksi"]
    end

    subgraph DATA_SECURITY["DATA SECURITY"]
        ENC["AES-256-GCM<br/>Enkripsi Kolom KYC"]
        AUDIT["Audit Logs<br/>Append-Only<br/>Immutable"]
        WALLET["Wallet Transactions<br/>Append-Only Ledger"]
        IDEM["Idempotency Key<br/>Prevent Double Charge"]
    end

    subgraph FRAUD["ANTI-FRAUD"]
        ML["ML Detection<br/>Oracle Engine"]
        MULTI["Multi-Account Detection<br/>1 NIK = 1 Akun"]
        IP["IP Whitelist / Blacklist<br/>SecurityRule"]
    end

    SSL --> WAF
    WAF --> THROTTLE
    THROTTLE --> GUARD
    GUARD --> JWT
    JWT --> REFRESH
    GUARD --> ARGON

    GUARD --> ENC
    GUARD --> AUDIT
    GUARD --> WALLET
    WALLET --> IDEM

    GUARD --> ML
    ML --> MULTI
    ML --> IP
    THROTTLE --> CAPTCHA

    style EDGE fill:#1a1a2e,stroke:#ef4444,color:#fff
    style AUTH fill:#1a1a2e,stroke:#ffd700,color:#fff
    style RATE fill:#1a1a2e,stroke:#f97316,color:#fff
    style DATA_SECURITY fill:#1a1a2e,stroke:#10b981,color:#fff
    style FRAUD fill:#1a1a2e,stroke:#a855f7,color:#fff
```

### Lapisan Keamanan

| Lapisan | Komponen | Detail |
|---------|----------|--------|
| **Edge** | Cloudflare WAF + SSL | DDoS protection, TLS termination, geo-blocking |
| **Rate Limiting** | NestJS Throttler | 100 req/60s default, lebih ketat untuk endpoint sensitif |
| **Auth** | JWT + Argon2id | Access token 15 menit, refresh 7 hari, password hash Argon2id |
| **RBAC** | RolesGuard | 5 role admin: SUPER_ADMIN, AUCTION_MANAGER, KYC_OFFICER, CONTENT_MANAGER, SUPPORT_OFFICER |
| **Enkripsi** | AES-256-GCM | Data KYC (KTP, selfie) dienkripsi per-kolom di database |
| **Audit** | Append-Only Logs | Semua aksi admin dicatat dan tidak bisa dihapus/diubah |
| **Anti-Fraud** | Oracle Engine (AI) | Deteksi bid sniping, multi-akun, pola mencurigakan |

---

## 5. Tabel Database Kritis

```mermaid
erDiagram
    USERS ||--o{ BIDS : "places"
    USERS ||--o| WALLET_ACCOUNTS : "owns"
    USERS ||--o| USER_KYC : "submits"
    USERS ||--o{ USER_ACHIEVEMENTS : "earns"
    USERS ||--o{ USER_COSMETICS : "collects"
    USERS ||--o{ RANK_HISTORY : "progresses"

    AUCTIONS ||--o{ BIDS : "receives"
    AUCTIONS ||--o| MUSEUM_ITEMS : "featured in"

    WALLET_ACCOUNTS ||--o{ WALLET_TRANSACTIONS : "records"

    ACHIEVEMENTS ||--o{ USER_ACHIEVEMENTS : "unlocked by"
    COSMETICS ||--o{ USER_COSMETICS : "owned by"

    EVENTS ||--o{ AUCTIONS : "hosts"

    ADMIN_USERS ||--o{ AUDIT_LOGS : "generates"

    USERS {
        string id PK
        string username
        string email
        enum rank
        int totalExp
        int totalWins
    }

    AUCTIONS {
        string id PK
        string title
        enum type
        enum status
        decimal currentPrice
        datetime endTime
    }

    WALLET_TRANSACTIONS {
        string id PK
        string walletId FK
        enum type
        int amount
        string description
    }

    AUDIT_LOGS {
        string id PK
        string adminId FK
        string action
        string targetId
        json details
    }
```

---

> [!IMPORTANT]
> Diagram di atas menggambarkan arsitektur sistem **Emerald Kingdom** secara menyeluruh. Untuk keperluan presentasi Tugas Akhir, diagram-diagram ini bisa diekspor sebagai gambar dari preview Mermaid, atau di-screenshot langsung dari tampilan markdown ini.

> [!TIP]
> Jika kamu butuh gambar PNG/SVG terpisah dari salah satu diagram di atas untuk dimasukkan ke dokumen laporan, beri tahu saya diagram yang mana dan saya akan membuatnya sebagai file gambar tersendiri.
