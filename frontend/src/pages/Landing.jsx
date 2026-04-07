import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Download, TrendingUp, Target, Bot, BarChart3, Shield,
  ChevronRight, Wallet, Smartphone, Zap, ArrowRight,
  PiggyBank, LineChart, Bell, CheckCircle,
} from 'lucide-react';

const features = [
  { icon: TrendingUp,  title: 'Wealth Tracking',       desc: 'Monitor your net worth growth with beautiful charts and real-time insights.', color: 'indigo' },
  { icon: Target,      title: 'Habit Building',         desc: 'Build consistent financial habits with streaks, reminders, and daily tracking.', color: 'purple' },
  { icon: BarChart3,   title: 'Smart Analytics',        desc: 'Deep-dive into income, expenses, and investment performance with visual reports.', color: 'blue' },
  { icon: Bot,         title: 'AI Financial Advisor',   desc: 'Get personalized, AI-powered financial advice based on your actual data.', color: 'violet' },
  { icon: Shield,      title: 'Secure & Private',       desc: 'Bank-grade security with JWT authentication and encrypted data storage.', color: 'emerald' },
  { icon: LineChart,   title: 'Investment Tracking',    desc: 'Track stocks, crypto, mutual funds, and more in one unified portfolio view.', color: 'rose' },
];

const featureColors = {
  indigo:  { bg: 'rgba(99,102,241,0.12)',  text: '#818cf8', border: 'rgba(99,102,241,0.2)' },
  purple:  { bg: 'rgba(139,92,246,0.12)',  text: '#a78bfa', border: 'rgba(139,92,246,0.2)' },
  blue:    { bg: 'rgba(59,130,246,0.12)',  text: '#60a5fa', border: 'rgba(59,130,246,0.2)' },
  violet:  { bg: 'rgba(124,58,237,0.12)',  text: '#a78bfa', border: 'rgba(124,58,237,0.2)' },
  emerald: { bg: 'rgba(16,185,129,0.12)',  text: '#34d399', border: 'rgba(16,185,129,0.2)' },
  rose:    { bg: 'rgba(244,63,94,0.12)',   text: '#fb7185', border: 'rgba(244,63,94,0.2)'  },
};

const stats = [
  { value: '10+', label: 'Features' },
  { value: 'AI', label: 'Powered' },
  { value: '100%', label: 'Free' },
  { value: '📱', label: 'Mobile App' },
];

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
      {/* Background orbs */}
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />

      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-40 border-b border-base"
        style={{ background: 'rgba(8,11,18,0.8)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl grad-brand flex items-center justify-center shadow-[0_0_16px_rgba(99,102,241,0.4)]">
              <Wallet className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-main text-sm tracking-tight">FinTrack</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAppModal(true)}
              className="hidden sm:flex items-center gap-1.5 text-xs text-sub hover:text-main transition-colors px-3 py-1.5 rounded-lg hover:bg-[var(--elevated)]"
            >
              <Smartphone className="w-3.5 h-3.5" /> Mobile App
            </button>
            <Link to="/login"
              className="text-sm text-sub hover:text-main transition-colors px-3 py-1.5 rounded-lg hover:bg-[var(--elevated)]">
              Sign in
            </Link>
            <Link to="/register"
              className="text-sm grad-brand text-white px-4 py-1.5 rounded-lg font-semibold shadow-[0_0_16px_rgba(99,102,241,0.3)] hover:shadow-[0_0_24px_rgba(99,102,241,0.5)] transition-all duration-200">
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="pt-32 pb-24 px-4 text-center relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="animate-fade-in-up inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full text-xs font-semibold"
            style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: '#818cf8' }}>
            <Zap className="w-3 h-3" />
            AI-Powered Financial Management Platform
          </div>

          <h1 className="animate-fade-in-up delay-100 text-5xl sm:text-6xl lg:text-7xl font-black text-main mb-6 leading-[1.1] tracking-tight">
            Build wealth,<br />
            <span className="text-gradient">one habit at a time</span>
          </h1>

          <p className="animate-fade-in-up delay-200 text-base sm:text-lg text-sub max-w-2xl mx-auto mb-10 leading-relaxed">
            Track income, expenses, savings goals and investments. Build financial habits with streaks.
            Get AI-powered advice — all in one beautiful platform.
          </p>

          <div className="animate-fade-in-up delay-300 flex flex-col sm:flex-row gap-3 justify-center mb-16">
            <button onClick={() => navigate('/register')}
              className="flex items-center justify-center gap-2 grad-brand text-white px-8 py-3.5 rounded-xl font-semibold text-sm shadow-[0_0_24px_rgba(99,102,241,0.4)] hover:shadow-[0_0_36px_rgba(99,102,241,0.6)] hover:scale-[1.02] transition-all duration-200">
              Start for free <ArrowRight className="w-4 h-4" />
            </button>
            <button onClick={() => setShowAppModal(true)}
              className="flex items-center justify-center gap-2 border text-sub hover:text-main px-8 py-3.5 rounded-xl font-semibold text-sm hover:bg-[var(--elevated)] transition-all duration-200"
              style={{ borderColor: 'var(--border-2)' }}>
              <Smartphone className="w-4 h-4" /> Download App
            </button>
          </div>

          {/* Stats strip */}
          <div className="animate-fade-in-up delay-400 grid grid-cols-4 max-w-md mx-auto gap-6">
            {stats.map(s => (
              <div key={s.label} className="text-center">
                <p className="text-xl font-black text-gradient">{s.value}</p>
                <p className="text-xs text-muted mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-24 px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: '#6366f1' }}>Features</p>
            <h2 className="text-3xl sm:text-4xl font-black text-main mb-4 tracking-tight">Everything you need</h2>
            <p className="text-sub text-base max-w-xl mx-auto">A complete suite of tools designed to transform your financial habits and grow your wealth.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ icon: Icon, title, desc, color }) => {
              const c = featureColors[color];
              return (
                <div key={title} className="card p-6 group hover:translate-y-[-2px] cursor-default"
                  style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110"
                    style={{ background: c.bg, border: `1px solid ${c.border}` }}>
                    <Icon className="w-5 h-5" style={{ color: c.text }} />
                  </div>
                  <h3 className="font-bold text-main text-sm mb-2">{title}</h3>
                  <p className="text-xs text-sub leading-relaxed">{desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Why FinTrack strip ── */}
      <section className="py-16 px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-2xl p-8 sm:p-12 text-center relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.1) 100%)', border: '1px solid rgba(99,102,241,0.2)' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-2xl" />
            <div className="relative z-10">
              <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: '#818cf8' }}>Why FinTrack</p>
              <h2 className="text-2xl sm:text-3xl font-black text-main mb-8 tracking-tight">Smart features, zero learning curve</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
                {[
                  { icon: CheckCircle, label: 'Real-time dashboard', sub: 'See your financial health at a glance' },
                  { icon: Bot, label: 'Gemini AI advisor', sub: 'Chat with AI about your finances' },
                  { icon: Bell, label: 'Smart notifications', sub: 'Never miss a bill or savings target' },
                ].map(({ icon: Icon, label, sub }) => (
                  <div key={label} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(99,102,241,0.2)' }}>
                      <Icon className="w-4 h-4" style={{ color: '#818cf8' }} />
                    </div>
                    <div>
                      <p className="text-main font-semibold text-sm">{label}</p>
                      <p className="text-sub text-xs mt-0.5">{sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-4 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-black text-main mb-4 tracking-tight">
            Ready to transform your finances?
          </h2>
          <p className="text-sub text-base mb-8 leading-relaxed">
            Join others building smarter financial habits. Free forever, no credit card required.
          </p>
          <button onClick={() => navigate('/register')}
            className="inline-flex items-center gap-2 grad-brand text-white px-10 py-4 rounded-xl font-bold text-base shadow-[0_0_32px_rgba(99,102,241,0.4)] hover:shadow-[0_0_48px_rgba(99,102,241,0.6)] hover:scale-[1.02] transition-all duration-200">
            Create free account <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t relative z-10 py-8 px-4" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg grad-brand flex items-center justify-center">
              <Wallet className="w-3 h-3 text-white" />
            </div>
            <span className="font-bold text-main text-xs">FinTrack</span>
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
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
          onClick={(e) => e.target === e.currentTarget && setShowAppModal(false)}>
          <div className="card-glass w-full max-w-sm p-6 animate-fade-in-up">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-2xl grad-brand flex items-center justify-center flex-shrink-0 shadow-[0_0_20px_rgba(99,102,241,0.4)]">
                <Smartphone className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-main font-bold text-base">FinTrack Mobile</h3>
                <p className="text-sub text-xs mt-0.5">Android App · Flutter</p>
              </div>
            </div>
            <p className="text-sub text-sm mb-6 leading-relaxed">
              Get the full experience on your Android device. Track everything, get AI advice, and stay on top of your finances.
            </p>
            <button onClick={downloadApk} disabled={downloading}
              className="w-full flex items-center justify-center gap-2 grad-brand text-white py-3 rounded-xl font-semibold text-sm mb-3 disabled:opacity-60 shadow-[0_0_16px_rgba(99,102,241,0.3)] transition-all">
              {downloading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              {downloading ? 'Downloading...' : 'Download APK'}
            </button>
            <button onClick={() => setShowAppModal(false)}
              className="w-full text-sub hover:text-main text-sm py-2 transition-colors rounded-lg hover:bg-[var(--elevated)]">
              Maybe later
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

