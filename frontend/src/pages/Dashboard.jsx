import { useEffect, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Plus,
  Download,
  Bot,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

import NetWorthChart from '../components/charts/NetWorthChart';
import IncomeExpenseBar from '../components/charts/IncomeExpenseBar';
import ExpensePieChart from '../components/charts/ExpensePieChart';
import { ChartSkeleton } from '../components/common/LoadingSkeleton';
import { getDashboard, getMonthlyComparison } from '../services/dashboardService';
import { formatCurrency, formatDate } from '../utils/constants';
import { useAuth } from '../context/AuthContext';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [comparison, setComparison] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [d, c] = await Promise.all([getDashboard(), getMonthlyComparison(6)]);
        setData(d?.data?.data || null);

        const incomeRows = c?.data?.data?.income || [];
        const expenseRows = c?.data?.data?.expense || [];

        const incomeMap = Object.fromEntries(
          incomeRows.map((row) => [row.month, Number(row.total) || 0]),
        );
        const expenseMap = Object.fromEntries(
          expenseRows.map((row) => [row.month, Number(row.total) || 0]),
        );

        const months = [...new Set([...Object.keys(incomeMap), ...Object.keys(expenseMap)])];
        setComparison(
          months.map((month) => ({
            month,
            income: incomeMap[month] || 0,
            expense: expenseMap[month] || 0,
          })),
        );
      } catch {
        toast.error('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="space-y-5">
        <div
          className="h-10 w-64   animate-pulse"
          style={{ background: 'var(--color-surface)' }}
        />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <ChartSkeleton height={280} />
          </div>
          <div>
            <ChartSkeleton height={280} />
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-28   animate-pulse"
              style={{ background: 'var(--color-surface)' }}
            />
          ))}
        </div>
      </div>
    );
  }

  const ov = data?.overview || {};
  const habitsCompleted = data?.habitStats?.completed_today || 0;
  const habitsTotal = data?.habitStats?.total_active || 0;
  const habitPct = habitsTotal > 0 ? Math.round((habitsCompleted / habitsTotal) * 100) : 0;
  const firstName = user?.name?.split(' ')[0] || 'there';

  const assetCards = [
    {
      label: 'Monthly Income',
      pct: null,
      sublabel: 'This month',
      value: formatCurrency(ov.monthlyIncome || 0),
      color: 'var(--color-volt)',
    },
    {
      label: 'Monthly Expenses',
      pct: null,
      sublabel: 'This month',
      value: formatCurrency(ov.monthlyExpense || 0),
      color: 'var(--color-terracotta)',
    },
    {
      label: 'Active Habits',
      pct: habitPct,
      sublabel: `${habitsCompleted} of ${habitsTotal} today`,
      value: `${habitsCompleted}/${habitsTotal}`,
      color: '#60a5fa',
    },
    {
      label: 'Monthly Savings',
      pct: null,
      sublabel: 'Net this month',
      value: formatCurrency(ov.monthlySavings || 0),
      color: (ov.monthlySavings || 0) >= 0 ? 'var(--color-volt)' : 'var(--color-terracotta)',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <p className="text-sub text-sm mb-1">{greeting()},</p>
        <h1
          className="text-[var(--color-ink)] leading-none tracking-tight"
          style={{
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            fontWeight: 900,
            fontStyle: 'italic',
            letterSpacing: '-0.03em',
          }}
        >
          Welcome Back, {firstName}.
        </h1>
        <p className="text-[var(--color-muted)] text-sm mt-2">Your financial health is being tracked in real-time.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div
          className="lg:col-span-2   overflow-hidden"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-ink)' }}
        >
          <div className="px-6 pt-5 pb-2">
            <p className="text-[var(--color-muted)] text-xs uppercase tracking-widest font-medium mb-2">Current Net Worth</p>
            <div className="flex items-end gap-3">
              <span
                className="text-[var(--color-ink)] font-bold tracking-tight"
                style={{
                  fontSize: 'clamp(2rem, 5vw, 3.25rem)',
                  letterSpacing: '-0.04em',
                }}
              >
                {formatCurrency(ov.netWorth || 0)}
              </span>

              {(ov.monthlyIncome || 0) > 0 && (
                <div
                  className="mb-1 inline-flex items-center gap-1 px-2 py-0.5   text-xs font-bold"
                  style={{ background: 'rgba(74,222,128,0.12)', color: 'var(--color-volt)' }}
                >
                  <TrendingUp className="w-3 h-3" />
                  +
                  {Math.round(
                    ((ov.monthlySavings || 0) / Math.max(ov.monthlyIncome || 0, 1)) * 100,
                  )}
                  %
                </div>
              )}
            </div>
          </div>
          <div className="px-2 pb-4">
            <NetWorthChart data={data?.netWorthTrend || []} />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            to="/income"
            className="flex items-center justify-between p-4   group transition-colors cursor-pointer"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-ink)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-volt)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-ink)';
            }}
          >
            <div>
              <p className="text-[var(--color-ink)] text-sm font-semibold">Add Income</p>
              <p className="text-[var(--color-muted)] text-xs mt-0.5">Record a new income source</p>
            </div>
            <div
              className="w-8 h-8   flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--color-volt)', color: '#000' }}
            >
              <TrendingUp className="w-4 h-4" />
            </div>
          </Link>

          <Link
            to="/reports"
            className="flex items-center justify-between p-4   group transition-colors cursor-pointer"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-ink)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-ink)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-ink)';
            }}
          >
            <div>
              <p className="text-[var(--color-ink)] text-sm font-semibold">Generate Report</p>
              <p className="text-[var(--color-muted)] text-xs mt-0.5">Monthly financial summary</p>
            </div>
            <div
              className="w-8 h-8   flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--color-surface)', color: 'var(--text-2)' }}
            >
              <Download className="w-4 h-4" />
            </div>
          </Link>

          <Link
            to="/expenses"
            className="flex items-center justify-between p-4   group transition-colors cursor-pointer"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-ink)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-ink)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-ink)';
            }}
          >
            <div>
              <p className="text-[var(--color-ink)] text-sm font-semibold">Add Expense</p>
              <p className="text-[var(--color-muted)] text-xs mt-0.5">Log a transaction</p>
            </div>
            <div
              className="w-8 h-8   flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--color-surface)', color: 'var(--text-2)' }}
            >
              <Plus className="w-4 h-4" />
            </div>
          </Link>

          <Link
            to="/ai-advisor"
            className="flex items-center justify-between p-4   transition-colors cursor-pointer"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-ink)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-ink)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-ink)';
            }}
          >
            <div>
              <p className="text-[var(--color-ink)] text-sm font-semibold">AI Advisor</p>
              <p className="text-[var(--color-muted)] text-xs mt-0.5">Get personalized insights</p>
            </div>
            <div
              className="w-8 h-8   flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(74,222,128,0.1)', color: 'var(--color-volt)' }}
            >
              <Bot className="w-4 h-4" />
            </div>
          </Link>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[var(--color-ink)] text-sm font-semibold">Financial Overview</h2>
          <Link
            to="/investments"
            className="text-xs flex items-center gap-1 transition-colors"
            style={{ color: 'var(--color-volt)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            View Breakdown <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {assetCards.map((card, index) => (
            <div
              key={index}
              className="  p-4 transition-colors"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-ink)' }}
            >
              {card.pct !== null && (
                <p
                  className="text-xs font-semibold mb-1 uppercase tracking-wider"
                  style={{ color: card.color, fontSize: '10px' }}
                >
                  {card.pct}% of target
                </p>
              )}
              <p className="text-[var(--color-muted)] text-xs mb-2">{card.sublabel}</p>
              <p className="text-[var(--color-ink)] text-sm font-bold truncate">{card.label}</p>
              <p
                className="font-bold mt-1 truncate"
                style={{ fontSize: '1.25rem', color: card.color, letterSpacing: '-0.03em' }}
              >
                {card.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[var(--color-ink)] text-sm font-semibold">Savings Goals</h2>
            <Link to="/savings" className="text-xs flex items-center gap-1 transition-colors" style={{ color: 'var(--color-volt)' }}>
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {(data?.savingsGoals || []).length === 0 ? (
              <div
                className="  p-8 text-center"
                style={{ background: 'var(--color-surface)', border: '1px solid var(--color-ink)' }}
              >
                <p className="text-[var(--color-muted)] text-sm">No savings goals yet</p>
                <Link to="/savings" className="text-xs mt-2 inline-block" style={{ color: 'var(--color-volt)' }}>
                  Create your first goal →
                </Link>
              </div>
            ) : (
              data.savingsGoals.slice(0, 3).map((goal) => {
                const pct = Math.min(
                  100,
                  Math.round((Number(goal.current_amount) / Math.max(Number(goal.target_amount), 1)) * 100),
                );

                return (
                  <div
                    key={goal.id}
                    className="  p-4"
                    style={{ background: 'var(--color-surface)', border: '1px solid var(--color-ink)' }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-[var(--color-ink)] text-sm font-semibold">{goal.title}</p>
                        {goal.deadline && (
                          <p className="text-[var(--color-muted)] text-xs mt-0.5">
                            Target:{' '}
                            {new Date(goal.deadline).toLocaleDateString('en-IN', {
                              month: 'short',
                              year: 'numeric',
                            })}
                          </p>
                        )}
                      </div>
                      <span
                        className="font-bold text-sm"
                        style={{ color: pct >= 100 ? 'var(--color-volt)' : 'var(--color-volt)' }}
                      >
                        {pct}%
                      </span>
                    </div>

                    <div className="h-1.5   overflow-hidden" style={{ background: 'var(--color-surface)' }}>
                      <div
                        className="h-full   transition-all duration-700"
                        style={{ width: `${pct}%`, background: pct >= 100 ? 'var(--color-volt)' : 'var(--color-volt)' }}
                      />
                    </div>

                    <div className="flex justify-between text-xs text-[var(--color-muted)] mt-2">
                      <span>{formatCurrency(goal.current_amount)} saved</span>
                      <span>Target: {formatCurrency(goal.target_amount)}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[var(--color-ink)] text-sm font-semibold">Recent Activity</h2>
            <div className="flex items-center gap-3">
              <span
                className="text-[var(--color-muted)] text-xs uppercase font-medium"
                style={{ fontSize: '10px', letterSpacing: '0.06em' }}
              >
                TRANSACTION
              </span>
              <span
                className="text-[var(--color-muted)] text-xs uppercase font-medium"
                style={{ fontSize: '10px', letterSpacing: '0.06em' }}
              >
                AMOUNT
              </span>
            </div>
          </div>

          <div
            className="  overflow-hidden"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-ink)' }}
          >
            {(data?.recentTransactions || []).length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-[var(--color-muted)] text-sm">No recent transactions</p>
              </div>
            ) : (
              <div>
                {data.recentTransactions.slice(0, 7).map((tx, index) => (
                  <div
                    key={`${tx.id || tx.date || index}-${index}`}
                    className="flex items-center justify-between px-4 py-3 transition-colors"
                    style={{ borderBottom: index < 6 ? '1px solid var(--color-ink)' : 'none' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--color-surface)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-8 h-8   flex items-center justify-center flex-shrink-0 ${
                          tx.type === 'income' ? 'bg-[rgba(200,255,0,0.12)]' : 'bg-[rgba(214,74,42,0.12)]'
                        }`}
                      >
                        {tx.type === 'income' ? (
                          <TrendingUp className="w-3.5 h-3.5" style={{ color: 'var(--color-volt)' }} />
                        ) : (
                          <TrendingDown className="w-3.5 h-3.5 text-[var(--color-terracotta)]" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="text-[var(--color-ink)] text-xs font-semibold truncate">{tx.label}</p>
                        <p className="text-[var(--color-muted)] truncate" style={{ fontSize: '10px' }}>
                          {formatDate(tx.date)}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-xs font-bold ml-3 flex-shrink-0 ${
                        tx.type === 'income' ? 'text-[var(--color-volt)]' : 'text-[var(--color-terracotta)]'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '-'}
                      {formatCurrency(tx.amount)}
                    </span>
                  </div>
                ))}

                <div className="px-4 py-3 text-center">
                  <Link
                    to="/expenses"
                    className="text-xs transition-colors"
                    style={{ color: 'var(--text-2)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'var(--color-volt)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--text-2)';
                    }}
                  >
                    Download All History (CSV)
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div
          className="  overflow-hidden"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-ink)' }}
        >
          <div
            className="px-4 pt-4 pb-2 flex items-center justify-between"
            style={{ borderBottom: '1px solid var(--color-ink)' }}
          >
            <h3 className="text-[var(--color-ink)] text-sm font-semibold">Income vs Expenses</h3>
            <span className="text-[var(--color-muted)] text-xs">6 months</span>
          </div>
          <div className="px-4 pt-2 pb-4">
            <IncomeExpenseBar data={comparison || []} />
          </div>
        </div>

        <div
          className="  overflow-hidden"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-ink)' }}
        >
          <div
            className="px-4 pt-4 pb-2 flex items-center justify-between"
            style={{ borderBottom: '1px solid var(--color-ink)' }}
          >
            <h3 className="text-[var(--color-ink)] text-sm font-semibold">Expense Breakdown</h3>
            <span className="text-[var(--color-muted)] text-xs">This month</span>
          </div>
          <div className="px-4 pt-2 pb-4">
            {data?.expenseByCategory?.length > 0 ? (
              <ExpensePieChart data={data.expenseByCategory} />
            ) : (
              <div className="h-52 flex items-center justify-center text-[var(--color-muted)] text-sm">
                No expenses this month
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
