import React, { useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import PlaylistList from '../components/PlaylistList';
import AlbumGrid from '../components/AlbumGrid';
import TrackList from '../components/TrackList';
import { usePagination } from '../hooks/usePagination';

/**
 * PUBLIC_INTERFACE
 * Library: User's saved playlists, albums and liked songs.
 */
export default function Library() {
  const { api } = useAuth();

  const fetchPlaylists = useCallback(
    async ({ page, pageSize, signal }) => {
      const res = await api.get(`/me/playlists?page=${page}&limit=${pageSize}`, { signal });
      return normalizeList(res.data);
    },
    [api]
  );
  const playlists = usePagination(fetchPlaylists, { pageSize: 12 });

  const fetchAlbums = useCallback(
    async ({ page, pageSize, signal }) => {
      const res = await api.get(`/me/albums?page=${page}&limit=${pageSize}`, { signal });
      return normalizeList(res.data);
    },
    [api]
  );
  const albums = usePagination(fetchAlbums, { pageSize: 12 });

  const fetchTracks = useCallback(
    async ({ page, pageSize, signal }) => {
      const res = await api.get(`/me/tracks?page=${page}&limit=${pageSize}`, { signal });
      return normalizeList(res.data);
    },
    [api]
  );
  const tracks = usePagination(fetchTracks, { pageSize: 20 });

  return (
    <div className="page">
      <h1 className="page-title">Your Library</h1>
      <p className="page-desc">Playlists, albums, and liked songs.</p>

      <section style={{ marginTop: 16 }}>
        <div style={sectionHeader}><h2 style={h2}>Playlists</h2></div>
        <PlaylistList
          playlists={playlists.items}
          loading={playlists.loading && playlists.items.length === 0}
          onSelect={() => {}}
        />
        {playlists.error && <div role="alert" style={{ color: 'var(--error)' }}>{playlists.error}</div>}
      </section>

      <section style={{ marginTop: 16 }}>
        <div style={sectionHeader}><h2 style={h2}>Albums</h2></div>
        <AlbumGrid
          albums={albums.items}
          loading={albums.loading && albums.items.length === 0}
          onSelect={() => {}}
        />
        {albums.error && <div role="alert" style={{ color: 'var(--error)' }}>{albums.error}</div>}
      </section>

      <section style={{ marginTop: 16 }}>
        <div style={sectionHeader}><h2 style={h2}>Liked Songs</h2></div>
        <TrackList
          tracks={tracks.items}
          loading={tracks.loading && tracks.items.length === 0}
          onPlay={() => {}}
          onAddToPlaylist={() => {}}
        />
        {tracks.error && <div role="alert" style={{ color: 'var(--error)' }}>{tracks.error}</div>}
      </section>
    </div>
  );
}

function normalizeList(data) {
  if (!data) return { items: [], total: undefined };
  if (Array.isArray(data)) return { items: data, total: undefined };
  if (Array.isArray(data.items)) return { items: data.items, total: data.total };
  return { items: [], total: undefined };
}

const sectionHeader = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 };
const h2 = { margin: 0, fontSize: 18 };
