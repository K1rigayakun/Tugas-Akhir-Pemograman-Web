"use client";

import { useState } from "react";

/**
 * Kelola Lelang — Admin Panel
 *
 * Fitur:
 * - Daftar semua lelang dengan filter status
 * - Monitor bid real-time
 * - Batalkan lelang (trigger refund otomatis)
 */

function Sidebar({ active }: { active: string }) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: "\u2302", href: "/" },
    { id: "users", label: "Kelola User", icon: "\u263A", href: "/users" },
    { id: "auctions", label: "Kelola Lelang", icon: "\u2694", href: "/auctions" },
    { id: "kyc", label: "Review KYC", icon: "\u2611", href: "/kyc" },
    { id: "museum", label: "Museum", icon: "\u2605", href: "/museum" },
    { id: "events", label: "Events", icon: "\u2600", href: "/events" },
    { id: "audit", label: "Audit Log", icon: "\u2630", href: "/audit" },
  ];
  return (
    <aside style={{ width: "260px", minHeight: "100vh", background: "var(--color-surface)", borderRight: "1px solid var(--color-border)", padding: "1.5rem 0", position: "fixed", left: 0, top: 0 }}>
      <div style={{ padding: "0 1.5rem", marginBottom: "2rem" }}>
        <h1 style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: "1.1rem", color: "var(--color-gold)" }}>Praetorian Console</h1>
        <p style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", marginTop: "0.25rem", letterSpacing: "0.15em", textTransform: "uppercase" }}>Emerald Kingdom Admin</p>
      </div>
      <nav>
        {menuItems.map((item) => (
          <a key={item.id} href={item.href} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1.5rem", color: active === item.id ? "var(--color-gold)" : "var(--color-text-muted)", textDecoration: "none", fontSize: "0.9rem", borderLeft: active === item.id ? "3px solid var(--color-gold)" : "3px solid transparent", background: active === item.id ? "var(--color-gold-dim)" : "transparent" }}>
            <span style={{ fontSize: "1.1rem", width: "20px", textAlign: "center" }}>{item.icon}</span>
            {item.label}
          </a>
        ))}
      </nav>
    </aside>
  );
}

const mockAuctions = [
  { id: "auc1", title: "Ancient Dragon Scale Shield", rarity: "LEGENDARY", type: "STANDARD", status: "ACTIVE", currentPrice: 12500, bids: 8, endTime: "2026-05-31T18:00:00Z" },
  { id: "auc2", title: "Royal Crown of Elysia", rarity: "TRANSCENDENT", type: "LIVE", status: "UPCOMING", currentPrice: 0, bids: 0, endTime: "2026-06-07T18:00:00Z" },
  { id: "auc3", title: "Enchanted Sapphire Ring", rarity: "EPIC", type: "DESCENDING", status: "ACTIVE", currentPrice: 15000, bids: 3, endTime: "2026-05-31T12:00:00Z" },
  { id: "auc4", title: "Mystery Sealed Chest #7", rarity: "RARE", type: "SEALED_CHEST", status: "ACTIVE", currentPrice: 7500, bids: 12, endTime: "2026-05-31T20:00:00Z" },
  { id: "auc5", title: "Emerald Founding Scroll", rarity: "LEGENDARY", type: "RANK_EXCL", status: "UPCOMING", currentPrice: 0, bids: 0, endTime: "2026-06-10T18:00:00Z" },
  { id: "auc6", title: "Golden Throne Miniature", rarity: "EPIC", type: "STANDARD", status: "ENDED", currentPrice: 25000, bids: 22, endTime: "2026-05-28T18:00:00Z" },
];

function RarityBadge({ rarity }: { rarity: string }) {
  const colors: Record<string, string> = {
    COMMON: "#8a8a9a", UNCOMMON: "#22c55e", RARE: "#3b82f6",
    EPIC: "#8b5cf6", LEGENDARY: "#f59e0b", TRANSCENDENT: "#ffd700",
  };
  return (
    <span style={{ padding: "0.2rem 0.6rem", borderRadius: "999px", fontSize: "0.65rem", fontWeight: 700, background: `${colors[rarity]}22`, color: colors[rarity], border: `1px solid ${colors[rarity]}44` }}>
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
    <span style={{ padding: "0.2rem 0.6rem", borderRadius: "4px", fontSize: "0.7rem", fontWeight: 600, background: `${colors[status]}15`, color: colors[status] }}>
      {status}
    </span>
  );
}

export default function AuctionsPage() {
  const [filter, setFilter] = useState("ALL");
  const [cancelModal, setCancelModal] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  const statuses = ["ALL", "ACTIVE", "UPCOMING", "ENDED", "CANCELLED"];
  const filtered = filter === "ALL" ? mockAuctions : mockAuctions.filter((a) => a.status === filter);

  return (
    <div style={{ display: "flex" }}>
      <Sidebar active="auctions" />
      <main style={{ marginLeft: "260px", flex: 1, padding: "2rem", minHeight: "100vh" }}>
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
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "1rem" }}>
          {filtered.map((auction) => (
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
                <span style={{ padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.65rem", background: "rgba(138,138,154,0.15)", color: "var(--color-text-muted)" }}>{auction.type}</span>
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
                  <p style={{ fontFamily: "'Orbitron', monospace", fontSize: "1.1rem", color: "var(--color-info)" }}>{auction.bids}</p>
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
        </div>

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
              <textarea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} placeholder="Alasan pembatalan..." style={{ width: "100%", minHeight: "80px", background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "8px", padding: "0.75rem", color: "var(--color-ivory)", fontSize: "0.85rem", marginBottom: "1rem", resize: "vertical" }} />
              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
                <button onClick={() => setCancelModal(null)} style={{ padding: "0.5rem 1.25rem", background: "transparent", border: "1px solid var(--color-border)", color: "var(--color-text-muted)", borderRadius: "8px", cursor: "pointer" }}>Batal</button>
                <button style={{ padding: "0.5rem 1.25rem", background: "#ef4444", border: "none", color: "#fff", borderRadius: "8px", cursor: "pointer", fontWeight: 700 }}>Konfirmasi Batalkan</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
