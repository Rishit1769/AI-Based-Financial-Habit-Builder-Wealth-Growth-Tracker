import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Mail, Lock, User, Wallet } from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (form.name.trim().length < 2) e.name = 'Name must be at least 2 characters';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Valid email required';
    if (form.password.length < 8) e.password = 'Password must be at least 8 characters';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const e2 = validate();
    setErrors(e2);
    if (Object.keys(e2).length > 0) return;

    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created! Welcome aboard 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-600 mb-4">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-semibold text-main">Create an account</h1>
          <p className="text-sub mt-1 text-sm">Start your financial journey</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="card p-6 space-y-4"
        >
          <Input label="Full Name" icon={User} placeholder="John Doe" value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} error={errors.name} required />
          <Input label="Email" type="email" icon={Mail} placeholder="you@example.com" value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} error={errors.email} required />
          <Input label="Password" type="password" icon={Lock} placeholder="At least 8 characters" value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} error={errors.password} required />
          <Input label="Confirm Password" type="password" icon={Lock} placeholder="Repeat password" value={form.confirm}
            onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))} error={errors.confirm} required />

          <Button type="submit" loading={loading} className="w-full" size="lg">
            Create Account
          </Button>
        </form>

        <p className="text-center text-sm text-sub mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-accent hover:underline font-medium">Sign in</Link>
        </p>
        <p className="text-center mt-2">
          <Link to="/" className="text-xs text-muted hover:text-sub">← Back to home</Link>
        </p>
      </div>
    </div>
  );
}
