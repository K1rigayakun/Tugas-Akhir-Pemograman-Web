"use client";

import { useState, useEffect } from "react";
import { Search, ShieldAlert, CheckCircle, Ban, AlertTriangle, Loader2 } from "lucide-react";
import { fetchWithAuth } from "../../lib/api";

/**
 * Kelola User — Admin Panel
 */

function RankBadge({ rank }: { rank: string }) {
  const colors: Record<string, string> = {
    CIVIS: "#8a8a9a", MERCHANT: "#22c55e", KNIGHT: "#3b82f6",
    BARON: "#8b5cf6", VISCOUNT: "#ec4899", EARL: "#f59e0b",
    MARQUIS: "#ef4444", DUKE: "#c9a84c", SOVEREIGN: "#e8d48b", EMPEROR: "#ffd700",
  };
  return (
    <span style={{
      padding: "0.25rem 0.6rem", borderRadius: "6px", fontSize: "0.7rem", fontWeight: 700,
      background: `${colors[rank] || "#666"}22`, color: colors[rank] || "#666",
      border: `1px solid ${colors[rank] || "#666"}44`,
    }}>
      {rank}
    </span>
  );
}

function ActionModal({ user, action, onClose, onRefresh }: {
  user: any;
  action: string;
  onClose: () => void;
  onRefresh: () => void;
}) {
  const [reason, setReason] = useState("");
  const [days, setDays] = useState(7);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const actionLabels: Record<string, { title: string; color: string; endpoint: string }> = {
    warn: { title: "Kirim Peringatan", color: "#f59e0b", endpoint: `/v1/admin/users/${user.id}/warn` },
    suspend: { title: "Suspend Sementara", color: "#ef4444", endpoint: `/v1/admin/users/${user.id}/suspend` },
    "ban-auction": { title: "Larang Ikut Lelang", color: "#ef4444", endpoint: `/v1/admin/users/${user.id}/ban-auction` },
    "ban-permanent": { title: "Ban Permanen", color: "#dc2626", endpoint: `/v1/admin/users/${user.id}/ban-permanent` },
  };

  const cfg = actionLabels[action] || { title: action, color: "#666", endpoint: "" };

  const handleAction = async () => {
    setIsLoading(true);
    setError("");
    try {
      const payload: any = { reason };
      if (action === "suspend") payload.durationDays = days;

      const res = await fetchWithAuth(cfg.endpoint, {
        method: "POST",
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal mengeksekusi aksi");
      
      onRefresh();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, backdropFilter: "blur(4px)"
    }} onClick={onClose}>
      <div className="glass-panel" style={{
        padding: "2rem", width: "480px", maxWidth: "90vw",
        border: `1px solid ${cfg.color}55`
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
          <AlertTriangle color={cfg.color} size={24} />
          <h3 style={{ fontSize: "1.25rem", color: cfg.color, fontWeight: 700 }}>
            {cfg.title}
          </h3>
        </div>
        
        <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginBottom: "1.5rem" }}>
          Target: <strong style={{ color: "var(--color-ivory)" }}>{user.username}</strong> ({user.email})
        </p>

        {error && (
          <div style={{ padding: "0.75rem", background: "rgba(239, 68, 68, 0.1)", color: "var(--color-danger)", fontSize: "0.85rem", borderRadius: "8px", marginBottom: "1rem" }}>
            {error}
          </div>
        )}

        <label style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>
          Alasan Tindakan
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Tulis alasan administratif untuk log audit..."
          style={{
            width: "100%", minHeight: "100px", background: "rgba(0,0,0,0.3)",
            border: "1px solid var(--color-border)", borderRadius: "8px",
            padding: "0.75rem", color: "var(--color-ivory)", fontSize: "0.85rem",
            marginTop: "0.5rem", marginBottom: "1.5rem", resize: "vertical",
          }}
        />

        {action === "suspend" && (
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>
              Durasi (hari)
            </label>
            <input
              type="number"
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              min={1} max={365}
              style={{
                width: "100%", background: "rgba(0,0,0,0.3)",
                border: "1px solid var(--color-border)", borderRadius: "8px",
                padding: "0.75rem", color: "var(--color-ivory)", fontSize: "0.85rem",
                marginTop: "0.5rem",
              }}
            />
          </div>
        )}

        <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
          <button onClick={onClose} disabled={isLoading} style={{
            padding: "0.5rem 1.25rem", background: "transparent",
            border: "1px solid var(--color-border)", color: "var(--color-text-muted)",
            borderRadius: "6px", cursor: "pointer", fontSize: "0.85rem", fontWeight: 600,
            transition: "all 0.2s"
          }}>
            Batal
          </button>
          <button onClick={handleAction} disabled={isLoading} style={{
            padding: "0.5rem 1.5rem", background: cfg.color,
            border: "none", color: "#fff", borderRadius: "6px",
            cursor: "pointer", fontSize: "0.85rem", fontWeight: 700,
            opacity: isLoading ? 0.7 : 1
          }}>
            {isLoading ? "Memproses..." : "Konfirmasi Tindakan"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [actionType, setActionType] = useState<string | null>(null);

  const fetchUsers = async (query = "") => {
    setLoading(true);
    try {
      const res = await fetchWithAuth(`/v1/admin/users/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (res.ok) {
        setUsers(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchUsers(search);
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [search]);

  return (
    <main style={{ padding: "2.5rem", minHeight: "100vh", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2.5rem" }}>
        <h2 style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--color-ivory)", letterSpacing: "-0.02em" }}>
          Kelola User
        </h2>
        <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", marginTop: "0.5rem" }}>
          Cari, lihat profil, dan kelola user platform
        </p>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: "1.5rem", position: "relative" }}>
        <Search size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)" }} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari username atau email..."
          style={{
            width: "100%",
            maxWidth: "400px",
            padding: "0.75rem 1rem 0.75rem 2.75rem",
            background: "rgba(0,0,0,0.2)",
            border: "1px solid var(--color-border)",
            borderRadius: "8px",
            color: "var(--color-ivory)",
            fontSize: "0.9rem",
            outline: "none",
            transition: "border-color 0.2s"
          }}
          onFocus={(e) => e.target.style.borderColor = "var(--color-emerald)"}
          onBlur={(e) => e.target.style.borderColor = "var(--color-border)"}
        />
      </div>

      {/* Table */}
      <div className="glass-panel" style={{ overflow: "hidden", minHeight: "300px" }}>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "300px" }}>
            <Loader2 className="animate-spin" color="var(--color-emerald)" size={32} />
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["User", "Rank", "KYC", "Status", "Aksi"].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: "left",
                      padding: "1rem 1.5rem",
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      color: "var(--color-text-muted)",
                      borderBottom: "1px solid var(--color-border)",
                      fontWeight: 600,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((row) => (
                <tr
                  key={row.id}
                  style={{
                    borderBottom: "1px solid var(--color-border)",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLTableRowElement).style.background =
                      "rgba(255,255,255,0.02)")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLTableRowElement).style.background = "transparent")
                  }
                >
                  <td style={{ padding: "1rem 1.5rem" }}>
                    <p style={{ fontWeight: 600, color: "var(--color-ivory)", fontSize: "0.9rem" }}>{row.username}</p>
                    <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{row.email}</p>
                  </td>
                  <td style={{ padding: "1rem 1.5rem" }}>
                    <RankBadge rank={row.rank} />
                  </td>
                  <td style={{ padding: "1rem 1.5rem" }}>
                    <span style={{ 
                      fontSize: "0.75rem", fontWeight: 600,
                      color: row.kycStatus === "APPROVED" ? "var(--color-success)" : "var(--color-warning)" 
                    }}>
                      {row.kycStatus}
                    </span>
                  </td>
                  <td style={{ padding: "1rem 1.5rem" }}>
                    {row.isSuspended ? (
                      <span style={{ color: "var(--color-danger)", fontSize: "0.8rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.25rem" }}>
                        <Ban size={14} /> Suspended
                      </span>
                    ) : (
                      <span style={{ color: "var(--color-success)", fontSize: "0.8rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.25rem" }}>
                        <CheckCircle size={14} /> Active
                      </span>
                    )}
                  </td>
                  <td style={{ padding: "1rem 1.5rem" }}>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button
                        onClick={() => { setSelectedUser(row); setActionType("warn"); }}
                        style={{
                          padding: "0.35rem 0.75rem",
                          fontSize: "0.75rem",
                          background: "rgba(245, 158, 11, 0.15)",
                          border: "1px solid rgba(245, 158, 11, 0.5)",
                          color: "#f59e0b",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontWeight: 600,
                        }}
                      >
                        Warn
                      </button>
                      <button
                        onClick={() => { setSelectedUser(row); setActionType("suspend"); }}
                        style={{
                          padding: "0.35rem 0.75rem",
                          fontSize: "0.75rem",
                          background: "rgba(239, 68, 68, 0.15)",
                          border: "1px solid rgba(239, 68, 68, 0.5)",
                          color: "#ef4444",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontWeight: 600,
                        }}
                      >
                        Suspend
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} style={{ padding: "2rem", textAlign: "center", color: "var(--color-text-muted)", fontSize: "0.85rem" }}>
                    Tidak ada user ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {selectedUser && actionType && (
        <ActionModal
          user={selectedUser}
          action={actionType}
          onClose={() => { setSelectedUser(null); setActionType(null); }}
          onRefresh={() => fetchUsers(search)}
        />
      )}
    </main>
  );
}
