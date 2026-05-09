import {
  FaBolt,
  FaChartLine,
  FaEllipsis,
  FaMoneyBillTrendUp,
  FaWallet,
} from 'react-icons/fa6';

const habits = [
  { id: 'h1', name: 'No Impulse Buy', streak: 12, icon: FaBolt, tone: 'var(--growth)' },
  { id: 'h2', name: 'Pay Yourself First', streak: 17, icon: FaWallet, tone: 'var(--signal)' },
  { id: 'h3', name: 'Daily Expense Audit', streak: 9, icon: FaMoneyBillTrendUp, tone: 'var(--orbit)' },
  { id: 'h4', name: 'Weekly Allocation Check', streak: 21, icon: FaChartLine, tone: 'var(--ink)' },
];

function HabitCard({ habit }) {
  const Icon = habit.icon;

  return (
    <article className="card-stadium flex items-center gap-5 px-6 py-6 md:px-7">
      <span
        className="radius-circle flex h-16 w-16 items-center justify-center"
        style={{
          background: `color-mix(in srgb, ${habit.tone} 14%, transparent)`,
          color: habit.tone,
        }}
      >
        <Icon className="text-[1.35rem]" />
      </span>

      <div className="min-w-0 flex-1">
        <p className="wealth-display truncate text-[2rem] font-bold leading-none">{habit.name}</p>
        <p className="eyebrow mt-2" style={{ color: 'var(--muted-ink)' }}>
          Active Streak: {habit.streak} Days
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

export default function HabitsView() {
  return (
    <div className="space-y-8 md:space-y-10">
      <section className="max-w-[49rem]">
        <p className="eyebrow" style={{ color: 'var(--signal)' }}>
          Wealth Discipline Engine
        </p>
        <h2 className="wealth-display mt-3 text-[clamp(2.65rem,5.8vw,4.7rem)] font-extrabold">Habit Builder</h2>
        <p className="mt-4 max-w-2xl text-[1.04rem] leading-[1.6]" style={{ color: 'var(--muted-ink)' }}>
          Build daily financial behaviors that compound into institutional-level personal wealth outcomes.
        </p>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        {habits.map((habit) => (
          <HabitCard key={habit.id} habit={habit} />
        ))}
      </section>
    </div>
  );
}
