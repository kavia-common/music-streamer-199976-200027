import React, { useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import PlaylistList from '../components/PlaylistList';
import AlbumGrid from '../components/AlbumGrid';
import TrackList from '../components/TrackList';
import { usePagination } from '../hooks/usePagination';
import { usePlayer } from '../state/playerStore';
import EmptyState from '../components/EmptyState';

/**
 * PUBLIC_INTERFACE
 * Library: User's saved playlists, albums and liked songs.
 */
export default function Library() {
  const { api } = useAuth();
  const { playTrack } = usePlayer();

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
        {(!playlists.loading && playlists.items.length === 0) ? (
          <EmptyState
            title="No playlists yet"
            description="Create a playlist to save your favorite tracks."
            action={
              <a
                href="/playlists"
                style={{
                  background: '#2563EB',
                  color: '#fff',
                  padding: '0.6rem 0.9rem',
                  borderRadius: 8,
                  textDecoration: 'none',
                  fontWeight: 700,
                  boxShadow: '0 8px 20px rgba(37,99,235,0.25)'
                }}
              >
                Create or view playlists
              </a>
            }
          />
        ) : (
          <PlaylistList
            playlists={playlists.items}
            loading={playlists.loading && playlists.items.length === 0}
            onSelect={() => {}}
          />
        )}
        {playlists.error && <div role="alert" style={{ color: 'var(--error)' }}>{playlists.error}</div>}
      </section>

      <section style={{ marginTop: 16 }}>
        <div style={sectionHeader}><h2 style={h2}>Albums</h2></div>
        {(!albums.loading && albums.items.length === 0) ? (
          <EmptyState
            title="No saved albums"
            description="Save albums you love to quickly find them here."
            action={
              <a
                href="/browse"
                style={{
                  background: '#2563EB',
                  color: '#fff',
                  padding: '0.6rem 0.9rem',
                  borderRadius: 8,
                  textDecoration: 'none',
                  fontWeight: 700,
                  boxShadow: '0 8px 20px rgba(37,99,235,0.25)'
                }}
              >
                Discover albums
              </a>
            }
          />
        ) : (
          <AlbumGrid
            albums={albums.items}
            loading={albums.loading && albums.items.length === 0}
            onSelect={() => {}}
          />
        )}
        {albums.error && <div role="alert" style={{ color: 'var(--error)' }}>{albums.error}</div>}
      </section>

      <section style={{ marginTop: 16 }}>
        <div style={sectionHeader}><h2 style={h2}>Liked Songs</h2></div>
        {(!tracks.loading && tracks.items.length === 0) ? (
          <EmptyState
            title="No liked songs"
            description="Like songs to build your collection."
            action={
              <a
                href="/browse"
                style={{
                  background: '#2563EB',
                  color: '#fff',
                  padding: '0.6rem 0.9rem',
                  borderRadius: 8,
                  textDecoration: 'none',
                  fontWeight: 700,
                  boxShadow: '0 8px 20px rgba(37,99,235,0.25)'
                }}
              >
                Explore tracks
              </a>
            }
          />
        ) : (
          <TrackList
            tracks={tracks.items}
            loading={tracks.loading && tracks.items.length === 0}
            onPlay={(t) => playTrack(mapTrack(t))}
            onAddToPlaylist={() => {}}
          />
        )}
        {tracks.error && <div role="alert" style={{ color: 'var(--error)' }}>{tracks.error}</div>}
      </section>
    </div>
  );
}

function mapTrack(t) {
  return { ...t, audioUrl: t.audioUrl || t.streamUrl || t.url || t.src };
}

function normalizeList(data) {
  if (!data) return { items: [], total: undefined };
  if (Array.isArray(data)) return { items: data, total: undefined };
  if (Array.isArray(data.items)) return { items: data.items, total: data.total };
  return { items: [], total: undefined };
}

const sectionHeader = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 };
const h2 = { margin: 0, fontSize: 18 };
