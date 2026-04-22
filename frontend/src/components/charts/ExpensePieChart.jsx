import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { categoryColors } from '../../utils/constants';

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-ink)' }} className="  p-3 text-sm">
      <p className="text-[var(--color-ink)] font-medium capitalize">{payload[0].name}</p>
      <p className="text-sub">₹{Number(payload[0].value).toLocaleString('en-IN')}</p>
      <p className="text-[var(--color-muted)]">{payload[0].payload.percent?.toFixed(1)}%</p>
    </div>
  );
};

export default function ExpensePieChart({ data = [] }) {
  const total = data.reduce((s, d) => s + Number(d.total), 0);
  const chartData = data.map((d) => ({
    name: d.category,
    value: Number(d.total),
    percent: total > 0 ? (Number(d.total) / total) * 100 : 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={3}
          dataKey="value"
        >
          {chartData.map((entry) => (
            <Cell key={entry.name} fill={categoryColors[entry.name] || '#94a3b8'} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(v) => <span className="capitalize text-sub text-xs">{v}</span>}
          iconType="circle"
          iconSize={8}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
