import React from 'react';
import { CURRENCIES } from '../utils/calculations';
import { useCurrency } from '../context/CurrencyContext';

export default function CurrencySelector() {
  const { currency, setCurrency, symbol } = useCurrency();

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-fire-start text-sm pointer-events-none">
          {symbol}
        </span>
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          className="appearance-none bg-bg-card border border-border-subtle hover:border-border-medium text-text-primary font-mono text-xs rounded-full pl-8 pr-7 py-2 cursor-pointer transition-all focus:outline-none focus:border-purple/50 backdrop-blur-xl"
          aria-label="Select display currency"
        >
          {CURRENCIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.label}
            </option>
          ))}
        </select>
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none text-xs">
          ▾
        </span>
      </div>
    </div>
  );
}
