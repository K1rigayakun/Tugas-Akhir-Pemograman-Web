"use client";

import { useState, useEffect } from "react";
import { fetchWithAuth } from "../../lib/api";
import { Loader2 } from "lucide-react";

/**
 * Kelola Museum — Admin Panel
 */

function RarityBadge({ rarity }: { rarity: string }) {
  const colors: Record<string, string> = {
    COMMON: "#8a8a9a", UNCOMMON: "#22c55e", RARE: "#3b82f6",
    EPIC: "#8b5cf6", LEGENDARY: "#f59e0b", TRANSCENDENT: "#ffd700",
  };
  return (
    <span style={{ padding: "0.2rem 0.6rem", borderRadius: "999px", fontSize: "0.65rem", fontWeight: 700, background: `${colors[rarity] || "#666"}22`, color: colors[rarity] || "#666", border: `1px solid ${colors[rarity] || "#666"}44` }}>
      {rarity}
    </span>
  );
}

export default function MuseumPage() {
  const [showCurate, setShowCurate] = useState(false);
  const [editorial, setEditorial] = useState("");
  const [selectedAuctionId, setSelectedAuctionId] = useState("");
  
  const [museumItems, setMuseumItems] = useState<any[]>([]);
  const [eligibleAuctions, setEligibleAuctions] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  const loadMuseumItems = async () => {
    try {
      const res = await fetchWithAuth("/v1/admin/museum/items");
      const data = await res.json();
      if (res.ok) {
        setMuseumItems(data.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadEligibleAuctions = async () => {
    try {
      const res = await fetchWithAuth("/v1/admin/auctions?status=ENDED");
      const data = await res.json();
      if (res.ok) {
        const ended = data.data || [];
        // filter out those already in museum
        setEligibleAuctions(ended.filter((a: any) => !a.inMuseum));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([loadMuseumItems(), loadEligibleAuctions()]);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCurate = async () => {
    if (!selectedAuctionId) {
      setError("Pilih lelang terlebih dahulu.");
      return;
    }
    if (!editorial) {
      setError("Editorial tidak boleh kosong.");
      return;
    }

    setIsProcessing(true);
    setError("");
    try {
      const res = await fetchWithAuth(`/v1/admin/museum/items/${selectedAuctionId}`, {
        method: "POST",
        body: JSON.stringify({ editorial })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal mengkurasi item");
      
      setShowCurate(false);
      setEditorial("");
      setSelectedAuctionId("");
      fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main style={{ padding: "2.5rem", minHeight: "100vh", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: "1.5rem", color: "var(--color-ivory)" }}>Kelola Museum</h2>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", marginTop: "0.25rem" }}>Kurasi item legendaris ke Hall of Legends</p>
        </div>
        <button onClick={() => setShowCurate(!showCurate)} style={{ padding: "0.6rem 1.25rem", background: "var(--color-gold)", color: "#0a0a0f", border: "none", borderRadius: "8px", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" }}>
          + Kurasi Item
        </button>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "300px" }}>
          <Loader2 className="animate-spin" color="var(--color-gold)" size={32} />
        </div>
      ) : (
        <>
          {/* Curate Form */}
          {showCurate && (
            <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-gold)", borderRadius: "12px", padding: "1.5rem", marginBottom: "1.5rem" }}>
              <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: "1rem", color: "var(--color-gold)", marginBottom: "1rem" }}>Pilih Item untuk Dikurasi</h3>
              
              {error && (
                <div style={{ padding: "0.75rem", background: "rgba(239, 68, 68, 0.1)", color: "var(--color-danger)", fontSize: "0.85rem", borderRadius: "8px", marginBottom: "1rem" }}>
                  {error}
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1rem" }}>
                {eligibleAuctions.map((a) => (
                  <label key={a.id} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem", background: "var(--color-bg)", borderRadius: "8px", cursor: "pointer", border: `1px solid ${selectedAuctionId === a.id ? "var(--color-gold)" : "var(--color-border)"}` }}>
                    <input 
                      type="radio" 
                      name="museum-item" 
                      style={{ accentColor: "var(--color-gold)" }} 
                      checked={selectedAuctionId === a.id}
                      onChange={() => setSelectedAuctionId(a.id)}
                    />
                    <span style={{ flex: 1, fontSize: "0.85rem" }}>{a.title}</span>
                    <span style={{ fontSize: "0.75rem", color: "var(--color-gold)", fontFamily: "'Orbitron', monospace" }}>{"\u265B"}{(a.finalPrice || 0).toLocaleString("id-ID")}</span>
                  </label>
                ))}
                {eligibleAuctions.length === 0 && (
                  <div style={{ padding: "1rem", textAlign: "center", color: "var(--color-text-muted)", fontSize: "0.85rem", border: "1px dashed var(--color-border)", borderRadius: "8px" }}>
                    Tidak ada lelang yang selesai dan bisa dikurasi.
                  </div>
                )}
              </div>
              
              <label style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", textTransform: "uppercase" }}>Editorial</label>
              <textarea value={editorial} onChange={(e) => setEditorial(e.target.value)} placeholder="Tulis deskripsi kurasi..." style={{ width: "100%", minHeight: "80px", background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "8px", padding: "0.75rem", color: "var(--color-ivory)", fontSize: "0.85rem", marginTop: "0.5rem", marginBottom: "1rem", resize: "vertical" }} />
              
              <button 
                onClick={handleCurate}
                disabled={isProcessing || eligibleAuctions.length === 0}
                style={{ padding: "0.5rem 1.5rem", background: "var(--color-gold)", color: "#0a0a0f", border: "none", borderRadius: "8px", fontWeight: 700, cursor: "pointer", opacity: (isProcessing || eligibleAuctions.length === 0) ? 0.6 : 1 }}
              >
                {isProcessing ? "Menyimpan..." : "Kurasi ke Museum"}
              </button>
            </div>
          )}

          {/* Museum Items */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "1rem" }}>
            {museumItems.map((item) => (
              <div key={item.id} style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "12px", overflow: "hidden" }}>
                <div style={{ height: "120px", background: "linear-gradient(135deg, #1a1a25, #0a2620)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: "3rem", opacity: 0.3 }}>{"\u2605"}</span>
                </div>
                <div style={{ padding: "1.25rem" }}>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: 600, marginBottom: "0.5rem" }}>{item.auction?.title || "Unknown Item"}</h4>
                  <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem" }}>
                    <RarityBadge rarity={item.auction?.rarity || "COMMON"} />
                    <span style={{ fontSize: "0.75rem", color: "var(--color-gold)", fontFamily: "'Orbitron', monospace" }}>{"\u265B"}{(item.auction?.finalPrice || 0).toLocaleString("id-ID")}</span>
                  </div>
                  {item.editorial ? (
                    <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", fontStyle: "italic", lineHeight: 1.5 }}>"{item.editorial}"</p>
                  ) : (
                    <p style={{ fontSize: "0.8rem", color: "#ef4444" }}>Editorial belum ditulis</p>
                  )}
                </div>
              </div>
            ))}
            {museumItems.length === 0 && (
              <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "3rem", color: "var(--color-text-muted)" }}>
                Belum ada item yang dikurasi ke Museum.
              </div>
            )}
          </div>
        </>
      )}
    </main>
  );
}
