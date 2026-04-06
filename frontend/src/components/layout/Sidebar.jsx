import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, TrendingUp, CreditCard, Target, PiggyBank,
  LineChart, Bot, FileText, User, ShieldCheck, X, Wallet, Bell, LogOut
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
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-[1px]" onClick={onClose} />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-56 flex flex-col
          border-r border-base transition-transform duration-200 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        style={{ backgroundColor: 'var(--surface)' }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-14 px-4 border-b border-base flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
              <Wallet className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-main font-semibold text-sm">FinTrack</span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-muted hover:text-main transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
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
              <div className="my-2 border-t border-base" />
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

        {/* Footer */}
        <div className="p-3 border-t border-base flex-shrink-0">
          <div className="flex items-center gap-2.5 px-2 py-2 mb-1">
            <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-main text-xs font-medium truncate">{user?.name}</p>
              <p className="text-muted text-xs truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="nav-link w-full text-rose-500 hover:text-rose-400 hover:!bg-rose-500/10"
          >
            <LogOut className="w-3.5 h-3.5 flex-shrink-0" />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
