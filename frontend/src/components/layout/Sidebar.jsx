import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, TrendingUp, CreditCard, Target, PiggyBank,
  LineChart, Bot, FileText, User, ShieldCheck, X, Bell, LogOut,
  Wallet
} from 'lucide-react';

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
