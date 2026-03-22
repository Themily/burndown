import React from 'react';
import { formatPercent, weightedAvgRate, formatMonthsDuration, monthsToDate } from '../utils/calculations';
import { useCurrency } from '../context/CurrencyContext';
import AnimatedNumber from './AnimatedNumber';

export default function SummaryBar({ debts, payoffResult, minimumOnlyResult }) {
  const { formatCurrency } = useCurrency();
  const totalBalance = debts.reduce((sum, d) => sum + d.balance, 0);
  const avgRate = weightedAvgRate(debts);
  const totalMinPayments = debts.reduce((sum, d) => sum + d.minPayment, 0);
  const interestSaved = minimumOnlyResult.totalInterest - payoffResult.totalInterest;

  const stats = [
    { label: 'Total Debt', value: formatCurrency(totalBalance), color: 'text-debt-red' },
    { label: 'Avg Interest Rate', value: formatPercent(avgRate), color: 'text-amber' },
    { label: 'Monthly Payments', value: formatCurrency(totalMinPayments), color: 'text-text-primary' },
    { label: 'Debt-Free Date', value: payoffResult.months > 0 ? monthsToDate(payoffResult.months) : 'Now!', color: 'text-green' },
    { label: 'Interest Saved', value: formatCurrency(Math.max(0, interestSaved)), color: 'text-teal' },
  ];

  if (debts.length === 0) return null;

  return (
    <div className="mx-4 mb-10">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
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
