import React, { useState, useMemo } from 'react';
import InputPanel from './InputPanel';
import SummaryCards from './SummaryCards';
import TrajectoryChart from './TrajectoryChart';
import DeficitChart from './DeficitChart';
import { calculateProjections } from '../utils/calculateProjections';
import { DEFAULTS } from '../constants/defaults';

export default function Dashboard() {
  const [inputs, setInputs] = useState({
    baseSalary: DEFAULTS.baseSalary,
    oldRate: DEFAULTS.oldRate,
    newRate: DEFAULTS.newRate,
    currentService: DEFAULTS.currentService,
    horizon: DEFAULTS.horizon,
  });

  function handleChange(key, value) {
    setInputs((prev) => ({ ...prev, [key]: value }));
  }

  // Full 30-year projection, recomputed only when inputs change
  const projections = useMemo(
    () =>
      calculateProjections({
        baseSalary: inputs.baseSalary,
        oldRate: inputs.oldRate,
        newRate: inputs.newRate,
        currentService: inputs.currentService,
        maxHorizon: DEFAULTS.maxHorizon,
      }),
    [inputs.baseSalary, inputs.oldRate, inputs.newRate, inputs.currentService]
  );

  // The data point at exactly the selected horizon year
  const dataAtHorizon = projections[inputs.horizon - 1] ?? null;

  return (
    <div className="gradient-bg" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* ── Top bar ──────────────────────────────────────── */}
      <header style={{
        borderBottom: '1px solid var(--border)',
        background: 'rgba(13,21,38,0.85)',
        backdropFilter: 'blur(12px)',
        padding: '16px 28px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'linear-gradient(135deg, #3b82f6 0%, #f43f5e 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="1" x2="12" y2="23"/>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
        </div>
        <div>
          <h1 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
            AAPS Compensation Impact Calculator
          </h1>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
            Modelling the financial cost of salary growth suppression over time
          </p>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '6px 14px',
            borderRadius: 8,
            background: 'rgba(244,63,94,0.1)',
            border: '1px solid rgba(244,63,94,0.2)',
          }}>
            <div className="pulse-dot" style={{ background: 'var(--accent-red)' }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: '#f43f5e' }}>Live Projection</span>
          </div>
        </div>
      </header>

      {/* ── Main layout ──────────────────────────────────── */}
      <div style={{ display: 'flex', flex: 1, gap: 0, overflow: 'hidden' }}>
        {/* Sidebar */}
        <div style={{
          width: 300,
          flexShrink: 0,
          padding: '24px 20px',
          borderRight: '1px solid var(--border)',
          overflowY: 'auto',
        }}>
          <InputPanel inputs={inputs} onChange={handleChange} />
        </div>

        {/* Content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Hero summary cards */}
          <SummaryCards dataAtHorizon={dataAtHorizon} horizon={inputs.horizon} />

          {/* Pension insight callout */}
          {dataAtHorizon && (
            <div style={{
              padding: '14px 20px',
              borderRadius: 12,
              background: 'rgba(245,158,11,0.07)',
              border: '1px solid rgba(245,158,11,0.18)',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                <strong style={{ color: '#f59e0b' }}>Pension impact at Year {inputs.horizon}:</strong>{' '}
                Based on a Best-3 average salary of{' '}
                <strong style={{ color: 'var(--text-primary)' }}>
                  {new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(dataAtHorizon.newBest3Avg)}
                </strong>{' '}
                (vs. {new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(dataAtHorizon.oldBest3Avg)} merit-based),
                with <strong style={{ color: 'var(--text-primary)' }}>{dataAtHorizon.totalService} years</strong> of pensionable service.
              </p>
            </div>
          )}

          {/* Charts grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <TrajectoryChart data={projections} horizon={inputs.horizon} />
            <DeficitChart data={projections} horizon={inputs.horizon} />
          </div>

          {/* Data table */}
          <div className="glass fade-up" style={{ padding: '24px', overflow: 'hidden' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>
              Year-by-Year Breakdown
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr>
                    {['Year', 'Merit Salary', 'Capped Salary', 'Annual Deficit', 'Cumulative Deficit', 'Merit Pension', 'Capped Pension', 'Pension Gap', 'Employer Savings'].map((h, i) => (
                      <th key={i} style={{
                        padding: '8px 12px',
                        textAlign: i === 0 ? 'center' : 'right',
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: '0.07em',
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                        borderBottom: '1px solid var(--border)',
                        whiteSpace: 'nowrap',
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {projections.map((row) => {
                    const isHorizon = row.year === inputs.horizon;
                    const fmt = (v) => new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(v);
                    return (
                      <tr key={row.year} style={{
                        background: isHorizon ? 'rgba(59,130,246,0.07)' : 'transparent',
                        borderBottom: '1px solid var(--border)',
                        transition: 'background 0.15s',
                      }}>
                        <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: isHorizon ? 700 : 400, color: isHorizon ? 'var(--accent-blue)' : 'var(--text-secondary)' }}>
                          {isHorizon ? `★ ${row.year}` : row.year}
                        </td>
                        <td style={{ padding: '8px 12px', textAlign: 'right', color: '#10b981', fontWeight: 500 }}>{fmt(row.oldSalary)}</td>
                        <td style={{ padding: '8px 12px', textAlign: 'right', color: '#f43f5e', fontWeight: 500 }}>{fmt(row.newSalary)}</td>
                        <td style={{ padding: '8px 12px', textAlign: 'right', color: '#f59e0b' }}>{fmt(row.annualDeficit)}</td>
                        <td style={{ padding: '8px 12px', textAlign: 'right', color: isHorizon ? '#f43f5e' : 'var(--text-secondary)', fontWeight: isHorizon ? 700 : 400 }}>{fmt(row.cumulativeSalaryDeficit)}</td>
                        <td style={{ padding: '8px 12px', textAlign: 'right', color: '#10b981' }}>{fmt(row.oldPension)}</td>
                        <td style={{ padding: '8px 12px', textAlign: 'right', color: '#f43f5e' }}>{fmt(row.newPension)}</td>
                        <td style={{ padding: '8px 12px', textAlign: 'right', color: '#f59e0b' }}>{fmt(row.pensionDeficit)}</td>
                        <td style={{ padding: '8px 12px', textAlign: 'right', color: '#14b8a6' }}>{fmt(row.employerSavings)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer */}
          <footer style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', paddingBottom: 16, lineHeight: 1.6 }}>
            For modelling purposes only. DB pension uses 1.8% accrual rate × (current + future service) × Best-3-Year average salary.
            Employer savings based on 9.8% contribution rate on cumulative salary suppression.
          </footer>
        </main>
      </div>
    </div>
  );
}
