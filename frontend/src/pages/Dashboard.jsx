import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, IndianRupee, PiggyBank, LineChart, Target } from 'lucide-react';
import StatCard from '../components/common/StatCard';
import Card from '../components/common/Card';
import NetWorthChart from '../components/charts/NetWorthChart';
import IncomeExpenseBar from '../components/charts/IncomeExpenseBar';
import ExpensePieChart from '../components/charts/ExpensePieChart';
import LoadingSkeleton, { ChartSkeleton } from '../components/common/LoadingSkeleton';
import { getDashboard, getMonthlyComparison } from '../services/dashboardService';
import { formatCurrency, formatDate } from '../utils/constants';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [d, c] = await Promise.all([getDashboard(), getMonthlyComparison(6)]);
        setData(d.data.data);
        // Merge income and expense comparison
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
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array(4).fill(0).map((_, i) => <div key={i} className="h-24 bg-elevated rounded-xl animate-pulse" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartSkeleton height={300} />
        <ChartSkeleton height={300} />
      </div>
    </div>
  );

  const ov = data?.overview || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-main">Dashboard</h1>
        <p className="text-sub text-sm mt-0.5">Your financial overview at a glance</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Net Worth" value={formatCurrency(ov.netWorth)} icon={IndianRupee} color="indigo" />
        <StatCard title="Monthly Income" value={formatCurrency(ov.monthlyIncome)} icon={TrendingUp} color="emerald" />
        <StatCard title="Monthly Expenses" value={formatCurrency(ov.monthlyExpense)} icon={TrendingDown} color="rose" />
        <StatCard title="Monthly Savings" value={formatCurrency(ov.monthlySavings)} icon={PiggyBank}
          color={ov.monthlySavings >= 0 ? 'blue' : 'rose'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Net Worth Trend */}
        <Card title="Net Worth Trend" className="lg:col-span-2">
          <div className="px-5 pb-5">
            <NetWorthChart data={data?.netWorthTrend || []} />
          </div>
        </Card>

        {/* Habit Stats */}
        <Card title="Today's Habits">
          <div className="px-5 pb-5 space-y-3">
            <div className="flex items-center gap-3 p-3 bg-elevated rounded-lg">
              <Target className="w-8 h-8 text-indigo-400" />
              <div>
                <p className="text-2xl font-bold text-main">{data?.habitStats?.completed_today || 0}/{data?.habitStats?.total_active || 0}</p>
                <p className="text-xs text-sub">Habits completed today</p>
              </div>
            </div>
            {data?.habitStats?.total_active > 0 && (
              <div>
                <div className="flex justify-between text-xs text-sub mb-1">
                  <span>Daily progress</span>
                  <span>{Math.round((data.habitStats.completed_today / data.habitStats.total_active) * 100)}%</span>
                </div>
                <div className="h-2 bg-elevated rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                    style={{ width: `${(data.habitStats.completed_today / data.habitStats.total_active) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Income vs Expense */}
        <Card title="Income vs Expenses (6 Months)">
          <div className="px-5 pb-5">
            <IncomeExpenseBar data={comparison || []} />
          </div>
        </Card>

        {/* Expense Breakdown */}
        <Card title="Expense Breakdown (This Month)">
          <div className="px-5 pb-5">
            {data?.expenseByCategory?.length > 0 ? (
              <ExpensePieChart data={data.expenseByCategory} />
            ) : (
              <div className="h-60 flex items-center justify-center text-muted text-sm">
                No expenses recorded this month
              </div>
            )}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Transactions */}
        <Card title="Recent Transactions">
          <div className="px-5 pb-5 space-y-2">
            {(data?.recentTransactions || []).length === 0 ? (
              <p className="text-muted text-sm py-4 text-center">No transactions yet</p>
            ) : (
              data.recentTransactions.map((t, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-elevated rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${t.type === 'income' ? 'bg-emerald-500/20' : 'bg-rose-500/20'}`}>
                      {t.type === 'income' ? <TrendingUp className="w-4 h-4 text-emerald-400" /> : <TrendingDown className="w-4 h-4 text-rose-400" />}
                    </div>
                    <div>
                      <p className="text-sm text-main font-medium truncate max-w-[150px]">{t.label}</p>
                      <p className="text-xs text-muted">{formatDate(t.date)}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-semibold ${t.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Savings Goals */}
        <Card title="Savings Goals">
          <div className="px-5 pb-5 space-y-3">
            {(data?.savingsGoals || []).length === 0 ? (
              <p className="text-muted text-sm py-4 text-center">No savings goals yet</p>
            ) : (
              data.savingsGoals.map((g) => {
                const pct = Math.min(100, Math.round((Number(g.current_amount) / Number(g.target_amount)) * 100));
                return (
                  <div key={g.id} className="p-3 bg-elevated rounded-lg">
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-main font-medium truncate">{g.title}</span>
                      <span className="text-muted text-xs ml-2">{pct}%</span>
                    </div>
                    <div className="h-1.5 bg-elevated rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted mt-1">
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
  );
}
