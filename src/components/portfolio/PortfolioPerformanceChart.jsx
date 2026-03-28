import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import { useCurrency } from '../../context/CurrencyContext';

const RANGE_OPTIONS = [
  { key: '3M', months: 3 },
  { key: '6M', months: 6 },
  { key: '1Y', months: 12 },
  { key: 'All', months: null },
];

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function formatTooltipDate(val) {
  const [y, m] = (val || '').split('-');
  return m ? `${MONTH_NAMES[parseInt(m, 10) - 1]} ${y}` : val;
}

function CustomTooltip({ active, payload, label }) {
  const { formatCurrency } = useCurrency();
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-bg-card-solid border border-border-subtle rounded-xl px-4 py-3 shadow-xl backdrop-blur-xl">
      <p className="text-text-muted text-xs mb-1">{formatTooltipDate(label)}</p>
      <p className="text-teal font-mono font-semibold">{formatCurrency(payload[0].value)}</p>
    </div>
  );
}

export default function PortfolioPerformanceChart({ performanceData }) {
  const { formatCurrency, symbol } = useCurrency();
  const [range, setRange] = useState('All');

  const filteredData = useMemo(() => {
    if (!performanceData || performanceData.length < 2) return performanceData;
    const opt = RANGE_OPTIONS.find(r => r.key === range);
    if (!opt?.months) return performanceData;
    const cutoff = performanceData.length - opt.months;
    return cutoff > 0 ? performanceData.slice(cutoff) : performanceData;
  }, [performanceData, range]);

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

  const values = filteredData.map(d => d.value).filter(v => v > 0);
  const dataMin = Math.min(...values);
  const dataMax = Math.max(...values);
  const padding = (dataMax - dataMin) * 0.1 || dataMax * 0.1;
  const yMin = Math.max(0, Math.floor((dataMin - padding) / 100) * 100);
  const yMax = Math.ceil((dataMax + padding) / 100) * 100;

  const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const formatXAxis = (val) => {
    const [y, m] = val.split('-');
    return m ? `${MONTH_LABELS[parseInt(m, 10) - 1]} '${y.slice(2)}` : val;
  };

  const formatYAxis = (val) => {
    if (val >= 1000000) return `${symbol}${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `${symbol}${(val / 1000).toFixed(0)}k`;
    return `${symbol}${val.toFixed(0)}`;
  };

  return (
    <div className="card mx-4 mb-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="section-accent font-heading text-lg font-bold text-text-primary">
          Performance Over Time
        </h2>
        <div className="flex gap-1">
          {RANGE_OPTIONS.map(opt => (
            <button
              key={opt.key}
              onClick={() => setRange(opt.key)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                range === opt.key
                  ? 'bg-teal/20 text-teal'
                  : 'text-text-muted hover:text-text-secondary hover:bg-white/5'
              }`}
            >
              {opt.key}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-hidden" style={{ minWidth: 1, minHeight: 1 }}>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gradPerformance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2DD4BF" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#2DD4BF" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis
              dataKey="date"
              tickFormatter={formatXAxis}
              tick={{ fill: '#5c5c7a', fontSize: 11, fontFamily: 'var(--font-mono)' }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[yMin, yMax]}
              allowDataOverflow
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
      <p className="text-text-muted text-xs mt-3 leading-relaxed">
        <span className="font-semibold text-text-secondary">Note:</span> Historical values are estimates based on average annual returns by asset class (e.g. ~10% for stocks, ~40% for crypto). Only the current month uses live market prices when available. This chart does not reflect actual historical price movements.
      </p>
    </div>
  );
}
