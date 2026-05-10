import React from 'react';

const moneyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const compactNumberFormatter = new Intl.NumberFormat('en-IN', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

const formatCurrency = (value) => moneyFormatter.format(Number(value || 0));

const formatCompact = (value) => {
  const amount = Number(value || 0);
  if (Math.abs(amount) < 1000) {
    return `${amount}`;
  }
  return compactNumberFormatter.format(amount);
};

export function ChartPanel({ title, subtitle, children, rightSlot }) {
  return (
    <article className="card-stadium px-6 py-6 md:px-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="wealth-display text-[1.9rem] font-bold">{title}</h3>
          {subtitle ? (
            <p className="mt-1 text-sm" style={{ color: 'var(--muted-ink)' }}>
              {subtitle}
            </p>
          ) : null}
        </div>
        {rightSlot || null}
      </div>
      <div className="mt-5">{children}</div>
    </article>
  );
}

export function GroupedBarChart({ data, keys, height = 190 }) {
  if (!data.length) {
    return (
      <p className="text-sm" style={{ color: 'var(--muted-ink)' }}>
        No data available for chart.
      </p>
    );
  }

  const maxValue = Math.max(
    1,
    ...data.flatMap((item) => keys.map((keyMeta) => Number(item[keyMeta.key] || 0)))
  );
  const chartHeight = Math.max(Number(height) || 190, 140);
  const usableBarHeight = Math.max(chartHeight - 34, 90);

  return (
    <div>
      <div className="flex items-end gap-2" style={{ height: `${chartHeight}px` }}>
        {data.map((row) => (
          <div key={row.label} className="flex h-full min-w-0 flex-1 items-end gap-1">
            {keys.map((keyMeta) => {
              const raw = Number(row[keyMeta.key] || 0);
              const scaledHeight = Math.round((Math.max(raw, 0) / maxValue) * usableBarHeight);
              const barHeight = raw > 0 ? Math.max(14, scaledHeight) : 4;
              const barColor =
                raw > 0
                  ? keyMeta.color
                  : 'color-mix(in srgb, var(--muted-ink) 36%, transparent)';
              return (
                <div key={keyMeta.key} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                  <span className="text-[10px] font-semibold" style={{ color: 'var(--muted-ink)' }}>
                    {formatCompact(raw)}
                  </span>
                  <span
                    className="radius-pill block w-full"
                    style={{
                      height: `${barHeight}px`,
                      background: barColor,
                    }}
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 overflow-x-auto pb-1">
        {data.map((row) => (
          <span key={row.label} className="min-w-[2.5rem] text-center text-[11px] font-semibold" style={{ color: 'var(--muted-ink)' }}>
            {row.label}
          </span>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        {keys.map((keyMeta) => (
          <span key={keyMeta.key} className="inline-flex items-center gap-2 text-xs font-semibold" style={{ color: 'var(--muted-ink)' }}>
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: keyMeta.color }} />
            {keyMeta.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export function DonutBreakdownChart({ segments, centerLabel, centerValue }) {
  const total = segments.reduce((sum, segment) => sum + Number(segment.value || 0), 0);

  if (!segments.length || total <= 0) {
    return (
      <p className="text-sm" style={{ color: 'var(--muted-ink)' }}>
        No data available for chart.
      </p>
    );
  }

  let current = 0;
  const gradientStops = segments
    .map((segment) => {
      const start = current;
      const slice = (Number(segment.value || 0) / total) * 100;
      const end = start + slice;
      current = end;
      return `${segment.color} ${start}% ${end}%`;
    })
    .join(', ');

  return (
    <div className="flex flex-wrap items-center gap-6">
      <div
        className="relative h-44 w-44 rounded-full"
        style={{ background: `conic-gradient(${gradientStops})` }}
      >
        <div
          className="absolute left-1/2 top-1/2 flex h-[104px] w-[104px] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full"
          style={{ background: 'var(--lifted-surface)' }}
        >
          <span className="text-[11px] font-semibold uppercase" style={{ color: 'var(--muted-ink)' }}>
            {centerLabel}
          </span>
          <span className="wealth-display mt-1 text-xl font-bold">{centerValue || formatCurrency(total)}</span>
        </div>
      </div>

      <div className="min-w-[13rem] flex-1 space-y-2">
        {segments.map((segment) => {
          const value = Number(segment.value || 0);
          const share = total > 0 ? Math.round((value / total) * 100) : 0;
          return (
            <div key={segment.label} className="flex items-center justify-between gap-3 text-sm">
              <span className="inline-flex items-center gap-2 font-semibold">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: segment.color }} />
                {segment.label}
              </span>
              <span className="text-right" style={{ color: 'var(--muted-ink)' }}>
                {formatCurrency(value)} ({share}%)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function LineTrendChart({ points, valuePrefix = '', color = 'var(--signal)', height = 186 }) {
  if (!points.length) {
    return (
      <p className="text-sm" style={{ color: 'var(--muted-ink)' }}>
        No trend data available.
      </p>
    );
  }

  const width = 600;
  const padding = 26;
  const values = points.map((point) => Number(point.value || 0));
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const stepX = (width - padding * 2) / Math.max(points.length - 1, 1);

  const coordinates = points.map((point, index) => {
    const value = Number(point.value || 0);
    const x = padding + stepX * index;
    const y = padding + ((max - value) / range) * (height - padding * 2);
    return { ...point, x, y, value };
  });

  const line = coordinates.map((point) => `${point.x},${point.y}`).join(' ');
  const area = `${padding},${height - padding} ${line} ${padding + stepX * (coordinates.length - 1)},${height - padding}`;

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="var(--border)" strokeWidth="1" />
        <polygon points={area} fill="color-mix(in srgb, var(--signal) 16%, transparent)" />
        <polyline points={line} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {coordinates.map((point) => (
          <circle key={point.label} cx={point.x} cy={point.y} r="4" fill={color} />
        ))}
      </svg>

      <div className="mt-3 flex items-center justify-between gap-2 overflow-x-auto pb-1">
        {coordinates.map((point) => (
          <div key={point.label} className="min-w-[4.2rem] text-center">
            <p className="text-[10px] font-semibold uppercase" style={{ color: 'var(--muted-ink)' }}>
              {point.label}
            </p>
            <p className="text-[11px] font-semibold" style={{ color: 'var(--ink)' }}>
              {valuePrefix}{formatCompact(point.value)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
