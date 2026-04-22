const colorMap = {
  indigo:  { bg: 'rgba(74,222,128,0.10)',  text: 'var(--color-volt)' },
  emerald: { bg: 'rgba(74,222,128,0.10)',  text: 'var(--color-volt)' },
  rose:    { bg: 'rgba(244,63,94,0.10)',   text: '#fb7185' },
  amber:   { bg: 'rgba(245,158,11,0.10)',  text: '#fbbf24' },
  purple:  { bg: 'rgba(139,92,246,0.10)',  text: '#a78bfa' },
  blue:    { bg: 'rgba(59,130,246,0.10)',  text: '#60a5fa' },
};

export default function StatCard({ title, value, icon: Icon, color = 'emerald', change, prefix = '' }) {
  const c = colorMap[color] || colorMap.emerald;
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[var(--color-muted)] text-xs font-medium tracking-wide truncate mb-3 uppercase" style={{ letterSpacing: '0.05em' }}>{title}</p>
          <p className="text-[var(--color-ink)] text-xl font-semibold tracking-tight truncate">
            {prefix}{typeof value === 'number' ? value.toLocaleString('en-IN') : value}
          </p>
          {change !== undefined && (
            <div className={`inline-flex items-center gap-1 mt-2 text-xs font-medium px-1.5 py-0.5 rounded ${
              change >= 0 ? 'text-emerald-400 bg-emerald-500/10' : 'text-[var(--color-terracotta)] bg-rose-500/10'
            }`}>
              {change >= 0 ? '+' : ''}{Math.abs(change)}%
              <span className="font-normal opacity-60">mo</span>
            </div>
          )}
        </div>
        <div className="w-9 h-9   flex items-center justify-center flex-shrink-0"
          style={{ background: c.bg }}>
          <Icon className="w-4 h-4" style={{ color: c.text }} />
        </div>
      </div>
    </div>
  );
}
