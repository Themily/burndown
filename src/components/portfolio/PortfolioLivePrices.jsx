import React from 'react';
import { MARKET_TICKERS } from '../../utils/portfolioCalculations';
import { useCurrency } from '../../context/CurrencyContext';

export default function PortfolioLivePrices({ prices = {}, loading = false, lastUpdated = null }) {
  const { formatCurrencyExact } = useCurrency();

  const getTimeSince = () => {
    if (!lastUpdated) return '';
    const seconds = Math.round((Date.now() - lastUpdated) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    return `${Math.round(seconds / 60)}m ago`;
  };

  return (
    <div className="card mx-4 mb-10">
      <div className="flex items-center justify-between mb-5">
        <h2 className="section-accent font-heading text-lg font-bold text-text-primary">
          Live Market Prices
        </h2>
        <div className="flex items-center gap-2">
          {loading && (
            <div className="w-2 h-2 rounded-full bg-teal animate-pulse" />
          )}
          {!loading && lastUpdated && (
            <div className="w-2 h-2 rounded-full bg-green" />
          )}
          <span className="text-text-muted text-xs">
            {loading ? 'Updating...' : lastUpdated ? `Updated ${getTimeSince()}` : 'Connecting...'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {MARKET_TICKERS.map((ticker) => {
          const data = prices[ticker.symbol];
          const price = data?.price || 0;
          const change = data?.changePercent || 0;
          const isPositive = change >= 0;

          return (
            <div
              key={ticker.symbol}
              className="bg-bg-elevated border border-border-subtle rounded-xl p-4 hover:border-border-medium transition-all"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-text-muted text-xs font-medium">{ticker.label}</span>
                {data && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                    isPositive
                      ? 'bg-green-dim text-green'
                      : 'bg-red-dim text-debt-red'
                  }`}>
                    {isPositive ? '▲' : '▼'} {Math.abs(change).toFixed(2)}%
                  </span>
                )}
              </div>
              <div className="font-mono text-xl font-bold tabular-nums text-text-primary">
                {loading && !data ? (
                  <div className="h-7 w-24 bg-bg-card rounded animate-pulse" />
                ) : price > 0 ? (
                  formatCurrencyExact(price)
                ) : (
                  <span className="text-text-muted text-sm">—</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {!lastUpdated && !loading && (
        <p className="text-text-muted text-xs text-center mt-4">
          Live prices require API setup. Prices will update automatically when deployed with Finnhub API key.
        </p>
      )}
    </div>
  );
}
