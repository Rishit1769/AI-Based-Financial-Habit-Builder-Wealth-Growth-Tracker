import { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa6';
import AuthLayout from './AuthLayout.jsx';

const phoneRegex = /^\+?[0-9]{10,15}$/;

export default function RegisterView({ onRequestOtp, onSwitchToLogin }) {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!form.name.trim() || !form.phone.trim() || !form.email.trim() || !form.password.trim()) {
      setError('Name, phone number, email, and password are required.');
      return;
    }

    if (!phoneRegex.test(form.phone.trim())) {
      setError('Phone number must contain 10 to 15 digits, optionally starting with +.');
      return;
    }

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    try {
      setLoading(true);
      await onRequestOtp({
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        password: form.password,
      });
    } catch (err) {
      setError(err.message || 'Unable to send OTP right now.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Register"
      subtitle="Enter your name, phone number, email, and password. We will verify your email with a one-time OTP."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block text-sm font-semibold">
          Full Name
          <input
            type="text"
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            className="mt-2 w-full radius-pill border bg-transparent px-4 py-3 outline-none"
            style={{ borderColor: 'var(--border)' }}
            placeholder="Your full name"
            autoComplete="name"
          />
        </label>

        <label className="block text-sm font-semibold">
          Phone Number
          <input
            type="tel"
            value={form.phone}
            onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
            className="mt-2 w-full radius-pill border bg-transparent px-4 py-3 outline-none"
            style={{ borderColor: 'var(--border)' }}
            placeholder="+919999999999"
            autoComplete="tel"
          />
        </label>

        <label className="block text-sm font-semibold">
          Email
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
          <div
            className="mt-2 flex items-center gap-2 radius-pill border bg-transparent px-4"
            style={{ borderColor: 'var(--border)' }}
          >
            <input
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              className="w-full bg-transparent py-3 outline-none"
              placeholder="Minimum 8 characters"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="radius-circle flex h-8 w-8 items-center justify-center"
              style={{ color: 'var(--muted-ink)' }}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
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
          {loading ? 'Sending OTP...' : 'Continue to OTP'}
        </button>
      </form>

      <p className="mt-6 text-sm" style={{ color: 'var(--muted-ink)' }}>
        Already have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="font-semibold"
          style={{ color: 'var(--signal)' }}
        >
          Login
        </button>
      </p>
    </AuthLayout>
  );
}
