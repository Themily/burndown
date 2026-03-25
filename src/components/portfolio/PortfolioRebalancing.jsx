import React from 'react';
import { useCurrency } from '../../context/CurrencyContext';
import { ASSET_CLASSES } from '../../utils/portfolioCalculations';

export default function PortfolioRebalancing({ rebalancing, targetAllocations, setTargetAllocations }) {
  const { formatCurrency } = useCurrency();

  if (!rebalancing) return null;

  const totalTarget = Object.values(targetAllocations || {}).reduce((s, v) => s + (v || 0), 0);
  const isValid = Math.abs(totalTarget - 100) < 0.1;

  const handleTargetChange = (assetClass, value) => {
    setTargetAllocations(prev => ({
      ...prev,
      [assetClass]: parseFloat(value) || 0,
    }));
  };

  return (
    <div className="card mx-4 mb-10">
      <h2 className="section-accent font-heading text-lg font-bold text-text-primary mb-6">
        Rebalancing
      </h2>

      {/* Target allocation inputs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {ASSET_CLASSES.map(ac => (
          <div key={ac.value} className="bg-bg-elevated border border-border-subtle rounded-xl p-3">
            <label className="text-text-muted text-[10px] uppercase tracking-wider block mb-1">
              {ac.icon} {ac.label}
            </label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={targetAllocations[ac.value] || 0}
                onChange={(e) => handleTargetChange(ac.value, e.target.value)}
                min="0"
                max="100"
                step="1"
                className="!text-sm !p-2"
              />
              <span className="text-text-muted text-sm">%</span>
            </div>
          </div>
        ))}
      </div>

      <div className={`text-xs mb-4 font-mono ${isValid ? 'text-green' : 'text-amber'}`}>
        Total: {totalTarget.toFixed(1)}% {isValid ? '✓' : '(must equal 100%)'}
      </div>

      {/* Recommendations table */}
      {isValid && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-medium">
                <th className="text-left text-text-muted text-[10px] uppercase tracking-widest pb-3">Asset Class</th>
                <th className="text-right text-text-muted text-[10px] uppercase tracking-widest pb-3">Current %</th>
                <th className="text-right text-text-muted text-[10px] uppercase tracking-widest pb-3">Target %</th>
                <th className="text-right text-text-muted text-[10px] uppercase tracking-widest pb-3">Difference</th>
                <th className="text-right text-text-muted text-[10px] uppercase tracking-widest pb-3">Action</th>
                <th className="text-right text-text-muted text-[10px] uppercase tracking-widest pb-3">Amount</th>
              </tr>
            </thead>
            <tbody>
              {rebalancing.map((r, i) => {
                if (r.currentPercent === 0 && r.targetPercent === 0) return null;
                return (
                  <tr key={r.assetClass} className={`border-b border-border-subtle hover:bg-bg-card-hover transition-colors ${i % 2 !== 0 ? 'bg-bg-elevated/30' : ''}`}>
                    <td className="py-3 text-text-primary font-medium">
                      {r.icon} {r.label}
                    </td>
                    <td className="py-3 text-right font-mono tabular-nums text-text-secondary">
                      {r.currentPercent}%
                    </td>
                    <td className="py-3 text-right font-mono tabular-nums text-teal">
                      {r.targetPercent}%
                    </td>
                    <td className={`py-3 text-right font-mono tabular-nums ${
                      r.difference > 0.5 ? 'text-amber' : r.difference < -0.5 ? 'text-teal' : 'text-text-muted'
                    }`}>
                      {r.difference > 0 ? '+' : ''}{r.difference}%
                    </td>
                    <td className="py-3 text-right">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        r.suggestedTrade === 'Buy' ? 'bg-green-dim text-green' :
                        r.suggestedTrade === 'Sell' ? 'bg-red-dim text-debt-red' :
                        'bg-bg-elevated text-text-muted'
                      }`}>
                        {r.suggestedTrade}
                      </span>
                    </td>
                    <td className="py-3 text-right font-mono tabular-nums text-text-primary">
                      {r.tradeAmount > 0 ? formatCurrency(r.tradeAmount) : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
