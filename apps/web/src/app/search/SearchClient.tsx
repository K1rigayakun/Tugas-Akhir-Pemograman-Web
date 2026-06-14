"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import PageHeading from "../../components/PageHeading";
import AnimatedSection from "../../components/AnimatedSection";
import { AUCTION_CATEGORIES } from "../../constants/categories";
import { Clock } from "lucide-react";

export default function SearchClient({ initialData }: { initialData: any[] }) {
  const searchParams = useSearchParams();
  
  // Initial state from URL
  const initialCategory = searchParams.get("category") || "";
  const initialQuery = searchParams.get("q") || "";

  // --- FILTER STATES ---
  const [query, setQuery] = useState(initialQuery);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialCategory ? [initialCategory] : []);
  const [categorySearch, setCategorySearch] = useState<string>(""); 
  const [selectedRarities, setSelectedRarities] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [timeFilter, setTimeFilter] = useState<string>("ALL"); 
  const [sortBy, setSortBy] = useState<string>("ENDING_SOON");

  // --- FILTER LOGIC ---
  const filteredItems = useMemo(() => {
    return initialData.filter(item => {
      // 1. Search Query
      if (query && !item.name.toLowerCase().includes(query.toLowerCase())) return false;
      
      // 2. Category
      if (selectedCategories.length > 0 && !selectedCategories.includes(item.category)) return false;
      
      // 3. Rarity
      if (selectedRarities.length > 0 && !selectedRarities.includes(item.rarity)) return false;
      
      // 4. Price Range
      if (minPrice && item.currentBid < parseInt(minPrice)) return false;
      if (maxPrice && item.currentBid > parseInt(maxPrice)) return false;

      // 5. Time
      if (timeFilter === "ENDING_SOON" && item.endTimeHours > 6) return false;
      if (timeFilter === "TODAY" && item.endTimeHours > 24) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === "ENDING_SOON") return a.endTimeHours - b.endTimeHours;
      if (sortBy === "PRICE_ASC") return a.currentBid - b.currentBid;
      if (sortBy === "PRICE_DESC") return b.currentBid - a.currentBid;
      return 0;
    });
  }, [query, selectedCategories, selectedRarities, minPrice, maxPrice, timeFilter, sortBy, initialData]);

  // --- HANDLERS ---
  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  };

  const toggleRarity = (rarity: string) => {
    setSelectedRarities(prev => prev.includes(rarity) ? prev.filter(r => r !== rarity) : [...prev, rarity]);
  };

  return (
    <main className="page-wrap" style={{ minHeight: "100vh", padding: "6rem 2rem", maxWidth: "1600px", margin: "0 auto" }}>
      <PageHeading 
        eyebrow="Marketplace Search" 
        title="Advanced Search" 
        description="Gunakan berbagai kombinasi filter untuk menemukan lelang eksklusif idamanmu." 
      />
      
      <AnimatedSection delay={100}>
        <div style={{ display: "grid", gridTemplateColumns: "250px 1fr", gap: "2rem", marginTop: "3rem", alignItems: "start" }}>
          
          <aside style={{ background: "rgba(10, 12, 14, 0.8)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", padding: "1.5rem" }}>
            <h3 style={{ fontSize: "1.2rem", color: "var(--color-gold)", marginBottom: "1.5rem", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "0.5rem" }}>
              Filter Pencarian
            </h3>

            {/* Filter Kategori */}
            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                <h4 style={{ color: "var(--color-ivory)", fontSize: "0.95rem" }}>Kategori</h4>
                {selectedCategories.length > 0 && (
                  <span style={{ fontSize: "0.75rem", color: "var(--color-emerald)", cursor: "pointer" }} onClick={() => setSelectedCategories([])}>Clear</span>
                )}
              </div>
              <input 
                type="text" 
                placeholder="Cari kategori..." 
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                style={{ width: "100%", padding: "0.5rem", marginBottom: "0.75rem", background: "#000", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "4px", color: "white", fontSize: "0.8rem" }}
              />
              <div style={{ maxHeight: "250px", overflowY: "auto", paddingRight: "0.5rem", scrollbarWidth: "thin" }}>
                {AUCTION_CATEGORIES.filter(cat => cat.toLowerCase().includes(categorySearch.toLowerCase())).map(cat => (
                  <label key={cat} style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem", cursor: "pointer", color: "var(--color-text-muted)", fontSize: "0.85rem" }}>
                    <input type="checkbox" checked={selectedCategories.includes(cat)} onChange={() => toggleCategory(cat)} />
                    {cat}
                  </label>
                ))}
              </div>
            </div>

            {/* Filter Rarity */}
            <div style={{ marginBottom: "1.5rem" }}>
              <h4 style={{ color: "var(--color-ivory)", fontSize: "0.95rem", marginBottom: "0.75rem" }}>Kelangkaan (Rarity)</h4>
              {["COMMON", "UNCOMMON", "RARE", "EPIC", "LEGENDARY", "MYTHIC"].map(rarity => (
                <label key={rarity} style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem", cursor: "pointer", color: "var(--color-text-muted)", fontSize: "0.85rem" }}>
                  <input type="checkbox" checked={selectedRarities.includes(rarity)} onChange={() => toggleRarity(rarity)} />
                  {rarity}
                </label>
              ))}
            </div>

            {/* Filter Rentang Harga */}
            <div style={{ marginBottom: "1.5rem" }}>
              <h4 style={{ color: "var(--color-ivory)", fontSize: "0.95rem", marginBottom: "0.75rem" }}>Rentang Bid (CC)</h4>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input type="number" placeholder="Min" value={minPrice} onChange={e => setMinPrice(e.target.value)}
                  style={{ width: "100%", padding: "0.5rem", background: "#000", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "4px", color: "white", fontSize: "0.8rem" }} />
                <input type="number" placeholder="Max" value={maxPrice} onChange={e => setMaxPrice(e.target.value)}
                  style={{ width: "100%", padding: "0.5rem", background: "#000", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "4px", color: "white", fontSize: "0.8rem" }} />
              </div>
            </div>

            {/* Filter Waktu */}
            <div style={{ marginBottom: "1.5rem" }}>
              <h4 style={{ color: "var(--color-ivory)", fontSize: "0.95rem", marginBottom: "0.75rem" }}>Waktu Tersisa</h4>
              <select value={timeFilter} onChange={e => setTimeFilter(e.target.value)}
                style={{ width: "100%", padding: "0.5rem", background: "#000", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "4px", color: "white", fontSize: "0.85rem" }}>
                <option value="ALL">Semua Waktu</option>
                <option value="ENDING_SOON">Segera Berakhir (&lt; 6 Jam)</option>
                <option value="TODAY">Hari Ini (&lt; 24 Jam)</option>
              </select>
            </div>

            <button 
              onClick={() => { setSelectedCategories([]); setSelectedRarities([]); setMinPrice(""); setMaxPrice(""); setTimeFilter("ALL"); setQuery(""); }}
              style={{ width: "100%", padding: "0.5rem", background: "transparent", color: "var(--color-text-muted)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "4px", cursor: "pointer", fontSize: "0.85rem" }}
            >
              Reset Filter
            </button>
          </aside>

          {/* ================= MAIN CONTENT GRID ================= */}
          <div>
            {/* Search Bar & Sorting */}
            <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
              <input 
                type="text" 
                placeholder="Cari nama barang..." 
                value={query}
                onChange={e => setQuery(e.target.value)}
                style={{ flex: 1, padding: "0.75rem 1rem", background: "rgba(10,12,14,0.8)", border: "1px solid var(--color-emerald)", borderRadius: "8px", color: "var(--color-ivory)", outline: "none" }}
              />
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                style={{ padding: "0.75rem 1rem", background: "rgba(10,12,14,0.8)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px", color: "white", outline: "none", cursor: "pointer" }}>
                <option value="ENDING_SOON">Urutkan: Segera Berakhir</option>
                <option value="PRICE_DESC">Urutkan: Bid Tertinggi</option>
                <option value="PRICE_ASC">Urutkan: Bid Terendah</option>
              </select>
            </div>

            {/* Results */}
            <div style={{ marginBottom: "1rem", color: "var(--color-text-muted)", fontSize: "0.9rem" }}>
              Menemukan <strong style={{ color: "var(--color-gold)" }}>{filteredItems.length}</strong> lelang
            </div>

            {filteredItems.length === 0 ? (
              <div style={{ textAlign: "center", padding: "4rem", border: "1px dashed rgba(255,255,255,0.2)", borderRadius: "12px" }}>
                <p style={{ color: "var(--color-text-muted)" }}>Tidak ada barang lelang yang sesuai dengan filtermu.</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1.25rem" }}>
                {filteredItems.map(item => (
                  <div key={item.id} style={{
                    background: "rgba(10,12,14,0.8)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    transition: "transform 0.2s ease",
                    cursor: "pointer"
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.borderColor = "var(--color-emerald)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
                  >
                    {/* Gambar */}
                    <div style={{ width: "100%", position: "relative", backgroundColor: "#111", overflow: "hidden" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.img} alt={item.name} style={{ width: "100%", height: "auto", display: "block", objectFit: "cover", aspectRatio: "4/3" }} />
                      <div style={{ position: "absolute", top: "8px", left: "8px", background: "rgba(0,0,0,0.7)", color: "var(--color-ivory)", padding: "4px 8px", borderRadius: "4px", fontSize: "0.7rem", fontWeight: "bold", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                        <Clock size={12} /> {item.endTimeHours} Jam
                      </div>
                      <div style={{ position: "absolute", top: "8px", right: "8px", background: item.rarity === "LEGENDARY" ? "var(--color-gold)" : item.rarity === "MYTHIC" ? "#ef4444" : "rgba(255,255,255,0.2)", color: item.rarity === "LEGENDARY" || item.rarity === "MYTHIC" ? "#000" : "#fff", padding: "2px 6px", borderRadius: "4px", fontSize: "0.6rem", fontWeight: "bold" }}>
                        {item.rarity}
                      </div>
                    </div>

                    {/* Info */}
                    <div style={{ padding: "1rem", flex: 1, display: "flex", flexDirection: "column" }}>
                      <h4 style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--color-ivory)", marginBottom: "0.5rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {item.name}
                      </h4>
                      <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginBottom: "1rem" }}>{item.category}</p>
                      
                      <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Harga Buka</span>
                          <span style={{ fontSize: "0.75rem", color: "var(--color-ivory)" }}>{item.startPrice.toLocaleString("id-ID")} CC</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: "0.8rem", color: "var(--color-emerald)", fontWeight: 600 }}>Bid Skrg</span>
                          <span style={{ fontSize: "0.95rem", color: "var(--color-gold)", fontWeight: 700, fontFamily: "var(--font-numeric)" }}>{item.currentBid.toLocaleString("id-ID")} CC</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </AnimatedSection>
    </main>
  );
}
