import { useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../services/api.js';

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const formatCurrency = (value) => currencyFormatter.format(Number(value || 0));

export default function AllocationView({ accessToken }) {
  const [investmentSummary, setInvestmentSummary] = useState(null);
  const [savingsGoals, setSavingsGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadAllocationData = async () => {
      try {
        setLoading(true);
        setError('');

        const [investmentResponse, savingsResponse] = await Promise.all([
          apiRequest('/investments/summary', { token: accessToken }),
          apiRequest('/savings', { token: accessToken }),
        ]);

        if (!mounted) {
          return;
        }

        setInvestmentSummary(investmentResponse.data);
        setSavingsGoals(savingsResponse.data);
      } catch (err) {
        if (!mounted) {
          return;
        }
        setError(err.message || 'Unable to load allocation data.');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadAllocationData();

    return () => {
      mounted = false;
    };
  }, [accessToken]);

  const byType = investmentSummary?.byType || [];
  const totalCurrent = Number(investmentSummary?.totalCurrentValue || 0);
  const totalInvested = Number(investmentSummary?.totalInvested || 0);
  const totalGainLoss = Number(investmentSummary?.totalGainLoss || 0);

  const totalSavingsCurrent = useMemo(
    () => savingsGoals.reduce((acc, goal) => acc + Number(goal.current_amount || 0), 0),
    [savingsGoals]
  );

  return (
    <div className="space-y-8">
      <section className="max-w-[49rem]">
        <p className="eyebrow" style={{ color: 'var(--signal)' }}>
          Capital Distribution
        </p>
        <h2 className="wealth-display mt-3 text-[clamp(2.65rem,5.8vw,4.7rem)] font-extrabold">Asset Allocation</h2>
        <p className="mt-4 max-w-2xl text-[1.04rem] leading-[1.6]" style={{ color: 'var(--muted-ink)' }}>
          Allocation metrics are derived from your live investment summary and savings goals stored in the database.
        </p>
      </section>

      {loading ? (
        <section className="card-stadium px-6 py-7 text-sm" style={{ color: 'var(--muted-ink)' }}>
          Loading allocation data from database...
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
                Total Invested
              </p>
              <p className="wealth-display mt-4 text-4xl font-bold">{formatCurrency(totalInvested)}</p>
            </article>

            <article className="card-stadium px-6 py-6">
              <p className="eyebrow" style={{ color: 'var(--muted-ink)' }}>
                Current Value
              </p>
              <p className="wealth-display mt-4 text-4xl font-bold">{formatCurrency(totalCurrent)}</p>
            </article>

            <article className="card-stadium px-6 py-6">
              <p className="eyebrow" style={{ color: 'var(--muted-ink)' }}>
                Gain / Loss
              </p>
              <p
                className="wealth-display mt-4 text-4xl font-bold"
                style={{ color: totalGainLoss >= 0 ? 'var(--growth)' : 'var(--signal)' }}
              >
                {formatCurrency(totalGainLoss)}
              </p>
            </article>
          </section>

          <section className="grid gap-5 lg:grid-cols-2">
            <article className="card-stadium px-6 py-6 md:px-7">
              <h3 className="wealth-display text-3xl font-bold">Investments by Type</h3>
              {byType.length === 0 ? (
                <p className="mt-5 text-sm" style={{ color: 'var(--muted-ink)' }}>
                  No investment records found yet.
                </p>
              ) : (
                <div className="mt-5 space-y-3">
                  {byType.map((item) => {
                    const current = Number(item.total_current || 0);
                    const allocation = totalCurrent > 0 ? Math.round((current / totalCurrent) * 100) : 0;
                    return (
                      <div key={item.asset_type} className="space-y-2">
                        <div className="flex items-center justify-between gap-3 text-sm font-semibold">
                          <span>{item.asset_type.replace('_', ' ')}</span>
                          <span>{formatCurrency(current)} ({allocation}%)</span>
                        </div>
                        <div
                          className="h-2.5"
                          style={{ borderRadius: 'var(--radius-pill)', background: 'color-mix(in srgb, var(--ink) 9%, transparent)' }}
                        >
                          <span
                            className="block h-full"
                            style={{
                              width: `${allocation}%`,
                              borderRadius: 'var(--radius-pill)',
                              background: 'linear-gradient(90deg, var(--signal), var(--orbit))',
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </article>

            <article className="card-stadium px-6 py-6 md:px-7">
              <h3 className="wealth-display text-3xl font-bold">Savings Allocation</h3>
              <p className="mt-2 text-sm" style={{ color: 'var(--muted-ink)' }}>
                Total saved across goals: {formatCurrency(totalSavingsCurrent)}
              </p>

              {savingsGoals.length === 0 ? (
                <p className="mt-5 text-sm" style={{ color: 'var(--muted-ink)' }}>
                  No savings goals found yet.
                </p>
              ) : (
                <div className="mt-5 space-y-3">
                  {savingsGoals.map((goal) => {
                    const target = Number(goal.target_amount || 0);
                    const current = Number(goal.current_amount || 0);
                    const progress = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
                    return (
                      <div key={goal.id} className="space-y-2">
                        <div className="flex items-center justify-between gap-3 text-sm font-semibold">
                          <span>{goal.title}</span>
                          <span>{formatCurrency(current)} / {formatCurrency(target)}</span>
                        </div>
                        <div
                          className="h-2.5"
                          style={{ borderRadius: 'var(--radius-pill)', background: 'color-mix(in srgb, var(--ink) 9%, transparent)' }}
                        >
                          <span
                            className="block h-full"
                            style={{
                              width: `${progress}%`,
                              borderRadius: 'var(--radius-pill)',
                              background: 'linear-gradient(90deg, var(--growth), var(--orbit))',
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </article>
          </section>
        </>
      ) : null}
    </div>
  );
}
