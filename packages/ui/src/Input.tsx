import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-[var(--color-ivory)] text-sm">{label}</label>}
      <input
        className={`bg-[var(--color-bg-deep)] border border-[var(--color-gold)]/30 text-[var(--color-ivory)] px-4 py-2 rounded focus:outline-none focus:border-[var(--color-gold)] ${className}`}
        {...props}
      />
    </div>
  );
}