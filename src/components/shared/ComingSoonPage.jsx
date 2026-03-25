import React, { useState } from 'react';
import { APP_CONFIGS } from '../../config/apps';
import BackToAtlasButton from './BackToAtlasButton';

export default function ComingSoonPage({ appId, onBackToHub, focusRef }) {
  const app = APP_CONFIGS.find(a => a.id === appId);
  const [notified, setNotified] = useState(false);

  if (!app) return null;

  const { name, tagline, features, accentStart, accentEnd, glowColor } = app;

  return (
    <main
      role="main"
      aria-label={`${name} — coming soon`}
      className="min-h-screen flex flex-col items-center justify-start pt-10 px-4 pb-16 slide-in-right"
    >
      <div tabIndex={-1} ref={focusRef} className="outline-none" />

      {/* Back button */}
      <div className="w-full max-w-xl mb-8 flex">
        <BackToAtlasButton onClick={onBackToHub} />
      </div>

      <div className="card !p-8 md:!p-12 w-full max-w-xl text-center">
        {/* Icon badge */}
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6"
          style={{ background: `linear-gradient(135deg, ${accentStart}, ${accentEnd})`, boxShadow: `0 8px 32px ${glowColor}` }}
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>

        {/* Status chip */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber/30 bg-amber/8 mb-4">
          <span className="w-2 h-2 rounded-full bg-amber animate-pulse inline-block" />
          <span className="text-amber text-xs font-bold tracking-wider">WE'RE BUILDING THIS</span>
        </div>

        {/* App name */}
        <h1
          className="font-heading text-3xl font-bold mb-2"
          style={{ background: `linear-gradient(135deg, ${accentStart}, ${accentEnd})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
        >
          {name}
        </h1>
        <p className="text-text-secondary text-base mb-8 leading-relaxed">{tagline}</p>

        {/* Feature list preview */}
        <ul className="space-y-3 mb-8 text-left">
          {features.map((f, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-text-secondary">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={accentStart} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span>{f}</span>
            </li>
          ))}
        </ul>

        {/* Notify me */}
        {!notified ? (
          <div className="bg-bg-elevated rounded-xl p-4 border border-border-subtle mb-6">
            <p className="text-text-secondary text-sm mb-3">Get a reminder when it launches:</p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="your@email.com"
                readOnly
                className="flex-1 text-sm opacity-50 cursor-not-allowed"
                aria-label="Email notification (not yet active)"
              />
              <button
                onClick={() => setNotified(true)}
                className="px-4 py-2.5 rounded-xl text-sm font-bold text-white whitespace-nowrap"
                style={{ background: `linear-gradient(135deg, ${accentStart}, ${accentEnd})` }}
              >
                Notify me
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-green/8 border border-green/20 rounded-xl p-4 mb-6 text-green text-sm">
            ✓ Got it — no data is stored, this is just a reminder for yourself.
          </div>
        )}

        {/* Back to atlas */}
        <button
          onClick={onBackToHub}
          className="w-full py-3 rounded-xl text-sm font-bold border border-border-medium text-text-secondary hover:text-text-primary transition-colors"
        >
          ← Back to Atlas Wealth
        </button>
      </div>
    </main>
  );
}
