"use client";

import { useState } from "react";

/**
 * Kelola Museum — Admin Panel
 * Kurasi item ke museum dan tulis editorial.
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
      <nav>{menuItems.map((item) => (<a key={item.id} href={item.href} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1.5rem", color: active === item.id ? "var(--color-gold)" : "var(--color-text-muted)", textDecoration: "none", fontSize: "0.9rem", borderLeft: active === item.id ? "3px solid var(--color-gold)" : "3px solid transparent", background: active === item.id ? "var(--color-gold-dim)" : "transparent" }}><span style={{ fontSize: "1.1rem", width: "20px", textAlign: "center" }}>{item.icon}</span>{item.label}</a>))}</nav>
    </aside>
  );
}

const museumItems = [
  { id: "m1", title: "Golden Throne Miniature", rarity: "EPIC", finalPrice: 25000, winner: "EarlGrey", editorial: "Replika takhta kerajaan yang diukir tangan oleh pengrajin terbaik kerajaan.", featuredAt: "2026-05-28" },
  { id: "m2", title: "Silver Phoenix Pendant", rarity: "LEGENDARY", finalPrice: 45000, winner: "MarquisDeSade", editorial: "", featuredAt: "" },
];

const eligibleAuctions = [
  { id: "e1", title: "Ancient Dragon Scale Shield", rarity: "LEGENDARY", finalPrice: 12500 },
  { id: "e2", title: "Enchanted Sapphire Ring", rarity: "EPIC", finalPrice: 15000 },
];

export default function MuseumPage() {
  const [showCurate, setShowCurate] = useState(false);
  const [editorial, setEditorial] = useState("");

  return (
    <div style={{ display: "flex" }}>
      <Sidebar active="museum" />
      <main style={{ marginLeft: "260px", flex: 1, padding: "2rem", minHeight: "100vh" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <div>
            <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: "1.5rem", color: "var(--color-ivory)" }}>Kelola Museum</h2>
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", marginTop: "0.25rem" }}>Kurasi item legendaris ke Hall of Legends</p>
          </div>
          <button onClick={() => setShowCurate(!showCurate)} style={{ padding: "0.6rem 1.25rem", background: "var(--color-gold)", color: "#0a0a0f", border: "none", borderRadius: "8px", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" }}>
            + Kurasi Item
          </button>
        </div>

        {/* Curate Form */}
        {showCurate && (
          <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-gold)", borderRadius: "12px", padding: "1.5rem", marginBottom: "1.5rem" }}>
            <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: "1rem", color: "var(--color-gold)", marginBottom: "1rem" }}>Pilih Item untuk Dikurasi</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1rem" }}>
              {eligibleAuctions.map((a) => (
                <label key={a.id} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem", background: "var(--color-bg)", borderRadius: "8px", cursor: "pointer", border: "1px solid var(--color-border)" }}>
                  <input type="radio" name="museum-item" style={{ accentColor: "var(--color-gold)" }} />
                  <span style={{ flex: 1, fontSize: "0.85rem" }}>{a.title}</span>
                  <span style={{ fontSize: "0.75rem", color: "var(--color-gold)", fontFamily: "'Orbitron', monospace" }}>{"\u265B"}{a.finalPrice.toLocaleString("id-ID")}</span>
                </label>
              ))}
            </div>
            <label style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", textTransform: "uppercase" }}>Editorial</label>
            <textarea value={editorial} onChange={(e) => setEditorial(e.target.value)} placeholder="Tulis deskripsi kurasi..." style={{ width: "100%", minHeight: "80px", background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "8px", padding: "0.75rem", color: "var(--color-ivory)", fontSize: "0.85rem", marginTop: "0.5rem", marginBottom: "1rem", resize: "vertical" }} />
            <button style={{ padding: "0.5rem 1.5rem", background: "var(--color-gold)", color: "#0a0a0f", border: "none", borderRadius: "8px", fontWeight: 700, cursor: "pointer" }}>Kurasi ke Museum</button>
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
                <h4 style={{ fontSize: "0.95rem", fontWeight: 600, marginBottom: "0.5rem" }}>{item.title}</h4>
                <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem" }}>
                  <span style={{ padding: "0.2rem 0.5rem", borderRadius: "999px", fontSize: "0.65rem", fontWeight: 700, background: "rgba(245,158,11,0.15)", color: "#f59e0b" }}>{item.rarity}</span>
                  <span style={{ fontSize: "0.75rem", color: "var(--color-gold)", fontFamily: "'Orbitron', monospace" }}>{"\u265B"}{item.finalPrice.toLocaleString("id-ID")}</span>
                </div>
                {item.editorial ? (
                  <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", fontStyle: "italic", lineHeight: 1.5 }}>"{item.editorial}"</p>
                ) : (
                  <p style={{ fontSize: "0.8rem", color: "#ef4444" }}>Editorial belum ditulis</p>
                )}
                <p style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", marginTop: "0.5rem" }}>Pemenang: {item.winner}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
