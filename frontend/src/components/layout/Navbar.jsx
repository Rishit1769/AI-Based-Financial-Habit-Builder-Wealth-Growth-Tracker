import { Menu, Bell, Sun, Moon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function Navbar({ onMenuClick }) {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header
      className="h-14 flex items-center justify-between px-4 sm:px-6 flex-shrink-0"
      style={{ backgroundColor: 'var(--surface)', borderBottom: '1px solid var(--border)' }}
    >
      <button
        onClick={onMenuClick}
        className="lg:hidden text-muted hover:text-main p-2 rounded-xl transition-colors hover:bg-[var(--elevated)]"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="hidden lg:flex items-center gap-2">
        <span className="text-muted text-sm">Welcome back,</span>
        <span className="text-main font-semibold text-sm">{user?.name?.split(' ')[0]}</span>
        <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'var(--accent-dim)', color: 'var(--accent-txt)' }}>👋</span>
      </div>

      <div className="flex items-center gap-1 ml-auto lg:ml-0">
        <button
          onClick={toggleTheme}
          className="text-muted hover:text-main p-2 rounded-xl hover:bg-[var(--elevated)] transition-colors"
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <Link to="/notifications" className="relative text-muted hover:text-main p-2 rounded-xl hover:bg-[var(--elevated)] transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full animate-pulse-glow" style={{ background: '#6366f1', boxShadow: '0 0 6px rgba(99,102,241,0.8)' }} />
        </Link>

        <div className="ml-1 w-8 h-8 rounded-xl grad-brand flex items-center justify-center text-white font-bold text-xs shadow-[0_0_10px_rgba(99,102,241,0.3)]">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
}

