"use client";

import React, { useState } from "react";
import CountdownTimer from "./CountdownTimer";

interface TestingPaymentDisplayProps {
  paymentDetails: {
    message?: string;
    instructions?: string[];
    transactionId?: string;
  };
  paymentId: string;
  amount: number;
  fiatAmount: number;
  expiresAt: string;
  onComplete: () => Promise<void>;
}

/**
 * TestingPaymentDisplay — Test payment completion button
 * Task 12.6: Testing instructions, "Complete Test Payment" button, success message
 * Requirements 3.5
 */
export default function TestingPaymentDisplay({
  paymentDetails,
  paymentId,
  amount,
  fiatAmount,
  expiresAt,
  onComplete,
}: TestingPaymentDisplayProps) {
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleComplete = async () => {
    setLoading(true);
    setError(null);
    try {
      await onComplete();
      setCompleted(true);
    } catch (err: any) {
      setError(err.message || "Gagal menyelesaikan pembayaran test");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "24px",
      padding: "32px 24px",
      background: "rgba(8, 24, 21, 0.8)",
      border: "1px solid rgba(16, 185, 129, 0.25)",
      borderRadius: "16px",
    }}>
      {/* Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "8px 16px",
        background: "rgba(16, 185, 129, 0.1)",
        border: "1px solid rgba(16, 185, 129, 0.2)",
        borderRadius: "20px",
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-emerald-primary)" strokeWidth="2">
          <path d="M9 3L9 8.5L4 16.5C3.17 18 4.17 20 6 20H18C19.83 20 20.83 18 20 16.5L15 8.5V3M9 3H15"/>
        </svg>
        <span style={{ fontSize: "12px", color: "var(--color-emerald-light)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em" }}>
          Mode Testing
        </span>
      </div>

      <h3 style={{
        fontFamily: "var(--font-subheading)",
        color: "var(--color-gold)",
        fontSize: "18px",
      }}>
        Simulasi Pembayaran
      </h3>

      {/* Amount */}
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "14px", color: "rgba(245, 240, 232, 0.5)" }}>Total</div>
        <div style={{
          fontSize: "28px",
          fontWeight: 700,
          color: "var(--color-gold-light)",
          fontFamily: "var(--font-numeric, monospace)",
        }}>
          Rp {fiatAmount.toLocaleString("id-ID")}
        </div>
        <div style={{ fontSize: "13px", color: "var(--color-emerald-light)" }}>
          = {amount} Crown Coins (CC)
        </div>
      </div>

      {/* Instructions */}
      <div style={{
        width: "100%",
        maxWidth: "400px",
        padding: "16px",
        background: "rgba(201, 168, 76, 0.04)",
        border: "1px solid rgba(201, 168, 76, 0.1)",
        borderRadius: "8px",
      }}>
        <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-ivory)", marginBottom: "8px" }}>
          Petunjuk:
        </div>
        <ol style={{
          fontSize: "12px",
          color: "rgba(245, 240, 232, 0.6)",
          lineHeight: "1.8",
          paddingLeft: "18px",
          margin: 0,
        }}>
          {(paymentDetails.instructions || [
            "Periksa jumlah pembayaran",
            "Klik tombol \"Selesaikan Pembayaran Test\" di bawah",
            "Pembayaran akan ditandai sebagai PAID",
            "Admin akan mereview dan menyetujui pembayaran",
            "Tidak ada uang asli yang diproses",
          ]).map((instruction, i) => (
            <li key={i}>{instruction}</li>
          ))}
        </ol>
      </div>

      {/* Action */}
      {completed ? (
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "16px 24px",
          background: "rgba(16, 185, 129, 0.15)",
          border: "1px solid rgba(16, 185, 129, 0.3)",
          borderRadius: "10px",
          width: "100%",
          maxWidth: "400px",
          justifyContent: "center",
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-emerald-primary)" strokeWidth="2">
            <path d="M22 11.08V12C21.99 17.52 17.52 22 12 22C6.48 22 2.01 17.52 2 12C1.99 6.48 6.48 2 12 2C13.61 2 15.14 2.37 16.53 3.04"/>
            <path d="M22 4L12 14.01L9 11.01"/>
          </svg>
          <div>
            <div style={{ fontWeight: 700, color: "var(--color-emerald-light)", fontSize: "15px" }}>
              Pembayaran Berhasil
            </div>
            <div style={{ fontSize: "12px", color: "rgba(245, 240, 232, 0.5)" }}>
              Menunggu persetujuan admin...
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={handleComplete}
          disabled={loading}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            width: "100%",
            maxWidth: "400px",
            padding: "16px 24px",
            background: loading
              ? "rgba(201, 168, 76, 0.3)"
              : "linear-gradient(135deg, var(--color-gold), var(--color-gold-bright))",
            color: "#050508",
            border: "none",
            borderRadius: "10px",
            fontSize: "16px",
            fontWeight: 800,
            cursor: loading ? "not-allowed" : "pointer",
            boxShadow: loading ? "none" : "0 4px 16px rgba(201, 168, 76, 0.3)",
            transition: "all 0.3s",
          }}
        >
          {loading ? (
            <>Processing...</>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12L10 17L20 7"/>
              </svg>
              Selesaikan Pembayaran Test
            </>
          )}
        </button>
      )}

      {error && (
        <div style={{
          padding: "10px 16px",
          background: "rgba(139, 26, 26, 0.2)",
          border: "1px solid rgba(139, 26, 26, 0.3)",
          borderRadius: "8px",
          color: "#dc2626",
          fontSize: "13px",
        }}>
          {error}
        </div>
      )}

      <CountdownTimer expiresAt={expiresAt} />
    </div>
  );
}
