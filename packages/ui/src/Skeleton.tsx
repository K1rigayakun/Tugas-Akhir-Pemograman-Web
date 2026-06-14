import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  variant?: 'rect' | 'circle' | 'text';
}

export function Skeleton({ className = '', width, height, variant = 'rect' }: SkeletonProps) {
  const baseStyle: React.CSSProperties = {
    width: width || '100%',
    height: height || (variant === 'text' ? '1em' : '100%'),
    borderRadius: variant === 'circle' ? '50%' : variant === 'text' ? '4px' : '8px',
    background: 'linear-gradient(90deg, rgba(13,59,46,0.3) 25%, rgba(201,168,76,0.08) 50%, rgba(13,59,46,0.3) 75%)',
    backgroundSize: '200% 100%',
    animation: 'skeleton-shimmer 1.8s ease-in-out infinite',
  };

  return (
    <>
      <div className={className} style={baseStyle} />
      <style>{`
        @keyframes skeleton-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </>
  );
}