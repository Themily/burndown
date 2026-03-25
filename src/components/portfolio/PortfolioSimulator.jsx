import React, { useState, useMemo, useCallback } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useCurrency } from '../../context/CurrencyContext';
import {
  ASSET_CLASSES,
  calculateWhatIf,
  runMonteCarloSimulation,
} from '../../utils/portfolioCalculations';

function MonteCarloTooltip({ active, payload, label }) {
  const { formatCurrency } = useCurrency();
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  return (
    <div className="bg-bg-card-solid border border-border-subtle rounded-xl px-4 py-3 shadow-xl backdrop-blur-xl">
      <p className="text-text-muted text-xs mb-1">Year {d.year}</p>
      <p className="text-teal font-mono text-xs">Median: {formatCurrency(d.median)}</p>
      <p className="text-green font-mono text-xs">Best 10%: {formatCurrency(d.p90)}</p>
      <p className="text-amber font-mono text-xs">Worst 10%: {formatCurrency(d.p10)}</p>
    </div>
  );
}

export default function PortfolioSimulator({
  simulator,
  setSimulator,
  holdings,
  priceCache,
  totalValue,
  allocation,
}) {
  const { formatCurrency, symbol } = useCurrency();
  const [activeTab, setActiveTab] = useState('whatif');

  // What-If calculation
  const whatIfResult = useMemo(() => {
    return calculateWhatIf(
      holdings,
      priceCache,
      simulator.whatIfAssetClass,
      simulator.whatIfAmount
    );
  }, [holdings, priceCache, simulator.whatIfAssetClass, simulator.whatIfAmount]);

  // Monte Carlo (only runs when button clicked or inputs change)
  const [monteCarloResult, setMonteCarloResult] = useState(null);
  const [mcRunning, setMcRunning] = useState(false);

  const runMC = useCallback(() => {
    setMcRunning(true);
    // Use setTimeout to avoid blocking UI
    setTimeout(() => {
      const allocationWeights = {};
      if (allocation) {
        allocation.forEach(a => { allocationWeights[a.assetClass] = a.percent; });
      }
      const result = runMonteCarloSimulation(
        totalValue,
        simulator.monteCarloYears > 0 ? (totalValue * 0.005) : 0, // assume 0.5% monthly contribution
        simulator.monteCarloYears,
        1000,
        Object.keys(allocationWeights).length > 0 ? allocationWeights : null,
        simulator.monteCarloGoal
      );
      setMonteCarloResult(result);
      setMcRunning(false);
    }, 50);
  }, [totalValue, simulator.monteCarloYears, simulator.monteCarloGoal, allocation]);

  const handleChange = (field, value) => {
    setSimulator(prev => ({ ...prev, [field]: value }));
  };

  const formatYAxis = (val) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
    return val.toFixed(0);
  };

  return (
    <div className="card mx-4 mb-10">
      <h2 className="section-accent font-heading text-lg font-bold text-text-primary mb-6">
        Portfolio Simulator
      </h2>

      {/* Tab toggle */}
      <div className="flex items-center bg-bg-elevated border border-border-subtle rounded-full px-1 py-0.5 mb-6 w-fit">
        <button
          onClick={() => setActiveTab('whatif')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
            activeTab === 'whatif' ? 'portfolio-mode-active text-text-primary' : 'text-text-muted hover:text-text-secondary'
          }`}
        >
          What-If
        </button>
        <button
          onClick={() => setActiveTab('montecarlo')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
            activeTab === 'montecarlo' ? 'portfolio-mode-active text-text-primary' : 'text-text-muted hover:text-text-secondary'
          }`}
        >
          Monte Carlo
        </button>
      </div>

      {/* What-If Tab */}
      {activeTab === 'whatif' && (
        <div>
          <div className="bg-bg-elevated border border-border-subtle rounded-xl p-4 mb-6">
            <p className="text-text-secondary text-sm mb-3">What if I add...</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-text-muted text-[10px] uppercase tracking-wider block mb-1">
                  Amount ({symbol})
                </label>
                <input
                  type="number"
                  value={simulator.whatIfAmount || ''}
                  onChange={(e) => handleChange('whatIfAmount', parseFloat(e.target.value) || 0)}
                  min="0"
                  className="!text-sm"
                />
              </div>
              <div>
                <label className="text-text-muted text-[10px] uppercase tracking-wider block mb-1">
                  Asset Class
                </label>
                <select
                  value={simulator.whatIfAssetClass}
                  onChange={(e) => handleChange('whatIfAssetClass', e.target.value)}
                  className="!text-sm"
                >
                  {ASSET_CLASSES.map(ac => (
                    <option key={ac.value} value={ac.value}>{ac.icon} {ac.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* What-If Results */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-bg-elevated border border-border-subtle rounded-xl p-4">
              <h3 className="text-text-muted text-xs uppercase tracking-wider mb-3">Current Allocation</h3>
              {whatIfResult.currentAllocation.map(a => (
                <div key={a.assetClass} className="flex justify-between py-1">
                  <span className="text-text-secondary text-sm">{a.label}</span>
                  <span className="text-text-primary text-sm font-mono tabular-nums">{a.percent}%</span>
                </div>
              ))}
              <div className="border-t border-border-subtle mt-2 pt-2 flex justify-between">
                <span className="text-text-muted text-sm font-semibold">Total</span>
                <span className="text-text-primary text-sm font-mono font-semibold">{formatCurrency(totalValue)}</span>
              </div>
            </div>
            <div className="bg-bg-elevated border border-teal/20 rounded-xl p-4">
              <h3 className="text-teal text-xs uppercase tracking-wider mb-3">After Adding {formatCurrency(simulator.whatIfAmount)}</h3>
              {whatIfResult.newAllocation.map(a => (
                <div key={a.assetClass} className="flex justify-between py-1">
                  <span className="text-text-secondary text-sm">{a.label}</span>
                  <span className="text-text-primary text-sm font-mono tabular-nums">{a.percent}%</span>
                </div>
              ))}
              <div className="border-t border-border-subtle mt-2 pt-2 flex justify-between">
                <span className="text-teal text-sm font-semibold">New Total</span>
                <span className="text-green text-sm font-mono font-semibold">{formatCurrency(whatIfResult.projectedValue)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Monte Carlo Tab */}
      {activeTab === 'montecarlo' && (
        <div>
          <div className="bg-bg-elevated border border-border-subtle rounded-xl p-4 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-text-muted text-[10px] uppercase tracking-wider block mb-1">Years</label>
                <input
                  type="number"
                  value={simulator.monteCarloYears || ''}
                  onChange={(e) => handleChange('monteCarloYears', parseInt(e.target.value) || 0)}
                  min="1"
                  max="50"
                  className="!text-sm"
                />
              </div>
              <div>
                <label className="text-text-muted text-[10px] uppercase tracking-wider block mb-1">
                  Goal Amount ({symbol})
                </label>
                <input
                  type="number"
                  value={simulator.monteCarloGoal || ''}
                  onChange={(e) => handleChange('monteCarloGoal', parseFloat(e.target.value) || 0)}
                  min="0"
                  className="!text-sm"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={runMC}
                  disabled={mcRunning}
                  className="w-full px-4 py-2 rounded-xl bg-gradient-to-r from-teal to-green text-white text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50"
                >
                  {mcRunning ? 'Running...' : 'Run 1,000 Simulations'}
                </button>
              </div>
            </div>
          </div>

          {monteCarloResult && (
            <>
              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
                {[
                  { label: 'Worst 10%', value: formatCurrency(monteCarloResult.p10), color: 'text-debt-red' },
                  { label: '25th Percentile', value: formatCurrency(monteCarloResult.p25), color: 'text-amber' },
                  { label: 'Median', value: formatCurrency(monteCarloResult.median), color: 'text-teal' },
                  { label: '75th Percentile', value: formatCurrency(monteCarloResult.p75), color: 'text-green' },
                  { label: 'Best 10%', value: formatCurrency(monteCarloResult.p90), color: 'text-green' },
                ].map((s, i) => (
                  <div key={i} className="bg-bg-elevated border border-border-subtle rounded-xl p-3 text-center">
                    <p className="text-text-muted text-[10px] uppercase tracking-wider mb-1">{s.label}</p>
                    <p className={`font-mono text-sm font-bold tabular-nums ${s.color}`}>{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Probability */}
              {simulator.monteCarloGoal > 0 && (
                <div className="bg-bg-elevated border border-teal/20 rounded-xl p-4 mb-6 text-center">
                  <p className="text-text-secondary text-sm">
                    Probability of reaching {formatCurrency(simulator.monteCarloGoal)} in {simulator.monteCarloYears} years:
                  </p>
                  <p className={`font-mono text-3xl font-bold mt-2 ${
                    monteCarloResult.probabilityOfGoal >= 70 ? 'text-green' :
                    monteCarloResult.probabilityOfGoal >= 40 ? 'text-amber' : 'text-debt-red'
                  }`}>
                    {monteCarloResult.probabilityOfGoal}%
                  </p>
                </div>
              )}

              {/* Fan Chart */}
              {monteCarloResult.yearlyPercentiles.length > 0 && (
                <div style={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monteCarloResult.yearlyPercentiles} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="gradP90" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#22C55E" stopOpacity={0.15} />
                          <stop offset="100%" stopColor="#22C55E" stopOpacity={0.02} />
                        </linearGradient>
                        <linearGradient id="gradP75" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#2DD4BF" stopOpacity={0.2} />
                          <stop offset="100%" stopColor="#2DD4BF" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="year"
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
                      <Tooltip content={<MonteCarloTooltip />} />
                      <Area type="monotone" dataKey="p90" stroke="none" fill="url(#gradP90)" />
                      <Area type="monotone" dataKey="p75" stroke="none" fill="url(#gradP75)" />
                      <Area type="monotone" dataKey="median" stroke="#2DD4BF" strokeWidth={2} fill="none" />
                      <Area type="monotone" dataKey="p25" stroke="#F59E0B" strokeWidth={1} strokeDasharray="4 4" fill="none" />
                      <Area type="monotone" dataKey="p10" stroke="#EF4444" strokeWidth={1} strokeDasharray="4 4" fill="none" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
