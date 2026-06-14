import { Suspense } from "react";
import SearchClient from "./SearchClient";
import { fetchApi } from "../../lib/api";
import { serverGetApi } from "../actions/apiProxy";

export default async function SearchPage() {
  // Fetch from the real API so data like "Koleksi Antik #2" shows up
  let auctions: any[] = [];
  try {
    auctions = await serverGetApi<any[]>("/auctions");
  } catch (err) {
    console.error("Failed to fetch auctions for search:", err);
  }

  // Transform data to match the filter requirements
  const formattedItems = auctions.map((a: any) => ({
    id: a.id,
    name: a.title,
    category: a.category,
    rarity: a.rarity || "COMMON",
    status: a.status,
    startPrice: a.startingPrice,
    currentBid: a.currentPrice || a.startingPrice,
    // Calculate hours left
    endTimeHours: Math.max(0, Math.floor((new Date(a.endTime).getTime() - Date.now()) / (1000 * 60 * 60))),
    img: a.imageUrls?.[0] || `https://loremflickr.com/300/200/${encodeURIComponent(a.category)}?lock=${a.id}`
  }));

  return (
    <Suspense fallback={<main className="page-wrap" style={{ minHeight: "100vh", padding: "6rem 2rem", textAlign: "center" }}><h2>Loading Search...</h2></main>}>
      <SearchClient initialData={formattedItems} />
    </Suspense>
  );
}
