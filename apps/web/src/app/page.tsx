import dynamic from "next/dynamic";
import HeroSection          from "../components/home/HeroSection";
import EndingSoon           from "../components/home/EndingSoon";
import CategorySlider       from "../components/home/CategorySlider";
import CategoryTags         from "../components/home/CategoryTags";
import Leaderboard          from "../components/home/Leaderboard";
import Museum               from "../components/home/Museum";
import { serverGetApi } from "./actions/apiProxy";
import { serverFetchParallel } from "../lib/serverDataFetch";
import { LeaderboardResponse, MuseumResponse } from "../types/data-sync";
import { Star } from "lucide-react";

const ThreeScene = dynamic(() => import("../components/ThreeScene"), { ssr: false });

export default async function Home() {
  // Fetch data lelang aktif dari API (Server-Side Fetching)
  let auctions: any[] = [];
  try {
    auctions = await serverGetApi<any[]>("/auctions");
  } catch (err) {
    console.error("Failed to fetch auctions for homepage:", err);
  }

  // Fetch leaderboard and museum data in parallel (SSR)
  const [leaderboardResult, museumResult] = await serverFetchParallel<LeaderboardResponse, MuseumResponse>(
    '/leaderboard',
    '/museum/featured'
  );

  // Transform data lelang menjadi format yang dibutuhkan CategorySlider
  const categoryMap = new Map<string, any[]>();
  auctions.forEach((auction) => {
    if (!categoryMap.has(auction.category)) {
      categoryMap.set(auction.category, []);
    }
    categoryMap.get(auction.category)!.push({
      id: auction.id,
      name: auction.title,
      price: auction.startingPrice,
      currentBid: auction.currentPrice || auction.startingPrice,
      endTime: new Date(auction.endTime).toLocaleDateString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }),
      img: auction.imageUrls?.[0] || `https://loremflickr.com/300/200/${encodeURIComponent(auction.category)}?lock=${auction.id}`
    });
  });

  // Ambil maksimal 8 kategori yang memiliki item, lalu format
  const dynamicCategories = Array.from(categoryMap.entries())
    .slice(0, 8)
    .map(([catName, items], index) => ({
      id: `dyn-cat-${index}`,
      name: catName,
      items: items.slice(0, 24) // maksimal 24 item per kategori
    }));

  return (
    <main>
      {/* 1. Hero Section */}
      <HeroSection featuredAuctions={auctions} />
      
      {/* 2. Ending Soon Auctions */}
      <EndingSoon auctions={auctions} />
      
      {/* 3. Categories */}
      <CategoryTags />
      <CategorySlider categories={dynamicCategories.length > 0 ? dynamicCategories : undefined} />

      {/* 4. Leaderboard Snapshot */}
      <section className="page-wrap" style={{ margin: '4rem auto 2rem auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 className="section-title" style={{ fontFamily: 'var(--font-cinzel)', color: 'var(--imperial-gold)' }}>The Pantheon of Wealth</h2>
          <a href="/leaderboard" style={{ color: 'var(--emerald-deep)', textDecoration: 'none', fontWeight: 600 }}>View Full Leaderboard &rarr;</a>
        </div>
        <Leaderboard initialData={leaderboardResult.data} />
      </section>

      {/* 5. Museum Highlight */}
      <section className="page-wrap" style={{ margin: '4rem auto 2rem auto', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--imperial-gold)', marginBottom: '1rem' }}>
          <Star size={48} />
        </div>
        <h2 className="section-title" style={{ fontFamily: 'var(--font-cinzel)', color: 'var(--imperial-gold)', marginBottom: '0.5rem' }}>Museum of Antiquities</h2>
        <p style={{ color: 'var(--silver-mist)' }}>Koleksi abadi benda-benda paling legendaris yang pernah dimenangkan.</p>
        <Museum initialData={museumResult.data} />
      </section>

      {/* 6. 3D Separator Scene */}
      <div style={{ height: '400px', width: '100%', position: 'relative', overflow: 'hidden', borderTop: '1px solid rgba(201,168,76,0.2)', borderBottom: '1px solid rgba(201,168,76,0.2)' }}>
        <ThreeScene />
      </div>

    </main>
  );
}