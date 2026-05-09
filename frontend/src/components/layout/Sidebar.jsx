import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FaArrowRightArrowLeft,
  FaChartLine,
  FaChartPie,
  FaGear,
  FaListCheck,
  FaRobot,
  FaShield,
  FaXmark,
} from 'react-icons/fa6';

const corePortfolio = [
  { to: '/dashboard', icon: FaChartLine, label: 'Overview' },
  { to: '/habits', icon: FaListCheck, label: 'Habit Builder' },
  { to: '/ai-advisor', icon: FaRobot, label: 'AI Advisor' },
  { to: '/investments', icon: FaChartPie, label: 'Asset Allocation' },
];

const operations = [
  { to: '/expenses', icon: FaArrowRightArrowLeft, label: 'Transactions' },
  { to: '/profile', icon: FaGear, label: 'Settings' },
];

function DotLabel({ color = 'var(--orbit)', text }) {
  return (
    <p className="eyebrow flex items-center gap-2 px-1" style={{ color: 'var(--muted-ink)' }}>
      <span
        aria-hidden="true"
        className="h-2 w-2 radius-circle"
        style={{ background: color }}
      />
      {text}
    </p>
  );
}

function SideNavLink({ to, icon: Icon, label, onClose }) {
  return (
    <NavLink
      to={to}
      onClick={onClose}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3.5 pill-button text-[1.02rem] transition-all duration-200 ${
          isActive ? 'font-semibold' : 'font-medium'
        }`
      }
      style={({ isActive }) => ({
        borderRadius: 'var(--radius-pill)',
        color: isActive ? 'var(--nav-active-text)' : 'var(--muted-ink)',
        background: isActive ? 'var(--nav-active-bg)' : 'transparent',
      })}
    >
      <Icon className="text-[0.85rem]" />
      <span>{label}</span>
    </NavLink>
  );
}

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)' }}
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col transition-transform duration-300 ease-out
          ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        style={{
          width: 'min(16.5rem, 86vw)',
          background: 'var(--lifted-surface)',
          borderRight: '1px solid var(--border)',
        }}
      >
        <div className="flex h-20 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="relative h-8 w-10" aria-hidden="true">
              <span
                className="absolute left-0 top-1 h-6 w-6 radius-circle"
                style={{ background: '#eb001b', opacity: 0.9 }}
              />
              <span
                className="absolute left-3.5 top-1 h-6 w-6 radius-circle"
                style={{ background: '#f79e1b', opacity: 0.9 }}
              />
            </div>
            <span className="wealth-display text-xl font-extrabold">WealthGrow</span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden"
            style={{ color: 'var(--muted-ink)' }}
            aria-label="Close sidebar"
          >
            <FaXmark className="text-lg" />
          </button>
        </div>

        <nav className="flex-1 space-y-9 overflow-y-auto px-6 pb-6 pt-6">
          <section className="space-y-2">
            <DotLabel text="Core Portfolio" color="var(--signal)" />
            <div className="space-y-2">
              {corePortfolio.map((item) => (
                <SideNavLink key={item.to} {...item} onClose={onClose} />
              ))}
            </div>
          </section>

          <section className="space-y-2">
            <DotLabel text="Operations" color="var(--growth)" />
            <div className="space-y-2">
              {operations.map((item) => (
                <SideNavLink key={item.to} {...item} onClose={onClose} />
              ))}
            </div>
          </section>

          {user?.role === 'admin' && (
            <section className="space-y-2">
              <DotLabel text="Governance" color="var(--orbit)" />
              <SideNavLink to="/admin" icon={FaShield} label="Admin Panel" onClose={onClose} />
            </section>
          )}
        </nav>

        <div className="px-6 pb-6 pt-3">
          <div
            className="radius-stadium px-5 py-4"
            style={{
              border: '1px solid rgba(0,0,0,0.05)',
              background: 'var(--ink)',
              color: 'var(--canvas)',
            }}
          >
            <p className="eyebrow" style={{ color: 'color-mix(in srgb, var(--canvas) 72%, transparent)' }}>
              Status
            </p>
            <p className="mt-1 text-[1.02rem] font-semibold">Institutional Grade</p>
          </div>
        </div>
      </aside>
    </>
  );
}
