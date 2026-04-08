import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, IndianRupee, PiggyBank, Sparkles, ArrowUpRight } from 'lucide-react';
import StatCard from '../components/common/StatCard';
import Card from '../components/common/Card';
import NetWorthChart from '../components/charts/NetWorthChart';
import IncomeExpenseBar from '../components/charts/IncomeExpenseBar';
import ExpensePieChart from '../components/charts/ExpensePieChart';
import { ChartSkeleton } from '../components/common/LoadingSkeleton';
import { getDashboard, getMonthlyComparison } from '../services/dashboardService';
import { formatCurrency, formatDate } from '../utils/constants';
import toast from 'react-hot-toast';

/* ── Circular habit progress ring ─────────────────────────── */
function HabitRing({ completed, total }) {
  const size = 120;
  const stroke = 8;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = total > 0 ? completed / total : 0;
  const offset = circ * (1 - pct);

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-4">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {/* track */}
          <circle cx={size / 2} cy={size / 2} r={r}
            fill="none" stroke="var(--elevated)" strokeWidth={stroke} />
          {/* progress */}
          <circle cx={size / 2} cy={size / 2} r={r}
            fill="none"
            stroke="url(#ringGrad)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(.4,0,.2,1)' }}
          />
          <defs>
            <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#a78bfa" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ transform: 'rotate(0deg)' }}>
          <span className="text-2xl font-black text-main leading-none">{completed}</span>
          <span className="text-xs text-muted mt-0.5">of {total}</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-main">Today's Habits</p>
        <p className="text-xs text-muted mt-0.5">
          {total === 0 ? 'No habits set' : pct === 1 ? '🎉 All done!' : `${Math.round(pct * 100)}% complete`}
        </p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [d, c] = await Promise.all([getDashboard(), getMonthlyComparison(6)]);
        setData(d.data.data);
        const incomeMap = Object.fromEntries(c.data.data.income.map((r) => [r.month, Number(r.total)]));
        const expenseMap = Object.fromEntries(c.data.data.expense.map((r) => [r.month, Number(r.total)]));
        const months = [...new Set([...Object.keys(incomeMap), ...Object.keys(expenseMap)])];
        setComparison(months.map((m) => ({ month: m, income: incomeMap[m] || 0, expense: expenseMap[m] || 0 })));
      } catch {
        toast.error('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array(4).fill(0).map((_, i) => (
          <div key={i} className="h-28 rounded-2xl animate-pulse" style={{ background: 'var(--elevated)' }} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartSkeleton height={300} />
        <ChartSkeleton height={300} />
        <ChartSkeleton height={300} />
      </div>
    </div>
  );

  const ov = data?.overview || {};
  const habitsCompleted = data?.habitStats?.completed_today || 0;
  const habitsTotal = data?.habitStats?.total_active || 0;
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="space-y-5 animate-fade-in">

      {/* ── Page Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black text-main tracking-tight">
            Financial Overview
          </h1>
          <p className="text-sub text-sm mt-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            {today}
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold"
          style={{ background: 'var(--accent-dim)', color: 'var(--accent-txt)', border: '1px solid rgba(99,102,241,0.2)' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Live data
        </div>
      </div>

      {/* ── Stat Cards Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="animate-fade-in-up">
          <StatCard title="Net Worth" value={formatCurrency(ov.netWorth)} icon={IndianRupee} color="indigo" />
        </div>
        <div className="animate-fade-in-up delay-100">
          <StatCard title="Monthly Income" value={formatCurrency(ov.monthlyIncome)} icon={TrendingUp} color="emerald" />
        </div>
        <div className="animate-fade-in-up delay-200">
          <StatCard title="Monthly Expenses" value={formatCurrency(ov.monthlyExpense)} icon={TrendingDown} color="rose" />
        </div>
        <div className="animate-fade-in-up delay-300">
          <StatCard title="Monthly Savings" value={formatCurrency(ov.monthlySavings)} icon={PiggyBank}
            color={ov.monthlySavings >= 0 ? 'blue' : 'rose'} />
        </div>
      </div>

      {/* ── Bento Row 1: Hero chart + Habit ring + Transaction list ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* Net Worth Hero — spans 7 cols */}
        <div className="lg:col-span-7 animate-fade-in-up delay-100">
          <Card title="Net Worth Trend — 6 Months"
            action={<span className="text-xs text-muted flex items-center gap-1">All time <ArrowUpRight className="w-3 h-3" /></span>}>
            <div className="px-5 pb-5 pt-2">
              <NetWorthChart data={data?.netWorthTrend || []} />
            </div>
          </Card>
        </div>

        {/* Habit Ring — spans 2 cols */}
        <div className="lg:col-span-2 animate-fade-in-up delay-200">
          <Card className="h-full">
            <div className="p-4 flex flex-col h-full justify-center">
              <HabitRing completed={habitsCompleted} total={habitsTotal} />
              {habitsTotal > 0 && (
                <div className="mt-2 mx-4">
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--elevated)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${(habitsCompleted / habitsTotal) * 100}%`,
                        background: 'linear-gradient(90deg, #6366f1, #a78bfa)',
                        boxShadow: '0 0 8px rgba(99,102,241,0.5)',
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Recent Transactions — spans 3 cols */}
        <div className="lg:col-span-3 animate-fade-in-up delay-300">
          <Card title="Recent Activity" className="h-full">
            <div className="px-4 pb-4 space-y-1.5 overflow-y-auto" style={{ maxHeight: 300 }}>
              {(data?.recentTransactions || []).length === 0 ? (
                <p className="text-muted text-xs py-6 text-center">No transactions yet</p>
              ) : (
                data.recentTransactions.slice(0, 8).map((t, i) => (
                  <div key={i}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors"
                    style={{ background: 'var(--elevated)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'var(--elevated)'}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        t.type === 'income' ? 'bg-emerald-500/15' : 'bg-rose-500/15'
                      }`}>
                        {t.type === 'income'
                          ? <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                          : <TrendingDown className="w-3.5 h-3.5 text-rose-400" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-main truncate">{t.label}</p>
                        <p className="text-[10px] text-muted">{formatDate(t.date)}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-bold ml-2 flex-shrink-0 ${
                      t.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* ── Bento Row 2: Income/Expense bar + Pie + Savings ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* Income vs Expenses — 5 cols */}
        <div className="lg:col-span-5 animate-fade-in-up delay-100">
          <Card title="Income vs Expenses — 6 Months">
            <div className="px-5 pb-5">
              <IncomeExpenseBar data={comparison || []} />
            </div>
          </Card>
        </div>

        {/* Expense Breakdown — 4 cols */}
        <div className="lg:col-span-4 animate-fade-in-up delay-200">
          <Card title="Expense Breakdown">
            <div className="px-5 pb-5">
              {data?.expenseByCategory?.length > 0 ? (
                <ExpensePieChart data={data.expenseByCategory} />
              ) : (
                <div className="h-52 flex items-center justify-center text-muted text-sm">
                  No expenses this month
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Savings Goals — 3 cols */}
        <div className="lg:col-span-3 animate-fade-in-up delay-300">
          <Card title="Savings Goals" className="h-full">
            <div className="px-4 pb-4 space-y-2.5">
              {(data?.savingsGoals || []).length === 0 ? (
                <p className="text-muted text-xs py-6 text-center">No goals yet</p>
              ) : (
                data.savingsGoals.slice(0, 5).map((g) => {
                  const pct = Math.min(100, Math.round((Number(g.current_amount) / Number(g.target_amount)) * 100));
                  return (
                    <div key={g.id} className="p-3 rounded-xl" style={{ background: 'var(--elevated)' }}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-semibold text-main truncate">{g.title}</span>
                        <span className="text-[10px] font-bold text-indigo-400 ml-2">{pct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--hover)' }}>
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${pct}%`,
                            background: pct >= 100
                              ? 'linear-gradient(90deg,#10b981,#059669)'
                              : 'linear-gradient(90deg,#6366f1,#8b5cf6)',
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-muted mt-1.5">
                        <span>{formatCurrency(g.current_amount)}</span>
                        <span>{formatCurrency(g.target_amount)}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
