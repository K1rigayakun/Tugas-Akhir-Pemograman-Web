"use client";

import { useState } from "react";

/**
 * Kelola Event — Admin Panel
 * Buat, aktifkan, dan akhiri event seasonal.
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

const mockEvents = [
  { id: "evt1", name: "The Grand Coronation", theme: "coronation", expMultiplier: 2.0, isActive: true, startTime: "2026-05-30T00:00:00Z", endTime: "2026-06-06T23:59:59Z", accentColors: ["#FFD700", "#B8860B"] },
  { id: "evt2", name: "Night of Shadows", theme: "dark_festival", expMultiplier: 1.5, isActive: false, startTime: "2026-06-15T00:00:00Z", endTime: "2026-06-22T23:59:59Z", accentColors: ["#8b5cf6", "#4c1d95"] },
  { id: "evt3", name: "Harvest Moon Gala", theme: "harvest", expMultiplier: 1.75, isActive: false, startTime: "2026-07-01T00:00:00Z", endTime: "2026-07-07T23:59:59Z", accentColors: ["#f59e0b", "#78350f"] },
];

export default function EventsPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({ name: "", theme: "", expMultiplier: "1.5", startTime: "", endTime: "", color1: "#c9a84c", color2: "#0a2620" });

  return (
    <div style={{ display: "flex" }}>
      <Sidebar active="events" />
      <main style={{ marginLeft: "260px", flex: 1, padding: "2rem", minHeight: "100vh" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <div>
            <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: "1.5rem", color: "var(--color-ivory)" }}>Kelola Event</h2>
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", marginTop: "0.25rem" }}>Buat dan kelola event seasonal platform</p>
          </div>
          <button onClick={() => setShowCreate(!showCreate)} style={{ padding: "0.6rem 1.25rem", background: "var(--color-gold)", color: "#0a0a0f", border: "none", borderRadius: "8px", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" }}>
            + Buat Event
          </button>
        </div>

        {/* Create Form */}
        {showCreate && (
          <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-gold)", borderRadius: "12px", padding: "1.5rem", marginBottom: "1.5rem" }}>
            <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: "1rem", color: "var(--color-gold)", marginBottom: "1.25rem" }}>Event Baru</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
              {[
                { label: "Nama Event", key: "name", type: "text", placeholder: "The Grand Coronation" },
                { label: "Theme", key: "theme", type: "text", placeholder: "coronation" },
                { label: "EXP Multiplier", key: "expMultiplier", type: "number", placeholder: "1.5" },
                { label: "Mulai", key: "startTime", type: "datetime-local", placeholder: "" },
                { label: "Selesai", key: "endTime", type: "datetime-local", placeholder: "" },
              ].map((field) => (
                <div key={field.key}>
                  <label style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{field.label}</label>
                  <input
                    type={field.type}
                    value={(formData as any)[field.key]}
                    onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                    placeholder={field.placeholder}
                    style={{ width: "100%", background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "8px", padding: "0.6rem", color: "var(--color-ivory)", fontSize: "0.85rem", marginTop: "0.35rem" }}
                  />
                </div>
              ))}
              <div>
                <label style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Warna Aksen</label>
                <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.35rem" }}>
                  <input type="color" value={formData.color1} onChange={(e) => setFormData({ ...formData, color1: e.target.value })} style={{ width: "50px", height: "38px", border: "none", borderRadius: "6px", cursor: "pointer" }} />
                  <input type="color" value={formData.color2} onChange={(e) => setFormData({ ...formData, color2: e.target.value })} style={{ width: "50px", height: "38px", border: "none", borderRadius: "6px", cursor: "pointer" }} />
                </div>
              </div>
            </div>
            <button style={{ padding: "0.5rem 1.5rem", background: "var(--color-gold)", color: "#0a0a0f", border: "none", borderRadius: "8px", fontWeight: 700, cursor: "pointer" }}>Buat Event</button>
          </div>
        )}

        {/* Event Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {mockEvents.map((evt) => (
            <div key={evt.id} style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "12px", overflow: "hidden" }}>
              {/* Color Banner */}
              <div style={{ height: "6px", background: `linear-gradient(90deg, ${evt.accentColors[0]}, ${evt.accentColors[1]})` }} />
              <div style={{ padding: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                    <h4 style={{ fontSize: "1rem", fontWeight: 600 }}>{evt.name}</h4>
                    {evt.isActive ? (
                      <span style={{ padding: "0.2rem 0.6rem", borderRadius: "999px", fontSize: "0.65rem", fontWeight: 700, background: "rgba(34,197,94,0.15)", color: "#22c55e", animation: "pulse 2s infinite" }}>ACTIVE</span>
                    ) : (
                      <span style={{ padding: "0.2rem 0.6rem", borderRadius: "999px", fontSize: "0.65rem", background: "rgba(138,138,154,0.15)", color: "#8a8a9a" }}>SCHEDULED</span>
                    )}
                  </div>
                  <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
                    Theme: {evt.theme} | EXP: x{evt.expMultiplier} | {new Date(evt.startTime).toLocaleDateString("id-ID")} — {new Date(evt.endTime).toLocaleDateString("id-ID")}
                  </p>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  {!evt.isActive && (
                    <button style={{ padding: "0.4rem 1rem", fontSize: "0.8rem", background: "rgba(34,197,94,0.15)", border: "1px solid #22c55e", color: "#22c55e", borderRadius: "6px", cursor: "pointer" }}>Aktifkan</button>
                  )}
                  {evt.isActive && (
                    <button style={{ padding: "0.4rem 1rem", fontSize: "0.8rem", background: "rgba(239,68,68,0.15)", border: "1px solid #ef4444", color: "#ef4444", borderRadius: "6px", cursor: "pointer" }}>Akhiri</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
