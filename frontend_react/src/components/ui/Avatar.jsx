import React from 'react';

/**
 * PUBLIC_INTERFACE
 * Avatar: Circular user avatar with image or initials fallback and optional status.
 * Props:
 * - src: string (image url)
 * - alt: string
 * - name: string (used for initials)
 * - size: 'sm' | 'md' | 'lg'
 * - status: 'online' | 'offline' | undefined
 */
export default function Avatar({ src, alt = '', name = '', size = 'md', status, className = '', ...rest }) {
  const dim = { sm: 28, md: 36, lg: 48 }[size];
  const radius = '50%';

  const initials = (name || alt || 'U')
    .split(' ')
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <span
      className={className}
      style={{ position: 'relative', display: 'inline-flex', width: dim, height: dim }}
      {...rest}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          width={dim}
          height={dim}
          style={{
            width: dim,
            height: dim,
            borderRadius: radius,
            objectFit: 'cover',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-xs)',
            background:
              'linear-gradient(135deg, var(--primary-600), var(--primary-200))',
          }}
        />
      ) : (
        <span
          aria-hidden="true"
          style={{
            width: dim,
            height: dim,
            borderRadius: radius,
            display: 'inline-grid',
            placeItems: 'center',
            color: '#fff',
            fontWeight: 700,
            background:
              'linear-gradient(135deg, var(--primary-600), var(--primary-200))',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-xs)',
          }}
        >
          {initials}
        </span>
      )}
      {status && (
        <span
          aria-hidden="true"
          title={status}
          style={{
            position: 'absolute',
            right: 0,
            bottom: 0,
            width: Math.max(6, dim * 0.28),
            height: Math.max(6, dim * 0.28),
            borderRadius: '50%',
            background: status === 'online' ? '#22C55E' : '#9CA3AF',
            border: '2px solid var(--surface)',
            boxShadow: 'var(--shadow-xs)',
          }}
        />
      )}
    </span>
  );
}
