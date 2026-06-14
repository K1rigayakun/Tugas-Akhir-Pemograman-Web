"use client";

import { useRef, useEffect } from "react";
import { animate, stagger } from "animejs";
import { Clock } from "lucide-react";
import { useRouter } from "next/navigation";

import { AUCTION_CATEGORIES } from "../../constants/categories";

import AuctionCard from "../auction/AuctionCard";

export default function CategorySlider({ categories = [] }: { categories?: { id: string; name: string; items: any[] }[] }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  return (
    <section ref={sectionRef} style={{ position: "relative", zIndex: 10, padding: "4rem 2rem", maxWidth: "1600px", margin: "0 auto" }}>
      <h2 style={{
        textAlign: "center",
        fontFamily: "var(--font-heading)",
        fontSize: "2rem",
        color: "var(--color-gold)",
        marginBottom: "3rem",
        letterSpacing: "0.1em"
      }}>
        Jelajahi Berdasarkan Kategori
      </h2>

      {categories.length === 0 ? (
        <div style={{ textAlign: "center", color: "var(--color-text-muted)", padding: "2rem" }}>
          Tidak ada lelang yang tersedia di kategori mana pun saat ini.
        </div>
      ) : (
        categories.map((category) => (
        <div key={category.id} className="category-block" style={{ marginBottom: "5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <h3 style={{
              fontFamily: "var(--font-heading)",
              fontSize: "1.5rem",
              color: "var(--color-ivory)",
              borderLeft: "4px solid var(--color-emerald)",
              paddingLeft: "1rem"
            }}>
              {category.name}
            </h3>
            <a href={`/search?category=${encodeURIComponent(category.name)}`} style={{ color: "var(--color-emerald)", fontSize: "0.9rem", fontWeight: "bold", textDecoration: "none" }}>
              Lihat Semua &rarr;
            </a>
          </div>
          
          {/* Grid 3 Baris Horizontal Scroll untuk ITEM */}
          <div className="custom-horizontal-scroll" style={{
            display: "grid",
            gridTemplateColumns: `repeat(${Math.ceil(category.items.length / 3)}, 300px)`,
            gridTemplateRows: "repeat(3, auto)",
            gridAutoFlow: "column", // Penuhi ke bawah dulu (3 baris), lalu kolom baru
            gap: "1.5rem",
            overflowX: "auto",
            paddingBottom: "1.5rem"
          }}>
            {category.items.map((item, i) => {
              return (
                <div key={item.id} style={{ width: "300px" }}>
                  <AuctionCard auction={item} kycApproved={true} />
                </div>
              );
            })}
          </div>
        </div>
        ))
      )}
    </section>
  );
}
