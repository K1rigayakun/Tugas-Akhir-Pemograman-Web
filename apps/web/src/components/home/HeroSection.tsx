"use client";

import { useEffect, useRef, useState } from "react";
import { animate, stagger } from "animejs";
import Link from "next/link";
import { useRouter } from "next/navigation";

const DEFAULT_NEWS_ITEMS = [
  {
    id: "def-1",
    tag: "Live Auction",
    title: "Sovereign Hall Membuka Gerbang",
    desc: "Barang-barang paling langka musim ini akan segera dilelang. Jangan lewatkan kesempatan untuk mendapatkan Relic legendaris.",
    bgImage: "url(https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?q=80&w=2000)", 
    link: "/auction"
  },
  {
    id: "def-2",
    tag: "Terjual",
    title: "Jam Tangan Chronos Terjual 150.000 CC",
    desc: "Rekor baru tercipta di Emperor Rank. Jam tangan Chronos Edisi Terbatas berhasil dimenangkan oleh pengguna tak dikenal.",
    bgImage: "url(https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=2000)",
    link: "/auction"
  },
  {
    id: "def-3",
    tag: "Event",
    title: "Diskon Top Up Festival Kerajaan",
    desc: "Dapatkan bonus 20% Crown Coin untuk setiap top up di atas 5.000 CC selama Festival Kerajaan berlangsung.",
    bgImage: "url(https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=2000)",
    link: "/topup"
  },
  {
    id: "def-4",
    tag: "Properti",
    title: "Villa Emerald Coast Dilelang Besok",
    desc: "Properti paling eksklusif dengan pemandangan laut Emerald kini terbuka untuk penawaran awal di Royal Market.",
    bgImage: "url(https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2000)",
    link: "/auction"
  },
];

export default function HeroSection({ featuredAuctions = [] }: { featuredAuctions?: any[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const newsContentRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const activeData = featuredAuctions
    .filter(a => a.imageUrls && a.imageUrls.length > 0)
    .sort((a, b) => b.startingPrice - a.startingPrice)
    .slice(0, 4);

  const NEWS_ITEMS = activeData.length > 0 
    ? activeData.map((a, i) => ({
        id: a.id,
        tag: a.auctionType === "LIVE" ? "Live Auction" : "Featured",
        title: a.title,
        desc: a.description?.substring(0, 100) + "...",
        bgImage: `url(${a.imageUrls[0]})`,
        link: a.auctionType === "LIVE" ? `/auctions/${a.id}/live` : `/auction/${a.id}`
      }))
    : DEFAULT_NEWS_ITEMS;

  const [activeNews, setActiveNews] = useState(0);

  // State untuk Swipe/Drag slider
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Minimal jarak geser untuk ganti slide (50px)
  const minSwipeDistance = 50;

  const onTouchStartEvent = (e: React.TouchEvent | React.MouseEvent) => {
    setTouchEnd(null);
    if ('touches' in e) {
      setTouchStart(e.targetTouches[0].clientX);
    } else {
      setTouchStart(e.clientX);
    }
  };

  const onTouchMoveEvent = (e: React.TouchEvent | React.MouseEvent) => {
    if (!touchStart) return;
    if ('touches' in e) {
      setTouchEnd(e.targetTouches[0].clientX);
    } else {
      setTouchEnd(e.clientX);
    }
  };

  const onTouchEndEvent = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      // Geser kiri (next)
      setActiveNews((prev) => (prev + 1) % NEWS_ITEMS.length);
    } else if (isRightSwipe) {
      // Geser kanan (prev)
      setActiveNews((prev) => (prev - 1 + NEWS_ITEMS.length) % NEWS_ITEMS.length);
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  // Auto-play carousel setiap 5 detik
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveNews((prev) => (prev + 1) % NEWS_ITEMS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Animasi Inisial (hanya dijalankan sekali saat mount)
  useEffect(() => {
    const leftElements = leftColRef.current?.children;
    if (!leftElements) return;

    Array.from(leftElements).forEach((el) => {
      (el as HTMLElement).style.opacity = "0";
      (el as HTMLElement).style.transform = "translateX(-40px)";
    });

    animate(Array.from(leftElements), {
      opacity: [0, 1],
      translateX: [-40, 0],
      duration: 1000,
      delay: stagger(150, { start: 200 }),
      ease: "outCubic",
    });
  }, []);

  // Animasi transisi konten berita di sisi kanan
  useEffect(() => {
    const newsEl = newsContentRef.current;
    if (!newsEl) return;

    // Reset dan animasi fade-in up untuk teks berita
    animate(newsEl, {
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 800,
      ease: "outCubic",
    });
  }, [activeNews]);

  return (
    <section
      ref={containerRef}
      onMouseDown={onTouchStartEvent}
      onMouseMove={onTouchMoveEvent}
      onMouseUp={onTouchEndEvent}
      onMouseLeave={onTouchEndEvent}
      onTouchStart={onTouchStartEvent}
      onTouchMove={onTouchMoveEvent}
      onTouchEnd={onTouchEndEvent}
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden", // Memastikan gambar background tidak bocor
        cursor: touchStart ? "grabbing" : "grab",
      }}
    >
      {/* 
        LAYER 1: Gambar Slider Background (Full Screen)
        Menggunakan opacity & transform untuk transisi mulus antar gambar berita
      */}
      {NEWS_ITEMS.map((item, index) => (
        <div key={item.id} style={{
          position: "absolute",
          inset: 0,
          background: item.bgImage,
          opacity: index === activeNews ? 1 : 0,
          transform: index === activeNews ? "scale(1)" : "scale(1.05)",
          transition: "all 1.5s cubic-bezier(0.4, 0, 0.2, 1)",
          zIndex: 1,
        }} />
      ))}

      {/* 
        LAYER 2: Gradient Hitam dari Kiri ke Kanan
        Kiri 0-45%: Hitam pekat untuk teks web.
        Kanan 45-100%: Memudar jadi transparan sehingga gambar berita muncul.
      */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "linear-gradient(to right, #0a0c0e 35%, rgba(10,12,14,0.85) 50%, rgba(10,12,14,0) 100%)",
        zIndex: 2,
        pointerEvents: "none",
      }} />

      {/* LAYER 3: Konten (Grid Kiri & Kanan) */}
      <div style={{
        maxWidth: "1400px",
        width: "100%",
        padding: "6rem 2rem 2rem 2rem",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "4rem",
        position: "relative",
        zIndex: 10, // Di atas overlay gradient
        alignItems: "center",
      }}>

        {/* LAYER 3D Background - Placed properly instead of absolute */}
        {/* We will place it in the right column instead of overlapping text */}
        
        {/* KOLOM KIRI: Identitas & CTA Web */}
        <div ref={leftColRef} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{
              width: "48px", height: "48px",
              background: "var(--color-emerald)",
              borderRadius: "12px",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 20px rgba(16,185,129,0.4)"
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.5rem", color: "var(--color-ivory)", letterSpacing: "0.1em" }}>
              Emerald Kingdom
            </h2>
          </div>

          <h1 style={{
            fontFamily: "var(--font-heading)",
            fontSize: "clamp(2.5rem, 5vw, 4.5rem)",
            lineHeight: 1.1,
            color: "var(--color-ivory)",
            marginTop: "1rem",
          }}>
            Lelang Eksklusif <br />
            <span style={{ color: "var(--color-emerald)" }}>Tanpa Batas</span>
          </h1>

          <p style={{
            color: "var(--color-text-muted)",
            fontSize: "1.1rem",
            lineHeight: 1.6,
            maxWidth: "500px",
          }}>
            Dari properti mewah, jam tangan langka, hingga peninggalan kerajaan. Temukan barang impian Anda di platform lelang paling prestisius.
          </p>

          <div style={{ display: "flex", gap: "1rem", marginTop: "1rem", flexWrap: "wrap" }}>
            <Link href={NEWS_ITEMS[activeNews].link}>
              <button style={{
                padding: "0.85rem 2rem",
                background: "var(--color-emerald)",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontFamily: "var(--font-subheading)",
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "0 0 20px rgba(16,185,129,0.3)",
                transition: "all 0.3s ease"
              }}>
                Mulai Menawar
              </button>
            </Link>
            <Link href="/register">
              <button style={{
                padding: "0.85rem 2rem",
                background: "rgba(255,255,255,0.05)",
                color: "var(--color-ivory)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                fontFamily: "var(--font-subheading)",
                fontWeight: 600,
                cursor: "pointer",
                backdropFilter: "blur(10px)",
                transition: "all 0.3s ease"
              }}>
                Daftar Akun
              </button>
            </Link>
          </div>
        </div>

        {/* KOLOM KANAN: Teks Berita yang Menumpang di Atas Background Transparan */}
        <div style={{ 
          display: "flex", 
          flexDirection: "column", 
          justifyContent: "flex-end", 
          alignItems: "flex-end", // Rata kanan
          textAlign: "right",
          height: "100%", 
          paddingBottom: "2rem",
          position: "relative"
        }}>
          <div ref={newsContentRef} style={{ maxWidth: "500px" }}>
            <span style={{
              background: "rgba(255,255,255,0.15)",
              padding: "0.4rem 1rem",
              borderRadius: "99px",
              color: "#fff",
              fontSize: "0.75rem",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              display: "inline-block",
              marginBottom: "1.25rem",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.2)"
            }}>
              {NEWS_ITEMS[activeNews].tag}
            </span>
            
            <h3 style={{
              fontFamily: "var(--font-heading)",
              fontSize: "2.5rem",
              color: "#fff",
              lineHeight: 1.2,
              marginBottom: "1rem",
              textShadow: "0 4px 20px rgba(0,0,0,0.8)"
            }}>
              {NEWS_ITEMS[activeNews].title}
            </h3>
            
            <p style={{
              color: "rgba(255,255,255,0.9)",
              fontSize: "1.1rem",
              lineHeight: 1.5,
              textShadow: "0 2px 10px rgba(0,0,0,0.8)"
            }}>
              {NEWS_ITEMS[activeNews].desc}
            </p>
          </div>

          {/* Dots Indicator */}
          <div style={{
            display: "flex",
            gap: "0.5rem",
            marginTop: "2.5rem"
          }}>
            {NEWS_ITEMS.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveNews(i)}
                style={{
                  width: i === activeNews ? "32px" : "8px",
                  height: "8px",
                  borderRadius: "4px",
                  background: i === activeNews ? "var(--color-emerald)" : "rgba(255,255,255,0.3)",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  boxShadow: i === activeNews ? "0 0 10px rgba(16,185,129,0.5)" : "none"
                }}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}