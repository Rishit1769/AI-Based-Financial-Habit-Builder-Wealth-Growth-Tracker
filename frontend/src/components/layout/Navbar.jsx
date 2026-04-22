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
        backgroundColor: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-ink)',
      }}
    >
      {/* Mobile hamburger */}
      <button
        onClick={onMenuClick}
        className="lg:hidden text-[var(--color-muted)] hover:text-[var(--color-ink)] p-1.5   transition-colors"
        style={{ background: 'var(--color-surface)' }}
      >
        <Menu className="w-4 h-4" />
      </button>

      {/* Search bar — centered, Atelier-style */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-muted)]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search assets, transactions..."
            className="w-full text-sm pl-9 pr-4 py-2   transition-colors outline-none"
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-ink)',
              color: 'var(--text)',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = 'var(--color-ink)'; }}
            onBlur={e => { e.currentTarget.style.borderColor = 'var(--color-ink)'; }}
          />
        </div>
      </div>

      {/* Right cluster */}
      <div className="ml-auto flex items-center gap-1">
        {/* Theme */}
        <button
          onClick={toggleTheme}
          className="p-2   transition-colors text-[var(--color-muted)] hover:text-[var(--color-ink)]"
          style={{ background: 'transparent' }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Calendar */}
        <button
          className="p-2   transition-colors text-[var(--color-muted)] hover:text-[var(--color-ink)]"
          onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          title="Calendar"
        >
          <CalendarDays className="w-4 h-4" />
        </button>

        {/* Notifications */}
        <Link
          to="/notifications"
          className="relative p-2   transition-colors text-[var(--color-muted)] hover:text-[var(--color-ink)]"
          onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <Bell className="w-4 h-4" />
          <span
            className="absolute top-2 right-2 w-1.5 h-1.5  "
            style={{ background: 'var(--color-volt)' }}
          />
        </Link>

        {/* Avatar */}
        <Link to="/profile" className="ml-1">
          <div
            className="w-7 h-7 grad-brand   flex items-center justify-center text-black font-bold text-xs"
          >
            {user?.name?.charAt(0).toUpperCase()}
          </div>
        </Link>
      </div>
    </header>
  );
}

