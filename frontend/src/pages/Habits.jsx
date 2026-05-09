import { useEffect, useMemo, useState } from 'react';
import { FaCheck, FaEllipsis, FaPlus } from 'react-icons/fa6';
import toast from 'react-hot-toast';
import { getStats } from '../services/habitService';

const fallbackHabit = {
  id: 'default-habit',
  name: 'No Impulse Buy',
  streak: 12,
};

export default function Habits() {
  const [habits, setHabits] = useState([]);

  useEffect(() => {
    const loadHabits = async () => {
      try {
        const response = await getStats();
        setHabits(response?.data?.data?.habits || []);
      } catch {
        toast.error('Unable to load habits.');
      }
    };

    loadHabits();
  }, []);

  const featuredHabit = useMemo(() => habits[0] || fallbackHabit, [habits]);

  return (
    <div className="space-y-8 pt-2 md:space-y-10">
      <section className="max-w-[48rem]">
        <h2 className="wealth-display text-[clamp(3rem,5.5vw,4.8rem)] font-bold">Habit Builder</h2>
        <p className="mt-4 text-[1.16rem] leading-relaxed" style={{ color: 'var(--muted-ink)' }}>
          Wealth is the result of what you do every day. Your financial rituals are currently 94% consistent.
        </p>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <article className="card-stadium flex items-center gap-5 px-7 py-7">
          <span
            className="radius-circle flex h-16 w-16 items-center justify-center"
            style={{ background: 'color-mix(in srgb, var(--growth) 14%, transparent)', color: 'var(--growth)' }}
          >
            <FaCheck className="text-[1.4rem]" />
          </span>

          <div className="flex-1">
            <p className="wealth-display text-[2rem] font-bold leading-none">{featuredHabit.name}</p>
            <p className="eyebrow mt-2" style={{ color: 'var(--muted-ink)' }}>
              Active Streak: {featuredHabit.streak || 12} Days
            </p>
          </div>

          <button
            type="button"
            className="radius-circle flex h-11 w-11 items-center justify-center"
            style={{ border: '1px solid var(--border)', color: 'var(--ink)' }}
            aria-label="Habit options"
          >
            <FaEllipsis />
          </button>
        </article>

        <article className="card-stadium flex items-center gap-5 px-7 py-7" style={{ color: 'var(--muted-ink)' }}>
          <span
            className="radius-circle flex h-16 w-16 items-center justify-center"
            style={{ background: 'color-mix(in srgb, var(--ink) 4%, transparent)' }}
          >
            <FaPlus className="text-[1.4rem]" />
          </span>

          <div>
            <p className="wealth-display text-[2rem] font-bold italic leading-none">Create Habit</p>
            <p className="eyebrow mt-2">Build Discipline</p>
          </div>
        </article>
      </section>
    </div>
  );
}
