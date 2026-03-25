import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useCurrency } from '../../context/CurrencyContext';
import ASSET_ICONS from '../../utils/assetIcons';

function CustomTooltip({ active, payload }) {
  const { formatCurrency } = useCurrency();
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="bg-bg-card-solid border border-border-subtle rounded-xl px-4 py-3 shadow-xl backdrop-blur-xl">
      <p className="text-text-primary text-sm font-semibold">{d.name}</p>
      <p className="text-text-secondary text-xs">{formatCurrency(d.value)} ({d.payload.percent}%)</p>
    </div>
  );
}

export default function PortfolioAllocationChart({ allocation }) {
  const { formatCurrency } = useCurrency();

  if (!allocation || allocation.length === 0) {
    return (
      <div className="card mx-4 mb-10">
        <h2 className="section-accent font-heading text-lg font-bold text-text-primary mb-4">
          Asset Allocation
        </h2>
        <p className="text-text-muted text-center py-8">Add holdings to see your allocation breakdown</p>
      </div>
    );
  }

  return (
    <div className="card mx-4 mb-10">
      <h2 className="section-accent font-heading text-lg font-bold text-text-primary mb-6">
        Asset Allocation
      </h2>
      <div className="flex flex-col md:flex-row items-center gap-8">
        {/* Donut chart */}
        <div className="w-full md:w-1/2" style={{ height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={allocation}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={120}
                paddingAngle={2}
                dataKey="value"
                nameKey="label"
                stroke="none"
              >
                {allocation.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="w-full md:w-1/2 space-y-3">
          {allocation.map((a, i) => (
            <div key={i} className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-bg-elevated/50 transition-colors">
              <div className="flex items-center gap-3">
                <span
                  className="flex items-center justify-center w-7 h-7 rounded-lg flex-shrink-0"
                  style={{ backgroundColor: `${a.color}20` }}
                >
                  {ASSET_ICONS[a.assetClass] ? ASSET_ICONS[a.assetClass](a.color, 14) : (
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: a.color }} />
                  )}
                </span>
                <span className="text-text-primary text-sm font-medium">
                  {a.label}
                </span>
              </div>
              <div className="text-right">
                <span className="text-text-primary text-sm font-mono font-semibold tabular-nums">
                  {a.percent}%
                </span>
                <span className="text-text-muted text-xs font-mono ml-2">
                  {formatCurrency(a.value)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
