import React from 'react';

function formatCurrency(value) {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 1,
  }).format(value);
}

function formatCurrencyFull(value) {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    maximumFractionDigits: 0,
  }).format(value);
}

const CARDS = [
  {
    id: 'cumulative-deficit',
    key: 'cumulativeSalaryDeficit',
    label: 'Cumulative Salary Deficit',
    sublabel: 'Total capital lost by target year',
    accentColor: '#f43f5e',
    accentBg: 'rgba(244,63,94,0.08)',
    accentBorder: 'rgba(244,63,94,0.2)',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/>
        <polyline points="17 18 23 18 23 12"/>
      </svg>
    ),
    description: 'Total foregone salary from suppressed growth compared to the merit-based trajectory.',
  },
  {
    id: 'pension-deficit',
    key: 'pensionDeficit',
    label: 'Annual Pension Deficit',
    sublabel: 'Permanent drop in DB pension payout',
    accentColor: '#f59e0b',
    accentBg: 'rgba(245,158,11,0.08)',
    accentBorder: 'rgba(245,158,11,0.2)',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/>
        <path d="M2 17l10 5 10-5"/>
        <path d="M2 12l10 5 10-5"/>
      </svg>
    ),
    description: 'Annual pension reduction at target year based on Best-3 average salary method.',
  },
  {
    id: 'employer-savings',
    key: 'employerSavings',
    label: 'Employer Pension Savings',
    sublabel: 'Accumulated employer contribution relief',
    accentColor: '#14b8a6',
    accentBg: 'rgba(20,184,166,0.08)',
    accentBorder: 'rgba(20,184,166,0.2)',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2"/>
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
        <line x1="12" y1="12" x2="12" y2="16"/>
        <line x1="10" y1="14" x2="14" y2="14"/>
      </svg>
    ),
    description: 'Employer\'s pension contribution savings from suppressed salary base (9.8% of cumulative deficit).',
  },
];

export default function SummaryCards({ dataAtHorizon, horizon }) {
  if (!dataAtHorizon) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="section-heading" style={{ marginBottom: 0 }}>
          Impact at Year {horizon}
        </h2>
        <span style={{
          fontSize: 11, fontWeight: 600,
          color: 'var(--accent-blue)',
          background: 'rgba(59,130,246,0.12)',
          borderRadius: 6, padding: '3px 10px',
          border: '1px solid rgba(59,130,246,0.2)',
        }}>
          Compared to merit-based trajectory
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
        {CARDS.map((card) => {
          const value = dataAtHorizon[card.key] ?? 0;
          return (
            <article
              key={card.id}
              id={card.id}
              className="glass fade-up"
              style={{
                padding: '24px',
                borderColor: card.accentBorder,
                background: card.accentBg,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Top row: icon + label */}
              <div className="flex items-start justify-between" style={{ marginBottom: 16 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ color: card.accentColor }}>{card.icon}</span>
                    <p style={{ fontSize: 12, fontWeight: 700, color: card.accentColor, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                      {card.label}
                    </p>
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{card.sublabel}</p>
                </div>
              </div>

              {/* Main value */}
              <p
                className="metric-value"
                title={formatCurrencyFull(value)}
                style={{ color: card.accentColor, marginBottom: 8 }}
              >
                {formatCurrency(value)}
              </p>
              <p style={{ fontSize: 11, color: '#ffffff55' }}>
                {formatCurrencyFull(value)}
              </p>

              {/* Description */}
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 12, lineHeight: 1.55 }}>
                {card.description}
              </p>

              {/* Decorative corner glow */}
              <div style={{
                position: 'absolute', bottom: -20, right: -20,
                width: 80, height: 80, borderRadius: '50%',
                background: card.accentColor,
                opacity: 0.06, filter: 'blur(20px)',
              }} />
            </article>
          );
        })}
      </div>
    </div>
  );
}
