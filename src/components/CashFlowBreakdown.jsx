import React from 'react';
import { round2 } from '../utils/calculations';
import { useCurrency } from '../context/CurrencyContext';
import AnimatedNumber from './AnimatedNumber';

export default function CashFlowBreakdown({ debts, extraPayment, fireInputs, setFireInputs }) {
  const { formatCurrency, symbol } = useCurrency();
  const totalMinPayments = debts.reduce((sum, d) => sum + d.minPayment, 0);
  const totalDebtPayments = totalMinPayments + extraPayment;
  const { monthlyIncome, monthlyInvestment } = fireInputs;
  const remaining = monthlyIncome - totalDebtPayments - monthlyInvestment;
  const savingsRate = monthlyIncome > 0
    ? round2((monthlyInvestment / monthlyIncome) * 100)
    : 0;

  const items = [
    { label: 'Debt Minimum Payments', amount: totalMinPayments, color: 'bg-debt-red' },
    { label: 'Extra Snowball Payment', amount: extraPayment, color: 'bg-amber' },
    { label: 'Investments', amount: monthlyInvestment, color: 'bg-teal' },
    { label: 'Remaining (Expenses/Savings)', amount: Math.max(0, remaining), color: 'bg-text-muted' },
  ];

  const total = totalMinPayments + extraPayment + monthlyInvestment + Math.max(0, remaining);

  return (
    <div className="card mx-4 mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading text-lg font-semibold">Monthly Cash Flow</h2>
        <div className="flex items-center gap-2">
          <span className="text-text-muted text-xs uppercase tracking-wider">Savings Rate</span>
          <span className="font-mono text-xl font-bold fire-text tabular-nums">
            <AnimatedNumber value={`${savingsRate.toFixed(1)}%`} />
          </span>
        </div>
      </div>

      <div className="mb-4">
        <label className="text-text-muted text-xs uppercase tracking-wider block mb-1">Monthly Income</label>
        <div className="relative max-w-xs">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted font-mono text-xs">{symbol}</span>
          <input
            type="number"
            value={fireInputs.monthlyIncome}
            onChange={(e) => setFireInputs({ ...fireInputs, monthlyIncome: parseFloat(e.target.value) || 0 })}
            className="!pl-6 !text-sm"
            min="0"
            step="100"
            aria-label="Monthly income"
          />
        </div>
      </div>

      {/* Stacked bar */}
      <div className="w-full h-7 rounded-full overflow-hidden flex mb-4 bg-bg-secondary border border-border-subtle">
        {items.map((item, i) => {
          const pct = total > 0 ? (item.amount / total) * 100 : 0;
          if (pct <= 0) return null;
          return (
            <div
              key={i}
              className={`${item.color} transition-all duration-500 first:rounded-l-full last:rounded-r-full`}
              style={{ width: `${pct}%` }}
              title={`${item.label}: ${formatCurrency(item.amount)}`}
            />
          );
        })}
      </div>

      {/* Breakdown */}
      <div className="space-y-2.5">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${item.color} flex-shrink-0`} />
            <span className="text-text-secondary text-sm flex-1">{item.label}</span>
            <span className="font-mono text-sm tabular-nums text-text-primary">
              {formatCurrency(item.amount)}
            </span>
            <span className="font-mono text-xs tabular-nums text-text-muted w-12 text-right">
              {total > 0 ? `${((item.amount / total) * 100).toFixed(0)}%` : '0%'}
            </span>
          </div>
        ))}
        {remaining < 0 && (
          <div className="bg-red-dim rounded-2xl p-3 flex items-center gap-2 mt-2 border border-debt-red/10">
            <span className="text-debt-red text-sm">⚠️</span>
            <span className="text-debt-red text-xs">
              Your payments exceed income by {formatCurrency(Math.abs(remaining))}. Consider adjusting your snowball amount.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
