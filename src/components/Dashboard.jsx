import React, { useState, useMemo } from 'react';
import InputPanel from './InputPanel';
import SummaryCards from './SummaryCards';
import TrajectoryChart from './TrajectoryChart';
import DeficitChart from './DeficitChart';
import AssumptionsDisclosure from './AssumptionsDisclosure';
import ProjectionTable from './ProjectionTable';
import { calculateProjections } from '../utils/calculateProjections';
import { DEFAULTS } from '../constants/defaults';

export default function Dashboard() {
  const [inputs, setInputs] = useState({
    baseSalary: DEFAULTS.baseSalary,
    marketRate: DEFAULTS.marketRate,
    oldRate: DEFAULTS.oldRate,
    newRate: DEFAULTS.newRate,
    currentService: DEFAULTS.currentService,
    horizon: DEFAULTS.horizon,
  });

  // Mobile sidebar visibility state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function handleChange(key, value) {
    setInputs((prev) => ({ ...prev, [key]: value }));
  }

  // Full 30-year projection, recomputed only when inputs change
  const projections = useMemo(
    () =>
      calculateProjections({
        baseSalary: inputs.baseSalary,
        marketRate: inputs.marketRate,
        oldRate: inputs.oldRate,
        newRate: inputs.newRate,
        currentService: inputs.currentService,
        maxHorizon: DEFAULTS.maxHorizon,
      }),
    [inputs.baseSalary, inputs.marketRate, inputs.oldRate, inputs.newRate, inputs.currentService]
  );

  // The data point at exactly the selected horizon year
  const dataAtHorizon = projections[inputs.horizon - 1] ?? null;

  function closeSidebar() {
    setSidebarOpen(false);
  }

  return (
    <div className="gradient-bg" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* ── Top bar ──────────────────────────────────────── */}
      <header style={{
        borderBottom: '1px solid var(--border)',
        background: 'rgba(13,21,38,0.85)',
        backdropFilter: 'blur(12px)',
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        position: 'sticky',
        top: 0,
        zIndex: 60,
      }}>
        {/* Mobile sidebar toggle — only shown on narrow viewports */}
        <button
          className="mobile-only"
          aria-label="Toggle parameters panel"
          onClick={() => setSidebarOpen((v) => !v)}
          style={{
            flexShrink: 0,
            alignItems: 'center',
            justifyContent: 'center',
            width: 36,
            height: 36,
            borderRadius: 10,
            border: '1px solid var(--border)',
            background: sidebarOpen ? 'rgba(59,130,246,0.15)' : 'rgba(13,21,38,0.6)',
            cursor: 'pointer',
            color: sidebarOpen ? 'var(--accent-blue)' : 'var(--text-secondary)',
            transition: 'background 0.2s, color 0.2s',
          }}
        >
          {sidebarOpen ? (
            /* X icon when open */
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            /* Sliders icon when closed */
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="18" x2="20" y2="18" />
              <circle cx="9" cy="6" r="2" fill="currentColor" stroke="none" />
              <circle cx="15" cy="12" r="2" fill="currentColor" stroke="none" />
              <circle cx="9" cy="18" r="2" fill="currentColor" stroke="none" />
            </svg>
          )}
        </button>

        {/* Logo mark */}
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'linear-gradient(135deg, #3b82f6 0%, #f43f5e 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </div>

        {/* Title — hidden overflow so it doesn't cause horizontal scroll on mobile */}
        <div style={{ minWidth: 0, flex: 1 }}>
          <h1 style={{
            fontSize: 'clamp(12px, 2.5vw, 16px)',
            fontWeight: 800,
            color: 'var(--text-primary)',
            letterSpacing: '-0.01em',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            UBC AAPS Tentative Agreement Compensation Impact Calculator
          </h1>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
            Modelling the financial cost of salary growth suppression over time
          </p>
        </div>
      </header>

      {/* ── Backdrop overlay (mobile only) ───────────────── */}
      <div
        className={`sidebar-overlay${sidebarOpen ? ' open' : ''}`}
        onClick={closeSidebar}
        aria-hidden="true"
      />

      {/* ── Mobile slide-in sidebar ───────────────────────── */}
      <div className={`mobile-sidebar${sidebarOpen ? ' open' : ''}`}>
        <InputPanel inputs={inputs} onChange={handleChange} onClose={closeSidebar} />
      </div>

      {/* ── Main layout ──────────────────────────────────── */}
      <div style={{ display: 'flex', flex: 1, gap: 0, overflow: 'hidden' }}>
        {/* Desktop sidebar — always visible on ≥ 768 px */}
        <div
          className="desktop-sidebar"
          style={{
            width: 300,
            flexShrink: 0,
            padding: '24px 20px',
            borderRight: '1px solid var(--border)',
            overflowY: 'auto',
          }}
        >
          <InputPanel inputs={inputs} onChange={handleChange} />
        </div>

        {/* Content */}
        <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Hero summary cards */}
          <SummaryCards dataAtHorizon={dataAtHorizon} horizon={inputs.horizon} />

          {/* Pension insight callout */}
          {dataAtHorizon && (
            <div style={{
              padding: '14px 16px',
              borderRadius: 12,
              background: 'rgba(245,158,11,0.07)',
              border: '1px solid rgba(245,158,11,0.18)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
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

          {/* Assumptions & Disclosure */}
          <AssumptionsDisclosure />

          {/* Charts grid — 2 columns on desktop, 1 on mobile */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))',
            gap: 20,
          }}>
            <TrajectoryChart data={projections} horizon={inputs.horizon} />
            <DeficitChart data={projections} horizon={inputs.horizon} />
          </div>

          {/* Data table */}
          <ProjectionTable projections={projections} inputs={inputs} />

          {/* Footer */}
          <footer style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', paddingBottom: 16, lineHeight: 1.6 }}>
            For modelling purposes only. DB pension uses 1.8% accrual rate × (current + future service) × Best-3-Year average salary.
            Employer savings based on 119.8% factor of cumulative salary suppression (Salary + Benefits).
          </footer>
        </main>
      </div>
    </div>
  );
}
