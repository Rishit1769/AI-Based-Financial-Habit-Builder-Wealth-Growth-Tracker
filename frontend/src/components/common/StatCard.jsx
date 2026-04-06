const iconColors = {
  indigo:  { bg: 'bg-indigo-500/10',  text: 'text-indigo-500' },
  emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-500' },
  rose:    { bg: 'bg-rose-500/10',    text: 'text-rose-500' },
  amber:   { bg: 'bg-amber-500/10',   text: 'text-amber-500' },
  purple:  { bg: 'bg-purple-500/10',  text: 'text-purple-500' },
  blue:    { bg: 'bg-blue-500/10',    text: 'text-blue-500' },
};

export default function StatCard({ title, value, icon: Icon, color = 'indigo', change, prefix = '' }) {
  const ic = iconColors[color] || iconColors.indigo;
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sub text-xs font-medium tracking-wide truncate mb-1">{title}</p>
          <p className="text-main text-xl font-semibold tracking-tight truncate">
            {prefix}{typeof value === 'number' ? value.toLocaleString('en-IN') : value}
          </p>
          {change !== undefined && (
            <p className={`text-xs mt-1 font-medium ${change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
              <span className="text-muted font-normal"> vs last month</span>
            </p>
          )}
        </div>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${ic.bg}`}>
          <Icon className={`w-4.5 h-4.5 ${ic.text}`} />
        </div>
      </div>
    </div>
  );
}
