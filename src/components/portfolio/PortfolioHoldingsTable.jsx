import React, { useState } from 'react';
import { useCurrency } from '../../context/CurrencyContext';

export default function PortfolioHoldingsTable({ holdingDetails, mode }) {
  const { formatCurrencyExact } = useCurrency();
  const [showAll, setShowAll] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState('asc');

  if (!holdingDetails || holdingDetails.length === 0) return null;

  const handleSort = (col) => {
    if (sortBy === col) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setSortDir('asc');
    }
  };

  const sorted = [...holdingDetails].sort((a, b) => {
    let valA, valB;
    switch (sortBy) {
      case 'name': valA = a.name; valB = b.name; break;
      case 'value': valA = a.currentValue; valB = b.currentValue; break;
      case 'gainLoss': valA = a.gainLoss; valB = b.gainLoss; break;
      case 'gainLossPercent': valA = a.gainLossPercent; valB = b.gainLossPercent; break;
      default: valA = a.name; valB = b.name;
    }
    if (typeof valA === 'string') return sortDir === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    return sortDir === 'asc' ? valA - valB : valB - valA;
  });

  const visible = showAll ? sorted : sorted.slice(0, 5);

  const SortIcon = ({ col }) => (
    <span className="ml-1 text-[10px]">
      {sortBy === col ? (sortDir === 'asc' ? '▲' : '▼') : ''}
    </span>
  );

  return (
    <div className="card mx-4 mb-10 overflow-hidden">
      <h2 className="section-accent font-heading text-lg font-bold text-text-primary mb-6">
        Holdings Detail
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-medium">
              <th className="text-left text-text-muted text-[10px] uppercase tracking-widest pb-3 cursor-pointer hover:text-text-secondary" onClick={() => handleSort('name')}>
                Name <SortIcon col="name" />
              </th>
              <th className="text-left text-text-muted text-[10px] uppercase tracking-widest pb-3">Ticker</th>
              <th className="text-left text-text-muted text-[10px] uppercase tracking-widest pb-3">Class</th>
              <th className="text-right text-text-muted text-[10px] uppercase tracking-widest pb-3">Qty</th>
              <th className="text-right text-text-muted text-[10px] uppercase tracking-widest pb-3">Cost Basis</th>
              <th className="text-right text-text-muted text-[10px] uppercase tracking-widest pb-3 cursor-pointer hover:text-text-secondary" onClick={() => handleSort('value')}>
                Value <SortIcon col="value" />
              </th>
              <th className="text-right text-text-muted text-[10px] uppercase tracking-widest pb-3 cursor-pointer hover:text-text-secondary" onClick={() => handleSort('gainLoss')}>
                Gain/Loss <SortIcon col="gainLoss" />
              </th>
              <th className="text-right text-text-muted text-[10px] uppercase tracking-widest pb-3 cursor-pointer hover:text-text-secondary" onClick={() => handleSort('gainLossPercent')}>
                Return <SortIcon col="gainLossPercent" />
              </th>
            </tr>
          </thead>
          <tbody>
            {visible.map((h, i) => (
              <tr
                key={h.id}
                className={`border-b border-border-subtle hover:bg-bg-card-hover transition-colors ${
                  i % 2 !== 0 ? 'bg-bg-elevated/30' : ''
                }`}
              >
                <td className="py-3 pr-4 text-text-primary font-medium">{h.name || '—'}</td>
                <td className="py-3 pr-4 text-text-muted font-mono text-xs">{h.ticker || '—'}</td>
                <td className="py-3 pr-4 text-text-muted text-xs capitalize">{h.assetClass}</td>
                <td className="py-3 pr-4 text-right text-text-secondary font-mono tabular-nums">{h.quantity}</td>
                <td className="py-3 pr-4 text-right text-text-secondary font-mono tabular-nums">
                  {formatCurrencyExact(h.costBasis)}
                </td>
                <td className="py-3 pr-4 text-right text-text-primary font-mono font-semibold tabular-nums">
                  {formatCurrencyExact(h.currentValue)}
                </td>
                <td className={`py-3 pr-4 text-right font-mono font-semibold tabular-nums ${
                  h.gainLoss >= 0 ? 'text-green' : 'text-debt-red'
                }`}>
                  {h.gainLoss >= 0 ? '+' : ''}{formatCurrencyExact(h.gainLoss)}
                </td>
                <td className={`py-3 text-right font-mono font-semibold tabular-nums ${
                  h.gainLossPercent >= 0 ? 'text-green' : 'text-debt-red'
                }`}>
                  {h.gainLossPercent >= 0 ? '+' : ''}{h.gainLossPercent}%
                </td>
              </tr>
            ))}
          </tbody>
          {showAll && holdingDetails.length > 1 && (
            <tfoot>
              <tr className="border-t-2 border-border-medium bg-bg-elevated/50">
                <td colSpan={5} className="py-3 text-text-secondary font-bold">Total</td>
                <td className="py-3 text-right text-text-primary font-mono font-bold tabular-nums">
                  {formatCurrencyExact(holdingDetails.reduce((s, h) => s + h.currentValue, 0))}
                </td>
                <td className={`py-3 text-right font-mono font-bold tabular-nums ${
                  holdingDetails.reduce((s, h) => s + h.gainLoss, 0) >= 0 ? 'text-green' : 'text-debt-red'
                }`}>
                  {formatCurrencyExact(holdingDetails.reduce((s, h) => s + h.gainLoss, 0))}
                </td>
                <td className="py-3"></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {holdingDetails.length > 5 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-4 w-full py-2.5 text-sm font-medium text-teal border border-teal/30 rounded-xl hover:bg-teal/10 transition-all"
        >
          {showAll ? 'Show Less' : `Show All ${holdingDetails.length} Holdings`}
        </button>
      )}
    </div>
  );
}
