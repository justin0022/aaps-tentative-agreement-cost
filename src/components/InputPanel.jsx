import React from 'react';

const FIELD_GROUPS = [
  {
    label: 'Current Base Salary',
    key: 'baseSalary',
    type: 'currency',
    min: 10000,
    max: 500000,
    step: 1000,
    prefix: '$',
  },
  {
    label: 'Merit-Based Growth Rate',
    key: 'oldRate',
    type: 'percent',
    min: 0,
    max: 20,
    step: 0.1,
    suffix: '%',
    accent: '#10b981', // emerald
  },
  {
    label: 'Agreement Growth Rate (Capped)',
    key: 'newRate',
    type: 'percent',
    min: 0,
    max: 20,
    step: 0.1,
    suffix: '%',
    accent: '#f43f5e', // red
  },
  {
    label: 'Current Years of Service',
    key: 'currentService',
    type: 'number',
    min: 0,
    max: 40,
    step: 1,
    suffix: ' yrs',
  },
];

function formatCurrency(value) {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    maximumFractionDigits: 0,
  }).format(value);
}

export default function InputPanel({ inputs, onChange }) {
  const { horizon } = inputs;

  function handleChange(key, rawValue) {
    const parsed = parseFloat(rawValue);
    if (!isNaN(parsed)) {
      onChange(key, parsed);
    }
  }

  function handleCurrencyInput(e) {
    // Strip non-numeric chars and parse
    const raw = e.target.value.replace(/[^0-9]/g, '');
    onChange('baseSalary', raw === '' ? 0 : parseInt(raw, 10));
  }

  return (
    <aside className="glass fade-up flex flex-col gap-6 p-6 h-full overflow-y-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="pulse-dot" style={{ background: 'var(--accent-blue)' }} />
          <span className="section-heading" style={{ marginBottom: 0 }}>Parameters</span>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
          Adjust values to model your personal impact
        </p>
      </div>

      <hr style={{ borderColor: 'var(--border)' }} />

      {/* Field groups */}
      {FIELD_GROUPS.map((field) => (
        <div key={field.key}>
          <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
            <label className="field-label" style={{ marginBottom: 0 }}>{field.label}</label>
            <span style={{
              fontSize: 13,
              fontWeight: 700,
              color: field.accent || 'var(--accent-blue)',
              background: field.accent
                ? `${field.accent}18`
                : 'rgba(59,130,246,0.12)',
              borderRadius: 6,
              padding: '2px 8px',
            }}>
              {field.type === 'currency'
                ? formatCurrency(inputs[field.key])
                : `${inputs[field.key]}${field.suffix || ''}`}
            </span>
          </div>
          {field.type === 'currency' ? (
            <input
              id={`input-${field.key}`}
              className="input-field"
              type="text"
              inputMode="numeric"
              value={`$${inputs[field.key].toLocaleString('en-CA')}`}
              onChange={handleCurrencyInput}
            />
          ) : (
            <input
              id={`input-${field.key}`}
              className="input-field"
              type="number"
              min={field.min}
              max={field.max}
              step={field.step}
              value={inputs[field.key]}
              onChange={(e) => handleChange(field.key, e.target.value)}
            />
          )}
        </div>
      ))}

      <hr style={{ borderColor: 'var(--border)' }} />

      {/* Horizon slider */}
      <div>
        <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
          <label className="field-label" style={{ marginBottom: 0 }}>Target Horizon</label>
          <span style={{
            fontSize: 13,
            fontWeight: 700,
            color: 'var(--accent-blue)',
            background: 'rgba(59,130,246,0.12)',
            borderRadius: 6,
            padding: '2px 8px',
          }}>
            Year {horizon}
          </span>
        </div>
        <input
          id="input-horizon"
          type="range"
          min={1}
          max={30}
          step={1}
          value={horizon}
          onChange={(e) => onChange('horizon', parseInt(e.target.value, 10))}
          style={{
            background: `linear-gradient(to right, var(--accent-blue) ${((horizon - 1) / 29) * 100}%, var(--bg-surface) ${((horizon - 1) / 29) * 100}%)`,
          }}
        />
        <div className="flex justify-between" style={{ marginTop: 6 }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>1 yr</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>30 yrs</span>
        </div>
      </div>

      <hr style={{ borderColor: 'var(--border)' }} />

      {/* Formula note */}
      <div style={{
        fontSize: 11,
        color: 'var(--text-muted)',
        lineHeight: 1.7,
        padding: '10px 12px',
        background: 'rgba(5,10,22,0.5)',
        borderRadius: 10,
        border: '1px solid var(--border)',
      }}>
        <p style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Methodology</p>
        <p>Salary: <code style={{ color: 'var(--accent-blue)' }}>Base × (1 + Rate)^year</code></p>
        <p>Pension: <code style={{ color: 'var(--accent-blue)' }}>1.8% × Service × Best‑3 Avg</code></p>
        <p>Employer saving: <code style={{ color: 'var(--accent-blue)' }}>9.8% × Cumul. Deficit</code></p>
      </div>
    </aside>
  );
}
