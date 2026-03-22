import React, { useState } from 'react';
import { DEBT_TYPES } from '../utils/calculations';
import { useCurrency } from '../context/CurrencyContext';

function DebtForm({ debt, onSave, onCancel, isNew }) {
  const { symbol } = useCurrency();
  const [form, setForm] = useState({
    name: debt?.name || '',
    type: debt?.type || 'credit_card',
    balance: debt?.balance ?? '',
    apr: debt?.apr ?? '',
    minPayment: debt?.minPayment ?? '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.balance || !form.apr || !form.minPayment) return;
    onSave({
      ...debt,
      id: debt?.id || `debt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: form.name,
      type: form.type,
      balance: parseFloat(form.balance) || 0,
      apr: parseFloat(form.apr) || 0,
      minPayment: parseFloat(form.minPayment) || 0,
    });
  };

  const typeInfo = DEBT_TYPES.find(t => t.value === form.type);

  return (
    <form onSubmit={handleSubmit} className="bg-bg-input rounded-lg p-4 border border-border-subtle space-y-3 fade-in">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-text-muted text-xs uppercase tracking-wider block mb-1">Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g., Chase Sapphire"
            className="!text-sm"
            required
            aria-label="Debt name"
          />
        </div>
        <div>
          <label className="text-text-muted text-xs uppercase tracking-wider block mb-1">Type</label>
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="!text-sm"
            aria-label="Debt type"
          >
            {DEBT_TYPES.map(t => (
              <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-text-muted text-xs uppercase tracking-wider block mb-1">Balance ({symbol})</label>
          <input
            type="number"
            value={form.balance}
            onChange={(e) => setForm({ ...form, balance: e.target.value })}
            placeholder="8,200"
            step="0.01"
            min="0"
            required
            aria-label="Current balance"
          />
        </div>
        <div>
          <label className="text-text-muted text-xs uppercase tracking-wider block mb-1">APR (%)</label>
          <input
            type="number"
            value={form.apr}
            onChange={(e) => setForm({ ...form, apr: e.target.value })}
            placeholder="22.9"
            step="0.01"
            min="0"
            max="100"
            required
            aria-label="Annual percentage rate"
          />
        </div>
        <div>
          <label className="text-text-muted text-xs uppercase tracking-wider block mb-1">Min Payment ({symbol})</label>
          <input
            type="number"
            value={form.minPayment}
            onChange={(e) => setForm({ ...form, minPayment: e.target.value })}
            placeholder="205"
            step="0.01"
            min="0"
            required
            aria-label="Minimum monthly payment"
          />
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary rounded-lg border border-border-subtle hover:border-border-medium transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-bg-primary rounded-lg bg-gradient-to-r from-fire-start to-fire-end hover:opacity-90 transition-opacity"
        >
          {isNew ? 'Add Debt' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}

function DebtItem({ debt, index, onEdit, onDelete, onMoveUp, onMoveDown, isFirst, isLast }) {
  const { symbol, formatCurrencyExact } = useCurrency();
  const typeInfo = DEBT_TYPES.find(t => t.value === debt.type) || DEBT_TYPES[DEBT_TYPES.length - 1];

  return (
    <div className="debt-item rounded-2xl border border-border-subtle bg-bg-card backdrop-blur-xl group transition-all hover:border-border-medium" role="listitem">
      {/* Main row */}
      <div className="flex items-center gap-4 p-4">
        {/* Reorder arrows */}
        <div className="flex flex-col gap-1.5 shrink-0">
          <button
            onClick={onMoveUp}
            disabled={isFirst}
            className="w-6 h-6 flex items-center justify-center text-text-muted hover:text-text-primary disabled:opacity-20 text-xs rounded hover:bg-bg-input transition-colors"
            aria-label={`Move ${debt.name} up`}
          >▲</button>
          <button
            onClick={onMoveDown}
            disabled={isLast}
            className="w-6 h-6 flex items-center justify-center text-text-muted hover:text-text-primary disabled:opacity-20 text-xs rounded hover:bg-bg-input transition-colors"
            aria-label={`Move ${debt.name} down`}
          >▼</button>
        </div>

        {/* Icon */}
        <div className="text-3xl shrink-0" aria-hidden="true">{typeInfo.icon}</div>

        {/* Name + type */}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-base text-text-primary truncate">{debt.name}</div>
          <div className="text-text-muted text-sm mt-0.5">{typeInfo.label}</div>
        </div>

        {/* Stats block */}
        <div className="text-right shrink-0">
          <div className="font-mono text-lg font-bold text-debt-red tabular-nums">
            {symbol}{debt.balance.toLocaleString(undefined, { minimumFractionDigits: 0 })}
          </div>
          <div className="flex items-center gap-2 justify-end mt-1">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-bg-input text-xs font-mono text-amber tabular-nums">
              {debt.apr}% APR
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-bg-input text-xs font-mono text-text-secondary tabular-nums">
              {symbol}{debt.minPayment}/mo
            </span>
          </div>
        </div>

        {/* Action buttons — always visible, just subtle */}
        <div className="flex flex-col gap-1.5 shrink-0 opacity-40 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onEdit}
            className="w-8 h-8 flex items-center justify-center text-text-muted hover:text-teal hover:bg-bg-input rounded-lg transition-colors"
            aria-label={`Edit ${debt.name}`}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button
            onClick={onDelete}
            className="w-8 h-8 flex items-center justify-center text-text-muted hover:text-debt-red hover:bg-bg-input rounded-lg transition-colors"
            aria-label={`Delete ${debt.name}`}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DebtInputPanel({ debts, setDebts, extraPayment, setExtraPayment }) {
  const { symbol } = useCurrency();
  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleSave = (updatedDebt) => {
    if (debts.find(d => d.id === updatedDebt.id)) {
      setDebts(debts.map(d => d.id === updatedDebt.id ? updatedDebt : d));
    } else {
      setDebts([...debts, updatedDebt]);
    }
    setEditingId(null);
    setShowAddForm(false);
  };

  const handleDelete = (id) => {
    setDebts(debts.filter(d => d.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const handleMove = (index, direction) => {
    const newDebts = [...debts];
    const target = index + direction;
    if (target < 0 || target >= newDebts.length) return;
    [newDebts[index], newDebts[target]] = [newDebts[target], newDebts[index]];
    setDebts(newDebts);
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading text-lg font-semibold">Your Debts</h2>
        <button
          onClick={() => { setShowAddForm(true); setEditingId(null); }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-gradient-to-r from-fire-start to-fire-end text-bg-primary hover:opacity-90 transition-opacity"
          aria-label="Add new debt"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Debt
        </button>
      </div>

      {debts.length === 0 && !showAddForm ? (
        <div className="text-center py-12 text-text-secondary">
          <div className="text-4xl mb-4">🔥</div>
          <p className="text-lg font-light">Every FIRE journey starts with a single payment.</p>
          <p className="text-sm text-text-muted mt-1">Add your debts to see the path forward.</p>
        </div>
      ) : (
        <div className="space-y-2 mb-4" role="list" aria-label="Debt list">
          {debts.map((debt, index) => (
            editingId === debt.id ? (
              <DebtForm
                key={debt.id}
                debt={debt}
                onSave={handleSave}
                onCancel={() => setEditingId(null)}
                isNew={false}
              />
            ) : (
              <DebtItem
                key={debt.id}
                debt={debt}
                index={index}
                onEdit={() => { setEditingId(debt.id); setShowAddForm(false); }}
                onDelete={() => handleDelete(debt.id)}
                onMoveUp={() => handleMove(index, -1)}
                onMoveDown={() => handleMove(index, 1)}
                isFirst={index === 0}
                isLast={index === debts.length - 1}
              />
            )
          ))}
        </div>
      )}

      {showAddForm && (
        <DebtForm
          onSave={handleSave}
          onCancel={() => setShowAddForm(false)}
          isNew={true}
        />
      )}

      <div className="mt-5 pt-5 border-t border-border-subtle">
        <label className="text-text-muted text-sm uppercase tracking-wider font-medium block mb-2">
          Extra Monthly Snowball Payment
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted font-mono text-base">{symbol}</span>
          <input
            type="number"
            value={extraPayment}
            onChange={(e) => setExtraPayment(Math.max(0, parseFloat(e.target.value) || 0))}
            className="!pl-9 !py-3 !text-base !font-mono"
            min="0"
            step="50"
            aria-label="Extra monthly payment amount"
          />
        </div>
        <p className="text-text-muted text-sm mt-2">
          Money above minimums to throw at your target debt each month.
        </p>
      </div>
    </div>
  );
}
