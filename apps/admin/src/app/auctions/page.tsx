"use client";

import { useState, useEffect } from "react";
import { fetchWithAuth } from "../../lib/api";
import { Loader2 } from "lucide-react";

/**
 * Kelola Lelang — Admin Panel
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

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    ACTIVE: "#22c55e", UPCOMING: "#3b82f6", ENDED: "#8a8a9a",
    CANCELLED: "#ef4444", ENDING: "#f59e0b",
  };
  return (
    <span style={{ padding: "0.2rem 0.6rem", borderRadius: "4px", fontSize: "0.7rem", fontWeight: 600, background: `${colors[status] || "#666"}15`, color: colors[status] || "#666" }}>
      {status}
    </span>
  );
}

export default function AuctionsPage() {
  const [filter, setFilter] = useState("ALL");
  const [auctions, setAuctions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [cancelModal, setCancelModal] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState("");

  const statuses = ["ALL", "ACTIVE", "UPCOMING", "ENDED", "CANCELLED"];

  const loadAuctions = async () => {
    setLoading(true);
    try {
      const url = filter === "ALL" ? "/v1/admin/auctions" : `/v1/admin/auctions?status=${filter}`;
      const res = await fetchWithAuth(url);
      const data = await res.json();
      if (res.ok) {
        setAuctions(data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuctions();
  }, [filter]);

  const handleCancelAuction = async () => {
    if (!cancelModal) return;
    setIsCancelling(true);
    setError("");
    try {
      const res = await fetchWithAuth(`/v1/admin/auctions/${cancelModal}/cancel`, {
        method: "POST",
        body: JSON.stringify({ reason: cancelReason })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal membatalkan lelang");
      
      setCancelModal(null);
      setCancelReason("");
      loadAuctions();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <main style={{ padding: "2.5rem", minHeight: "100vh", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: "1.5rem", color: "var(--color-ivory)" }}>Kelola Lelang</h2>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", marginTop: "0.25rem" }}>Monitor dan kelola semua lelang platform</p>
        </div>
        <button style={{ padding: "0.6rem 1.25rem", background: "var(--color-gold)", color: "#0a0a0f", border: "none", borderRadius: "8px", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" }}>
          + Buat Lelang Baru
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
        {statuses.map((s) => (
          <button key={s} onClick={() => setFilter(s)} style={{
            padding: "0.4rem 1rem", borderRadius: "999px", fontSize: "0.8rem", cursor: "pointer", border: "1px solid var(--color-border)",
            background: filter === s ? "var(--color-gold-dim)" : "transparent",
            color: filter === s ? "var(--color-gold)" : "var(--color-text-muted)",
            borderColor: filter === s ? "var(--color-gold)" : "var(--color-border)",
          }}>
            {s}
          </button>
        ))}
      </div>

      {/* Auction Cards Grid */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "300px" }}>
          <Loader2 className="animate-spin" color="var(--color-gold)" size={32} />
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "1rem" }}>
          {auctions.map((auction) => (
            <div key={auction.id} style={{
              background: "var(--color-surface)", border: "1px solid var(--color-border)",
              borderRadius: "12px", padding: "1.25rem", transition: "border-color 0.2s",
            }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--color-gold)")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--color-border)")}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                <h4 style={{ fontSize: "0.95rem", fontWeight: 600, flex: 1, marginRight: "0.5rem" }}>{auction.title}</h4>
                <StatusBadge status={auction.status} />
              </div>

              <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
                <RarityBadge rarity={auction.rarity} />
                <span style={{ padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.65rem", background: "rgba(138,138,154,0.15)", color: "var(--color-text-muted)" }}>{auction.auctionType || auction.type}</span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginBottom: "1rem" }}>
                <div>
                  <p style={{ fontSize: "0.65rem", color: "var(--color-text-muted)", textTransform: "uppercase" }}>Harga Saat Ini</p>
                  <p style={{ fontFamily: "'Orbitron', monospace", fontSize: "1.1rem", color: "var(--color-gold)", fontWeight: 700 }}>
                    {auction.currentPrice > 0 ? `\u265B${auction.currentPrice.toLocaleString("id-ID")}` : "-"}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: "0.65rem", color: "var(--color-text-muted)", textTransform: "uppercase" }}>Total Bid</p>
                  <p style={{ fontFamily: "'Orbitron', monospace", fontSize: "1.1rem", color: "var(--color-info)" }}>{auction._count?.bids || auction.bids || 0}</p>
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button style={{ flex: 1, padding: "0.4rem", fontSize: "0.75rem", background: "transparent", border: "1px solid var(--color-border)", color: "var(--color-text-muted)", borderRadius: "6px", cursor: "pointer" }}>
                  Detail
                </button>
                {auction.status === "ACTIVE" && (
                  <button onClick={() => setCancelModal(auction.id)} style={{ flex: 1, padding: "0.4rem", fontSize: "0.75rem", background: "rgba(239,68,68,0.15)", border: "1px solid #ef4444", color: "#ef4444", borderRadius: "6px", cursor: "pointer" }}>
                    Batalkan
                  </button>
                )}
              </div>
            </div>
          ))}
          {auctions.length === 0 && (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "3rem", color: "var(--color-text-muted)" }}>
              Tidak ada lelang yang ditemukan untuk status {filter}.
            </div>
          )}
        </div>
      )}

      {/* Cancel Modal */}
      {cancelModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}
          onClick={() => setCancelModal(null)}
        >
          <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "16px", padding: "2rem", width: "420px" }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontFamily: "'Cinzel', serif", color: "#ef4444", marginBottom: "1rem" }}>Batalkan Lelang</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginBottom: "1rem" }}>
              Semua hold bid akan otomatis di-refund ke wallet bidder.
            </p>
            
            {error && (
              <div style={{ padding: "0.75rem", background: "rgba(239, 68, 68, 0.1)", color: "var(--color-danger)", fontSize: "0.85rem", borderRadius: "8px", marginBottom: "1rem" }}>
                {error}
              </div>
            )}

            <textarea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} placeholder="Alasan pembatalan..." style={{ width: "100%", minHeight: "80px", background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "8px", padding: "0.75rem", color: "var(--color-ivory)", fontSize: "0.85rem", marginBottom: "1rem", resize: "vertical" }} />
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
              <button onClick={() => setCancelModal(null)} disabled={isCancelling} style={{ padding: "0.5rem 1.25rem", background: "transparent", border: "1px solid var(--color-border)", color: "var(--color-text-muted)", borderRadius: "8px", cursor: "pointer" }}>Batal</button>
              <button onClick={handleCancelAuction} disabled={isCancelling} style={{ padding: "0.5rem 1.25rem", background: "#ef4444", border: "none", color: "#fff", borderRadius: "8px", cursor: "pointer", fontWeight: 700, opacity: isCancelling ? 0.7 : 1 }}>
                {isCancelling ? "Membatalkan..." : "Konfirmasi Batalkan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
