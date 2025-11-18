import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

/**
 * PUBLIC_INTERFACE
 * Login: Allows a user to authenticate.
 * - Provides email/password login via api client (abstract path, caller supplies path).
 * - Provides OAuth login initiation by navigating to backend auth path (abstract path).
 * - On success, calls context.login(token, user) and redirects to original destination.
 *
 * Env/config:
 * - Uses api from AuthContext; do not hardcode URLs. Callers should pass the path(s) via props or default.
 */

// PUBLIC_INTERFACE
export default function Login({ emailPasswordPath = '/auth/login', oauthInitPath = '/auth/oauth/authorize' }) {
  /** Renders the login form and handles auth flows. */
  const { api, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Determine redirect URL after successful login
  const redirectTo = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('redirect') || '/';
  }, [location.search]);

  const onChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Call email/password login through api client; endpoint path is abstract and can be overridden.
      const res = await api.post(emailPasswordPath, { email: form.email, password: form.password });
      // Expect { token, user } from backend
      const { token, user } = res.data || {};
      if (!token) {
        throw new Error('Invalid response from server: missing token');
      }
      login(token, user);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      const message =
        (err && (err.data?.message || err.message)) ||
        'Login failed. Please check your credentials and try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const onOauth = () => {
    // For OAuth, navigate the browser to the backend's authorization endpoint.
    // Keep this abstract: callers can override oauthInitPath if needed.
    // Preserve redirect target through state parameter by appending current redirectTo as ?redirect=...
    const url = new URL(oauthInitPath, window.location.origin);
    const params = new URLSearchParams();
    params.set('redirect', redirectTo);
    // Optionally include a CSRF state if backend expects it (not implemented here).
    url.search = params.toString();
    window.location.assign(url.toString());
  };

  return (
    <div className="page" style={{ maxWidth: 420, margin: '32px auto' }}>
      <h1 className="page-title">Welcome back</h1>
      <p className="page-desc" style={{ marginBottom: 16 }}>
        Sign in to continue listening.
      </p>

      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
        <Input
          label="Email"
          name="email"
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={onChange}
          required
        />
        <Input
          label="Password"
          name="password"
          type="password"
          placeholder="••••••••"
          value={form.password}
          onChange={onChange}
          required
        />
        {error && (
          <div role="alert" style={{ color: 'var(--error)', fontSize: 13 }}>
            {error}
          </div>
        )}
        <Button type="submit" loading={loading}>
          Sign In
        </Button>
        <Button type="button" variant="outline" onClick={onOauth}>
          Continue with OAuth
        </Button>
      </form>

      <div style={{ marginTop: 16, fontSize: 14 }}>
        Don&apos;t have an account? <Link to="/signup">Sign up</Link>
      </div>
    </div>
  );
}
