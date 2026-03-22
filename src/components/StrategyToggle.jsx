import React from 'react';
import { formatMonthsDuration } from '../utils/calculations';
import { useCurrency } from '../context/CurrencyContext';

export default function StrategyToggle({ strategy, setStrategy, snowballResult, avalancheResult }) {
  const { formatCurrency } = useCurrency();
  const diff = {
    interest: snowballResult.totalInterest - avalancheResult.totalInterest,
    months: snowballResult.months - avalancheResult.months,
  };

  return (
    <div className="card">
      <h2 className="font-heading text-xl font-semibold mb-5">Payoff Strategy</h2>

      <div className="grid grid-cols-2 gap-4 mb-5">
        {/* Snowball */}
        <button
          onClick={() => setStrategy('snowball')}
          className={`p-6 rounded-2xl border text-left transition-all backdrop-blur-xl ${
            strategy === 'snowball'
              ? 'strategy-active'
              : 'border-border-subtle hover:border-border-medium bg-bg-card'
          }`}
          aria-pressed={strategy === 'snowball'}
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">⛏️</span>
            <div>
              <div className="font-bold text-lg">Snowball</div>
              <div className="text-text-muted text-sm">Smallest balance first</div>
            </div>
          </div>
          <div className="border-t border-border-subtle pt-4 mt-2 space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-text-muted text-sm uppercase tracking-wide">Interest</span>
              <span className="font-mono font-bold text-xl text-debt-red tabular-nums">
                {formatCurrency(snowballResult.totalInterest)}
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-text-muted text-sm uppercase tracking-wide">Duration</span>
              <span className="font-mono font-semibold text-xl text-text-primary tabular-nums">
                {formatMonthsDuration(snowballResult.months)}
              </span>
            </div>
          </div>
        </button>

        {/* Avalanche */}
        <button
          onClick={() => setStrategy('avalanche')}
          className={`p-6 rounded-2xl border text-left transition-all backdrop-blur-xl ${
            strategy === 'avalanche'
              ? 'strategy-active'
              : 'border-border-subtle hover:border-border-medium bg-bg-card'
          }`}
          aria-pressed={strategy === 'avalanche'}
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">🏔️</span>
            <div>
              <div className="font-bold text-lg">Avalanche</div>
              <div className="text-text-muted text-sm">Highest interest first</div>
            </div>
          </div>
          <div className="border-t border-border-subtle pt-4 mt-2 space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-text-muted text-sm uppercase tracking-wide">Interest</span>
              <span className="font-mono font-bold text-xl text-debt-red tabular-nums">
                {formatCurrency(avalancheResult.totalInterest)}
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-text-muted text-sm uppercase tracking-wide">Duration</span>
              <span className="font-mono font-semibold text-xl text-text-primary tabular-nums">
                {formatMonthsDuration(avalancheResult.months)}
              </span>
            </div>
          </div>
        </button>
      </div>

      {diff.interest !== 0 && (
        <div className="bg-bg-elevated rounded-2xl p-5 space-y-2 border border-border-subtle backdrop-blur-xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-base text-text-secondary">Avalanche saves</span>
            <span className="font-mono font-bold text-amber text-base">{formatCurrency(Math.abs(diff.interest))}</span>
            <span className="text-base text-text-secondary">in interest</span>
            {diff.months !== 0 && (
              <>
                <span className="text-base text-text-secondary">and</span>
                <span className="font-mono font-bold text-green text-base">{Math.abs(diff.months)} month{Math.abs(diff.months) !== 1 ? 's' : ''}</span>
              </>
            )}
          </div>
          <p className="text-text-muted text-sm italic leading-relaxed">
            Snowball wins on momentum. Avalanche wins on math. Both win over doing nothing.
          </p>
        </div>
      )}
    </div>
  );
}
