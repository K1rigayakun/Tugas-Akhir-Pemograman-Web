// apps/web/src/components/home/LeaderboardSnapshot.tsx
"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type LeaderEntry = {
  rank: 1 | 2 | 3;
  username: string;
  userRank: string;
  totalSpent: number;
  wins: number;
  avatarInitial: string;
};

const DUMMY_LEADERS: LeaderEntry[] = [
  { rank: 1, username: "LordVareth",   userRank: "Emperor",  totalSpent: 284000, wins: 47, avatarInitial: "V" },
  { rank: 2, username: "SilverDuchess",userRank: "Sovereign",totalSpent: 196000, wins: 31, avatarInitial: "S" },
  { rank: 3, username: "IronBaron99",  userRank: "Duke",     totalSpent: 142000, wins: 22, avatarInitial: "I" },
];

const RANK_COLORS: Record<1 | 2 | 3, string> = {
  1: "#FFD700",   // gold
  2: "#C0C0C0",   // silver
  3: "#CD7F32",   // bronze
};

const RANK_LABELS: Record<1 | 2 | 3, string> = {
  1: "1st", 2: "2nd", 3: "3rd",
};

export default function LeaderboardSnapshot() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".lb-heading", {
        opacity: 0, y: 30, duration: 0.8,
        scrollTrigger: { trigger: ".lb-heading", start: "top 85%" },
      });
      gsap.from(".lb-card", {
        opacity: 0, y: 40, duration: 0.6, stagger: 0.15,
        scrollTrigger: { trigger: ".lb-card", start: "top 85%" },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{ padding: "5rem 2.5rem", maxWidth: "900px", margin: "0 auto" }}
    >
      {/* Heading */}
      <div className="lb-heading" style={{ textAlign: "center", marginBottom: "3rem" }}>
        <p style={{
          fontFamily: "var(--font-body)",
          fontSize: "0.65rem",
          letterSpacing: "0.35em",
          textTransform: "uppercase",
          color: "var(--color-gold)",
          opacity: 0.7,
          marginBottom: "0.5rem",
        }}>
          This Week
        </p>
        <h2 style={{
          fontFamily: "var(--font-subheading)",
          fontSize: "clamp(1.4rem, 2.5vw, 2.2rem)",
          color: "var(--color-ivory)",
          letterSpacing: "0.06em",
          marginBottom: "0.5rem",
        }}>
          Top Bidders
        </h2>
        <div style={{
          width: "60px", height: "1px",
          background: "linear-gradient(90deg, transparent, var(--color-gold), transparent)",
          margin: "0 auto",
        }} />
      </div>

      {/* Podium — rank 1 di tengah lebih besar */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1.15fr 1fr",
        gap: "1rem",
        alignItems: "end",
      }}>
        {/* Urutan tampil: 2nd, 1st, 3rd */}
        {[DUMMY_LEADERS[1], DUMMY_LEADERS[0], DUMMY_LEADERS[2]].map((entry) => (
          <LeaderCard key={entry.rank} entry={entry} />
        ))}
      </div>

      {/* Link ke leaderboard penuh */}
      <div style={{ textAlign: "center", marginTop: "2.5rem" }}>
        <button style={{
          fontFamily: "var(--font-subheading)",
          fontSize: "0.75rem",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          padding: "0.6rem 1.75rem",
          background: "transparent",
          border: "1px solid rgba(201,168,76,0.35)",
          color: "var(--color-gold)",
          borderRadius: "2px",
          cursor: "pointer",
          transition: "background 0.2s, border-color 0.2s",
          opacity: 0.8,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(201,168,76,0.08)";
          e.currentTarget.style.borderColor = "rgba(201,168,76,0.6)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.borderColor = "rgba(201,168,76,0.35)";
        }}
        >
          View Full Rankings
        </button>
      </div>
    </section>
  );
}

// ── Card satu pemain ──────────────────────────────────────────
function LeaderCard({ entry }: { entry: LeaderEntry }) {
  const color     = RANK_COLORS[entry.rank];
  const isFirst   = entry.rank === 1;

  return (
    <div
      className="lb-card"
      style={{
        background: isFirst
          ? "rgba(201,168,76,0.08)"
          : "rgba(15,40,30,0.6)",
        border: `1px solid ${color}${isFirst ? "55" : "33"}`,
        borderRadius: "12px",
        padding: isFirst ? "2rem 1.25rem" : "1.5rem 1rem",
        textAlign: "center",
        backdropFilter: "blur(8px)",
        boxShadow: isFirst
          ? `0 0 30px ${color}22, 0 0 60px ${color}11`
          : `0 0 12px ${color}11`,
        transition: "transform 0.25s",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={(e) =>
        e.currentTarget.style.transform = "translateY(-4px)"
      }
      onMouseLeave={(e) =>
        e.currentTarget.style.transform = "translateY(0)"
      }
    >
      {/* Rank label di pojok */}
      <span style={{
        position: "absolute",
        top: "0.6rem",
        left: "0.6rem",
        fontFamily: "var(--font-numeric)",
        fontSize: "0.7rem",
        color,
        opacity: 0.85,
        fontWeight: 700,
      }}>
        {RANK_LABELS[entry.rank]}
      </span>

      {/* Avatar */}
      <div style={{
        width: isFirst ? "64px" : "52px",
        height: isFirst ? "64px" : "52px",
        borderRadius: "50%",
        background: `${color}22`,
        border: `2px solid ${color}66`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto 0.85rem",
        boxShadow: isFirst ? `0 0 20px ${color}44` : "none",
      }}>
        <span style={{
          fontFamily: "var(--font-subheading)",
          fontSize: isFirst ? "1.4rem" : "1.1rem",
          color,
          fontWeight: 700,
        }}>
          {entry.avatarInitial}
        </span>
      </div>

      {/* Username */}
      <p style={{
        fontFamily: "var(--font-subheading)",
        fontSize: isFirst ? "1rem" : "0.85rem",
        color: "var(--color-ivory)",
        marginBottom: "0.25rem",
      }}>
        {entry.username}
      </p>

      {/* User rank */}
      <p style={{
        fontFamily: "var(--font-body)",
        fontSize: "0.6rem",
        letterSpacing: "0.15em",
        textTransform: "uppercase",
        color,
        opacity: 0.75,
        marginBottom: "1rem",
      }}>
        {entry.userRank}
      </p>

      {/* Divider */}
      <div style={{
        width: "40px", height: "1px",
        background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        margin: "0 auto 0.85rem",
      }} />

      {/* Stats */}
      <div style={{ display: "flex", justifyContent: "space-around" }}>
        <div>
          <p style={{
            fontFamily: "var(--font-numeric)",
            fontSize: isFirst ? "1rem" : "0.85rem",
            color,
            fontWeight: 600,
          }}>
            ♛ {(entry.totalSpent / 1000).toFixed(0)}k
          </p>
          <p style={{
            fontSize: "0.55rem",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--color-ivory)",
            opacity: 0.4,
            marginTop: "0.15rem",
          }}>Spent</p>
        </div>
        <div>
          <p style={{
            fontFamily: "var(--font-numeric)",
            fontSize: isFirst ? "1rem" : "0.85rem",
            color,
            fontWeight: 600,
          }}>
            {entry.wins}
          </p>
          <p style={{
            fontSize: "0.55rem",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--color-ivory)",
            opacity: 0.4,
            marginTop: "0.15rem",
          }}>Wins</p>
        </div>
      </div>
    </div>
  );
}