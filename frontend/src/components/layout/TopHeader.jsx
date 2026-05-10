import { FaBars, FaMoon, FaRightFromBracket, FaSun } from 'react-icons/fa6';
import { useTheme } from '../../context/ThemeContext.jsx';

const getInitials = (name) => {
  if (!name) {
    return 'WG';
  }
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');
};

export default function TopHeader({ title, onMenuClick, user, onLogout }) {
  const { theme, toggleTheme } = useTheme();
  const initials = getInitials(user?.name);

  return (
    <header className="sticky top-0 z-30 px-5 pt-4 md:px-10 md:pt-5 xl:px-16">
      <div className="relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onMenuClick}
              className="radius-circle flex h-10 w-10 items-center justify-center lg:hidden"
              style={{ border: '1px solid var(--border)', color: 'var(--muted-ink)' }}
              aria-label="Open sidebar"
            >
              <FaBars />
            </button>

            <h1 className="wealth-display text-[clamp(1.75rem,3vw,2.45rem)] font-bold">{title}</h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className="radius-circle flex h-11 w-11 items-center justify-center"
              style={{ border: '1px solid var(--border)', color: 'var(--ink)' }}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            >
              {theme === 'dark' ? <FaSun /> : <FaMoon />}
            </button>

            <div
              className="radius-pill flex items-center gap-2 px-2 py-1.5 pr-2"
              style={{ border: '1px solid var(--border)', background: 'var(--lifted-surface)' }}
            >
              <span
                className="radius-circle flex h-8 w-8 items-center justify-center text-xs font-bold"
                style={{ background: 'var(--ink)', color: 'var(--canvas)' }}
                aria-hidden="true"
              >
                {initials}
              </span>
              <span className="text-sm font-semibold">{user?.name || 'Wealth Member'}</span>
              <button
                type="button"
                onClick={onLogout}
                className="radius-circle flex h-8 w-8 items-center justify-center"
                style={{ border: '1px solid var(--border)', color: 'var(--muted-ink)' }}
                aria-label="Log out"
                title="Log out"
              >
                <FaRightFromBracket className="text-xs" />
              </button>
            </div>
          </div>
        </div>

        <span
          className="pointer-events-none mt-3 block h-px w-full"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, color-mix(in srgb, var(--ink) 24%, transparent) 12%, color-mix(in srgb, var(--ink) 36%, transparent) 50%, color-mix(in srgb, var(--ink) 24%, transparent) 88%, transparent 100%)',
          }}
        />
      </div>
    </header>
  );
}
