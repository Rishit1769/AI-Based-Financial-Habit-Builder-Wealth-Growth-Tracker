import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { INVESTMENT_TYPES } from '../../utils/constants';

const typeColorMap = Object.fromEntries(INVESTMENT_TYPES.map((t) => [t.value, t.color]));

export default function InvestmentChart({ data = [] }) {
  const chartData = data.map((d) => ({
    name: d.asset_type,
    value: Number(d.total_current),
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={95}
          paddingAngle={3}
          dataKey="value"
        >
          {chartData.map((entry) => (
            <Cell key={entry.name} fill={typeColorMap[entry.name] || '#94a3b8'} />
          ))}
        </Pie>
        <Tooltip
        contentStyle={{ background: 'var(--elevated)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)' }}
          formatter={(v) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Value']}
          labelStyle={{ color: '#f1f5f9' }}
        />
        <Legend
          formatter={(v) => <span className="capitalize text-sub text-xs">{v.replace('_', ' ')}</span>}
          iconType="circle"
          iconSize={8}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
