import { createContext, useContext, useMemo } from 'react';
import {
  formatCurrency as fc,
  formatCurrencyExact as fce,
  getCurrencySymbol,
} from '../utils/calculations';

const CurrencyContext = createContext(null);

export function CurrencyProvider({ currency, setCurrency, children }) {
  const value = useMemo(() => ({
    currency,
    setCurrency,
    symbol: getCurrencySymbol(currency),
    formatCurrency: (amount) => fc(amount, currency),
    formatCurrencyExact: (amount) => fce(amount, currency),
  }), [currency, setCurrency]);

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
}
