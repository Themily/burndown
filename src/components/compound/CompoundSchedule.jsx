import React, { useState } from 'react';
import { useCurrency } from '../../context/CurrencyContext';

export default function CompoundSchedule({ result, mode }) {
  const { formatCurrency } = useCurrency();
  const [showAll, setShowAll] = useState(false);
  const { yearlyData } = result;

  if (!yearlyData || yearlyData.length === 0) return null;

  const displayData = showAll ? yearlyData : yearlyData.slice(0, 5);
  const hasMore = yearlyData.length > 5;

  return (
    <div className="card mx-4 mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading text-lg font-semibold section-accent">Year-by-Year Breakdown</h2>
        <span className="text-text-muted text-xs font-mono">{yearlyData.length} years</span>
      </div>

      <div className="overflow-x-auto -mx-4 px-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-medium">
              <th className="text-left py-3 px-3 text-text-muted text-xs uppercase tracking-wider font-semibold">Year</th>
              <th className="text-right py-3 px-3 text-text-muted text-xs uppercase tracking-wider font-semibold">Starting</th>
              <th className="text-right py-3 px-3 text-text-muted text-xs uppercase tracking-wider font-semibold">Contributions</th>
              <th className="text-right py-3 px-3 text-text-muted text-xs uppercase tracking-wider font-semibold">Interest</th>
              <th className="text-right py-3 px-3 text-text-muted text-xs uppercase tracking-wider font-semibold">Ending Balance</th>
              {mode === 'advanced' && (
                <th className="text-right py-3 px-3 text-text-muted text-xs uppercase tracking-wider font-semibold">Inflation-Adj.</th>
              )}
            </tr>
          </thead>
          <tbody>
            {displayData.map((yd, i) => (
              <tr
                key={yd.year}
                className={`border-b border-border-subtle transition-colors hover:bg-bg-card-hover ${i % 2 === 0 ? '' : 'bg-bg-elevated/30'}`}
              >
                <td className="py-3 px-3 font-mono text-text-secondary font-medium">{yd.year}</td>
                <td className="py-3 px-3 font-mono text-right text-text-secondary tabular-nums">{formatCurrency(yd.startingBalance)}</td>
                <td className="py-3 px-3 font-mono text-right text-purple tabular-nums">{formatCurrency(yd.contributions)}</td>
                <td className="py-3 px-3 font-mono text-right text-teal tabular-nums">{formatCurrency(yd.interestEarned)}</td>
                <td className="py-3 px-3 font-mono text-right text-green font-semibold tabular-nums">{formatCurrency(yd.endingBalance)}</td>
                {mode === 'advanced' && (
                  <td className="py-3 px-3 font-mono text-right text-text-muted tabular-nums">{formatCurrency(yd.inflationAdjustedBalance)}</td>
                )}
              </tr>
            ))}
          </tbody>
          {/* Totals row */}
          {showAll && (
            <tfoot>
              <tr className="border-t-2 border-border-medium bg-bg-elevated/50">
                <td className="py-3 px-3 font-semibold text-text-primary">Total</td>
                <td className="py-3 px-3" />
                <td className="py-3 px-3 font-mono text-right text-purple font-bold tabular-nums">{formatCurrency(yearlyData.reduce((sum, yd) => sum + yd.contributions, 0))}</td>
                <td className="py-3 px-3 font-mono text-right text-teal font-bold tabular-nums">{formatCurrency(result.totalInterest)}</td>
                <td className="py-3 px-3 font-mono text-right text-green font-bold tabular-nums">{formatCurrency(result.finalBalance)}</td>
                {mode === 'advanced' && (
                  <td className="py-3 px-3 font-mono text-right text-text-muted font-bold tabular-nums">{formatCurrency(result.inflationAdjusted)}</td>
                )}
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {hasMore && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-4 w-full py-2.5 text-sm font-medium text-purple border border-purple/30 rounded-xl hover:bg-purple/10 transition-all"
        >
          {showAll ? 'Show Less' : `Show All ${yearlyData.length} Years`}
        </button>
      )}
    </div>
  );
}
