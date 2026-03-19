import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Area,
  AreaChart,
} from 'recharts';

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
}

function fmtSalary(v) {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency', currency: 'CAD',
    notation: 'compact', compactDisplay: 'short',
    maximumFractionDigits: 0,
  }).format(v);
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border)',
      borderRadius: 12,
      padding: '12px 16px',
      fontFamily: 'var(--font)',
      minWidth: 200,
    }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8 }}>
        YEAR {label}
      </p>
      {payload.map((entry) => (
        <div key={entry.dataKey} style={{ display: 'flex', justifyContent: 'space-between', gap: 24, marginBottom: 4 }}>
          <span style={{ fontSize: 12, color: entry.color }}>{entry.name}</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: entry.color }}>{fmtSalary(entry.value)}</span>
        </div>
      ))}
      {payload.length >= 2 && (
        <div style={{
          marginTop: 8, paddingTop: 8,
          borderTop: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Annual deficit</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#f43f5e' }}>
            {fmtSalary(payload[0].value - payload[1].value)}
          </span>
        </div>
      )}
    </div>
  );
}

export default function TrajectoryChart({ data, horizon }) {
  const isMobile = useIsMobile();
  return (
    <div className="glass fade-up" style={{ padding: '28px 24px' }}>
      <div className="flex items-center justify-between" style={{ marginBottom: 24 }}>
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
            Salary Trajectory
          </h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>
            Merit-based vs. capped growth over time
          </p>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 24, height: 3, background: '#10b981', borderRadius: 2 }} />
            <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Merit-Based</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 24, height: 3, background: '#f43f5e', borderRadius: 2, borderStyle: 'dashed' }} />
            <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Capped (Agreement)</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={isMobile ? 200 : 280}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: 20, bottom: 0 }}>
          <defs>
            <linearGradient id="gradOld" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradNew" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4 4" stroke="rgba(99,130,200,0.1)" />
          <XAxis
            dataKey="year"
            tickFormatter={(v) => `Yr ${v}`}
            tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
            axisLine={{ stroke: 'var(--border)' }}
            tickLine={false}
          />
          <YAxis
            tickFormatter={fmtSalary}
            tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
            axisLine={{ stroke: 'var(--border)' }}
            tickLine={false}
            width={70}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            x={horizon}
            stroke="rgba(59,130,246,0.6)"
            strokeDasharray="6 3"
            label={{ value: `Yr ${horizon}`, fill: 'var(--accent-blue)', fontSize: 11, position: 'top' }}
          />
          <Area
            type="monotone"
            dataKey="oldSalary"
            name="Merit-Based"
            stroke="#10b981"
            strokeWidth={2.5}
            fill="url(#gradOld)"
            dot={false}
            activeDot={{ r: 5, fill: '#10b981', strokeWidth: 0 }}
          />
          <Area
            type="monotone"
            dataKey="newSalary"
            name="Capped Growth"
            stroke="#f43f5e"
            strokeWidth={2.5}
            fill="url(#gradNew)"
            strokeDasharray="6 3"
            dot={false}
            activeDot={{ r: 5, fill: '#f43f5e', strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
