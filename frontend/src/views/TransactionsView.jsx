import { useEffect, useMemo, useState } from 'react';
import { FaArrowTrendDown, FaArrowTrendUp } from 'react-icons/fa6';
import { apiRequest } from '../services/api.js';
import { ChartPanel, DonutBreakdownChart, GroupedBarChart } from '../components/charts/FinanceCharts.jsx';

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat('en-IN', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

const formatCurrency = (value) => currencyFormatter.format(Number(value || 0));

const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const chartPalette = ['var(--signal)', 'var(--orbit)', 'var(--growth)', '#36A2EB', '#9966FF', '#F59E0B'];

export default function TransactionsView({ accessToken }) {
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState({
    monthlyIncome: 0,
    monthlyExpense: 0,
    totalIncomeYear: 0,
    totalExpenseYear: 0,
    trend: [],
    expenseByCategory: [],
  });
  const [form, setForm] = useState({
    type: 'expense',
    title: '',
    amount: '',
    category: 'other',
    date: new Date().toISOString().slice(0, 10),
    notes: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const expenseCategories = ['food', 'transport', 'rent', 'entertainment', 'health', 'education', 'shopping', 'utilities', 'other'];
  const incomeCategories = ['salary', 'freelance', 'business', 'investment', 'other'];

  const loadTransactions = async () => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const [incomeResponse, expenseResponse, incomeSummaryResponse, expenseSummaryResponse] = await Promise.all([
      apiRequest(`/income?month=${month}&year=${year}&limit=50`, { token: accessToken }),
      apiRequest(`/expenses?month=${month}&year=${year}&limit=50`, { token: accessToken }),
      apiRequest(`/income/summary?year=${year}`, { token: accessToken }),
      apiRequest(`/expenses/summary?year=${year}&month=${month}`, { token: accessToken }),
    ]);

    const mappedIncome = incomeResponse.data.map((entry) => ({
      id: `income-${entry.id}`,
      type: 'income',
      title: entry.source,
      category: entry.category,
      amount: Number(entry.amount || 0),
      date: entry.date,
    }));

    const mappedExpense = expenseResponse.data.map((entry) => ({
      id: `expense-${entry.id}`,
      type: 'expense',
      title: entry.description,
      category: entry.category,
      amount: Number(entry.amount || 0),
      date: entry.date,
    }));

    const merged = [...mappedIncome, ...mappedExpense].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const monthlyIncome = mappedIncome.reduce((acc, item) => acc + item.amount, 0);
    const monthlyExpense = mappedExpense.reduce((acc, item) => acc + item.amount, 0);

    const incomeByMonth = new Map();
    (incomeSummaryResponse.data?.monthly || []).forEach((item) => {
      const month = Number(item.month || 0);
      const current = Number(incomeByMonth.get(month) || 0);
      incomeByMonth.set(month, current + Number(item.total || 0));
    });

    const expenseByMonth = new Map();
    (expenseSummaryResponse.data?.byMonth || []).forEach((item) => {
      const month = Number(item.month || 0);
      expenseByMonth.set(month, Number(item.total || 0));
    });

    const trend = monthLabels.slice(0, month).map((label, index) => {
      const monthNo = index + 1;
      return {
        label,
        income: Number(incomeByMonth.get(monthNo) || 0),
        expense: Number(expenseByMonth.get(monthNo) || 0),
      };
    });

    const expenseByCategoryMap = mappedExpense.reduce((acc, entry) => {
      const key = entry.category || 'other';
      acc.set(key, Number(acc.get(key) || 0) + Number(entry.amount || 0));
      return acc;
    }, new Map());

    const expenseByCategory = Array.from(expenseByCategoryMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([label, value], index) => ({
        label,
        value,
        color: chartPalette[index % chartPalette.length],
      }));

    setItems(merged);
    setSummary({
      monthlyIncome,
      monthlyExpense,
      totalIncomeYear: Number(incomeSummaryResponse.data.totalYear || 0),
      totalExpenseYear: Number(expenseSummaryResponse.data.total || 0),
      trend,
      expenseByCategory,
    });
  };

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      try {
        setLoading(true);
        setError('');
        await loadTransactions();
        if (!mounted) {
          return;
        }
      } catch (err) {
        if (!mounted) {
          return;
        }
        setError(err.message || 'Unable to load transactions.');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    run();

    return () => {
      mounted = false;
    };
  }, [accessToken]);

  const handleAddTransaction = async (event) => {
    event.preventDefault();
    setError('');

    if (!form.title.trim()) {
      setError('Title is required.');
      return;
    }

    const amount = Number(form.amount);
    if (!amount || amount <= 0) {
      setError('Amount must be greater than zero.');
      return;
    }

    try {
      setSaving(true);
      if (form.type === 'income') {
        await apiRequest('/income', {
          method: 'POST',
          token: accessToken,
          body: {
            source: form.title.trim(),
            amount,
            category: form.category,
            notes: form.notes.trim() || null,
            date: form.date,
          },
        });
      } else {
        await apiRequest('/expenses', {
          method: 'POST',
          token: accessToken,
          body: {
            description: form.title.trim(),
            amount,
            category: form.category,
            notes: form.notes.trim() || null,
            date: form.date,
          },
        });
      }

      setForm((current) => ({
        ...current,
        title: '',
        amount: '',
        notes: '',
      }));
      await loadTransactions();
    } catch (err) {
      setError(err.message || 'Unable to add transaction right now.');
    } finally {
      setSaving(false);
    }
  };

  const netMonthly = useMemo(() => summary.monthlyIncome - summary.monthlyExpense, [summary]);

  return (
    <div className="space-y-8">
      <section className="max-w-[49rem]">
        <p className="eyebrow" style={{ color: 'var(--signal)' }}>
          Live Ledger
        </p>
        <h2 className="wealth-display mt-3 text-[clamp(2.65rem,5.8vw,4.7rem)] font-extrabold">Transactions</h2>
        <p className="mt-4 max-w-2xl text-[1.04rem] leading-[1.6]" style={{ color: 'var(--muted-ink)' }}>
          Income and expense records are loaded directly from your database for the current month and yearly totals.
        </p>
      </section>

      <section className="card-stadium px-6 py-6 md:px-7">
        <h3 className="wealth-display text-3xl font-bold">Add Transaction</h3>
        <form onSubmit={handleAddTransaction} className="mt-5 grid gap-3 md:grid-cols-2">
          <label className="text-sm font-semibold">
            Type
            <select
              value={form.type}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  type: event.target.value,
                  category: event.target.value === 'income' ? 'salary' : 'other',
                }))
              }
              className="mt-2 w-full radius-pill border bg-transparent px-4 py-3 outline-none"
              style={{ borderColor: 'var(--border)' }}
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </label>

          <label className="text-sm font-semibold">
            Category
            <select
              value={form.category}
              onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
              className="mt-2 w-full radius-pill border bg-transparent px-4 py-3 outline-none"
              style={{ borderColor: 'var(--border)' }}
            >
              {(form.type === 'income' ? incomeCategories : expenseCategories).map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-semibold md:col-span-2">
            {form.type === 'income' ? 'Source' : 'Description'}
            <input
              type="text"
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              className="mt-2 w-full radius-pill border bg-transparent px-4 py-3 outline-none"
              style={{ borderColor: 'var(--border)' }}
              placeholder={form.type === 'income' ? 'Salary credit' : 'Grocery payment'}
            />
          </label>

          <label className="text-sm font-semibold">
            Amount
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.amount}
              onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))}
              className="mt-2 w-full radius-pill border bg-transparent px-4 py-3 outline-none"
              style={{ borderColor: 'var(--border)' }}
            />
          </label>

          <label className="text-sm font-semibold">
            Date
            <input
              type="date"
              value={form.date}
              onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
              className="mt-2 w-full radius-pill border bg-transparent px-4 py-3 outline-none"
              style={{ borderColor: 'var(--border)' }}
            />
          </label>

          <label className="text-sm font-semibold md:col-span-2">
            Notes (optional)
            <input
              type="text"
              value={form.notes}
              onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
              className="mt-2 w-full radius-pill border bg-transparent px-4 py-3 outline-none"
              style={{ borderColor: 'var(--border)' }}
              placeholder="Any extra detail"
            />
          </label>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="pill-button w-full px-4 py-3 text-sm font-semibold"
              style={{ background: 'var(--ink)', color: 'var(--canvas)', opacity: saving ? 0.7 : 1 }}
            >
              {saving ? 'Saving Transaction...' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </section>

      {loading ? (
        <section className="card-stadium px-6 py-7 text-sm" style={{ color: 'var(--muted-ink)' }}>
          Loading transaction records from database...
        </section>
      ) : null}

      {!loading && error ? (
        <section className="card-stadium px-6 py-7 text-sm font-semibold" style={{ color: '#dc2626' }}>
          {error}
        </section>
      ) : null}

      {!loading && !error ? (
        <>
          <section className="grid gap-5 md:grid-cols-3">
            <article className="card-stadium px-6 py-6">
              <p className="eyebrow" style={{ color: 'var(--muted-ink)' }}>
                Monthly Income
              </p>
              <p className="wealth-display mt-4 text-4xl font-bold" style={{ color: 'var(--growth)' }}>
                {formatCurrency(summary.monthlyIncome)}
              </p>
            </article>

            <article className="card-stadium px-6 py-6">
              <p className="eyebrow" style={{ color: 'var(--muted-ink)' }}>
                Monthly Expense
              </p>
              <p className="wealth-display mt-4 text-4xl font-bold" style={{ color: 'var(--signal)' }}>
                {formatCurrency(summary.monthlyExpense)}
              </p>
            </article>

            <article className="card-stadium px-6 py-6">
              <p className="eyebrow" style={{ color: 'var(--muted-ink)' }}>
                Net This Month
              </p>
              <p
                className="wealth-display mt-4 text-4xl font-bold"
                style={{ color: netMonthly >= 0 ? 'var(--growth)' : 'var(--signal)' }}
              >
                {formatCurrency(netMonthly)}
              </p>
              <p className="mt-3 text-sm" style={{ color: 'var(--muted-ink)' }}>
                Year income {formatCurrency(summary.totalIncomeYear)} | year expense {formatCurrency(summary.totalExpenseYear)}
              </p>
            </article>
          </section>

          <section className="grid gap-5 xl:grid-cols-2">
            <ChartPanel
              title="Monthly Income vs Expense"
              subtitle="Year-to-date flow comparison"
            >
              <GroupedBarChart
                data={summary.trend}
                keys={[
                  { key: 'income', label: 'Income', color: 'var(--growth)' },
                  { key: 'expense', label: 'Expense', color: 'var(--signal)' },
                ]}
              />
            </ChartPanel>

            <ChartPanel
              title="Expense Category Split"
              subtitle="Current month spending concentration"
            >
              <DonutBreakdownChart
                segments={summary.expenseByCategory}
                centerLabel="This Month"
                centerValue={formatCurrency(summary.monthlyExpense)}
              />
            </ChartPanel>
          </section>

          <section className="card-stadium px-6 py-6 md:px-7">
            <div className="flex items-center justify-between gap-4 border-b pb-4" style={{ borderColor: 'var(--border)' }}>
              <h3 className="wealth-display text-3xl font-bold">Recent Activity</h3>
              <span className="text-sm font-semibold" style={{ color: 'var(--muted-ink)' }}>
                {items.length} records
              </span>
            </div>

            {items.length === 0 ? (
              <p className="py-8 text-sm" style={{ color: 'var(--muted-ink)' }}>
                No transactions found for this month.
              </p>
            ) : (
              <div className="mt-4 space-y-2">
                {items.map((item) => {
                  const isIncome = item.type === 'income';
                  return (
                    <article
                      key={item.id}
                      className="radius-stadium flex items-center justify-between gap-4 border px-4 py-3"
                      style={{ borderColor: 'var(--border)' }}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span
                          className="radius-circle flex h-10 w-10 items-center justify-center"
                          style={{
                            background: isIncome
                              ? 'color-mix(in srgb, var(--growth) 16%, transparent)'
                              : 'color-mix(in srgb, var(--signal) 16%, transparent)',
                            color: isIncome ? 'var(--growth)' : 'var(--signal)',
                          }}
                        >
                          {isIncome ? <FaArrowTrendUp /> : <FaArrowTrendDown />}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">{item.title}</p>
                          <p className="text-xs uppercase" style={{ color: 'var(--muted-ink)' }}>
                            {item.category} | {dateFormatter.format(new Date(item.date))}
                          </p>
                        </div>
                      </div>

                      <p
                        className="text-sm font-bold"
                        style={{ color: isIncome ? 'var(--growth)' : 'var(--signal)' }}
                      >
                        {isIncome ? '+' : '-'}{formatCurrency(item.amount)}
                      </p>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </>
      ) : null}
    </div>
  );
}
