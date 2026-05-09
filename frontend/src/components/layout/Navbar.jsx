import { FaBars, FaMoon, FaSun } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

export default function Navbar({ onMenuClick, title }) {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 px-5 pb-1 pt-4 md:px-10 md:pt-5">
      <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="radius-circle flex h-10 w-10 items-center justify-center lg:hidden"
          style={{ border: '1px solid var(--border)', color: 'var(--muted-ink)' }}
          aria-label="Open sidebar"
        >
          <FaBars />
        </button>
        <h1 className="wealth-display text-[clamp(1.95rem,3.4vw,2.85rem)] font-bold">{title}</h1>
      </div>

      <div className="ml-2 flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className="radius-circle flex h-12 w-12 items-center justify-center"
          style={{
            border: '1px solid var(--border)',
            color: 'var(--ink)',
            background: 'transparent',
          }}
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <FaSun /> : <FaMoon />}
        </button>

        <button
          type="button"
          className="radius-pill flex items-center gap-2.5 px-2 py-1.5 md:px-3"
          style={{
            border: '1px solid var(--border)',
            background: 'var(--lifted-surface)',
          }}
          onClick={() => {
            navigate('/profile');
          }}
          aria-label="Open account settings"
        >
          <span
            className="radius-circle flex h-8 w-8 items-center justify-center text-[0.78rem] font-semibold"
            style={{ background: 'var(--ink)', color: 'var(--canvas)' }}
          >
            RI
          </span>
          <span className="hidden text-[1rem] font-semibold sm:inline" style={{ color: 'var(--ink)' }}>Rishit P.</span>
        </button>
      </div>
    </div>
    </header>
  );
}

