"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import Link from "next/link";

// Data berita untuk carousel
const NEWS_ITEMS = [
  {
    id: 1,
    tag: "Live Auction",
    title: "Sovereign Hall opens in 2 hours",
    desc: "The rarest items of the season go under the gavel. Don't miss your chance.",
  },
  {
    id: 2,
    tag: "New Listing",
    title: "3 Legendary weapons listed this week",
    desc: "Blade of the Fallen Emperor leads with an opening bid of CC 12,500.",
  },
  {
    id: 3,
    tag: "Event",
    title: "Winter Court event ending soon",
    desc: "Claim your exclusive Winter Court achievement before the season closes.",
  },
  {
    id: 4,
    tag: "Announcement",
    title: "Rank reset scheduled for next month",
    desc: "Sovereign and Emperor holders will receive exclusive commemorative badges.",
  },
];

export default function HeroSection() {
  const containerRef    = useRef<HTMLDivElement>(null);
  const titleRef        = useRef<HTMLHeadingElement>(null);
  const taglineRef      = useRef<HTMLParagraphElement>(null);
  const subtaglineRef   = useRef<HTMLParagraphElement>(null);
  const buttonsRef      = useRef<HTMLDivElement>(null);
  const carouselRef     = useRef<HTMLDivElement>(null);

  const [activeNews, setActiveNews] = useState(0);

  // Auto-play carousel setiap 4 detik
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveNews((prev) => (prev + 1) % NEWS_ITEMS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Animasi GSAP reveal saat halaman load
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(
        [titleRef.current, taglineRef.current, subtaglineRef.current,
         buttonsRef.current, carouselRef.current],
        { opacity: 0, y: 40 }
      );
      gsap.to(
        [titleRef.current, taglineRef.current, subtaglineRef.current,
         buttonsRef.current, carouselRef.current],
        { opacity: 1, y: 0, duration: 1, stagger: 0.2, ease: "power3.out", delay: 0.3 }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "2rem",
        position: "relative",
      }}
    >
      {/* Overlay gelap supaya teks terbaca di atas hexagon */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "radial-gradient(ellipse at center, rgba(5,5,8,0.6) 0%, rgba(5,5,8,0.88) 100%)",
        pointerEvents: "none",
      }} />

      {/* ── Judul utama ── */}
      <h1
        ref={titleRef}
        style={{
          fontFamily: "var(--font-heading)",
          fontSize: "clamp(2.2rem, 6vw, 5.5rem)",
          lineHeight: 1.1,
          letterSpacing: "0.02em",
          position: "relative",
        }}
      >
        <span
          className="gradient-gold"
          style={{
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            display: "block",
          }}
        >
          Emerald Kingdom
        </span>
      </h1>

      {/* ── Tagline ── */}
      <p
        ref={taglineRef}
        style={{
          fontFamily: "var(--font-subheading)",
          color: "var(--color-gold)",
          fontSize: "clamp(0.9rem, 2vw, 1.6rem)",
          letterSpacing: "0.15em",
          marginTop: "1.25rem",
          position: "relative",
        }}
      >
        Where Fortune Meets Glory.
      </p>

      {/* ── Sub-tagline ── */}
      <p
        ref={subtaglineRef}
        style={{
          color: "var(--color-ivory)",
          fontSize: "clamp(0.7rem, 1.2vw, 0.95rem)",
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          marginTop: "0.6rem",
          opacity: 0.55,
          position: "relative",
        }}
      >
        Bid. Conquer. Ascend.
      </p>

      {/* ── Garis dekoratif ── */}
      <div style={{
        width: "100px",
        height: "1px",
        background: "linear-gradient(90deg, transparent, var(--color-gold), transparent)",
        margin: "1.75rem auto",
        position: "relative",
      }} />

      {/* ── Tombol CTA ── */}
      <div
        ref={buttonsRef}
        style={{
          display: "flex",
          gap: "1.25rem",
          flexWrap: "wrap",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <Link href="/auction">
          <button
            className="gradient-gold"
            style={{
              fontFamily: "var(--font-subheading)",
              fontSize: "0.85rem",
              letterSpacing: "0.15em",
              padding: "0.85rem 2.25rem",
              border: "none",
              cursor: "pointer",
              borderRadius: "2px",
              textTransform: "uppercase",
              color: "var(--color-bg-dark)",
              fontWeight: 700,
              boxShadow: "0 0 20px rgba(201,168,76,0.35)",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 0 35px rgba(201,168,76,0.65)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 0 20px rgba(201,168,76,0.35)";
            }}
          >
            Enter the Colosseum
          </button>
        </Link>

        <Link href="/register">
          <button
            style={{
              fontFamily: "var(--font-subheading)",
              fontSize: "0.85rem",
              letterSpacing: "0.15em",
              padding: "0.85rem 2.25rem",
              cursor: "pointer",
              borderRadius: "2px",
              textTransform: "uppercase",
              background: "transparent",
              color: "var(--color-gold)",
              border: "1px solid var(--color-gold)",
              fontWeight: 600,
              transition: "background 0.3s, box-shadow 0.3s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(201,168,76,0.1)";
              e.currentTarget.style.boxShadow = "0 0 20px rgba(201,168,76,0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            Join the Empire
          </button>
        </Link>
      </div>

      {/* ── News Carousel ── */}
      <div
        ref={carouselRef}
        style={{
          marginTop: "3rem",
          width: "100%",
          maxWidth: "560px",
          position: "relative",
        }}
      >
        {/* Card berita */}
        <div style={{
          background: "rgba(13,59,46,0.45)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(201,168,76,0.2)",
          borderRadius: "10px",
          padding: "1.25rem 1.5rem",
          textAlign: "left",
          minHeight: "100px",
          transition: "all 0.4s ease",
        }}>
          {/* Tag */}
          <span style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.6rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--color-gold)",
            background: "rgba(201,168,76,0.12)",
            border: "1px solid rgba(201,168,76,0.3)",
            borderRadius: "999px",
            padding: "0.2rem 0.65rem",
            display: "inline-block",
            marginBottom: "0.6rem",
          }}>
            {NEWS_ITEMS[activeNews].tag}
          </span>

          {/* Judul berita */}
          <p style={{
            fontFamily: "var(--font-subheading)",
            fontSize: "0.95rem",
            color: "var(--color-ivory)",
            marginBottom: "0.35rem",
            lineHeight: 1.4,
          }}>
            {NEWS_ITEMS[activeNews].title}
          </p>

          {/* Deskripsi */}
          <p style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.75rem",
            color: "var(--color-ivory)",
            opacity: 0.5,
            lineHeight: 1.6,
          }}>
            {NEWS_ITEMS[activeNews].desc}
          </p>
        </div>

        {/* Dot indicator */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: "0.5rem",
          marginTop: "0.85rem",
        }}>
          {NEWS_ITEMS.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveNews(i)}
              style={{
                width: i === activeNews ? "20px" : "6px",
                height: "6px",
                borderRadius: "999px",
                background: i === activeNews
                  ? "var(--color-gold)"
                  : "rgba(201,168,76,0.3)",
                border: "none",
                cursor: "pointer",
                padding: 0,
                transition: "all 0.3s ease",
              }}
            />
          ))}
        </div>
      </div>

      {/* ── Scroll indicator ── */}
      <div style={{
        position: "absolute",
        bottom: "2rem",
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.4rem",
        opacity: 0.35,
        animation: "bounce 2s ease-in-out infinite",
      }}>
        <span style={{
          fontFamily: "var(--font-body)",
          fontSize: "0.6rem",
          letterSpacing: "0.25em",
          textTransform: "uppercase",
          color: "var(--color-gold)",
        }}>
          Scroll
        </span>
        <svg width="14" height="20" viewBox="0 0 16 24" fill="none">
          <path d="M8 0 L8 20 M2 14 L8 20 L14 14"
            stroke="var(--color-gold)" strokeWidth="1.5"
            strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </section>
  );
}