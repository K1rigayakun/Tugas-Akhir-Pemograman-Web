"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Clock, Gavel, Lock, Users, Eye } from "lucide-react";

export interface AuctionCardItem {
  id: string;
  title: string;
  description?: string | null;
  category?: string | null;
  rarity?: string | null;
  auctionType?: string | null;
  status?: string | null;
  startingPrice: number;
  currentPrice?: number | null;
  startTime?: string | Date | null;
  endTime?: string | Date | null;
  minimumRank?: string | null;
  imageUrls?: string[];
  _count?: {
    bids?: number;
    watchlists?: number;
  };
  bids?: unknown[] | number;
  locked?: boolean;
  lockReason?: string;
  badge?: string;
}

interface AuctionCardProps {
  auction: AuctionCardItem;
  kycApproved?: boolean;
}

const FALLBACK_IMAGES: Record<string, string> = {
  LIVE: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=900&q=80",
  RANK_EXCL: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=900&q=80",
  SEALED_CHEST: "https://images.unsplash.com/photo-1515569067071-ec3b51335dd0?w=900&q=80",
  DESCENDING: "https://images.unsplash.com/photo-1567427018141-0584cfcbf1b8?w=900&q=80",
  DEFAULT: "https://images.unsplash.com/photo-1523292562811-8fa7962a78c8?w=900&q=80",
};

function formatRemaining(endTime?: string | Date | null) {
  if (!endTime) return "Belum dijadwalkan";
  const diff = new Date(endTime).getTime() - Date.now();
  if (Number.isNaN(diff)) return "Belum dijadwalkan";
  if (diff <= 0) return "Selesai";

  const minutes = Math.floor(diff / 60_000);
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  const mins = minutes % 60;

  if (days > 0) return `${days}h ${hours}j`;
  if (hours > 0) return `${hours}j ${mins}m`;
  return `${mins}m`;
}

function getBidCount(auction: AuctionCardItem) {
  if (typeof auction._count?.bids === "number") return auction._count.bids;
  if (Array.isArray(auction.bids)) return auction.bids.length;
  if (typeof auction.bids === "number") return auction.bids;
  return 0;
}

function getBadges(auction: AuctionCardItem) {
  const badges = new Set<string>();
  if (auction.badge) badges.add(auction.badge);
  if (auction.auctionType === "LIVE") {
    const started = auction.startTime ? new Date(auction.startTime).getTime() <= Date.now() : false;
    badges.add(started && auction.status !== "UPCOMING" ? "LIVE" : "SEGERA");
  }
  if (auction.auctionType === "RANK_EXCL" || auction.minimumRank) badges.add("EXCLUSIVE");
  if (auction.auctionType === "SEALED_CHEST") badges.add("SEALED");
  if (auction.auctionType === "DESCENDING") badges.add("DESCENDING");
  return Array.from(badges);
}

export default function AuctionCard({ auction, kycApproved = true }: AuctionCardProps) {
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(() => formatRemaining(auction.endTime));
  const price = auction.currentPrice && auction.currentPrice > 0 ? auction.currentPrice : auction.startingPrice;
  const bidderCount = getBidCount(auction);
  const imageUrl = auction.imageUrls?.[0] || FALLBACK_IMAGES[auction.auctionType || "DEFAULT"] || FALLBACK_IMAGES.DEFAULT;
  const locked = auction.locked || !kycApproved;
  const lockReason = auction.lockReason || (!kycApproved ? "Butuh KYC" : "");
  const badges = useMemo(() => getBadges(auction), [auction]);

  useEffect(() => {
    setMounted(true);
    // Update segera saat mount jika berbeda dengan render awal
    setTimeLeft(formatRemaining(auction.endTime));
    const interval = window.setInterval(() => {
      setTimeLeft(formatRemaining(auction.endTime));
    }, 30_000);
    return () => window.clearInterval(interval);
  }, [auction.endTime]);

  return (
    <article className={`auction-card-v2 ${locked ? "is-locked" : ""}`}>
      <div className="auction-card-v2__media">
        <img src={imageUrl} alt={auction.title} loading="lazy" />
        <div className="auction-card-v2__badges">
          {badges.map((badge) => (
            <span key={badge}>{badge}</span>
          ))}
        </div>
        
        {/* Tambahkan indikator Viewers/Bidder di sudut foto */}
        <div style={{
          position: "absolute",
          bottom: "8px",
          left: "8px",
          background: "rgba(0, 0, 0, 0.7)",
          color: "white",
          padding: "2px 6px",
          borderRadius: "4px",
          fontSize: "0.75rem",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          gap: "4px"
        }}>
          {auction.auctionType === "LIVE" ? (
            <>
              <Eye size={12} /> {mounted ? ((auction as any).viewers || bidderCount || Math.floor(Math.random() * 50) + 10) : "..."} penonton
            </>
          ) : (
            <>
              <Users size={12} /> {bidderCount}
            </>
          )}
        </div>
        {locked && (
          <div className="auction-card-v2__lock">
            <Lock size={18} />
            <span>{lockReason}</span>
          </div>
        )}
      </div>

      <div className="auction-card-v2__body">
        <div className="auction-card-v2__meta">
          <span>{auction.rarity || "COMMON"}</span>
          <span>{auction.category || "Lelang"}</span>
        </div>
        <h3>{auction.title}</h3>
        <p>{auction.description || "Relik siap dilelang di Emerald Kingdom."}</p>

        <div className="auction-card-v2__stats">
          <div>
            <span>Harga</span>
            <strong>{price.toLocaleString("id-ID")} CC</strong>
          </div>
          <div>
            <span>Timer</span>
            <strong><Clock size={14} /> {mounted ? timeLeft : "..."}</strong>
          </div>
          <div>
            <span>Bidder</span>
            <strong><Users size={14} /> {bidderCount}</strong>
          </div>
        </div>

        {locked ? (
          <button className="auction-card-v2__action" disabled>
            <Lock size={16} />
            Terkunci
          </button>
        ) : (
          <Link className="auction-card-v2__action" href={`/auction/${auction.id}`}>
            <Gavel size={16} />
            Buka Lelang
          </Link>
        )}
      </div>
    </article>
  );
}
