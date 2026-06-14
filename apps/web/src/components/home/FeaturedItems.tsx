// apps/web/src/components/home/FeaturedItems.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { animate, stagger } from "animejs";
import CrownCoinIcon from "../CrownCoinIcon";

type AuctionItem = {
  id: string;
  name: string;
  category: string;
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary" | "transcendent";
  currentPrice: number;
  bidders: number;
  endsIn: string;
};

const DUMMY_ITEMS: AuctionItem[] = [
  { id:  "1", name: "Blade of the Fallen Emperor",   category: "Weapons",     rarity: "legendary",    currentPrice: 12500, bidders: 24, endsIn: "2j 14m" },
  { id:  "2", name: "Emerald Signet Ring",            category: "Jewelry",     rarity: "epic",         currentPrice: 4800,  bidders: 11, endsIn: "5j 02m" },
  { id:  "3", name: "Crown of the First Sovereign",  category: "Armor",       rarity: "transcendent", currentPrice: 88000, bidders: 47, endsIn: "0j 58m" },
  { id:  "4", name: "Iron Knight Pauldrons",          category: "Armor",       rarity: "rare",         currentPrice: 1200,  bidders:  6, endsIn: "1j 30m" },
  { id:  "5", name: "Merchant's Luck Charm",          category: "Accessories", rarity: "uncommon",     currentPrice: 300,   bidders:  3, endsIn: "8j 00m" },
  { id:  "6", name: "Tome of Ancient Bidding Laws",  category: "Relics",      rarity: "rare",         currentPrice: 2100,  bidders:  9, endsIn: "3j 45m" },
  { id:  "7", name: "Shadowbane Crossbow",            category: "Weapons",     rarity: "epic",         currentPrice: 9300,  bidders: 18, endsIn: "4j 20m" },
  { id:  "8", name: "Veil of the Undying",            category: "Accessories", rarity: "legendary",    currentPrice: 31000, bidders: 33, endsIn: "1j 05m" },
  { id:  "9", name: "Sapphire War Banner",            category: "Relics",      rarity: "epic",         currentPrice: 7600,  bidders: 15, endsIn: "6j 10m" },
  { id: "10", name: "Baron's Gilded Gauntlet",        category: "Armor",       rarity: "rare",         currentPrice: 1800,  bidders:  7, endsIn: "2j 55m" },
  { id: "11", name: "Ring of the Silent Court",       category: "Jewelry",     rarity: "legendary",    currentPrice: 44000, bidders: 29, endsIn: "0j 30m" },
  { id: "12", name: "Obsidian Tower Shield",          category: "Weapons",     rarity: "rare",         currentPrice: 3200,  bidders: 12, endsIn: "7j 00m" },
];

const CATEGORIES = ["All", "Weapons", "Armor", "Jewelry", "Accessories", "Relics"];

function getRarityColor(rarity: AuctionItem["rarity"]): string {
  const colors: Record<AuctionItem["rarity"], string> = {
    common: "#9e9e9e", uncommon: "#4caf50", rare: "#2196f3",
    epic: "#9c27b0", legendary: "#ff9800", transcendent: "#f44336",
  };
  return colors[rarity];
}

const RARITY_LABEL: Record<AuctionItem["rarity"], string> = {
  common: "Common", uncommon: "Uncommon", rare: "Rare",
  epic: "Epic", legendary: "Legendary", transcendent: "Transcendent",
};

export default function FeaturedItems() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = activeCategory === "All"
    ? DUMMY_ITEMS
    : DUMMY_ITEMS.filter((i) => i.category === activeCategory);

  // Animasi card saat filter berubah — Anime.js v4
  useEffect(() => {
    const cards = document.querySelectorAll(".feat-card");
    if (cards.length === 0) return;
    animate(cards, {
      opacity: [0, 1],
      translateY: [16, 0],
      duration: 350,
      delay: stagger(60),
      ease: "outQuad",
    });
  }, [activeCategory]);

  // Animasi heading saat scroll — IntersectionObserver + Anime.js v4
  useEffect(() => {
    const heading = headingRef.current;
    if (!heading) return;

    heading.style.opacity = "0";
    heading.style.transform = "translateY(30px)";

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animate(heading, {
              opacity: [0, 1],
              translateY: [30, 0],
              duration: 800,
              ease: "outCubic",
            });
            observer.unobserve(heading);
          }
        });
      },
      { threshold: 0.15 }
    );

    observer.observe(heading);
    return () => observer.disconnect();
  }, []);

  const isFiltered = activeCategory !== "All";

  return (
    <section ref={sectionRef} style={{ padding: "5rem 0 3rem" }}>

      {/* ── Header dengan fade ke kanan ── */}
      <div
        ref={headingRef}
        className="feat-heading"
        style={{
          position: "relative",
          padding: "2rem 2.5rem",
          marginBottom: "0.5rem",
          overflow: "hidden",
        }}
      >
        {/* Background fade dari kiri ke kanan */}
        <div style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(90deg, rgba(13,59,46,0.55) 0%, rgba(13,59,46,0.25) 45%, transparent 75%)",
          pointerEvents: "none",
        }} />

        <div style={{ position: "relative" }}>
          {/* Label kecil di atas */}
          <p style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.65rem",
            letterSpacing: "0.35em",
            textTransform: "uppercase",
            color: "var(--color-gold)",
            opacity: 0.75,
            marginBottom: "0.4rem",
          }}>
            Emerald Kingdom
          </p>

          {/* Judul section */}
          <h2 style={{
            fontFamily: "var(--font-subheading)",
            fontSize: "clamp(1.4rem, 2.5vw, 2.2rem)",
            color: "var(--color-ivory)",
            letterSpacing: "0.06em",
            marginBottom: "0.75rem",
          }}>
            Featured Auctions
          </h2>

          {/* Berita/info singkat */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
            {[
              "3 new Legendary items listed this week",
              "Live auction starts in 2 hours — Sovereign Hall",
              "Winter Court event ending soon — claim your rewards",
            ].map((news, i) => (
              <p key={i} style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.78rem",
                color: "var(--color-ivory)",
                opacity: 0.5,
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}>
                <span style={{
                  width: "4px", height: "4px", borderRadius: "50%",
                  background: "var(--color-gold)", opacity: 0.7,
                  flexShrink: 0, display: "inline-block",
                }} />
                {news}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* ── Filter kategori — tombol horizontal ── */}
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "0.5rem",
        padding: "0 2.5rem",
        marginBottom: "1.75rem",
      }}>
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.75rem",
                letterSpacing: "0.08em",
                padding: "0.45rem 1.1rem",
                borderRadius: "999px",   // pill shape
                cursor: "pointer",
                transition: "all 0.2s ease",
                border: isActive
                  ? "1px solid var(--color-gold)"
                  : "1px solid rgba(201,168,76,0.25)",
                background: isActive
                  ? "rgba(201,168,76,0.18)"
                  : "rgba(255,255,255,0.04)",
                color: isActive
                  ? "var(--color-gold)"
                  : "rgba(245,240,232,0.55)",
                fontWeight: isActive ? 600 : 400,
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* ── Konten: horizontal scroll (All) atau grid vertikal (filtered) ── */}
      {isFiltered ? (
        // Grid 4 kolom saat filter aktif
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: "1.25rem",
          padding: "0 2.5rem",
        }}>
          {filtered.map((item) => (
            <FeatCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        // Horizontal scroll saat "All"
        <HorizontalScroll items={filtered} />
      )}
    </section>
  );
}

// ── Horizontal scroll wrapper ─────────────────────────────────
function HorizontalScroll({ items }: { items: AuctionItem[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const onMouseDown = (e: React.MouseEvent) => {
    const el = scrollRef.current;
    if (!el) return;
    el.style.cursor = "grabbing";
    const startX    = e.pageX - el.offsetLeft;
    const scrollLeft = el.scrollLeft;

    const onMove = (ev: MouseEvent) => {
      el.scrollLeft = scrollLeft - (ev.pageX - el.offsetLeft - startX);
    };
    const onUp = () => {
      el.style.cursor = "grab";
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  return (
    <>
      <div
        ref={scrollRef}
        onMouseDown={onMouseDown}
        style={{
          display: "flex",
          gap: "1.25rem",
          overflowX: "auto",
          padding: "0.5rem 2.5rem 1rem",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          cursor: "grab",
        }}
      >
        {items.map((item) => (
          <FeatCard key={item.id} item={item} />
        ))}
      </div>
      <p style={{
        textAlign: "center",
        fontSize: "0.65rem",
        color: "var(--color-ivory)",
        opacity: 0.25,
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        marginTop: "0.25rem",
      }}>
        ← drag to explore →
      </p>
    </>
  );
}

// ── Card item individual ──────────────────────────────────────
function FeatCard({ item }: { item: AuctionItem }) {
  const rarityColor = getRarityColor(item.rarity);

  return (
    <div
      className="feat-card"
      style={{
        flexShrink: 0,
        width: "230px",
        background: "rgba(15, 40, 30, 0.75)",
        backdropFilter: "blur(10px)",
        borderRadius: "14px",     // rounded corners
        overflow: "hidden",
        cursor: "pointer",
        border: `1px solid ${rarityColor}33`,
        boxShadow: `0 0 12px ${rarityColor}22`,
        transition: "transform 0.25s ease, box-shadow 0.25s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-6px)";
        e.currentTarget.style.boxShadow = `0 8px 32px ${rarityColor}44`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = `0 0 12px ${rarityColor}22`;
      }}
    >
      {/* Gambar placeholder */}
      <div style={{
        width: "100%",
        height: "150px",
        background: `linear-gradient(135deg, rgba(5,5,8,0.9) 0%, ${rarityColor}18 100%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}>
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" opacity={0.25}>
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
            stroke={rarityColor} strokeWidth="1.5"
            strokeLinecap="round" strokeLinejoin="round"/>
        </svg>

        {/* Rarity badge */}
        <span style={{
          position: "absolute",
          top: "0.6rem",
          right: "0.6rem",
          fontFamily: "var(--font-body)",
          fontSize: "0.58rem",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          padding: "0.2rem 0.55rem",
          background: "rgba(0,0,0,0.6)",
          color: rarityColor,
          border: `1px solid ${rarityColor}88`,
          borderRadius: "999px",
        }}>
          {RARITY_LABEL[item.rarity]}
        </span>
      </div>

      {/* Info */}
      <div style={{ padding: "0.9rem 1rem 1rem" }}>
        {/* Kategori */}
        <p style={{
          fontFamily: "var(--font-body)",
          fontSize: "0.6rem",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--color-gold)",
          opacity: 0.65,
          marginBottom: "0.25rem",
        }}>
          {item.category}
        </p>

        {/* Nama item */}
        <h3 style={{
          fontFamily: "var(--font-subheading)",
          fontSize: "0.88rem",
          color: "var(--color-ivory)",
          lineHeight: 1.4,
          marginBottom: "0.85rem",
          minHeight: "2.4em",
        }}>
          {item.name}
        </h3>

        {/* Harga + bidders */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: "0.75rem",
        }}>
          <div>
            <p style={{
              fontSize: "0.58rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--color-ivory)",
              opacity: 0.4,
              marginBottom: "0.15rem",
            }}>Current Bid</p>
            <p style={{
              fontFamily: "var(--font-numeric)",
              fontSize: "1.05rem",
              color: "var(--color-gold)",
              fontWeight: 600,
            }}>
              <CrownCoinIcon size={14} style={{ marginRight: '4px', verticalAlign: 'text-bottom' }} />
              {item.currentPrice.toLocaleString("id-ID")}
            </p>
          </div>
          <p style={{
            fontSize: "0.65rem",
            color: "var(--color-ivory)",
            opacity: 0.4,
            fontFamily: "var(--font-body)",
          }}>
            {item.bidders} bidders
          </p>
        </div>

        {/* Ends in + tombol bid */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <p style={{
            fontSize: "0.68rem",
            color: "var(--color-ivory)",
            opacity: 0.45,
            fontFamily: "var(--font-body)",
          }}>
            Ends in {item.endsIn}
          </p>

          <button
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.68rem",
              letterSpacing: "0.08em",
              padding: "0.35rem 0.85rem",
              background: `${rarityColor}22`,
              border: `1px solid ${rarityColor}66`,
              color: rarityColor,
              borderRadius: "999px",
              cursor: "pointer",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) =>
              e.currentTarget.style.background = `${rarityColor}44`
            }
            onMouseLeave={(e) =>
              e.currentTarget.style.background = `${rarityColor}22`
            }
          >
            Bid Now
          </button>
        </div>
      </div>
    </div>
  );
}