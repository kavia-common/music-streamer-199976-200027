import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import AlbumGrid from '../components/AlbumGrid';
import TrackList from '../components/TrackList';
import ArtistRow from '../components/ArtistRow';
import Skeleton from '../components/ui/Skeleton';
import { ResultsTab, TabBar } from '../components/Tabs';
import { usePlayer } from '../state/playerStore';
import CommandPalette from '../components/CommandPalette';

/**
 * PUBLIC_INTERFACE
 * Search: Search for tracks, albums, artists, and playlists with debounced API calls and tabbed results.
 */
export default function Search() {
  const { api } = useAuth();
  const navigate = useNavigate();
  const { playTrack } = usePlayer();
  const [params, setParams] = useSearchParams();

  // Initial state from URL (q and tab)
  const initialQ = params.get('q') || '';
  const initialTab = params.get('tab') || 'tracks';

  const [q, setQ] = useState(initialQ);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({ tracks: [], albums: [], artists: [], playlists: [] });
  const [error, setError] = useState('');

  const canSearch = useMemo(() => q.trim().length >= 2, [q]);

  // Keep URL in sync
  useEffect(() => {
    const next = new URLSearchParams(params);
    if (q) next.set('q', q);
    else next.delete('q');
    if (activeTab) next.set('tab', activeTab);
    setParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, activeTab]);

  // Submit handler
  const onSubmit = useCallback(
    async (e) => {
      e?.preventDefault?.();
      if (!canSearch) return;
      setLoading(true);
      setError('');
      try {
        const res = await api.get(`/search?q=${encodeURIComponent(q.trim())}`);
        const data = res.data || {};
        setResults({
          tracks: toArray(data.tracks),
          albums: toArray(data.albums),
          artists: toArray(data.artists),
          playlists: toArray(data.playlists),
        });
      } catch (err) {
        const message = err?.data?.message || err?.message || 'Search failed.';
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [api, q, canSearch]
  );

  // Debounce calls
  useEffect(() => {
    if (!canSearch) {
      setResults({ tracks: [], albums: [], artists: [], playlists: [] });
      setLoading(false);
      setError('');
      return;
    }
    const t = setTimeout(() => {
      onSubmit();
    }, 300);
    return () => clearTimeout(t);
  }, [q, canSearch, onSubmit]);

  // Tab definition
  const tabs = useMemo(
    () => [
      { key: 'tracks', label: 'Tracks', count: results.tracks.length || undefined },
      { key: 'artists', label: 'Artists', count: results.artists.length || undefined },
      { key: 'albums', label: 'Albums', count: results.albums.length || undefined },
      { key: 'playlists', label: 'Playlists', count: results.playlists.length || undefined },
    ],
    [results.albums.length, results.artists.length, results.playlists.length, results.tracks.length]
  );

  // Handlers
  const onPickTrack = (t) => playTrack(mapTrack(t));
  const onPickPlaylist = (p) => {
    if (!p?.id) return;
    navigate(`/playlists/${encodeURIComponent(p.id)}`);
  };

  return (
    <div className="page">
      <h1 className="page-title">Search</h1>
      <p className="page-desc">Find songs, artists, albums, and playlists.</p>

      {/* Optional command palette; opens with Cmd/Ctrl+K */}
      <CommandPalette enabled />

      <form onSubmit={onSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8, marginTop: 12 }}>
        <Input
          placeholder="Search for songs, artists, albums, or playlists"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search query"
        />
        <Button type="submit" disabled={!canSearch} loading={loading}>
          Search
        </Button>
      </form>
      {error && (
        <div role="alert" style={{ color: 'var(--error)', marginTop: 8 }}>
          {error}
        </div>
      )}

      <div style={{ marginTop: 12 }}>
        <TabBar tabs={tabs} active={activeTab} onChange={setActiveTab} />
      </div>

      {/* Tracks */}
      {activeTab === 'tracks' && (
        <ResultsTab>
          {loading && results.tracks.length === 0 ? (
            <div style={{ marginTop: 8 }}>
              <TrackList tracks={[]} loading />
            </div>
          ) : (
            <div style={{ marginTop: 8 }}>
              <TrackList tracks={results.tracks} onPlay={onPickTrack} onAddToPlaylist={() => {}} />
            </div>
          )}
        </ResultsTab>
      )}

      {/* Artists */}
      {activeTab === 'artists' && (
        <ResultsTab>
          {loading && results.artists.length === 0 ? (
            <div style={{ marginTop: 8 }}>
              <ArtistRow artists={[]} loading />
            </div>
          ) : (
            <div style={{ marginTop: 8 }}>
              <ArtistRow artists={results.artists} onSelect={() => {}} />
            </div>
          )}
        </ResultsTab>
      )}

      {/* Albums */}
      {activeTab === 'albums' && (
        <ResultsTab>
          {loading && results.albums.length === 0 ? (
            <div style={{ marginTop: 8, display: 'grid', gap: 12 }}>
              <Skeleton width="100%" height={180} />
            </div>
          ) : (
            <div style={{ marginTop: 8 }}>
              <AlbumGrid albums={results.albums} onSelect={() => {}} />
            </div>
          )}
        </ResultsTab>
      )}

      {/* Playlists */}
      {activeTab === 'playlists' && (
        <ResultsTab>
          {loading && results.playlists.length === 0 ? (
            <div style={{ marginTop: 8, display: 'grid', gap: 12 }}>
              <Skeleton width="100%" height={120} />
            </div>
          ) : results.playlists.length === 0 ? (
            <div className="u-card" style={{ padding: 12, color: 'var(--text-muted)' }}>
              No playlists found.
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 10, marginTop: 8 }}>
              {results.playlists.map((p, i) => (
                <button
                  key={p.id || i}
                  className="u-interactive"
                  onClick={() => onPickPlaylist(p)}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '48px 1fr auto',
                    alignItems: 'center',
                    gap: 12,
                    padding: 10,
                    borderRadius: 12,
                    border: '1px solid var(--border)',
                    background: 'var(--surface)',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <div
                    aria-hidden="true"
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 8,
                      overflow: 'hidden',
                      background: 'linear-gradient(135deg, var(--secondary-500), var(--secondary-200))',
                      display: 'grid',
                      placeItems: 'center',
                      color: '#fff',
                      fontWeight: 700,
                      border: '1px solid var(--border)',
                    }}
                  >
                    {p.cover ? (
                      // eslint-disable-next-line jsx-a11y/alt-text
                      <img src={p.cover} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      '🎵'
                    )}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {p.name || 'Playlist'}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {(p.tracksCount || p.count || 0) + ' tracks'}
                    </div>
                  </div>
                  <span aria-hidden="true" style={{ color: 'var(--text-muted)' }}>›</span>
                </button>
              ))}
            </div>
          )}
        </ResultsTab>
      )}
    </div>
  );
}

function toArray(x) {
  return Array.isArray(x) ? x : Array.isArray(x?.items) ? x.items : [];
}
function mapTrack(t) {
  return { ...t, audioUrl: t.audioUrl || t.streamUrl || t.url || t.src };
}
