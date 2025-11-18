import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Skeleton from './ui/Skeleton';
import Button from './ui/Button';

/**
 * PUBLIC_INTERFACE
 * CommandPalette: Lightweight Cmd+K launcher for quick navigation and search.
 * - Opens with Cmd/Ctrl + K
 * - Allows navigation to core routes and quick search across tracks/albums/artists.
 * - Uses existing api client; does not hardcode anything beyond relative placeholder endpoints.
 *
 * Props:
 * - enabled?: boolean (default true)
 */
export default function CommandPalette({ enabled = true }) {
  const { api } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({ tracks: [], artists: [], albums: [] });
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  // Keyboard shortcut to open/close
  useEffect(() => {
    if (!enabled) return;
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [enabled]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 0);
    } else {
      setQ('');
      setResults({ tracks: [], artists: [], albums: [] });
      setLoading(false);
      setError('');
    }
  }, [open]);

  // Debounced search
  useEffect(() => {
    if (!open) return;
    const qTrim = q.trim();
    if (qTrim.length < 2) {
      setResults({ tracks: [], artists: [], albums: [] });
      setLoading(false);
      setError('');
      return;
    }
    setLoading(true);
    setError('');
    const t = setTimeout(async () => {
      try {
        const res = await api.get(`/search?q=${encodeURIComponent(qTrim)}`);
        const data = res.data || {};
        setResults({
          tracks: toArray(data.tracks).slice(0, 5),
          albums: toArray(data.albums).slice(0, 5),
          artists: toArray(data.artists).slice(0, 5),
        });
      } catch (e) {
        setError(e?.data?.message || e?.message || 'Search failed.');
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [api, open, q]);

  const quickLinks = useMemo(
    () => [
      { label: 'Home', path: '/' },
      { label: 'Browse', path: '/browse' },
      { label: 'Search', path: '/search' },
      { label: 'Library', path: '/library' },
      { label: 'Playlists', path: '/playlists' },
    ],
    []
  );

  if (!enabled) return null;

  return createPortal(
    <div
      aria-hidden={!open}
      className="command-palette-root"
      style={{
        position: 'fixed',
        inset: 0,
        display: open ? 'grid' : 'none',
        placeItems: 'start center',
        paddingTop: '10vh',
        background: 'rgba(17,24,39,0.45)',
        zIndex: 100,
      }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="u-card"
        style={{
          width: 'min(720px, 92vw)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: 12, borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span aria-hidden="true" style={{ opacity: 0.7 }}>⌘</span>
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Type a command or search…"
            aria-label="Command input"
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              color: 'var(--text)',
              fontSize: 16,
            }}
          />
          <Button size="sm" variant="outline" onClick={() => setOpen(false)}>Close</Button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', padding: 12, gap: 8 }}>
          {!q && (
            <div>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Quick links</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {quickLinks.map((l) => (
                  <Button
                    key={l.path}
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      navigate(l.path);
                      setOpen(false);
                    }}
                  >
                    {l.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {q && (
            <>
              {loading ? (
                <div style={{ display: 'grid', gap: 8 }}>
                  <Skeleton height={14} />
                  <Skeleton height={14} />
                  <Skeleton height={14} />
                </div>
              ) : error ? (
                <div role="alert" style={{ color: 'var(--error)' }}>{error}</div>
              ) : (
                <div style={{ display: 'grid', gap: 12 }}>
                  <Section title="Tracks">
                    {results.tracks.length === 0 ? (
                      <Empty> No tracks </Empty>
                    ) : (
                      results.tracks.map((t, i) => (
                        <Row
                          key={t.id || i}
                          title={t.title || 'Track'}
                          subtitle={t.artist || ''}
                          onPick={() => {
                            // Navigate to search page with prefilled query for now
                            navigate(`/search?q=${encodeURIComponent(q)}`);
                            setOpen(false);
                          }}
                        />
                      ))
                    )}
                  </Section>
                  <Section title="Artists">
                    {results.artists.length === 0 ? (
                      <Empty> No artists </Empty>
                    ) : (
                      results.artists.map((a, i) => (
                        <Row
                          key={a.id || i}
                          title={a.name || 'Artist'}
                          onPick={() => {
                            navigate(`/search?q=${encodeURIComponent(q)}&tab=artists`);
                            setOpen(false);
                          }}
                        />
                      ))
                    )}
                  </Section>
                  <Section title="Albums">
                    {results.albums.length === 0 ? (
                      <Empty> No albums </Empty>
                    ) : (
                      results.albums.map((a, i) => (
                        <Row
                          key={a.id || i}
                          title={a.title || 'Album'}
                          subtitle={a.artist || ''}
                          onPick={() => {
                            navigate(`/search?q=${encodeURIComponent(q)}&tab=albums`);
                            setOpen(false);
                          }}
                        />
                      ))
                    )}
                  </Section>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>,
    document.body
  );
}

function Section({ title, children }) {
  return (
    <div>
      <div style={{ fontWeight: 700, marginBottom: 6 }}>{title}</div>
      <div style={{ display: 'grid', gap: 6 }}>{children}</div>
    </div>
  );
}
function Row({ title, subtitle, onPick }) {
  return (
    <button
      onClick={onPick}
      className="u-interactive"
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        alignItems: 'center',
        gap: 8,
        padding: 10,
        border: '1px solid var(--border)',
        borderRadius: '10px',
        background: 'var(--surface)',
        textAlign: 'left',
        cursor: 'pointer',
      }}
    >
      <div style={{ overflow: 'hidden' }}>
        <div style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
        {subtitle ? <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{subtitle}</div> : null}
      </div>
      <span aria-hidden="true" style={{ color: 'var(--text-muted)' }}>↵</span>
    </button>
  );
}
function Empty({ children }) {
  return <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>{children}</div>;
}

function toArray(x) {
  return Array.isArray(x) ? x : Array.isArray(x?.items) ? x.items : [];
}
