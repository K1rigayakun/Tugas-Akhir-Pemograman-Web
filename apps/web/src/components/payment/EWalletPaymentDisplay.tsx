"use client";

import React from "react";
import CountdownTimer from "./CountdownTimer";

interface EWalletPaymentDisplayProps {
  paymentDetails: {
    redirectUrl?: string;
    deepLink?: string;
    walletType?: string;
    transactionId?: string;
  };
  amount: number;
  fiatAmount: number;
  expiresAt: string;
}

/**
 * EWalletPaymentDisplay — E-Wallet redirect/deep link display
 * Task 12.5: Wallet type, redirect button, amount, instructions, timer
 * Requirements 3.3, 3.6, 3.7
 */
export default function EWalletPaymentDisplay({ paymentDetails, amount, fiatAmount, expiresAt }: EWalletPaymentDisplayProps) {
  const walletName = paymentDetails.walletType || "E-Wallet";

  return (
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
          <path d="M19 7H5C3.89 7 3 7.89 3 9V18C3 19.1 3.89 20 5 20H19C20.1 20 21 19.1 21 18V9C21 7.89 20.1 7 19 7ZM19 18H5V9H19V18Z" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Pembayaran {walletName}
      </h3>

      {/* Amount */}
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

      {/* Wallet icon + name */}
      <div style={{
        padding: "20px 32px",
        background: "rgba(16, 185, 129, 0.08)",
        border: "1px solid rgba(16, 185, 129, 0.2)",
        borderRadius: "12px",
        textAlign: "center",
      }}>
        <div style={{
          width: "64px",
          height: "64px",
          borderRadius: "16px",
          background: "rgba(16, 185, 129, 0.12)",
          display: "grid",
          placeItems: "center",
          margin: "0 auto 12px",
          border: "1px solid rgba(16, 185, 129, 0.25)",
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-emerald-light)" strokeWidth="1.5">
            <path d="M19 7H5C3.89 7 3 7.89 3 9V18C3 19.1 3.89 20 5 20H19C20.1 20 21 19.1 21 18V9C21 7.89 20.1 7 19 7ZM16 13.5C16 12.67 16.67 12 17.5 12C18.33 12 19 12.67 19 13.5C19 14.33 18.33 15 17.5 15C16.67 15 16 14.33 16 13.5Z"/>
          </svg>
        </div>
        <div style={{
          fontFamily: "var(--font-subheading)",
          fontSize: "16px",
          fontWeight: 600,
          color: "var(--color-ivory)",
        }}>
          {walletName}
        </div>
      </div>

      {/* Open wallet button */}
      {paymentDetails.deepLink && (
        <a
          href={paymentDetails.deepLink}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            width: "100%",
            maxWidth: "320px",
            padding: "14px 24px",
            background: "linear-gradient(135deg, var(--color-emerald-dark), var(--color-emerald-primary))",
            color: "#fff",
            border: "none",
            borderRadius: "10px",
            fontSize: "15px",
            fontWeight: 700,
            textDecoration: "none",
            cursor: "pointer",
            boxShadow: "0 4px 16px rgba(16, 185, 129, 0.3)",
            transition: "all 0.3s",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 13V19C18 20.1 17.1 21 16 21H5C3.9 21 3 20.1 3 19V8C3 6.9 3.9 6 5 6H11M15 3H21V9M10 14L21 3"/>
          </svg>
          Buka Aplikasi {walletName}
        </a>
      )}

      {paymentDetails.redirectUrl && paymentDetails.redirectUrl !== paymentDetails.deepLink && (
        <a
          href={paymentDetails.redirectUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: "13px",
            color: "var(--color-gold)",
            textDecoration: "underline",
          }}
        >
          Atau buka di browser
        </a>
      )}

      {/* Instructions */}
      <div style={{
        width: "100%",
        maxWidth: "360px",
        padding: "16px",
        background: "rgba(201, 168, 76, 0.04)",
        border: "1px solid rgba(201, 168, 76, 0.1)",
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
          <li>Klik tombol &quot;Buka Aplikasi {walletName}&quot;</li>
          <li>Anda akan diarahkan ke aplikasi {walletName}</li>
          <li>Konfirmasi pembayaran di aplikasi</li>
          <li>Status akan terupdate otomatis</li>
        </ol>
      </div>

      <CountdownTimer expiresAt={expiresAt} />
    </div>
  );
}
