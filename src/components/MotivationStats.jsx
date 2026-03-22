import React from 'react';
import {
  formatMonthsDuration,
  monthsToDate,
  lifetimeWealthImpact,
} from '../utils/calculations';
import { useCurrency } from '../context/CurrencyContext';
import AnimatedNumber from './AnimatedNumber';

export default function MotivationStats({
  debts,
  payoffResult,
  minimumOnlyResult,
  extraPayment,
  fireInputs,
  fireComparison,
}) {
  const { formatCurrency } = useCurrency();

  if (debts.length === 0) return null;

  const totalMinPayments = debts.reduce((sum, d) => sum + d.minPayment, 0);
  const freedMonthly = totalMinPayments + extraPayment;
  const wealthImpact = lifetimeWealthImpact(freedMonthly, fireInputs.annualReturn, 20);
  const interestSaved = minimumOnlyResult.totalInterest - payoffResult.totalInterest;
  const monthsAccelerated = minimumOnlyResult.months - payoffResult.months;

  const debtFreeDate = monthsToDate(payoffResult.months);
  const now = new Date();
  const targetDate = new Date(now.getFullYear(), now.getMonth() + payoffResult.months, 1);
  const daysUntil = Math.max(0, Math.ceil((targetDate - now) / (1000 * 60 * 60 * 24)));

  const fireAccel = fireComparison?.fireAcceleration;

  return (
    <div className="space-y-4 h-full">
      {/* Countdown — hero card with gradient border */}
      <div className="card text-center relative overflow-hidden">
        {/* Subtle top glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-gradient-to-b from-purple/5 to-transparent pointer-events-none" />
        <div className="relative">
          <div className="text-text-muted text-[11px] uppercase tracking-widest mb-3 font-medium">Debt-Free Countdown</div>
          <div className="font-mono text-4xl font-bold fire-text tabular-nums mb-2">
            <AnimatedNumber value={formatMonthsDuration(payoffResult.months)} />
          </div>
          <div className="text-text-secondary text-base font-medium">{debtFreeDate}</div>
          <div className="text-text-muted text-sm mt-1">{daysUntil.toLocaleString()} days to go</div>
        </div>
      </div>

      {/* Lifetime Wealth Impact */}
      <div className="card text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-gradient-to-b from-teal/5 to-transparent pointer-events-none" />
        <div className="relative">
          <div className="text-text-muted text-[11px] uppercase tracking-widest mb-3 font-medium">
            Lifetime Wealth Impact
          </div>
          <div className="font-mono text-4xl font-bold text-teal tabular-nums mb-2">
            <AnimatedNumber value={formatCurrency(wealthImpact)} />
          </div>
          <p className="text-text-muted text-sm leading-relaxed">
            {formatCurrency(freedMonthly)}/mo invested at {fireInputs.annualReturn}% over 20 years
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="card">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-text-secondary text-sm">Interest Saved</span>
            <span className="font-mono text-base font-bold text-green tabular-nums">
              <AnimatedNumber value={formatCurrency(Math.max(0, interestSaved))} />
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-text-secondary text-sm">Months Accelerated</span>
            <span className="font-mono text-base font-bold text-amber tabular-nums">
              <AnimatedNumber value={`${Math.max(0, monthsAccelerated)} mo`} />
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-text-secondary text-sm">Total Interest Paid</span>
            <span className="font-mono text-base font-bold text-debt-red tabular-nums">
              <AnimatedNumber value={formatCurrency(payoffResult.totalInterest)} />
            </span>
          </div>
          {fireAccel != null && isFinite(fireAccel) && fireAccel > 0 && (
            <div className="flex justify-between items-center pt-3 border-t border-border-subtle">
              <span className="text-text-secondary text-sm">FIRE Acceleration</span>
              <span className="font-mono text-base font-bold fire-text tabular-nums">
                <AnimatedNumber value={`${Math.round(fireAccel)} mo sooner`} />
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
