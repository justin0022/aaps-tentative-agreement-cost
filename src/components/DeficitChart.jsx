import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Cell,
} from 'recharts';

function fmtCurrency(v) {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency', currency: 'CAD',
    notation: 'compact', compactDisplay: 'short',
    maximumFractionDigits: 1,
  }).format(v);
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  const annual = payload.find((p) => p.dataKey === 'annualDeficit');
  const cumul  = payload.find((p) => p.dataKey === 'cumulativeSalaryDeficit');

  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border)',
      borderRadius: 12,
      padding: '12px 16px',
      fontFamily: 'var(--font)',
      minWidth: 220,
    }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8 }}>YEAR {label}</p>
      {annual && (
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 24, marginBottom: 4 }}>
          <span style={{ fontSize: 12, color: '#f59e0b' }}>Annual deficit</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#f59e0b' }}>{fmtCurrency(annual.value)}</span>
        </div>
      )}
      {cumul && (
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 24, marginTop: 6, paddingTop: 6, borderTop: '1px solid var(--border)' }}>
          <span style={{ fontSize: 12, color: '#f43f5e' }}>Cumulative loss</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#f43f5e' }}>{fmtCurrency(cumul.value)}</span>
        </div>
      )}
    </div>
  );
}

// Interpolate between amber and red based on position
function barColor(index, total) {
  const t = index / (total - 1 || 1);
  // amber #f59e0b → red #f43f5e
  const r = Math.round(245 + (244 - 245) * t);
  const g = Math.round(158 + (63 - 158) * t);
  const b = Math.round(11 + (94 - 11) * t);
  return `rgb(${r},${g},${b})`;
}

export default function DeficitChart({ data, horizon }) {
  return (
    <div className="glass fade-up" style={{ padding: '28px 24px' }}>
      <div className="flex items-center justify-between" style={{ marginBottom: 24 }}>
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
            Cumulative Salary Deficit
          </h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>
            Annual gap (bars) and total capital lost (line)
          </p>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 14, height: 14, background: '#f59e0b', borderRadius: 3 }} />
            <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Annual</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 20, height: 3, background: '#f43f5e', borderRadius: 2 }} />
            <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Cumulative</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={data} margin={{ top: 5, right: 10, left: 20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="4 4" stroke="rgba(99,130,200,0.1)" />
          <XAxis
            dataKey="year"
            tickFormatter={(v) => `Yr ${v}`}
            tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
            axisLine={{ stroke: 'var(--border)' }}
            tickLine={false}
          />
          <YAxis
            yAxisId="left"
            tickFormatter={fmtCurrency}
            tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
            axisLine={{ stroke: 'var(--border)' }}
            tickLine={false}
            width={70}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tickFormatter={fmtCurrency}
            tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
            axisLine={{ stroke: 'var(--border)' }}
            tickLine={false}
            width={70}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            yAxisId="left"
            x={horizon}
            stroke="rgba(59,130,246,0.6)"
            strokeDasharray="6 3"
            label={{ value: `Yr ${horizon}`, fill: 'var(--accent-blue)', fontSize: 11, position: 'top' }}
          />
          <Bar
            yAxisId="left"
            dataKey="annualDeficit"
            name="Annual Deficit"
            radius={[4, 4, 0, 0]}
            maxBarSize={24}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={barColor(index, data.length)} fillOpacity={0.85} />
            ))}
          </Bar>
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="cumulativeSalaryDeficit"
            name="Cumulative Deficit"
            stroke="#f43f5e"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5, fill: '#f43f5e', strokeWidth: 0 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
