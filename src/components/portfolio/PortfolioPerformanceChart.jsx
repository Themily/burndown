import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useCurrency } from '../../context/CurrencyContext';

function CustomTooltip({ active, payload, label }) {
  const { formatCurrency } = useCurrency();
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-bg-card-solid border border-border-subtle rounded-xl px-4 py-3 shadow-xl backdrop-blur-xl">
      <p className="text-text-muted text-xs mb-1">{label}</p>
      <p className="text-teal font-mono font-semibold">{formatCurrency(payload[0].value)}</p>
    </div>
  );
}

export default function PortfolioPerformanceChart({ performanceData }) {
  const { formatCurrency } = useCurrency();

  if (!performanceData || performanceData.length < 2) {
    return (
      <div className="card mx-4 mb-10">
        <h2 className="section-accent font-heading text-lg font-bold text-text-primary mb-4">
          Performance Over Time
        </h2>
        <p className="text-text-muted text-center py-8">
          Add holdings with purchase dates to see performance over time
        </p>
      </div>
    );
  }

  const formatYAxis = (val) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
    return val.toFixed(0);
  };

  return (
    <div className="card mx-4 mb-10">
      <h2 className="section-accent font-heading text-lg font-bold text-text-primary mb-6">
        Performance Over Time
      </h2>
      <div style={{ height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={performanceData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gradPerformance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2DD4BF" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#2DD4BF" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              tick={{ fill: '#5c5c7a', fontSize: 11, fontFamily: 'var(--font-mono)' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={formatYAxis}
              tick={{ fill: '#5c5c7a', fontSize: 11, fontFamily: 'var(--font-mono)' }}
              axisLine={false}
              tickLine={false}
              width={60}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#2DD4BF"
              strokeWidth={2}
              fill="url(#gradPerformance)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
