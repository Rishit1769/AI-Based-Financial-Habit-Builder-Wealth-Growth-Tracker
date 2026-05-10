import { useEffect, useState } from 'react';
import {
  FaBolt,
  FaChartLine,
  FaEllipsis,
  FaMoneyBillTrendUp,
  FaWallet,
} from 'react-icons/fa6';
import { apiRequest } from '../services/api.js';

const iconByFrequency = {
  daily: FaBolt,
  weekly: FaWallet,
  monthly: FaChartLine,
};

function HabitCard({ habit }) {
  const Icon = iconByFrequency[habit.frequency] || FaMoneyBillTrendUp;
  const tone = habit.completed_today ? 'var(--growth)' : 'var(--signal)';

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
        className="radius-circle flex h-10 w-10 items-center justify-center"
        style={{ border: '1px solid var(--border)', color: 'var(--muted-ink)' }}
        aria-label="Habit options"
      >
        <FaEllipsis />
      </button>
    </article>
  );
}

export default function HabitsView({ accessToken }) {
  const [data, setData] = useState({ habits: [], completionRate: 0, completedToday: 0, totalHabits: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadHabits = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await apiRequest('/habits/stats', {
          token: accessToken,
        });
        if (!mounted) {
          return;
        }
        setData(response.data);
      } catch (err) {
        if (!mounted) {
          return;
        }
        setError(err.message || 'Unable to load habit stats.');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadHabits();

    return () => {
      mounted = false;
    };
  }, [accessToken]);

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
          <HabitCard key={habit.id} habit={habit} />
        ))}
      </section>
    </div>
  );
}
