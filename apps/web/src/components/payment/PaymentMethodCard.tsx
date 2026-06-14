"use client";

import React from "react";

interface PaymentMethodOption {
  id: string;
  label: string;
  description: string;
  iconPath: string;
  priority: number;
}

interface PaymentMethodCardProps {
  method: PaymentMethodOption;
  selected: boolean;
  onClick: () => void;
}

/**
 * PaymentMethodCard — Individual payment method card
 * Task 10.1: Display payment method icon, label, description
 * Emerald Kingdom medieval theme styling
 */
export default function PaymentMethodCard({ method, selected, onClick }: PaymentMethodCardProps) {
  return (
    <button
      id={`payment-method-${method.id}`}
      onClick={onClick}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "12px",
        padding: "24px 16px",
        background: selected
          ? "linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(201, 168, 76, 0.12))"
          : "rgba(8, 24, 21, 0.8)",
        border: selected
          ? "2px solid var(--color-emerald-primary)"
          : "1px solid rgba(201, 168, 76, 0.18)",
        borderRadius: "12px",
        cursor: "pointer",
        transition: "all 0.3s ease",
        position: "relative",
        overflow: "hidden",
        minWidth: "160px",
        boxShadow: selected
          ? "0 0 20px rgba(16, 185, 129, 0.2), inset 0 0 20px rgba(16, 185, 129, 0.05)"
          : "none",
      }}
      onMouseEnter={(e) => {
        if (!selected) {
          e.currentTarget.style.borderColor = "var(--color-gold)";
          e.currentTarget.style.transform = "translateY(-4px)";
          e.currentTarget.style.boxShadow = "0 8px 24px rgba(201, 168, 76, 0.15)";
        }
      }}
      onMouseLeave={(e) => {
        if (!selected) {
          e.currentTarget.style.borderColor = "rgba(201, 168, 76, 0.18)";
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "none";
        }
      }}
    >
      {/* Selected indicator */}
      {selected && (
        <div style={{
          position: "absolute",
          top: "8px",
          right: "8px",
          width: "20px",
          height: "20px",
          borderRadius: "50%",
          background: "var(--color-emerald-primary)",
          display: "grid",
          placeItems: "center",
        }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 6L5 9L10 3" stroke="#050508" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      )}

      {/* Icon */}
      <div style={{
        width: "48px",
        height: "48px",
        borderRadius: "12px",
        background: selected
          ? "rgba(16, 185, 129, 0.15)"
          : "rgba(201, 168, 76, 0.08)",
        display: "grid",
        placeItems: "center",
        border: `1px solid ${selected ? "rgba(16, 185, 129, 0.3)" : "rgba(201, 168, 76, 0.15)"}`,
      }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={selected ? "var(--color-emerald-primary)" : "var(--color-gold)"} strokeWidth="1.5">
          <path d={method.iconPath} strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      {/* Label */}
      <span style={{
        fontFamily: "var(--font-subheading)",
        fontSize: "14px",
        fontWeight: 600,
        color: selected ? "var(--color-emerald-light)" : "var(--color-ivory)",
      }}>
        {method.label}
      </span>

      {/* Description */}
      <span style={{
        fontSize: "12px",
        color: "rgba(245, 240, 232, 0.5)",
        textAlign: "center",
        lineHeight: "1.4",
      }}>
        {method.description}
      </span>
    </button>
  );
}
