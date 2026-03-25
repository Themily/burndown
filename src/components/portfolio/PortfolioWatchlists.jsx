import React, { useState } from 'react';
import { useCurrency } from '../../context/CurrencyContext';

export default function PortfolioWatchlists({ watchlists = [], setWatchlists, priceCache = {} }) {
  const { formatCurrencyExact } = useCurrency();
  const [newName, setNewName] = useState('');
  const [newTickers, setNewTickers] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [addTickerInput, setAddTickerInput] = useState('');

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
    if (editingId === id) setEditingId(null);
  };

  const startEditing = (wl) => {
    setEditingId(wl.id);
    setEditName(wl.name);
    setAddTickerInput('');
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditName('');
    setAddTickerInput('');
  };

  const saveEditName = (id) => {
    if (!editName.trim()) return;
    setWatchlists(prev =>
      prev.map(w => w.id === id ? { ...w, name: editName.trim() } : w)
    );
  };

  const removeTicker = (watchlistId, ticker) => {
    setWatchlists(prev =>
      prev.map(w => {
        if (w.id !== watchlistId) return w;
        const updated = w.tickers.filter(t => t !== ticker);
        // If no tickers left, remove the whole watchlist
        if (updated.length === 0) {
          setEditingId(null);
          return null;
        }
        return { ...w, tickers: updated };
      }).filter(Boolean)
    );
  };

  const addTickerToWatchlist = (watchlistId) => {
    if (!addTickerInput.trim()) return;
    const newTkrs = addTickerInput.split(',').map(t => t.trim().toUpperCase()).filter(Boolean);
    if (newTkrs.length === 0) return;

    setWatchlists(prev =>
      prev.map(w => {
        if (w.id !== watchlistId) return w;
        // Avoid duplicates
        const existing = new Set(w.tickers);
        const combined = [...w.tickers, ...newTkrs.filter(t => !existing.has(t))];
        return { ...w, tickers: combined };
      })
    );
    setAddTickerInput('');
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
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
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
          {watchlists.map(wl => {
            const isEditing = editingId === wl.id;

            return (
              <div key={wl.id} className="bg-bg-elevated border border-border-subtle rounded-xl p-4">
                {/* Header row */}
                <div className="flex items-center justify-between mb-3">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onBlur={() => saveEditName(wl.id)}
                      onKeyDown={(e) => { if (e.key === 'Enter') saveEditName(wl.id); }}
                      className="!text-sm !py-1 !px-2 max-w-[200px] font-semibold"
                      autoFocus
                    />
                  ) : (
                    <h3 className="text-text-primary font-semibold text-sm">{wl.name}</h3>
                  )}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => isEditing ? cancelEditing() : startEditing(wl)}
                      className={`text-xs font-medium transition-colors ${
                        isEditing
                          ? 'text-amber hover:text-amber/80'
                          : 'text-teal hover:text-teal/80'
                      }`}
                    >
                      {isEditing ? (
                        <span className="flex items-center gap-1">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                          </svg>
                          Done
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                          Edit
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => handleRemove(wl.id)}
                      className="text-text-muted hover:text-debt-red text-xs font-medium transition-colors flex items-center gap-1"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>

                {/* Add ticker input (visible in edit mode) */}
                {isEditing && (
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={addTickerInput}
                      onChange={(e) => setAddTickerInput(e.target.value)}
                      placeholder="Add tickers (e.g. TSLA, AMZN)"
                      className="!text-sm !py-1.5 flex-1"
                      onKeyDown={(e) => { if (e.key === 'Enter') addTickerToWatchlist(wl.id); }}
                    />
                    <button
                      onClick={() => addTickerToWatchlist(wl.id)}
                      disabled={!addTickerInput.trim()}
                      className="px-3 py-1.5 rounded-lg bg-teal/10 border border-teal/30 text-teal text-xs font-semibold hover:bg-teal/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      + Add
                    </button>
                  </div>
                )}

                {/* Ticker grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {wl.tickers.map(ticker => {
                    const data = priceCache[ticker];
                    return (
                      <div key={ticker} className="bg-bg-card rounded-lg p-2 text-center relative group">
                        {/* Remove ticker button (visible in edit mode) */}
                        {isEditing && (
                          <button
                            onClick={() => removeTicker(wl.id, ticker)}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-debt-red text-white flex items-center justify-center text-xs font-bold shadow-lg hover:bg-red-600 transition-colors z-10"
                            title={`Remove ${ticker}`}
                          >
                            ×
                          </button>
                        )}
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
            );
          })}
        </div>
      )}
    </div>
  );
}
