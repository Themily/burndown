import React from 'react';

export default function AtlasHubHeader() {
  return (
    <header className="pb-6 px-4 text-center w-full">
      {/* Trust signal row */}
      <div className="inline-flex flex-wrap items-center justify-center gap-x-8 gap-y-3 px-8 py-4 rounded-2xl bg-bg-card/50 border border-border-subtle backdrop-blur-xl text-sm text-text-muted">
        <span className="flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          No account required
        </span>
        <span className="text-border-medium hidden sm:inline">·</span>
        <span className="flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          Data stays on your device
        </span>
        <span className="text-border-medium hidden sm:inline">·</span>
        <span className="flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
          Open in browser, no install
        </span>
      </div>
    </header>
  );
}
