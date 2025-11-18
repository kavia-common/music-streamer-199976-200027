import React from 'react';

/**
 * PUBLIC_INTERFACE
 * EmptyState is a reusable component to display an empty or no-data state.
 * Props:
 * - title: string heading
 * - description: string explanatory text
 * - icon: optional ReactNode for a custom icon
 * - action: optional ReactNode for action button(s)
 */
export default function EmptyState({ title = 'Nothing to see here', description = 'There is currently no content to display.', icon, action }) {
  const gradient = 'linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(249,250,251,1) 100%)';
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        width: '100%',
        minHeight: '40vh',
        display: 'grid',
        placeItems: 'center',
        padding: '2rem',
        background: gradient,
        borderRadius: 12,
      }}
    >
      <div
        style={{
          textAlign: 'center',
          background: '#ffffff',
          borderRadius: 12,
          boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
          border: '1px solid rgba(17,24,39,0.06)',
          padding: '2rem',
          maxWidth: 640,
          width: '100%'
        }}
      >
        <div style={{ display: 'grid', placeItems: 'center', marginBottom: '0.75rem' }}>
          <div
            aria-hidden="true"
            style={{
              width: 56,
              height: 56,
              borderRadius: 12,
              background: 'rgba(37,99,235,0.1)',
              color: '#2563EB',
              display: 'grid',
              placeItems: 'center',
              boxShadow: 'inset 0 0 0 1px rgba(37,99,235,0.15)'
            }}
          >
            {icon || (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 5h16v2H4zm0 6h16v2H4zm0 6h10v2H4z" />
              </svg>
            )}
          </div>
        </div>
        <h3 style={{ margin: '0.25rem 0', fontSize: '1.125rem', color: '#111827', fontWeight: 700 }}>{title}</h3>
        <p style={{ margin: 0, color: '#4B5563' }}>{description}</p>
        {action ? <div style={{ marginTop: '0.9rem' }}>{action}</div> : null}
      </div>
    </div>
  );
}
