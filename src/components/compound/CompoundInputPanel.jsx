import React from 'react';
import { useCurrency } from '../../context/CurrencyContext';

const FREQ_OPTIONS = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'annually', label: 'Annually' },
];

function InputField({ label, tooltip, value, onChange, prefix, suffix, min = 0, max, step = 1 }) {
  const { symbol } = useCurrency();
  const displayPrefix = prefix === 'currency' ? symbol : prefix;

  return (
    <div>
      <label className="flex items-center gap-1.5 text-text-secondary text-sm font-medium mb-2">
        {label}
        {tooltip && (
          <span className="group relative cursor-help">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted">
              <circle cx="12" cy="12" r="10"/>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-bg-card-solid border border-border-medium rounded-lg text-xs text-text-secondary whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-xl">
              {tooltip}
            </span>
          </span>
        )}
      </label>
      <div className="relative">
        {displayPrefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm font-mono pointer-events-none">
            {displayPrefix}
          </span>
        )}
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          min={min}
          max={max}
          step={step}
          className={displayPrefix ? 'pl-8' : ''}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted text-sm font-mono pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

function SelectField({ label, tooltip, value, onChange, options }) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-text-secondary text-sm font-medium mb-2">
        {label}
        {tooltip && (
          <span className="group relative cursor-help">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted">
              <circle cx="12" cy="12" r="10"/>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-bg-card-solid border border-border-medium rounded-lg text-xs text-text-secondary whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-xl">
              {tooltip}
            </span>
          </span>
        )}
      </label>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

export default function CompoundInputPanel({ inputs, setInputs, mode }) {
  const update = (field, value) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="card">
      <h2 className="font-heading text-lg font-semibold mb-6 section-accent">Investment Parameters</h2>

      {/* Core fields — always visible */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <InputField
          label="Initial Investment"
          tooltip="Starting lump sum amount"
          value={inputs.principal}
          onChange={(v) => update('principal', v)}
          prefix="currency"
        />
        <InputField
          label="Annual Interest Rate"
          tooltip="Expected annual return (%)"
          value={inputs.annualRate}
          onChange={(v) => update('annualRate', v)}
          suffix="%"
          step={0.1}
          max={100}
        />
        <InputField
          label="Time Period"
          tooltip="Investment duration in years"
          value={inputs.years}
          onChange={(v) => update('years', Math.max(1, Math.min(100, Math.round(v))))}
          suffix="years"
          min={1}
          max={100}
        />
      </div>

      {/* Intermediate+ fields */}
      {mode !== 'simple' && (
        <>
          <div className="h-px bg-gradient-to-r from-transparent via-border-subtle to-transparent my-6" />
          <h3 className="text-text-secondary text-sm font-semibold uppercase tracking-wider mb-4">Contributions & Compounding</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <InputField
              label="Contribution Amount"
              tooltip="Regular contribution amount per period"
              value={inputs.contributionAmount}
              onChange={(v) => update('contributionAmount', v)}
              prefix="currency"
            />
            <SelectField
              label="Contribution Frequency"
              tooltip="How often you contribute"
              value={inputs.contributionFreq}
              onChange={(v) => update('contributionFreq', v)}
              options={FREQ_OPTIONS}
            />
            <SelectField
              label="Compounding Frequency"
              tooltip="How often interest is compounded"
              value={inputs.compoundingFreq}
              onChange={(v) => update('compoundingFreq', v)}
              options={FREQ_OPTIONS}
            />
          </div>
        </>
      )}

      {/* Advanced fields */}
      {mode === 'advanced' && (
        <>
          <div className="h-px bg-gradient-to-r from-transparent via-border-subtle to-transparent my-6" />
          <h3 className="text-text-secondary text-sm font-semibold uppercase tracking-wider mb-4">Adjustments</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="Inflation Rate"
              tooltip="Annual inflation rate to calculate real returns"
              value={inputs.inflationRate}
              onChange={(v) => update('inflationRate', v)}
              suffix="%"
              step={0.1}
              max={50}
            />
            <InputField
              label="Tax Rate on Gains"
              tooltip="Tax rate applied to total interest earned"
              value={inputs.taxRate}
              onChange={(v) => update('taxRate', v)}
              suffix="%"
              step={0.1}
              max={100}
            />
          </div>
        </>
      )}
    </div>
  );
}
