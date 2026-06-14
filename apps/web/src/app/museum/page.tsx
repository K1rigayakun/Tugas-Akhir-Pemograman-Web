"use client";

import { useEffect, useMemo, useState } from "react";
import PageHeading from "../../components/PageHeading";
import AnimatedSection from "../../components/AnimatedSection";
import { API_URL } from "../../lib/api";

type MuseumItem = {
  id: string;
  editorial: string;
  featuredAt: string;
  auction: {
    id: string;
    title: string;
    rarity: string;
    imageUrls: string[];
    finalPrice: number;
    winner: { username: string; privacyMode: string; rank: string } | null;
    _count: { bids: number };
  }
};

export default function MuseumPage() {
  const [items, setItems] = useState<MuseumItem[]>([]);
  const [search, setSearch] = useState("");
  const [rarity, setRarity] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/museum/items?limit=50`)
      .then((response) => response.ok ? response.json() : [])
      .then((data) => {
        if (Array.isArray(data)) setItems(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const filtered = useMemo(() => items.filter((item) => {
    const matchesSearch = item.auction.title.toLowerCase().includes(search.toLowerCase());
    return matchesSearch && (rarity === "ALL" || item.auction.rarity === rarity);
  }), [items, search, rarity]);

  return (
    <main className="page-wrap">
      <PageHeading eyebrow="The Imperial Museum" title="Relics That Outlived the Gavel" description="Galeri sejarah platform, tempat rekor dan barang paling langka diabadikan." />
      <AnimatedSection delay={100}>
        <div className="toolbar">
          <input className="search-input museum-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari relik..." />
          {["ALL", "RARE", "EPIC", "LEGENDARY", "TRANSCENDENT"].map((value) => (
            <button key={value} className={`tool-button ${rarity === value ? "active" : ""}`} onClick={() => setRarity(value)}>{value}</button>
          ))}
        </div>
      </AnimatedSection>
      <AnimatedSection staggerChildren staggerSelector=".museum-card" delay={250}>
        {isLoading ? (
          <p style={{ textAlign: "center", color: "var(--color-text-muted)" }}>Loading relics...</p>
        ) : filtered.length === 0 ? (
          <p style={{ textAlign: "center", color: "var(--color-text-muted)" }}>Belum ada relik yang ditemukan di museum.</p>
        ) : (
          <section className="museum-grid">
            {filtered.map((item) => (
              <MuseumCard key={item.id} item={item} />
            ))}
          </section>
        )}
      </AnimatedSection>
    </main>
  );
}

function MuseumCard({ item }: { item: MuseumItem }) {
  const [rinaLore, setRinaLore] = useState<string | null>(null);
  const [loadingLore, setLoadingLore] = useState(false);

  const fetchLore = async () => {
    if (rinaLore) return; // Already fetched
    setLoadingLore(true);
    try {
      const res = await fetch(`${API_URL}/ai/museum/${item.auction.id}/story`);
      const data = await res.json();
      if (data.success) {
        setRinaLore(data.story);
      } else {
        setRinaLore("RINA menolak untuk berbicara tentang artefak ini.");
      }
    } catch (err) {
      setRinaLore("Koneksi ke jaringan arsip RINA terputus.");
    } finally {
      setLoadingLore(false);
    }
  };

  return (
    <article className={`museum-card panel ${item.auction.rarity.toLowerCase()}`}>
      <div className="museum-image">
        {item.auction.imageUrls?.[0] ? (
          <img src={item.auction.imageUrls[0]} alt={item.auction.title} />
        ) : (
          <div style={{ height: "100%", background: "#111", display: "flex", alignItems: "center", justifyContent: "center" }}>No Image</div>
        )}
      </div>
      <div>
        <span>{item.auction.rarity}</span>
        <h2>{item.auction.title}</h2>
        <p>{item.editorial}</p>
        <dl>
          <dt>Final bid</dt><dd>{(item.auction.finalPrice || 0).toLocaleString("id-ID")} CC</dd>
          <dt>Winner</dt><dd>{item.auction.winner?.privacyMode === "PUBLIC" ? item.auction.winner.username : "The Unknown"}</dd>
          <dt>Bids</dt><dd>{item.auction._count?.bids || 0}</dd>
        </dl>
        
        <div style={{ marginTop: "1.5rem", borderTop: "1px dashed rgba(255,255,255,0.2)", paddingTop: "1rem" }}>
          {!rinaLore && !loadingLore ? (
            <button 
              onClick={fetchLore} 
              style={{ background: "transparent", border: "1px solid var(--color-emerald)", color: "var(--color-emerald)", padding: "0.5rem 1rem", borderRadius: "20px", cursor: "pointer", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.5rem", width: "100%", justifyContent: "center", transition: "all 0.3s" }}
              onMouseOver={(e) => e.currentTarget.style.background = "rgba(46, 204, 113, 0.1)"}
              onMouseOut={(e) => e.currentTarget.style.background = "transparent"}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10H12V2z"></path><path d="M12 12 2.3 2.3"></path></svg>
              Ask R.I.N.A for Lore
            </button>
          ) : loadingLore ? (
            <div style={{ textAlign: "center", color: "var(--color-emerald)", fontSize: "0.85rem", fontStyle: "italic", animation: "pulse 1.5s infinite" }}>
              RINA is accessing the imperial archives...
            </div>
          ) : (
            <div style={{ background: "rgba(0,0,0,0.4)", borderLeft: "3px solid var(--color-emerald)", padding: "1rem", borderRadius: "0 8px 8px 0", fontSize: "0.9rem", color: "var(--color-ivory)", lineHeight: "1.6", fontStyle: "italic", position: "relative" }}>
              <span style={{ position: "absolute", top: "-10px", left: "10px", background: "#000", color: "var(--color-emerald)", padding: "0 5px", fontSize: "0.75rem", fontWeight: "bold", border: "1px solid var(--color-emerald)", borderRadius: "4px" }}>R.I.N.A</span>
              {rinaLore}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
