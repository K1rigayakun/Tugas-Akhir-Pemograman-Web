import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'emerald';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const sizeStyles: Record<'sm' | 'md' | 'lg', React.CSSProperties> = {
  sm: { padding: '6px 14px', fontSize: '0.75rem' },
  md: { padding: '10px 22px', fontSize: '0.85rem' },
  lg: { padding: '14px 32px', fontSize: '0.95rem' },
};

const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    background: 'var(--color-gold)',
    color: 'var(--color-bg-dark)',
    border: 'none',
  },
  secondary: {
    background: 'transparent',
    color: 'var(--color-gold)',
    border: '1px solid var(--color-gold)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--color-ivory)',
    border: '1px solid rgba(245,240,232,0.15)',
  },
  danger: {
    background: 'var(--color-crimson)',
    color: 'var(--color-ivory)',
    border: 'none',
  },
  emerald: {
    background: 'linear-gradient(135deg, #059669, #10b981)',
    color: '#ffffff',
    border: 'none',
    boxShadow: '0 0 12px rgba(16,185,129,0.3)',
  },
};

export function Button({ variant = 'primary', size = 'md', children, className = '', style, ...props }: ButtonProps) {
  const baseStyle: React.CSSProperties = {
    fontFamily: 'var(--font-subheading)',
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    ...sizeStyles[size],
    ...variantStyles[variant],
    ...style,
  };

  return (
    <button
      className={className}
      style={baseStyle}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        if (variant === 'emerald') {
          e.currentTarget.style.boxShadow = '0 0 24px rgba(16,185,129,0.5)';
        } else if (variant === 'primary') {
          e.currentTarget.style.boxShadow = '0 0 20px rgba(201,168,76,0.4)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = variantStyles[variant].boxShadow as string || 'none';
      }}
      {...props}
    >
      {children}
    </button>
  );
}