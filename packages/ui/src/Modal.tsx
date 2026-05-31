'use client';

import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export function Modal({ isOpen, onClose, children, title }: ModalProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={onClose}>
      <div className="bg-[var(--color-bg-mid)] border border-[var(--color-gold)]/30 rounded-lg p-6 max-w-lg w-full mx-4" onClick={e => e.stopPropagation()}>
        {title && <h2 style={{ fontFamily: 'var(--font-subheading)', color: 'var(--color-gold)' }} className="text-xl mb-4">{title}</h2>}
        {children}
      </div>
    </div>
  );
}