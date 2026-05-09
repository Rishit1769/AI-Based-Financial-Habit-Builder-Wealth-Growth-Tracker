import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaCircle } from 'react-icons/fa6';
import toast from 'react-hot-toast';
import { getDashboard } from '../services/dashboardService';
import { formatCurrency } from '../utils/constants';

function buildPulseBars(trend = []) {
  const recent = trend.slice(-5).map((item) => Number(item.net_worth || item.value || 0));
  if (recent.length !== 5) {
    return [38, 52, 48, 60, 94];
  }

  const max = Math.max(...recent, 1);
  return recent.map((value, index) => {
    const normalized = Math.max(28, Math.round((value / max) * 94));
    return index === recent.length - 1 ? 94 : normalized;
  });
}

export default function Dashboard() {
  const [overview, setOverview] = useState(null);

  useEffect(() => {
    const loadOverview = async () => {
      try {
        const response = await getDashboard();
        setOverview(response?.data?.data || null);
      } catch {
        toast.error('Unable to load overview metrics.');
      }
    };

    loadOverview();
  }, []);

  const pulseBars = useMemo(() => buildPulseBars(overview?.netWorthTrend || []), [overview]);

  const netWorth = Number(overview?.overview?.netWorth || 245500);
  const goal = overview?.savingsGoals?.[0];
  const goalTarget = Number(goal?.target_amount || 85000);
  const goalCurrent = Number(goal?.current_amount || 42000);
  const goalProgress = Math.min(100, Math.round((goalCurrent / Math.max(goalTarget, 1)) * 100));

  return (
    <div className="space-y-9 pb-8 pt-4 md:space-y-11 md:pt-7">
      <section className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
        <span className="ghost-watermark" style={{ left: '-0.2rem', top: '0.2rem', bottom: 'auto' }}>
          ASSETS
        </span>

        <div className="relative z-10 max-w-[31rem] pt-4">
          <p className="eyebrow flex items-center gap-2" style={{ color: 'var(--muted-ink)' }}>
            <FaCircle style={{ color: 'var(--signal)' }} />
            Wealth Intelligence Active
          </p>
          <h2 className="wealth-display mt-4 text-[clamp(2.9rem,6.6vw,5rem)] font-bold leading-[0.96]">
            Personal Net
            <br />
            Worth
            <br />
            Evolution
          </h2>
          <p className="mt-7 max-w-[25rem] text-[1.02rem] leading-[1.55]" style={{ color: 'var(--muted-ink)' }}>
            Rishit, your current retention rate is excellent. Based on your consistent habits, you've saved
            ₹12,400 more than last month.
          </p>
          <Link
            to="/reports"
            className="pill-button mt-8 inline-flex px-8 py-3 text-[1rem] font-semibold"
            style={{ background: 'var(--ink)', color: 'var(--canvas)' }}
          >
            Generate Report
          </Link>
        </div>

        <article className="card-stadium relative z-10 min-h-[17.5rem] px-7 py-7 md:px-8 md:py-8">
          <div className="flex items-center justify-between">
            <h3 className="wealth-display text-[1.75rem] font-bold">Growth Pulse</h3>
            <span
              className="pill-button px-4 py-1.5 text-xs font-semibold uppercase"
              style={{ background: 'color-mix(in srgb, var(--growth) 14%, transparent)', color: 'var(--growth)' }}
            >
              Target Met
            </span>
          </div>

          <div className="mt-8 flex h-[8.8rem] items-end justify-between gap-3">
            {pulseBars.map((height, index) => {
              const isLast = index === pulseBars.length - 1;
              return (
                <div
                  key={`${height}-${index}`}
                  className="radius-pill w-full"
                  style={{
                    height: `${height}%`,
                    background: isLast
                      ? 'var(--ink)'
                      : 'color-mix(in srgb, var(--ink) 7%, var(--lifted-surface))',
                  }}
                />
              );
            })}
          </div>
        </article>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        <article className="card-stadium min-h-[10.2rem] p-7">
          <p className="eyebrow" style={{ color: 'var(--muted-ink)' }}>
            Total Assets
          </p>
          <p className="wealth-display mt-5 text-[2.45rem] font-bold leading-none">{formatCurrency(netWorth)}</p>
          <p className="mt-4 text-[1rem] font-semibold" style={{ color: 'var(--growth)' }}>
            +5.2% Quarterly
          </p>
        </article>

        <article className="card-stadium min-h-[10.2rem] p-7">
          <p className="eyebrow" style={{ color: 'var(--muted-ink)' }}>
            Savings Goal
          </p>
          <p className="wealth-display mt-5 text-[2.45rem] font-bold leading-none">{formatCurrency(goalTarget)}</p>
          <div
            className="mt-7 h-2.5"
            style={{ borderRadius: 'var(--radius-pill)', background: 'color-mix(in srgb, var(--ink) 8%, transparent)' }}
          >
            <div
              className="h-full"
              style={{
                width: `${goalProgress}%`,
                borderRadius: 'var(--radius-pill)',
                background: 'var(--signal)',
              }}
            />
          </div>
        </article>

        <article className="card-stadium min-h-[10.2rem] p-7">
          <p className="eyebrow" style={{ color: 'var(--muted-ink)' }}>
            Daily Intention
          </p>
          <p className="wealth-display mt-5 text-[2.45rem] font-bold leading-none">12 Days</p>
          <p className="eyebrow mt-4" style={{ color: 'var(--muted-ink)' }}>
            Streak Count
          </p>
        </article>
      </section>
    </div>
  );
}
