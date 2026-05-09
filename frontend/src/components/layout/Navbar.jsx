import { FaBars, FaMoon, FaSun } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

export default function Navbar({ onMenuClick, title }) {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <header
      className="sticky top-0 z-30 px-[clamp(1rem,3vw,2.6rem)] pt-4 md:px-[clamp(2rem,5vw,4.5rem)]"
    >
      <div
        className="radius-stadium flex items-center justify-between px-4 py-3 md:px-6"
      style={{
          border: '1px solid var(--border)',
          background: 'color-mix(in srgb, var(--lifted-surface) 64%, transparent)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
      }}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="radius-circle flex h-10 w-10 items-center justify-center lg:hidden"
          style={{ border: '1px solid var(--border)', color: 'var(--muted-ink)' }}
          aria-label="Open sidebar"
        >
          <FaBars />
        </button>
        <div>
          <p className="eyebrow" style={{ color: 'var(--muted-ink)' }}>
            Wealth Growth Tracker
          </p>
          <h1 className="wealth-display text-[clamp(1.4rem,3vw,2rem)] font-extrabold">{title}</h1>
        </div>
      </div>

      <div className="ml-2 flex items-center gap-2 md:gap-3">
        <button
          onClick={toggleTheme}
          className="radius-circle flex h-11 w-11 items-center justify-center"
          style={{
            border: '1px solid var(--border)',
            color: 'var(--ink)',
            background: 'color-mix(in srgb, var(--lifted-surface) 82%, transparent)',
          }}
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <FaSun /> : <FaMoon />}
        </button>

        <button
          type="button"
          className="radius-pill flex items-center gap-2.5 px-3 py-2 md:px-3.5"
          style={{
            border: '1px solid var(--border)',
            background: 'color-mix(in srgb, var(--lifted-surface) 90%, transparent)',
          }}
          onClick={() => {
            navigate('/profile');
          }}
          aria-label="Open account settings"
        >
          <img
            src="/avatar-rishit.svg"
            alt="Rishit profile"
            className="h-8 w-8 radius-circle object-cover"
          />
          <span className="hidden text-sm font-semibold sm:inline" style={{ color: 'var(--ink)' }}>Rishit P.</span>
        </button>
      </div>
    </div>
    </header>
  );
}

