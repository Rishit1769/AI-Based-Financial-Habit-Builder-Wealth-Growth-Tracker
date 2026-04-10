import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, TrendingUp, CreditCard, Target, PiggyBank,
  LineChart, Bot, FileText, User, ShieldCheck, X, Bell, LogOut,
  Settings, HelpCircle, Wallet, Zap
} from 'lucide-react';

const navItems = [
  { to: '/dashboard',     icon: LayoutDashboard, label: 'Portfolio' },
  { to: '/income',        icon: TrendingUp,      label: 'Income' },
  { to: '/expenses',      icon: CreditCard,      label: 'Transactions' },
  { to: '/habits',        icon: Target,          label: 'Goals & Habits' },
  { to: '/savings',       icon: PiggyBank,       label: 'Savings' },
  { to: '/investments',   icon: LineChart,       label: 'Investments' },
  { to: '/ai-advisor',    icon: Bot,             label: 'AI Advisor' },
  { to: '/reports',       icon: FileText,        label: 'Documents' },
  { to: '/notifications', icon: Bell,            label: 'Notifications' },
];

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
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 flex flex-col
          transition-transform duration-200 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        style={{
          width: '220px',
          backgroundColor: 'var(--surface)',
          borderRight: '1px solid var(--border)',
        }}
      >
        {/* Brand */}
        <div className="flex items-center justify-between h-16 px-5 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 grad-brand rounded-lg flex items-center justify-center flex-shrink-0">
              <Wallet className="w-3.5 h-3.5 text-black" />
            </div>
            <span className="font-bold text-sm text-main tracking-tight">FinTrack</span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-muted hover:text-main transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <Icon className="w-3.5 h-3.5 flex-shrink-0" />
              {label}
            </NavLink>
          ))}

          {user?.role === 'admin' && (
            <>
              <div className="my-3 divider mx-1" />
              <NavLink
                to="/admin"
                onClick={onClose}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
                Admin Panel
              </NavLink>
            </>
          )}
        </nav>

        {/* Bottom section — Atelier-style */}
        <div className="px-3 pb-4 flex-shrink-0 space-y-0.5" style={{ borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
          {/* User info */}
          <div className="px-2.5 py-3 mb-2 rounded-xl" style={{ background: 'var(--elevated)' }}>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-7 h-7 grad-brand rounded-md flex items-center justify-center text-black font-bold text-xs flex-shrink-0">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-main text-xs font-semibold truncate">{user?.name}</p>
                <div className="inline-flex items-center gap-1 mt-0.5">
                  <Zap className="w-2.5 h-2.5" style={{ color: 'var(--accent)' }} />
                  <span className="font-semibold uppercase" style={{ fontSize: '9px', color: 'var(--accent)', letterSpacing: '0.06em' }}>Pro Plan</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => { navigate('/profile'); onClose(); }}
              className="w-full py-1.5 rounded-lg text-xs font-semibold transition-colors"
              style={{ background: 'var(--accent)', color: '#000', letterSpacing: '-0.01em' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}
            >
              Manage Account
            </button>
          </div>

          {/* Settings & Support */}
          <NavLink to="/profile" onClick={onClose} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Settings className="w-3.5 h-3.5 flex-shrink-0" />
            Settings
          </NavLink>
          <button
            onClick={handleLogout}
            className="nav-link w-full text-left"
            style={{ color: 'var(--danger)' }}
          >
            <LogOut className="w-3.5 h-3.5 flex-shrink-0" />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}

const navItems = [
  { to: '/dashboard',     icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/income',        icon: TrendingUp,      label: 'Income' },
  { to: '/expenses',      icon: CreditCard,      label: 'Expenses' },
  { to: '/habits',        icon: Target,          label: 'Habits' },
  { to: '/savings',       icon: PiggyBank,       label: 'Savings Goals' },
  { to: '/investments',   icon: LineChart,       label: 'Investments' },
  { to: '/ai-advisor',    icon: Bot,             label: 'AI Advisor' },
  { to: '/reports',       icon: FileText,        label: 'Reports' },
  { to: '/notifications', icon: Bell,            label: 'Notifications' },
  { to: '/profile',       icon: User,            label: 'Profile' },
];

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
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)' }}
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 flex flex-col
          border-r transition-transform duration-200 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        style={{
          width: '224px',
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
        }}
      >
        {/* Brand */}
        <div
          className="flex items-center justify-between h-14 px-4 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg grad-brand flex items-center justify-center flex-shrink-0">
              <Wallet className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-sm text-main tracking-tight">FinTrack</span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-muted hover:text-main transition-colors p-1.5 rounded-md hover:bg-[var(--elevated)]"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2.5 py-3 space-y-0.5 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <Icon className="w-3.5 h-3.5 flex-shrink-0 opacity-70" />
              {label}
            </NavLink>
          ))}

          {user?.role === 'admin' && (
            <>
              <div className="my-3 divider mx-1" />
              <NavLink
                to="/admin"
                onClick={onClose}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0 opacity-70" />
                Admin Panel
              </NavLink>
            </>
          )}
        </nav>

        {/* User footer */}
        <div className="px-2.5 py-3 flex-shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
          <div
            className="flex items-center gap-2.5 px-2 py-2 mb-1 rounded-lg"
            style={{ background: 'var(--elevated)' }}
          >
            <div
              className="w-7 h-7 rounded-md grad-brand flex items-center justify-center text-white font-semibold text-xs flex-shrink-0"
            >
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-main text-xs font-medium truncate">{user?.name}</p>
              <p className="text-muted truncate" style={{ fontSize: '10px' }}>{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="nav-link w-full mt-0.5"
            style={{ color: 'var(--danger)' }}
          >
            <LogOut className="w-3.5 h-3.5 flex-shrink-0 opacity-80" />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
