import React from 'react';
import { useCurrency } from '../../context/CurrencyContext';

export default function PortfolioGoalPlanner({ goal, setGoal, goalProgress }) {
  const { formatCurrency, symbol } = useCurrency();

  const handleChange = (field, value) => {
    setGoal(prev => ({ ...prev, [field]: value }));
  };

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
            onChange={(e) => handleChange('targetValue', parseFloat(e.target.value) || 0)}
            min="0"
            className="!text-sm"
          />
        </div>
        <div>
          <label className="text-text-muted text-[10px] uppercase tracking-wider block mb-1">Target Date</label>
          <input
            type="date"
            value={goal.targetDate || ''}
            onChange={(e) => handleChange('targetDate', e.target.value)}
            className="!text-sm"
          />
        </div>
        <div>
          <label className="text-text-muted text-[10px] uppercase tracking-wider block mb-1">
            Monthly Contribution ({symbol})
          </label>
          <input
            type="number"
            value={goal.monthlyContribution || ''}
            onChange={(e) => handleChange('monthlyContribution', parseFloat(e.target.value) || 0)}
            min="0"
            className="!text-sm"
          />
        </div>
      </div>

      {/* Progress visualization */}
      <div className="bg-bg-elevated border border-border-subtle rounded-xl p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-text-secondary text-sm">Progress toward {formatCurrency(goal.targetValue)}</span>
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
              {formatCurrency(goalProgress.monthlyNeeded)}/mo
            </p>
          </div>
          <div>
            <p className="text-text-muted text-[10px] uppercase tracking-wider mb-1">Your Contribution</p>
            <p className={`font-mono font-bold tabular-nums ${
              goal.monthlyContribution >= goalProgress.monthlyNeeded ? 'text-green' : 'text-amber'
            }`}>
              {formatCurrency(goal.monthlyContribution)}/mo
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
