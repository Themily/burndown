import React, { useState } from 'react';
import { useCurrency } from '../../context/CurrencyContext';

export default function PortfolioAlerts({ alerts = [], setAlerts, alertEmail = '', setAlertEmail, priceCache = {} }) {
  const { symbol, formatCurrencyExact } = useCurrency();
  const [newTicker, setNewTicker] = useState('');
  const [newCondition, setNewCondition] = useState('above');
  const [newPrice, setNewPrice] = useState('');

  const handleAddAlert = () => {
    if (!newTicker.trim() || !newPrice) return;
    const alert = {
      id: `alert-${Date.now()}`,
      ticker: newTicker.trim().toUpperCase(),
      condition: newCondition,
      price: parseFloat(newPrice),
      triggered: false,
      createdAt: Date.now(),
    };
    setAlerts(prev => [...prev, alert]);
    setNewTicker('');
    setNewPrice('');
  };

  const handleRemoveAlert = (id) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const handleResetAlert = (id) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, triggered: false } : a));
  };

  return (
    <div className="card mx-4 mb-10">
      <h2 className="section-accent font-heading text-lg font-bold text-text-primary mb-6">
        Price Alerts
      </h2>

      {/* Email setup */}
      <div className="bg-bg-elevated border border-border-subtle rounded-xl p-4 mb-6">
        <p className="text-text-secondary text-sm font-medium mb-2">
          Email Notifications
        </p>
        <p className="text-text-muted text-xs mb-3">
          Enter your email to receive alerts when price thresholds are crossed.
          Powered by Resend (100 emails/day free tier).
        </p>
        <input
          type="email"
          value={alertEmail}
          onChange={(e) => setAlertEmail(e.target.value)}
          placeholder="your@email.com"
          className="!text-sm max-w-md"
        />
      </div>

      {/* Add new alert */}
      <div className="bg-bg-elevated border border-border-subtle rounded-xl p-4 mb-6">
        <p className="text-text-secondary text-sm font-medium mb-3">Add Price Alert</p>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <input
            type="text"
            value={newTicker}
            onChange={(e) => setNewTicker(e.target.value.toUpperCase())}
            placeholder="Ticker (e.g. AAPL)"
            className="!text-sm !uppercase"
          />
          <select
            value={newCondition}
            onChange={(e) => setNewCondition(e.target.value)}
            className="!text-sm"
          >
            <option value="above">Price Goes Above</option>
            <option value="below">Price Goes Below</option>
          </select>
          <input
            type="number"
            value={newPrice}
            onChange={(e) => setNewPrice(e.target.value)}
            placeholder={`Price (${symbol})`}
            min="0"
            step="0.01"
            className="!text-sm"
          />
          <button
            onClick={handleAddAlert}
            disabled={!newTicker.trim() || !newPrice}
            className="px-4 py-2 rounded-xl bg-teal/10 border border-teal/30 text-teal text-sm font-semibold hover:bg-teal/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            + Add Alert
          </button>
        </div>
      </div>

      {/* Active alerts */}
      {alerts.length === 0 ? (
        <p className="text-text-muted text-sm text-center py-4">No alerts set. Create one above.</p>
      ) : (
        <div className="space-y-2">
          {alerts.map(alert => {
            const currentPrice = priceCache[alert.ticker]?.price;
            return (
              <div
                key={alert.id}
                className={`flex items-center justify-between bg-bg-elevated border rounded-xl p-4 ${
                  alert.triggered ? 'border-amber/30' : 'border-border-subtle'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                    alert.triggered
                      ? 'bg-amber-dim text-amber'
                      : 'bg-teal-dim text-teal'
                  }`}>
                    {alert.triggered ? 'Triggered' : 'Monitoring'}
                  </span>
                  <div>
                    <span className="text-text-primary font-mono font-semibold text-sm">{alert.ticker}</span>
                    <span className="text-text-muted text-sm mx-2">
                      {alert.condition === 'above' ? '>' : '<'}
                    </span>
                    <span className="text-text-primary font-mono text-sm">{formatCurrencyExact(alert.price)}</span>
                  </div>
                  {currentPrice && (
                    <span className="text-text-muted text-xs">
                      Current: {formatCurrencyExact(currentPrice)}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {alert.triggered && (
                    <button
                      onClick={() => handleResetAlert(alert.id)}
                      className="text-xs text-teal hover:underline"
                    >
                      Reset
                    </button>
                  )}
                  <button
                    onClick={() => handleRemoveAlert(alert.id)}
                    className="p-1.5 rounded-lg text-text-muted hover:text-debt-red hover:bg-red-dim transition-all"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
