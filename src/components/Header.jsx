import React from 'react';
import CurrencySelector from './CurrencySelector';

export default function Header({ currentPage = 'dashboard', setCurrentPage = () => {} }) {
  return (
    <header className="pt-6 pb-16 px-4">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-fire-start to-fire-end flex items-center justify-center">
            <span className="text-sm font-bold text-white">B</span>
          </div>
          <span className="font-heading text-lg font-bold tracking-tight text-text-primary">BurnDown</span>
        </div>

        {/* Center nav pills */}
        <nav className="hidden md:flex items-center bg-bg-card border border-border-subtle rounded-full px-1.5 py-1 backdrop-blur-xl">
          <button
            onClick={() => { setCurrentPage('dashboard'); window.scrollTo(0, 0); }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${currentPage === 'dashboard' ? 'bg-bg-elevated text-text-primary' : 'text-text-muted hover:text-text-secondary'}`}
          >Dashboard</button>
          <span className="px-4 py-1.5 rounded-full text-text-muted text-sm cursor-default">Timeline</span>
          <span className="px-4 py-1.5 rounded-full text-text-muted text-sm cursor-default">FIRE Plan</span>
        </nav>

        <CurrencySelector />
      </div>

      {/* Hero text */}
      <div className="w-full text-center">
        <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-5">
          <span className="text-text-primary">Take Control </span><span className="fire-text">of your Debt</span>
        </h1>
        <p className="text-text-secondary text-base md:text-lg font-light leading-relaxed mt-3 mb-6">
          Burn your debt. Fuel your <span className="fire-text font-semibold">FIRE</span>.
          <span className="text-text-muted"> Strategic debt elimination for financial independence.</span>
        </p>
        <button
          onClick={() => { setCurrentPage('help'); window.scrollTo(0, 0); }}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-fire-start/40 bg-fire-start/10 text-fire-start font-bold text-sm tracking-wide hover:bg-fire-start/20 transition-all"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          How does this work? Read the Help guide
        </button>
      </div>
    </header>
  );
}
