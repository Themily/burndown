import React from 'react';
import { useCurrency } from '../../context/CurrencyContext';
import AnimatedNumber from '../AnimatedNumber';

export default function CompoundSummaryBar({ result, mode }) {
  const { formatCurrency } = useCurrency();

  const stats = [
    { label: 'Final Balance', value: formatCurrency(result.finalBalance), color: 'text-green' },
    { label: 'Total Contributed', value: formatCurrency(result.totalContributions), color: 'text-purple' },
    { label: 'Interest Earned', value: formatCurrency(result.totalInterest), color: 'text-teal' },
    { label: 'Effective Rate', value: `${result.effectiveAnnualRate}%`, color: 'text-amber' },
  ];

  if (mode === 'advanced') {
    stats.push({ label: 'After-Tax Balance', value: formatCurrency(result.afterTaxBalance), color: 'text-green' });
    stats.push({ label: 'Inflation-Adjusted', value: formatCurrency(result.inflationAdjusted), color: 'text-text-secondary' });
  }

  return (
    <div className="mx-4 mb-10">
      <div className={`grid grid-cols-2 ${mode === 'advanced' ? 'sm:grid-cols-3 lg:grid-cols-6' : 'sm:grid-cols-2 lg:grid-cols-4'} gap-3`}>
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-bg-card border border-border-subtle rounded-2xl p-4 text-center backdrop-blur-xl transition-all hover:border-border-medium hover:bg-bg-card-hover"
          >
            <div className="text-text-muted text-[11px] uppercase tracking-widest mb-2 font-medium">
              {stat.label}
            </div>
            <div className={`font-mono text-xl font-bold tabular-nums ${stat.color}`}>
              <AnimatedNumber value={stat.value} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
