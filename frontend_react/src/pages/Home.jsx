import React, { useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import AlbumGrid from '../components/AlbumGrid';
import ArtistRow from '../components/ArtistRow';
import TrackList from '../components/TrackList';
import Button from '../components/ui/Button';
import { usePagination, useInfiniteScroll } from '../hooks/usePagination';
import { usePlayer } from '../state/playerStore';

/**
 * PUBLIC_INTERFACE
 * Home: Discovery landing showing featured albums, trending artists, and new tracks.
 * Fetches data via api client against placeholder endpoints.
 */
export default function Home() {
  const { api } = useAuth();
  const { playTrack } = usePlayer();

  const fetchAlbums = useCallback(
    async ({ page, pageSize, signal }) => {
      const res = await api.get(`/albums/featured?page=${page}&limit=${pageSize}`, { signal });
      return normalizeList(res.data);
    },
    [api]
  );
  const albums = usePagination(fetchAlbums, { pageSize: 8 });

  const fetchArtists = useCallback(
    async ({ page, pageSize, signal }) => {
      const res = await api.get(`/artists/trending?page=${page}&limit=${pageSize}`, { signal });
      return normalizeList(res.data);
    },
    [api]
  );
  const artists = usePagination(fetchArtists, { pageSize: 10 });

  const fetchTracks = useCallback(
    async ({ page, pageSize, signal }) => {
      const res = await api.get(`/tracks/new?page=${page}&limit=${pageSize}`, { signal });
      return normalizeList(res.data);
    },
    [api]
  );
  const tracks = usePagination(fetchTracks, { pageSize: 10 });

  const { sentinelRef } = useInfiniteScroll(() => {
    if (!tracks.loading && tracks.hasMore) {
      tracks.loadMore();
    }
  });

  return (
    <div className="page">
      <h1 className="page-title">Welcome to Oceanify</h1>
      <p className="page-desc">Discover featured albums, trending artists, and new tracks.</p>

      <section style={{ marginTop: 16 }}>
        <div style={sectionHeader}>
          <h2 style={h2}>Featured Albums</h2>
          <Button size="sm" variant="outline" onClick={() => albums.refresh()}>
            Refresh
          </Button>
        </div>
        <AlbumGrid
          albums={albums.items}
          loading={albums.loading && albums.items.length === 0}
          onSelect={() => {}}
        />
      </section>

      <section style={{ marginTop: 24 }}>
        <div style={sectionHeader}>
          <h2 style={h2}>Trending Artists</h2>
          <Button size="sm" variant="outline" onClick={() => artists.refresh()}>
            Refresh
          </Button>
        </div>
        <ArtistRow
          artists={artists.items}
          loading={artists.loading && artists.items.length === 0}
          onSelect={() => {}}
        />
      </section>

      <section style={{ marginTop: 24 }}>
        <div style={sectionHeader}>
          <h2 style={h2}>New Tracks</h2>
          <Button size="sm" variant="outline" onClick={() => tracks.refresh()}>
            Refresh
          </Button>
        </div>
        <TrackList
          tracks={tracks.items}
          loading={tracks.loading && tracks.items.length === 0}
          onPlay={(t) => playTrack(mapTrack(t))}
          onAddToPlaylist={() => {}}
        />
        {tracks.error && (
          <div role="alert" style={{ color: 'var(--error)', marginTop: 8 }}>
            {tracks.error}
          </div>
        )}
        {tracks.hasMore && (
          <div ref={sentinelRef} style={{ height: 1 }} aria-hidden="true" />
        )}
        {tracks.loading && tracks.items.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <Button loading size="sm" variant="ghost">
              Loading more
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}

function mapTrack(t) {
  // normalize to include audioUrl where feasible; backend field name may vary
  return {
    ...t,
    audioUrl: t.audioUrl || t.streamUrl || t.url || t.src,
  };
}

function normalizeList(data) {
  if (!data) return { items: [], total: undefined };
  if (Array.isArray(data)) return { items: data, total: undefined };
  if (Array.isArray(data.items)) return { items: data.items, total: data.total };
  return { items: [], total: undefined };
}

const sectionHeader = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 8,
};

const h2 = { margin: 0, fontSize: 18 };
