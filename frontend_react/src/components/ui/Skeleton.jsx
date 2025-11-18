import React from 'react';

/**
 * PUBLIC_INTERFACE
 * Skeleton: Loading placeholder block or circle with shimmer.
 * Props:
 * - width, height: number | string (supports px or %)
 * - circle: boolean (render as circle if true)
 * - radius: CSS radius override
 */
export default function Skeleton({
  width = '100%',
  height = 12,
  circle = false,
  radius,
  style,
  className = '',
  ...rest
}) {
  const baseStyle = {
    width,
    height,
    borderRadius: circle ? '50%' : radius || 'var(--radius-sm)',
    background:
      'linear-gradient(90deg, var(--surface-2), #e5e7eb, var(--surface-2))',
    backgroundSize: '200% 100%',
    animation: 'ocean-shimmer 1.4s linear infinite',
    border: '1px solid var(--border)',
  };

  return (
    <>
      <div className={className} style={{ ...baseStyle, ...style }} {...rest} />
      <style>{`
        @keyframes ocean-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </>
  );
}
