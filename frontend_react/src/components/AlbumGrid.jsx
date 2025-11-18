import React from 'react';
import Card from './ui/Card';
import Skeleton from './ui/Skeleton';

/**
 * PUBLIC_INTERFACE
 * AlbumGrid: Renders albums in a responsive grid.
 * Props:
 * - albums: Array<{ id, title, artist, cover }>
 * - loading: boolean
 * - onSelect: (album) => void
 */
export default function AlbumGrid({ albums = [], loading = false, onSelect }) {
  if (loading && (!albums || albums.length === 0)) {
    return (
      <div role="status" aria-busy="true" style={gridStyle}>
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} hover>
            <Skeleton width="100%" height={140} radius="12px" />
            <div style={{ height: 10 }} />
            <Skeleton width="70%" height={14} />
            <div style={{ height: 6 }} />
            <Skeleton width="40%" height={12} />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div style={gridStyle}>
      {albums.map((a) => (
        <Card
          key={a.id}
          hover
          onClick={() => onSelect?.(a)}
          className="u-interactive"
          style={{ cursor: 'pointer' }}
        >
          <div
            style={{
              width: '100%',
              height: 160,
              borderRadius: 12,
              overflow: 'hidden',
              background: 'linear-gradient(135deg, var(--primary-600), var(--primary-200))',
              border: '1px solid var(--border)',
            }}
          >
            {a.cover ? (
              // eslint-disable-next-line jsx-a11y/alt-text
              <img src={a.cover} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : null}
          </div>
          <div style={{ height: 8 }} />
          <div style={{ fontWeight: 700 }}>{a.title}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{a.artist}</div>
        </Card>
      ))}
    </div>
  );
}

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
  gap: 12,
};
