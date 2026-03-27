import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useCurrency } from '../../context/CurrencyContext';
import { ASSET_CLASSES, createBlankHolding } from '../../utils/portfolioCalculations';
import ASSET_ICONS from '../../utils/assetIcons';

/* ─── Debounced input ───
   Keeps a local state while typing; only pushes to parent on blur or Enter.
   This prevents the entire portfolio (including charts) from re-rendering
   on every keystroke, which causes Recharts to crash with width(-1).
   Works for both text and number inputs.
*/
function DebouncedInput({ value, onChange, uppercase, parseNumber, nullable, ...props }) {
  const [local, setLocal] = useState(value ?? '');
  const localRef = useRef(local);

  // Sync from parent when the value changes externally
  useEffect(() => {
    const v = value ?? '';
    const lStr = String(localRef.current);
    const vStr = String(v);
    if (vStr !== lStr) {
      setLocal(v);
      localRef.current = v;
    }
  }, [value]);

  const flush = useCallback(() => {
    let v = local;
    if (uppercase) v = String(v).toUpperCase();
    if (parseNumber) {
      if (nullable && (v === '' || v === null || v === undefined)) {
        v = null;
      } else {
        v = parseFloat(v) || 0;
        // Clamp to min/max when specified
        const minVal = props.min !== undefined ? parseFloat(props.min) : -Infinity;
        const maxVal = props.max !== undefined ? parseFloat(props.max) : Infinity;
        if (!isNaN(minVal) && v < minVal) v = minVal;
        if (!isNaN(maxVal) && v > maxVal) v = maxVal;
      }
    }
    if (v !== value) {
      onChange(v);
      localRef.current = v;
      // Sync local display to clamped value
      setLocal(v === 0 && props.min === '0' ? '' : v);
    }
  }, [local, value, onChange, uppercase, parseNumber, nullable, props.min, props.max]);

  const minVal = props.min !== undefined ? parseFloat(props.min) : -Infinity;
  const blockNegative = parseNumber && !isNaN(minVal) && minVal >= 0;

  return (
    <input
      {...props}
      value={local}
      onChange={(e) => {
        let v = uppercase ? e.target.value.toUpperCase() : e.target.value;
        // For positive-only numeric fields, strip leading minus sign in real time
        if (blockNegative && v.startsWith('-')) v = v.slice(1);
        setLocal(v);
        localRef.current = v;
      }}
      onBlur={flush}
      onKeyDown={(e) => {
        if (e.key === 'Enter') flush();
        // Block '-' key for positive-only numeric fields
        if (blockNegative && e.key === '-') e.preventDefault();
      }}
    />
  );
}

/* ─── Asset Class dropdown (portal-based) ─── */
function AssetClassSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const dropdownRef = useRef(null);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
  const selected = ASSET_CLASSES.find(ac => ac.value === value) || ASSET_CLASSES[0];

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

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

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

      {open && createPortal(
        <div
          ref={dropdownRef}
          data-portfolio-panel
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

/* ══════════════════════════════════════════════════════════════════
   Safe helpers
   ══════════════════════════════════════════════════════════════════ */
function safeIcon(assetValue, color) {
  const fn = ASSET_ICONS[assetValue];
  if (typeof fn === 'function') return fn(color);
  // Fallback: generic chart icon
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color || '#94a3b8'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
    </svg>
  );
}

function safeCurrency(fn, value) {
  try { return fn(Number(value) || 0); } catch { return '$0.00'; }
}

function getAssetClass(h) {
  if (!h) return ASSET_CLASSES[0];
  return ASSET_CLASSES.find(ac => ac.value === h.assetClass) || ASSET_CLASSES[0];
}

/* ══════════════════════════════════════════════════════════════════
   Grouping helpers — group flat holdings by ticker
   ══════════════════════════════════════════════════════════════════ */
function buildGroups(holdings) {
  if (!Array.isArray(holdings)) return [];
  const groupMap = new Map(); // ticker → { key, positions[] }
  const ungrouped = [];       // holdings with no ticker

  holdings.forEach(h => {
    if (!h || !h.id) return; // skip invalid entries
    const ticker = (h.ticker || '').trim().toUpperCase();
    if (!ticker) {
      ungrouped.push({ key: h.id, isSingle: true, positions: [h] });
      return;
    }
    if (!groupMap.has(ticker)) {
      groupMap.set(ticker, { key: `grp-${ticker}`, ticker, positions: [] });
    }
    groupMap.get(ticker).positions.push(h);
  });

  // Convert map to array, preserving insertion order
  const groups = [];
  const seen = new Set();
  holdings.forEach(h => {
    if (!h || !h.id) return;
    const ticker = (h.ticker || '').trim().toUpperCase();
    if (!ticker) {
      const found = ungrouped.find(u => u.key === h.id);
      if (found) groups.push(found);
    } else if (!seen.has(ticker)) {
      seen.add(ticker);
      const g = groupMap.get(ticker);
      if (g && g.positions.length > 0) {
        g.isSingle = g.positions.length === 1;
        groups.push(g);
      }
    }
  });

  return groups;
}

function groupStats(positions) {
  if (!Array.isArray(positions) || positions.length === 0) return { totalUnits: 0, totalCost: 0, avgPrice: 0 };
  const totalUnits = positions.reduce((s, p) => s + (p?.quantity || 0), 0);
  const totalCost = positions.reduce((s, p) => s + (p?.quantity || 0) * (p?.purchasePrice || 0), 0);
  const avgPrice = totalUnits > 0 ? totalCost / totalUnits : 0;
  return { totalUnits, totalCost, avgPrice };
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch { return '—'; }
}

/* ══════════════════════════════════════════════════════════════════
   Single holding row (no group — or only 1 position for a ticker)
   ══════════════════════════════════════════════════════════════════ */
function SingleRow({ h, isExpanded, onToggle, formatCurrencyExact }) {
  if (!h) return null;
  const assetClass = getAssetClass(h);
  const costBasis = (h.quantity || 0) * (h.purchasePrice || 0);
  const displayName = h.name || h.ticker || 'Untitled';

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all
        ${isExpanded
          ? 'bg-teal/5 border-teal/30'
          : 'bg-bg-elevated/40 border-border-subtle hover:bg-bg-elevated/70 hover:border-border-medium'
        } border rounded-xl`}
    >
      <span
        className="flex items-center justify-center w-9 h-9 rounded-lg flex-shrink-0"
        style={{ backgroundColor: `${assetClass.color}15`, color: assetClass.color }}
      >
        {safeIcon(assetClass.value, assetClass.color)}
      </span>

      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-text-primary truncate">{displayName}</div>
        <div className="text-[11px] text-text-muted font-mono">
          {h.ticker || '—'} · <span className="capitalize">{assetClass.label}</span>
        </div>
      </div>

      <div className="hidden sm:block text-right flex-shrink-0">
        <div className="text-xs text-text-muted">
          {h.quantity || 0} × {safeCurrency(formatCurrencyExact, h.purchasePrice)}
        </div>
        <div className="text-sm font-semibold text-text-primary font-mono tabular-nums">
          {safeCurrency(formatCurrencyExact, costBasis)}
        </div>
      </div>

      <svg
        width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        className={`text-text-muted flex-shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
      >
        <polyline points="6 9 12 15 18 9"/>
      </svg>
    </button>
  );
}

/* ══════════════════════════════════════════════════════════════════
   Grouped header row (2+ positions for the same ticker)
   ══════════════════════════════════════════════════════════════════ */
function GroupHeader({ group, isExpanded, onToggle, formatCurrencyExact }) {
  if (!group || !group.positions || group.positions.length === 0) return null;
  const first = group.positions[0];
  const assetClass = getAssetClass(first);
  const displayName = first.name || first.ticker || 'Untitled';
  const { totalUnits, totalCost, avgPrice } = groupStats(group.positions);

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all
        ${isExpanded
          ? 'bg-teal/5 border-teal/30'
          : 'bg-bg-elevated/40 border-border-subtle hover:bg-bg-elevated/70 hover:border-border-medium'
        } border rounded-xl`}
    >
      {/* Asset icon */}
      <span
        className="flex items-center justify-center w-9 h-9 rounded-lg flex-shrink-0"
        style={{ backgroundColor: `${assetClass.color}15`, color: assetClass.color }}
      >
        {safeIcon(assetClass.value, assetClass.color)}
      </span>

      {/* Name + ticker + positions badge */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-text-primary truncate">{displayName}</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple/15 text-purple border border-purple/20 tabular-nums flex-shrink-0">
            {group.positions.length} positions
          </span>
        </div>
        <div className="text-[11px] text-text-muted font-mono">
          {first.ticker} · <span className="capitalize">{assetClass.label}</span>
        </div>
      </div>

      {/* Aggregated stats */}
      <div className="hidden sm:flex items-center gap-5 flex-shrink-0">
        {/* Total units @ avg price */}
        <div className="text-right">
          <div className="text-[10px] text-text-muted uppercase tracking-wider">Invested</div>
          <div className="text-xs text-text-secondary font-mono tabular-nums">
            <span className="text-text-primary font-semibold">{totalUnits.toLocaleString(undefined, { maximumFractionDigits: 6 })}</span>
            {' '}Units @ {safeCurrency(formatCurrencyExact, avgPrice)}
          </div>
        </div>
        {/* Total cost */}
        <div className="text-right min-w-[80px]">
          <div className="text-[10px] text-text-muted uppercase tracking-wider">Cost Basis</div>
          <div className="text-sm font-semibold text-text-primary font-mono tabular-nums">
            {safeCurrency(formatCurrencyExact, totalCost)}
          </div>
        </div>
      </div>

      {/* Chevron */}
      <svg
        width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        className={`text-text-muted flex-shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
      >
        <polyline points="6 9 12 15 18 9"/>
      </svg>
    </button>
  );
}

/* ══════════════════════════════════════════════════════════════════
   Expanded positions table (inside a group)
   ══════════════════════════════════════════════════════════════════ */
function PositionsPanel({ group, onEdit, editingId, onChange, onRemove, onAddPosition, onConfirmPosition, onCancelPosition, mode, symbol, formatCurrencyExact, justAddedId, scrollTargetRef }) {
  if (!group || !group.positions || group.positions.length === 0) return null;
  const { totalUnits, totalCost, avgPrice } = groupStats(group.positions);
  const first = group.positions[0];
  const assetClass = getAssetClass(first);

  return (
    <div className="animate-in border border-teal/15 rounded-xl overflow-hidden -mt-1 mb-1">
      {/* Positions table header */}
      <div className="bg-bg-elevated/80 px-4 pt-3 pb-2">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
            Positions ({group.positions.length})
          </span>
          <button
            onClick={onAddPosition}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal/10 border border-teal/25 text-teal text-xs font-semibold hover:bg-teal/20 transition-all"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Position
          </button>
        </div>

        {/* Column headers */}
        <div className="grid grid-cols-12 gap-2 text-[10px] uppercase tracking-wider text-text-muted font-semibold pb-2 border-b border-border-subtle">
          <div className="col-span-1"></div>
          <div className="col-span-3">Date</div>
          <div className="col-span-2 text-right">Units</div>
          <div className="col-span-2 text-right">Open Price</div>
          <div className="col-span-3 text-right">Cost Basis</div>
          <div className="col-span-1"></div>
        </div>
      </div>

      {/* Position rows */}
      <div className="divide-y divide-border-subtle">
        {group.positions.map((p, i) => {
          const cost = (p.quantity || 0) * (p.purchasePrice || 0);
          const isEditing = editingId === p.id;
          const isJustAdded = justAddedId === p.id;

          return (
            <div key={p.id} ref={isJustAdded ? scrollTargetRef : undefined}>
              {/* Compact position row */}
              <div className={`grid grid-cols-12 gap-2 items-center px-4 py-3 transition-colors ${isEditing ? 'bg-teal/5' : 'hover:bg-bg-card-hover'}`}>
                {/* Buy badge */}
                <div className="col-span-1">
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-green/15 text-green border border-green/20">
                    Buy
                  </span>
                </div>

                {/* Date */}
                <div className="col-span-3">
                  <span className="text-sm font-semibold text-text-primary">{formatDate(p.purchaseDate)}</span>
                </div>

                {/* Units */}
                <div className="col-span-2 text-right">
                  <span className="text-sm text-text-primary font-mono tabular-nums">
                    {(p.quantity || 0).toLocaleString(undefined, { maximumFractionDigits: 6 })}
                  </span>
                </div>

                {/* Open price */}
                <div className="col-span-2 text-right">
                  <span className="text-sm text-text-secondary font-mono tabular-nums">
                    {safeCurrency(formatCurrencyExact, p.purchasePrice)}
                  </span>
                </div>

                {/* Cost basis */}
                <div className="col-span-3 text-right">
                  <span className="text-sm font-semibold text-text-primary font-mono tabular-nums">
                    {safeCurrency(formatCurrencyExact, cost)}
                  </span>
                </div>

                {/* Edit / Delete */}
                <div className="col-span-1 flex items-center justify-end gap-1">
                  <button
                    onClick={() => onEdit(isEditing ? null : p.id)}
                    className={`p-1.5 rounded-lg transition-all ${isEditing ? 'text-teal bg-teal/10' : 'text-text-muted hover:text-teal hover:bg-teal/10'}`}
                    aria-label="Edit position"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                  <button
                    onClick={() => onRemove(p.id)}
                    className="p-1.5 rounded-lg text-text-muted hover:text-debt-red hover:bg-red-dim transition-all"
                    aria-label="Delete position"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Inline edit form for this position */}
              {isEditing && (
                <div className="bg-bg-elevated/60 border-t border-teal/15 px-4 py-3 animate-in">
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 mb-3">
                    <div className="sm:col-span-4">
                      <label className="text-text-muted text-[10px] uppercase tracking-wider block mb-1">Name</label>
                      <DebouncedInput
                        type="text"
                        value={p.name}
                        onChange={(v) => onChange(p.id, 'name', v)}
                        placeholder="e.g. Tesla Inc."
                        className="!text-sm"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-text-muted text-[10px] uppercase tracking-wider block mb-1">Ticker</label>
                      <DebouncedInput
                        type="text"
                        value={p.ticker}
                        onChange={(v) => onChange(p.id, 'ticker', v)}
                        uppercase
                        placeholder="TSLA"
                        className="!text-sm !uppercase"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="text-text-muted text-[10px] uppercase tracking-wider block mb-1">Asset Class</label>
                      <AssetClassSelect
                        value={p.assetClass}
                        onChange={(val) => onChange(p.id, 'assetClass', val)}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-text-muted text-[10px] uppercase tracking-wider block mb-1">Date</label>
                      <input
                        type="date"
                        value={p.purchaseDate}
                        onChange={(e) => onChange(p.id, 'purchaseDate', e.target.value)}
                        className="!text-sm"
                      />
                    </div>
                    <div className="sm:col-span-1 flex items-end justify-center">
                      <button
                        onClick={() => onRemove(p.id)}
                        className="p-2 rounded-lg text-text-muted hover:text-debt-red hover:bg-red-dim transition-all"
                        aria-label={`Remove ${p.name}`}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="text-text-muted text-[10px] uppercase tracking-wider block mb-1">Quantity</label>
                      <DebouncedInput
                        type="number"
                        value={p.quantity || ''}
                        onChange={(v) => onChange(p.id, 'quantity', v)}
                        parseNumber
                        min="0" step="0.01"
                        className="!text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-text-muted text-[10px] uppercase tracking-wider block mb-1">
                        Purchase Price ({symbol})
                      </label>
                      <DebouncedInput
                        type="number"
                        value={p.purchasePrice || ''}
                        onChange={(v) => onChange(p.id, 'purchasePrice', v)}
                        parseNumber
                        min="0" step="0.01"
                        className="!text-sm"
                      />
                    </div>
                  </div>

                  {/* ── Confirm / Cancel bar ── */}
                  {(() => {
                    const posValid = p.quantity > 0 && p.purchasePrice > 0;
                    return (
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border-subtle">
                        <span className="text-[11px] text-text-muted">
                          {posValid ? (
                            <span className="text-teal flex items-center gap-1">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                              Ready to save
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                              Fill quantity &amp; price
                            </span>
                          )}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onCancelPosition(p.id)}
                            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg border border-border-medium text-text-muted text-xs font-semibold hover:text-text-primary hover:border-border-strong transition-all"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                            Cancel
                          </button>
                          <button
                            onClick={() => onConfirmPosition(p.id)}
                            disabled={!posValid}
                            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                              posValid
                                ? 'bg-teal/15 border border-teal/40 text-teal hover:bg-teal/25'
                                : 'bg-bg-elevated border border-border-subtle text-text-muted/40 cursor-not-allowed'
                            }`}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                            Confirm
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Totals footer */}
      <div className="bg-bg-elevated/60 border-t border-border-medium px-4 py-3">
        <div className="grid grid-cols-12 gap-2 items-center">
          <div className="col-span-1">
            <span
              className="inline-flex items-center justify-center w-7 h-7 rounded-lg flex-shrink-0"
              style={{ backgroundColor: `${assetClass.color}15`, color: assetClass.color }}
            >
              {safeIcon(assetClass.value, assetClass.color)}
            </span>
          </div>
          <div className="col-span-3">
            <div className="text-[10px] text-text-muted uppercase tracking-wider">Total</div>
            <div className="text-xs text-text-secondary font-medium">{group.positions.length} positions</div>
          </div>
          <div className="col-span-2 text-right">
            <div className="text-[10px] text-text-muted uppercase tracking-wider">Units</div>
            <div className="text-sm font-bold text-text-primary font-mono tabular-nums">
              {totalUnits.toLocaleString(undefined, { maximumFractionDigits: 6 })}
            </div>
          </div>
          <div className="col-span-2 text-right">
            <div className="text-[10px] text-text-muted uppercase tracking-wider">Avg Price</div>
            <div className="text-sm font-semibold text-teal font-mono tabular-nums">
              {safeCurrency(formatCurrencyExact, avgPrice)}
            </div>
          </div>
          <div className="col-span-3 text-right">
            <div className="text-[10px] text-text-muted uppercase tracking-wider">Cost Basis</div>
            <div className="text-sm font-bold text-text-primary font-mono tabular-nums">
              {safeCurrency(formatCurrencyExact, totalCost)}
            </div>
          </div>
          <div className="col-span-1"></div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   Single-item edit form (for holdings that aren't grouped)
   ══════════════════════════════════════════════════════════════════ */
function SingleEditForm({ h, onChange, onRemove, onConfirm, onCancel, mode, symbol }) {
  const hasNegativeQty = h.quantity !== undefined && h.quantity !== '' && Number(h.quantity) < 0;
  const hasNegativePrice = h.purchasePrice !== undefined && h.purchasePrice !== '' && Number(h.purchasePrice) < 0;
  const isValid = (h.ticker && h.ticker.trim()) && h.quantity > 0 && h.purchasePrice > 0;

  return (
    <div className="bg-bg-elevated/60 border border-teal/20 rounded-xl p-4 -mt-1 mb-1 animate-in">
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 mb-3">
        <div className="sm:col-span-4">
          <label className="text-text-muted text-[10px] uppercase tracking-wider block mb-1">Name</label>
          <DebouncedInput
            type="text"
            value={h.name}
            onChange={(v) => onChange(h.id, 'name', v)}
            placeholder="e.g. Apple Inc."
            className="!text-sm"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-text-muted text-[10px] uppercase tracking-wider block mb-1">
            Ticker <span className="text-red-400">*</span>
          </label>
          <DebouncedInput
            type="text"
            value={h.ticker}
            onChange={(v) => onChange(h.id, 'ticker', v)}
            uppercase
            placeholder="AAPL"
            className={`!text-sm !uppercase ${!h.ticker?.trim() ? '!border-red-400/40' : ''}`}
          />
        </div>
        <div className="sm:col-span-3">
          <label className="text-text-muted text-[10px] uppercase tracking-wider block mb-1">Asset Class</label>
          <AssetClassSelect
            value={h.assetClass}
            onChange={(val) => onChange(h.id, 'assetClass', val)}
          />
        </div>
        <div className="sm:col-span-2 flex items-end">
          <div className="w-full">
            <label className="text-text-muted text-[10px] uppercase tracking-wider block mb-1">Date</label>
            <input
              type="date"
              value={h.purchaseDate}
              onChange={(e) => onChange(h.id, 'purchaseDate', e.target.value)}
              className="!text-sm"
            />
          </div>
        </div>
        <div className="sm:col-span-1 flex items-end justify-center">
          <button
            onClick={() => onRemove(h.id)}
            className="p-2 rounded-lg text-text-muted hover:text-debt-red hover:bg-red-dim transition-all"
            aria-label={`Remove ${h.name}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div>
          <label className="text-text-muted text-[10px] uppercase tracking-wider block mb-1">
            Quantity <span className="text-red-400">*</span>
          </label>
          <DebouncedInput
            type="number"
            value={h.quantity || ''}
            onChange={(v) => onChange(h.id, 'quantity', v)}
            parseNumber
            min="0" step="0.01"
            className={`!text-sm ${!h.quantity || h.quantity <= 0 ? '!border-red-400/40' : ''}`}
          />
          {hasNegativeQty && <p className="text-[10px] text-red-400 mt-1">Quantity must be positive</p>}
        </div>
        <div>
          <label className="text-text-muted text-[10px] uppercase tracking-wider block mb-1">
            Purchase Price ({symbol}) <span className="text-red-400">*</span>
          </label>
          <DebouncedInput
            type="number"
            value={h.purchasePrice || ''}
            onChange={(v) => onChange(h.id, 'purchasePrice', v)}
            parseNumber
            min="0" step="0.01"
            className={`!text-sm ${!h.purchasePrice || h.purchasePrice <= 0 ? '!border-red-400/40' : ''}`}
          />
          {hasNegativePrice && <p className="text-[10px] text-red-400 mt-1">Price must be positive</p>}
        </div>
      </div>

      {/* ── Confirm / Cancel bar ── */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border-subtle">
        <span className="text-[11px] text-text-muted">
          {isValid ? (
            <span className="text-teal flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              Ready to save
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              Fill ticker, quantity &amp; price
            </span>
          )}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={onCancel}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg border border-border-medium text-text-muted text-xs font-semibold hover:text-text-primary hover:border-border-strong transition-all"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!isValid}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isValid
                ? 'bg-teal/15 border border-teal/40 text-teal hover:bg-teal/25'
                : 'bg-bg-elevated border border-border-subtle text-text-muted/40 cursor-not-allowed'
            }`}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   Main panel
   ══════════════════════════════════════════════════════════════════ */
export default function PortfolioInputPanel({ holdings, setHoldings, mode }) {
  const { symbol, formatCurrencyExact } = useCurrency();
  const [expandedGroup, setExpandedGroup] = useState(null);  // group key
  const [editingId, setEditingId] = useState(null);           // position id (within group)
  const [searchQuery, setSearchQuery] = useState('');
  const panelRef = useRef(null);
  const justAddedRef = useRef(null);       // ID of holding just added (for scroll)
  const scrollTargetRef = useRef(null);    // DOM ref for scroll-into-view

  /* ─── Helper: is a holding "empty" (no meaningful data entered)? ─── */
  const isEmptyHolding = useCallback((h) => {
    return !h.ticker && !h.name && (!h.quantity || h.quantity <= 0) && (!h.purchasePrice || h.purchasePrice <= 0);
  }, []);

  /* ─── Helper: is a position "empty" (pre-filled ticker/name but no qty/price)? ─── */
  const isEmptyPosition = useCallback((h) => {
    return (!h.quantity || h.quantity <= 0) && (!h.purchasePrice || h.purchasePrice <= 0);
  }, []);

  // Build groups from flat holdings
  const groups = useMemo(() => buildGroups(holdings), [holdings]);

  // Keep expandedGroup in sync when editing causes group key to change
  // (e.g. typing a ticker that merges the holding into an existing group)
  useEffect(() => {
    if (!expandedGroup) return;
    const stillExists = groups.some(g => g.key === expandedGroup);
    if (!stillExists && editingId) {
      const newGroup = groups.find(g => g.positions.some(p => p.id === editingId));
      if (newGroup) setExpandedGroup(newGroup.key);
    }
  }, [groups, expandedGroup, editingId]);

  /* ─── Click-outside: auto-remove fully empty holdings when user clicks away ─── */
  useEffect(() => {
    const handler = (e) => {
      // Ignore clicks on portal-based dropdowns (e.g. AssetClassSelect)
      if (e.target.closest?.('[data-portfolio-panel]')) return;
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        // Clicked outside the portfolio holdings panel — purge fully empty holdings & collapse them
        setHoldings(prev => {
          const cleaned = prev.filter(h => !isEmptyHolding(h));
          return cleaned.length !== prev.length ? cleaned : prev;
        });
        // Collapse the expanded group only if it was a fully empty holding
        setExpandedGroup(prev => {
          if (prev) {
            const group = groups.find(g => g.key === prev);
            if (group && group.isSingle) {
              const h = group.positions[0];
              if (isEmptyHolding(h)) return null;
            }
          }
          return prev;
        });
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [groups, setHoldings, isEmptyHolding]);

  /* ─── Auto-scroll to newly added holding ─── */
  useEffect(() => {
    if (justAddedRef.current && scrollTargetRef.current) {
      scrollTargetRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      justAddedRef.current = null;
    }
  });

  // Filter groups by search
  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return groups;
    const q = searchQuery.toLowerCase();
    return groups.filter(g =>
      g.positions.some(p =>
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.ticker && p.ticker.toLowerCase().includes(q)) ||
        (p.assetClass && p.assetClass.toLowerCase().includes(q))
      )
    );
  }, [groups, searchQuery]);

  /* ─── Purge all empty holdings AND empty positions except the one currently being edited ─── */
  const purgeEmpties = useCallback((exceptId = null) => {
    setHoldings(prev => {
      const cleaned = prev.filter(h => {
        if (h.id === exceptId) return true;
        // Remove fully empty holdings
        if (isEmptyHolding(h)) return false;
        // Remove empty positions (has ticker/name but 0 qty AND 0 price)
        if (isEmptyPosition(h)) return false;
        return true;
      });
      return cleaned.length !== prev.length ? cleaned : prev; // avoid unnecessary re-render
    });
  }, [isEmptyHolding, isEmptyPosition, setHoldings]);

  const handleAdd = () => {
    // Purge any existing empties first (prevents stacking from rapid clicks)
    const blank = createBlankHolding();
    setHoldings(prev => {
      const cleaned = prev.filter(h => !isEmptyHolding(h));
      return [...cleaned, blank];
    });
    setExpandedGroup(blank.id);
    setEditingId(blank.id);
    setSearchQuery('');
    justAddedRef.current = blank.id; // trigger auto-scroll on next render
  };

  const handleAddPosition = (ticker, templateHolding) => {
    // Purge empties first, then add the new pre-filled position
    const blank = createBlankHolding();
    blank.ticker = templateHolding.ticker;
    blank.name = templateHolding.name;
    blank.assetClass = templateHolding.assetClass;
    setHoldings(prev => {
      // Purge fully empty holdings AND empty positions (0 qty + 0 price)
      const cleaned = prev.filter(h => !isEmptyHolding(h) && !isEmptyPosition(h));
      return [...cleaned, blank];
    });
    setEditingId(blank.id);
    justAddedRef.current = blank.id; // trigger auto-scroll on next render
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

  const toggleGroup = (key) => {
    // When collapsing a group, purge any empty holdings that were left behind
    purgeEmpties();
    setExpandedGroup(prev => prev === key ? null : key);
    setEditingId(null);
  };

  /* ─── Confirm: collapse the form (holding data is already saved via onChange) ─── */
  const handleConfirmHolding = () => {
    setExpandedGroup(null);
    setEditingId(null);
  };

  /* ─── Cancel: remove holding if empty, otherwise just collapse ─── */
  const handleCancelHolding = (id) => {
    const h = holdings.find(h => h.id === id);
    if (h && (isEmptyHolding(h) || isEmptyPosition(h))) {
      setHoldings(prev => prev.filter(x => x.id !== id));
    }
    setExpandedGroup(null);
    setEditingId(null);
  };

  /* ─── Confirm position: close inline edit ─── */
  const handleConfirmPosition = (id) => {
    setEditingId(null);
  };

  /* ─── Cancel position: remove if empty (0 qty + 0 price), otherwise close edit ─── */
  const handleCancelPosition = (id) => {
    const h = holdings.find(h => h.id === id);
    if (h && isEmptyPosition(h)) {
      setHoldings(prev => prev.filter(x => x.id !== id));
    }
    setEditingId(null);
  };

  const showSearch = holdings.length >= 6;
  const showScroll = filtered.length > 6;

  // Unique tickers count for the badge
  const uniqueCount = groups.length;

  return (
    <div className="card" ref={panelRef}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <h2 className="section-accent font-heading text-lg font-bold text-text-primary">
            Portfolio Holdings
          </h2>
          {holdings.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal/10 text-teal border border-teal/20 tabular-nums">
                {uniqueCount} {uniqueCount === 1 ? 'asset' : 'assets'}
              </span>
              {holdings.length !== uniqueCount && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple/10 text-purple border border-purple/20 tabular-nums">
                  {holdings.length} positions
                </span>
              )}
            </div>
          )}
        </div>
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

      {/* Search */}
      {showSearch && (
        <div className="relative mb-4">
          <svg
            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
          >
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, ticker, or class..."
            className="!text-sm !pl-10 w-full"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>
      )}

      {/* Content */}
      {holdings.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">📊</div>
          <p className="text-text-secondary mb-2">No holdings yet</p>
          <p className="text-text-muted text-sm">Click "Add Holding" to start building your portfolio</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-text-muted text-sm">No holdings match "{searchQuery}"</p>
        </div>
      ) : (
        <div
          className={`space-y-2 ${showScroll ? 'max-h-[520px] overflow-y-auto pr-1 scrollbar-thin' : ''}`}
          style={showScroll ? {
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(94,234,212,0.2) transparent',
          } : undefined}
        >
          {filtered.map((group) => {
            const isExpanded = expandedGroup === group.key;

            // Single holding (no group) — use original compact row + edit form
            if (group.isSingle) {
              const h = group.positions[0];
              const isJustAdded = justAddedRef.current === h.id;
              return (
                <div key={group.key} ref={isJustAdded ? scrollTargetRef : undefined}>
                  <SingleRow
                    h={h}
                    isExpanded={isExpanded}
                    onToggle={() => toggleGroup(group.key)}
                    formatCurrencyExact={formatCurrencyExact}
                  />
                  {isExpanded && (
                    <SingleEditForm
                      h={h}
                      onChange={handleChange}
                      onRemove={handleRemove}
                      onConfirm={handleConfirmHolding}
                      onCancel={() => handleCancelHolding(h.id)}
                      mode={mode}
                      symbol={symbol}
                    />
                  )}
                </div>
              );
            }

            // Multi-position group — show group header + positions table
            return (
              <div key={group.key}>
                <GroupHeader
                  group={group}
                  isExpanded={isExpanded}
                  onToggle={() => toggleGroup(group.key)}
                  formatCurrencyExact={formatCurrencyExact}
                />
                {isExpanded && (
                  <PositionsPanel
                    group={group}
                    editingId={editingId}
                    onEdit={setEditingId}
                    onChange={handleChange}
                    onRemove={handleRemove}
                    onAddPosition={() => handleAddPosition(group.ticker, group.positions[0])}
                    onConfirmPosition={handleConfirmPosition}
                    onCancelPosition={handleCancelPosition}
                    mode={mode}
                    symbol={symbol}
                    formatCurrencyExact={formatCurrencyExact}
                    justAddedId={justAddedRef.current}
                    scrollTargetRef={scrollTargetRef}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Collapse all */}
      {expandedGroup && groups.length > 1 && (
        <button
          onClick={() => { purgeEmpties(); setExpandedGroup(null); setEditingId(null); }}
          className="mt-3 w-full py-2 text-xs font-medium text-text-muted hover:text-teal border border-border-subtle hover:border-teal/30 rounded-xl transition-all"
        >
          Collapse All
        </button>
      )}
    </div>
  );
}
