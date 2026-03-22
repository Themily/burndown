import React, { useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, ReferenceDot,
} from 'recharts';
import { getDebtColor, monthsToDate, formatMonthsDuration } from '../utils/calculations';
import { useCurrency } from '../context/CurrencyContext';

function CustomTooltip({ active, payload, label, formatCurrency }) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="bg-bg-card-solid border border-border-medium rounded-xl p-3 shadow-2xl backdrop-blur-xl">
      <div className="text-text-muted text-xs mb-2 font-mono">
        Month {label} · {monthsToDate(label)}
      </div>
      {payload
        .filter(p => p.value > 0)
        .sort((a, b) => b.value - a.value)
        .map((entry, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <div
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-text-secondary flex-1 truncate text-xs">{entry.name}</span>
            <span className="font-mono text-xs tabular-nums text-text-primary">
              {formatCurrency(entry.value)}
            </span>
          </div>
        ))}
      <div className="border-t border-border-subtle mt-2 pt-2 flex justify-between text-xs">
        <span className="text-text-muted">Total</span>
        <span className="font-mono font-semibold tabular-nums">
          {formatCurrency(payload.reduce((sum, p) => sum + (p.value || 0), 0))}
        </span>
      </div>
    </div>
  );
}

export default function PayoffTimeline({ debts, payoffResult }) {
  const { formatCurrency, symbol } = useCurrency();
  const { monthlyData, milestones, debtOrder } = payoffResult;

  const chartData = useMemo(() => {
    if (!monthlyData || monthlyData.length === 0) return [];
    // Sample data if too many months
    if (monthlyData.length > 120) {
      const step = Math.ceil(monthlyData.length / 120);
      return monthlyData.filter((_, i) => i % step === 0 || i === monthlyData.length - 1);
    }
    return monthlyData;
  }, [monthlyData]);

  if (debts.length === 0 || chartData.length === 0) return null;

  // Build areas in reverse order (largest at bottom for stacking)
  const orderedDebts = debtOrder ? [...debtOrder].reverse() : [...debts].reverse();

  return (
    <div className="card mx-4 mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading text-lg font-semibold">Payoff Timeline</h2>
        <div className="flex gap-3">
          {milestones.map((m, i) => (
            <span key={i} className="text-xs text-text-muted font-mono">
              {'🔥'.repeat(m.index)} Mo {m.month}
            </span>
          ))}
        </div>
      </div>
      <div className="h-[350px] md:h-[400px]">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
            <defs>
              {orderedDebts.map((debt, i) => {
                const color = getDebtColor(i);
                return (
                  <linearGradient key={debt.id} id={`grad-${debt.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.6} />
                    <stop offset="100%" stopColor={color} stopOpacity={0.05} />
                  </linearGradient>
                );
              })}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis
              dataKey="month"
              tick={{ fill: '#6b7280', fontSize: 11, fontFamily: 'JetBrains Mono' }}
              tickLine={false}
              axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
              tickFormatter={(v) => `${v}m`}
            />
            <YAxis
              tick={{ fill: '#6b7280', fontSize: 11, fontFamily: 'JetBrains Mono' }}
              tickLine={false}
              axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
              tickFormatter={(v) => `${symbol}${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip formatCurrency={formatCurrency} />} />
            {orderedDebts.map((debt, i) => (
              <Area
                key={debt.id}
                type="monotone"
                dataKey={debt.id}
                name={debt.name}
                stackId="debts"
                fill={`url(#grad-${debt.id})`}
                stroke={getDebtColor(i)}
                strokeWidth={1.5}
                animationDuration={800}
                animationEasing="ease-out"
              />
            ))}
            {milestones.map((m, i) => (
              <ReferenceLine
                key={i}
                x={m.month}
                stroke="#22C55E"
                strokeDasharray="4 4"
                strokeOpacity={0.5}
                label={{
                  value: `🔥 ${m.debtName}`,
                  position: 'top',
                  fill: '#22C55E',
                  fontSize: 10,
                  fontFamily: 'JetBrains Mono',
                }}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Freed cash flow indicator */}
      {milestones.length > 0 && (
        <div className="mt-4 pt-3 border-t border-border-subtle">
          <div className="text-text-muted text-xs uppercase tracking-wider mb-2">Snowball Growth</div>
          <div className="flex flex-wrap gap-2">
            {milestones.map((m, i) => {
              const debt = debts.find(d => d.id === m.debtId);
              return (
                <div key={i} className="flex items-center gap-1.5 bg-green-dim border border-green/10 rounded-full px-3 py-1.5">
                  <span className="text-green text-xs">+{symbol}{debt?.minPayment || 0}/mo</span>
                  <span className="text-text-muted text-xs">freed at month {m.month}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
