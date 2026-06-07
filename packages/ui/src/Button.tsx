import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: React.ReactNode;
}

export function Button({ variant = 'primary', children, className = '', ...props }: ButtonProps) {
  const base = 'px-6 py-2 font-semibold transition-all duration-200 cursor-pointer rounded';
  const variants: Record<ButtonVariant, string> = {
    primary:   'bg-[var(--color-gold)] text-[var(--color-bg-dark)] hover:bg-[var(--color-gold-bright)]',
    secondary: 'border border-[var(--color-gold)] text-[var(--color-gold)] hover:bg-[var(--color-gold)] hover:text-[var(--color-bg-dark)]',
    ghost:     'text-[var(--color-ivory)] hover:text-[var(--color-gold)]',
    danger:    'bg-[var(--color-crimson)] text-[var(--color-ivory)] hover:opacity-80',
  };
  return <button className={`${base} ${variants[variant]} ${className}`} {...props}>{children}</button>;
}