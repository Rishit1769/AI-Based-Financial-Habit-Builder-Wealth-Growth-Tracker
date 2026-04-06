import { useState, useEffect } from 'react';
import { Users, BarChart2, TrendingUp, Shield, Search, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { getUsers, toggleUser, getStats, getActivity, deleteUser } from '../services/adminService';
import { formatCurrency, formatDate } from '../utils/constants';
import Card from '../components/common/Card';
import StatCard from '../components/common/StatCard';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import toast from 'react-hot-toast';

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const PER_PAGE = 10;

  const loadAll = async (q = '', p = 1) => {
    try {
      const [u, s, a] = await Promise.all([
        getUsers({ search: q, page: p, limit: PER_PAGE }),
        getStats(),
        getActivity(),
      ]);
      setUsers(u.data.data.users || u.data.data);
      setTotal(u.data.data.total || 0);
      setStats(s.data.data);
      setActivity(a.data.data || []);
    } catch { toast.error('Failed to load admin data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadAll(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    loadAll(search, 1);
  };

  const handleToggle = async (u) => {
    try {
      await toggleUser(u.id);
      toast.success(`${u.name} ${u.is_active ? 'deactivated' : 'activated'}`);
      loadAll(search, page);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (u) => {
    if (!confirm(`Permanently delete user "${u.name}"? This cannot be undone.`)) return;
    try { await deleteUser(u.id); toast.success('User deleted'); loadAll(search, page); }
    catch { toast.error('Failed to delete user'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
          <Shield className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-main">Admin Dashboard</h1>
          <p className="text-sub text-sm">Platform management & analytics</p>
        </div>
      </div>

      {/* Platform stats */}
      {loading ? <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[1,2,3,4].map((i) => <div key={i} className="h-24 bg-elevated rounded-xl animate-pulse" />)}</div> : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Users" value={stats?.totalUsers || 0} icon={Users} color="indigo" />
          <StatCard title="Active Users" value={stats?.activeUsers || 0} icon={Users} color="emerald" />
          <StatCard title="Total Income" value={formatCurrency(stats?.totalIncome || 0)} icon={TrendingUp} color="emerald" />
          <StatCard title="Total Expenses" value={formatCurrency(stats?.totalExpenses || 0)} icon={BarChart2} color="rose" />
        </div>
      )}

      {/* Monthly activity chart */}
      {activity.length > 0 && (
        <Card title="Monthly Platform Activity">
          <div className="px-5 pb-5">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={activity}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fill: 'var(--text-2)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-2)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--elevated)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)' }} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="new_users" name="New Users" fill="#6366f1" radius={[3,3,0,0]} />
                <Bar dataKey="transactions" name="Transactions" fill="#10b981" radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* User management */}
      <Card title="User Management">
        <div className="px-5 pb-5">
          <form onSubmit={handleSearch} className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="field pl-9" />
            </div>
            <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg transition-colors">Search</button>
          </form>

          {loading ? <LoadingSkeleton rows={5} /> : users.length === 0 ? (
            <p className="text-muted text-sm text-center py-6">No users found</p>
          ) : (
            <>
              <div className="space-y-2">
                {users.map((u) => (
                  <div key={u.id} className="flex items-center justify-between p-3 bg-elevated rounded-lg hover:bg-hover transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                        {u.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-main truncate">{u.name}</p>
                          {u.role === 'admin' && <span className="text-xs bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded">Admin</span>}
                          {!u.is_active && <span className="text-xs bg-rose-500/20 text-rose-400 px-1.5 py-0.5 rounded">Inactive</span>}
                        </div>
                        <p className="text-xs text-muted truncate">{u.email} · Joined {formatDate(u.created_at)}</p>
                      </div>
                    </div>
                    {u.role !== 'admin' && (
                      <div className="flex gap-1.5 flex-shrink-0 ml-3">
                        <button onClick={() => handleToggle(u)}
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-lg transition-colors ${u.is_active ? 'bg-elevated hover:bg-hover text-sub' : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400'}`}>
                          {u.is_active ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                          {u.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button onClick={() => handleDelete(u)}
                          className="p-1.5 text-muted hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {total > PER_PAGE && (
                <div className="flex items-center justify-between mt-4 text-sm text-sub">
                  <span>Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, total)} of {total}</span>
                  <div className="flex gap-2">
                    <button disabled={page === 1} onClick={() => { setPage(page - 1); loadAll(search, page - 1); }}
                      className="px-3 py-1 bg-elevated rounded-lg hover:bg-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed">Prev</button>
                    <button disabled={page * PER_PAGE >= total} onClick={() => { setPage(page + 1); loadAll(search, page + 1); }}
                      className="px-3 py-1 bg-elevated rounded-lg hover:bg-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed">Next</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
