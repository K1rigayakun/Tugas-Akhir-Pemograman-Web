"use client";

import { useEffect, useMemo, useState } from "react";
import PageHeading from "../../components/PageHeading";
import { API_URL } from "../../lib/api";
import { demoMuseum } from "../../lib/demo";

type MuseumItem = (typeof demoMuseum)[number];

export default function MuseumPage() {
  const [items, setItems] = useState<MuseumItem[]>(demoMuseum);
  const [search, setSearch] = useState("");
  const [rarity, setRarity] = useState("ALL");

  useEffect(() => {
    fetch(`${API_URL}/museum/items?limit=50`)
      .then((response) => response.ok ? response.json() : demoMuseum)
      .then((data) => Array.isArray(data) && data.length && setItems(data))
      .catch(() => setItems(demoMuseum));
  }, []);

  const filtered = useMemo(() => items.filter((item) => {
    const matchesSearch = item.auction.title.toLowerCase().includes(search.toLowerCase());
    return matchesSearch && (rarity === "ALL" || item.auction.rarity === rarity);
  }), [items, search, rarity]);

  return (
    <main className="page-wrap">
      <PageHeading eyebrow="The Imperial Museum" title="Relics That Outlived the Gavel" description="Galeri sejarah platform, tempat rekor dan barang paling langka diabadikan." />
      <div className="toolbar">
        <input className="search-input museum-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari relik..." />
        {["ALL", "RARE", "EPIC", "LEGENDARY", "TRANSCENDENT"].map((value) => (
          <button key={value} className={`tool-button ${rarity === value ? "active" : ""}`} onClick={() => setRarity(value)}>{value}</button>
        ))}
      </div>
      <section className="museum-grid">
        {filtered.map((item) => (
          <article key={item.id} className={`museum-card panel ${item.auction.rarity.toLowerCase()}`}>
            <div className="museum-image">
              <img src={item.auction.imageUrls[0]} alt={item.auction.title} />
            </div>
            <div>
              <span>{item.auction.rarity}</span>
              <h2>{item.auction.title}</h2>
              <p>{item.editorial}</p>
              <dl>
                <dt>Final bid</dt><dd>{item.auction.finalPrice.toLocaleString("id-ID")} CC</dd>
                <dt>Winner</dt><dd>{item.auction.winner?.privacyMode === "PUBLIC" ? item.auction.winner.username : "The Unknown"}</dd>
                <dt>Bids</dt><dd>{item.auction._count.bids}</dd>
              </dl>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
