import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, ShoppingCart, Download } from 'lucide-react';
import { getAll, create, update, remove, getSummary } from '../services/expenseService';
import { formatCurrency, formatDate, EXPENSE_CATEGORIES, categoryColors } from '../utils/constants';
import { exportToCsv } from '../utils/exportCsv';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import StatCard from '../components/common/StatCard';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import ExpensePieChart from '../components/charts/ExpensePieChart';
import ExpenseAreaChart from '../components/charts/ExpenseAreaChart';
import toast from 'react-hot-toast';

const EMPTY = { description: '', amount: '', category: 'food', notes: '', date: new Date().toISOString().split('T')[0] };

export default function Expenses() {
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [filterCat, setFilterCat] = useState('all');

  const load = async () => {
    try {
      const [r, s] = await Promise.all([getAll(), getSummary()]);
      setRecords(r.data.data);
      setSummary(s.data.data);
    } catch { toast.error('Failed to load expense records'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm(EMPTY); setModal(true); };
  const openEdit = (r) => { setEditing(r); setForm({ description: r.description, amount: r.amount, category: r.category, notes: r.notes || '', date: r.date?.split('T')[0] || '' }); setModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) { await update(editing.id, form); toast.success('Expense updated'); }
      else { await create(form); toast.success('Expense added'); }
      setModal(false);
      load();
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this expense?')) return;
    try { await remove(id); toast.success('Deleted'); load(); }
    catch { toast.error('Failed to delete'); }
  };

  const filtered = filterCat === 'all' ? records : records.filter((r) => r.category === filterCat);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-main">Expenses</h1>
          <p className="text-sub text-sm mt-0.5">Monitor and manage your spending</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => exportToCsv(records, ['description','amount','category','date','notes'], ['Description','Amount','Category','Date','Notes'], 'expenses')} icon={Download}>Export CSV</Button>
          <Button onClick={openAdd} icon={Plus}>Add Expense</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard title="Total This Month" value={formatCurrency(summary?.total || 0)} icon={ShoppingCart} color="rose" />
        <StatCard title="Total Records" value={records.length} icon={ShoppingCart} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ExpensePieChart data={summary?.byCategory} />
        <ExpenseAreaChart data={summary?.byMonth} />
      </div>

      {/* Records */}
      <Card title="Expense Records">
        <div className="px-5 pb-5">
          {/* Category filter */}
          <div className="flex gap-2 flex-wrap mb-3">
            <button onClick={() => setFilterCat('all')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filterCat === 'all' ? 'bg-indigo-600 text-white' : 'bg-elevated text-sub hover:text-main'}`}>All</button>
            {EXPENSE_CATEGORIES.map((c) => (
              <button key={c.value} onClick={() => setFilterCat(c.value)}
                className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-colors ${filterCat === c.value ? 'bg-indigo-600 text-white' : 'bg-elevated text-sub hover:text-main'}`}>{c.label}</button>
            ))}
          </div>
          {loading ? <LoadingSkeleton rows={5} /> : filtered.length === 0 ? (
            <p className="text-muted text-sm text-center py-8">No expense records found.</p>
          ) : (
            <div className="space-y-2">
              {filtered.map((r) => (
                <div key={r.id} className="flex items-center justify-between p-3 bg-elevated rounded-lg hover:bg-hover transition-colors group">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: (categoryColors[r.category] || '#64748b') + '30' }}>
                      <ShoppingCart className="w-4 h-4" style={{ color: categoryColors[r.category] || '#64748b' }} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-main truncate">{r.description}</p>
                      <p className="text-xs text-muted capitalize">{r.category} · {formatDate(r.date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-3">
                    <span className="text-rose-400 font-semibold text-sm whitespace-nowrap">-{formatCurrency(r.amount)}</span>
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

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Expense' : 'Add Expense'}>
        <form onSubmit={handleSave} className="space-y-4">
          <Input label="Description" placeholder="e.g. Groceries, Rent" value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} required />
          <Input label="Amount (₹)" type="number" placeholder="0.00" min="0" step="0.01"
            value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} required />
          <div>
            <label className="text-xs font-medium text-sub block mb-1">Category</label>
            <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="field capitalize">
              {EXPENSE_CATEGORIES.map((c) => <option key={c.value} value={c.value} className="capitalize">{c.label}</option>)}
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
