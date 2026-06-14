"use client";

import { useState, useMemo } from "react";
import AuctionGrid from "./AuctionGrid";
import { AuctionCardItem } from "./AuctionCard";

interface AuctionCatalogProps {
  initialAuctions: AuctionCardItem[];
  kycApproved: boolean;
}

const CATEGORIES = ["Semua", "Senjata", "Armor", "Pusaka", "Kendaraan", "Properti", "Material", "Lainnya"];
const TYPES = ["SEMUA TIPE", "LIVE", "EKSKLUSIF", "EVENT", "SEALED", "DESCENDING"];
const RARITIES = ["SEMUA RANK", "COMMON", "UNCOMMON", "RARE", "EPIC", "LEGENDARY", "MYTHIC", "DIVINE"];

export default function AuctionCatalog({ initialAuctions, kycApproved }: AuctionCatalogProps) {
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [activeType, setActiveType] = useState("SEMUA TIPE");
  const [activeRarity, setActiveRarity] = useState("SEMUA RANK");

  const filteredAuctions = useMemo(() => {
    return initialAuctions.filter((auction) => {
      // Filter Kategori
      if (activeCategory !== "Semua") {
        if (auction.category !== activeCategory) return false;
      }

      // Filter Tipe (Live, Eksklusif, dsb)
      if (activeType !== "SEMUA TIPE") {
        if (activeType === "LIVE" && auction.auctionType !== "LIVE") return false;
        if (activeType === "EKSKLUSIF" && auction.auctionType !== "RANK_EXCL") return false;
        if (activeType === "EVENT" && auction.auctionType !== "SCHEDULED") return false;
        if (activeType === "SEALED" && auction.auctionType !== "SEALED_CHEST") return false;
        if (activeType === "DESCENDING" && auction.auctionType !== "DESCENDING") return false;
      }

      // Filter Raritas
      if (activeRarity !== "SEMUA RANK") {
        if (auction.rarity !== activeRarity) return false;
      }

      return true;
    });
  }, [initialAuctions, activeCategory, activeType, activeRarity]);

  return (
    <div className="auction-catalog-wrapper">
      <style>{`
        .filter-section {
          margin-bottom: 2rem;
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid var(--color-border);
          border-radius: 12px;
          padding: 1.5rem;
        }
        .filter-row {
          display: flex;
          align-items: center;
          gap: 1rem;
          overflow-x: auto;
          padding-bottom: 0.5rem;
          margin-bottom: 1rem;
        }
        .filter-row:last-child {
          margin-bottom: 0;
        }
        .filter-label {
          font-family: var(--font-cinzel);
          color: var(--color-gold);
          font-weight: bold;
          min-width: 100px;
        }
        .filter-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--color-border);
          color: var(--color-text-muted);
          padding: 0.5rem 1.2rem;
          border-radius: 30px;
          cursor: pointer;
          font-size: 0.85rem;
          font-weight: bold;
          white-space: nowrap;
          transition: all 0.2s;
        }
        .filter-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        .filter-btn.active {
          background: rgba(201, 168, 76, 0.15);
          border-color: var(--color-gold);
          color: var(--color-gold);
        }
      `}</style>

      {/* Filter UI */}
      <div className="filter-section">
        <div className="filter-row">
          <div className="filter-label">Tipe</div>
          {TYPES.map(type => (
            <button 
              key={type} 
              className={`filter-btn ${activeType === type ? 'active' : ''}`}
              onClick={() => setActiveType(type)}
            >
              {type}
            </button>
          ))}
        </div>
        
        <div className="filter-row">
          <div className="filter-label">Kategori</div>
          {CATEGORIES.map(cat => (
            <button 
              key={cat} 
              className={`filter-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="filter-row">
          <div className="filter-label">Raritas</div>
          {RARITIES.map(rarity => (
            <button 
              key={rarity} 
              className={`filter-btn ${activeRarity === rarity ? 'active' : ''}`}
              onClick={() => setActiveRarity(rarity)}
            >
              {rarity}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Output */}
      <AuctionGrid
        auctions={filteredAuctions}
        emptyMessage={`Tidak ada lelang yang sesuai dengan filter (Tipe: ${activeType}, Kategori: ${activeCategory}, Rank: ${activeRarity}).`}
        kycApproved={kycApproved}
      />
    </div>
  );
}
