import React from 'react';

interface BadgeProps {
  label: string;
  color?: string;
}

export function Badge({ label, color = 'var(--color-gold)' }: BadgeProps) {
  return (
    <span style={{ color, borderColor: color }} className="text-xs border px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider">
      {label}
    </span>
  );
}