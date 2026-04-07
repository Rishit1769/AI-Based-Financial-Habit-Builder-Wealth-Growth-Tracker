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
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden" style={{ backgroundColor: 'var(--bg)' }}>
      {/* Background orbs */}
      <div className="absolute w-80 h-80 rounded-full opacity-20 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.6) 0%, transparent 70%)', top: '-80px', right: '-80px', filter: 'blur(60px)' }} />
      <div className="absolute w-96 h-96 rounded-full opacity-15 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.5) 0%, transparent 70%)', bottom: '-100px', left: '-100px', filter: 'blur(80px)' }} />

      <div className="w-full max-w-sm relative z-10">
        {/* Brand header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-6 group">
            <div className="w-10 h-10 rounded-2xl grad-brand flex items-center justify-center shadow-[0_0_24px_rgba(99,102,241,0.5)] group-hover:shadow-[0_0_36px_rgba(99,102,241,0.7)] transition-all">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="text-main font-bold text-lg tracking-tight">FinTrack</span>
          </Link>
          <h1 className="text-2xl font-black text-main tracking-tight">Welcome back</h1>
          <p className="text-sub mt-1 text-sm">Sign in to continue your journey</p>
        </div>

        <form onSubmit={handleSubmit} className="card-glass rounded-2xl p-7 space-y-5" style={{ border: '1px solid var(--border)' }}>
          <Input label="Email" type="email" icon={Mail} placeholder="you@example.com"
            value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required />
          <Input label="Password" type="password" icon={Lock} placeholder="Your password"
            value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} required />

          <Button type="submit" loading={loading} className="w-full" size="lg">
            Sign In
          </Button>
        </form>

        <div className="mt-5 text-center space-y-2">
          <p className="text-sm text-sub">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold hover:underline" style={{ color: 'var(--accent-txt)' }}>Create one</Link>
          </p>
          <Link to="/" className="text-xs text-muted hover:text-sub transition-colors block">← Back to home</Link>
        </div>
      </div>
    </div>
  );
}
