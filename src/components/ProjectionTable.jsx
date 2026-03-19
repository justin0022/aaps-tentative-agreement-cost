import React from 'react';

// ─── Formatters ───────────────────────────────────────────────────────────────

const fmtFull = (v) =>
  new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(v);

const fmtCompact = (v) =>
  new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', notation: 'compact', compactDisplay: 'short', maximumFractionDigits: 1 }).format(v);

const pct = (v) => `${v}%`;

// ─── Column definitions ───────────────────────────────────────────────────────

/**
 * Each column definition:
 *   label       — header text
 *   align       — 'center' | 'right'
 *   color       — cell text colour (fn or string)
 *   tooltip     — multi-line tooltip shown on header hover
 *   value       — (row, inputs) → raw numeric value
 *   display     — (row, inputs) → formatted display string (defaults to fmtFull(value))
 *   formulaStr  — (row, inputs) → short formula annotation shown below the value
 */
const COLUMNS = [
  {
    key: 'year',
    label: 'Year',
    align: 'center',
    tooltip: 'Projection year.\nYear 1 = the first full year after your current position.\nThe ★ row marks your selected target horizon.',
    value: (row) => row.year,
    display: (row, inputs) => row.year === inputs.horizon ? `★ ${row.year}` : String(row.year),
    formulaStr: null,
    color: (row, inputs) => row.year === inputs.horizon ? 'var(--accent-blue)' : 'var(--text-secondary)',
    fontWeight: (row, inputs) => row.year === inputs.horizon ? 700 : 400,
  },
  {
    key: 'oldSalary',
    label: 'Merit Salary',
    align: 'right',
    tooltip: 'Your projected salary following the historical merit-based trajectory\n(GPA 3% + merit 0–3%, modelled as your "Old Growth Rate").\n\nFormula: BaseSalary × (1 + OldRate)^Year',
    value: (row) => row.oldSalary,
    formulaStr: (row, inputs) => {
      const r = (1 + inputs.oldRate / 100).toFixed(4);
      return `$${fmtCompact(inputs.baseSalary)} × ${r}^${row.year}`;
    },
    color: () => '#10b981',
    fontWeight: () => 500,
  },
  {
    key: 'newSalary',
    label: 'Capped Salary',
    align: 'right',
    tooltip: 'Your projected salary under the new agreement,\nwhere above-market employees receive a single blended\nincrease averaging no less than the GPA floor (3% until 2028).\n\nFormula: BaseSalary × (1 + NewRate)^Year',
    value: (row) => row.newSalary,
    formulaStr: (row, inputs) => {
      const r = (1 + inputs.newRate / 100).toFixed(4);
      return `$${fmtCompact(inputs.baseSalary)} × ${r}^${row.year}`;
    },
    color: () => '#f43f5e',
    fontWeight: () => 500,
  },
  {
    key: 'annualDeficit',
    label: 'Annual Deficit',
    align: 'right',
    tooltip: 'Salary foregone in this specific year — the gap\nbetween what you would have earned on the merit\ntrajectory vs. the capped trajectory.\n\nFormula: Merit Salary − Capped Salary',
    value: (row) => row.annualDeficit,
    formulaStr: (row) =>
      `${fmtCompact(row.oldSalary)} − ${fmtCompact(row.newSalary)}`,
    color: () => '#f59e0b',
    fontWeight: () => 400,
  },
  {
    key: 'cumulativeSalaryDeficit',
    label: 'Cumulative Deficit',
    align: 'right',
    tooltip: 'Running total of all salary foregone from Year 1\nthrough the current year. This is the total capital\nlost due to salary growth suppression.\n\nFormula: Σ Annual Deficits (Year 1 → Year N)',
    value: (row) => row.cumulativeSalaryDeficit,
    formulaStr: (row) => `Σ Annual Deficits Yr 1–${row.year}`,
    color: (row, inputs) => row.year === inputs.horizon ? '#f43f5e' : 'var(--text-secondary)',
    fontWeight: (row, inputs) => row.year === inputs.horizon ? 700 : 400,
  },
  {
    key: 'oldPension',
    label: 'Merit Pension',
    align: 'right',
    tooltip: 'Estimated annual DB pension payout at this year,\nbased on the merit-based salary trajectory.\n\nFormula: 1.8% × Service Years × Best-3 Avg Salary\n(Best-3 = avg of this year + 2 prior years\' merit salaries)',
    value: (row) => row.oldPension,
    formulaStr: (row) =>
      `1.8% × ${row.totalService}yrs × ${fmtCompact(row.oldBest3Avg)}`,
    color: () => '#10b981',
    fontWeight: () => 400,
  },
  {
    key: 'newPension',
    label: 'Capped Pension',
    align: 'right',
    tooltip: 'Estimated annual DB pension payout at this year,\nbased on the capped salary trajectory.\n\nFormula: 1.8% × Service Years × Best-3 Avg Salary\n(Best-3 = avg of this year + 2 prior years\' capped salaries)',
    value: (row) => row.newPension,
    formulaStr: (row) =>
      `1.8% × ${row.totalService}yrs × ${fmtCompact(row.newBest3Avg)}`,
    color: () => '#f43f5e',
    fontWeight: () => 400,
  },
  {
    key: 'pensionDeficit',
    label: 'Pension Gap',
    align: 'right',
    tooltip: 'The permanent annual reduction in DB pension payout\nat this year — what you lose every year in retirement\ndue to the suppressed salary base.\n\nFormula: Merit Pension − Capped Pension',
    value: (row) => row.pensionDeficit,
    formulaStr: (row) =>
      `${fmtCompact(row.oldPension)} − ${fmtCompact(row.newPension)}`,
    color: () => '#f59e0b',
    fontWeight: () => 400,
  },
  {
    key: 'employerSavings',
    label: 'Employer Savings',
    align: 'right',
    tooltip: 'Cumulative amount the employer has saved on pension\ncontributions by suppressing salary growth.\n9.8% is the employer\'s pension contribution rate.\n\nFormula: 9.8% × Cumulative Salary Deficit',
    value: (row) => row.employerSavings,
    formulaStr: (row) =>
      `9.8% × ${fmtCompact(row.cumulativeSalaryDeficit)}`,
    color: () => '#14b8a6',
    fontWeight: () => 400,
  },
];

// ─── TooltipHeader ────────────────────────────────────────────────────────────

function TooltipHeader({ col }) {
  return (
    <th
      style={{
        padding: '10px 12px',
        textAlign: col.align,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.07em',
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
        borderBottom: '1px solid var(--border)',
        whiteSpace: 'nowrap',
        position: 'relative',
        userSelect: 'none',
      }}
    >
      <span
        data-col-tooltip={col.tooltip}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          cursor: 'help',
        }}
        className="col-tooltip-trigger"
      >
        {col.label}
        {col.tooltip && (
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ opacity: 0.5, flexShrink: 0 }}
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        )}
      </span>
    </th>
  );
}

// ─── DataCell ─────────────────────────────────────────────────────────────────

function DataCell({ col, row, inputs }) {
  const rawValue = col.value(row, inputs);
  const displayText = col.display
    ? col.display(row, inputs)
    : fmtFull(rawValue);
  const formulaText = col.formulaStr ? col.formulaStr(row, inputs) : null;
  const color = typeof col.color === 'function' ? col.color(row, inputs) : col.color;
  const fw = typeof col.fontWeight === 'function' ? col.fontWeight(row, inputs) : (col.fontWeight ?? 400);

  return (
    <td
      style={{
        padding: '7px 12px',
        textAlign: col.align,
        color,
        fontWeight: fw,
        verticalAlign: 'top',
      }}
    >
      <div style={{ lineHeight: 1.3 }}>{displayText}</div>
      {formulaText && (
        <div style={{
          fontSize: 9.5,
          color: 'var(--text-muted)',
          fontFamily: 'monospace',
          marginTop: 2,
          lineHeight: 1.2,
          opacity: 0.75,
        }}>
          {formulaText}
        </div>
      )}
    </td>
  );
}

// ─── ProjectionTable ──────────────────────────────────────────────────────────

export default function ProjectionTable({ projections, inputs }) {
  return (
    <div className="glass fade-up" style={{ padding: '24px', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
          Year-by-Year Breakdown
        </h3>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          Hover column headers for descriptions · formula shown below each value
        </span>
      </div>

      <div style={{ overflowX: 'auto', position: 'relative' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr>
              {COLUMNS.map((col) => (
                <TooltipHeader key={col.key} col={col} />
              ))}
            </tr>
          </thead>
          <tbody>
            {projections.map((row) => {
              const isHorizon = row.year === inputs.horizon;
              return (
                <tr
                  key={row.year}
                  style={{
                    background: isHorizon ? 'rgba(59,130,246,0.07)' : 'transparent',
                    borderBottom: '1px solid var(--border)',
                    transition: 'background 0.15s',
                  }}
                >
                  {COLUMNS.map((col) => (
                    <DataCell key={col.key} col={col} row={row} inputs={inputs} />
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
