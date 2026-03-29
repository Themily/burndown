import React from 'react';
import { useCurrency } from '../../context/CurrencyContext';

const FREQ_OPTIONS = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'annually', label: 'Annually' },
];

function InputField({ label, value, onChange, prefix, suffix, min = 0, step = 1 }) {
  const { symbol } = useCurrency();
  const displayPrefix = prefix === 'currency' ? symbol : prefix;
  const fieldId = `scenario-b-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

  return (
    <div>
      <label htmlFor={fieldId} className="text-text-secondary text-xs font-medium mb-1 block">{label}</label>
      <div className="relative">
        {displayPrefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-xs font-mono pointer-events-none">{displayPrefix}</span>
        )}
        <input
          id={fieldId}
          aria-label={label}
          type="number"
          value={value}
          onChange={(e) => {
            let v = parseFloat(e.target.value) || 0;
            if (min != null) v = Math.max(min, v);
            onChange(v);
          }}
          min={min}
          step={step}
          className={`text-sm ${displayPrefix ? 'pl-7' : ''}`}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted text-xs font-mono pointer-events-none">{suffix}</span>
        )}
      </div>
    </div>
  );
}

function ScenarioCard({ title, accent, result, formatCurrency }) {
  return (
    <div className={`bg-bg-card border rounded-2xl p-5 ${accent}`}>
      <h3 className="font-heading text-base font-semibold mb-4">{title}</h3>
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-text-muted">Final Balance</span>
          <span className="font-mono font-bold text-green">{formatCurrency(result.finalBalance)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-text-muted">Total Contributed</span>
          <span className="font-mono font-semibold text-text-primary">{formatCurrency(result.totalContributions)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-text-muted">Interest Earned</span>
          <span className="font-mono font-semibold text-teal">{formatCurrency(result.totalInterest)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-text-muted">After-Tax Balance</span>
          <span className="font-mono font-semibold text-text-primary">{formatCurrency(result.afterTaxBalance)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-text-muted">Inflation-Adjusted</span>
          <span className="font-mono font-semibold text-text-secondary">{formatCurrency(result.inflationAdjusted)}</span>
        </div>
      </div>
    </div>
  );
}

export default function CompoundScenarios({ resultA, resultB, scenarioBInputs, setScenarioBInputs }) {
  const { formatCurrency } = useCurrency();

  const updateB = (field, value) => {
    setScenarioBInputs((prev) => ({
      ...prev,
      scenarioB: { ...prev.scenarioB, [field]: value },
    }));
  };

  const diff = resultA.finalBalance - resultB.finalBalance;
  const winner = diff > 0 ? 'A' : diff < 0 ? 'B' : null;

  return (
    <div className="card mx-4 mb-10">
      <h2 className="font-heading text-lg font-semibold mb-2 section-accent">Scenario Comparison</h2>
      <p className="text-text-muted text-xs mb-6">Compare two different investment strategies side by side.</p>

      {/* Scenario B Inputs */}
      <div className="bg-bg-elevated border border-border-subtle rounded-xl p-4 mb-6">
        <h3 className="text-text-secondary text-sm font-semibold uppercase tracking-wider mb-3">Scenario B Parameters</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <InputField label="Principal" value={scenarioBInputs.principal} onChange={(v) => updateB('principal', v)} prefix="currency" />
          <InputField label="Rate (%)" value={scenarioBInputs.annualRate} onChange={(v) => updateB('annualRate', v)} suffix="%" step={0.1} />
          <InputField label="Years" value={scenarioBInputs.years} onChange={(v) => updateB('years', Math.max(1, Math.min(100, Math.round(v))))} suffix="yr" min={1} />
          <InputField label="Contribution" value={scenarioBInputs.contributionAmount} onChange={(v) => updateB('contributionAmount', v)} prefix="currency" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
          <div>
            <label htmlFor="scenario-b-contribution-freq" className="text-text-secondary text-xs font-medium mb-1 block">Contribution Freq.</label>
            <select id="scenario-b-contribution-freq" aria-label="Contribution Frequency" value={scenarioBInputs.contributionFreq} onChange={(e) => updateB('contributionFreq', e.target.value)} className="text-sm">
              {FREQ_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="scenario-b-compounding-freq" className="text-text-secondary text-xs font-medium mb-1 block">Compounding Freq.</label>
            <select id="scenario-b-compounding-freq" aria-label="Compounding Frequency" value={scenarioBInputs.compoundingFreq} onChange={(e) => updateB('compoundingFreq', e.target.value)} className="text-sm">
              {FREQ_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <InputField label="Inflation (%)" value={scenarioBInputs.inflationRate} onChange={(v) => updateB('inflationRate', v)} suffix="%" step={0.1} />
          <InputField label="Tax Rate (%)" value={scenarioBInputs.taxRate} onChange={(v) => updateB('taxRate', v)} suffix="%" step={0.1} />
        </div>
      </div>

      {/* Results comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <ScenarioCard
          title="Scenario A (Your Settings)"
          accent="border-purple/30"
          result={resultA}
          formatCurrency={formatCurrency}
        />
        <ScenarioCard
          title="Scenario B"
          accent="border-amber/30"
          result={resultB}
          formatCurrency={formatCurrency}
        />
      </div>

      {/* Difference summary */}
      {winner && (
        <div className={`text-center py-3 rounded-xl border ${winner === 'A' ? 'bg-purple/5 border-purple/20' : 'bg-amber/5 border-amber/20'}`}>
          <span className="text-sm font-medium text-text-secondary">
            Scenario {winner} earns{' '}
            <span className={`font-bold font-mono ${winner === 'A' ? 'text-purple' : 'text-amber'}`}>
              {formatCurrency(Math.abs(diff))}
            </span>{' '}
            more
          </span>
        </div>
      )}
    </div>
  );
}
