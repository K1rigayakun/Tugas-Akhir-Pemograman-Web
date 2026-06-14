import React from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type?: ToastType;
}

const toastConfig: Record<ToastType, { borderColor: string; iconPath: string; iconColor: string }> = {
  success: {
    borderColor: 'var(--color-rarity-uncommon)',
    iconColor: '#4caf50',
    iconPath: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  error: {
    borderColor: 'var(--color-crimson)',
    iconColor: '#f44336',
    iconPath: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  info: {
    borderColor: 'var(--color-gold)',
    iconColor: '#c9a84c',
    iconPath: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  warning: {
    borderColor: '#ff9800',
    iconColor: '#ff9800',
    iconPath: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z',
  },
};

export function Toast({ message, type = 'info' }: ToastProps) {
  const config = toastConfig[type];

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '14px 18px',
      background: 'rgba(8, 24, 21, 0.95)',
      border: `1px solid ${config.borderColor}`,
      borderLeft: `3px solid ${config.borderColor}`,
      borderRadius: '8px',
      color: 'var(--color-ivory)',
      fontFamily: 'var(--font-body)',
      fontSize: '0.85rem',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      backdropFilter: 'blur(12px)',
    }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
        <path d={config.iconPath} stroke={config.iconColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {message}
    </div>
  );
}