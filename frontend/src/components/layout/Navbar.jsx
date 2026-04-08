import { Menu, Bell, Sun, Moon, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function Navbar({ onMenuClick }) {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header
      className="h-14 flex items-center justify-between px-4 sm:px-5 flex-shrink-0"
      style={{
        backgroundColor: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-muted hover:text-main p-1.5 rounded-md transition-colors hover:bg-[var(--elevated)]"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="hidden lg:flex items-center gap-1.5">
          <span className="text-sub text-sm">Good day,</span>
          <span className="text-main font-medium text-sm">{user?.name?.split(' ')[0]}</span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={toggleTheme}
          className="text-muted hover:text-main p-2 rounded-md hover:bg-[var(--elevated)] transition-colors"
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
        >
          {theme === 'dark'
            ? <Sun className="w-4 h-4" />
            : <Moon className="w-4 h-4" />}
        </button>

        <Link
          to="/notifications"
          className="relative text-muted hover:text-main p-2 rounded-md hover:bg-[var(--elevated)] transition-colors"
        >
          <Bell className="w-4 h-4" />
          <span
            className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full animate-pulse-glow"
            style={{ background: 'var(--accent)' }}
          />
        </Link>

        <Link to="/profile" className="ml-1">
          <div
            className="w-7 h-7 rounded-md grad-brand flex items-center justify-center text-white font-semibold text-xs"
          >
            {user?.name?.charAt(0).toUpperCase()}
          </div>
        </Link>
      </div>
    </header>
  );
}

