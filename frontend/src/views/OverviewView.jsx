import { FaArrowRightLong, FaCircle } from 'react-icons/fa6';

const pulseBars = [36, 50, 44, 63, 100];

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

export default function OverviewView() {
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
            Rishit, your current retention rate is excellent. Based on your consistent habits, you've saved
            ₹12,400 more than last month.
          </p>

          <button
            type="button"
            className="pill-button mt-8 inline-flex items-center gap-2 px-8 py-3 text-sm"
            style={{ background: 'var(--ink)', color: 'var(--canvas)' }}
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

          <div className="mt-8 flex h-[11.25rem] items-end gap-3">
            {pulseBars.map((height, index) => {
              const isFinal = index === pulseBars.length - 1;
              return (
                <span
                  key={`${height}-${index}`}
                  className="radius-pill block w-full"
                  style={{
                    height: `${height}%`,
                    background: isFinal
                      ? 'var(--ink)'
                      : 'color-mix(in srgb, var(--ink) 8%, var(--lifted-surface))',
                  }}
                />
              );
            })}
          </div>
        </article>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        <MetricCard eyebrow="Total Assets" value="₹2,45,500" footnote="+5.2% Quarterly" valueColor="var(--ink)" />

        <MetricCard eyebrow="Savings Goal" value="₹85,000" valueColor="var(--ink)">
          <div
            className="mt-5 h-2.5"
            style={{ borderRadius: 'var(--radius-pill)', background: 'color-mix(in srgb, var(--ink) 9%, transparent)' }}
          >
            <span
              className="block h-full"
              style={{
                width: '58%',
                borderRadius: 'var(--radius-pill)',
                background: 'linear-gradient(90deg, var(--signal), var(--orbit))',
              }}
            />
          </div>
        </MetricCard>

        <MetricCard eyebrow="Daily Intention" value="12 Days" valueColor="var(--ink)">
          <p className="eyebrow mt-5" style={{ color: 'var(--muted-ink)' }}>
            Streak Count
          </p>
        </MetricCard>
      </section>
    </div>
  );
}
