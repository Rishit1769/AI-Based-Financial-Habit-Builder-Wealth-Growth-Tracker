import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Flame, CheckCircle, Circle } from 'lucide-react';
import { getStats, create, update, remove, complete, uncomplete, getCompletions } from '../services/habitService';
import { formatDate } from '../utils/constants';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import toast from 'react-hot-toast';

const FREQUENCIES = ['daily', 'weekly', 'monthly'];
const today = new Date().toISOString().split('T')[0];

// Build last 63-day heatmap grid (9 weeks)
function buildHeatmap(completions = []) {
  const days = [];
  const now = new Date();
  for (let i = 62; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const str = d.toISOString().split('T')[0];
    days.push({ date: str, filled: completions.includes(str) });
  }
  return days;
}

function StreakBadge({ streak }) {
  if (!streak) return null;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded-full text-xs font-semibold">
      <Flame className="w-3 h-3" /> {streak}d
    </span>
  );
}

export default function Habits() {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', frequency: 'daily', target_count: 30 });
  const [saving, setSaving] = useState(false);
  const [expandedHabit, setExpandedHabit] = useState(null);
  const [heatmapData, setHeatmapData] = useState({});

  const load = async () => {
    try {
      const res = await getStats();
      setHabits(res.data.data.habits || []);
    } catch { toast.error('Failed to load habits'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm({ name: '', description: '', frequency: 'daily', target_count: 30 }); setModal(true); };
  const openEdit = (h) => { setEditing(h); setForm({ name: h.name, description: h.description || '', frequency: h.frequency, target_days: h.target_days }); setModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) { await update(editing.id, form); toast.success('Habit updated'); }
      else { await create(form); toast.success('Habit created!'); }
      setModal(false);
      load();
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this habit?')) return;
    try { await remove(id); toast.success('Deleted'); load(); }
    catch { toast.error('Failed to delete'); }
  };

  const toggleComplete = async (habit) => {
    try {
      if (habit.completed_today) {
        await uncomplete(habit.id);
        toast('Unchecked', { icon: '↩️' });
      } else {
        await complete(habit.id);
        toast.success('Marked complete!');
      }
      load();
    } catch { toast.error('Failed to update'); }
  };

  const loadHeatmap = async (habitId) => {
    if (expandedHabit === habitId) { setExpandedHabit(null); return; }
    try {
      const res = await getCompletions(habitId, 63);
      const dates = res.data.data.map((c) => (typeof c === 'string' ? c.split('T')[0] : String(c)));
      setHeatmapData((d) => ({ ...d, [habitId]: buildHeatmap(dates) }));
      setExpandedHabit(habitId);
    } catch { toast.error('Failed to load history'); }
  };

  const todayHabits = habits.filter((h) => h.frequency === 'daily');
  const completedToday = todayHabits.filter((h) => h.completed_today).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-main">Habits</h1>
          <p className="text-sub text-sm mt-0.5">Build consistent financial habits</p>
        </div>
        <Button onClick={openAdd} icon={Plus}>Add Habit</Button>
      </div>

      {/* Daily progress */}
      {todayHabits.length > 0 && (
        <Card>
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-main">Today's Progress</span>
              <span className="text-sm font-bold text-indigo-400">{completedToday}/{todayHabits.length}</span>
            </div>
            <div className="w-full bg-elevated rounded-full h-2">
              <div className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${todayHabits.length ? (completedToday / todayHabits.length) * 100 : 0}%` }} />
            </div>
          </div>
        </Card>
      )}

      {/* Habits list */}
      {loading ? <LoadingSkeleton rows={4} /> : habits.length === 0 ? (
        <Card><p className="text-muted text-sm text-center py-12">No habits yet. Start building good financial habits!</p></Card>
      ) : (
        <div className="space-y-3">
          {habits.map((h) => (
            <Card key={h.id}>
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <button onClick={() => toggleComplete(h)}
                    className={`mt-0.5 flex-shrink-0 transition-all duration-200 ${h.completed_today ? 'text-emerald-400' : 'text-muted hover:text-sub'}`}>
                    {h.completed_today ? <CheckCircle className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-sm font-semibold ${h.completed_today ? 'text-muted line-through' : 'text-main'}`}>{h.name}</span>
                      <span className="text-xs text-muted bg-elevated px-2 py-0.5 rounded-full capitalize">{h.frequency}</span>
                      <StreakBadge streak={h.streak} />
                    </div>
                    {h.description && <p className="text-xs text-muted mt-0.5">{h.description}</p>}
                    <div className="flex items-center gap-3 mt-2">
                      <button onClick={() => loadHeatmap(h.id)}
                        className="text-xs text-indigo-400 hover:text-indigo-300 underline underline-offset-2">
                        {expandedHabit === h.id ? 'Hide history' : 'View history'}
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => openEdit(h)} className="p-1.5 text-muted hover:text-main hover:bg-hover rounded transition-colors">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(h.id)} className="p-1.5 text-muted hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                {/* Heatmap */}
                {expandedHabit === h.id && heatmapData[h.id] && (
                  <div className="mt-4 pt-4 border-t border-base">
                    <p className="text-xs text-muted mb-2">Last 63 days</p>
                    <div className="flex flex-wrap gap-1">
                      {heatmapData[h.id].map((d) => (
                        <div key={d.date} title={`${d.date}${d.filled ? ' ✓' : ''}`}
                          className={`w-4 h-4 rounded-sm transition-colors ${d.filled ? 'bg-emerald-500' : 'bg-elevated'}`} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Habit' : 'New Habit'}>
        <form onSubmit={handleSave} className="space-y-4">
          <Input label="Habit name" placeholder="e.g. Track daily expenses" value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
          <Input label="Description (optional)" placeholder="Why this habit matters..."
            value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          <div>
            <label className="text-xs font-medium text-sub block mb-1">Frequency</label>
            <select value={form.frequency} onChange={(e) => setForm((f) => ({ ...f, frequency: e.target.value }))}
              className="field capitalize">
              {FREQUENCIES.map((f) => <option key={f} value={f} className="capitalize">{f}</option>)}
            </select>
          </div>
          <Input label="Target days" type="number" min="1" max="365" value={form.target_count}
            onChange={(e) => setForm((f) => ({ ...f, target_count: Number(e.target.value) }))} />
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModal(false)} className="flex-1">Cancel</Button>
            <Button type="submit" loading={saving} className="flex-1">{editing ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
