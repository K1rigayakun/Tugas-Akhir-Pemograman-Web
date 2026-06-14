"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
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

export default function AdminPaymentListPage() {
  const router = useRouter();
  const [payments, setPayments] = useState<TopUpRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", "20");
      
      if (statusFilter !== "ALL") {
        params.append("status", statusFilter);
      }
      
      if (dateFrom) {
        params.append("dateFrom", dateFrom);
      }
      
      if (dateTo) {
        params.append("dateTo", dateTo);
      }

      const res = await fetchWithAuth(`/v1/payment/admin/list?${params.toString()}`);
      
      if (!res.ok) {
        throw new Error("Failed to fetch payments");
      }
      
      const data = await res.json();
      setPayments(data.data || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch (err) {
      console.error("Error fetching payments:", err);
      setPayments([]);
      setTotalPages(1);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, dateFrom, dateTo, page]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    setPage(1);
  };

  const handleDateFilterApply = () => {
    setPage(1);
    fetchPayments();
  };

  const handleDateFilterReset = () => {
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  const handleRowClick = (paymentId: string) => {
    router.push(`/payments/${paymentId}/review`);
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

  return (
    <div style={{ padding: "2rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.8rem", color: "var(--color-gold, #c9a84c)", margin: 0, fontFamily: "serif" }}>
          Payment Management
        </h1>
        <p style={{ color: "rgba(255,255,255,0.5)", marginTop: "0.5rem" }}>
          View and manage all payment requests from users.
        </p>
      </div>

      {/* Filters */}
      <div style={{ marginBottom: "1.5rem" }}>
        {/* Status Filters */}
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", fontSize: "0.85rem", color: "rgba(255,255,255,0.5)", marginBottom: "0.5rem" }}>
            Filter by Status:
          </label>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {["ALL", "PENDING", "PAID", "APPROVED", "REJECTED", "EXPIRED"].map((status) => (
              <button
                key={status}
                onClick={() => handleStatusFilterChange(status)}
                style={{
                  padding: "6px 16px",
                  background: statusFilter === status ? "rgba(201, 168, 76, 0.2)" : "rgba(255, 255, 255, 0.04)",
                  border: `1px solid ${statusFilter === status ? "var(--color-gold, #c9a84c)" : "rgba(255, 255, 255, 0.1)"}`,
                  borderRadius: "6px",
                  color: statusFilter === status ? "var(--color-gold, #c9a84c)" : "rgba(255, 255, 255, 0.6)",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: statusFilter === status ? 700 : 400,
                  transition: "all 0.2s",
                }}
              >
                {status === "ALL" ? "All" : status}
              </button>
            ))}
          </div>
        </div>

        {/* Date Range Filters */}
        <div style={{
          display: "flex",
          gap: "1rem",
          alignItems: "flex-end",
          flexWrap: "wrap",
          padding: "1rem",
          background: "rgba(0,0,0,0.3)",
          borderRadius: "8px",
          border: "1px solid rgba(255,255,255,0.08)",
        }}>
          <div style={{ flex: "1 1 200px" }}>
            <label style={{ display: "block", fontSize: "0.85rem", color: "rgba(255,255,255,0.5)", marginBottom: "0.5rem" }}>
              From Date:
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                background: "rgba(0,0,0,0.4)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "6px",
                color: "#fff",
                fontSize: "13px",
              }}
            />
          </div>
          <div style={{ flex: "1 1 200px" }}>
            <label style={{ display: "block", fontSize: "0.85rem", color: "rgba(255,255,255,0.5)", marginBottom: "0.5rem" }}>
              To Date:
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                background: "rgba(0,0,0,0.4)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "6px",
                color: "#fff",
                fontSize: "13px",
              }}
            />
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={handleDateFilterApply}
              style={{
                padding: "8px 16px",
                background: "rgba(201, 168, 76, 0.2)",
                border: "1px solid var(--color-gold, #c9a84c)",
                borderRadius: "6px",
                color: "var(--color-gold, #c9a84c)",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: 600,
              }}
            >
              Apply
            </button>
            <button
              onClick={handleDateFilterReset}
              style={{
                padding: "8px 16px",
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "6px",
                color: "rgba(255, 255, 255, 0.6)",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: 400,
              }}
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      {!loading && (
        <div style={{ marginBottom: "1rem", color: "rgba(255,255,255,0.5)", fontSize: "0.9rem" }}>
          Showing {payments.length} of {total} payment{total !== 1 ? "s" : ""}
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "4rem", color: "rgba(255,255,255,0.5)" }}>
          Loading payments...
        </div>
      ) : payments.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "4rem",
            background: "rgba(0,0,0,0.3)",
            borderRadius: "12px",
            border: "1px dashed rgba(255,255,255,0.15)",
          }}
        >
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="1.5"
            style={{ marginBottom: "16px", margin: "0 auto 16px" }}
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6V12L16 14" />
          </svg>
          <p style={{ color: "rgba(255,255,255,0.5)" }}>
            {statusFilter === "ALL" ? "No payment requests found." : `No payments with status ${statusFilter}.`}
          </p>
        </div>
      ) : (
        <>
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                background: "rgba(0,0,0,0.4)",
                borderRadius: "12px",
                overflow: "hidden",
              }}
            >
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.05)", textAlign: "left" }}>
                  <th style={thStyle}>User</th>
                  <th style={thStyle}>Amount</th>
                  <th style={thStyle}>Method</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Timestamp</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => {
                  const statusStyle = STATUS_COLORS[payment.status] || STATUS_COLORS.PENDING;
                  return (
                    <tr
                      key={payment.id}
                      onClick={() => handleRowClick(payment.id)}
                      style={{
                        borderBottom: "1px solid rgba(255,255,255,0.06)",
                        cursor: "pointer",
                        transition: "background 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                      }}
                    >
                      <td style={tdStyle}>
                        <div style={{ fontWeight: 700, fontSize: "14px" }}>
                          {payment.user?.username || "Unknown"}
                        </div>
                        <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>
                          {payment.user?.email || ""}
                        </div>
                      </td>
                      <td style={tdStyle}>
                        <div style={{ fontWeight: 700, color: "#10b981", fontSize: "15px" }}>
                          +{payment.amount.toLocaleString()} CC
                        </div>
                        <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>
                          Rp {payment.fiatAmount.toLocaleString("id-ID")}
                        </div>
                      </td>
                      <td style={tdStyle}>
                        <span
                          style={{
                            padding: "3px 10px",
                            background: "rgba(255,255,255,0.08)",
                            borderRadius: "4px",
                            fontSize: "12px",
                            fontWeight: 600,
                          }}
                        >
                          {payment.method}
                        </span>
                        {payment.bank && (
                          <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", marginTop: "2px" }}>
                            {payment.bank}
                          </div>
                        )}
                        {payment.walletType && (
                          <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", marginTop: "2px" }}>
                            {payment.walletType}
                          </div>
                        )}
                      </td>
                      <td style={tdStyle}>
                        <span
                          style={{
                            padding: "4px 12px",
                            background: statusStyle.bg,
                            color: statusStyle.text,
                            border: `1px solid ${statusStyle.border}`,
                            borderRadius: "16px",
                            fontSize: "12px",
                            fontWeight: 600,
                          }}
                        >
                          {payment.status}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <div style={{ fontSize: "13px" }}>{formatDate(payment.createdAt)}</div>
                        {payment.reviewedAt && (
                          <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>
                            Reviewed: {formatDate(payment.reviewedAt)}
                          </div>
                        )}
                      </td>
                      <td style={{ ...tdStyle, textAlign: "right" }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRowClick(payment.id);
                          }}
                          style={{
                            padding: "6px 14px",
                            background: "rgba(201, 168, 76, 0.15)",
                            border: "1px solid rgba(201, 168, 76, 0.3)",
                            color: "var(--color-gold, #c9a84c)",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "12px",
                            fontWeight: 600,
                          }}
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "20px", alignItems: "center" }}>
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1}
                style={pageBtnStyle(page <= 1)}
              >
                Previous
              </button>
              <span style={{ padding: "8px 16px", color: "rgba(255,255,255,0.5)", fontSize: "13px" }}>
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
                style={pageBtnStyle(page >= totalPages)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
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
