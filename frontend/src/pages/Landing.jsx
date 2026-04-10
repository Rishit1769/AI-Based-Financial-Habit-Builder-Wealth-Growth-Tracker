import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Download, TrendingUp, Target, Bot, BarChart3, Shield,
  Wallet, Smartphone, ArrowRight,
  PiggyBank, LineChart, Bell, CheckCircle,
} from 'lucide-react';

const features = [
  { icon: TrendingUp,  title: 'Wealth Tracking',       desc: 'Monitor net worth and portfolio growth with real-time charts.',         color: 'indigo' },
  { icon: Target,      title: 'Habit Building',         desc: 'Build consistent financial habits with streaks and daily check-ins.',    color: 'purple' },
  { icon: BarChart3,   title: 'Smart Analytics',        desc: 'Deep-dive into income, expenses and investments with visual reports.',    color: 'blue' },
  { icon: Bot,         title: 'AI Financial Advisor',   desc: 'Get personalized advice powered by Gemini AI based on your own data.',   color: 'violet' },
  { icon: Shield,      title: 'Secure & Private',       desc: 'Bank-grade security with JWT auth and encrypted data storage.',          color: 'emerald' },
  { icon: LineChart,   title: 'Investment Tracking',    desc: 'Track stocks, crypto and mutual funds in one unified portfolio view.',    color: 'rose' },
];

const featureColors = {
  indigo:  { bg: 'rgba(74,222,128,0.10)',  text: '#4ade80' },
  purple:  { bg: 'rgba(139,92,246,0.10)',  text: '#a78bfa' },
  blue:    { bg: 'rgba(59,130,246,0.10)',  text: '#60a5fa' },
  violet:  { bg: 'rgba(124,58,237,0.10)',  text: '#a78bfa' },
  emerald: { bg: 'rgba(74,222,128,0.10)',  text: '#4ade80' },
  rose:    { bg: 'rgba(244,63,94,0.10)',   text: '#fb7185' },
};

export default function Landing() {
  const navigate = useNavigate();
  const [showAppModal, setShowAppModal] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const downloadApk = async () => {
    setDownloading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const res = await fetch(`${apiUrl}/download/apk`);
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'financial-habit-builder.apk';
        a.click();
        URL.revokeObjectURL(url);
        setShowAppModal(false);
      } else {
        alert('APK is coming soon!');
      }
    } catch {
      alert('Download unavailable right now.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden" style={{ backgroundColor: 'var(--bg)' }}>
      {/* Subtle background gradients */}
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />

      {/* ── Navbar ── */}
      <nav
        className="fixed top-0 left-0 right-0 z-40"
        style={{
          background: 'rgba(9,9,11,0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg grad-brand flex items-center justify-center">
              <Wallet className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-main text-sm tracking-tight">FinTrack</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowAppModal(true)}
              className="hidden sm:flex items-center gap-1.5 text-xs text-sub hover:text-main transition-colors px-3 py-1.5 rounded-md hover:bg-[var(--elevated)]"
            >
              <Smartphone className="w-3.5 h-3.5" />
              Mobile
            </button>
            <Link
              to="/login"
              className="text-sm text-sub hover:text-main transition-colors px-3 py-1.5 rounded-md hover:bg-[var(--elevated)]"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="text-sm grad-brand text-white px-3.5 py-1.5 rounded-md font-medium ml-1 hover:opacity-90 transition-opacity"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="pt-36 pb-28 px-4 text-center relative z-10">
        <div className="max-w-3xl mx-auto">
          <div
            className="animate-fade-in inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full text-xs font-medium"
            style={{
              background: 'var(--accent-dim)',
              border: '1px solid rgba(99,102,241,0.2)',
              color: 'var(--accent-txt)',
            }}
          >
            AI-Powered Financial Platform
          </div>

          <h1 className="animate-fade-in-up delay-100 text-4xl sm:text-5xl lg:text-6xl font-bold text-main mb-5 leading-[1.1] tracking-tight">
            Build wealth,<br />
            <span className="text-gradient">one habit at a time</span>
          </h1>

          <p className="animate-fade-in-up delay-200 text-base text-sub max-w-xl mx-auto mb-8 leading-relaxed">
            Track income, expenses, savings and investments. Build financial habits with streaks.
            Get AI-powered advice — all in one clean platform.
          </p>

          <div className="animate-fade-in-up delay-300 flex flex-col sm:flex-row gap-2.5 justify-center mb-20">
            <button
              onClick={() => navigate('/register')}
              className="flex items-center justify-center gap-2 grad-brand text-white px-6 py-2.5 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
            >
              Start for free <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowAppModal(true)}
              className="flex items-center justify-center gap-2 border text-sub hover:text-main px-6 py-2.5 rounded-lg font-medium text-sm hover:bg-[var(--elevated)] transition-all"
              style={{ borderColor: 'var(--border-2)' }}
            >
              <Smartphone className="w-4 h-4" /> Download App
            </button>
          </div>

          {/* Stats strip */}
          <div className="animate-fade-in-up delay-400 inline-flex items-center gap-8 px-6 py-3 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            {[
              { value: '10+', label: 'Features' },
              { value: 'AI', label: 'Powered' },
              { value: '100%', label: 'Free' },
              { value: '📱', label: 'Mobile' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="text-sm font-semibold text-main">{s.value}</p>
                <p className="text-xs text-muted mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-20 px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-medium tracking-widest uppercase mb-3 text-accent">Features</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-main mb-3 tracking-tight">Everything you need</h2>
            <p className="text-sub text-sm max-w-md mx-auto">A complete suite of tools to transform your financial habits.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map(({ icon: Icon, title, desc, color }) => {
              const c = featureColors[color];
              return (
                <div
                  key={title}
                  className="card p-5 group"
                  style={{ background: 'var(--surface)' }}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center mb-4"
                    style={{ background: c.bg }}
                  >
                    <Icon className="w-4 h-4" style={{ color: c.text }} />
                  </div>
                  <h3 className="font-semibold text-main text-sm mb-1.5">{title}</h3>
                  <p className="text-xs text-sub leading-relaxed">{desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Why FinTrack ── */}
      <section className="py-16 px-4 relative z-10">
        <div className="max-w-3xl mx-auto">
          <div
            className="rounded-xl p-8 sm:p-10 relative overflow-hidden"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
            }}
          >
            <p className="text-xs font-medium tracking-widest uppercase mb-4 text-accent">Why FinTrack</p>
            <h2 className="text-xl sm:text-2xl font-bold text-main mb-8 tracking-tight">Smart features, zero learning curve</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { icon: CheckCircle, label: 'Real-time dashboard', sub: 'See your financial health at a glance' },
                { icon: Bot, label: 'Gemini AI advisor', sub: 'Chat with AI about your finances' },
                { icon: Bell, label: 'Smart notifications', sub: 'Never miss a bill or savings target' },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex items-start gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: 'var(--accent-dim)' }}
                  >
                    <Icon className="w-4 h-4" style={{ color: 'var(--accent-txt)' }} />
                  </div>
                  <div>
                    <p className="text-main font-medium text-sm">{label}</p>
                    <p className="text-sub text-xs mt-0.5 leading-relaxed">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-4 relative z-10">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-main mb-3 tracking-tight">
            Ready to transform your finances?
          </h2>
          <p className="text-sub text-sm mb-8 leading-relaxed">
            Free forever. No credit card required.
          </p>
          <button
            onClick={() => navigate('/register')}
            className="inline-flex items-center gap-2 grad-brand text-white px-8 py-3 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
          >
            Create free account <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 py-6 px-4" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md grad-brand flex items-center justify-center">
              <Wallet className="w-2.5 h-2.5 text-white" />
            </div>
            <span className="font-medium text-main text-xs">FinTrack</span>
          </div>
          <p className="text-xs text-muted">© 2026 Financial Habit Builder & Wealth Growth Tracker</p>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-xs text-muted hover:text-sub transition-colors">Sign in</Link>
            <Link to="/register" className="text-xs text-muted hover:text-sub transition-colors">Register</Link>
          </div>
        </div>
      </footer>

      {/* ── Mobile App Modal ── */}
      {showAppModal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
          onClick={(e) => e.target === e.currentTarget && setShowAppModal(false)}
        >
          <div className="card w-full max-w-sm p-6 animate-fade-in-up">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl grad-brand flex items-center justify-center flex-shrink-0">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-main font-semibold text-sm">FinTrack Mobile</h3>
                <p className="text-sub text-xs mt-0.5">Android · Flutter</p>
              </div>
            </div>
            <p className="text-sub text-sm mb-5 leading-relaxed">
              Get the full experience on Android. Track finances, get AI advice, and stay on top of your goals.
            </p>
            <button
              onClick={downloadApk}
              disabled={downloading}
              className="w-full flex items-center justify-center gap-2 grad-brand text-white py-2.5 rounded-lg font-medium text-sm mb-2.5 disabled:opacity-60 hover:opacity-90 transition-opacity"
            >
              {downloading
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <Download className="w-4 h-4" />}
              {downloading ? 'Downloading...' : 'Download APK'}
            </button>
            <button
              onClick={() => setShowAppModal(false)}
              className="w-full text-sub hover:text-main text-sm py-2 transition-colors rounded-lg hover:bg-[var(--elevated)]"
            >
              Maybe later
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
