import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Skeleton from '../components/ui/Skeleton';

/**
 * PUBLIC_INTERFACE
 * Callback: Handles OAuth redirect callback flow.
 * - Reads code and state from URL params.
 * - Exchanges code for token via api.post to an abstract path.
 * - On success, saves token/user, then redirects to intended path or home.
 */

// PUBLIC_INTERFACE
export default function Callback({ exchangePath = '/auth/oauth/callback' }) {
  /** Handles OAuth callback code exchange. */
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { api, login } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    async function run() {
      const code = params.get('code');
      const state = params.get('state');
      const redirect = params.get('redirect') || '/';
      if (!code) {
        setError('Missing authorization code in callback.');
        return;
      }
      try {
        const res = await api.post(exchangePath, { code, state });
        const { token, user } = res.data || {};
        if (!token) throw new Error('Invalid response from server: missing token');
        if (!active) return;
        login(token, user);
        navigate(redirect, { replace: true });
      } catch (err) {
        if (!active) return;
        const message = err?.data?.message || err?.message || 'Authentication failed.';
        setError(message);
      }
    }
    run();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <div className="page" style={{ maxWidth: 520, margin: '32px auto' }}>
        <h1 className="page-title">Authentication Error</h1>
        <p className="page-desc" style={{ color: 'var(--error)' }}>{error}</p>
      </div>
    );
  }

  return (
    <div className="page" style={{ maxWidth: 520, margin: '32px auto' }}>
      <h1 className="page-title">Signing you in…</h1>
      <p className="page-desc">Please wait while we complete your sign-in.</p>
      <div style={{ display: 'grid', gap: 8, marginTop: 16 }}>
        <Skeleton height={16} />
        <Skeleton height={16} />
        <Skeleton height={16} />
      </div>
    </div>
  );
}
