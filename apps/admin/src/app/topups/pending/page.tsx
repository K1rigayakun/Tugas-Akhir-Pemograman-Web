"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "../../../lib/api";

/**
 * Admin Pending Top-Ups Page
 * 
 * Displays all pending TopUpRequest records for admin review.
 * Admins can approve or reject requests, which updates user wallet balances.
 * 
 * Task: 4.5 - Create Admin Pending Top-Ups Page
 * Requirements: 4.6
 */

interface User {
  id: string;
  email: string;
  username?: string;
}

interface TopUpRequest {
  id: string;
  userId: string;
  amount: number;
  fiatAmount: number;
  method: string;
  provider?: string | null;
  bank?: string | null;
  walletType?: string | null;
  status: string;
  createdAt: string;
  expiresAt?: string | null;
  user?: User;
}

export default function PendingTopUpsPage() {
  const [requests, setRequests] = useState<TopUpRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  /**
   * Fetch pending top-up requests from the API
   * Uses the /payment/admin/list endpoint with status=PENDING filter
   */
  async function fetchPendingRequests() {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetchWithAuth("/v1/payment/admin/list?status=PENDING");
      
      if (!response.ok) {
        throw new Error(`Failed to fetch pending requests: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Handle both paginated response and direct array response
      const requestsData = data.data || data;
      
      if (Array.isArray(requestsData)) {
        setRequests(requestsData);
      } else {
        console.error("Unexpected API response format:", data);
        setRequests([]);
      }
    } catch (err) {
      console.error("Error fetching pending requests:", err);
      setError(err instanceof Error ? err.message : "Failed to load pending requests");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Approve a top-up request
   * This will update the request status to APPROVED, create a wallet transaction,
   * and increment the user's wallet balance
   */
  async function handleApprove(requestId: string) {
    if (!confirm("Are you sure you want to approve this top-up request?")) {
      return;
    }

    setProcessingId(requestId);
    
    try {
      const response = await fetchWithAuth(`/v1/payment/admin/${requestId}/approve`, {
        method: "POST",
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Approval failed: ${response.status}`);
      }

      // Show success message
      alert("Top-up request approved successfully! User's wallet balance has been updated.");
      
      // Refresh the list
      await fetchPendingRequests();
    } catch (err) {
      console.error("Error approving request:", err);
      alert(err instanceof Error ? err.message : "Failed to approve request");
    } finally {
      setProcessingId(null);
    }
  }

  /**
   * Reject a top-up request
   * This will update the request status to REJECTED with the admin's user ID
   */
  async function handleReject(requestId: string) {
    const reason = prompt("Please enter the reason for rejection:");
    
    if (!reason || !reason.trim()) {
      alert("Rejection reason is required");
      return;
    }

    if (!confirm("Are you sure you want to reject this top-up request?")) {
      return;
    }

    setProcessingId(requestId);
    
    try {
      const response = await fetchWithAuth(`/v1/payment/admin/${requestId}/reject`, {
        method: "POST",
        body: JSON.stringify({ notes: reason }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Rejection failed: ${response.status}`);
      }

      // Show success message
      alert("Top-up request rejected successfully.");
      
      // Refresh the list
      await fetchPendingRequests();
    } catch (err) {
      console.error("Error rejecting request:", err);
      alert(err instanceof Error ? err.message : "Failed to reject request");
    } finally {
      setProcessingId(null);
    }
  }

  /**
   * Format date to readable string
   */
  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }

  /**
   * Format currency amount with thousand separators
   */
  function formatAmount(amount: number): string {
    return amount.toLocaleString("en-US");
  }

  // Fetch data on component mount
  useEffect(() => {
    fetchPendingRequests();
  }, []);

  return (
    <div style={{ padding: "2rem", maxWidth: "1400px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1
          style={{
            fontSize: "2rem",
            color: "var(--color-gold, #c9a84c)",
            margin: "0 0 0.5rem 0",
            fontFamily: "serif",
          }}
        >
          Pending Top-Up Requests
        </h1>
        <p style={{ color: "rgba(255, 255, 255, 0.6)", margin: 0 }}>
          Review and approve or reject pending top-up requests from users
        </p>
      </div>

      {/* Refresh Button */}
      <div style={{ marginBottom: "1.5rem" }}>
        <button
          onClick={fetchPendingRequests}
          disabled={loading}
          style={{
            padding: "0.625rem 1.25rem",
            background: loading
              ? "rgba(201, 168, 76, 0.3)"
              : "rgba(201, 168, 76, 0.15)",
            border: "1px solid rgba(201, 168, 76, 0.4)",
            borderRadius: "6px",
            color: "var(--color-gold, #c9a84c)",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "0.875rem",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{
              animation: loading ? "spin 1s linear infinite" : "none",
            }}
          >
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
          </svg>
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div
          style={{
            padding: "1rem",
            background: "rgba(220, 38, 38, 0.1)",
            border: "1px solid rgba(220, 38, 38, 0.3)",
            borderRadius: "8px",
            color: "#dc2626",
            marginBottom: "1.5rem",
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Loading State */}
      {loading && requests.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "4rem",
            color: "rgba(255, 255, 255, 0.5)",
          }}
        >
          <div
            style={{
              display: "inline-block",
              width: "40px",
              height: "40px",
              border: "4px solid rgba(201, 168, 76, 0.2)",
              borderTopColor: "var(--color-gold, #c9a84c)",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
          <p style={{ marginTop: "1rem" }}>Loading pending requests...</p>
        </div>
      ) : requests.length === 0 ? (
        /* Empty State */
        <div
          style={{
            textAlign: "center",
            padding: "4rem",
            background: "rgba(0, 0, 0, 0.3)",
            borderRadius: "12px",
            border: "1px dashed rgba(255, 255, 255, 0.15)",
          }}
        >
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgba(255, 255, 255, 0.3)"
            strokeWidth="1.5"
            style={{ marginBottom: "1rem" }}
          >
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
          </svg>
          <h3
            style={{
              color: "rgba(255, 255, 255, 0.7)",
              margin: "0 0 0.5rem 0",
            }}
          >
            No Pending Requests
          </h3>
          <p style={{ color: "rgba(255, 255, 255, 0.5)", margin: 0 }}>
            All top-up requests have been processed
          </p>
        </div>
      ) : (
        /* Table */
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              background: "rgba(0, 0, 0, 0.4)",
              borderRadius: "12px",
              overflow: "hidden",
            }}
          >
            <thead>
              <tr
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  textAlign: "left",
                }}
              >
                <th style={tableHeaderStyle}>User</th>
                <th style={tableHeaderStyle}>Amount (CC)</th>
                <th style={tableHeaderStyle}>Fiat Amount (IDR)</th>
                <th style={tableHeaderStyle}>Method</th>
                <th style={tableHeaderStyle}>Created At</th>
                <th style={{ ...tableHeaderStyle, textAlign: "center" }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr
                  key={request.id}
                  style={{
                    borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
                  }}
                >
                  {/* User Info */}
                  <td style={tableCellStyle}>
                    <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>
                      {request.user?.username || "Unknown"}
                    </div>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "rgba(255, 255, 255, 0.5)",
                        marginTop: "0.25rem",
                      }}
                    >
                      {request.user?.email || "No email"}
                    </div>
                  </td>

                  {/* Amount (CC) */}
                  <td style={tableCellStyle}>
                    <span
                      style={{
                        color: "#10b981",
                        fontWeight: 700,
                        fontSize: "1rem",
                      }}
                    >
                      {formatAmount(request.amount)} CC
                    </span>
                  </td>

                  {/* Fiat Amount (IDR) */}
                  <td style={tableCellStyle}>
                    <span style={{ fontWeight: 600 }}>
                      Rp {formatAmount(request.fiatAmount)}
                    </span>
                  </td>

                  {/* Method */}
                  <td style={tableCellStyle}>
                    <div>
                      <span
                        style={{
                          padding: "0.25rem 0.625rem",
                          background: "rgba(255, 255, 255, 0.08)",
                          borderRadius: "4px",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                        }}
                      >
                        {request.method}
                      </span>
                    </div>
                    {(request.bank || request.walletType || request.provider) && (
                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: "rgba(255, 255, 255, 0.5)",
                          marginTop: "0.375rem",
                        }}
                      >
                        {request.bank || request.walletType || request.provider}
                      </div>
                    )}
                  </td>

                  {/* Created At */}
                  <td style={tableCellStyle}>
                    <span style={{ fontSize: "0.875rem" }}>
                      {formatDate(request.createdAt)}
                    </span>
                  </td>

                  {/* Actions */}
                  <td style={{ ...tableCellStyle, textAlign: "center" }}>
                    <div
                      style={{
                        display: "flex",
                        gap: "0.5rem",
                        justifyContent: "center",
                      }}
                    >
                      {/* Approve Button */}
                      <button
                        onClick={() => handleApprove(request.id)}
                        disabled={processingId === request.id}
                        style={{
                          padding: "0.5rem 1rem",
                          background:
                            processingId === request.id
                              ? "rgba(16, 185, 129, 0.3)"
                              : "rgba(16, 185, 129, 0.15)",
                          border: "1px solid rgba(16, 185, 129, 0.4)",
                          borderRadius: "6px",
                          color: "#10b981",
                          cursor:
                            processingId === request.id
                              ? "not-allowed"
                              : "pointer",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          if (processingId !== request.id) {
                            e.currentTarget.style.background =
                              "rgba(16, 185, 129, 0.25)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (processingId !== request.id) {
                            e.currentTarget.style.background =
                              "rgba(16, 185, 129, 0.15)";
                          }
                        }}
                      >
                        ✓ Approve
                      </button>

                      {/* Reject Button */}
                      <button
                        onClick={() => handleReject(request.id)}
                        disabled={processingId === request.id}
                        style={{
                          padding: "0.5rem 1rem",
                          background:
                            processingId === request.id
                              ? "rgba(220, 38, 38, 0.3)"
                              : "rgba(220, 38, 38, 0.15)",
                          border: "1px solid rgba(220, 38, 38, 0.4)",
                          borderRadius: "6px",
                          color: "#dc2626",
                          cursor:
                            processingId === request.id
                              ? "not-allowed"
                              : "pointer",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          if (processingId !== request.id) {
                            e.currentTarget.style.background =
                              "rgba(220, 38, 38, 0.25)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (processingId !== request.id) {
                            e.currentTarget.style.background =
                              "rgba(220, 38, 38, 0.15)";
                          }
                        }}
                      >
                        ✗ Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Info Box */}
      <div
        style={{
          marginTop: "2rem",
          padding: "1rem",
          background: "rgba(59, 130, 246, 0.1)",
          border: "1px solid rgba(59, 130, 246, 0.3)",
          borderRadius: "8px",
          fontSize: "0.875rem",
          color: "rgba(255, 255, 255, 0.7)",
        }}
      >
        <strong style={{ color: "#3b82f6" }}>ℹ️ Note:</strong> When you approve
        a top-up request, the specified Crown Coins amount will be immediately
        added to the user's wallet balance. Make sure to verify the payment
        proof before approving.
      </div>

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  Shared Styles
// ═══════════════════════════════════════════════════════════

const tableHeaderStyle: React.CSSProperties = {
  padding: "1rem",
  borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
  color: "var(--color-gold, #c9a84c)",
  fontSize: "0.75rem",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const tableCellStyle: React.CSSProperties = {
  padding: "1rem",
  color: "rgba(255, 255, 255, 0.85)",
  fontSize: "0.875rem",
};
