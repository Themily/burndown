import React, { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend,
} from 'recharts';
import {
  formatMonthsDuration, monthsToDate, round2,
} from '../utils/calculations';
import { useCurrency } from '../context/CurrencyContext';
import AnimatedNumber from './AnimatedNumber';

function CustomTooltip({ active, payload, label, formatCurrency }) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="bg-bg-card-solid border border-border-medium rounded-xl p-3 shadow-2xl backdrop-blur-xl">
      <div className="text-text-muted text-xs mb-2 font-mono">
        Month {label} · {monthsToDate(label)}
      </div>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
          <span className="text-text-secondary flex-1 text-xs">{entry.name}</span>
          <span className="font-mono text-xs tabular-nums text-text-primary">{formatCurrency(entry.value)}</span>
        </div>
      ))}
    </div>
  );
}

export default function FIREPanel({ fireInputs, setFireInputs, fireComparison, debts, payoffResult }) {
  const { formatCurrency, symbol } = useCurrency();
  if (debts.length === 0) return null;

  const { scenarioA, scenarioB, crossoverMonth, fiNumber, fireA_months, fireB_months, fireAcceleration, postDebtMonthlyInvestment } = fireComparison;

  // Merge scenarios into chart data
  const chartData = useMemo(() => {
    const maxLen = Math.max(scenarioA.length, scenarioB.length);
    const data = [];
    for (let i = 0; i < maxLen; i++) {
      const point = { month: i };
      if (i < scenarioA.length) point.minimums = scenarioA[i].netWorth;
      if (i < scenarioB.length) point.aggressive = scenarioB[i].netWorth;
      data.push(point);
    }
    // Sample if too long
    if (data.length > 150) {
      const step = Math.ceil(data.length / 150);
      return data.filter((_, i) => i % step === 0 || i === data.length - 1);
    }
    return data;
  }, [scenarioA, scenarioB]);

  const fiProgress = Math.min(100, (fireInputs.currentAssets / fiNumber) * 100);

  return (
    <div className="card mx-4 mb-10">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">🔥</span>
        <div>
          <h2 className="font-heading text-lg font-semibold">Post-Debt FIRE Acceleration</h2>
          <p className="text-text-muted text-xs">See how eliminating debt supercharges your path to financial independence</p>
        </div>
      </div>

      {/* FIRE Inputs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div>
          <label className="text-text-muted text-xs uppercase tracking-wider block mb-1">Invested Assets</label>
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted font-mono text-xs">{symbol}</span>
            <input
              type="number"
              value={fireInputs.currentAssets}
              onChange={(e) => setFireInputs({ ...fireInputs, currentAssets: parseFloat(e.target.value) || 0 })}
              className="!pl-6 !text-sm"
              min="0"
              step="1000"
              aria-label="Current invested assets"
            />
          </div>
        </div>
        <div>
          <label className="text-text-muted text-xs uppercase tracking-wider block mb-1">Annual Return</label>
          <div className="relative">
            <input
              type="number"
              value={fireInputs.annualReturn}
              onChange={(e) => setFireInputs({ ...fireInputs, annualReturn: parseFloat(e.target.value) || 0 })}
              className="!pr-6 !text-sm"
              min="0"
              max="30"
              step="0.5"
              aria-label="Expected annual return"
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted font-mono text-xs">%</span>
          </div>
        </div>
        <div>
          <label className="text-text-muted text-xs uppercase tracking-wider block mb-1">Annual Expenses</label>
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted font-mono text-xs">{symbol}</span>
            <input
              type="number"
              value={fireInputs.annualExpenses}
              onChange={(e) => setFireInputs({ ...fireInputs, annualExpenses: parseFloat(e.target.value) || 0 })}
              className="!pl-6 !text-sm"
              min="0"
              step="1000"
              aria-label="Annual expenses in retirement"
            />
          </div>
        </div>
        <div>
          <label className="text-text-muted text-xs uppercase tracking-wider block mb-1">Monthly Investment</label>
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted font-mono text-xs">{symbol}</span>
            <input
              type="number"
              value={fireInputs.monthlyInvestment}
              onChange={(e) => setFireInputs({ ...fireInputs, monthlyInvestment: parseFloat(e.target.value) || 0 })}
              className="!pl-6 !text-sm"
              min="0"
              step="50"
              aria-label="Monthly investment contribution"
            />
          </div>
        </div>
      </div>

      {/* FI Number and Progress */}
      <div className="bg-bg-elevated border border-border-subtle backdrop-blur-xl rounded-2xl p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <span className="text-text-muted text-xs uppercase tracking-wider">FI Number</span>
            <span className="text-text-muted text-xs ml-2">(25x annual expenses)</span>
          </div>
          <span className="font-mono text-lg font-bold text-teal tabular-nums">
            <AnimatedNumber value={formatCurrency(fiNumber)} />
          </span>
        </div>
        <div className="w-full bg-bg-primary rounded-full h-3 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-teal/80 to-teal transition-all duration-700 ease-out relative"
            style={{ width: `${fiProgress}%` }}
          >
            <div className="absolute right-0 top-0 bottom-0 w-2 bg-teal rounded-full pulse-glow" />
          </div>
        </div>
        <div className="flex justify-between mt-1.5 text-xs font-mono tabular-nums">
          <span className="text-text-muted">{formatCurrency(fireInputs.currentAssets)}</span>
          <span className="text-teal">{fiProgress.toFixed(1)}%</span>
        </div>
      </div>

      {/* FIRE Timeline Comparison */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-bg-elevated border border-border-subtle backdrop-blur-xl rounded-2xl p-4 text-center">
          <div className="text-text-muted text-xs uppercase tracking-wider mb-1">Minimum Payments Path</div>
          <div className="font-mono text-xl font-bold text-text-secondary tabular-nums">
            {isFinite(fireA_months) ? formatMonthsDuration(fireA_months) : 'N/A'}
          </div>
          <div className="text-text-muted text-xs">
            {isFinite(fireA_months) ? monthsToDate(fireA_months) : '—'}
          </div>
        </div>
        <div className="bg-bg-elevated border border-border-subtle backdrop-blur-xl rounded-2xl p-4 text-center border border-fire-start/30">
          <div className="text-text-muted text-xs uppercase tracking-wider mb-1">Aggressive Payoff Path</div>
          <div className="font-mono text-xl font-bold fire-text tabular-nums">
            {isFinite(fireB_months) ? formatMonthsDuration(fireB_months) : 'N/A'}
          </div>
          <div className="text-text-muted text-xs">
            {isFinite(fireB_months) ? monthsToDate(fireB_months) : '—'}
          </div>
          {isFinite(fireAcceleration) && fireAcceleration > 0 && (
            <div className="mt-1 text-green text-xs font-mono font-semibold">
              {Math.round(fireAcceleration)} months sooner!
            </div>
          )}
        </div>
      </div>

      {/* Post-debt investment info */}
      <div className="bg-green-dim rounded-2xl border border-green/10 p-3 mb-6 flex items-center gap-3">
        <span className="text-green text-lg">📈</span>
        <div className="text-xs text-text-secondary">
          After debt payoff, you'll invest <span className="text-green font-mono font-semibold">{formatCurrency(postDebtMonthlyInvestment)}/mo</span> — your current investment plus all freed debt payments.
        </div>
      </div>

      {/* Chart */}
      <div className="h-[300px] md:h-[350px]">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis
              dataKey="month"
              tick={{ fill: '#6b7280', fontSize: 11, fontFamily: 'JetBrains Mono' }}
              tickLine={false}
              axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
              tickFormatter={(v) => `${Math.round(v / 12)}y`}
            />
            <YAxis
              tick={{ fill: '#6b7280', fontSize: 11, fontFamily: 'JetBrains Mono' }}
              tickLine={false}
              axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
              tickFormatter={(v) => `${symbol}${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip formatCurrency={formatCurrency} />} />
            <ReferenceLine
              y={fiNumber}
              stroke="#2DD4BF"
              strokeDasharray="6 3"
              strokeOpacity={0.5}
              label={{
                value: `FI: ${formatCurrency(fiNumber)}`,
                position: 'right',
                fill: '#2DD4BF',
                fontSize: 10,
                fontFamily: 'JetBrains Mono',
              }}
            />
            {crossoverMonth && (
              <ReferenceLine
                x={crossoverMonth}
                stroke="#F59E0B"
                strokeDasharray="4 4"
                strokeOpacity={0.4}
                label={{
                  value: 'Crossover',
                  position: 'top',
                  fill: '#F59E0B',
                  fontSize: 10,
                  fontFamily: 'JetBrains Mono',
                }}
              />
            )}
            <Line
              type="monotone"
              dataKey="minimums"
              name="Minimum Payments"
              stroke="#6b7280"
              strokeWidth={2}
              dot={false}
              strokeDasharray="6 3"
              animationDuration={800}
            />
            <Line
              type="monotone"
              dataKey="aggressive"
              name="Aggressive Payoff"
              stroke="#FF6B35"
              strokeWidth={2.5}
              dot={false}
              animationDuration={800}
            />
            <Legend
              wrapperStyle={{ fontSize: 11, fontFamily: 'JetBrains Mono' }}
              iconType="line"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
