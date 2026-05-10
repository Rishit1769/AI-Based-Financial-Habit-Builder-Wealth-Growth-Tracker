import { useState } from 'react';
import AuthLayout from './AuthLayout.jsx';

export default function VerifyOtpView({
  pendingRegistration,
  onVerifyOtp,
  onResendOtp,
  onBackToRegister,
}) {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!otp.trim()) {
      setError('Please enter the OTP sent to your email.');
      return;
    }

    try {
      setLoading(true);
      await onVerifyOtp(otp.trim());
    } catch (err) {
      setError(err.message || 'Unable to verify OTP right now.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setResendMessage('');
    try {
      setLoading(true);
      const message = await onResendOtp();
      setResendMessage(message);
    } catch (err) {
      setError(err.message || 'Unable to resend OTP right now.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Verify OTP"
      subtitle={`Enter the OTP sent to ${pendingRegistration?.email || 'your email'} to complete registration.`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block text-sm font-semibold">
          One-Time Password
          <input
            type="text"
            value={otp}
            onChange={(event) => setOtp(event.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
            className="mt-2 w-full radius-pill border bg-transparent px-4 py-3 text-center text-xl tracking-[0.4em] outline-none"
            style={{ borderColor: 'var(--border)' }}
            placeholder="000000"
            inputMode="numeric"
            autoComplete="one-time-code"
          />
        </label>

        {error ? (
          <p className="text-sm font-semibold" style={{ color: '#dc2626' }}>
            {error}
          </p>
        ) : null}

        {resendMessage ? (
          <p className="text-sm font-semibold" style={{ color: 'var(--growth)' }}>
            {resendMessage}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="pill-button w-full px-4 py-3 text-sm font-semibold"
          style={{ background: 'var(--ink)', color: 'var(--canvas)', opacity: loading ? 0.7 : 1 }}
        >
          {loading ? 'Verifying...' : 'Verify OTP'}
        </button>
      </form>

      <div className="mt-6 flex items-center justify-between text-sm">
        <button type="button" onClick={onBackToRegister} style={{ color: 'var(--muted-ink)' }}>
          Edit registration details
        </button>
        <button type="button" onClick={handleResend} className="font-semibold" style={{ color: 'var(--signal)' }}>
          Resend OTP
        </button>
      </div>
    </AuthLayout>
  );
}
