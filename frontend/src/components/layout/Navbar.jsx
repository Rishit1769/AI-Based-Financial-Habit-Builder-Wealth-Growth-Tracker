import { useState } from 'react';
import { Menu, Bell, Sun, Moon, Search, CalendarDays } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function Navbar({ onMenuClick }) {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  return (
    <header
      className="h-14 flex items-center gap-4 px-5 flex-shrink-0"
      style={{
        backgroundColor: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      {/* Mobile hamburger */}
      <button
        onClick={onMenuClick}
        className="lg:hidden text-muted hover:text-main p-1.5 rounded-lg transition-colors"
        style={{ background: 'var(--elevated)' }}
      >
        <Menu className="w-4 h-4" />
      </button>

      {/* Search bar — centered, Atelier-style */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search assets, transactions..."
            className="w-full text-sm pl-9 pr-4 py-2 rounded-lg transition-colors outline-none"
            style={{
              background: 'var(--elevated)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = 'var(--border-2)'; }}
            onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
          />
        </div>
      </div>

      {/* Right cluster */}
      <div className="ml-auto flex items-center gap-1">
        {/* Theme */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg transition-colors text-muted hover:text-main"
          style={{ background: 'transparent' }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--elevated)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Calendar */}
        <button
          className="p-2 rounded-lg transition-colors text-muted hover:text-main"
          onMouseEnter={e => e.currentTarget.style.background = 'var(--elevated)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          title="Calendar"
        >
          <CalendarDays className="w-4 h-4" />
        </button>

        {/* Notifications */}
        <Link
          to="/notifications"
          className="relative p-2 rounded-lg transition-colors text-muted hover:text-main"
          onMouseEnter={e => e.currentTarget.style.background = 'var(--elevated)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <Bell className="w-4 h-4" />
          <span
            className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full"
            style={{ background: 'var(--accent)' }}
          />
        </Link>

        {/* Avatar */}
        <Link to="/profile" className="ml-1">
          <div
            className="w-7 h-7 grad-brand rounded-full flex items-center justify-center text-black font-bold text-xs"
          >
            {user?.name?.charAt(0).toUpperCase()}
          </div>
        </Link>
      </div>
    </header>
  );
}

