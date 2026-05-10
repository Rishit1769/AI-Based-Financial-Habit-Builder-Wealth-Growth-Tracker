import { useEffect, useMemo, useState } from 'react';
import { FaArrowRightLong, FaCircle } from 'react-icons/fa6';
import { apiRequest } from '../services/api.js';
import { ChartPanel, DonutBreakdownChart, LineTrendChart } from '../components/charts/FinanceCharts.jsx';

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat('en-IN');

const chartPalette = ['var(--signal)', 'var(--orbit)', 'var(--growth)', '#36A2EB', '#9966FF', '#F59E0B'];

const formatCurrency = (value) => currencyFormatter.format(Number(value || 0));

const formatCompactCurrency = (value) => {
  const amount = Number(value || 0);
  if (Math.abs(amount) < 1000) {
    return formatCurrency(amount);
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(amount);
};

function MetricCard({ eyebrow, value, footnote, children, valueColor }) {
  return (
    <article className="card-stadium px-6 py-6 md:px-7 md:py-7">
      <p className="eyebrow" style={{ color: 'var(--muted-ink)' }}>
        {eyebrow}
      </p>
      <p className="wealth-display mt-5 text-[clamp(2.15rem,4.4vw,3rem)] font-bold" style={{ color: valueColor || 'var(--ink)' }}>
        {value}
      </p>
      {children}
      {footnote && (
        <p className="mt-4 text-sm font-semibold" style={{ color: 'var(--growth)' }}>
          {footnote}
        </p>
      )}
    </article>
  );
}

export default function OverviewView({ accessToken, user, onGenerateReport }) {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await apiRequest('/dashboard', { token: accessToken });
        if (!mounted) {
          return;
        }
        setDashboard(response.data);
      } catch (err) {
        if (!mounted) {
          return;
        }
        setError(err.message || 'Unable to load dashboard data.');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, [accessToken]);

  const netWorthTrendChart = useMemo(() => {
    const trend = dashboard?.netWorthTrend || [];
    if (!trend.length) {
      return [];
    }

    return trend.map((entry) => ({
      label: String(entry.label || '').split(' ')[0] || 'Month',
      value: Number(entry.net_worth || 0),
    }));
  }, [dashboard?.netWorthTrend]);

  const expenseBreakdown = useMemo(() => {
    const rows = dashboard?.expenseByCategory || [];
    return rows.map((item, index) => ({
      label: item.category,
      value: Number(item.total || 0),
      color: chartPalette[index % chartPalette.length],
    }));
  }, [dashboard?.expenseByCategory]);

  const overview = dashboard?.overview;
  const primaryGoal = dashboard?.savingsGoals?.[0] || null;
  const goalProgress = primaryGoal
    ? Math.min(100, Math.round((Number(primaryGoal.current_amount || 0) / Math.max(Number(primaryGoal.target_amount || 1), 1)) * 100))
    : 0;

  const completedToday = Number(dashboard?.habitStats?.completed_today || 0);
  const totalActiveHabits = Number(dashboard?.habitStats?.total_active || 0);

  if (loading) {
    return (
      <section className="card-stadium px-7 py-8 text-sm" style={{ color: 'var(--muted-ink)' }}>
        Loading dashboard metrics from database...
      </section>
    );
  }

  if (error) {
    return (
      <section className="card-stadium px-7 py-8 text-sm font-semibold" style={{ color: '#dc2626' }}>
        {error}
      </section>
    );
  }

  return (
    <div className="space-y-7 md:space-y-9">
      <section className="relative grid gap-5 lg:grid-cols-[1.22fr_0.78fr] lg:items-start">
        <span className="ghost-watermark" style={{ left: '0', top: '6px' }}>
          ASSETS
        </span>

        <article className="relative z-10 max-w-[44rem] px-1 py-5">
          <p className="eyebrow flex items-center gap-2" style={{ color: 'var(--muted-ink)' }}>
            <FaCircle style={{ color: 'var(--signal)' }} />
            Wealth Intelligence Active
          </p>

          <h2 className="wealth-display mt-5 text-[clamp(3.35rem,8.8vw,5.4rem)] font-extrabold leading-[0.95]">
            Personal Net
            <br />
            Worth
            <br />
            Evolution
          </h2>

          <p className="mt-6 max-w-[26rem] text-[1.04rem] leading-[1.6]" style={{ color: 'var(--muted-ink)' }}>
            {(user?.name || 'Member').split(' ')[0]}, your live data indicates monthly savings of{' '}
            <strong>{formatCurrency(overview?.monthlySavings)}</strong> and a current net worth of{' '}
            <strong>{formatCurrency(overview?.netWorth)}</strong>.
          </p>

          <button
            type="button"
            className="pill-button mt-8 inline-flex items-center gap-2 px-8 py-3 text-sm"
            style={{ background: 'var(--ink)', color: 'var(--canvas)' }}
            onClick={onGenerateReport}
          >
            Generate Report
            <FaArrowRightLong />
          </button>
        </article>

        <article className="card-stadium relative z-10 px-6 py-6 md:px-7 md:py-7">
          <div className="flex items-center justify-between gap-4">
            <h3 className="wealth-display text-[2rem] font-bold">Growth Pulse</h3>
            <span
              className="pill-button px-4 py-1.5 text-[11px] font-semibold uppercase"
              style={{ color: 'var(--growth)', background: 'color-mix(in srgb, var(--growth) 13%, transparent)' }}
            >
              Target Met
            </span>
          </div>

          <div className="mt-5">
            <LineTrendChart points={netWorthTrendChart} valuePrefix="INR " color="var(--orbit)" />
          </div>
        </article>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        <MetricCard
          eyebrow="Total Assets"
          value={formatCompactCurrency(overview?.netWorth)}
          footnote={`Savings ${formatCompactCurrency(overview?.totalSavings)}`}
          valueColor="var(--ink)"
        />

        <MetricCard
          eyebrow={primaryGoal ? primaryGoal.title : 'Savings Goal'}
          value={formatCompactCurrency(primaryGoal?.target_amount)}
          valueColor="var(--ink)"
        >
          <div
            className="mt-5 h-2.5"
            style={{ borderRadius: 'var(--radius-pill)', background: 'color-mix(in srgb, var(--ink) 9%, transparent)' }}
          >
            <span
              className="block h-full"
              style={{
                width: `${goalProgress}%`,
                borderRadius: 'var(--radius-pill)',
                background: 'linear-gradient(90deg, var(--signal), var(--orbit))',
              }}
            />
          </div>
          <p className="mt-3 text-sm font-semibold" style={{ color: 'var(--muted-ink)' }}>
            {goalProgress}% complete ({formatCurrency(primaryGoal?.current_amount)} saved)
          </p>
        </MetricCard>

        <MetricCard
          eyebrow="Daily Intention"
          value={`${numberFormatter.format(completedToday)} / ${numberFormatter.format(totalActiveHabits)}`}
          valueColor="var(--ink)"
        >
          <p className="eyebrow mt-5" style={{ color: 'var(--muted-ink)' }}>
            Habits Completed Today
          </p>
        </MetricCard>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <ChartPanel
          title="Net Worth Trajectory"
          subtitle="Rolling six-month movement based on your cumulative income and expenses"
        >
          <LineTrendChart points={netWorthTrendChart} valuePrefix="INR " color="var(--growth)" />
        </ChartPanel>

        <ChartPanel
          title="Expense Category Mix"
          subtitle="Current month expense distribution by category"
        >
          <DonutBreakdownChart
            segments={expenseBreakdown}
            centerLabel="Expenses"
            centerValue={formatCompactCurrency(overview?.monthlyExpense)}
          />
        </ChartPanel>
      </section>
    </div>
  );
}
