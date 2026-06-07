import React from 'react';

export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-[var(--color-bg-deep)] rounded ${className}`} />
  );
}