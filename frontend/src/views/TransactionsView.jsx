import { useEffect, useMemo, useState } from 'react';
import { FaArrowTrendDown, FaArrowTrendUp } from 'react-icons/fa6';
import { apiRequest } from '../services/api.js';

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

export default function TransactionsView({ accessToken }) {
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState({
    monthlyIncome: 0,
    monthlyExpense: 0,
    totalIncomeYear: 0,
    totalExpenseYear: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadTransactions = async () => {
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();

      try {
        setLoading(true);
        setError('');

        const [incomeResponse, expenseResponse, incomeSummaryResponse, expenseSummaryResponse] = await Promise.all([
          apiRequest(`/income?month=${month}&year=${year}&limit=50`, { token: accessToken }),
          apiRequest(`/expenses?month=${month}&year=${year}&limit=50`, { token: accessToken }),
          apiRequest(`/income/summary?year=${year}`, { token: accessToken }),
          apiRequest(`/expenses/summary?year=${year}&month=${month}`, { token: accessToken }),
        ]);

        if (!mounted) {
          return;
        }

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

        setItems(merged);
        setSummary({
          monthlyIncome,
          monthlyExpense,
          totalIncomeYear: Number(incomeSummaryResponse.data.totalYear || 0),
          totalExpenseYear: Number(expenseSummaryResponse.data.total || 0),
        });
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

    loadTransactions();

    return () => {
      mounted = false;
    };
  }, [accessToken]);

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
