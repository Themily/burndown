import React from 'react';
import { useCurrency } from '../../context/CurrencyContext';
import AnimatedNumber from '../AnimatedNumber';

export default function PortfolioSummaryBar({ summary, mode }) {
  const { formatCurrency } = useCurrency();

  const baseMetrics = [
    {
      label: 'Total Value',
      value: formatCurrency(summary.totalValue),
      color: 'text-green',
    },
    {
      label: 'Cost Basis',
      value: formatCurrency(summary.totalCostBasis),
      color: 'text-teal',
    },
    {
      label: 'Total Gain/Loss',
      value: `${summary.totalGainLoss >= 0 ? '+' : ''}${formatCurrency(summary.totalGainLoss)}`,
      color: summary.totalGainLoss >= 0 ? 'text-green' : 'text-debt-red',
    },
    {
      label: 'Return',
      value: `${summary.totalGainLossPercent >= 0 ? '+' : ''}${summary.totalGainLossPercent}%`,
      color: summary.totalGainLossPercent >= 0 ? 'text-green' : 'text-debt-red',
    },
  ];

  const intermediateMetrics = mode !== 'simple' ? [
    {
      label: 'Best Performer',
      value: summary.bestPerformer ? `${summary.bestPerformer.name?.slice(0, 12) || '—'}` : '—',
      color: 'text-green',
      sub: summary.bestPerformer ? `+${summary.bestPerformer.gainLossPercent}%` : '',
    },
    {
      label: 'Worst Performer',
      value: summary.worstPerformer ? `${summary.worstPerformer.name?.slice(0, 12) || '—'}` : '—',
      color: 'text-debt-red',
      sub: summary.worstPerformer ? `${summary.worstPerformer.gainLossPercent}%` : '',
    },
  ] : [];

  const metrics = [...baseMetrics, ...intermediateMetrics];

  const gridCols = metrics.length <= 4
    ? 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-4'
    : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6';

  return (
    <div className={`grid ${gridCols} gap-3 mx-4 mb-10`}>
      {metrics.map((m, i) => (
        <div
          key={i}
          className="bg-bg-card border border-border-subtle rounded-2xl p-4 backdrop-blur-xl hover:border-border-medium hover:bg-bg-card-hover transition-all text-center"
        >
          <p className="text-text-muted text-[11px] uppercase tracking-widest mb-2 font-medium">
            {m.label}
          </p>
          <AnimatedNumber
            value={m.value}
            className={`font-mono text-xl font-bold tabular-nums ${m.color}`}
          />
          {m.sub && (
            <p className={`text-xs mt-1 font-mono ${m.color}`}>{m.sub}</p>
          )}
        </div>
      ))}
    </div>
  );
}
