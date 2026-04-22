import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, TrendingUp, TrendingDown, Download } from 'lucide-react';
import { getAll, create, update, remove, getSummary } from '../services/investmentService';
import { formatCurrency, formatDate, INVESTMENT_TYPES } from '../utils/constants';
import { exportToCsv } from '../utils/exportCsv';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import StatCard from '../components/common/StatCard';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import InvestmentChart from '../components/charts/InvestmentChart';
import toast from 'react-hot-toast';

const EMPTY = { asset_name: '', asset_type: 'stock', amount_invested: '', current_value: '', date_added: new Date().toISOString().split('T')[0], notes: '' };

export default function Investments() {
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const [r, s] = await Promise.all([getAll(), getSummary()]);
      setRecords(r.data.data);
      setSummary(s.data.data);
    } catch { toast.error('Failed to load investments'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm(EMPTY); setModal(true); };
  const openEdit = (r) => {
    setEditing(r);
    setForm({ asset_name: r.asset_name, asset_type: r.asset_type, amount_invested: r.amount_invested, current_value: r.current_value, date_added: r.date_added?.split('T')[0] || '', notes: r.notes || '' });
    setModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) { await update(editing.id, form); toast.success('Investment updated'); }
      else { await create(form); toast.success('Investment added'); }
      setModal(false);
      load();
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this investment?')) return;
    try { await remove(id); toast.success('Deleted'); load(); }
    catch { toast.error('Failed to delete'); }
  };

  const totalInvested = summary?.totalInvested || records.reduce((s, r) => s + Number(r.amount_invested), 0);
  const totalCurrent = summary?.totalCurrent || records.reduce((s, r) => s + Number(r.current_value), 0);
  const totalGain = totalCurrent - totalInvested;
  const gainPct = totalInvested > 0 ? ((totalGain / totalInvested) * 100).toFixed(2) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--color-ink)]">Investments</h1>
          <p className="text-sub text-sm mt-0.5">Track your portfolio growth</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => exportToCsv(records, ['name','type','amount_invested','current_value','purchase_date','notes'], ['Name','Type','Invested','Current Value','Purchase Date','Notes'], 'investments')} icon={Download}>Export CSV</Button>
          <Button onClick={openAdd} icon={Plus}>Add Investment</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Invested" value={formatCurrency(totalInvested)} icon={TrendingUp} color="indigo" />
        <StatCard title="Current Value" value={formatCurrency(totalCurrent)} icon={TrendingUp} color="purple" />
        <StatCard
          title="Total Gain/Loss"
          value={`${totalGain >= 0 ? '+' : ''}${formatCurrency(totalGain)} (${gainPct}%)`}
          icon={totalGain >= 0 ? TrendingUp : TrendingDown}
          color={totalGain >= 0 ? 'emerald' : 'rose'}
        />
      </div>

      {/* Portfolio chart */}
      {records.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <InvestmentChart data={summary?.byType} />
          {/* By type summary */}
          <Card title="Portfolio Breakdown">
            <div className="px-5 pb-5 space-y-3">
              {(summary?.byType || []).map((t) => {
                const gain = Number(t.total_current) - Number(t.total_invested);
                return (
                  <div key={t.type} className="flex items-center justify-between p-3 bg-elevated  ">
                    <div>
                      <p className="text-sm font-medium text-[var(--color-ink)] capitalize">{t.type}</p>
                      <p className="text-xs text-[var(--color-muted)]">{t.count} position{t.count > 1 ? 's' : ''}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-[var(--color-ink)]">{formatCurrency(t.total_current)}</p>
                      <p className={`text-xs font-medium ${gain >= 0 ? 'text-emerald-400' : 'text-[var(--color-terracotta)]'}`}>
                        {gain >= 0 ? '+' : ''}{formatCurrency(gain)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* Records */}
      <Card title="All Investments">
        <div className="px-5 pb-5">
          {loading ? <LoadingSkeleton rows={4} /> : records.length === 0 ? (
            <p className="text-[var(--color-muted)] text-sm text-center py-8">No investments yet. Add your first one!</p>
          ) : (
            <div className="space-y-2 mt-2">
              {records.map((r) => {
                const gain = Number(r.current_value) - Number(r.amount_invested);
                const pct = Number(r.amount_invested) > 0 ? ((gain / Number(r.amount_invested)) * 100).toFixed(1) : 0;
                return (
                  <div key={r.id} className="flex items-center justify-between p-3 bg-elevated   hover:bg-hover transition-colors group">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-9 h-9   flex items-center justify-center flex-shrink-0 ${gain >= 0 ? 'bg-emerald-500/20' : 'bg-rose-500/20'}`}>
                        {gain >= 0 ? <TrendingUp className="w-4 h-4 text-emerald-400" /> : <TrendingDown className="w-4 h-4 text-[var(--color-terracotta)]" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[var(--color-ink)] truncate">{r.asset_name}</p>
                        <p className="text-xs text-[var(--color-muted)] capitalize">{r.asset_type} · {formatDate(r.date_added)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 ml-3">
                      <div className="text-right hidden sm:block">
                        <p className="text-xs text-[var(--color-muted)]">Invested</p>
                        <p className="text-sm text-sub">{formatCurrency(r.amount_invested)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-[var(--color-ink)]">{formatCurrency(r.current_value)}</p>
                        <p className={`text-xs font-medium ${gain >= 0 ? 'text-emerald-400' : 'text-[var(--color-terracotta)]'}`}>
                          {gain >= 0 ? '+' : ''}{formatCurrency(gain)} ({pct}%)
                        </p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(r)} className="p-1.5 text-[var(--color-muted)] hover:text-[var(--color-ink)] hover:bg-hover rounded transition-colors">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(r.id)} className="p-1.5 text-[var(--color-muted)] hover:text-[var(--color-terracotta)] hover:bg-rose-500/10 rounded transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Investment' : 'Add Investment'}>
        <form onSubmit={handleSave} className="space-y-4">
          <Input label="Name" placeholder="e.g. HDFC Bank Shares, Bitcoin" value={form.asset_name}
            onChange={(e) => setForm((f) => ({ ...f, asset_name: e.target.value }))} required />
          <div>
            <label className="text-xs font-medium text-sub block mb-1">Type</label>
            <select value={form.asset_type} onChange={(e) => setForm((f) => ({ ...f, asset_type: e.target.value }))}
              className="field capitalize">
              {INVESTMENT_TYPES.map((t) => <option key={t.value} value={t.value} className="capitalize">{t.label}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Amount Invested (₹)" type="number" placeholder="0.00" min="0" step="0.01"
              value={form.amount_invested} onChange={(e) => setForm((f) => ({ ...f, amount_invested: e.target.value }))} required />
            <Input label="Current Value (₹)" type="number" placeholder="0.00" min="0" step="0.01"
              value={form.current_value} onChange={(e) => setForm((f) => ({ ...f, current_value: e.target.value }))} required />
          </div>
          <Input label="Purchase Date" type="date" value={form.date_added}
            onChange={(e) => setForm((f) => ({ ...f, date_added: e.target.value }))} />
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
