"use client";

import React from "react";
import CountdownTimer from "./CountdownTimer";

type PaymentStatus = "PENDING" | "PAID" | "APPROVED" | "REJECTED" | "EXPIRED";

interface PaymentStatusTrackerProps {
  status: PaymentStatus;
  expiresAt?: string;
  adminNotes?: string;
  paidAt?: string;
  reviewedAt?: string;
  onRetry?: () => void;
}

const STATUS_CONFIG: Record<PaymentStatus, {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  iconPath: string;
  message: string;
}> = {
  PENDING: {
    label: "Menunggu Pembayaran",
    color: "var(--color-gold-light)",
    bgColor: "rgba(201, 168, 76, 0.1)",
    borderColor: "rgba(201, 168, 76, 0.3)",
    iconPath: "M12 6V12L16 14M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z",
    message: "Menunggu pembayaran dari Anda. Selesaikan sebelum waktu habis.",
  },
  PAID: {
    label: "Pembayaran Diterima",
    color: "#22c55e",
    bgColor: "rgba(34, 197, 94, 0.1)",
    borderColor: "rgba(34, 197, 94, 0.3)",
    iconPath: "M9 12L11 14L15 10M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z",
    message: "Pembayaran berhasil diterima. Menunggu persetujuan admin untuk menambah saldo.",
  },
  APPROVED: {
    label: "Disetujui",
    color: "var(--color-emerald-primary)",
    bgColor: "rgba(16, 185, 129, 0.12)",
    borderColor: "rgba(16, 185, 129, 0.3)",
    iconPath: "M22 11.08V12C21.99 17.52 17.52 22 12 22C6.48 22 2.01 17.52 2 12C1.99 6.48 6.48 2 12 2C13.61 2 15.14 2.37 16.53 3.04M22 4L12 14.01L9 11.01",
    message: "Top up disetujui! Crown Coins sudah masuk ke saldo Anda.",
  },
  REJECTED: {
    label: "Ditolak",
    color: "#dc2626",
    bgColor: "rgba(220, 38, 38, 0.1)",
    borderColor: "rgba(220, 38, 38, 0.3)",
    iconPath: "M15 9L9 15M9 9L15 15M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z",
    message: "Pembayaran ditolak oleh admin.",
  },
  EXPIRED: {
    label: "Kadaluarsa",
    color: "rgba(245, 240, 232, 0.4)",
    bgColor: "rgba(245, 240, 232, 0.05)",
    borderColor: "rgba(245, 240, 232, 0.15)",
    iconPath: "M12 8V12M12 16H12.01M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z",
    message: "Waktu pembayaran telah habis.",
  },
};

/**
 * PaymentStatusTracker — Displays current payment status
 * Task 13.1: Status config map, countdown for PENDING, admin notes for REJECTED, retry for EXPIRED
 * Requirements 8.1, 8.2
 */
export default function PaymentStatusTracker({
  status,
  expiresAt,
  adminNotes,
  paidAt,
  reviewedAt,
  onRetry,
}: PaymentStatusTrackerProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;

  return (
    <div style={{
      padding: "20px",
      background: config.bgColor,
      border: `1px solid ${config.borderColor}`,
      borderRadius: "12px",
      display: "flex",
      flexDirection: "column",
      gap: "12px",
    }}>
      {/* Status header */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={config.color} strokeWidth="2">
          <path d={config.iconPath} strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <div>
          <div style={{
            fontSize: "16px",
            fontWeight: 700,
            color: config.color,
            fontFamily: "var(--font-subheading)",
          }}>
            {config.label}
          </div>
          <div style={{ fontSize: "13px", color: "rgba(245, 240, 232, 0.5)" }}>
            {config.message}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{
        height: "4px",
        background: "rgba(255, 255, 255, 0.08)",
        borderRadius: "2px",
        overflow: "hidden",
      }}>
        <div style={{
          height: "100%",
          width: status === "PENDING" ? "25%" : status === "PAID" ? "60%" : status === "APPROVED" ? "100%" : status === "REJECTED" ? "100%" : "0%",
          background: config.color,
          borderRadius: "2px",
          transition: "width 0.5s ease",
        }} />
      </div>

      {/* Step indicators */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        fontSize: "11px",
        color: "rgba(245, 240, 232, 0.4)",
      }}>
        <span style={{ color: ["PENDING", "PAID", "APPROVED"].includes(status) ? config.color : undefined }}>Dibuat</span>
        <span style={{ color: ["PAID", "APPROVED"].includes(status) ? config.color : undefined }}>Dibayar</span>
        <span style={{ color: status === "APPROVED" ? config.color : undefined }}>Disetujui</span>
      </div>

      {/* Countdown for PENDING */}
      {status === "PENDING" && expiresAt && (
        <CountdownTimer expiresAt={expiresAt} />
      )}

      {/* Admin notes for REJECTED */}
      {status === "REJECTED" && adminNotes && (
        <div style={{
          padding: "10px 14px",
          background: "rgba(139, 26, 26, 0.15)",
          border: "1px solid rgba(139, 26, 26, 0.2)",
          borderRadius: "6px",
          fontSize: "13px",
          color: "rgba(245, 240, 232, 0.7)",
        }}>
          <strong style={{ color: "#dc2626" }}>Catatan Admin:</strong> {adminNotes}
        </div>
      )}

      {/* Timestamp info */}
      {paidAt && (
        <div style={{ fontSize: "12px", color: "rgba(245, 240, 232, 0.4)" }}>
          Dibayar: {new Date(paidAt).toLocaleString("id-ID")}
        </div>
      )}
      {reviewedAt && (
        <div style={{ fontSize: "12px", color: "rgba(245, 240, 232, 0.4)" }}>
          Direview: {new Date(reviewedAt).toLocaleString("id-ID")}
        </div>
      )}

      {/* Retry for EXPIRED */}
      {status === "EXPIRED" && onRetry && (
        <button
          onClick={onRetry}
          style={{
            padding: "10px 20px",
            background: "var(--color-gold)",
            color: "#050508",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: 700,
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 4V10H7M23 20V14H17M20.49 9A9 9 0 1 0 5.64 5.64L1 10M23 14L18.36 18.36A9 9 0 0 1 3.51 15"/>
          </svg>
          Coba Lagi
        </button>
      )}
    </div>
  );
}
