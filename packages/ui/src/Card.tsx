import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-[var(--color-bg-mid)] border border-[var(--color-gold)]/20 rounded-lg p-4 ${className}`}>
      {children}
    </div>
  );
}