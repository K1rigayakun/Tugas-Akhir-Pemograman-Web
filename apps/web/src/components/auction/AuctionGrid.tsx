"use client";

import type { CSSProperties } from "react";
import AuctionCard, { AuctionCardItem } from "./AuctionCard";

interface AuctionGridProps {
  auctions: AuctionCardItem[];
  emptyMessage: string;
  kycApproved?: boolean;
}

const PAGE_SIZE = 15;

function getColumns(count: number) {
  if (count <= 0) return 1;
  if (count <= 5) return count;
  if (count <= 10) {
    if (count % 2 === 0) return Math.min(5, count / 2);
    if (count % 3 === 0) return Math.min(5, count / 3);
    return Math.min(5, Math.ceil(count / 2));
  }
  if (count <= 15) {
    if (count % 3 === 0) return Math.min(5, count / 3);
    if (count % 2 === 0) return Math.min(5, Math.ceil(count / 2));
    return Math.min(5, Math.ceil(count / 3));
  }
  return 5;
}

function chunkAuctions(auctions: AuctionCardItem[]) {
  if (auctions.length <= PAGE_SIZE) return [auctions];

  const pages: AuctionCardItem[][] = [];
  for (let index = 0; index < auctions.length; index += PAGE_SIZE) {
    pages.push(auctions.slice(index, index + PAGE_SIZE));
  }
  return pages;
}

export default function AuctionGrid({ auctions, emptyMessage, kycApproved = true }: AuctionGridProps) {
  if (auctions.length === 0) {
    return (
      <div className="auction-grid-empty">
        {emptyMessage}
      </div>
    );
  }

  const pages = chunkAuctions(auctions);

  return (
    <div className="auction-grid-scroll" aria-label="Daftar lelang">
      <div className="auction-grid-pages">
        {pages.map((page, pageIndex) => {
          const columns = getColumns(page.length);
          return (
            <div
              key={pageIndex}
              className="auction-grid-page"
              style={{ "--auction-columns": columns } as CSSProperties}
            >
              {page.map((auction) => (
                <AuctionCard key={auction.id} auction={auction} kycApproved={kycApproved} />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
