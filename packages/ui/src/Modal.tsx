'use client';

import React, { useEffect, useRef } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap: Record<'sm' | 'md' | 'lg', string> = {
  sm: '400px',
  md: '560px',
  lg: '720px',
};

export function Modal({ isOpen, onClose, children, title, size = 'md' }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Fade in overlay + scale up content
      const overlay = overlayRef.current;
      const content = contentRef.current;
      if (overlay) {
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity 0.3s ease';
        requestAnimationFrame(() => { overlay.style.opacity = '1'; });
      }
      if (content) {
        content.style.opacity = '0';
        content.style.transform = 'scale(0.95) translateY(10px)';
        content.style.transition = 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)';
        requestAnimationFrame(() => {
          content.style.opacity = '1';
          content.style.transform = 'scale(1) translateY(0)';
        });
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        ref={contentRef}
        style={{
          background: 'rgba(8, 24, 21, 0.95)',
          border: '1px solid rgba(201, 168, 76, 0.25)',
          borderRadius: '14px',
          padding: '28px',
          maxWidth: sizeMap[size],
          width: 'calc(100% - 32px)',
          maxHeight: '85vh',
          overflowY: 'auto',
          boxShadow: '0 24px 80px rgba(0,0,0,0.5), 0 0 40px rgba(201,168,76,0.08)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <h2 style={{
            fontFamily: 'var(--font-subheading)',
            color: 'var(--color-gold)',
            fontSize: '1.15rem',
            letterSpacing: '0.06em',
            marginBottom: '18px',
            paddingBottom: '12px',
            borderBottom: '1px solid rgba(201,168,76,0.15)',
          }}>
            {title}
          </h2>
        )}
        {children}
      </div>
    </div>
  );
}