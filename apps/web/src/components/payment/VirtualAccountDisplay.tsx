"use client";

import React, { useState } from "react";
import CountdownTimer from "./CountdownTimer";

interface VirtualAccountDisplayProps {
  paymentDetails: {
    accountNumber?: string;
    bankName?: string;
    bankCode?: string;
    transactionId?: string;
  };
  amount: number;
  fiatAmount: number;
  expiresAt: string;
}

/**
 * Bank-specific payment instructions for each supported bank
 * Task 4.3: Requirement 4.3 - Display bank-specific payment instructions
 */
const BANK_INSTRUCTIONS: Record<string, { name: string; steps: string[] }> = {
  BCA: {
    name: "BCA",
    steps: [
      "Buka aplikasi BCA Mobile atau klik.bca.co.id",
      "Pilih menu 'm-Transfer' → 'BCA Virtual Account'",
      "Masukkan 16 digit nomor Virtual Account",
      "Jumlah transfer akan muncul otomatis",
      "Masukkan PIN dan konfirmasi transfer",
    ],
  },
  BNI: {
    name: "BNI",
    steps: [
      "Buka aplikasi BNI Mobile Banking",
      "Pilih menu 'Transfer' → 'Virtual Account Billing'",
      "Masukkan 16 digit nomor Virtual Account BNI",
      "Nominal transfer akan tampil otomatis",
      "Konfirmasi dan selesaikan pembayaran",
    ],
  },
  MANDIRI: {
    name: "Mandiri",
    steps: [
      "Buka Livin' by Mandiri atau ATM Mandiri",
      "Pilih 'Bayar' → 'Multipayment'",
      "Masukkan kode perusahaan dan nomor VA",
      "Cek detail pembayaran",
      "Konfirmasi dengan PIN/MPIN",
    ],
  },
  BRI: {
    name: "BRI",
    steps: [
      "Buka aplikasi BRImo atau ATM BRI",
      "Pilih 'Pembayaran' → 'BRIVA'",
      "Masukkan 16 digit nomor Virtual Account",
      "Jumlah pembayaran tampil otomatis",
      "Konfirmasi dan masukkan PIN",
    ],
  },
  PERMATA: {
    name: "Permata",
    steps: [
      "Buka PermataMobile X atau ATM PermataBank",
      "Pilih 'Pembayaran' → 'Virtual Account'",
      "Masukkan 16 digit nomor Virtual Account",
      "Periksa detail pembayaran",
      "Konfirmasi dengan PIN",
    ],
  },
};

/**
 * VirtualAccountDisplay — VA number display with copy button and bank-specific instructions
 * Task 4.3: Display 16-digit VA number, copy-to-clipboard, bank-specific instructions, countdown timer
 * Requirements 4.3
 */
export default function VirtualAccountDisplay({ paymentDetails, amount, fiatAmount, expiresAt }: VirtualAccountDisplayProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Get bank-specific instructions
  const bankCode = paymentDetails.bankCode?.toUpperCase() || "";
  const bankInfo = BANK_INSTRUCTIONS[bankCode] || {
    name: paymentDetails.bankName || "Bank",
    steps: [
      "Buka aplikasi mobile banking atau ATM",
      "Pilih menu Transfer ke Virtual Account",
      "Masukkan nomor Virtual Account di atas",
      "Masukkan jumlah yang tertera",
      "Konfirmasi dan selesaikan transfer",
    ],
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      gap: "20px",
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
          <path d="M3 21H21M3 10H21M5 6L12 3L19 6M4 10V21M20 10V21M8 14V17M12 14V17M16 14V17" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Transfer Virtual Account
      </h3>

      {/* Bank name */}
      <div style={{
        padding: "16px",
        background: "rgba(201, 168, 76, 0.06)",
        border: "1px solid rgba(201, 168, 76, 0.15)",
        borderRadius: "10px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}>
        <div>
          <div style={{ fontSize: "12px", color: "rgba(245, 240, 232, 0.5)", marginBottom: "4px" }}>Bank</div>
          <div style={{
            fontSize: "18px",
            fontWeight: 700,
            color: "var(--color-ivory)",
            fontFamily: "var(--font-subheading)",
          }}>
            {bankInfo.name}
          </div>
        </div>

        {/* VA Number with copy */}
        <div>
          <div style={{ fontSize: "12px", color: "rgba(245, 240, 232, 0.5)", marginBottom: "4px" }}>Nomor Virtual Account</div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              flex: 1,
              fontSize: "20px",
              fontFamily: "var(--font-numeric, monospace)",
              fontWeight: 700,
              color: "var(--color-gold-light)",
              letterSpacing: "0.08em",
              padding: "10px 14px",
              background: "rgba(5, 5, 8, 0.5)",
              border: "1px solid rgba(201, 168, 76, 0.2)",
              borderRadius: "6px",
            }}>
              {paymentDetails.accountNumber || "Loading..."}
            </div>
            <button
              onClick={() => copyToClipboard(paymentDetails.accountNumber || "")}
              style={{
                padding: "10px 16px",
                background: copied ? "var(--color-emerald-primary)" : "var(--color-gold)",
                color: "#050508",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: "13px",
                transition: "all 0.3s",
                whiteSpace: "nowrap",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              {copied ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12L10 17L20 7"/>
                  </svg>
                  Copied
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2"/>
                    <path d="M5 15H4C2.89 15 2 14.1 2 13V4C2 2.89 2.89 2 4 2H13C14.1 2 15 2.89 15 4V5"/>
                  </svg>
                  Copy
                </>
              )}
            </button>
          </div>
        </div>

        {/* Amount */}
        <div>
          <div style={{ fontSize: "12px", color: "rgba(245, 240, 232, 0.5)", marginBottom: "4px" }}>Jumlah Transfer</div>
          <div style={{
            fontSize: "24px",
            fontWeight: 700,
            color: "var(--color-gold-light)",
            fontFamily: "var(--font-numeric, monospace)",
          }}>
            Rp {fiatAmount.toLocaleString("id-ID")}
          </div>
          <div style={{ fontSize: "13px", color: "var(--color-emerald-light)", marginTop: "2px" }}>
            = {amount} Crown Coins (CC)
          </div>
        </div>
      </div>

      {/* Bank-specific Instructions */}
      <div style={{
        padding: "16px",
        background: "rgba(201, 168, 76, 0.04)",
        border: "1px solid rgba(201, 168, 76, 0.1)",
        borderRadius: "8px",
      }}>
        <div style={{ 
          fontSize: "13px", 
          fontWeight: 600, 
          color: "var(--color-ivory)", 
          marginBottom: "8px",
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold)" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 16V12M12 8H12.01"/>
          </svg>
          Cara Transfer via {bankInfo.name}:
        </div>
        <ol style={{
          fontSize: "12px",
          color: "rgba(245, 240, 232, 0.6)",
          lineHeight: "1.8",
          paddingLeft: "18px",
          margin: 0,
        }}>
          {bankInfo.steps.map((step, index) => (
            <li key={index}>{step}</li>
          ))}
        </ol>
      </div>

      {/* Important Note */}
      <div style={{
        padding: "12px 16px",
        background: "rgba(16, 185, 129, 0.08)",
        border: "1px solid rgba(16, 185, 129, 0.2)",
        borderRadius: "8px",
        display: "flex",
        gap: "10px",
        alignItems: "flex-start",
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-emerald-light)" strokeWidth="2" style={{ flexShrink: 0, marginTop: "2px" }}>
          <path d="M12 2L2 7L12 12L22 7L12 2Z"/>
          <path d="M2 17L12 22L22 17"/>
          <path d="M2 12L12 17L22 12"/>
        </svg>
        <div style={{ fontSize: "12px", color: "var(--color-emerald-light)", lineHeight: "1.6" }}>
          <strong>Penting:</strong> Transfer harus dilakukan dengan nominal <strong>tepat</strong> sesuai jumlah di atas. Pembayaran akan otomatis terverifikasi setelah transfer berhasil.
        </div>
      </div>

      <CountdownTimer expiresAt={expiresAt} />
    </div>
  );
}
