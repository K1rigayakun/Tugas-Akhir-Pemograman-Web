"use client";

import React, { useState } from "react";
import CountdownTimer from "./CountdownTimer";

interface QRISPaymentDisplayProps {
  paymentDetails: {
    qrCodeBase64?: string;
    qrString?: string;
    transactionId?: string;
  };
  amount: number;
  fiatAmount: number;
  expiresAt: string;
}

/**
 * QRISPaymentDisplay — QR code display for QRIS payments
 * Task 4.2: QR image with zoom/download functionality, instructions, countdown timer
 * Requirements 4.2
 */
export default function QRISPaymentDisplay({ paymentDetails, amount, fiatAmount, expiresAt }: QRISPaymentDisplayProps) {
  const [isZoomed, setIsZoomed] = useState(false);

  const handleDownloadQR = () => {
    if (!paymentDetails.qrCodeBase64) return;

    const link = document.createElement("a");
    const qrDataUrl = paymentDetails.qrCodeBase64.startsWith("data:")
      ? paymentDetails.qrCodeBase64
      : `data:image/png;base64,${paymentDetails.qrCodeBase64}`;
    
    link.href = qrDataUrl;
    link.download = `qris-payment-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  return (
    <>
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "24px",
        padding: "32px 24px",
        background: "rgba(8, 24, 21, 0.8)",
        border: "1px solid rgba(201, 168, 76, 0.2)",
        borderRadius: "16px",
      }}>
        <h3 style={{
          fontFamily: "var(--font-subheading)",
          color: "var(--color-gold)",
          fontSize: "18px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold)" strokeWidth="1.5">
            <path d="M3 3H10V10H3V3ZM14 3H21V10H14V3ZM3 14H10V21H3V14ZM6 6V7H7V6H6ZM17 6V7H18V6H17ZM6 17V18H7V17H6Z" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Scan QR Code untuk Bayar
        </h3>

        {/* Amount display */}
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "14px", color: "rgba(245, 240, 232, 0.5)" }}>Total Pembayaran</div>
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

        {/* QR Code */}
        <div style={{
          background: "#ffffff",
          padding: "16px",
          borderRadius: "12px",
          boxShadow: "0 4px 24px rgba(0, 0, 0, 0.3)",
          cursor: paymentDetails.qrCodeBase64 ? "zoom-in" : "default",
          transition: "transform 0.2s",
        }}
        onClick={paymentDetails.qrCodeBase64 ? toggleZoom : undefined}
        onMouseEnter={(e) => {
          if (paymentDetails.qrCodeBase64) {
            e.currentTarget.style.transform = "scale(1.05)";
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
        }}
        >
          {paymentDetails.qrCodeBase64 ? (
            <img
              src={paymentDetails.qrCodeBase64.startsWith("data:")
                ? paymentDetails.qrCodeBase64
                : `data:image/png;base64,${paymentDetails.qrCodeBase64}`}
              alt="QR Code QRIS"
              style={{ width: "220px", height: "220px", display: "block" }}
            />
          ) : (
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=DUMMY_QRIS_PAYMENT_${fiatAmount}`}
              alt="QR Code QRIS Dummy"
              style={{ width: "220px", height: "220px", display: "block" }}
            />
          )}
        </div>

        {/* Download button */}
        {paymentDetails.qrCodeBase64 && (
          <button
            onClick={handleDownloadQR}
            style={{
              padding: "10px 24px",
              background: "rgba(201, 168, 76, 0.15)",
              border: "1px solid var(--color-gold)",
              borderRadius: "8px",
              color: "var(--color-gold)",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(201, 168, 76, 0.25)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(201, 168, 76, 0.15)";
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Download QR Code
          </button>
        )}

        {/* Instructions */}
        <div style={{
          width: "100%",
          maxWidth: "360px",
          padding: "16px",
          background: "rgba(201, 168, 76, 0.06)",
          border: "1px solid rgba(201, 168, 76, 0.12)",
          borderRadius: "8px",
        }}>
          <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-ivory)", marginBottom: "8px" }}>
            Cara Pembayaran:
          </div>
          <ol style={{
            fontSize: "12px",
            color: "rgba(245, 240, 232, 0.6)",
            lineHeight: "1.8",
            paddingLeft: "18px",
            margin: 0,
          }}>
            <li>Buka aplikasi bank atau e-wallet</li>
            <li>Pilih menu Scan QR / QRIS</li>
            <li>Scan QR code di atas</li>
            <li>Konfirmasi jumlah pembayaran</li>
            <li>Selesaikan pembayaran</li>
          </ol>
        </div>

        {/* Countdown */}
        <CountdownTimer expiresAt={expiresAt} />
      </div>

      {/* Zoom Modal */}
      {isZoomed && paymentDetails.qrCodeBase64 && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.9)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            cursor: "zoom-out",
            padding: "20px",
          }}
          onClick={toggleZoom}
        >
          <div style={{
            background: "#ffffff",
            padding: "24px",
            borderRadius: "16px",
            maxWidth: "90vw",
            maxHeight: "90vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px",
          }}
          onClick={(e) => e.stopPropagation()}
          >
            <img
              src={paymentDetails.qrCodeBase64.startsWith("data:")
                ? paymentDetails.qrCodeBase64
                : `data:image/png;base64,${paymentDetails.qrCodeBase64}`}
              alt="QR Code QRIS (Zoomed)"
              style={{
                maxWidth: "100%",
                maxHeight: "70vh",
                width: "auto",
                height: "auto",
              }}
            />
            <button
              onClick={toggleZoom}
              style={{
                padding: "10px 24px",
                background: "#050508",
                border: "1px solid var(--color-gold)",
                borderRadius: "8px",
                color: "var(--color-gold)",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </>
  );
}
