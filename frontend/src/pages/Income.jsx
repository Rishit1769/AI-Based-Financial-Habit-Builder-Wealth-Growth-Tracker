import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, TrendingUp, Download } from 'lucide-react';
import { getAll, create, update, remove, getSummary } from '../services/incomeService';
import { formatCurrency, formatDate, INCOME_CATEGORIES } from '../utils/constants';
import { exportToCsv } from '../utils/exportCsv';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import StatCard from '../components/common/StatCard';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

const EMPTY = { source: '', amount: '', category: 'salary', notes: '', date: new Date().toISOString().split('T')[0] };

export default function Income() {
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const [r, s] = await Promise.all([getAll(), getSummary({ year: new Date().getFullYear() })]);
      setRecords(r.data.data);
      setSummary(s.data.data);
    } catch { toast.error('Failed to load income records'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm(EMPTY); setModal(true); };
  const openEdit = (r) => { setEditing(r); setForm({ source: r.source, amount: r.amount, category: r.category, notes: r.notes || '', date: r.date?.split('T')[0] || '' }); setModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await update(editing.id, form);
        toast.success('Income record updated');
      } else {
        await create(form);
        toast.success('Income record added');
      }
      setModal(false);
      load();
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this income record?')) return;
    try { await remove(id); toast.success('Deleted'); load(); }
    catch { toast.error('Failed to delete'); }
  };

  // Build monthly chart data
  const monthlyData = summary?.monthly
    ? Array.from({ length: 12 }, (_, i) => {
        const monthRows = summary.monthly.filter((r) => Number(r.month) === i + 1);
        return { month: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i], total: monthRows.reduce((s, r) => s + Number(r.total), 0) };
      })
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-main">Income</h1>
          <p className="text-sub text-sm mt-0.5">Track and manage your income sources</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => exportToCsv(records, ['source','amount','category','date','notes'], ['Source','Amount','Category','Date','Notes'], 'income')} icon={Download}>Export CSV</Button>
          <Button onClick={openAdd} icon={Plus}>Add Income</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard title="Total This Year" value={formatCurrency(summary?.totalYear || 0)} icon={TrendingUp} color="emerald" />
        <StatCard title="Total Records" value={records.length} icon={TrendingUp} color="indigo" />
      </div>

      {/* Chart */}
      <Card title="Monthly Income (This Year)">
        <div className="px-5 pb-5">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fill: 'var(--text-2)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-2)', fontSize: 11 }} axisLine={false} tickLine={false}
                tickFormatter={(v) => `₹${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
              <Tooltip
                contentStyle={{ background: 'var(--elevated)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)' }}
                formatter={(v) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Income']}
              />
              <Bar dataKey="total" fill="#10b981" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Records table */}
      <Card title="Income Records">
        <div className="px-5 pb-5">
          {loading ? <LoadingSkeleton rows={5} /> : records.length === 0 ? (
            <p className="text-muted text-sm text-center py-8">No income records yet. Add your first one!</p>
          ) : (
            <div className="space-y-2 mt-2">
              {records.map((r) => (
                <div key={r.id} className="flex items-center justify-between p-3 bg-elevated rounded-lg hover:bg-hover transition-colors group">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-main truncate">{r.source}</p>
                      <p className="text-xs text-muted capitalize">{r.category} · {formatDate(r.date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-3">
                    <span className="text-emerald-400 font-semibold text-sm whitespace-nowrap">+{formatCurrency(r.amount)}</span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(r)} className="p-1.5 text-muted hover:text-main hover:bg-hover rounded transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(r.id)} className="p-1.5 text-muted hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Income' : 'Add Income'}>
        <form onSubmit={handleSave} className="space-y-4">
          <Input label="Source" placeholder="e.g. Salary, Freelance" value={form.source}
            onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))} required />
          <Input label="Amount (₹)" type="number" placeholder="0.00" min="0" step="0.01"
            value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} required />
          <div>
            <label className="text-xs font-medium text-sub block mb-1">Category</label>
            <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="field capitalize">
              {INCOME_CATEGORIES.map((c) => <option key={c} value={c} className="capitalize">{c}</option>)}
            </select>
          </div>
          <Input label="Date" type="date" value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} required />
          <Input label="Notes (optional)" placeholder="Any notes..." value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModal(false)} className="flex-1">Cancel</Button>
            <Button type="submit" loading={saving} className="flex-1">{editing ? 'Update' : 'Add'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
