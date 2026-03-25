import React, { useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Line, ComposedChart,
} from 'recharts';
import { useCurrency } from '../../context/CurrencyContext';
import { buildChartData } from '../../utils/compoundCalculations';

function CustomTooltip({ active, payload, label, formatCurrency }) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="bg-bg-card-solid border border-border-medium rounded-xl p-3 shadow-2xl backdrop-blur-xl">
      <div className="text-text-muted text-xs mb-2 font-mono">
        Year {label}
      </div>
      {payload
        .filter((p) => p.value > 0)
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
    </div>
  );
}

export default function CompoundChart({ result, resultB, mode }) {
  const { formatCurrency, symbol } = useCurrency();

  const chartData = useMemo(() => buildChartData(result, mode === 'advanced' ? resultB : null), [result, resultB, mode]);

  if (!chartData || chartData.length === 0) return null;

  const hasScenarioB = mode === 'advanced' && resultB && chartData.some((d) => d.scenarioBBalance);

  return (
    <div className="card mx-4 mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading text-lg font-semibold">Growth Projection</h2>
        <div className="flex gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-purple" /> Contributions
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-teal" /> Interest
          </span>
          {hasScenarioB && (
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-1 rounded bg-amber" /> Scenario B
            </span>
          )}
        </div>
      </div>
      <div className="h-[350px] md:h-[400px]">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
            <defs>
              <linearGradient id="gradContributions" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b7cf7" stopOpacity={0.6} />
                <stop offset="100%" stopColor="#8b7cf7" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="gradInterest" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2DD4BF" stopOpacity={0.6} />
                <stop offset="100%" stopColor="#2DD4BF" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="year"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#5c5c7a', fontSize: 11, fontFamily: 'var(--font-mono)' }}
              label={{ value: 'Years', position: 'insideBottom', offset: -5, fill: '#5c5c7a', fontSize: 11 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#5c5c7a', fontSize: 11, fontFamily: 'var(--font-mono)' }}
              tickFormatter={(v) => {
                if (v >= 1000000) return `${symbol}${(v / 1000000).toFixed(1)}M`;
                if (v >= 1000) return `${symbol}${(v / 1000).toFixed(0)}k`;
                return `${symbol}${v}`;
              }}
              width={65}
            />
            <Tooltip content={<CustomTooltip formatCurrency={formatCurrency} />} />
            <Area
              type="monotone"
              dataKey="contributions"
              name="Contributions"
              stackId="1"
              stroke="#8b7cf7"
              strokeWidth={2}
              fill="url(#gradContributions)"
            />
            <Area
              type="monotone"
              dataKey="interest"
              name="Interest Earned"
              stackId="1"
              stroke="#2DD4BF"
              strokeWidth={2}
              fill="url(#gradInterest)"
            />
            {hasScenarioB && (
              <Line
                type="monotone"
                dataKey="scenarioBBalance"
                name="Scenario B"
                stroke="#F59E0B"
                strokeWidth={2}
                strokeDasharray="6 3"
                dot={false}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
