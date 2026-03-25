import React, { useState } from 'react';
import { useCurrency } from '../../context/CurrencyContext';

export default function PortfolioWatchlists({ watchlists = [], setWatchlists, priceCache = {} }) {
  const { formatCurrencyExact } = useCurrency();
  const [newName, setNewName] = useState('');
  const [newTickers, setNewTickers] = useState('');

  const handleAdd = () => {
    if (!newName.trim() || !newTickers.trim()) return;
    const tickers = newTickers.split(',').map(t => t.trim().toUpperCase()).filter(Boolean);
    const wl = {
      id: `wl-${Date.now()}`,
      name: newName.trim(),
      tickers,
    };
    setWatchlists(prev => [...prev, wl]);
    setNewName('');
    setNewTickers('');
  };

  const handleRemove = (id) => {
    setWatchlists(prev => prev.filter(w => w.id !== id));
  };

  return (
    <div className="card mx-4 mb-10">
      <h2 className="section-accent font-heading text-lg font-bold text-text-primary mb-6">
        Watchlists
      </h2>

      {/* Create new watchlist */}
      <div className="bg-bg-elevated border border-border-subtle rounded-xl p-4 mb-6">
        <p className="text-text-secondary text-sm font-medium mb-3">Create New Watchlist</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Watchlist name"
            className="!text-sm"
          />
          <input
            type="text"
            value={newTickers}
            onChange={(e) => setNewTickers(e.target.value)}
            placeholder="Tickers (comma-separated: AAPL, MSFT)"
            className="!text-sm sm:col-span-1"
          />
          <button
            onClick={handleAdd}
            disabled={!newName.trim() || !newTickers.trim()}
            className="px-4 py-2 rounded-xl bg-teal/10 border border-teal/30 text-teal text-sm font-semibold hover:bg-teal/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            + Create
          </button>
        </div>
      </div>

      {/* Watchlist cards */}
      {watchlists.length === 0 ? (
        <p className="text-text-muted text-sm text-center py-4">No watchlists yet. Create one above.</p>
      ) : (
        <div className="space-y-4">
          {watchlists.map(wl => (
            <div key={wl.id} className="bg-bg-elevated border border-border-subtle rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-text-primary font-semibold text-sm">{wl.name}</h3>
                <button
                  onClick={() => handleRemove(wl.id)}
                  className="text-text-muted hover:text-debt-red text-xs transition-colors"
                >
                  Remove
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {wl.tickers.map(ticker => {
                  const data = priceCache[ticker];
                  return (
                    <div key={ticker} className="bg-bg-card rounded-lg p-2 text-center">
                      <p className="text-text-muted text-xs font-mono">{ticker}</p>
                      <p className="text-text-primary text-sm font-mono font-semibold tabular-nums">
                        {data?.price ? formatCurrencyExact(data.price) : '—'}
                      </p>
                      {data?.changePercent != null && (
                        <p className={`text-[10px] font-mono ${data.changePercent >= 0 ? 'text-green' : 'text-debt-red'}`}>
                          {data.changePercent >= 0 ? '+' : ''}{data.changePercent.toFixed(2)}%
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
