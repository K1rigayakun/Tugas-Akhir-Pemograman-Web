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

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: "", description: "", category: "Art", rarity: "COMMON", auctionType: "STANDARD",
    startingPrice: "", minimumIncrement: "1", minimumPrice: "", decrementAmount: "",
    startTime: "", endTime: "", minimumRank: "CIVIS", isSealed: false, imageUrls: "", requiredAchievementId: ""
  });

  const statuses = ["ALL", "ACTIVE", "UPCOMING", "ENDED", "CANCELLED"];
  const [typeFilter, setTypeFilter] = useState("ALL");
  const types = [{ id: "ALL", label: "Semua Tipe" }, { id: "LIVE", label: "Live Auction" }, { id: "REGULAR", label: "Regular Auction" }];

  const loadAuctions = async () => {
    setLoading(true);
    try {
      const url = new URL("/v1/admin/auctions", "http://localhost");
      if (filter !== "ALL") url.searchParams.append("status", filter);
      if (typeFilter !== "ALL") url.searchParams.append("type", typeFilter);
      
      const endpoint = url.pathname + url.search;
      console.log("[Admin Auctions] Fetching from endpoint:", endpoint);
      
      const res = await fetchWithAuth(endpoint);
      const data = await res.json();
      
      // Console logging for debugging empty data issues
      console.log("[Admin Auctions] API Response:", {
        endpoint,
        status: res.status,
        ok: res.ok,
        dataKeys: Object.keys(data),
        auctionCount: data.data ? data.data.length : 0,
        firstAuction: data.data?.[0] || null,
      });
      
      if (res.ok) {
        const auctionList = data.data || [];
        setAuctions(auctionList);
        
        // Log warning if empty data
        if (auctionList.length === 0) {
          console.warn("[Admin Auctions] Empty auction data received. Check database and API endpoint.");
        } else {
          console.log(`[Admin Auctions] Successfully loaded ${auctionList.length} auctions`);
        }
      } else {
        console.error("[Admin Auctions] API request failed:", {
          status: res.status,
          message: data.message || "Unknown error",
        });
      }
    } catch (err) {
      console.error("[Admin Auctions] Error loading auctions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuctions();
  }, [filter, typeFilter]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formDataObj = new FormData();
    formDataObj.append("file", file);

    try {
      const res = await fetchWithAuth("/v1/upload/auction-image", {
        method: "POST",
        body: formDataObj,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setFormData((prev) => ({
          ...prev,
          imageUrls: prev.imageUrls ? `${prev.imageUrls},${data.url}` : data.url,
        }));
      } else {
        setError(data.message || "Gagal mengunggah gambar");
      }
    } catch (err: any) {
      setError(err.message || "Gagal mengunggah gambar");
    }
  };

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

  const handleCreateAuction = async () => {
    setIsCreating(true);
    setError("");
    try {
      const payload: any = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        rarity: formData.rarity,
        auctionType: formData.auctionType,
        startingPrice: parseInt(formData.startingPrice) || 0,
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
      };

      if (formData.minimumIncrement) payload.minimumIncrement = parseInt(formData.minimumIncrement);
      if (formData.auctionType === "DESCENDING") {
        if (formData.minimumPrice) payload.minimumPrice = parseInt(formData.minimumPrice);
        if (formData.decrementAmount) payload.decrementAmount = parseInt(formData.decrementAmount);
      }
      if (formData.auctionType === "RANK_EXCL") {
        payload.minimumRank = formData.minimumRank;
        if (formData.requiredAchievementId) payload.requiredAchievementId = formData.requiredAchievementId;
      }
      if (formData.auctionType === "SEALED_CHEST") payload.isSealed = formData.isSealed;
      if (formData.imageUrls) payload.imageUrls = formData.imageUrls.split(",").map(s => s.trim());

      const res = await fetchWithAuth("/v1/admin/auctions", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal membuat lelang");
      
      setShowCreateModal(false);
      loadAuctions();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <main style={{ padding: "2.5rem", minHeight: "100vh", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: "1.5rem", color: "var(--color-ivory)" }}>Kelola Lelang</h2>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", marginTop: "0.25rem" }}>Monitor dan kelola semua lelang platform</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} style={{ padding: "0.6rem 1.25rem", background: "var(--color-gold)", color: "#0a0a0f", border: "none", borderRadius: "8px", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" }}>
          + Buat Lelang Baru
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: "0.5rem" }}>
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
        
        <div style={{ width: "1px", background: "var(--color-border)", margin: "0 0.5rem" }}></div>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          {types.map((t) => (
            <button key={t.id} onClick={() => setTypeFilter(t.id)} style={{
              padding: "0.4rem 1rem", borderRadius: "999px", fontSize: "0.8rem", cursor: "pointer", border: "1px solid var(--color-border)",
              background: typeFilter === t.id ? "var(--color-emerald-dim)" : "transparent",
              color: typeFilter === t.id ? "var(--color-emerald)" : "var(--color-text-muted)",
              borderColor: typeFilter === t.id ? "var(--color-emerald)" : "var(--color-border)",
            }}>
              {t.label}
            </button>
          ))}
        </div>
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

              {/* Description */}
              {auction.description && (
                <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginBottom: "0.75rem", lineHeight: "1.4", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                  {auction.description}
                </p>
              )}

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

              {/* Time Information */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginBottom: "1rem", padding: "0.75rem", background: "rgba(138,138,154,0.05)", borderRadius: "6px" }}>
                <div>
                  <p style={{ fontSize: "0.65rem", color: "var(--color-text-muted)", textTransform: "uppercase", marginBottom: "0.25rem" }}>Mulai</p>
                  <p style={{ fontSize: "0.7rem", color: "var(--color-ivory)" }}>
                    {auction.startTime ? new Date(auction.startTime).toLocaleString("id-ID", { 
                      day: "2-digit", 
                      month: "short", 
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    }) : "-"}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: "0.65rem", color: "var(--color-text-muted)", textTransform: "uppercase", marginBottom: "0.25rem" }}>Selesai</p>
                  <p style={{ fontSize: "0.7rem", color: "var(--color-ivory)" }}>
                    {auction.endTime ? new Date(auction.endTime).toLocaleString("id-ID", { 
                      day: "2-digit", 
                      month: "short", 
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    }) : "-"}
                  </p>
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
                {auction.auctionType === "LIVE" && ["UPCOMING", "ACTIVE"].includes(auction.status) && (
                  <button onClick={() => window.location.href = `/auctions/${auction.id}/live`} style={{ flex: 1, padding: "0.4rem", fontSize: "0.75rem", background: "rgba(34,197,94,0.15)", border: "1px solid #22c55e", color: "#22c55e", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>
                    Host Live
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

      {/* Create Modal */}
      {showCreateModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}
          onClick={() => setShowCreateModal(false)}
        >
          <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-gold)", borderRadius: "16px", padding: "2rem", width: "600px", maxHeight: "90vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontFamily: "'Cinzel', serif", color: "var(--color-gold)", marginBottom: "1rem" }}>Buat Lelang Baru</h3>
            
            {error && (
              <div style={{ padding: "0.75rem", background: "rgba(239, 68, 68, 0.1)", color: "var(--color-danger)", fontSize: "0.85rem", borderRadius: "8px", marginBottom: "1rem" }}>
                {error}
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", textTransform: "uppercase" }}>Judul Lelang</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} style={{ width: "100%", background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "8px", padding: "0.6rem", color: "var(--color-ivory)", fontSize: "0.85rem", marginTop: "0.35rem" }} />
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", textTransform: "uppercase" }}>Deskripsi</label>
                <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} style={{ width: "100%", background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "8px", padding: "0.6rem", color: "var(--color-ivory)", fontSize: "0.85rem", marginTop: "0.35rem", minHeight: "80px" }} />
              </div>

              <div>
                <label style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", textTransform: "uppercase" }}>Kategori</label>
                <input type="text" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} style={{ width: "100%", background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "8px", padding: "0.6rem", color: "var(--color-ivory)", fontSize: "0.85rem", marginTop: "0.35rem" }} />
              </div>

              <div>
                <label style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", textTransform: "uppercase" }}>Rarity</label>
                <select value={formData.rarity} onChange={(e) => setFormData({...formData, rarity: e.target.value})} style={{ width: "100%", background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "8px", padding: "0.6rem", color: "var(--color-ivory)", fontSize: "0.85rem", marginTop: "0.35rem" }}>
                  {["COMMON", "UNCOMMON", "RARE", "EPIC", "LEGENDARY", "TRANSCENDENT"].map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div>
                <label style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", textTransform: "uppercase" }}>Tipe Lelang</label>
                <select value={formData.auctionType} onChange={(e) => setFormData({...formData, auctionType: e.target.value})} style={{ width: "100%", background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "8px", padding: "0.6rem", color: "var(--color-ivory)", fontSize: "0.85rem", marginTop: "0.35rem" }}>
                  {["STANDARD", "SCHEDULED", "LIVE", "RANK_EXCL", "SEALED_CHEST", "DESCENDING"].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", textTransform: "uppercase" }}>Harga Awal</label>
                <input type="number" value={formData.startingPrice} onChange={(e) => setFormData({...formData, startingPrice: e.target.value})} style={{ width: "100%", background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "8px", padding: "0.6rem", color: "var(--color-ivory)", fontSize: "0.85rem", marginTop: "0.35rem" }} />
              </div>

              {formData.auctionType === "DESCENDING" && (
                <>
                  <div>
                    <label style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", textTransform: "uppercase" }}>Harga Minimum</label>
                    <input type="number" value={formData.minimumPrice} onChange={(e) => setFormData({...formData, minimumPrice: e.target.value})} style={{ width: "100%", background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "8px", padding: "0.6rem", color: "var(--color-ivory)", fontSize: "0.85rem", marginTop: "0.35rem" }} />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", textTransform: "uppercase" }}>Pengurangan per Jam</label>
                    <input type="number" value={formData.decrementAmount} onChange={(e) => setFormData({...formData, decrementAmount: e.target.value})} style={{ width: "100%", background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "8px", padding: "0.6rem", color: "var(--color-ivory)", fontSize: "0.85rem", marginTop: "0.35rem" }} />
                  </div>
                </>
              )}

              {formData.auctionType === "RANK_EXCL" && (
                <>
                  <div>
                    <label style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", textTransform: "uppercase" }}>Rank Minimum</label>
                    <select value={formData.minimumRank} onChange={(e) => setFormData({...formData, minimumRank: e.target.value})} style={{ width: "100%", background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "8px", padding: "0.6rem", color: "var(--color-ivory)", fontSize: "0.85rem", marginTop: "0.35rem" }}>
                      {["CIVIS", "MERCHANT", "KNIGHT", "BARON", "VISCOUNT", "EARL", "MARQUIS", "DUKE", "SOVEREIGN", "EMPEROR"].map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", textTransform: "uppercase" }}>Syarat Achievement (ID) - Opsional</label>
                    <input type="text" value={formData.requiredAchievementId} onChange={(e) => setFormData({...formData, requiredAchievementId: e.target.value})} placeholder="Misal: achv-123" style={{ width: "100%", background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "8px", padding: "0.6rem", color: "var(--color-ivory)", fontSize: "0.85rem", marginTop: "0.35rem" }} />
                  </div>
                </>
              )}

              {formData.auctionType === "SEALED_CHEST" && (
                <div style={{ display: "flex", alignItems: "center", marginTop: "1.5rem" }}>
                  <input type="checkbox" id="isSealed" checked={formData.isSealed} onChange={(e) => setFormData({...formData, isSealed: e.target.checked})} style={{ marginRight: "0.5rem" }} />
                  <label htmlFor="isSealed" style={{ fontSize: "0.85rem", color: "var(--color-ivory)" }}>Sealed Chest (Sembunyikan Bidder & Harga)</label>
                </div>
              )}

              <div>
                <label style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", textTransform: "uppercase" }}>Waktu Mulai</label>
                <input type="datetime-local" value={formData.startTime} onChange={(e) => setFormData({...formData, startTime: e.target.value})} style={{ width: "100%", background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "8px", padding: "0.6rem", color: "var(--color-ivory)", fontSize: "0.85rem", marginTop: "0.35rem" }} />
              </div>
              
              <div>
                <label style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", textTransform: "uppercase" }}>Waktu Selesai</label>
                <input type="datetime-local" value={formData.endTime} onChange={(e) => setFormData({...formData, endTime: e.target.value})} style={{ width: "100%", background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "8px", padding: "0.6rem", color: "var(--color-ivory)", fontSize: "0.85rem", marginTop: "0.35rem" }} />
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", textTransform: "uppercase" }}>Gambar Lelang</label>
                <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.35rem" }}>
                  <input type="text" placeholder="URL Gambar (pisahkan koma jika lebih dari satu)" value={formData.imageUrls} onChange={(e) => setFormData({...formData, imageUrls: e.target.value})} style={{ flex: 1, background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "8px", padding: "0.6rem", color: "var(--color-ivory)", fontSize: "0.85rem" }} />
                  <label style={{
                    padding: "0.6rem 1rem",
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    color: "var(--color-ivory)",
                    display: "flex",
                    alignItems: "center"
                  }}>
                    <span>Upload File</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: "none" }} />
                  </label>
                </div>
              </div>

            </div>
            
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
              <button onClick={() => setShowCreateModal(false)} disabled={isCreating} style={{ padding: "0.5rem 1.25rem", background: "transparent", border: "1px solid var(--color-border)", color: "var(--color-text-muted)", borderRadius: "8px", cursor: "pointer" }}>Batal</button>
              <button onClick={handleCreateAuction} disabled={isCreating} style={{ padding: "0.5rem 1.25rem", background: "var(--color-gold)", border: "none", color: "#0a0a0f", borderRadius: "8px", cursor: "pointer", fontWeight: 700, opacity: isCreating ? 0.7 : 1 }}>
                {isCreating ? "Menyimpan..." : "Buat Lelang"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
