import React from 'react';

type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
}

const toastColors: Record<ToastType, string> = {
  success: 'var(--color-rarity-uncommon)',
  error:   'var(--color-crimson)',
  info:    'var(--color-gold)',
};

export function Toast({ message, type = 'info' }: ToastProps) {
  return (
    <div style={{ borderColor: toastColors[type] }} className="border bg-[var(--color-bg-mid)] text-[var(--color-ivory)] px-4 py-3 rounded-lg shadow-lg">
      {message}
    </div>
  );
}