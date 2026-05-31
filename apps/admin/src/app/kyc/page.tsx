"use client";

import { useState } from "react";

/**
 * Review KYC — Admin Panel
 *
 * Fitur:
 * - Antrian pengajuan KYC pending
 * - Lihat foto KTP dan selfie
 * - Approve/Reject dengan catatan
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

const mockKYC = [
  { id: "kyc1", userId: "clx1", username: "SirLancelot", email: "knight@demo.id", fullName: "[ENCRYPTED]", nationalId: "[ENCRYPTED]", city: "Medan", province: "Sumatera Utara", submittedAt: "2026-05-30T08:00:00Z" },
  { id: "kyc2", userId: "clx2", username: "BaronVonDuke", email: "baron@demo.id", fullName: "[ENCRYPTED]", nationalId: "[ENCRYPTED]", city: "Jakarta", province: "DKI Jakarta", submittedAt: "2026-05-29T14:30:00Z" },
  { id: "kyc3", userId: "clx5", username: "NewCivis", email: "civis@demo.id", fullName: "[ENCRYPTED]", nationalId: "[ENCRYPTED]", city: "Bandung", province: "Jawa Barat", submittedAt: "2026-05-28T10:00:00Z" },
];

export default function KYCPage() {
  const [selected, setSelected] = useState<typeof mockKYC[0] | null>(null);
  const [rejectNotes, setRejectNotes] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  return (
    <div style={{ display: "flex" }}>
      <Sidebar active="kyc" />
      <main style={{ marginLeft: "260px", flex: 1, padding: "2rem", minHeight: "100vh" }}>
        <div style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: "1.5rem", color: "var(--color-ivory)" }}>Review KYC</h2>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", marginTop: "0.25rem" }}>
            Verifikasi identitas user — {mockKYC.length} pengajuan menunggu
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 1fr" : "1fr", gap: "1.5rem" }}>
          {/* Queue List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {mockKYC.map((kyc) => (
              <div key={kyc.id} onClick={() => { setSelected(kyc); setShowRejectForm(false); }}
                style={{
                  background: selected?.id === kyc.id ? "var(--color-gold-dim)" : "var(--color-surface)",
                  border: `1px solid ${selected?.id === kyc.id ? "var(--color-gold)" : "var(--color-border)"}`,
                  borderRadius: "10px", padding: "1rem 1.25rem", cursor: "pointer", transition: "all 0.2s",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                  <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>{kyc.username}</span>
                  <span style={{ padding: "0.2rem 0.6rem", borderRadius: "999px", fontSize: "0.65rem", fontWeight: 700, background: "rgba(245,158,11,0.15)", color: "#f59e0b" }}>PENDING</span>
                </div>
                <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>{kyc.email}</p>
                <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>
                  {kyc.city}, {kyc.province} \u2014 {new Date(kyc.submittedAt).toLocaleDateString("id-ID")}
                </p>
              </div>
            ))}
          </div>

          {/* Detail Panel */}
          {selected && (
            <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "12px", padding: "1.5rem" }}>
              <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: "1rem", color: "var(--color-gold)", marginBottom: "1.25rem" }}>
                Detail KYC — {selected.username}
              </h3>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
                {[
                  { label: "Nama Lengkap", value: selected.fullName },
                  { label: "NIK", value: selected.nationalId },
                  { label: "Email", value: selected.email },
                  { label: "Kota", value: `${selected.city}, ${selected.province}` },
                ].map((field) => (
                  <div key={field.label}>
                    <p style={{ fontSize: "0.65rem", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.25rem" }}>{field.label}</p>
                    <p style={{ fontSize: "0.85rem", color: field.value.includes("ENCRYPTED") ? "#f59e0b" : "var(--color-ivory)" }}>{field.value}</p>
                  </div>
                ))}
              </div>

              {/* Document Placeholders */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
                {["Foto KTP", "Foto Selfie"].map((label) => (
                  <div key={label} style={{
                    background: "var(--color-bg)", border: "1px dashed var(--color-border)",
                    borderRadius: "8px", height: "140px", display: "flex",
                    alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "0.5rem",
                  }}>
                    <span style={{ fontSize: "2rem", opacity: 0.3 }}>{label === "Foto KTP" ? "\u2610" : "\u263A"}</span>
                    <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{label}</span>
                    <span style={{ fontSize: "0.65rem", color: "var(--color-text-muted)" }}>Dekripsi saat review</span>
                  </div>
                ))}
              </div>

              {/* Reject Form */}
              {showRejectForm && (
                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", textTransform: "uppercase" }}>Alasan Penolakan</label>
                  <textarea value={rejectNotes} onChange={(e) => setRejectNotes(e.target.value)} placeholder="Tulis alasan..." style={{
                    width: "100%", minHeight: "70px", background: "var(--color-bg)", border: "1px solid var(--color-border)",
                    borderRadius: "8px", padding: "0.75rem", color: "var(--color-ivory)", fontSize: "0.85rem", marginTop: "0.5rem", resize: "vertical",
                  }} />
                </div>
              )}

              {/* Actions */}
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button style={{
                  flex: 1, padding: "0.6rem", background: "rgba(34,197,94,0.15)", border: "1px solid #22c55e",
                  color: "#22c55e", borderRadius: "8px", cursor: "pointer", fontWeight: 700, fontSize: "0.85rem",
                }}>
                  Approve
                </button>
                <button onClick={() => setShowRejectForm(!showRejectForm)} style={{
                  flex: 1, padding: "0.6rem", background: showRejectForm ? "#ef4444" : "rgba(239,68,68,0.15)",
                  border: "1px solid #ef4444", color: showRejectForm ? "#fff" : "#ef4444",
                  borderRadius: "8px", cursor: "pointer", fontWeight: 700, fontSize: "0.85rem",
                }}>
                  {showRejectForm ? "Konfirmasi Reject" : "Reject"}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
