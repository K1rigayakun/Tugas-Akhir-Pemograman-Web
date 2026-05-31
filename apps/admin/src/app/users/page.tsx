"use client";

import { useState } from "react";

/**
 * Kelola User — Admin Panel
 *
 * Fitur:
 * - Search user (email, username)
 * - Tabel user dengan filter
 * - Profil lengkap: riwayat bid, transaksi, sanksi
 * - Aksi: warn, suspend, ban auction, ban permanent
 */

// ============================================================
// Sidebar (shared — nanti refactor ke component terpisah)
// ============================================================

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
    <aside
      style={{
        width: "260px",
        minHeight: "100vh",
        background: "var(--color-surface)",
        borderRight: "1px solid var(--color-border)",
        padding: "1.5rem 0",
        position: "fixed",
        left: 0,
        top: 0,
      }}
    >
      <div style={{ padding: "0 1.5rem", marginBottom: "2rem" }}>
        <h1
          style={{
            fontFamily: "'Cinzel Decorative', serif",
            fontSize: "1.1rem",
            color: "var(--color-gold)",
          }}
        >
          Praetorian Console
        </h1>
        <p style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", marginTop: "0.25rem", letterSpacing: "0.15em", textTransform: "uppercase" }}>
          Emerald Kingdom Admin
        </p>
      </div>
      <nav>
        {menuItems.map((item) => (
          <a
            key={item.id}
            href={item.href}
            style={{
              display: "flex", alignItems: "center", gap: "0.75rem",
              padding: "0.75rem 1.5rem",
              color: active === item.id ? "var(--color-gold)" : "var(--color-text-muted)",
              textDecoration: "none", fontSize: "0.9rem",
              borderLeft: active === item.id ? "3px solid var(--color-gold)" : "3px solid transparent",
              background: active === item.id ? "var(--color-gold-dim)" : "transparent",
              transition: "all 0.2s",
            }}
          >
            <span style={{ fontSize: "1.1rem", width: "20px", textAlign: "center" }}>{item.icon}</span>
            {item.label}
          </a>
        ))}
      </nav>
    </aside>
  );
}

// ============================================================
// User Table
// ============================================================

const mockUsers = [
  { id: "clx1", username: "SirLancelot", email: "knight@demo.id", rank: "KNIGHT", kycStatus: "APPROVED", isSuspended: false, totalBids: 42, lastActive: "2 jam lalu" },
  { id: "clx2", username: "BaronVonDuke", email: "baron@demo.id", rank: "BARON", kycStatus: "APPROVED", isSuspended: false, totalBids: 89, lastActive: "5 menit lalu" },
  { id: "clx3", username: "EarlGrey", email: "earl@demo.id", rank: "EARL", kycStatus: "APPROVED", isSuspended: false, totalBids: 156, lastActive: "1 jam lalu" },
  { id: "clx4", username: "MarquisDeSade", email: "marquis@demo.id", rank: "MARQUIS", kycStatus: "APPROVED", isSuspended: true, totalBids: 234, lastActive: "3 hari lalu" },
  { id: "clx5", username: "NewCivis", email: "civis@demo.id", rank: "CIVIS", kycStatus: "NONE", isSuspended: false, totalBids: 0, lastActive: "Baru saja" },
];

function RankBadge({ rank }: { rank: string }) {
  const colors: Record<string, string> = {
    CIVIS: "#8a8a9a", MERCHANT: "#22c55e", KNIGHT: "#3b82f6",
    BARON: "#8b5cf6", VISCOUNT: "#ec4899", EARL: "#f59e0b",
    MARQUIS: "#ef4444", DUKE: "#c9a84c", SOVEREIGN: "#e8d48b", EMPEROR: "#ffd700",
  };
  return (
    <span style={{
      padding: "0.2rem 0.6rem", borderRadius: "999px", fontSize: "0.7rem", fontWeight: 700,
      background: `${colors[rank] || "#666"}22`, color: colors[rank] || "#666",
      border: `1px solid ${colors[rank] || "#666"}44`,
    }}>
      {rank}
    </span>
  );
}

// ============================================================
// Action Modal
// ============================================================

function ActionModal({ user, action, onClose }: {
  user: typeof mockUsers[0];
  action: string;
  onClose: () => void;
}) {
  const [reason, setReason] = useState("");
  const [days, setDays] = useState(7);

  const actionLabels: Record<string, { title: string; color: string; }> = {
    warn: { title: "Kirim Peringatan", color: "#f59e0b" },
    suspend: { title: "Suspend Sementara", color: "#ef4444" },
    "ban-auction": { title: "Larang Ikut Lelang", color: "#ef4444" },
    "ban-permanent": { title: "Ban Permanen", color: "#dc2626" },
  };

  const cfg = actionLabels[action] || { title: action, color: "#666" };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000,
    }} onClick={onClose}>
      <div style={{
        background: "var(--color-surface)", border: "1px solid var(--color-border)",
        borderRadius: "16px", padding: "2rem", width: "480px", maxWidth: "90vw",
      }} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ fontFamily: "'Cinzel', serif", color: cfg.color, marginBottom: "1rem" }}>
          {cfg.title}
        </h3>
        <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginBottom: "1rem" }}>
          Target: <strong style={{ color: "var(--color-ivory)" }}>{user.username}</strong> ({user.email})
        </p>

        <label style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          Alasan
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Tulis alasan tindakan..."
          style={{
            width: "100%", minHeight: "80px", background: "var(--color-bg)",
            border: "1px solid var(--color-border)", borderRadius: "8px",
            padding: "0.75rem", color: "var(--color-ivory)", fontSize: "0.85rem",
            marginTop: "0.5rem", marginBottom: "1rem", resize: "vertical",
          }}
        />

        {action === "suspend" && (
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Durasi (hari)
            </label>
            <input
              type="number"
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              min={1} max={365}
              style={{
                width: "100%", background: "var(--color-bg)",
                border: "1px solid var(--color-border)", borderRadius: "8px",
                padding: "0.75rem", color: "var(--color-ivory)", fontSize: "0.85rem",
                marginTop: "0.5rem",
              }}
            />
          </div>
        )}

        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{
            padding: "0.5rem 1.25rem", background: "transparent",
            border: "1px solid var(--color-border)", color: "var(--color-text-muted)",
            borderRadius: "8px", cursor: "pointer", fontSize: "0.85rem",
          }}>
            Batal
          </button>
          <button style={{
            padding: "0.5rem 1.25rem", background: cfg.color,
            border: "none", color: "#fff", borderRadius: "8px",
            cursor: "pointer", fontSize: "0.85rem", fontWeight: 700,
          }}>
            Konfirmasi
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Main Page
// ============================================================

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<typeof mockUsers[0] | null>(null);
  const [actionType, setActionType] = useState<string | null>(null);

  const filtered = mockUsers.filter(
    (u) =>
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div style={{ display: "flex" }}>
      <Sidebar active="users" />

      <main style={{ marginLeft: "260px", flex: 1, padding: "2rem", minHeight: "100vh" }}>
        <div style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: "1.5rem", color: "var(--color-ivory)" }}>
            Kelola User
          </h2>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", marginTop: "0.25rem" }}>
            Cari, lihat profil, dan kelola user platform
          </p>
        </div>

        {/* Search Bar */}
        <div style={{ marginBottom: "1.5rem" }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari username atau email..."
            style={{
              width: "100%", maxWidth: "400px", background: "var(--color-surface)",
              border: "1px solid var(--color-border)", borderRadius: "8px",
              padding: "0.75rem 1rem", color: "var(--color-ivory)", fontSize: "0.9rem",
            }}
          />
        </div>

        {/* User Table */}
        <div style={{
          background: "var(--color-surface)", border: "1px solid var(--color-border)",
          borderRadius: "12px", overflow: "hidden",
        }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Username", "Email", "Rank", "KYC", "Total Bid", "Terakhir Aktif", "Status", "Aksi"].map((h) => (
                  <th key={h} style={{
                    textAlign: "left", padding: "0.75rem 1rem", fontSize: "0.7rem",
                    textTransform: "uppercase", letterSpacing: "0.1em",
                    color: "var(--color-text-muted)", borderBottom: "1px solid var(--color-border)",
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id} style={{ borderBottom: "1px solid var(--color-border)", transition: "background 0.2s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-surface-hover)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={{ padding: "0.75rem 1rem", fontSize: "0.85rem", fontWeight: 600 }}>{user.username}</td>
                  <td style={{ padding: "0.75rem 1rem", fontSize: "0.85rem", color: "var(--color-text-muted)" }}>{user.email}</td>
                  <td style={{ padding: "0.75rem 1rem" }}><RankBadge rank={user.rank} /></td>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    <span style={{
                      padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.7rem",
                      background: user.kycStatus === "APPROVED" ? "rgba(34,197,94,0.15)" : "rgba(138,138,154,0.15)",
                      color: user.kycStatus === "APPROVED" ? "#22c55e" : "#8a8a9a",
                    }}>
                      {user.kycStatus}
                    </span>
                  </td>
                  <td style={{ padding: "0.75rem 1rem", fontSize: "0.85rem", fontFamily: "'Orbitron', monospace", color: "var(--color-gold)" }}>{user.totalBids}</td>
                  <td style={{ padding: "0.75rem 1rem", fontSize: "0.8rem", color: "var(--color-text-muted)" }}>{user.lastActive}</td>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    {user.isSuspended ? (
                      <span style={{ color: "#ef4444", fontSize: "0.75rem", fontWeight: 700 }}>SUSPENDED</span>
                    ) : (
                      <span style={{ color: "#22c55e", fontSize: "0.75rem" }}>Active</span>
                    )}
                  </td>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    <div style={{ display: "flex", gap: "0.25rem" }}>
                      {["warn", "suspend", "ban-auction", "ban-permanent"].map((act) => (
                        <button
                          key={act}
                          onClick={() => { setSelectedUser(user); setActionType(act); }}
                          style={{
                            padding: "0.25rem 0.5rem", fontSize: "0.65rem",
                            background: "transparent", border: "1px solid var(--color-border)",
                            color: act.includes("ban") ? "#ef4444" : "var(--color-text-muted)",
                            borderRadius: "4px", cursor: "pointer", textTransform: "capitalize",
                          }}
                        >
                          {act.replace("-", " ")}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {selectedUser && actionType && (
          <ActionModal
            user={selectedUser}
            action={actionType}
            onClose={() => { setSelectedUser(null); setActionType(null); }}
          />
        )}
      </main>
    </div>
  );
}
