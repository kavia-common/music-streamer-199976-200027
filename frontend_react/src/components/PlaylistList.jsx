import React from 'react';
import Skeleton from './ui/Skeleton';
import Card from './ui/Card';

/**
 * PUBLIC_INTERFACE
 * PlaylistList: Displays a grid/list of playlists.
 * Props:
 * - playlists: Array<{ id, name, cover, tracksCount }>
 * - loading: boolean
 * - onSelect: (playlist) => void
 */
export default function PlaylistList({ playlists = [], loading = false, onSelect }) {
  if (loading && (!playlists || playlists.length === 0)) {
    return (
      <div role="status" aria-busy="true" style={gridStyle}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} hover>
            <Skeleton width="100%" height={120} radius="12px" />
            <div style={{ height: 10 }} />
            <Skeleton width="60%" height={14} />
            <div style={{ height: 6 }} />
            <Skeleton width="30%" height={12} />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div style={gridStyle}>
      {playlists.map((p) => (
        <Card
          key={p.id}
          hover
          onClick={() => onSelect?.(p)}
          className="u-interactive"
          style={{ cursor: 'pointer' }}
        >
          <div
            style={{
              width: '100%',
              height: 140,
              borderRadius: 12,
              overflow: 'hidden',
              background: 'linear-gradient(135deg, var(--secondary-500), var(--secondary-200))',
              border: '1px solid var(--border)',
            }}
          >
            {p.cover ? (
              // eslint-disable-next-line jsx-a11y/alt-text
              <img src={p.cover} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : null}
          </div>
          <div style={{ height: 8 }} />
          <div style={{ fontWeight: 700 }}>{p.name}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.tracksCount || 0} tracks</div>
        </Card>
      ))}
    </div>
  );
}

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
  gap: 12,
};
