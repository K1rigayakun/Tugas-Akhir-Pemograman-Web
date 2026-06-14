import React from 'react';

export function CrownCoinDisplay({ amount }: { amount: number }) {
  return (
    <span style={{ 
      fontFamily: 'var(--font-numeric)', 
      color: 'var(--color-gold)',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px'
    }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ transform: "translateY(-1px)" }}>
        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="url(#goldGradient)" fillOpacity="0.15" stroke="var(--color-gold)" strokeWidth="1.5" />
        <path d="M8 15L12 11L16 15" stroke="var(--color-gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 11V7" stroke="var(--color-gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <defs>
          <linearGradient id="goldGradient" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FDE047" />
            <stop offset="1" stopColor="#A16207" />
          </linearGradient>
        </defs>
      </svg>
      {amount.toLocaleString('id-ID')} CC
    </span>
  );
}