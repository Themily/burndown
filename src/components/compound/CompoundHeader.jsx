import React from 'react';
import CurrencySelector from '../CurrencySelector';
import BackToAtlasButton from '../shared/BackToAtlasButton';

const MODES = [
  { id: 'simple', label: 'Simple' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced', label: 'Advanced' },
];

export default function CompoundHeader({ mode = 'intermediate', onSetMode, currentPage = 'calculator', onNavigatePage, onBackToHub }) {
  return (
    <header className="pt-6 pb-16 px-4">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-8">
        {/* Left: Atlas back + Compound logo */}
        <div className="flex items-center gap-4">
          <BackToAtlasButton onClick={onBackToHub} />
          <div className="w-px h-5 bg-border-subtle" aria-hidden="true" />
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple to-[#a78bfa] flex items-center justify-center">
              <span className="text-sm font-bold text-white">C</span>
            </div>
            <span className="font-heading text-lg font-bold tracking-tight text-text-primary">Compound</span>
          </div>
        </div>

        {/* Center: mode pills */}
        <nav className="hidden md:flex items-center bg-bg-card border border-border-subtle rounded-full px-1.5 py-1 backdrop-blur-xl">
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => onSetMode(m.id)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                mode === m.id
                  ? 'bg-bg-elevated text-text-primary'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              {m.label}
            </button>
          ))}
        </nav>

        <CurrencySelector />
      </div>

      {/* Mobile mode selector */}
      <div className="flex md:hidden items-center justify-center gap-2 mb-8">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => onSetMode(m.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
              mode === m.id
                ? 'bg-purple/10 border-purple/50 text-purple'
                : 'border-border-subtle text-text-muted hover:text-text-secondary'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Hero text */}
      <div className="w-full text-center">
        <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-5">
          <span className="text-text-primary">Watch Your Money </span><span className="compound-text">Grow</span>
        </h1>
        <p className="text-text-secondary text-base md:text-lg font-light leading-relaxed mt-3 mb-6">
          Compound interest & investment growth projections.
          <span className="text-text-muted"> See how your money multiplies over time.</span>
        </p>
        <button
          onClick={() => { onNavigatePage('help'); window.scrollTo(0, 0); }}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-purple/40 bg-purple/10 text-purple font-bold text-sm tracking-wide hover:bg-purple/20 transition-all"
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
