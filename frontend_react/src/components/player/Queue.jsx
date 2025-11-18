import React from 'react';
import { usePlayer } from '../../state/playerStore';

/**
 * PUBLIC_INTERFACE
 * Queue: Displays current play queue; allows jumping to a track.
 */
export default function Queue() {
  const { state, setQueue } = usePlayer();

  const onPick = (idx) => {
    setQueue({ list: state.queue, startIndex: idx, autoplay: true });
  };

  if (!state.queue?.length) {
    return (
      <div className="u-card" style={{ padding: 12, marginTop: 8 }}>
        <strong>Queue</strong>
        <div style={{ color: 'var(--text-muted)', marginTop: 6 }}>No tracks queued.</div>
      </div>
    );
  }

  return (
    <div className="u-card" style={{ padding: 12, marginTop: 8 }}>
      <strong>Up Next</strong>
      <div style={{ display: 'grid', gap: 6, marginTop: 8 }}>
        {state.queue.map((t, i) => {
          const active = i === state.currentIndex;
          return (
            <button
              key={t.id || i}
              onClick={() => onPick(i)}
              className="u-interactive"
              style={{
                display: 'grid',
                gridTemplateColumns: '1.5rem 1fr auto',
                gap: 8,
                padding: 8,
                borderRadius: 8,
                border: '1px solid var(--border)',
                background: active ? 'rgba(37,99,235,0.08)' : 'var(--surface)',
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              <span aria-hidden="true" style={{ opacity: 0.7 }}>{active ? '▶' : i + 1}</span>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                <span style={{ fontWeight: 700 }}>{t.title || 'Track'}</span>
                <span style={{ color: 'var(--text-muted)', marginLeft: 6 }}>{t.artist ? `• ${t.artist}` : ''}</span>
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{formatDuration(t.duration)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function formatDuration(sec) {
  const s = Math.max(0, Math.floor(Number(sec) || 0));
  const m = Math.floor(s / 60);
  const ss = String(s % 60).padStart(2, '0');
  return `${m}:${ss}`;
}
