"use client";

import React, { useEffect, useState } from "react";
import { getPaymentHistoryAction } from "@/app/actions/payment";

type PaymentStatus = "PENDING" | "PAID" | "APPROVED" | "REJECTED" | "EXPIRED";

interface TopUpRequest {
  id: string;
  userId: string;
  amount: number;
  fiatAmount: number;
  method: string;
  provider?: string | null;
  bank?: string | null;
  walletType?: string | null;
  status: PaymentStatus;
  proofImageUrl?: string | null;
  paymentDetails?: any;
  expiresAt?: string | null;
  paidAt?: string | null;
  adminNotes?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface PaymentHistoryData {
  data: TopUpRequest[];
  total: number;
  page: number;
  totalPages: number;
}

const METHOD_LABELS: Record<string, string> = {
  QRIS: "QRIS",
  VIRTUAL_ACCOUNT: "Virtual Account",
  EWALLET: "E-Wallet",
  STRIPE: "Stripe",
  TESTING: "Testing/Demo",
};

const STATUS_CONFIG: Record<PaymentStatus, {
  label: string;
  color: string;
  bgColor: string;
}> = {
  PENDING: {
    label: "Menunggu",
    color: "#C9A84C",
    bgColor: "rgba(201, 168, 76, 0.1)",
  },
  PAID: {
    label: "Dibayar",
    color: "#22c55e",
    bgColor: "rgba(34, 197, 94, 0.1)",
  },
  APPROVED: {
    label: "Disetujui",
    color: "#10b981",
    bgColor: "rgba(16, 185, 129, 0.12)",
  },
  REJECTED: {
    label: "Ditolak",
    color: "#dc2626",
    bgColor: "rgba(220, 38, 38, 0.1)",
  },
  EXPIRED: {
    label: "Kadaluarsa",
    color: "rgba(245, 240, 232, 0.4)",
    bgColor: "rgba(245, 240, 232, 0.05)",
  },
};

/**
 * PaymentHistory Component
 * Task 17.1: Create PaymentHistory component
 * Validates Requirements 12.1, 12.2, 12.3, 12.4, 12.5
 * 
 * Features:
 * - Fetch user's payments from GET /payment/user/history
 * - Display paginated list (20 per page)
 * - Show amount, method, status, timestamp for each transaction
 * - Display admin notes for rejected payments
 * - Implement pagination controls
 * - Sort by createdAt descending
 */
export default function PaymentHistory() {
  const [historyData, setHistoryData] = useState<PaymentHistoryData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch payment history
  const fetchHistory = async (page: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await getPaymentHistoryAction(page, 20);
      
      if (result.success && result.data) {
        setHistoryData(result.data);
        setCurrentPage(page);
      } else {
        setError(result.message || "Gagal memuat riwayat pembayaran");
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat memuat data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(1);
  }, []);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && historyData && newPage <= historyData.totalPages) {
      fetchHistory(newPage);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading && !historyData) {
    return (
      <div style={{
        padding: "40px",
        textAlign: "center",
        color: "rgba(245, 240, 232, 0.6)",
      }}>
        <div className="loading-spinner" style={{
          width: "40px",
          height: "40px",
          border: "3px solid rgba(245, 240, 232, 0.1)",
          borderTop: "3px solid var(--color-gold)",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          margin: "0 auto",
        }} />
        <p style={{ marginTop: "16px" }}>Memuat riwayat pembayaran...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: "20px",
        background: "rgba(220, 38, 38, 0.1)",
        border: "1px solid rgba(220, 38, 38, 0.3)",
        borderRadius: "8px",
        color: "#dc2626",
        textAlign: "center",
      }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ margin: "0 auto 8px" }}>
          <path d="M12 8V12M12 16H12.01M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <p>{error}</p>
        <button
          onClick={() => fetchHistory(currentPage)}
          style={{
            marginTop: "12px",
            padding: "8px 16px",
            background: "#dc2626",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  if (!historyData || historyData.data.length === 0) {
    return (
      <div style={{
        padding: "40px",
        textAlign: "center",
        color: "rgba(245, 240, 232, 0.4)",
        border: "1px solid rgba(245, 240, 232, 0.1)",
        borderRadius: "12px",
      }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ margin: "0 auto 12px", opacity: 0.5 }}>
          <path d="M9 11L12 14L22 4M21 12V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H16" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <p style={{ fontSize: "16px", fontWeight: 600, marginBottom: "4px" }}>Belum Ada Riwayat</p>
        <p style={{ fontSize: "14px" }}>Anda belum melakukan top-up apapun</p>
      </div>
    );
  }

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      gap: "20px",
    }}>
      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <h2 style={{
          fontSize: "24px",
          fontWeight: 700,
          color: "var(--color-gold)",
          fontFamily: "var(--font-heading)",
          margin: 0,
        }}>
          Riwayat Pembayaran
        </h2>
        <div style={{
          fontSize: "14px",
          color: "rgba(245, 240, 232, 0.5)",
        }}>
          Total: {historyData.total} transaksi
        </div>
      </div>

      {/* Transaction List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {historyData.data.map((transaction) => {
          const statusConfig = STATUS_CONFIG[transaction.status];
          
          return (
            <div
              key={transaction.id}
              style={{
                padding: "16px",
                background: "rgba(14, 14, 18, 0.6)",
                border: "1px solid rgba(245, 240, 232, 0.1)",
                borderRadius: "10px",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(201, 168, 76, 0.3)";
                e.currentTarget.style.background = "rgba(14, 14, 18, 0.8)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(245, 240, 232, 0.1)";
                e.currentTarget.style.background = "rgba(14, 14, 18, 0.6)";
              }}
            >
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr auto",
                gap: "12px",
                alignItems: "start",
              }}>
                {/* Left: Transaction details */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {/* Amount */}
                  <div>
                    <div style={{
                      fontSize: "20px",
                      fontWeight: 700,
                      color: "var(--color-gold-light)",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                      </svg>
                      {transaction.amount} CC
                    </div>
                    <div style={{
                      fontSize: "13px",
                      color: "rgba(245, 240, 232, 0.5)",
                      marginTop: "2px",
                    }}>
                      {formatCurrency(transaction.fiatAmount)}
                    </div>
                  </div>

                  {/* Method and Date */}
                  <div style={{
                    display: "flex",
                    gap: "12px",
                    fontSize: "13px",
                    color: "rgba(245, 240, 232, 0.6)",
                    flexWrap: "wrap",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {METHOD_LABELS[transaction.method] || transaction.method}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 6V12L16 14M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {formatDate(transaction.createdAt)}
                    </div>
                  </div>

                  {/* Admin Notes for REJECTED */}
                  {transaction.status === "REJECTED" && transaction.adminNotes && (
                    <div style={{
                      marginTop: "4px",
                      padding: "8px 12px",
                      background: "rgba(139, 26, 26, 0.15)",
                      border: "1px solid rgba(139, 26, 26, 0.2)",
                      borderRadius: "6px",
                      fontSize: "12px",
                      color: "rgba(245, 240, 232, 0.7)",
                    }}>
                      <strong style={{ color: "#dc2626" }}>Catatan Admin:</strong> {transaction.adminNotes}
                    </div>
                  )}
                </div>

                {/* Right: Status badge */}
                <div style={{
                  padding: "6px 12px",
                  background: statusConfig.bgColor,
                  border: `1px solid ${statusConfig.color}33`,
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: statusConfig.color,
                  whiteSpace: "nowrap",
                  textAlign: "center",
                }}>
                  {statusConfig.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Controls */}
      {historyData.totalPages > 1 && (
        <div style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "8px",
          marginTop: "8px",
        }}>
          {/* Previous Button */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || loading}
            style={{
              padding: "8px 12px",
              background: currentPage === 1 ? "rgba(245, 240, 232, 0.05)" : "rgba(201, 168, 76, 0.1)",
              border: "1px solid rgba(245, 240, 232, 0.1)",
              borderRadius: "6px",
              color: currentPage === 1 ? "rgba(245, 240, 232, 0.3)" : "var(--color-gold-light)",
              cursor: currentPage === 1 ? "not-allowed" : "pointer",
              fontWeight: 600,
              fontSize: "14px",
              transition: "all 0.2s ease",
              opacity: loading ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (currentPage !== 1 && !loading) {
                e.currentTarget.style.background = "rgba(201, 168, 76, 0.2)";
              }
            }}
            onMouseLeave={(e) => {
              if (currentPage !== 1) {
                e.currentTarget.style.background = "rgba(201, 168, 76, 0.1)";
              }
            }}
          >
            ← Sebelumnya
          </button>

          {/* Page Info */}
          <div style={{
            padding: "8px 16px",
            fontSize: "14px",
            color: "rgba(245, 240, 232, 0.7)",
            fontWeight: 600,
          }}>
            Halaman {currentPage} dari {historyData.totalPages}
          </div>

          {/* Next Button */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === historyData.totalPages || loading}
            style={{
              padding: "8px 12px",
              background: currentPage === historyData.totalPages ? "rgba(245, 240, 232, 0.05)" : "rgba(201, 168, 76, 0.1)",
              border: "1px solid rgba(245, 240, 232, 0.1)",
              borderRadius: "6px",
              color: currentPage === historyData.totalPages ? "rgba(245, 240, 232, 0.3)" : "var(--color-gold-light)",
              cursor: currentPage === historyData.totalPages ? "not-allowed" : "pointer",
              fontWeight: 600,
              fontSize: "14px",
              transition: "all 0.2s ease",
              opacity: loading ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (currentPage !== historyData.totalPages && !loading) {
                e.currentTarget.style.background = "rgba(201, 168, 76, 0.2)";
              }
            }}
            onMouseLeave={(e) => {
              if (currentPage !== historyData.totalPages) {
                e.currentTarget.style.background = "rgba(201, 168, 76, 0.1)";
              }
            }}
          >
            Selanjutnya →
          </button>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
