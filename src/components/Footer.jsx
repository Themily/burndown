import React from 'react';

export default function Footer() {
  return (
    <footer className="mx-4 mb-8 mt-4">
      <div className="card !py-6 !px-8">
        <h3 className="text-text-secondary text-sm font-semibold uppercase tracking-wider mb-3 flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          Disclaimer
        </h3>
        <ul className="text-text-muted text-xs leading-relaxed space-y-2 list-disc list-inside">
          <li>BurnDown is a planning tool for <strong className="text-text-secondary">educational purposes only</strong> and does not constitute financial advice.</li>
          <li>Results are estimates based on the inputs provided and assume consistent payments with no changes in interest rates. Actual payoff timelines may vary.</li>
          <li>The 4% rule and 25x multiplier for FI Number are simplified projections based on historical market returns and are not guaranteed.</li>
          <li>Always consult a qualified financial advisor for personalized guidance before making financial decisions.</li>
        </ul>
        <div className="border-t border-border-subtle mt-4 pt-3 text-center">
          <p className="text-text-muted/50 text-xs">
            Built for the FIRE community. All calculations run locally in your browser — your data never leaves your device.
          </p>
        </div>
      </div>
    </footer>
  );
}
