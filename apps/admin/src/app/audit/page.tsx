"use client";

import { useState, useEffect } from "react";
import { fetchWithAuth } from "../../lib/api";
import { Loader2 } from "lucide-react";

/**
 * Audit Log — Admin Panel
 * Tampilan read-only semua aksi admin. Tidak bisa difilter atau disembunyikan.
 */

function ActionBadge({ action }: { action: string }) {
  const colors: Record<string, string> = {
    START_LIVE_AUCTION: "#22c55e", END_LIVE_AUCTION: "#8a8a9a",
    APPROVE_KYC: "#22c55e", REJECT_KYC: "#ef4444",
    SUSPEND_USER: "#f59e0b", BAN_FROM_AUCTION: "#ef4444", BAN_PERMANENT: "#dc2626",
    WARN_USER: "#f59e0b",
    CANCEL_AUCTION: "#ef4444",
    CREATE_EVENT: "#3b82f6", ACTIVATE_EVENT: "#22c55e", END_EVENT: "#8a8a9a",
    CURATE_MUSEUM: "#8b5cf6",
  };
  return (
    <span style={{
      padding: "0.2rem 0.6rem", borderRadius: "4px", fontSize: "0.65rem", fontWeight: 700,
      fontFamily: "'Orbitron', monospace", letterSpacing: "0.05em",
      background: `${colors[action] || "#666"}15`, color: colors[action] || "#666",
    }}>
      {action}
    </span>
  );
}

export default function AuditPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });

  const loadLogs = async (page = 1) => {
    setLoading(true);
    try {
      const res = await fetchWithAuth(`/v1/admin/audit-logs?page=${page}&limit=${pagination.limit}`);
      const data = await res.json();
      if (res.ok) {
        setLogs(data.data || []);
        if (data.pagination) setPagination(data.pagination);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs(pagination.page);
  }, [pagination.page]);

  return (
    <main style={{ padding: "2.5rem", minHeight: "100vh", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: "1.5rem", color: "var(--color-ivory)" }}>Audit Log</h2>
        <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", marginTop: "0.25rem" }}>
          Catatan semua aksi admin — read-only, append-only, tidak bisa diubah atau dihapus
        </p>
      </div>

      {/* Immutability Notice */}
      <div style={{
        background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.3)",
        borderRadius: "8px", padding: "0.75rem 1rem", marginBottom: "1.5rem",
        display: "flex", alignItems: "center", gap: "0.75rem",
      }}>
        <span style={{ fontSize: "1.2rem" }}>{"\u26A0"}</span>
        <p style={{ fontSize: "0.8rem", color: "#f59e0b" }}>
          Audit log dilindungi oleh database constraint. Data ini tidak bisa diedit, difilter, atau dihapus oleh siapapun — termasuk Super Admin.
        </p>
      </div>

      {/* Log Table */}
      <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "12px", overflow: "hidden", minHeight: "300px" }}>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "300px" }}>
            <Loader2 className="animate-spin" color="var(--color-gold)" size={32} />
          </div>
        ) : (
          <>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Waktu", "Admin", "Aksi", "Target", "Detail", "IP Address"].map((h) => (
                    <th key={h} style={{
                      textAlign: "left", padding: "0.75rem 1rem", fontSize: "0.65rem",
                      textTransform: "uppercase", letterSpacing: "0.1em",
                      color: "var(--color-text-muted)", borderBottom: "1px solid var(--color-border)",
                      background: "rgba(0,0,0,0.2)",
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: "1px solid var(--color-border)", transition: "background 0.2s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={{ padding: "0.75rem 1rem", fontSize: "0.8rem", color: "var(--color-text-muted)", whiteSpace: "nowrap" }}>
                      {new Date(log.timestamp).toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td style={{ padding: "0.75rem 1rem", fontSize: "0.85rem", fontWeight: 600 }}>{log.adminId}</td>
                    <td style={{ padding: "0.75rem 1rem" }}><ActionBadge action={log.action} /></td>
                    <td style={{ padding: "0.75rem 1rem", fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
                      {log.targetType}:{log.targetId ? log.targetId.slice(0, 8) : "N/A"}
                    </td>
                    <td style={{ padding: "0.75rem 1rem", fontSize: "0.8rem", color: "var(--color-text-muted)", maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={JSON.stringify(log.details)}>
                      {JSON.stringify(log.details)}
                    </td>
                    <td style={{ padding: "0.75rem 1rem", fontSize: "0.75rem", fontFamily: "monospace", color: "var(--color-text-muted)" }}>
                      {log.ipAddress}
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: "2rem", color: "var(--color-text-muted)" }}>
                      Belum ada audit log.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div style={{ padding: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--color-border)" }}>
                <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
                  Menampilkan {((pagination.page - 1) * pagination.limit) + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)} dari {pagination.total} log
                </p>
                <div style={{ display: "flex", gap: "0.25rem" }}>
                  <button 
                    disabled={pagination.page === 1}
                    onClick={() => setPagination({...pagination, page: pagination.page - 1})}
                    style={{ width: "32px", height: "32px", borderRadius: "6px", fontSize: "0.8rem", background: "transparent", border: "1px solid var(--color-border)", color: "var(--color-text-muted)", cursor: pagination.page === 1 ? "not-allowed" : "pointer" }}
                  >
                    &lt;
                  </button>
                  <button style={{ width: "32px", height: "32px", borderRadius: "6px", fontSize: "0.8rem", background: "var(--color-gold-dim)", border: "1px solid var(--color-gold)", color: "var(--color-gold)" }}>
                    {pagination.page}
                  </button>
                  <button 
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => setPagination({...pagination, page: pagination.page + 1})}
                    style={{ width: "32px", height: "32px", borderRadius: "6px", fontSize: "0.8rem", background: "transparent", border: "1px solid var(--color-border)", color: "var(--color-text-muted)", cursor: pagination.page >= pagination.totalPages ? "not-allowed" : "pointer" }}
                  >
                    &gt;
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
