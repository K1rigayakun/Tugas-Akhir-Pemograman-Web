"use client";

import { useState, useEffect } from "react";

interface BankTransferDisplayProps {
  paymentDetails: {
    accountNumber?: string;
    accountName?: string;
    bankName?: string;
    instructions?: string;
  };
  amount: number;
  fiatAmount: number;
  expiresAt?: string;
}

/**
 * BankTransferDisplay - Display bank account details for manual transfer
 * Task 4.1: Bank Transfer payment method UI
 * Requirements: 4.1 - Display bank account information with copy functionality
 */
export default function BankTransferDisplay({
  paymentDetails,
  amount,
  fiatAmount,
  expiresAt,
}: BankTransferDisplayProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!expiresAt) return;

    const calculateTimeLeft = () => {
      const expiry = new Date(expiresAt).getTime();
      const now = Date.now();
      const diff = Math.max(0, Math.floor((expiry - now) / 1000));
      setTimeLeft(diff);
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleCopyAccountNumber = async () => {
    if (paymentDetails.accountNumber) {
      try {
        await navigator.clipboard.writeText(paymentDetails.accountNumber);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy:", err);
      }
    }
  };

  return (
    <div
      style={{
        padding: "32px",
        background: "rgba(8, 24, 21, 0.8)",
        border: "1px solid rgba(201, 168, 76, 0.2)",
        borderRadius: "16px",
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "28px" }}>
        <h3
          style={{
            color: "var(--color-gold)",
            fontFamily: "var(--font-subheading)",
            fontSize: "20px",
            marginBottom: "8px",
          }}
        >
          Transfer Bank Manual
        </h3>
        <p style={{ color: "rgba(245, 240, 232, 0.6)", fontSize: "14px" }}>
          Transfer ke rekening berikut
        </p>
      </div>

      {/* Amount Summary */}
      <div
        style={{
          padding: "20px",
          background: "rgba(201, 168, 76, 0.08)",
          border: "1px solid rgba(201, 168, 76, 0.15)",
          borderRadius: "12px",
          marginBottom: "24px",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: "14px",
              color: "rgba(245, 240, 232, 0.6)",
              marginBottom: "8px",
            }}
          >
            Jumlah Transfer
          </div>
          <div
            style={{
              fontSize: "28px",
              fontWeight: 700,
              color: "var(--color-gold)",
              fontFamily: "var(--font-numeric, monospace)",
            }}
          >
            Rp {fiatAmount.toLocaleString("id-ID")}
          </div>
          <div
            style={{
              fontSize: "14px",
              color: "var(--color-emerald-light)",
              marginTop: "8px",
            }}
          >
            = {amount} Crown Coins
          </div>
        </div>
      </div>

      {/* Bank Account Details */}
      <div
        style={{
          background: "rgba(5, 5, 8, 0.5)",
          border: "1px solid rgba(201, 168, 76, 0.15)",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "24px",
        }}
      >
        <div style={{ marginBottom: "16px" }}>
          <div
            style={{
              fontSize: "12px",
              color: "rgba(245, 240, 232, 0.5)",
              marginBottom: "6px",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Nama Bank
          </div>
          <div
            style={{
              fontSize: "16px",
              fontWeight: 600,
              color: "var(--color-ivory)",
            }}
          >
            {paymentDetails.bankName || "Bank BCA"}
          </div>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <div
            style={{
              fontSize: "12px",
              color: "rgba(245, 240, 232, 0.5)",
              marginBottom: "6px",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Nama Penerima
          </div>
          <div
            style={{
              fontSize: "16px",
              fontWeight: 600,
              color: "var(--color-ivory)",
            }}
          >
            {paymentDetails.accountName || "Emerald Kingdom"}
          </div>
        </div>

        <div>
          <div
            style={{
              fontSize: "12px",
              color: "rgba(245, 240, 232, 0.5)",
              marginBottom: "6px",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Nomor Rekening
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px",
              background: "rgba(201, 168, 76, 0.08)",
              borderRadius: "8px",
            }}
          >
            <div
              style={{
                flex: 1,
                fontSize: "20px",
                fontWeight: 700,
                fontFamily: "var(--font-numeric, monospace)",
                color: "var(--color-gold)",
                letterSpacing: "0.1em",
              }}
            >
              {paymentDetails.accountNumber || "1234567890"}
            </div>
            <button
              onClick={handleCopyAccountNumber}
              style={{
                padding: "8px 16px",
                background: copied
                  ? "rgba(16, 185, 129, 0.2)"
                  : "rgba(201, 168, 76, 0.15)",
                border: `1px solid ${
                  copied ? "var(--color-emerald-primary)" : "var(--color-gold)"
                }`,
                borderRadius: "6px",
                color: copied ? "var(--color-emerald-light)" : "var(--color-gold)",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {copied ? "✓ Disalin" : "Salin"}
            </button>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div
        style={{
          padding: "16px",
          background: "rgba(16, 185, 129, 0.08)",
          border: "1px solid rgba(16, 185, 129, 0.2)",
          borderRadius: "8px",
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            fontSize: "14px",
            color: "var(--color-emerald-light)",
            lineHeight: "1.6",
          }}
        >
          <strong style={{ display: "block", marginBottom: "8px" }}>
            Instruksi Pembayaran:
          </strong>
          {paymentDetails.instructions ? (
            <div dangerouslySetInnerHTML={{ __html: paymentDetails.instructions }} />
          ) : (
            <>
              1. Transfer tepat sesuai nominal di atas
              <br />
              2. Simpan bukti transfer
              <br />
              3. Upload bukti transfer di halaman ini
              <br />
              4. Tunggu verifikasi admin (maks. 1x24 jam)
            </>
          )}
        </div>
      </div>

      {/* Timer */}
      {expiresAt && timeLeft > 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "12px",
            background: "rgba(201, 168, 76, 0.08)",
            borderRadius: "8px",
            marginBottom: "16px",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              color: "rgba(245, 240, 232, 0.5)",
              marginBottom: "4px",
            }}
          >
            Selesaikan pembayaran dalam
          </div>
          <div
            style={{
              fontSize: "24px",
              fontWeight: 700,
              color: timeLeft < 300 ? "#dc2626" : "var(--color-gold)",
              fontFamily: "var(--font-numeric, monospace)",
            }}
          >
            {formatTime(timeLeft)}
          </div>
        </div>
      )}

      {expiresAt && timeLeft === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "16px",
            background: "rgba(139, 26, 26, 0.2)",
            border: "1px solid rgba(139, 26, 26, 0.3)",
            borderRadius: "8px",
            color: "#dc2626",
          }}
        >
          ⚠ Waktu pembayaran telah habis. Silakan buat pembayaran baru.
        </div>
      )}

      {/* Note */}
      <div
        style={{
          padding: "12px",
          background: "rgba(201, 168, 76, 0.05)",
          borderRadius: "6px",
          fontSize: "12px",
          color: "rgba(245, 240, 232, 0.5)",
          lineHeight: "1.5",
          textAlign: "center",
        }}
      >
        💡 Setelah transfer, upload bukti pembayaran di bawah untuk mempercepat verifikasi
      </div>
    </div>
  );
}
