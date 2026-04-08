import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Mail, Lock, Wallet } from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}!`);
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: 'var(--bg)' }}
    >
      {/* Subtle background */}
      <div
        className="fixed top-0 right-0 w-96 h-96 rounded-full pointer-events-none opacity-10"
        style={{ background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)', filter: 'blur(100px)' }}
      />

      <div className="w-full max-w-sm relative z-10">
        {/* Brand */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6 group">
            <div className="w-8 h-8 rounded-lg grad-brand flex items-center justify-center">
              <Wallet className="w-4 h-4 text-white" />
            </div>
            <span className="text-main font-semibold text-sm tracking-tight">FinTrack</span>
          </Link>
          <h1 className="text-xl font-bold text-main tracking-tight">Welcome back</h1>
          <p className="text-sub mt-1 text-sm">Sign in to your account</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="card p-6 space-y-4"
        >
          <Input
            label="Email"
            type="email"
            icon={Mail}
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            required
          />
          <Input
            label="Password"
            type="password"
            icon={Lock}
            placeholder="Your password"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            required
          />

          <Button type="submit" loading={loading} className="w-full mt-2" size="lg">
            Sign In
          </Button>
        </form>

        <div className="mt-5 text-center space-y-2">
          <p className="text-sm text-sub">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium hover:underline" style={{ color: 'var(--accent-txt)' }}>
              Create one
            </Link>
          </p>
          <Link to="/" className="text-xs text-muted hover:text-sub transition-colors block">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
