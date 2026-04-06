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
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-600 mb-4">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-semibold text-main">Welcome back</h1>
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

          <Button type="submit" loading={loading} className="w-full" size="lg">
            Sign In
          </Button>
        </form>

        <p className="text-center text-sm text-sub mt-5">
          Don't have an account?{' '}
          <Link to="/register" className="text-accent hover:underline font-medium">
            Create one
          </Link>
        </p>
        <p className="text-center mt-2">
          <Link to="/" className="text-xs text-muted hover:text-sub">← Back to home</Link>
        </p>
      </div>
    </div>
  );
}
