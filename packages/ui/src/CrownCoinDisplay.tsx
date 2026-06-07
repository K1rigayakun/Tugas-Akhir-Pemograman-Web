import React from 'react';

export function CrownCoinDisplay({ amount }: { amount: number }) {
  return (
    <span style={{ fontFamily: 'var(--font-numeric)', color: 'var(--color-gold)' }}>
      ♛ {amount.toLocaleString('id-ID')} CC
    </span>
  );
}