import React, { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

/**
 * PUBLIC_INTERFACE
 * Signup: Create a new user account via abstracted api client path, then logs in.
 */

// PUBLIC_INTERFACE
export default function Signup({ signupPath = '/auth/signup' }) {
  /** Renders signup form and creates a new account. */
  const { api, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const redirectTo = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('redirect') || '/';
  }, [location.search]);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Call backend via abstract path; expected to return { token, user }
      const res = await api.post(signupPath, {
        name: form.name,
        email: form.email,
        password: form.password,
      });
      const { token, user } = res.data || {};
      if (!token) {
        throw new Error('Invalid response from server: missing token');
      }
      login(token, user);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      const message = err?.data?.message || err?.message || 'Signup failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page" style={{ maxWidth: 420, margin: '32px auto' }}>
      <h1 className="page-title">Create your account</h1>
      <p className="page-desc" style={{ marginBottom: 16 }}>
        Join Oceanify and start listening.
      </p>

      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
        <Input
          label="Name"
          name="name"
          placeholder="Your name"
          value={form.name}
          onChange={onChange}
          required
        />
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
          Sign Up
        </Button>
      </form>

      <div style={{ marginTop: 16, fontSize: 14 }}>
        Already have an account? <Link to="/login">Sign in</Link>
      </div>
    </div>
  );
}
