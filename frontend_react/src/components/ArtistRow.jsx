import React from 'react';
import Skeleton from './ui/Skeleton';

/**
 * PUBLIC_INTERFACE
 * ArtistRow: Horizontal scroll row of artists as chips/cards.
 * Props:
 * - artists: Array<{ id, name, avatar }>
 * - loading: boolean
 * - onSelect: (artist) => void
 */
export default function ArtistRow({ artists = [], loading = false, onSelect }) {
  if (loading && (!artists || artists.length === 0)) {
    return (
      <div role="status" aria-busy="true" style={rowStyle}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} style={chipStyle}>
            <Skeleton circle width={48} height={48} />
            <div style={{ width: 80, marginTop: 8 }}>
              <Skeleton width="100%" height={10} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={rowStyle}>
      {artists.map((a) => (
        <button
          key={a.id}
          className="u-interactive"
          onClick={() => onSelect?.(a)}
          style={{
            ...chipStyle,
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)',
            background: 'var(--surface)',
            cursor: 'pointer',
          }}
        >
          <div
            aria-hidden="true"
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              overflow: 'hidden',
              background: 'linear-gradient(135deg, var(--primary-600), var(--primary-200))',
              display: 'grid',
              placeItems: 'center',
              color: '#fff',
              fontWeight: 700,
            }}
          >
            {a.avatar ? (
              // eslint-disable-next-line jsx-a11y/alt-text
              <img src={a.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              a.name?.slice(0, 1)?.toUpperCase() || 'A'
            )}
          </div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{a.name}</div>
        </button>
      ))}
    </div>
  );
}

const rowStyle = {
  display: 'flex',
  alignItems: 'stretch',
  gap: 10,
  overflowX: 'auto',
  paddingBottom: 4,
};

const chipStyle = {
  display: 'grid',
  justifyItems: 'center',
  gap: 8,
  padding: 8,
  borderRadius: 12,
  minWidth: 110,
};
