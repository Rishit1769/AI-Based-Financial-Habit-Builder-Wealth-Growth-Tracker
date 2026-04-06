import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Download, TrendingUp, Target, Bot, BarChart3, Shield, ChevronRight, Wallet, Smartphone } from 'lucide-react';

const features = [
  { icon: TrendingUp, title: 'Wealth Tracking', desc: 'Monitor your net worth growth with clear charts and real-time insights.' },
  { icon: Target, title: 'Habit Building', desc: 'Build consistent financial habits with streaks, reminders, and progress tracking.' },
  { icon: BarChart3, title: 'Smart Analytics', desc: 'Deep-dive into your income, expenses, and investment performance with visual reports.' },
  { icon: Bot, title: 'AI Financial Advisor', desc: 'Get personalized, AI-powered financial advice based on your actual data.' },
  { icon: Shield, title: 'Secure & Private', desc: 'Bank-grade security with JWT authentication and encrypted data storage.' },
  { icon: TrendingUp, title: 'Investment Tracking', desc: 'Track stocks, crypto, mutual funds, and more in one unified portfolio view.' },
];

export default function Landing() {
  const navigate = useNavigate();
  const [showAppModal, setShowAppModal] = useState(false);

  const downloadApk = () => {
    const apiUrl = import.meta.env.VITE_API_URL || '/api';
    window.open(`${apiUrl}/download/apk`, '_blank');
    setShowAppModal(false);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      {/* Navbar */}
      <nav
        className="fixed top-0 left-0 right-0 z-40 border-b border-base"
        style={{ backgroundColor: 'var(--surface)' }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Wallet className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-main text-sm hidden sm:block">FinTrack</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAppModal(true)}
              className="flex items-center gap-1.5 text-sm text-sub hover:text-main transition-colors px-3 py-1.5"
            >
              <Smartphone className="w-3.5 h-3.5" /> App
            </button>
            <Link to="/login" className="text-sm text-sub hover:text-main transition-colors px-3 py-1.5">Sign in</Link>
            <Link
              to="/register"
              className="text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-1.5 rounded-lg transition-colors font-medium"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-28 pb-20 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 border border-base text-sub text-xs font-medium px-3 py-1.5 rounded-full mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            AI-Powered Financial Management
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-main mb-5 leading-tight tracking-tight">
            Build wealth,{' '}
            <span className="text-accent">one habit at a time</span>
          </h1>
          <p className="text-base text-sub max-w-xl mx-auto mb-9 leading-relaxed">
            Track income, expenses, savings goals and investments. Build financial habits with streaks.
            Get AI-powered advice — all in one platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate('/register')}
              className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-lg transition-colors font-medium text-sm"
            >
              Start for free <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setShowAppModal(true)}
              className="flex items-center justify-center gap-2 border border-base text-sub hover:text-main px-6 py-2.5 rounded-lg transition-colors font-medium text-sm hover:bg-[var(--elevated)]"
            >
              <Smartphone className="w-4 h-4" /> Mobile app
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-semibold text-main text-center mb-2">Everything you need</h2>
          <p className="text-sub text-sm text-center mb-10">Tools designed to transform your financial habits</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card p-5">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center mb-3">
                  <Icon className="w-4 h-4 text-indigo-500" />
                </div>
                <h3 className="font-medium text-main text-sm mb-1.5">{title}</h3>
                <p className="text-xs text-sub leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4">
        <div className="max-w-lg mx-auto text-center">
          <div className="card p-8">
            <h2 className="text-xl font-semibold text-main mb-2">Start your financial journey</h2>
            <p className="text-sub text-sm mb-6">Join thousands building better financial habits.</p>
            <button
              onClick={() => navigate('/register')}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-lg transition-colors font-medium text-sm"
            >
              Create free account
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-base py-8 text-center text-xs text-muted">
        © 2026 Financial Habit Builder & Wealth Growth Tracker
      </footer>

      {/* Mobile App Modal */}
      {showAppModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-[2px]">
          <div className="card w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl bg-indigo-600 flex items-center justify-center flex-shrink-0">
                <Smartphone className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-main font-semibold text-sm">FinTrack Mobile</h3>
                <p className="text-sub text-xs">Android App (Flutter)</p>
              </div>
            </div>
            <p className="text-sub text-sm mb-5 leading-relaxed">
              Get the full experience on your Android device. Track habits, view charts, and get AI advice.
            </p>
            <button
              onClick={downloadApk}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-lg font-medium text-sm transition-colors mb-2"
            >
              <Download className="w-4 h-4" /> Download APK
            </button>
            <button
              onClick={() => setShowAppModal(false)}
              className="w-full text-sub hover:text-main text-xs py-2 transition-colors"
            >
              Maybe later
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
