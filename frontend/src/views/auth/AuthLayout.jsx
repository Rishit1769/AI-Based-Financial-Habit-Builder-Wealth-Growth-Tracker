import { useTheme } from '../../context/ThemeContext.jsx';

export default function AuthLayout({ title, subtitle, children }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="relative min-h-screen overflow-hidden px-5 py-8 md:px-8 md:py-10">
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 12% 15%, color-mix(in srgb, var(--signal) 20%, transparent), transparent 35%), radial-gradient(circle at 84% 12%, color-mix(in srgb, var(--growth) 18%, transparent), transparent 40%), linear-gradient(135deg, color-mix(in srgb, var(--ink) 5%, var(--canvas)) 0%, var(--canvas) 55%, color-mix(in srgb, var(--orbit) 14%, var(--canvas)) 100%)',
        }}
      />

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center justify-center">
        <section className="card-stadium w-full max-w-md px-7 py-8 md:px-8 md:py-9">
          <div className="mb-7 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/Logo.png" alt="WealthGrow logo" className="h-9 w-9 object-contain" />
              <span className="wealth-display text-2xl font-extrabold">WealthGrow</span>
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              className="radius-circle flex h-10 w-10 items-center justify-center text-xs font-semibold"
              style={{ border: '1px solid var(--border)', color: 'var(--muted-ink)' }}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? 'LM' : 'DM'}
            </button>
          </div>

          <p className="eyebrow" style={{ color: 'var(--signal)' }}>
            Secure Account Access
          </p>
          <h1 className="wealth-display mt-2 text-4xl font-extrabold">{title}</h1>
          <p className="mt-3 text-sm leading-6" style={{ color: 'var(--muted-ink)' }}>
            {subtitle}
          </p>

          <div className="mt-7">{children}</div>
        </section>
      </div>
    </div>
  );
}
