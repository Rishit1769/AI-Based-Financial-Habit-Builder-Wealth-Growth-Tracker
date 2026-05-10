import { useEffect, useState } from 'react';
import {
  FaBolt,
  FaChartLine,
  FaCheck,
  FaMoneyBillTrendUp,
  FaWallet,
} from 'react-icons/fa6';
import { apiRequest } from '../services/api.js';

const iconByFrequency = {
  daily: FaBolt,
  weekly: FaWallet,
  monthly: FaChartLine,
};

function HabitCard({ habit, onToggleComplete, pendingHabitId }) {
  const Icon = iconByFrequency[habit.frequency] || FaMoneyBillTrendUp;
  const tone = habit.completed_today ? 'var(--growth)' : 'var(--signal)';
  const isPending = pendingHabitId === habit.id;

  return (
    <article className="card-stadium flex items-center gap-5 px-6 py-6 md:px-7">
      <span
        className="radius-circle flex h-16 w-16 items-center justify-center"
        style={{
          background: `color-mix(in srgb, ${tone} 14%, transparent)`,
          color: tone,
        }}
      >
        <Icon className="text-[1.35rem]" />
      </span>

      <div className="min-w-0 flex-1">
        <p className="wealth-display truncate text-[2rem] font-bold leading-none">{habit.name}</p>
        <p className="eyebrow mt-2" style={{ color: 'var(--muted-ink)' }}>
          Active Streak: {habit.streak} Days - {habit.frequency}
        </p>
      </div>

      <button
        type="button"
        className="radius-pill flex h-10 items-center justify-center px-4 text-xs font-semibold"
        style={{
          border: '1px solid var(--border)',
          color: habit.completed_today ? 'var(--growth)' : 'var(--muted-ink)',
          opacity: isPending ? 0.7 : 1,
        }}
        aria-label={habit.completed_today ? 'Mark incomplete for today' : 'Mark complete for today'}
        onClick={() => onToggleComplete(habit)}
        disabled={isPending}
      >
        {habit.completed_today ? 'Completed' : 'Complete'}
      </button>
    </article>
  );
}

export default function HabitsView({ accessToken }) {
  const [data, setData] = useState({ habits: [], completionRate: 0, completedToday: 0, totalHabits: 0 });
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    frequency: 'daily',
    target_count: '1',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pendingHabitId, setPendingHabitId] = useState('');
  const [error, setError] = useState('');

  const loadHabits = async () => {
    const response = await apiRequest('/habits/stats', {
      token: accessToken,
    });
    setData(response.data);
  };

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await apiRequest('/habits/stats', {
          token: accessToken,
        });
        if (mounted) {
          setData(response.data);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || 'Unable to load habit stats.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    run();

    return () => {
      mounted = false;
    };
  }, [accessToken]);

  const handleCreateHabit = async (event) => {
    event.preventDefault();
    setError('');

    if (!createForm.name.trim()) {
      setError('Habit name is required.');
      return;
    }

    const targetCount = Number(createForm.target_count || 1);
    if (targetCount < 1) {
      setError('Target count must be at least 1.');
      return;
    }

    try {
      setSaving(true);
      await apiRequest('/habits', {
        method: 'POST',
        token: accessToken,
        body: {
          name: createForm.name.trim(),
          description: createForm.description.trim() || null,
          frequency: createForm.frequency,
          target_count: targetCount,
        },
      });
      setCreateForm({ name: '', description: '', frequency: 'daily', target_count: '1' });
      await loadHabits();
    } catch (err) {
      setError(err.message || 'Unable to create habit right now.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleComplete = async (habit) => {
    setError('');
    try {
      setPendingHabitId(habit.id);
      if (habit.completed_today) {
        await apiRequest(`/habits/${habit.id}/complete`, {
          method: 'DELETE',
          token: accessToken,
          body: {},
        });
      } else {
        await apiRequest(`/habits/${habit.id}/complete`, {
          method: 'POST',
          token: accessToken,
          body: {},
        });
      }
      await loadHabits();
    } catch (err) {
      setError(err.message || 'Unable to update habit completion.');
    } finally {
      setPendingHabitId('');
    }
  };

  return (
    <div className="space-y-8 md:space-y-10">
      <section className="max-w-[49rem]">
        <p className="eyebrow" style={{ color: 'var(--signal)' }}>
          Wealth Discipline Engine
        </p>
        <h2 className="wealth-display mt-3 text-[clamp(2.65rem,5.8vw,4.7rem)] font-extrabold">Habit Builder</h2>
        <p className="mt-4 max-w-2xl text-[1.04rem] leading-[1.6]" style={{ color: 'var(--muted-ink)' }}>
          Build daily financial behaviors that compound into institutional-level personal wealth outcomes.
          Completion today: <strong>{data.completedToday}</strong> of <strong>{data.totalHabits}</strong> active habits
          ({data.completionRate}%).
        </p>
      </section>

      <section className="card-stadium px-6 py-6 md:px-7">
        <h3 className="wealth-display text-3xl font-bold">Add Habit</h3>
        <form onSubmit={handleCreateHabit} className="mt-5 grid gap-3 md:grid-cols-2">
          <label className="text-sm font-semibold">
            Habit Name
            <input
              type="text"
              value={createForm.name}
              onChange={(event) => setCreateForm((current) => ({ ...current, name: event.target.value }))}
              className="mt-2 w-full radius-pill border bg-transparent px-4 py-3 outline-none"
              style={{ borderColor: 'var(--border)' }}
              placeholder="Daily expense audit"
            />
          </label>

          <label className="text-sm font-semibold">
            Frequency
            <select
              value={createForm.frequency}
              onChange={(event) => setCreateForm((current) => ({ ...current, frequency: event.target.value }))}
              className="mt-2 w-full radius-pill border bg-transparent px-4 py-3 outline-none"
              style={{ borderColor: 'var(--border)' }}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </label>

          <label className="text-sm font-semibold md:col-span-2">
            Description
            <input
              type="text"
              value={createForm.description}
              onChange={(event) => setCreateForm((current) => ({ ...current, description: event.target.value }))}
              className="mt-2 w-full radius-pill border bg-transparent px-4 py-3 outline-none"
              style={{ borderColor: 'var(--border)' }}
              placeholder="Track and review your spend at end of day"
            />
          </label>

          <label className="text-sm font-semibold">
            Target Count
            <input
              type="number"
              min="1"
              value={createForm.target_count}
              onChange={(event) => setCreateForm((current) => ({ ...current, target_count: event.target.value }))}
              className="mt-2 w-full radius-pill border bg-transparent px-4 py-3 outline-none"
              style={{ borderColor: 'var(--border)' }}
            />
          </label>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={saving}
              className="pill-button w-full px-4 py-3 text-sm font-semibold"
              style={{ background: 'var(--ink)', color: 'var(--canvas)', opacity: saving ? 0.7 : 1 }}
            >
              {saving ? 'Saving Habit...' : 'Create Habit'}
            </button>
          </div>
        </form>
      </section>

      {loading ? (
        <section className="card-stadium px-6 py-7 text-sm" style={{ color: 'var(--muted-ink)' }}>
          Loading habits from database...
        </section>
      ) : null}

      {!loading && error ? (
        <section className="card-stadium px-6 py-7 text-sm font-semibold" style={{ color: '#dc2626' }}>
          {error}
        </section>
      ) : null}

      {!loading && !error && data.habits.length === 0 ? (
        <section className="card-stadium px-6 py-7 text-sm" style={{ color: 'var(--muted-ink)' }}>
          No active habits found. Create your first habit to start tracking streaks.
        </section>
      ) : null}

      <section className="grid gap-4 xl:grid-cols-2">
        {data.habits.map((habit) => (
          <HabitCard
            key={habit.id}
            habit={habit}
            onToggleComplete={handleToggleComplete}
            pendingHabitId={pendingHabitId}
          />
        ))}
      </section>
    </div>
  );
}
