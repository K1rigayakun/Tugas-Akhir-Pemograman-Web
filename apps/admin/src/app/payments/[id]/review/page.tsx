"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { fetchWithAuth } from "../../../../lib/api";

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

export default function PaymentReviewPage() {
  const router = useRouter();
  const params = useParams();
  const paymentId = params?.id as string;

  const [payment, setPayment] = useState<TopUpRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [approveNotes, setApproveNotes] = useState("");
  const [rejectNotes, setRejectNotes] = useState("");

  useEffect(() => {
    if (!paymentId) return;

    const fetchPayment = async () => {
      setLoading(true);
      try {
        // Try to fetch from the list and find the specific payment
        const res = await fetchWithAuth(`/v1/payment/admin/list?limit=100`);
        if (!res.ok) {
          throw new Error("Failed to fetch payment");
        }
        const data = await res.json();
        const foundPayment = data.data?.find((p: TopUpRequest) => p.id === paymentId);
        if (foundPayment) {
          setPayment(foundPayment);
        } else {
          throw new Error("Payment not found");
        }
      } catch (err) {
        console.error("Error fetching payment:", err);
        alert("Failed to load payment details");
        router.push("/payments");
      } finally {
        setLoading(false);
      }
    };

    fetchPayment();
  }, [paymentId, router]);

  const handleApprove = async () => {
    if (!payment) return;
    if (!confirm("Are you sure you want to approve this top-up request?")) return;

    setProcessing(true);
    try {
      const res = await fetchWithAuth(`/v1/payment/admin/${payment.id}/approve`, {
        method: "POST",
        body: JSON.stringify({ notes: approveNotes || undefined }),
      });

      if (res.ok) {
        alert("Top-up approved successfully! User balance has been updated.");
        router.push("/payments");
      } else {
        const err = await res.json();
        alert("Failed: " + (err.message || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("Network error occurred.");
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!payment) return;
    if (!rejectNotes.trim()) {
      alert("Notes are required when rejecting a payment");
      return;
    }
    if (!confirm("Are you sure you want to reject this top-up request?")) return;

    setProcessing(true);
    try {
      const res = await fetchWithAuth(`/v1/payment/admin/${payment.id}/reject`, {
        method: "POST",
        body: JSON.stringify({ notes: rejectNotes }),
      });

      if (res.ok) {
        alert("Top-up rejected.");
        router.push("/payments");
      } else {
        const err = await res.json();
        alert("Failed: " + (err.message || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("Network error occurred.");
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

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <div style={{ color: "rgba(255,255,255,0.5)" }}>Loading payment details...</div>
      </div>
    );
  }

  if (!payment) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <div style={{ color: "rgba(255,255,255,0.5)" }}>Payment not found</div>
      </div>
    );
  }

  const statusStyle = STATUS_COLORS[payment.status] || STATUS_COLORS.PENDING;

  return (
    <div style={{ padding: "2rem", maxWidth: "900px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <button
          onClick={() => router.push("/payments")}
          style={{
            padding: "8px 16px",
            background: "rgba(255, 255, 255, 0.04)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "6px",
            color: "rgba(255, 255, 255, 0.6)",
            cursor: "pointer",
            fontSize: "13px",
            marginBottom: "1rem",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Payments
        </button>
        <h1 style={{ fontSize: "1.8rem", color: "var(--color-gold, #c9a84c)", margin: 0, fontFamily: "serif" }}>
          Review Payment
        </h1>
        <p style={{ color: "rgba(255,255,255,0.5)", marginTop: "0.5rem" }}>
          Review and approve or reject this payment request.
        </p>
      </div>

      {/* Payment Details Card */}
      <div
        style={{
          background: "rgba(0,0,0,0.4)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "12px",
          padding: "2rem",
          marginBottom: "2rem",
        }}
      >
        <div style={{ display: "grid", gap: "1rem" }}>
          <DetailRow label="Payment ID" value={payment.id} />
          <DetailRow
            label="User"
            value={`${payment.user?.username || "Unknown"} (${payment.user?.email || ""})`}
          />
          <DetailRow label="Amount (CC)" value={`${payment.amount.toLocaleString()} CC`} highlight />
          <DetailRow label="Amount (Fiat)" value={`Rp ${payment.fiatAmount.toLocaleString("id-ID")}`} />
          <DetailRow
            label="Method"
            value={`${payment.method}${payment.bank ? ` - ${payment.bank}` : ""}${
              payment.walletType ? ` - ${payment.walletType}` : ""
            }`}
          />
          <DetailRow label="Provider" value={payment.provider || "-"} />
          <DetailRow
            label="Status"
            value={
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
            }
          />
          <DetailRow label="Created" value={formatDate(payment.createdAt)} />
          {payment.paidAt && <DetailRow label="Paid" value={formatDate(payment.paidAt)} />}
          {payment.expiresAt && <DetailRow label="Expires" value={formatDate(payment.expiresAt)} />}
          {payment.reviewedAt && (
            <>
              <DetailRow label="Reviewed" value={formatDate(payment.reviewedAt)} />
              <DetailRow label="Reviewed By" value={payment.admin?.username || "Unknown"} />
            </>
          )}
          {payment.adminNotes && <DetailRow label="Admin Notes" value={payment.adminNotes} />}
        </div>

        {/* Proof Image */}
        {payment.proofImageUrl && (
          <div style={{ marginTop: "2rem" }}>
            <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", marginBottom: "0.75rem" }}>
              Payment Proof:
            </div>
            <img
              src={payment.proofImageUrl}
              alt="Payment Proof"
              style={{
                maxWidth: "100%",
                maxHeight: "400px",
                borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            />
          </div>
        )}
      </div>

      {/* Action Section */}
      {canAction(payment.status) && (
        <div style={{ display: "grid", gap: "1.5rem" }}>
          {/* Approve Section */}
          <div
            style={{
              padding: "1.5rem",
              background: "rgba(16, 185, 129, 0.08)",
              border: "1px solid rgba(16, 185, 129, 0.2)",
              borderRadius: "10px",
            }}
          >
            <h3 style={{ color: "#10b981", margin: "0 0 1rem 0", fontSize: "1.1rem" }}>Approve Payment</h3>
            <textarea
              value={approveNotes}
              onChange={(e) => setApproveNotes(e.target.value)}
              placeholder="Optional approval notes..."
              style={{
                width: "100%",
                padding: "10px 14px",
                background: "rgba(0,0,0,0.3)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "6px",
                color: "#fff",
                resize: "vertical",
                minHeight: "80px",
                marginBottom: "1rem",
                fontSize: "13px",
              }}
            />
            <button
              onClick={handleApprove}
              disabled={processing}
              style={{
                width: "100%",
                padding: "12px",
                background: processing
                  ? "rgba(16, 185, 129, 0.3)"
                  : "linear-gradient(135deg, #059669, #10b981)",
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
                <path d="M5 12L10 17L20 7" />
              </svg>
              {processing ? "Processing..." : `Approve (+${payment.amount} CC to user balance)`}
            </button>
          </div>

          {/* Reject Section */}
          <div
            style={{
              padding: "1.5rem",
              background: "rgba(220, 38, 38, 0.08)",
              border: "1px solid rgba(220, 38, 38, 0.2)",
              borderRadius: "10px",
            }}
          >
            <h3 style={{ color: "#dc2626", margin: "0 0 1rem 0", fontSize: "1.1rem" }}>Reject Payment</h3>
            <textarea
              value={rejectNotes}
              onChange={(e) => setRejectNotes(e.target.value)}
              placeholder="Required: Reason for rejection..."
              style={{
                width: "100%",
                padding: "10px 14px",
                background: "rgba(0,0,0,0.3)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "6px",
                color: "#fff",
                resize: "vertical",
                minHeight: "80px",
                marginBottom: "1rem",
                fontSize: "13px",
              }}
            />
            <button
              onClick={handleReject}
              disabled={processing || !rejectNotes.trim()}
              style={{
                width: "100%",
                padding: "12px",
                background:
                  processing || !rejectNotes.trim()
                    ? "rgba(220, 38, 38, 0.2)"
                    : "linear-gradient(135deg, #991b1b, #dc2626)",
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
                <path d="M18 6L6 18M6 6L18 18" />
              </svg>
              {processing ? "Processing..." : "Reject Payment"}
            </button>
          </div>
        </div>
      )}

      {/* Already Reviewed */}
      {!canAction(payment.status) && payment.status !== "EXPIRED" && (
        <div
          style={{
            padding: "1.5rem",
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "10px",
            textAlign: "center",
          }}
        >
          <p style={{ color: "rgba(255,255,255,0.6)", margin: 0 }}>
            This payment has already been {payment.status.toLowerCase()}.
          </p>
        </div>
      )}
    </div>
  );
}

/* ── Helper Components ── */

function DetailRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string | React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
      <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", minWidth: "120px" }}>{label}:</span>
      <span
        style={{
          fontSize: "14px",
          fontWeight: highlight ? 700 : 500,
          color: highlight ? "#10b981" : "rgba(255,255,255,0.85)",
          textAlign: "right",
          flex: 1,
        }}
      >
        {value}
      </span>
    </div>
  );
}
