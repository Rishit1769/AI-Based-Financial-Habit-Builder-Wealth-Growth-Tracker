import { useEffect, useMemo, useState } from 'react';
import {
  FaBullseye,
  FaCalendarCheck,
  FaEllipsis,
  FaLeaf,
  FaPiggyBank,
  FaWallet,
} from 'react-icons/fa6';
import toast from 'react-hot-toast';
import { getStats } from '../services/habitService';

const habitIcons = [FaPiggyBank, FaLeaf, FaBullseye, FaWallet, FaCalendarCheck];

const fallbackHabits = [
  { id: 'demo-1', name: 'No Impulse Buy', streak: 12, frequency: 'daily', description: 'Delay non-essential spending by 24 hours.' },
  { id: 'demo-2', name: 'Auto Transfer to Savings', streak: 8, frequency: 'weekly', description: 'Route income into long-term savings first.' },
  { id: 'demo-3', name: 'Track Every Transaction', streak: 17, frequency: 'daily', description: 'Maintain complete spending visibility.' },
  { id: 'demo-4', name: 'Review Asset Mix', streak: 5, frequency: 'weekly', description: 'Rebalance portfolio according to target risk.' },
];

function HabitCard({ habit, index }) {
  const Icon = habitIcons[index % habitIcons.length];

  return (
    <article className="card-stadium fade-in-up p-5 md:p-6">
      <div className="flex items-center gap-4">
        <div
          className="radius-circle flex h-16 w-16 items-center justify-center"
          style={{
            border: '1px solid var(--border)',
            background: 'color-mix(in srgb, var(--signal) 12%, var(--lifted-surface))',
            color: 'var(--signal)',
          }}
        >
          <Icon className="text-xl" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="wealth-display truncate text-[1.25rem] font-bold">{habit.name}</p>
          <p className="mt-1 text-sm" style={{ color: 'var(--muted-ink)' }}>
            {habit.streak || 0} day streak • {habit.frequency || 'daily'} cadence
          </p>
          <p className="mt-2 line-clamp-2 text-sm" style={{ color: 'var(--muted-ink)' }}>
            {habit.description || 'Keep this behavior active to reinforce long-term wealth discipline.'}
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
      </div>
    </article>
  );
}

export default function Habits() {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHabits = async () => {
      try {
        const response = await getStats();
        const serverHabits = response?.data?.data?.habits || [];
        setHabits(serverHabits);
      } catch {
        toast.error('Unable to load habits. Showing strategy templates.');
      } finally {
        setLoading(false);
      }
    };

    loadHabits();
  }, []);

  const cards = useMemo(() => {
    if (habits.length > 0) {
      return habits;
    }
    return fallbackHabits;
  }, [habits]);

  return (
    <div className="space-y-7 md:space-y-8">
      <section className="card-stadium fade-in-up px-7 py-8 md:px-10">
        <p className="eyebrow" style={{ color: 'var(--signal)' }}>
          Wealth Behavior Engine
        </p>
        <h2 className="wealth-display mt-3 text-[clamp(2rem,5.3vw,3.2rem)] font-extrabold">Habit Builder</h2>
        <p className="mt-3 max-w-2xl text-[0.98rem] md:text-[1.03rem]" style={{ color: 'var(--muted-ink)' }}>
          Operationalize small financial disciplines that compound into strong long-term outcomes.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {loading && cards.length === 0 ? (
          <article className="card-stadium p-6">
            <p style={{ color: 'var(--muted-ink)' }}>Loading habits...</p>
          </article>
        ) : (
          cards.map((habit, index) => <HabitCard key={habit.id} habit={habit} index={index} />)
        )}
      </section>
    </div>
  );
}
