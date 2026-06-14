"use client";

import React, { useState, useEffect } from "react";

interface CountdownTimerProps {
  expiresAt: string | Date;
  onExpired?: () => void;
}

/**
 * CountdownTimer — Real-time countdown display with MM:SS format
 * Task 11.1: setInterval, urgent styling < 5 min, expiration message, cleanup
 * Requirements 4.1, 4.2, 4.3, 4.5, 4.6
 */
export default function CountdownTimer({ expiresAt, onExpired }: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  useEffect(() => {
    const target = new Date(expiresAt).getTime();

    const updateTimer = () => {
      const remaining = Math.max(0, target - Date.now());
      setTimeRemaining(remaining);
      if (remaining === 0) {
        onExpired?.();
      }
    };

    // Initial update
    updateTimer();

    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpired]);

  const minutes = Math.floor(timeRemaining / 60000);
  const seconds = Math.floor((timeRemaining % 60000) / 1000);
  const isUrgent = timeRemaining > 0 && timeRemaining < 5 * 60 * 1000;
  const isExpired = timeRemaining === 0;

  if (isExpired) {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "12px 16px",
        background: "rgba(139, 26, 26, 0.2)",
        border: "1px solid rgba(139, 26, 26, 0.4)",
        borderRadius: "8px",
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M15 9L9 15M9 9L15 15"/>
        </svg>
        <span style={{ color: "#dc2626", fontWeight: 600, fontSize: "14px" }}>
          Waktu pembayaran habis
        </span>
      </div>
    );
  }

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "10px",
      padding: "12px 16px",
      background: isUrgent
        ? "rgba(139, 26, 26, 0.15)"
        : "rgba(201, 168, 76, 0.08)",
      border: `1px solid ${isUrgent ? "rgba(220, 38, 38, 0.3)" : "rgba(201, 168, 76, 0.2)"}`,
      borderRadius: "8px",
      transition: "all 0.3s ease",
    }}>
      {/* Clock icon */}
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke={isUrgent ? "#dc2626" : "var(--color-gold)"} strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 6V12L16 14"/>
      </svg>

      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        <span style={{
          fontSize: "11px",
          color: "rgba(245, 240, 232, 0.5)",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
        }}>
          Sisa Waktu
        </span>
        <span style={{
          fontSize: "24px",
          fontFamily: "var(--font-numeric, monospace)",
          fontWeight: 700,
          color: isUrgent ? "#dc2626" : "var(--color-gold-light)",
          letterSpacing: "0.05em",
          animation: isUrgent ? "pulse-urgent 1s ease-in-out infinite" : "none",
        }}>
          {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </span>
      </div>

      <style>{`
        @keyframes pulse-urgent {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}
