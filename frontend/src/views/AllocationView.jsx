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
  const [investmentForm, setInvestmentForm] = useState({
    asset_name: '',
    asset_type: 'stock',
    amount_invested: '',
    current_value: '',
    date_added: new Date().toISOString().slice(0, 10),
  });
  const [savingsForm, setSavingsForm] = useState({
    title: '',
    category: 'general',
    target_amount: '',
    current_amount: '',
    deadline: '',
  });
  const [loading, setLoading] = useState(true);
  const [savingInvestment, setSavingInvestment] = useState(false);
  const [savingGoal, setSavingGoal] = useState(false);
  const [error, setError] = useState('');

  const loadAllocationData = async () => {
    const [investmentResponse, savingsResponse] = await Promise.all([
      apiRequest('/investments/summary', { token: accessToken }),
      apiRequest('/savings', { token: accessToken }),
    ]);

    setInvestmentSummary(investmentResponse.data);
    setSavingsGoals(savingsResponse.data);
  };

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      try {
        setLoading(true);
        setError('');
        const [investmentResponse, savingsResponse] = await Promise.all([
          apiRequest('/investments/summary', { token: accessToken }),
          apiRequest('/savings', { token: accessToken }),
        ]);
        if (mounted) {
          setInvestmentSummary(investmentResponse.data);
          setSavingsGoals(savingsResponse.data);
        }
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

    run();

    return () => {
      mounted = false;
    };
  }, [accessToken]);

  const handleAddInvestment = async (event) => {
    event.preventDefault();
    setError('');

    if (!investmentForm.asset_name.trim()) {
      setError('Investment name is required.');
      return;
    }

    const invested = Number(investmentForm.amount_invested);
    const current = Number(investmentForm.current_value || investmentForm.amount_invested);
    if (!invested || invested < 0 || !current || current < 0) {
      setError('Investment amounts must be zero or greater, and invested amount cannot be empty.');
      return;
    }

    try {
      setSavingInvestment(true);
      await apiRequest('/investments', {
        method: 'POST',
        token: accessToken,
        body: {
          asset_name: investmentForm.asset_name.trim(),
          asset_type: investmentForm.asset_type,
          amount_invested: invested,
          current_value: current,
          date_added: investmentForm.date_added,
        },
      });

      setInvestmentForm({
        asset_name: '',
        asset_type: 'stock',
        amount_invested: '',
        current_value: '',
        date_added: new Date().toISOString().slice(0, 10),
      });
      await loadAllocationData();
    } catch (err) {
      setError(err.message || 'Unable to add investment right now.');
    } finally {
      setSavingInvestment(false);
    }
  };

  const handleAddSavingsGoal = async (event) => {
    event.preventDefault();
    setError('');

    if (!savingsForm.title.trim()) {
      setError('Savings goal title is required.');
      return;
    }

    const target = Number(savingsForm.target_amount);
    const current = Number(savingsForm.current_amount || 0);
    if (!target || target <= 0) {
      setError('Target amount must be greater than zero.');
      return;
    }

    try {
      setSavingGoal(true);
      await apiRequest('/savings', {
        method: 'POST',
        token: accessToken,
        body: {
          title: savingsForm.title.trim(),
          category: savingsForm.category,
          target_amount: target,
          current_amount: current,
          deadline: savingsForm.deadline || null,
        },
      });

      setSavingsForm({
        title: '',
        category: 'general',
        target_amount: '',
        current_amount: '',
        deadline: '',
      });
      await loadAllocationData();
    } catch (err) {
      setError(err.message || 'Unable to add savings goal right now.');
    } finally {
      setSavingGoal(false);
    }
  };

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

      <section className="grid gap-5 lg:grid-cols-2">
        <form onSubmit={handleAddInvestment} className="card-stadium space-y-4 px-6 py-6 md:px-7">
          <h3 className="wealth-display text-3xl font-bold">Add Investment</h3>

          <label className="text-sm font-semibold">
            Asset Name
            <input
              type="text"
              value={investmentForm.asset_name}
              onChange={(event) =>
                setInvestmentForm((current) => ({ ...current, asset_name: event.target.value }))
              }
              className="mt-2 w-full radius-pill border bg-transparent px-4 py-3 outline-none"
              style={{ borderColor: 'var(--border)' }}
              placeholder="NIFTY ETF"
            />
          </label>

          <label className="text-sm font-semibold">
            Asset Type
            <select
              value={investmentForm.asset_type}
              onChange={(event) =>
                setInvestmentForm((current) => ({ ...current, asset_type: event.target.value }))
              }
              className="mt-2 w-full radius-pill border bg-transparent px-4 py-3 outline-none"
              style={{ borderColor: 'var(--border)' }}
            >
              <option value="stock">stock</option>
              <option value="crypto">crypto</option>
              <option value="real_estate">real_estate</option>
              <option value="mutual_fund">mutual_fund</option>
              <option value="gold">gold</option>
              <option value="fd">fd</option>
              <option value="other">other</option>
            </select>
          </label>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-sm font-semibold">
              Amount Invested
              <input
                type="number"
                min="0"
                step="0.01"
                value={investmentForm.amount_invested}
                onChange={(event) =>
                  setInvestmentForm((current) => ({ ...current, amount_invested: event.target.value }))
                }
                className="mt-2 w-full radius-pill border bg-transparent px-4 py-3 outline-none"
                style={{ borderColor: 'var(--border)' }}
              />
            </label>

            <label className="text-sm font-semibold">
              Current Value
              <input
                type="number"
                min="0"
                step="0.01"
                value={investmentForm.current_value}
                onChange={(event) =>
                  setInvestmentForm((current) => ({ ...current, current_value: event.target.value }))
                }
                className="mt-2 w-full radius-pill border bg-transparent px-4 py-3 outline-none"
                style={{ borderColor: 'var(--border)' }}
              />
            </label>
          </div>

          <label className="text-sm font-semibold">
            Added On
            <input
              type="date"
              value={investmentForm.date_added}
              onChange={(event) =>
                setInvestmentForm((current) => ({ ...current, date_added: event.target.value }))
              }
              className="mt-2 w-full radius-pill border bg-transparent px-4 py-3 outline-none"
              style={{ borderColor: 'var(--border)' }}
            />
          </label>

          <button
            type="submit"
            disabled={savingInvestment}
            className="pill-button w-full px-4 py-3 text-sm font-semibold"
            style={{ background: 'var(--ink)', color: 'var(--canvas)', opacity: savingInvestment ? 0.7 : 1 }}
          >
            {savingInvestment ? 'Saving Investment...' : 'Add Investment'}
          </button>
        </form>

        <form onSubmit={handleAddSavingsGoal} className="card-stadium space-y-4 px-6 py-6 md:px-7">
          <h3 className="wealth-display text-3xl font-bold">Add Savings Goal</h3>

          <label className="text-sm font-semibold">
            Goal Title
            <input
              type="text"
              value={savingsForm.title}
              onChange={(event) => setSavingsForm((current) => ({ ...current, title: event.target.value }))}
              className="mt-2 w-full radius-pill border bg-transparent px-4 py-3 outline-none"
              style={{ borderColor: 'var(--border)' }}
              placeholder="Emergency Fund"
            />
          </label>

          <label className="text-sm font-semibold">
            Category
            <input
              type="text"
              value={savingsForm.category}
              onChange={(event) => setSavingsForm((current) => ({ ...current, category: event.target.value }))}
              className="mt-2 w-full radius-pill border bg-transparent px-4 py-3 outline-none"
              style={{ borderColor: 'var(--border)' }}
            />
          </label>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-sm font-semibold">
              Target Amount
              <input
                type="number"
                min="0"
                step="0.01"
                value={savingsForm.target_amount}
                onChange={(event) =>
                  setSavingsForm((current) => ({ ...current, target_amount: event.target.value }))
                }
                className="mt-2 w-full radius-pill border bg-transparent px-4 py-3 outline-none"
                style={{ borderColor: 'var(--border)' }}
              />
            </label>

            <label className="text-sm font-semibold">
              Current Amount
              <input
                type="number"
                min="0"
                step="0.01"
                value={savingsForm.current_amount}
                onChange={(event) =>
                  setSavingsForm((current) => ({ ...current, current_amount: event.target.value }))
                }
                className="mt-2 w-full radius-pill border bg-transparent px-4 py-3 outline-none"
                style={{ borderColor: 'var(--border)' }}
              />
            </label>
          </div>

          <label className="text-sm font-semibold">
            Deadline (optional)
            <input
              type="date"
              value={savingsForm.deadline}
              onChange={(event) => setSavingsForm((current) => ({ ...current, deadline: event.target.value }))}
              className="mt-2 w-full radius-pill border bg-transparent px-4 py-3 outline-none"
              style={{ borderColor: 'var(--border)' }}
            />
          </label>

          <button
            type="submit"
            disabled={savingGoal}
            className="pill-button w-full px-4 py-3 text-sm font-semibold"
            style={{ background: 'var(--ink)', color: 'var(--canvas)', opacity: savingGoal ? 0.7 : 1 }}
          >
            {savingGoal ? 'Saving Goal...' : 'Add Savings Goal'}
          </button>
        </form>
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
