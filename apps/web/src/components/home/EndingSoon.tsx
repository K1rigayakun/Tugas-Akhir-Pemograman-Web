// apps/web/src/components/home/EndingSoon.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type EndingSoonItem = {
  id: string;
  name: string;
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary" | "transcendent";
  currentPrice: number;
  endsAt: Date;
};

const DUMMY_ENDING: EndingSoonItem[] = [
  { id: "e1", name: "Shadowblade Dagger",        rarity: "epic",      currentPrice: 5500, endsAt: new Date(Date.now() + 1000 * 60 * 45)      },
  { id: "e2", name: "Baron's Signet",             rarity: "rare",      currentPrice: 980,  endsAt: new Date(Date.now() + 1000 * 60 * 120)     },
  { id: "e3", name: "Veil of the Shadow Court",  rarity: "legendary", currentPrice: 22000,endsAt: new Date(Date.now() + 1000 * 60 * 60 * 3)  },
];

export default function EndingSoon() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(headingRef.current, {
        opacity: 0,
        y: 30,
        duration: 0.8,
        scrollTrigger: { trigger: headingRef.current, start: "top 80%" },
      });

      gsap.from(".ending-row", {
        opacity: 0,
        x: -30,
        duration: 0.6,
        stagger: 0.12,
        scrollTrigger: { trigger: sectionRef.current, start: "top 75%" },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{ padding: "4rem 2rem", maxWidth: "1200px", margin: "0 auto" }}
    >
      <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
        <h2
          ref={headingRef}
          style={{
            fontFamily: "var(--font-subheading)",
            fontSize: "clamp(1.5rem, 3vw, 2.5rem)",
            color: "var(--color-gold)",
            letterSpacing: "0.1em",
          }}
        >
          Ending Soon
        </h2>
        <p style={{
          color: "var(--color-ivory)",
          opacity: 0.5,
          fontSize: "0.85rem",
          marginTop: "0.5rem",
          letterSpacing: "0.05em",
        }}>
          The hour grows late. Claim your prize before it is lost forever.
        </p>
        <div style={{
          width: "80px", height: "1px",
          background: "linear-gradient(90deg, transparent, var(--color-gold), transparent)",
          margin: "1rem auto 0",
        }} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {DUMMY_ENDING.map((item) => (
          <EndingRow key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}

// ── Satu baris item ending soon ───────────────────────────────
function EndingRow({ item }: { item: EndingSoonItem }) {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(item.endsAt));

  // Update countdown setiap detik
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(item.endsAt));
    }, 1000);
    return () => clearInterval(interval);
  }, [item.endsAt]);

  // Makin merah kalau waktu makin sedikit (< 1 jam)
  const isUrgent = item.endsAt.getTime() - Date.now() < 1000 * 60 * 60;

  return (
    <div
      className="ending-row"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "1.25rem 1.5rem",
        background: "rgba(13,59,46,0.25)",
        border: `1px solid ${isUrgent ? "rgba(244,67,54,0.4)" : "rgba(201,168,76,0.15)"}`,
        borderRadius: "4px",
        backdropFilter: "blur(6px)",
        flexWrap: "wrap",
        gap: "1rem",
      }}
    >
      {/* Nama & rarity */}
      <div style={{ flex: 1, minWidth: "180px" }}>
        <p style={{
          fontFamily: "var(--font-subheading)",
          fontSize: "0.95rem",
          color: "var(--color-ivory)",
        }}>
          {item.name}
        </p>
        <span style={{
          fontSize: "0.65rem",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: getRarityColor(item.rarity),
        }}>
          {item.rarity}
        </span>
      </div>

      {/* Harga */}
      <p style={{
        fontFamily: "var(--font-numeric)",
        fontSize: "1rem",
        color: "var(--color-gold)",
      }}>
        ♛ {item.currentPrice.toLocaleString("id-ID")} CC
      </p>

      {/* Countdown */}
      <p style={{
        fontFamily: "var(--font-numeric)",
        fontSize: "1rem",
        color: isUrgent ? "#f44336" : "var(--color-ivory)",
        minWidth: "90px",
        textAlign: "right",
        animation: isUrgent ? "aura-pulse-epic 1s ease-in-out infinite" : "none",
      }}>
        {timeLeft}
      </p>
    </div>
  );
}

// Helper — hitung sisa waktu dalam format HH:MM:SS
function getTimeLeft(endsAt: Date): string {
  const diff = endsAt.getTime() - Date.now();
  if (diff <= 0) return "ENDED";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function getRarityColor(rarity: EndingSoonItem["rarity"]): string {
  const colors: Record<EndingSoonItem["rarity"], string> = {
    common: "#9e9e9e", uncommon: "#4caf50", rare: "#2196f3",
    epic: "#9c27b0", legendary: "#ff9800", transcendent: "#f44336",
  };
  return colors[rarity];
}