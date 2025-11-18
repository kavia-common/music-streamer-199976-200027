import React from 'react';

/**
 * PUBLIC_INTERFACE
 * NotFound page shown for any unknown route (404).
 */
export default function NotFound() {
  const gradient = 'linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(249,250,251,1) 100%)';
  return (
    <main
      role="main"
      aria-label="Page not found"
      style={{
        minHeight: '70vh',
        display: 'grid',
        placeItems: 'center',
        padding: '2rem',
        background: gradient
      }}
    >
      <section
        aria-describedby="nf-desc"
        style={{
          width: '100%',
          maxWidth: 720,
          background: '#ffffff',
          borderRadius: 12,
          border: '1px solid rgba(17,24,39,0.06)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
          padding: '1.5rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.25rem' }}>
          <div
            aria-hidden="true"
            style={{
              width: 48,
              height: 48,
              display: 'grid',
              placeItems: 'center',
              borderRadius: 8,
              background: 'rgba(37,99,235,0.1)',
              color: '#2563EB'
            }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
          </div>
          <h1 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: '#111827' }}>
            404 — Page not found
          </h1>
        </div>
        <p id="nf-desc" style={{ margin: 0, color: '#374151' }}>
          The page you’re looking for doesn’t exist or was moved. You can navigate back home or explore other sections.
        </p>
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
          <a
            href="/"
            style={{
              background: '#2563EB',
              color: '#ffffff',
              padding: '0.6rem 0.9rem',
              borderRadius: 8,
              textDecoration: 'none',
              fontWeight: 700,
              boxShadow: '0 8px 20px rgba(37,99,235,0.25)'
            }}
          >
            Go home
          </a>
          <a
            href="/browse"
            style={{
              background: '#ffffff',
              color: '#2563EB',
              border: '1px solid rgba(37,99,235,0.25)',
              padding: '0.55rem 0.9rem',
              borderRadius: 8,
              textDecoration: 'none',
              fontWeight: 700
            }}
          >
            Explore music
          </a>
        </div>
      </section>
    </main>
  );
}
