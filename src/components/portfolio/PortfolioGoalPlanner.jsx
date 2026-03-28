import React, { useState } from 'react';
import { useCurrency } from '../../context/CurrencyContext';
import DatePicker from './DatePicker';

export default function PortfolioGoalPlanner({ goal, setGoal, goalProgress }) {
  const { formatCurrency, symbol } = useCurrency();

  const formatCompact = (val) => {
    const abs = Math.abs(val);
    if (abs >= 1e12)            return `${symbol}${(val / 1e12).toFixed(1)}T`;
    if (abs >= 1e9)             return `${symbol}${(val / 1e9).toFixed(1)}B`;
    if (abs >= 1e6)             return `${symbol}${(val / 1e6).toFixed(1)}M`;
    if (abs >= 1e5)             return `${symbol}${(val / 1e3).toFixed(0)}k`;
    return formatCurrency(val);
  };

  const handleChange = (field, value) => {
    setGoal(prev => ({ ...prev, [field]: value }));
  };

  const todayStr = new Date().toISOString().slice(0, 10);
  const [dateError, setDateError] = useState('');

  if (!goalProgress) return null;

  return (
    <div className="card mx-4 mb-10">
      <h2 className="section-accent font-heading text-lg font-bold text-text-primary mb-6">
        Goal Planner
      </h2>

      {/* Goal inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div>
          <label className="text-text-muted text-[10px] uppercase tracking-wider block mb-1">
            Target Value ({symbol})
          </label>
          <input
            type="number"
            value={goal.targetValue || ''}
            onChange={(e) => handleChange('targetValue', Math.max(0, parseFloat(e.target.value) || 0))}
            min="0"
            className="!text-sm"
          />
        </div>
        <div>
          <label className="text-text-muted text-[10px] uppercase tracking-wider block mb-1">Target Date</label>
          <DatePicker
            value={goal.targetDate || ''}
            onChange={(val) => {
              if (val && val < todayStr) {
                setDateError('Target date must be in the future');
                return;
              }
              setDateError('');
              handleChange('targetDate', val);
            }}
            minDate={todayStr}
            error={dateError}
          />
        </div>
        <div>
          <label className="text-text-muted text-[10px] uppercase tracking-wider block mb-1">
            Monthly Contribution ({symbol})
          </label>
          <input
            type="number"
            value={goal.monthlyContribution || ''}
            onChange={(e) => handleChange('monthlyContribution', Math.max(0, parseFloat(e.target.value) || 0))}
            min="0"
            className="!text-sm"
          />
        </div>
      </div>

      {/* Progress visualization */}
      <div className="bg-bg-elevated border border-border-subtle rounded-xl p-6">
        {!goal.targetValue ? (
          <p className="text-text-muted text-sm text-center py-4">
            Enter a target value above to track your progress
          </p>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3">
              <span className="text-text-secondary text-sm">Progress toward {formatCompact(goal.targetValue)}</span>
              <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                goalProgress.onTrack
                  ? 'bg-green-dim text-green'
                  : 'bg-amber-dim text-amber'
              }`}>
                {goalProgress.currentProgress >= 100 ? 'Goal Reached!' :
                 goalProgress.onTrack ? 'On Track' : 'Behind Schedule'}
              </span>
            </div>

            {/* Progress bar */}
            <div className="relative h-4 bg-bg-primary rounded-full overflow-hidden mb-4">
              <div
                className="h-full rounded-full bg-gradient-to-r from-teal to-green transition-all duration-700"
                style={{ width: `${Math.min(100, goalProgress.currentProgress)}%` }}
              />
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono font-bold text-text-primary">
                {goalProgress.currentProgress.toFixed(1)}%
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-text-muted text-[10px] uppercase tracking-wider mb-1">Months Remaining</p>
                <p className="text-text-primary font-mono font-bold tabular-nums">
                  {goalProgress.monthsRemaining}
                </p>
              </div>
              <div>
                <p className="text-text-muted text-[10px] uppercase tracking-wider mb-1">Monthly Needed</p>
                <p className="text-teal font-mono font-bold tabular-nums">
                  {formatCompact(goalProgress.monthlyNeeded)}/mo
                </p>
              </div>
              <div>
                <p className="text-text-muted text-[10px] uppercase tracking-wider mb-1">Your Contribution</p>
                <p className={`font-mono font-bold tabular-nums ${
                  goal.monthlyContribution >= goalProgress.monthlyNeeded ? 'text-green' : 'text-amber'
                }`}>
                  {formatCompact(goal.monthlyContribution)}/mo
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
