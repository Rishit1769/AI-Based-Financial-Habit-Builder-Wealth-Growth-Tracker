import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Target, PiggyBank } from 'lucide-react';
import { getAll, create, update, remove, contribute } from '../services/savingsService';
import { formatCurrency, formatDate, getProgressColor } from '../utils/constants';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import StatCard from '../components/common/StatCard';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import toast from 'react-hot-toast';

const EMPTY_GOAL = { title: '', target_amount: '', current_amount: 0, deadline: '', description: '' };

export default function SavingsGoals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [contributeModal, setContributeModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [form, setForm] = useState(EMPTY_GOAL);
  const [contribution, setContribution] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const res = await getAll();
      setGoals(res.data.data);
    } catch { toast.error('Failed to load savings goals'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm(EMPTY_GOAL); setModal(true); };
  const openEdit = (g) => {
    setEditing(g);
    setForm({ title: g.title, target_amount: g.target_amount, current_amount: g.current_amount, deadline: g.deadline?.split('T')[0] || '', description: g.description || '' });
    setModal(true);
  };
  const openContribute = (g) => { setSelectedGoal(g); setContribution(''); setContributeModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) { await update(editing.id, form); toast.success('Goal updated'); }
      else { await create(form); toast.success('Savings goal created!'); }
      setModal(false);
      load();
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  const handleContribute = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await contribute(selectedGoal.id, Number(contribution));
      toast.success(`Added ${formatCurrency(contribution)} to "${selectedGoal.title}"!`);
      setContributeModal(false);
      load();
    } catch { toast.error('Failed to add contribution'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this savings goal?')) return;
    try { await remove(id); toast.success('Goal deleted'); load(); }
    catch { toast.error('Failed to delete'); }
  };

  const totalSaved = goals.reduce((s, g) => s + Number(g.current_amount), 0);
  const totalTarget = goals.reduce((s, g) => s + Number(g.target_amount), 0);
  const completed = goals.filter((g) => g.is_completed).length;

  // Compute days until deadline
  const daysUntil = (deadline) => {
    if (!deadline) return null;
    const diff = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--color-ink)]">Savings Goals</h1>
          <p className="text-sub text-sm mt-0.5">Track progress toward your financial dreams</p>
        </div>
        <Button onClick={openAdd} icon={Plus}>New Goal</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Saved" value={formatCurrency(totalSaved)} icon={PiggyBank} color="emerald" />
        <StatCard title="Total Target" value={formatCurrency(totalTarget)} icon={Target} color="indigo" />
        <StatCard title="Completed Goals" value={completed} icon={Target} color="purple" />
      </div>

      {loading ? <LoadingSkeleton rows={3} /> : goals.length === 0 ? (
        <Card><p className="text-[var(--color-muted)] text-sm text-center py-12">No savings goals yet. Create one to get started!</p></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((g) => {
            const pct = Math.min(100, (Number(g.current_amount) / Number(g.target_amount)) * 100);
            const days = daysUntil(g.deadline);
            return (
              <Card key={g.id}>
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10   flex items-center justify-center ${g.is_completed ? 'bg-emerald-500/20' : 'bg-indigo-500/20'}`}>
                        <PiggyBank className={`w-5 h-5 ${g.is_completed ? 'text-emerald-400' : 'text-indigo-400'}`} />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-[var(--color-ink)]">{g.title}</h3>
                        {g.deadline && (
                          <p className={`text-xs ${days !== null && days < 0 ? 'text-[var(--color-terracotta)]' : days !== null && days < 30 ? 'text-amber-400' : 'text-[var(--color-muted)]'}`}>
                            {days !== null && days < 0 ? `${Math.abs(days)}d overdue` : days !== null ? `${days}d left` : ''} · Deadline {formatDate(g.deadline)}
                          </p>
                        )}
                      </div>
                    </div>
                    {g.is_completed && (
                      <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5   font-medium">Achieved!</span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-sub">Progress</span>
                      <span className="font-semibold text-[var(--color-ink)]">{pct.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-elevated   h-2.5 overflow-hidden">
                      <div className={`h-2.5   transition-all duration-700 ${getProgressColor(pct)}`}
                        style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex justify-between text-xs text-[var(--color-muted)]">
                      <span>{formatCurrency(g.current_amount)} saved</span>
                      <span>goal: {formatCurrency(g.target_amount)}</span>
                    </div>
                  </div>

                  {g.description && <p className="text-xs text-[var(--color-muted)] mt-3 italic">{g.description}</p>}

                  <div className="flex gap-2 mt-4">
                    {!g.is_completed && (
                      <Button size="sm" className="flex-1" onClick={() => openContribute(g)} icon={Plus}>Add Funds</Button>
                    )}
                    <button onClick={() => openEdit(g)} className="p-2 text-[var(--color-muted)] hover:text-[var(--color-ink)] hover:bg-hover   transition-colors">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(g.id)} className="p-2 text-[var(--color-muted)] hover:text-[var(--color-terracotta)] hover:bg-rose-500/10   transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add/Edit Goal Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Goal' : 'New Savings Goal'}>
        <form onSubmit={handleSave} className="space-y-4">
          <Input label="Goal Name" placeholder="e.g. Emergency Fund" value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required />
          <Input label="Target Amount (₹)" type="number" placeholder="0.00" min="1" step="0.01"
            value={form.target_amount} onChange={(e) => setForm((f) => ({ ...f, target_amount: e.target.value }))} required />
          {!editing && (
            <Input label="Starting Amount (₹)" type="number" placeholder="0.00" min="0" step="0.01"
              value={form.current_amount} onChange={(e) => setForm((f) => ({ ...f, current_amount: e.target.value }))} />
          )}
          <Input label="Deadline (optional)" type="date" value={form.deadline}
            onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))} />
          <Input label="Notes (optional)" placeholder="What's this goal for?" value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModal(false)} className="flex-1">Cancel</Button>
            <Button type="submit" loading={saving} className="flex-1">{editing ? 'Update' : 'Create Goal'}</Button>
          </div>
        </form>
      </Modal>

      {/* Contribute Modal */}
      <Modal open={contributeModal} onClose={() => setContributeModal(false)} title={`Add to "${selectedGoal?.title}"`}>
        <form onSubmit={handleContribute} className="space-y-4">
          <div className="p-4 bg-elevated   text-center">
            <p className="text-xs text-[var(--color-muted)]">Current Savings</p>
            <p className="text-2xl font-bold text-[var(--color-ink)] mt-1">{formatCurrency(selectedGoal?.current_amount || 0)}</p>
            <p className="text-xs text-[var(--color-muted)] mt-1">of {formatCurrency(selectedGoal?.target_amount || 0)}</p>
          </div>
          <Input label="Amount to Add (₹)" type="number" placeholder="0.00" min="0.01" step="0.01"
            value={contribution} onChange={(e) => setContribution(e.target.value)} required autoFocus />
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setContributeModal(false)} className="flex-1">Cancel</Button>
            <Button type="submit" loading={saving} className="flex-1">Add Funds</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
