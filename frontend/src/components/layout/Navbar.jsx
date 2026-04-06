import { Menu, Bell, Sun, Moon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function Navbar({ onMenuClick }) {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header
      className="h-14 border-b border-base flex items-center justify-between px-4 flex-shrink-0"
      style={{ backgroundColor: 'var(--surface)' }}
    >
      <button
        onClick={onMenuClick}
        className="lg:hidden text-muted hover:text-main p-1.5 rounded-lg transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="hidden lg:block">
        <p className="text-sub text-sm">
          Welcome back,{' '}
          <span className="text-main font-medium">{user?.name}</span>
        </p>
      </div>

      <div className="flex items-center gap-1 ml-auto lg:ml-0">
        <button
          onClick={toggleTheme}
          className="text-muted hover:text-main p-2 rounded-lg hover:bg-[var(--elevated)] transition-colors"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <Link
          to="/notifications"
          className="relative text-muted hover:text-main p-2 rounded-lg hover:bg-[var(--elevated)] transition-colors"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500" />
        </Link>

        <div className="ml-1 w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold text-xs">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
}

