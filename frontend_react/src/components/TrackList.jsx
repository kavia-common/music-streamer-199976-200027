import React from 'react';
import Skeleton from './ui/Skeleton';
import Button from './ui/Button';

/**
 * PUBLIC_INTERFACE
 * TrackList: Renders a list of tracks with basic metadata and actions.
 * Props:
 * - tracks: Array<{ id, title, artist, duration, albumArt }>
 * - loading: boolean
 * - onPlay: (track) => void
 * - onAddToPlaylist: (track) => void
 */
export default function TrackList({ tracks = [], loading = false, onPlay, onAddToPlaylist }) {
  if (loading && (!tracks || tracks.length === 0)) {
    return (
      <div role="status" aria-busy="true" style={{ display: 'grid', gap: 10 }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '48px 1fr auto', gap: 12, alignItems: 'center' }}>
            <Skeleton width={48} height={48} radius="8px" />
            <div>
              <Skeleton width="60%" height={14} />
              <div style={{ height: 6 }} />
              <Skeleton width="30%" height={12} />
            </div>
            <Skeleton width={120} height={32} radius="10px" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      {tracks.map((t) => (
        <div
          key={t.id}
          className="u-card"
          style={{
            display: 'grid',
            gridTemplateColumns: '48px 1fr auto',
            alignItems: 'center',
            gap: 12,
            padding: 8,
          }}
        >
          <div
            aria-hidden="true"
            style={{
              width: 48,
              height: 48,
              borderRadius: 8,
              overflow: 'hidden',
              background: 'linear-gradient(135deg, var(--primary-600), var(--primary-200))',
              display: 'grid',
              placeItems: 'center',
              color: '#fff',
              fontWeight: 700,
              border: '1px solid var(--border)',
            }}
          >
            {t.albumArt ? (
              // eslint-disable-next-line jsx-a11y/alt-text
              <img src={t.albumArt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              '♪'
            )}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {t.title}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {t.artist} {t.duration ? '• ' + formatDuration(t.duration) : null}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button size="sm" onClick={() => onPlay?.(t)}>
              Play
            </Button>
            <Button size="sm" variant="outline" onClick={() => onAddToPlaylist?.(t)}>
              + Playlist
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

function formatDuration(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}
