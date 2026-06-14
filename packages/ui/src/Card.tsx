import React from 'react';

type CardVariant = 'default' | 'glass' | 'emerald' | 'elevated';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: CardVariant;
  hoverGlow?: boolean;
  style?: React.CSSProperties;
}

const variantStyles: Record<CardVariant, React.CSSProperties> = {
  default: {
    background: 'rgba(8, 24, 21, 0.84)',
    border: '1px solid rgba(201, 168, 76, 0.18)',
  },
  glass: {
    background: 'rgba(8, 24, 21, 0.5)',
    border: '1px solid rgba(201, 168, 76, 0.12)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
  },
  emerald: {
    background: 'rgba(16, 185, 129, 0.06)',
    border: '1px solid rgba(16, 185, 129, 0.18)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
  },
  elevated: {
    background: 'rgba(8, 24, 21, 0.92)',
    border: '1px solid rgba(201, 168, 76, 0.25)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
  },
};

export function Card({ children, className = '', variant = 'default', hoverGlow = false, style }: CardProps) {
  const baseStyle: React.CSSProperties = {
    borderRadius: '12px',
    padding: '20px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    ...variantStyles[variant],
    ...style,
  };

  return (
    <div
      className={className}
      style={baseStyle}
      onMouseEnter={hoverGlow ? (e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = variant === 'emerald'
          ? '0 8px 32px rgba(16,185,129,0.2)'
          : '0 8px 32px rgba(201,168,76,0.15)';
      } : undefined}
      onMouseLeave={hoverGlow ? (e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = variantStyles[variant].boxShadow as string || 'none';
      } : undefined}
    >
      {children}
    </div>
  );
}