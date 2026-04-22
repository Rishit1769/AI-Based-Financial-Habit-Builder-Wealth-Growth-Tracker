import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Mail, Lock, User, Wallet, Phone, ShieldCheck, ArrowLeft } from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

export default function Register() {
  const { sendOtp, register } = useAuth();
  const navigate = useNavigate();

  // Step 1: details form
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', phone: '' });
  const [errors, setErrors] = useState({});
  const [sendingOtp, setSendingOtp] = useState(false);

  // Step 2: OTP
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [registering, setRegistering] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef([]);

  const validate = () => {
    const e = {};
    if (form.name.trim().length < 2) e.name = 'Name must be at least 2 characters';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Valid email required';
    if (form.password.length < 8) e.password = 'Password must be at least 8 characters';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    return e;
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    const e2 = validate();
    setErrors(e2);
    if (Object.keys(e2).length > 0) return;
    setSendingOtp(true);
    try {
      await sendOtp(form.name, form.email);
      toast.success(`OTP sent to ${form.email}`);
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const updated = [...otp];
    updated[index] = value.slice(-1);
    setOtp(updated);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length !== 6) { toast.error('Please enter the 6-digit OTP'); return; }
    setRegistering(true);
    try {
      await register(form.name, form.email, form.password, form.phone, otpString);
      toast.success('Account created! Welcome aboard 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setRegistering(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await sendOtp(form.name, form.email);
      toast.success('New OTP sent!');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center px-4 py-10 overflow-hidden"
      style={{ backgroundColor: 'var(--bg)' }}
    >
      {/* Subtle background */}
      <div
        className="fixed top-0 left-0 w-96 h-96   pointer-events-none opacity-10"
        style={{ background: 'radial-gradient(circle, var(--color-volt) 0%, transparent 70%)', filter: 'blur(100px)' }}
      />

      <div className="w-full max-w-sm relative z-10">
        {/* Brand */}
        <div className="text-center mb-7">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-5 group">
            <div className="w-8 h-8   grad-brand flex items-center justify-center">
              <Wallet className="w-4 h-4 text-white" />
            </div>
            <span className="text-[var(--color-ink)] font-semibold text-sm tracking-tight">FinTrack</span>
          </Link>
          <h1 className="text-xl font-bold text-[var(--color-ink)] tracking-tight">
            {step === 1 ? 'Create an account' : 'Verify your email'}
          </h1>
          <p className="text-sub mt-1 text-sm">
            {step === 1 ? 'Start your financial journey today' : `We sent a code to ${form.email}`}
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6 px-2">
          <div className="flex-1 h-px" style={{ background: step >= 1 ? 'var(--color-volt)' : 'var(--color-ink)' }} />
          <div
            className="w-6 h-6   flex items-center justify-center text-xs font-medium transition-all"
            style={{ background: step >= 1 ? 'var(--color-volt)' : 'var(--color-surface)', color: step >= 1 ? 'white' : 'var(--text-3)' }}
          >1</div>
          <div className="flex-1 h-px" style={{ background: step >= 2 ? 'var(--color-volt)' : 'var(--color-ink)' }} />
          <div
            className="w-6 h-6   flex items-center justify-center text-xs font-medium transition-all"
            style={{ background: step >= 2 ? 'var(--color-volt)' : 'var(--color-surface)', color: step >= 2 ? 'white' : 'var(--text-3)' }}
          >2</div>
          <div className="flex-1 h-px" style={{ background: 'var(--color-ink)' }} />
        </div>

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="card p-6 space-y-4">
            <Input label="Full Name" icon={User} placeholder="John Doe" value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} error={errors.name} required />
            <Input label="Email" type="email" icon={Mail} placeholder="you@example.com" value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} error={errors.email} required />
            <Input label="Phone (optional)" type="tel" icon={Phone} placeholder="+91 98765 43210"
              value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
            <Input label="Password" type="password" icon={Lock} placeholder="At least 8 characters" value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} error={errors.password} required />
            <Input label="Confirm Password" type="password" icon={Lock} placeholder="Repeat password" value={form.confirm}
              onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))} error={errors.confirm} required />
            <Button type="submit" loading={sendingOtp} className="w-full mt-1" size="lg" icon={Mail}>
              Send Verification Code
            </Button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="card p-6 space-y-5">
            <div className="text-center">
              <div
                className="w-12 h-12   mx-auto mb-3 flex items-center justify-center"
                style={{ background: 'var(--accent-dim)' }}
              >
                <ShieldCheck className="w-5 h-5" style={{ color: 'var(--accent-txt)' }} />
              </div>
              <p className="text-xs text-[var(--color-muted)]">Enter the 6-digit code sent to your email. Expires in 10 minutes.</p>
            </div>

            <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (inputRefs.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  className="text-center text-base font-semibold   text-[var(--color-ink)] focus:outline-none transition-all"
                  style={{
                    width: '42px',
                    height: '48px',
                    background: digit ? 'var(--accent-dim)' : 'var(--color-surface)',
                    border: `1px solid ${digit ? 'rgba(99,102,241,0.4)' : 'var(--color-ink)'}`,
                  }}
                />
              ))}
            </div>

            <Button type="submit" loading={registering} className="w-full" size="lg">
              Verify & Create Account
            </Button>

            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-1 text-[var(--color-muted)] hover:text-sub transition-colors text-xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Edit details
              </button>
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="text-xs font-medium disabled:opacity-50 transition-colors hover:underline"
                style={{ color: 'var(--accent-txt)' }}
              >
                {resending ? 'Sending…' : 'Resend code'}
              </button>
            </div>
          </form>
        )}

        <div className="mt-5 text-center space-y-2">
          <p className="text-sm text-sub">
            Already have an account?{' '}
            <Link to="/login" className="font-medium hover:underline" style={{ color: 'var(--accent-txt)' }}>Sign in</Link>
          </p>
          <Link to="/" className="text-xs text-[var(--color-muted)] hover:text-sub transition-colors block">← Back to home</Link>
        </div>
      </div>
    </div>
  );
}
