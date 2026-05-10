import { useState } from 'react';
import AuthLayout from './AuthLayout.jsx';

export default function LoginView({ onLogin, onSwitchToRegister }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!form.email.trim() || !form.password.trim()) {
      setError('Email and password are required.');
      return;
    }

    try {
      setLoading(true);
      await onLogin({ email: form.email.trim(), password: form.password });
    } catch (err) {
      setError(err.message || 'Unable to sign in right now.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Login"
      subtitle="Use your email ID and password to continue to your financial dashboard."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block text-sm font-semibold">
          Email ID
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            className="mt-2 w-full radius-pill border bg-transparent px-4 py-3 outline-none"
            style={{ borderColor: 'var(--border)' }}
            placeholder="you@example.com"
            autoComplete="email"
          />
        </label>

        <label className="block text-sm font-semibold">
          Password
          <input
            type="password"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            className="mt-2 w-full radius-pill border bg-transparent px-4 py-3 outline-none"
            style={{ borderColor: 'var(--border)' }}
            placeholder="Enter your password"
            autoComplete="current-password"
          />
        </label>

        {error ? (
          <p className="text-sm font-semibold" style={{ color: '#dc2626' }}>
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="pill-button w-full px-4 py-3 text-sm font-semibold"
          style={{ background: 'var(--ink)', color: 'var(--canvas)', opacity: loading ? 0.7 : 1 }}
        >
          {loading ? 'Signing in...' : 'Login'}
        </button>
      </form>

      <p className="mt-6 text-sm" style={{ color: 'var(--muted-ink)' }}>
        New here?{' '}
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="font-semibold"
          style={{ color: 'var(--signal)' }}
        >
          Create account
        </button>
      </p>
    </AuthLayout>
  );
}
