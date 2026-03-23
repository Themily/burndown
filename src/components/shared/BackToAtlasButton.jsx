import React from 'react';

export default function BackToAtlasButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label="Back to Atlas Health hub"
      className="flex items-center gap-1.5 text-sm font-medium text-text-muted hover:opacity-70 transition-opacity group"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-0.5 transition-transform">
        <polyline points="15 18 9 12 15 6"/>
      </svg>
      <span className="atlas-text font-semibold hidden sm:inline">Atlas</span>
    </button>
  );
}
