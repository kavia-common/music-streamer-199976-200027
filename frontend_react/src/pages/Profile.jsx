import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import Avatar from '../components/ui/Avatar';
import Skeleton from '../components/ui/Skeleton';
import Button from '../components/ui/Button';

/**
 * PUBLIC_INTERFACE
 * Profile: Displays current user's profile information and basic stats.
 * - Fetches from /me and lightweight counts from /me/playlists & /me/tracks.
 * - Uses useAuth for api client and current user fallback.
 */
export default function Profile() {
  const { api, user: authUser, updateUser } = useAuth();

  const [user, setUser] = useState(authUser || null);
  const [loading, setLoading] = useState(!authUser);
  const [err, setErr] = useState('');

  const [stats, setStats] = useState({ playlists: undefined, liked: undefined, followers: undefined });

  useEffect(() => {
    let active = true;
    async function load() {
      if (!api) return;
      setLoading(true);
      setErr('');
      try {
        const res = await api.get('/me');
        const data = (res && res.data) || null;
        if (!active) return;
        setUser(data || authUser || null);
        // sync context user if backend returned richer info
        if (data && JSON.stringify(data) !== JSON.stringify(authUser)) {
          updateUser(data);
        }
      } catch (e) {
        if (!active) return;
        setErr(e?.data?.message || e?.message || 'Failed to load profile');
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api]);

  useEffect(() => {
    let active = true;
    async function loadCounts() {
      try {
        // playlists count
        const pl = await api.get('/me/playlists?page=1&limit=1');
        const plData = pl?.data;
        const playlistsCount = typeof plData?.total === 'number'
          ? plData.total
          : Array.isArray(plData)
            ? plData.length
            : Array.isArray(plData?.items)
              ? plData.items.length
              : undefined;

        // liked tracks count
        const lt = await api.get('/me/tracks?page=1&limit=1');
        const ltData = lt?.data;
        const likedCount = typeof ltData?.total === 'number'
          ? ltData.total
          : Array.isArray(ltData)
            ? ltData.length
            : Array.isArray(ltData?.items)
              ? ltData.items.length
              : undefined;

        if (!active) return;
        setStats((s) => ({ ...s, playlists: playlistsCount, liked: likedCount }));
      } catch {
        // ignore partial stats errors
      }
      try {
        const fo = await api.get('/me/followers/count'); // optional endpoint
        const followers = typeof fo?.data?.count === 'number' ? fo.data.count : undefined;
        if (!active) return;
        setStats((s) => ({ ...s, followers }));
      } catch {
        // ignore followers errors
      }
    }
    loadCounts();
    return () => { active = false; };
  }, [api]);

  const displayName = useMemo(() => user?.name || user?.displayName || user?.username || 'User', [user]);
  const emailOrHandle = useMemo(() => user?.email || user?.handle || user?.username || '', [user]);

  return (
    <div className="page">
      <h1 className="page-title">Your Profile</h1>
      <p className="page-desc">View your account information and activity.</p>

      <section className="u-card" style={{ marginTop: 12, padding: 16 }}>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: '64px 1fr auto', gap: 12, alignItems: 'center' }}>
            <Skeleton circle width={64} height={64} />
            <div>
              <Skeleton width="40%" height={16} />
              <div style={{ height: 6 }} />
              <Skeleton width="60%" height={12} />
            </div>
            <Skeleton width={120} height={36} />
          </div>
        ) : err ? (
          <div role="alert" style={{ color: 'var(--error)' }}>{err}</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '64px 1fr auto', gap: 12, alignItems: 'center' }}>
            <Avatar size="lg" name={displayName} src={user?.avatar || user?.image} alt={`${displayName} avatar`} />
            <div>
              <div style={{ fontWeight: 800, fontSize: 18 }}>{displayName}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>{emailOrHandle}</div>
            </div>
            <div>
              <Button as="a" href="/settings" variant="outline">Edit Settings</Button>
            </div>
          </div>
        )}
      </section>

      <section style={{ marginTop: 12, display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <StatCard title="Playlists" value={stats.playlists} />
        <StatCard title="Liked Tracks" value={stats.liked} />
        <StatCard title="Followers" value={stats.followers} />
      </section>

      {user?.bio && (
        <section className="u-card" style={{ marginTop: 12, padding: 16 }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>About</div>
          <p style={{ margin: 0, color: 'var(--text)' }}>{user.bio}</p>
        </section>
      )}
    </div>
  );
}

function StatCard({ title, value }) {
  const hasValue = typeof value === 'number';
  return (
    <div className="u-card" style={{ padding: 16, display: 'grid', gap: 4 }}>
      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{title}</div>
      {hasValue ? (
        <div style={{ fontSize: 24, fontWeight: 800 }}>{value}</div>
      ) : (
        <Skeleton width="40%" height={22} />
      )}
    </div>
  );
}
