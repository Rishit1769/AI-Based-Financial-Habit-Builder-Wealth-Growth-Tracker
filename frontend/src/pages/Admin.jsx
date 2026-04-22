import { useState, useEffect, useCallback } from 'react';
import {
  Users, BarChart2, TrendingUp, Shield, Search, Trash2,
  ToggleLeft, ToggleRight, Activity, MessageSquare, CheckCircle2,
  Clock, XCircle, RefreshCw, AlertTriangle, Wallet, Target,
  TrendingDown, BookOpen, FileText, LayoutDashboard,
} from 'lucide-react';
import {
  getUsers, toggleUser, getStats, getActivity, deleteUser,
  getFeedback, updateFeedbackStatus, deleteFeedback,
} from '../services/adminService';
import { formatCurrency, formatDate } from '../utils/constants';
import Card from '../components/common/Card';
import StatCard from '../components/common/StatCard';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import toast from 'react-hot-toast';

const TABS = [
  { id: 'overview',  label: 'Overview',  icon: LayoutDashboard },
  { id: 'users',     label: 'Users',     icon: Users },
  { id: 'activity',  label: 'Activity',  icon: Activity },
  { id: 'feedback',  label: 'Feedback',  icon: MessageSquare },
];

const PER_PAGE = 10;

function StatusBadge({ status }) {
  const map = {
    open:      'bg-amber-500/15 text-amber-400',
    in_review: 'bg-indigo-500/15 text-indigo-400',
    resolved:  'bg-emerald-500/15 text-emerald-400',
    closed:    'bg-zinc-500/15 text-zinc-400',
  };
  const labels = { open: 'Open', in_review: 'In Review', resolved: 'Resolved', closed: 'Closed' };
  return (
    <span className={`text-xs px-2 py-0.5 rounded font-medium ${map[status] || 'bg-zinc-500/15 text-zinc-400'}`}>
      {labels[status] || status}
    </span>
  );
}

function TypeBadge({ type }) {
  const map = {
    bug:       'bg-rose-500/15 text-[var(--color-terracotta)]',
    feature:   'bg-blue-500/15 text-blue-400',
    complaint: 'bg-orange-500/15 text-orange-400',
    feedback:  'bg-purple-500/15 text-purple-400',
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded capitalize ${map[type] || 'bg-zinc-500/15 text-zinc-400'}`}>
      {type}
    </span>
  );
}

export default function Admin() {
  const [tab, setTab]           = useState('overview');
  const [stats, setStats]       = useState(null);
  const [activity, setActivity] = useState([]);
  const [users, setUsers]       = useState([]);
  const [userTotal, setUserTotal] = useState(0);
  const [feedback, setFeedback] = useState([]);
  const [fbTotal, setFbTotal]   = useState(0);
  const [loading, setLoading]   = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [fbLoading, setFbLoading]       = useState(false);
  const [search, setSearch]     = useState('');
  const [userPage, setUserPage] = useState(1);
  const [fbPage, setFbPage]     = useState(1);
  const [fbStatus, setFbStatus] = useState('all');
  const [expandedFb, setExpandedFb] = useState(null);

  // â”€â”€ Initial load (stats + activity + first-page users) â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    (async () => {
      try {
        const [s, a, u] = await Promise.all([
          getStats(),
          getActivity(),
          getUsers({ page: 1, limit: PER_PAGE }),
        ]);
        setStats(s.data.data);
        const raw = a.data.data;
        // Normalise activity data into chart format
        const months = [...new Set([
          ...raw.users.map((r) => r.month),
          ...raw.income.map((r) => r.month),
          ...raw.expenses.map((r) => r.month),
        ])];
        setActivity(months.map((m) => ({
          month: m,
          new_users:    Number(raw.users.find((r) => r.month === m)?.total || 0),
          income:       Number(raw.income.find((r) => r.month === m)?.total || 0),
          expenses:     Number(raw.expenses.find((r) => r.month === m)?.total || 0),
        })));
        const ud = u.data;
        setUsers(ud.data || []);
        setUserTotal(ud.pagination?.total || 0);
      } catch { toast.error('Failed to load admin data'); }
      finally { setLoading(false); }
    })();
  }, []);

  // â”€â”€ Feedback loader â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const loadFeedback = useCallback(async (status = fbStatus, page = fbPage) => {
    setFbLoading(true);
    try {
      const res = await getFeedback({ status, page, limit: PER_PAGE });
      setFeedback(res.data.data || []);
      setFbTotal(res.data.pagination?.total || 0);
    } catch { toast.error('Failed to load feedback'); }
    finally { setFbLoading(false); }
  }, [fbStatus, fbPage]);

  // Load feedback when tab switches to 'feedback'
  useEffect(() => {
    if (tab === 'feedback') loadFeedback(fbStatus, fbPage);
  }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps

  // â”€â”€ Users loader â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const loadUsers = async (q = search, page = userPage) => {
    setUsersLoading(true);
    try {
      const res = await getUsers({ search: q, page, limit: PER_PAGE });
      setUsers(res.data.data || []);
      setUserTotal(res.data.pagination?.total || 0);
    } catch { toast.error('Failed to load users'); }
    finally { setUsersLoading(false); }
  };

  const handleToggle = async (u) => {
    try {
      await toggleUser(u.id);
      toast.success(`${u.name} ${u.is_active ? 'deactivated' : 'activated'}`);
      loadUsers(search, userPage);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (u) => {
    if (!confirm(`Permanently delete user "${u.name}"? This cannot be undone.`)) return;
    try { await deleteUser(u.id); toast.success('User deleted'); loadUsers(search, userPage); }
    catch { toast.error('Failed to delete user'); }
  };

  const handleFbStatus = async (fid, status, notes) => {
    try {
      await updateFeedbackStatus(fid, { status, admin_notes: notes });
      toast.success('Status updated');
      loadFeedback(fbStatus, fbPage);
      setExpandedFb(null);
    } catch { toast.error('Failed to update'); }
  };

  const handleFbDelete = async (fid) => {
    if (!confirm('Delete this feedback item?')) return;
    try { await deleteFeedback(fid); toast.success('Deleted'); loadFeedback(fbStatus, fbPage); }
    catch { toast.error('Failed to delete'); }
  };

  // â”€â”€ Derived numbers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const chartIncExp = activity.map((a) => ({
    month:    a.month,
    Income:   a.income,
    Expenses: a.expenses,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10   bg-amber-500/15 flex items-center justify-center">
            <Shield className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-[var(--color-ink)]">Admin Dashboard</h1>
            <p className="text-sub text-sm">Platform management & analytics</p>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 p-1 bg-elevated   w-fit">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm   transition-colors font-medium ${
              tab === id ? 'bg-surface text-[var(--color-ink)] ' : 'text-[var(--color-muted)] hover:text-sub'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* â”€â”€ OVERVIEW TAB â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {tab === 'overview' && (
        <div className="space-y-6">
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[1,2,3,4].map((i) => <div key={i} className="h-24 bg-elevated   animate-pulse" />)}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Users"      value={stats?.users?.total || 0}       icon={Users}        color="indigo" />
                <StatCard title="Active Users"     value={stats?.users?.active || 0}      icon={Users}        color="emerald" />
                <StatCard title="New This Month"   value={stats?.users?.new_this_month || 0} icon={TrendingUp} color="blue" />
                <StatCard title="Total Reports"    value={stats?.totalReports || 0}        icon={FileText}     color="violet" />
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Income"     value={formatCurrency(stats?.totalIncome || 0)}      icon={TrendingUp}   color="emerald" />
                <StatCard title="Total Expenses"   value={formatCurrency(stats?.totalExpenses || 0)}    icon={TrendingDown} color="rose" />
                <StatCard title="Investments"      value={formatCurrency(stats?.totalInvestments || 0)} icon={BarChart2}    color="amber" />
                <StatCard title="Savings Saved"    value={formatCurrency(stats?.savingsGoals?.saved || 0)} icon={Wallet}   color="cyan" />
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Active Habits"    value={stats?.totalHabits || 0}                      icon={RefreshCw}  color="purple" />
                <StatCard title="Savings Goals"    value={stats?.savingsGoals?.total || 0}              icon={Target}     color="pink" />
                <StatCard title="AI Conversations" value="â€”"                                            icon={BookOpen}   color="sky" />
                <StatCard title="Notifications"    value="â€”"                                            icon={AlertTriangle} color="orange" />
              </div>
            </>
          )}
        </div>
      )}

      {/* â”€â”€ ACTIVITY TAB â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {tab === 'activity' && (
        <div className="space-y-6">
          <Card title="Monthly New Users">
            <div className="px-5 pb-5">
              {activity.length === 0 ? (
                <p className="text-[var(--color-muted)] text-sm text-center py-8">No activity data</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={activity}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-ink)" />
                    <XAxis dataKey="month" tick={{ fill: 'var(--text-2)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'var(--text-2)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-ink)', borderRadius: '8px', color: 'var(--text)' }} />
                    <Bar dataKey="new_users" name="New Users" fill="#6366f1" radius={[3,3,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>

          <Card title="Monthly Income vs Expenses">
            <div className="px-5 pb-5">
              {chartIncExp.length === 0 ? (
                <p className="text-[var(--color-muted)] text-sm text-center py-8">No data</p>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={chartIncExp}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-ink)" />
                    <XAxis dataKey="month" tick={{ fill: 'var(--text-2)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'var(--text-2)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `â‚¹${v >= 1000 ? `${(v/1000).toFixed(0)}K` : v}`} />
                    <Tooltip
                      contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-ink)', borderRadius: '8px', color: 'var(--text)' }}
                      formatter={(v) => [`â‚¹${Number(v).toLocaleString('en-IN')}`, undefined]}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Line type="monotone" dataKey="Income"   stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="Expenses" stroke="#f43f5e" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>

          {/* Platform summary tiles */}
          <Card title="Platform Totals">
            <div className="px-5 pb-5 grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: 'Total Income',     value: formatCurrency(stats?.totalIncome || 0),      color: 'text-emerald-400' },
                { label: 'Total Expenses',   value: formatCurrency(stats?.totalExpenses || 0),    color: 'text-[var(--color-terracotta)]' },
                { label: 'Investments',      value: formatCurrency(stats?.totalInvestments || 0), color: 'text-amber-400' },
                { label: 'Savings Saved',    value: formatCurrency(stats?.savingsGoals?.saved || 0), color: 'text-cyan-400' },
                { label: 'Active Habits',    value: stats?.totalHabits || 0,                      color: 'text-purple-400' },
                { label: 'Savings Goals',    value: stats?.savingsGoals?.total || 0,              color: 'text-pink-400' },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-elevated   p-4">
                  <p className="text-xs text-[var(--color-muted)] mb-1">{label}</p>
                  <p className={`text-lg font-semibold ${color}`}>{value}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* â”€â”€ USERS TAB â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {tab === 'users' && (
        <Card title="User Management">
          <div className="px-5 pb-5">
            <form onSubmit={(e) => { e.preventDefault(); setUserPage(1); loadUsers(search, 1); }} className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted)]" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or email..."
                  className="field pl-9"
                />
              </div>
              <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm   transition-colors">Search</button>
            </form>

            {usersLoading ? <LoadingSkeleton rows={5} /> : users.length === 0 ? (
              <p className="text-[var(--color-muted)] text-sm text-center py-6">No users found</p>
            ) : (
              <>
                <div className="space-y-2">
                  {users.map((u) => (
                    <div key={u.id} className="flex items-center justify-between p-3 bg-elevated   hover:bg-hover transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8   bg-indigo-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                          {u.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-medium text-[var(--color-ink)] truncate">{u.name}</p>
                            {u.role === 'admin' && <span className="text-xs bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded">Admin</span>}
                            {!u.is_active && <span className="text-xs bg-rose-500/20 text-[var(--color-terracotta)] px-1.5 py-0.5 rounded">Inactive</span>}
                          </div>
                          <p className="text-xs text-[var(--color-muted)] truncate">{u.email} Â· Joined {formatDate(u.created_at)}</p>
                        </div>
                      </div>
                      {u.role !== 'admin' && (
                        <div className="flex gap-1.5 flex-shrink-0 ml-3">
                          <button
                            onClick={() => handleToggle(u)}
                            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs   transition-colors ${
                              u.is_active ? 'bg-elevated hover:bg-hover text-sub' : 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400'
                            }`}
                          >
                            {u.is_active ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                            {u.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleDelete(u)}
                            className="p-1.5 text-[var(--color-muted)] hover:text-[var(--color-terracotta)] hover:bg-rose-500/10   transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {userTotal > PER_PAGE && (
                  <div className="flex items-center justify-between mt-4 text-sm text-sub">
                    <span>Showing {(userPage - 1) * PER_PAGE + 1}â€“{Math.min(userPage * PER_PAGE, userTotal)} of {userTotal}</span>
                    <div className="flex gap-2">
                      <button disabled={userPage === 1} onClick={() => { const p = userPage - 1; setUserPage(p); loadUsers(search, p); }}
                        className="px-3 py-1 bg-elevated   hover:bg-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed">Prev</button>
                      <button disabled={userPage * PER_PAGE >= userTotal} onClick={() => { const p = userPage + 1; setUserPage(p); loadUsers(search, p); }}
                        className="px-3 py-1 bg-elevated   hover:bg-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed">Next</button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </Card>
      )}

      {/* â”€â”€ FEEDBACK TAB â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {tab === 'feedback' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            {['all', 'open', 'in_review', 'resolved', 'closed'].map((s) => (
              <button
                key={s}
                onClick={() => { setFbStatus(s); setFbPage(1); loadFeedback(s, 1); }}
                className={`px-3 py-1.5 text-sm   capitalize transition-colors font-medium ${
                  fbStatus === s
                    ? 'bg-indigo-600 text-white'
                    : 'bg-elevated text-sub hover:bg-hover'
                }`}
              >
                {s === 'in_review' ? 'In Review' : s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          <Card title={`Feedback & Issues ${fbTotal > 0 ? `(${fbTotal})` : ''}`}>
            <div className="px-5 pb-5">
              {fbLoading ? <LoadingSkeleton rows={4} /> : feedback.length === 0 ? (
                <div className="text-center py-10">
                  <MessageSquare className="w-10 h-10 text-[var(--color-muted)] mx-auto mb-3 opacity-40" />
                  <p className="text-[var(--color-muted)] text-sm">No feedback items</p>
                  <p className="text-[var(--color-muted)] text-xs mt-1">Feedback submitted by users will appear here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {feedback.map((f) => (
                    <div key={f.id} className="bg-elevated   overflow-hidden">
                      <div
                        className="flex items-start justify-between p-4 cursor-pointer hover:bg-hover transition-colors"
                        onClick={() => setExpandedFb(expandedFb === f.id ? null : f.id)}
                      >
                        <div className="flex-1 min-w-0 pr-4">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <TypeBadge type={f.type} />
                            <StatusBadge status={f.status} />
                            <span className="text-xs text-[var(--color-muted)]">{formatDate(f.created_at)}</span>
                          </div>
                          <p className="text-sm font-medium text-[var(--color-ink)] truncate">{f.subject}</p>
                          <p className="text-xs text-[var(--color-muted)] mt-0.5">{f.user_name} Â· {f.user_email}</p>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleFbDelete(f.id); }}
                          className="p-1.5 text-[var(--color-muted)] hover:text-[var(--color-terracotta)] hover:bg-rose-500/10   transition-colors flex-shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {expandedFb === f.id && (
                        <div className="px-4 pb-4 border-t border-[var(--color-ink)]">
                          <p className="text-sm text-sub mt-3 leading-relaxed">{f.message}</p>
                          {f.admin_notes && (
                            <div className="mt-3 p-3 bg-surface  ">
                              <p className="text-xs text-[var(--color-muted)] mb-1 font-medium">Admin Notes</p>
                              <p className="text-sm text-sub">{f.admin_notes}</p>
                            </div>
                          )}
                          <div className="flex gap-2 mt-4 flex-wrap">
                            {['open', 'in_review', 'resolved', 'closed'].map((s) => (
                              <button
                                key={s}
                                disabled={f.status === s}
                                onClick={() => handleFbStatus(f.id, s, f.admin_notes)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs   transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                                  f.status === s
                                    ? 'bg-indigo-600/30 text-indigo-300'
                                    : 'bg-elevated hover:bg-hover text-sub'
                                }`}
                              >
                                {s === 'resolved' && <CheckCircle2 className="w-3 h-3" />}
                                {s === 'in_review' && <Clock className="w-3 h-3" />}
                                {s === 'closed' && <XCircle className="w-3 h-3" />}
                                {s === 'in_review' ? 'In Review' : s.charAt(0).toUpperCase() + s.slice(1)}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {fbTotal > PER_PAGE && (
                <div className="flex items-center justify-between mt-4 text-sm text-sub">
                  <span>Showing {(fbPage - 1) * PER_PAGE + 1}â€“{Math.min(fbPage * PER_PAGE, fbTotal)} of {fbTotal}</span>
                  <div className="flex gap-2">
                    <button disabled={fbPage === 1} onClick={() => { const p = fbPage - 1; setFbPage(p); loadFeedback(fbStatus, p); }}
                      className="px-3 py-1 bg-elevated   hover:bg-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed">Prev</button>
                    <button disabled={fbPage * PER_PAGE >= fbTotal} onClick={() => { const p = fbPage + 1; setFbPage(p); loadFeedback(fbStatus, p); }}
                      className="px-3 py-1 bg-elevated   hover:bg-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed">Next</button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
