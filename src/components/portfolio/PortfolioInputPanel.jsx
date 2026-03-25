import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useCurrency } from '../../context/CurrencyContext';
import { ASSET_CLASSES, createBlankHolding } from '../../utils/portfolioCalculations';
import ASSET_ICONS from '../../utils/assetIcons';

function AssetClassSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const dropdownRef = useRef(null);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
  const selected = ASSET_CLASSES.find(ac => ac.value === value) || ASSET_CLASSES[0];

  // Close on click outside — check both trigger and portal dropdown
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  // Recalculate position when opening
  const handleToggle = () => {
    if (!open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const dropdownHeight = ASSET_CLASSES.length * 44 + 8;
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUp = spaceBelow < dropdownHeight && rect.top > dropdownHeight;

      setPos({
        left: rect.left,
        width: rect.width,
        ...(openUp
          ? { bottom: window.innerHeight - rect.top + 4, top: 'auto' }
          : { top: rect.bottom + 4, bottom: 'auto' }),
      });
    }
    setOpen(o => !o);
  };

  return (
    <div className="relative">
      {/* Trigger button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-bg-input border border-border-subtle text-text-primary text-sm hover:border-border-medium transition-all"
      >
        <span className="flex items-center gap-2.5">
          <span
            className="flex items-center justify-center w-7 h-7 rounded-lg flex-shrink-0"
            style={{ backgroundColor: `${selected.color}20`, color: selected.color }}
          >
            {ASSET_ICONS[selected.value](selected.color)}
          </span>
          <span className="font-semibold text-sm">{selected.label}</span>
        </span>
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          className={`text-text-muted transition-transform duration-200 flex-shrink-0 ${open ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {/* Dropdown — portalled to document.body to escape backdrop-filter containing block */}
      {open && createPortal(
        <div
          ref={dropdownRef}
          style={{
            position: 'fixed',
            left: pos.left,
            width: pos.width,
            top: pos.top !== 'auto' ? pos.top : undefined,
            bottom: pos.bottom !== 'auto' ? pos.bottom : undefined,
            zIndex: 99999,
          }}
          className="rounded-xl shadow-2xl overflow-hidden border border-border-medium"
        >
          {ASSET_CLASSES.map(ac => {
            const isSelected = ac.value === value;
            return (
              <button
                key={ac.value}
                type="button"
                onClick={() => { onChange(ac.value); setOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-all"
                style={{
                  backgroundColor: isSelected ? '#1a1f35' : '#0e111e',
                }}
                onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = '#151929'; }}
                onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = '#0e111e'; }}
              >
                <span
                  className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0"
                  style={{ backgroundColor: `${ac.color}20` }}
                >
                  {ASSET_ICONS[ac.value](ac.color)}
                </span>
                <span
                  className="font-semibold"
                  style={{ color: isSelected ? '#e2e8f0' : '#94a3b8' }}
                >
                  {ac.label}
                </span>
                {isSelected && (
                  <svg className="ml-auto flex-shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ac.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}
              </button>
            );
          })}
        </div>,
        document.body
      )}
    </div>
  );
}

export default function PortfolioInputPanel({ holdings, setHoldings, mode }) {
  const { symbol } = useCurrency();
  const [editingId, setEditingId] = useState(null);

  const handleAdd = () => {
    const blank = createBlankHolding();
    setHoldings(prev => [...prev, blank]);
    setEditingId(blank.id);
  };

  const handleRemove = (id) => {
    setHoldings(prev => prev.filter(h => h.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const handleChange = (id, field, value) => {
    setHoldings(prev => prev.map(h =>
      h.id === id ? { ...h, [field]: value } : h
    ));
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="section-accent font-heading text-lg font-bold text-text-primary">
          Portfolio Holdings
        </h2>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal/10 border border-teal/30 text-teal text-sm font-semibold hover:bg-teal/20 transition-all"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Holding
        </button>
      </div>

      {holdings.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">📊</div>
          <p className="text-text-secondary mb-2">No holdings yet</p>
          <p className="text-text-muted text-sm">Click "Add Holding" to start building your portfolio</p>
        </div>
      ) : (
        <div className="space-y-3">
          {holdings.map((h, i) => (
            <div
              key={h.id}
              className="debt-item bg-bg-elevated border border-border-subtle rounded-xl p-4"
            >
              {/* Row 1: Name + Ticker + Asset Class + Delete */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 mb-3">
                <div className="sm:col-span-4">
                  <label className="text-text-muted text-[10px] uppercase tracking-wider block mb-1">Name</label>
                  <input
                    type="text"
                    value={h.name}
                    onChange={(e) => handleChange(h.id, 'name', e.target.value)}
                    placeholder="e.g. Apple Inc."
                    className="!text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-text-muted text-[10px] uppercase tracking-wider block mb-1">Ticker</label>
                  <input
                    type="text"
                    value={h.ticker}
                    onChange={(e) => handleChange(h.id, 'ticker', e.target.value.toUpperCase())}
                    placeholder="AAPL"
                    className="!text-sm !uppercase"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="text-text-muted text-[10px] uppercase tracking-wider block mb-1">Asset Class</label>
                  <AssetClassSelect
                    value={h.assetClass}
                    onChange={(val) => handleChange(h.id, 'assetClass', val)}
                  />
                </div>
                <div className="sm:col-span-2 flex items-end">
                  <input
                    type="date"
                    value={h.purchaseDate}
                    onChange={(e) => handleChange(h.id, 'purchaseDate', e.target.value)}
                    className="!text-sm"
                  />
                </div>
                <div className="sm:col-span-1 flex items-end justify-center">
                  <button
                    onClick={() => handleRemove(h.id)}
                    className="p-2 rounded-lg text-text-muted hover:text-debt-red hover:bg-red-dim transition-all"
                    aria-label={`Remove ${h.name}`}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Row 2: Quantity + Purchase Price */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-text-muted text-[10px] uppercase tracking-wider block mb-1">Quantity</label>
                  <input
                    type="number"
                    value={h.quantity || ''}
                    onChange={(e) => handleChange(h.id, 'quantity', parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                    className="!text-sm"
                  />
                </div>
                <div>
                  <label className="text-text-muted text-[10px] uppercase tracking-wider block mb-1">
                    Purchase Price ({symbol})
                  </label>
                  <input
                    type="number"
                    value={h.purchasePrice || ''}
                    onChange={(e) => handleChange(h.id, 'purchasePrice', parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                    className="!text-sm"
                  />
                </div>
                {mode !== 'simple' && (
                  <div className="col-span-2 sm:col-span-2">
                    <label className="text-text-muted text-[10px] uppercase tracking-wider block mb-1">
                      Target Allocation (%)
                    </label>
                    <input
                      type="number"
                      value={h.targetAllocation ?? ''}
                      onChange={(e) => handleChange(h.id, 'targetAllocation', e.target.value ? parseFloat(e.target.value) : null)}
                      min="0"
                      max="100"
                      step="1"
                      placeholder="Optional"
                      className="!text-sm"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
