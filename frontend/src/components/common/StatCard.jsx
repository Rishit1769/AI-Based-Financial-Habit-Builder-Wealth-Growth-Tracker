const colorMap = {
  indigo:  { bg: 'rgba(99,102,241,0.12)',  text: '#818cf8', glow: 'rgba(99,102,241,0.25)',  grad: 'linear-gradient(135deg,rgba(99,102,241,0.08),rgba(99,102,241,0.02))' },
  emerald: { bg: 'rgba(16,185,129,0.12)',  text: '#34d399', glow: 'rgba(16,185,129,0.25)',  grad: 'linear-gradient(135deg,rgba(16,185,129,0.08),rgba(16,185,129,0.02))' },
  rose:    { bg: 'rgba(244,63,94,0.12)',   text: '#fb7185', glow: 'rgba(244,63,94,0.25)',   grad: 'linear-gradient(135deg,rgba(244,63,94,0.08),rgba(244,63,94,0.02))' },
  amber:   { bg: 'rgba(245,158,11,0.12)',  text: '#fbbf24', glow: 'rgba(245,158,11,0.25)',  grad: 'linear-gradient(135deg,rgba(245,158,11,0.08),rgba(245,158,11,0.02))' },
  purple:  { bg: 'rgba(139,92,246,0.12)',  text: '#a78bfa', glow: 'rgba(139,92,246,0.25)',  grad: 'linear-gradient(135deg,rgba(139,92,246,0.08),rgba(139,92,246,0.02))' },
  blue:    { bg: 'rgba(59,130,246,0.12)',  text: '#60a5fa', glow: 'rgba(59,130,246,0.25)',  grad: 'linear-gradient(135deg,rgba(59,130,246,0.08),rgba(59,130,246,0.02))' },
};

export default function StatCard({ title, value, icon: Icon, color = 'indigo', change, prefix = '' }) {
  const c = colorMap[color] || colorMap.indigo;
  return (
    <div className="card p-5 hover:translate-y-[-1px]" style={{ background: c.grad, borderLeft: `2px solid ${c.bg}` }}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sub text-xs font-semibold tracking-wide truncate mb-2 uppercase" style={{ letterSpacing: '0.04em' }}>{title}</p>
          <p className="text-main text-2xl font-black tracking-tight truncate">
            {prefix}{typeof value === 'number' ? value.toLocaleString('en-IN') : value}
          </p>
          {change !== undefined && (
            <div className={`inline-flex items-center gap-1 mt-2 text-xs font-semibold px-1.5 py-0.5 rounded-md ${
              change >= 0 ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
            }`}>
              {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
              <span className="font-normal opacity-70">vs last month</span>
            </div>
          )}
        </div>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: c.bg, boxShadow: `0 0 16px ${c.glow}` }}>
          <Icon className="w-5 h-5" style={{ color: c.text }} />
        </div>
      </div>
    </div>
  );
}
