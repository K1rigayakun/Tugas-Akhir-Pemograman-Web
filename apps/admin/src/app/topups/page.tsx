"use client";

import { useEffect, useState, useCallback } from "react";
import { fetchWithAuth } from "../../lib/api";

type TopUpStatus = "PENDING" | "PAID" | "APPROVED" | "REJECTED" | "EXPIRED";

interface TopUpRequest {
  id: string;
  userId: string;
  amount: number;
  fiatAmount: number;
  method: string;
  provider: string | null;
  status: TopUpStatus;
  bank: string | null;
  walletType: string | null;
  adminNotes: string | null;
  proofImageUrl: string | null;
  paymentDetails: any;
  createdAt: string;
  expiresAt: string;
  paidAt: string | null;
  reviewedAt: string | null;
  user?: { id: string; username: string; email: string };
  admin?: { id: string; username: string };
}

const STATUS_COLORS: Record<TopUpStatus, { bg: string; text: string; border: string }> = {
  PENDING: { bg: "rgba(201, 168, 76, 0.15)", text: "#f5d080", border: "rgba(201, 168, 76, 0.4)" },
  PAID: { bg: "rgba(34, 197, 94, 0.15)", text: "#22c55e", border: "rgba(34, 197, 94, 0.4)" },
  APPROVED: { bg: "rgba(16, 185, 129, 0.15)", text: "#10b981", border: "rgba(16, 185, 129, 0.4)" },
  REJECTED: { bg: "rgba(220, 38, 38, 0.15)", text: "#dc2626", border: "rgba(220, 38, 38, 0.4)" },
  EXPIRED: { bg: "rgba(107, 114, 128, 0.15)", text: "#9ca3af", border: "rgba(107, 114, 128, 0.4)" },
};

export default function AdminTopupsPage() {
  const [topups, setTopups] = useState<TopUpRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedTopup, setSelectedTopup] = useState<TopUpRequest | null>(null);
  const [rejectNotes, setRejectNotes] = useState("");
  const [approveNotes, setApproveNotes] = useState("");
  const [processing, setProcessing] = useState(false);
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  const fetchTopups = useCallback(async () => {
    setLoading(true);
    try {
      const statusParam = filter !== "ALL" ? `&status=${filter}` : "";
      const dateFromParam = dateFrom ? `&dateFrom=${dateFrom}` : "";
      const dateToParam = dateTo ? `&dateTo=${dateTo}` : "";
      const res = await fetchWithAuth(`/v1/payment/admin/list?page=${page}&limit=20${statusParam}${dateFromParam}${dateToParam}`);
      const data = await res.json();
      if (res.ok) {
        setTopups(data.data || []);
        setTotalPages(data.totalPages || 1);
      } else {
        // Fallback to legacy endpoint
        const fallbackRes = await fetchWithAuth("/v1/payment/admin/pending");
        const fallbackData = await fallbackRes.json();
        if (fallbackRes.ok && Array.isArray(fallbackData)) {
          setTopups(fallbackData);
        } else {
          setTopups([]);
        }
      }
    } catch (err) {
      console.error(err);
      setTopups([]);
    } finally {
      setLoading(false);
    }
  }, [filter, page, dateFrom, dateTo]);

  useEffect(() => {
    fetchTopups();
  }, [fetchTopups]);

  const handleApprove = async (id: string) => {
    if (!confirm("Yakin ingin menyetujui permintaan Top Up ini?")) return;
    setProcessing(true);
    try {
      const res = await fetchWithAuth(`/v1/payment/admin/${id}/approve`, {
        method: "POST",
        body: JSON.stringify({ notes: approveNotes || undefined }),
      });
      if (res.ok) {
        alert("Top Up berhasil disetujui! Saldo user sudah ditambahkan.");
        setSelectedTopup(null);
        setApproveNotes("");
        fetchTopups();
      } else {
        const err = await res.json();
        alert("Gagal: " + (err.message || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectNotes.trim()) {
      alert("Catatan wajib diisi saat menolak pembayaran");
      return;
    }
    if (!confirm("Yakin ingin menolak permintaan Top Up ini?")) return;
    setProcessing(true);
    try {
      const res = await fetchWithAuth(`/v1/payment/admin/${id}/reject`, {
        method: "POST",
        body: JSON.stringify({ notes: rejectNotes }),
      });
      if (res.ok) {
        alert("Top Up ditolak.");
        setSelectedTopup(null);
        setRejectNotes("");
        fetchTopups();
      } else {
        const err = await res.json();
        alert("Gagal: " + (err.message || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const canAction = (status: TopUpStatus) => status === "PENDING" || status === "PAID";

  return (
    <div style={{ padding: "2rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.8rem", color: "var(--color-gold, #c9a84c)", margin: 0, fontFamily: "serif" }}>
          Payment Management
        </h1>
        <p style={{ color: "rgba(255,255,255,0.5)", marginTop: "0.5rem" }}>
          Review, setujui, atau tolak permintaan top-up dari pengguna.
        </p>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
        {["ALL", "PENDING", "PAID", "APPROVED", "REJECTED", "EXPIRED"].map((s) => (
          <button
            key={s}
            onClick={() => { setFilter(s); setPage(1); }}
            style={{
              padding: "6px 16px",
              background: filter === s ? "rgba(201, 168, 76, 0.2)" : "rgba(255, 255, 255, 0.04)",
              border: `1px solid ${filter === s ? "var(--color-gold, #c9a84c)" : "rgba(255, 255, 255, 0.1)"}`,
              borderRadius: "6px",
              color: filter === s ? "var(--color-gold, #c9a84c)" : "rgba(255, 255, 255, 0.6)",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: filter === s ? 700 : 400,
              transition: "all 0.2s",
            }}
          >
            {s === "ALL" ? "Semua" : s}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "4rem", color: "rgba(255,255,255,0.5)" }}>
          Loading...
        </div>
      ) : topups.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: "4rem",
          background: "rgba(0,0,0,0.3)",
          borderRadius: "12px",
          border: "1px dashed rgba(255,255,255,0.15)",
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" style={{ marginBottom: "16px" }}>
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6V12L16 14"/>
          </svg>
          <p style={{ color: "rgba(255,255,255,0.5)" }}>
            {filter === "ALL" ? "Belum ada Top Up request." : `Tidak ada request dengan status ${filter}.`}
          </p>
        </div>
      ) : (
        <>
          <div style={{ overflowX: "auto" }}>
            <table style={{
              width: "100%",
              borderCollapse: "collapse",
              background: "rgba(0,0,0,0.4)",
              borderRadius: "12px",
              overflow: "hidden",
            }}>
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.05)", textAlign: "left" }}>
                  <th style={thStyle}>User</th>
                  <th style={thStyle}>Jumlah</th>
                  <th style={thStyle}>Metode</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Waktu</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {topups.map((t) => {
                  const statusStyle = STATUS_COLORS[t.status] || STATUS_COLORS.PENDING;
                  return (
                    <tr key={t.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                      <td style={tdStyle}>
                        <div style={{ fontWeight: 700, fontSize: "14px" }}>{t.user?.username || "Unknown"}</div>
                        <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>{t.user?.email || ""}</div>
                      </td>
                      <td style={tdStyle}>
                        <div style={{ fontWeight: 700, color: "#10b981", fontSize: "15px" }}>
                          +{t.amount.toLocaleString()} CC
                        </div>
                        <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>
                          Rp {t.fiatAmount.toLocaleString("id-ID")}
                        </div>
                      </td>
                      <td style={tdStyle}>
                        <span style={{
                          padding: "3px 10px",
                          background: "rgba(255,255,255,0.08)",
                          borderRadius: "4px",
                          fontSize: "12px",
                          fontWeight: 600,
                        }}>
                          {t.method}
                        </span>
                        {t.bank && <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", marginTop: "2px" }}>{t.bank}</div>}
                        {t.walletType && <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", marginTop: "2px" }}>{t.walletType}</div>}
                      </td>
                      <td style={tdStyle}>
                        <span style={{
                          padding: "4px 12px",
                          background: statusStyle.bg,
                          color: statusStyle.text,
                          border: `1px solid ${statusStyle.border}`,
                          borderRadius: "16px",
                          fontSize: "12px",
                          fontWeight: 600,
                        }}>
                          {t.status}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <div style={{ fontSize: "13px" }}>{formatDate(t.createdAt)}</div>
                        {t.reviewedAt && (
                          <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>
                            Reviewed: {formatDate(t.reviewedAt)}
                          </div>
                        )}
                      </td>
                      <td style={{ ...tdStyle, textAlign: "right" }}>
                        {canAction(t.status) ? (
                          <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                            <button
                              onClick={() => { setSelectedTopup(t); }}
                              style={{
                                padding: "6px 14px",
                                background: "rgba(16, 185, 129, 0.15)",
                                border: "1px solid rgba(16, 185, 129, 0.3)",
                                color: "#10b981",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontSize: "12px",
                                fontWeight: 600,
                              }}
                            >
                              Review
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)" }}>
                            {t.admin?.username ? `oleh ${t.admin.username}` : "-"}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "20px" }}>
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1}
                style={pageBtnStyle(page <= 1)}
              >
                Sebelumnya
              </button>
              <span style={{ padding: "8px 16px", color: "rgba(255,255,255,0.5)", fontSize: "13px" }}>
                Halaman {page} dari {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
                style={pageBtnStyle(page >= totalPages)}
              >
                Selanjutnya
              </button>
            </div>
          )}
        </>
      )}

      {/* Review Modal */}
      {selectedTopup && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.7)",
          backdropFilter: "blur(8px)",
          display: "grid",
          placeItems: "center",
          zIndex: 1000,
        }}>
          <div style={{
            background: "rgba(10, 15, 12, 0.95)",
            border: "1px solid rgba(201, 168, 76, 0.25)",
            borderRadius: "16px",
            padding: "28px",
            width: "min(520px, 90vw)",
            maxHeight: "85vh",
            overflowY: "auto",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ color: "var(--color-gold, #c9a84c)", margin: 0, fontFamily: "serif", fontSize: "20px" }}>
                Review Top Up
              </h2>
              <button
                onClick={() => { setSelectedTopup(null); setRejectNotes(""); setApproveNotes(""); }}
                style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: "20px" }}
              >
                &times;
              </button>
            </div>

            {/* Detail info */}
            <div style={{ display: "grid", gap: "12px", marginBottom: "20px" }}>
              <DetailRow label="User" value={`${selectedTopup.user?.username || "Unknown"} (${selectedTopup.user?.email || ""})`} />
              <DetailRow label="Jumlah CC" value={`${selectedTopup.amount.toLocaleString()} CC`} highlight />
              <DetailRow label="Jumlah Rupiah" value={`Rp ${selectedTopup.fiatAmount.toLocaleString("id-ID")}`} />
              <DetailRow label="Metode" value={`${selectedTopup.method}${selectedTopup.bank ? ` - ${selectedTopup.bank}` : ""}${selectedTopup.walletType ? ` - ${selectedTopup.walletType}` : ""}`} />
              <DetailRow label="Status" value={selectedTopup.status} />
              <DetailRow label="Dibuat" value={formatDate(selectedTopup.createdAt)} />
              {selectedTopup.paidAt && <DetailRow label="Dibayar" value={formatDate(selectedTopup.paidAt)} />}
            </div>

            {/* Proof image */}
            {selectedTopup.proofImageUrl && (
              <div style={{ marginBottom: "20px" }}>
                <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", marginBottom: "6px" }}>Bukti Pembayaran:</div>
                <img
                  src={selectedTopup.proofImageUrl}
                  alt="Bukti Pembayaran"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "300px",
                    borderRadius: "8px",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                />
              </div>
            )}

            {/* Action area */}
            {canAction(selectedTopup.status) && (
              <div style={{ display: "grid", gap: "16px" }}>
                {/* Approve section */}
                <div style={{
                  padding: "16px",
                  background: "rgba(16, 185, 129, 0.08)",
                  border: "1px solid rgba(16, 185, 129, 0.2)",
                  borderRadius: "10px",
                }}>
                  <textarea
                    value={approveNotes}
                    onChange={(e) => setApproveNotes(e.target.value)}
                    placeholder="Catatan approve (opsional)..."
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      background: "rgba(0,0,0,0.3)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "6px",
                      color: "#fff",
                      resize: "vertical",
                      minHeight: "60px",
                      marginBottom: "10px",
                      fontSize: "13px",
                    }}
                  />
                  <button
                    onClick={() => handleApprove(selectedTopup.id)}
                    disabled={processing}
                    style={{
                      width: "100%",
                      padding: "12px",
                      background: processing ? "rgba(16, 185, 129, 0.3)" : "linear-gradient(135deg, #059669, #10b981)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      fontWeight: 700,
                      fontSize: "14px",
                      cursor: processing ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12L10 17L20 7"/>
                    </svg>
                    {processing ? "Memproses..." : `Approve (+${selectedTopup.amount} CC ke saldo user)`}
                  </button>
                </div>

                {/* Reject section */}
                <div style={{
                  padding: "16px",
                  background: "rgba(220, 38, 38, 0.08)",
                  border: "1px solid rgba(220, 38, 38, 0.2)",
                  borderRadius: "10px",
                }}>
                  <textarea
                    value={rejectNotes}
                    onChange={(e) => setRejectNotes(e.target.value)}
                    placeholder="Alasan penolakan (wajib)..."
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      background: "rgba(0,0,0,0.3)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "6px",
                      color: "#fff",
                      resize: "vertical",
                      minHeight: "60px",
                      marginBottom: "10px",
                      fontSize: "13px",
                    }}
                  />
                  <button
                    onClick={() => handleReject(selectedTopup.id)}
                    disabled={processing || !rejectNotes.trim()}
                    style={{
                      width: "100%",
                      padding: "12px",
                      background: processing || !rejectNotes.trim() ? "rgba(220, 38, 38, 0.2)" : "linear-gradient(135deg, #991b1b, #dc2626)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      fontWeight: 700,
                      fontSize: "14px",
                      cursor: processing || !rejectNotes.trim() ? "not-allowed" : "pointer",
                      opacity: !rejectNotes.trim() ? 0.5 : 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6L18 18"/>
                    </svg>
                    {processing ? "Memproses..." : "Tolak Pembayaran"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Helper Components ── */

function DetailRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)" }}>{label}</span>
      <span style={{
        fontSize: "14px",
        fontWeight: highlight ? 700 : 500,
        color: highlight ? "#10b981" : "rgba(255,255,255,0.85)",
      }}>
        {value}
      </span>
    </div>
  );
}

/* ── Shared Styles ── */

const thStyle: React.CSSProperties = {
  padding: "12px 16px",
  borderBottom: "1px solid rgba(255,255,255,0.08)",
  color: "var(--color-gold, #c9a84c)",
  fontSize: "12px",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};

const tdStyle: React.CSSProperties = {
  padding: "14px 16px",
  color: "rgba(255,255,255,0.8)",
};

const pageBtnStyle = (disabled: boolean): React.CSSProperties => ({
  padding: "8px 16px",
  background: disabled ? "rgba(255,255,255,0.03)" : "rgba(201, 168, 76, 0.15)",
  border: `1px solid ${disabled ? "rgba(255,255,255,0.05)" : "rgba(201, 168, 76, 0.3)"}`,
  borderRadius: "6px",
  color: disabled ? "rgba(255,255,255,0.2)" : "var(--color-gold, #c9a84c)",
  cursor: disabled ? "not-allowed" : "pointer",
  fontSize: "13px",
});
