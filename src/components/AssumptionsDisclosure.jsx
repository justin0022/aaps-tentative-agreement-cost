import React, { useState } from 'react';

const AAPS_URL = 'https://aaps.ubc.ca/member/news/summary-tentative-agreement';

function ExternalLink({ href, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        color: 'var(--accent-blue)',
        textDecoration: 'underline',
        textDecorationStyle: 'dotted',
        textUnderlineOffset: 3,
      }}
    >
      {children}
    </a>
  );
}

function BlockQuote({ children }) {
  return (
    <blockquote style={{
      borderLeft: '3px solid rgba(245,158,11,0.5)',
      paddingLeft: 14,
      margin: '12px 0',
      color: 'var(--text-secondary)',
      fontStyle: 'italic',
      fontSize: 12,
      lineHeight: 1.7,
    }}>
      {children}
    </blockquote>
  );
}

function Section({ title, accent = 'var(--accent-blue)', children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h4 style={{
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: '0.09em',
        textTransform: 'uppercase',
        color: accent,
        marginBottom: 10,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>
        <span style={{
          display: 'inline-block', width: 20, height: 2,
          background: accent, borderRadius: 1,
        }} />
        {title}
      </h4>
      <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.75 }}>
        {children}
      </div>
    </div>
  );
}

function FormulaRow({ label, formula, accent = 'var(--accent-blue)' }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      gap: 16,
      padding: '7px 12px',
      borderRadius: 8,
      background: 'rgba(5,10,22,0.5)',
      border: '1px solid var(--border)',
      marginBottom: 6,
    }}>
      <span style={{ fontSize: 12, color: 'var(--text-secondary)', flexShrink: 0 }}>{label}</span>
      <code style={{ fontSize: 11.5, color: accent, fontFamily: 'monospace', textAlign: 'right' }}>{formula}</code>
    </div>
  );
}

export default function AssumptionsDisclosure() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className="glass"
      style={{
        border: '1px solid rgba(245,158,11,0.2)',
        background: 'rgba(245,158,11,0.04)',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
      }}
    >
      {/* ── Clickable header ───────────────────────────────── */}
      <button
        onClick={() => setIsExpanded((v) => !v)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 24px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
          <div style={{ textAlign: 'left' }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#f59e0b' }}>
              Assumptions, Methodology & Disclosure
            </p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
              Who this applies to · How the math works · Source documentation
            </p>
          </div>
        </div>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--text-muted)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            flexShrink: 0,
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.25s ease',
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* ── Expandable body ────────────────────────────────── */}
      {isExpanded && (
        <div style={{
          padding: '0 24px 24px',
          borderTop: '1px solid rgba(245,158,11,0.15)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 32,
        }}>
          {/* Left column */}
          <div style={{ paddingTop: 20 }}>
            <Section title="Who This Tool Applies To" accent="#f59e0b">
              <p style={{ marginBottom: 10 }}>
                This calculator is designed specifically for <strong style={{ color: 'var(--text-primary)' }}>AAPS members who are already above market rate</strong> (previously called "past midpoint") in their pay grade — the group directly impacted by the merit restructuring in the 2025 tentative agreement.
              </p>
              <p style={{ marginBottom: 10 }}>
                Under the new agreement, employees <strong style={{ color: 'var(--text-primary)' }}>above market rate</strong> will no longer receive the General Pay Adjustment (GPA) and merit as two separate increases. Instead, they receive a <strong style={{ color: '#f43f5e' }}>single combined increase</strong> — with the average across the group required to be no less than the GPA rate of <strong style={{ color: '#f43f5e' }}>3% until 2028</strong>.
              </p>
              <p style={{ marginBottom: 10 }}>
                Historically, merit increases for above-market employees ranged from <strong style={{ color: 'var(--text-primary)' }}>0% to 3%</strong>,
                paid <em>on top of</em> the GPA, giving a combined annual increase of roughly <strong style={{ color: 'var(--text-primary)' }}>3%–6%</strong> (averaging ~4.5% for a typical performer receiving ~1.5% merit).
              </p>
              <p>
                Under the new agreement, that same employee will receive a <em>single</em> blended increase averaging at least 3% across the group — effectively eliminating the additional merit layer and substantially reducing salary trajectory for anyone who was consistently earning merit increases.
              </p>
            </Section>

            <Section title="Source: AAPS Tentative Agreement Summary" accent="#f59e0b">
              <p style={{ marginBottom: 10 }}>
                The following is quoted directly from the{' '}
                <ExternalLink href={AAPS_URL}>AAPS Summary of the Tentative Agreement</ExternalLink>
                , under the <strong style={{ color: 'var(--text-primary)' }}>Merit</strong> section:
              </p>
              <BlockQuote>
                "The average paid to employees above market rate for performance-based pay increases will now need to be no less than the General Pay Adjustment Rate, which upon ratification, will be 3% until 2028. This means that employees above market rate will not receive the General Pay Adjustment (except for the one retroactive to July 2025) and merit as separate pay adjustments, but rather as one pay adjustment that is intended to keep them at or above market rate, with the potential for higher increases when performance exceeds expectations."
              </BlockQuote>
              <BlockQuote>
                "What this looks like for this tentative agreement is slowing the salary growth of AAPS' highest earners in each pay grade. This is also an equity issue we have noticed continually getting worse through the years, as high earners in each pay grade see their salaries increase much faster than the lower paid employees."
              </BlockQuote>
              <p>
                This calculator models the <strong style={{ color: 'var(--text-primary)' }}>conservative scenario</strong>: an above-market employee who was receiving the average merit increase (~1.5%, representing the midpoint of the historical 0–3% range, combined with the 3% GPA for a ~4.5% total) who now receives only the 3% floor. The default "Old Growth Rate" of 4.5% reflects this typical-performer baseline. Individual outcomes may vary upward if UBC awards above-average individual merit increases.
              </p>
            </Section>
          </div>

          {/* Right column */}
          <div style={{ paddingTop: 20 }}>
            <Section title="Calculation Methodology" accent="var(--accent-blue)">
              <p style={{ marginBottom: 12 }}>
                All projections are forward-looking from your current base salary. The model does <strong style={{ color: 'var(--text-primary)' }}>not</strong> account for promotions, pay grade changes, or any pay increase above the scenario rates entered.
              </p>

              <FormulaRow
                label="Annual salary (Year N)"
                formula="BaseSalary × (1 + Rate)ᴺ"
                accent="var(--accent-blue)"
              />
              <FormulaRow
                label="Best-3 average salary"
                formula="Avg of [Salary(N−2), Salary(N−1), Salary(N)]"
                accent="var(--accent-blue)"
              />
              <FormulaRow
                label="DB Pension (annual payout)"
                formula="1.8% × Total Service Years × Best-3 Avg"
                accent="var(--accent-teal)"
              />
              <FormulaRow
                label="Cumulative salary deficit"
                formula="Σ (OldSalary − NewSalary) for all years"
                accent="#f43f5e"
              />
              <FormulaRow
                label="Employer pension savings"
                formula="9.8% × Cumulative Salary Deficit"
                accent="var(--accent-teal)"
              />

              <p style={{ marginTop: 14 }}>
                <strong style={{ color: 'var(--text-primary)' }}>Best-3 Average:</strong>{' '}
                The Defined Benefit pension formula uses the average of the 3 most recent consecutive years of salary. In years 1 and 2 of the projection (where fewer than 3 future salary data points exist), the average uses only the available years — consistent with how a new employee's pension would be calculated.
              </p>

              <p style={{ marginTop: 10 }}>
                <strong style={{ color: 'var(--text-primary)' }}>Employer Savings Rate:</strong>{' '}
                The 9.8% rate represents the employer's pension contribution rate applied to the suppressed salary base, quantifying the institutional savings that result directly from capped merit increases.
              </p>
            </Section>

            <Section title="Important Limitations & Disclaimers" accent="#f43f5e">
              <ul style={{ paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <li>This is an <strong style={{ color: 'var(--text-primary)' }}>independent modelling tool</strong> — not affiliated with or endorsed by AAPS or UBC.</li>
                <li>The <strong style={{ color: 'var(--text-primary)' }}>&quot;Old Growth Rate&quot;</strong> should reflect your historical combined GPA + merit increase. Historically, merit ranged from 0–3% on top of the GPA — so if you typically received ~1.5% merit, enter 4.5% (3% GPA + 1.5% merit = 4.5% total).</li>
                <li>The <strong style={{ color: 'var(--text-primary)' }}>&quot;New Growth Rate&quot;</strong> defaults to 3% (the minimum floor under the new agreement). Your actual increase may be above 3% if your individual performance is ranked above the group average.</li>
                <li>Pension projections are illustrative. Actual entitlement depends on the plan rules at time of retirement, any future amendments to the UBC Staff Pension Plan, and final salary history.</li>
                <li>The retroactive 3% GPA for July 2025 is <strong style={{ color: 'var(--text-primary)' }}>not modelled</strong> here — projections begin from your current base salary going forward.</li>
              </ul>
            </Section>
          </div>
        </div>
      )}
    </div>
  );
}
