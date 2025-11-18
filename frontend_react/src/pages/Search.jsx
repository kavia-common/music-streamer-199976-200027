import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import AlbumGrid from '../components/AlbumGrid';
import TrackList from '../components/TrackList';
import ArtistRow from '../components/ArtistRow';
import Skeleton from '../components/ui/Skeleton';

/**
 * PUBLIC_INTERFACE
 * Search: Search for tracks, albums, and artists.
 */
export default function Search() {
  const { api } = useAuth();
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({ tracks: [], albums: [], artists: [] });
  const [error, setError] = useState('');

  const canSearch = useMemo(() => q.trim().length >= 2, [q]);

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

  useEffect(() => {
    const t = setTimeout(() => {
      if (canSearch) onSubmit();
    }, 300);
    return () => clearTimeout(t);
  }, [q, canSearch, onSubmit]);

  return (
    <div className="page">
      <h1 className="page-title">Search</h1>
      <p className="page-desc">Find songs, albums and artists.</p>

      <form onSubmit={onSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8, marginTop: 12 }}>
        <Input
          placeholder="Search for songs, artists, or albums"
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

      <section style={{ marginTop: 16 }}>
        <h2 style={{ margin: 0, fontSize: 18 }}>Tracks</h2>
        {loading && results.tracks.length === 0 ? (
          <div style={{ marginTop: 8 }}>
            <TrackList tracks={[]} loading />
          </div>
        ) : (
          <div style={{ marginTop: 8 }}>
            <TrackList tracks={results.tracks} onPlay={() => {}} onAddToPlaylist={() => {}} />
          </div>
        )}
      </section>

      <section style={{ marginTop: 16 }}>
        <h2 style={{ margin: 0, fontSize: 18 }}>Albums</h2>
        {loading && results.albums.length === 0 ? (
          <div style={{ marginTop: 8, display: 'grid', gap: 12 }}>
            <Skeleton width="100%" height={180} />
          </div>
        ) : (
          <div style={{ marginTop: 8 }}>
            <AlbumGrid albums={results.albums} onSelect={() => {}} />
          </div>
        )}
      </section>

      <section style={{ marginTop: 16 }}>
        <h2 style={{ margin: 0, fontSize: 18 }}>Artists</h2>
        {loading && results.artists.length === 0 ? (
          <div style={{ marginTop: 8 }}>
            <ArtistRow artists={[]} loading />
          </div>
        ) : (
          <div style={{ marginTop: 8 }}>
            <ArtistRow artists={results.artists} onSelect={() => {}} />
          </div>
        )}
      </section>
    </div>
  );
}

function toArray(x) {
  return Array.isArray(x) ? x : Array.isArray(x?.items) ? x.items : [];
}
