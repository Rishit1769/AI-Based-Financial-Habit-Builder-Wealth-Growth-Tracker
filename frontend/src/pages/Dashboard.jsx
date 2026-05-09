import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRightLong, FaFileArrowUp } from 'react-icons/fa6';
import toast from 'react-hot-toast';
import { getDashboard } from '../services/dashboardService';
import { formatCurrency } from '../utils/constants';

function buildPulseBars(trend = []) {
  const recentValues = trend.slice(-5).map((entry) => Number(entry.net_worth || entry.value || 0));

  if (recentValues.length === 0) {
    return [42, 56, 68, 82, 100];
  }

  const max = Math.max(...recentValues, 1);
  return recentValues.map((value, index) => {
    if (index === recentValues.length - 1) {
      return 100;
    }
    return Math.max(30, Math.round((value / max) * 100));
  });
}

function GhostHero() {
  return (
    <section className="relative overflow-hidden card-stadium px-7 py-10 md:px-12 md:py-14 fade-in-up">
      <span className="ghost-watermark">ASSETS</span>
      <p className="eyebrow relative z-10" style={{ color: 'var(--signal)' }}>
        Wealth Thesis
      </p>
      <h2 className="wealth-display relative z-10 mt-3 text-[clamp(2.6rem,6.5vw,4.25rem)] font-extrabold">
        Personal Net Worth Evolution
      </h2>
      <p className="relative z-10 mt-4 max-w-2xl text-[0.98rem] md:text-[1.04rem]" style={{ color: 'var(--muted-ink)' }}>
        Monitor how disciplined cash flow, intentional habits, and strategic allocation compound into long-term wealth growth.
      </p>
      <Link
        to="/reports"
        className="pill-button relative z-10 mt-7 inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold"
        style={{ background: 'var(--ink)', color: 'var(--canvas)' }}
      >
        <FaFileArrowUp />
        Generate Report
      </Link>
    </section>
  );
}

function MetricCard({ eyebrow, title, value, accent, children }) {
  return (
    <article className="card-stadium fade-in-up p-6">
      <p className="eyebrow" style={{ color: accent }}>
        {eyebrow}
      </p>
      <p className="mt-4 text-sm" style={{ color: 'var(--muted-ink)' }}>
        {title}
      </p>
      <p className="wealth-display mt-2 text-[clamp(1.8rem,4vw,2.6rem)] font-extrabold">{value}</p>
      {children}
    </article>
  );
}

export default function Dashboard() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await getDashboard();
        setOverview(response?.data?.data || null);
      } catch {
        toast.error('Unable to load overview metrics.');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const pulseBars = useMemo(() => buildPulseBars(overview?.netWorthTrend || []), [overview]);

  const netWorth = Number(overview?.overview?.netWorth || 0);
  const monthlySavings = Number(overview?.overview?.monthlySavings || 0);
  const monthlyIncome = Number(overview?.overview?.monthlyIncome || 0);
  const trendPercent = monthlyIncome > 0 ? Math.max(0, Math.round((monthlySavings / monthlyIncome) * 100)) : 16;

  const firstGoal = overview?.savingsGoals?.[0];
  const goalCurrent = Number(firstGoal?.current_amount || 0);
  const goalTarget = Math.max(1, Number(firstGoal?.target_amount || 250000));
  const goalProgress = Math.min(100, Math.round((goalCurrent / goalTarget) * 100));

  const intentionDays = Number(overview?.habitStats?.best_streak || 12);

  return (
    <div className="space-y-7 md:space-y-10">
      <GhostHero />

      <section className="grid gap-4 lg:grid-cols-[1.45fr_1fr]">
        <article className="card-stadium fade-in-up stagger-1 p-6 md:p-8">
          <div className="flex items-start justify-between">
            <div>
              <p className="eyebrow" style={{ color: 'var(--orbit)' }}>
                Growth Pulse
              </p>
              <h3 className="wealth-display mt-2 text-2xl font-extrabold md:text-[2rem]">Trajectory Signal</h3>
            </div>
            <span className="pill-button inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold" style={{ background: 'color-mix(in srgb, var(--growth) 16%, transparent)', color: 'var(--growth)' }}>
              +{trendPercent}%
            </span>
          </div>

          <div className="mt-8 flex h-52 items-end justify-between gap-3">
            {pulseBars.map((height, index) => {
              const isLast = index === pulseBars.length - 1;
              return (
                <div
                  key={`${height}-${index}`}
                  className="radius-pill w-full transition-all duration-300"
                  style={{
                    height: `${height}%`,
                    background: isLast ? 'var(--ink)' : 'color-mix(in srgb, var(--signal) 45%, var(--lifted-surface))',
                    opacity: isLast ? 1 : 0.78,
                  }}
                />
              );
            })}
          </div>
        </article>

        <article className="card-stadium fade-in-up stagger-2 p-6 md:p-8">
          <p className="eyebrow" style={{ color: 'var(--muted-ink)' }}>
            Overview
          </p>
          <p className="mt-3 text-sm" style={{ color: 'var(--muted-ink)' }}>
            Your wealth engine remains active. Continue compounding with disciplined intent.
          </p>
          <Link
            to="/investments"
            className="pill-button mt-6 inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold"
            style={{ border: '1px solid var(--border)', color: 'var(--ink)' }}
          >
            View Allocation
            <FaArrowRightLong />
          </Link>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <MetricCard
          eyebrow="Total Assets"
          title="Current valuation"
          value={loading ? '...' : formatCurrency(netWorth)}
          accent="var(--growth)"
        >
          <p className="mt-4 text-sm font-semibold" style={{ color: 'var(--growth)' }}>
            +{trendPercent}% trend
          </p>
        </MetricCard>

        <MetricCard
          eyebrow="Savings Goal"
          title={firstGoal?.name || 'Long-term reserve'}
          value={loading ? '...' : formatCurrency(goalTarget)}
          accent="var(--signal)"
        >
          <div className="mt-5 h-3.5 w-full" style={{ borderRadius: 'var(--radius-pill)', background: 'color-mix(in srgb, var(--signal) 14%, transparent)' }}>
            <div
              className="h-full"
              style={{
                width: `${goalProgress}%`,
                borderRadius: 'var(--radius-pill)',
                background: 'linear-gradient(90deg, var(--signal), var(--orbit))',
              }}
            />
          </div>
          <p className="mt-3 text-sm" style={{ color: 'var(--muted-ink)' }}>
            {formatCurrency(goalCurrent)} funded ({goalProgress}%)
          </p>
        </MetricCard>

        <MetricCard
          eyebrow="Streak Count"
          title="Daily Intention"
          value={`${intentionDays} Days`}
          accent="var(--orbit)"
        >
          <p className="mt-4 text-sm" style={{ color: 'var(--muted-ink)' }}>
            Stay consistent to strengthen financial reflexes.
          </p>
        </MetricCard>
      </section>
    </div>
  );
}
