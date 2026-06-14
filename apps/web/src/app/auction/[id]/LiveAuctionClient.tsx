"use client";

import StandardRoom from "./StandardRoom";
import LiveRoom from "./LiveRoom";

export default function LiveAuctionClient({ 
  auction, 
  initialBids,
  currentUser 
}: { 
  auction: any;
  initialBids: any[];
  currentUser: { id: string; username: string; rank: string } | null;
}) {
  if (auction.auctionType === "LIVE") {
    return <LiveRoom auction={auction} initialBids={initialBids} currentUser={currentUser} />;
  }

  // Default to Standard Room
  return <StandardRoom auction={auction} initialBids={initialBids} currentUser={currentUser} />;
}
