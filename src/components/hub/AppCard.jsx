import React from 'react';

function AppIcon({ icon }) {
  if (icon === 'flame') {
    return (
      <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
      </svg>
    );
  }
  if (icon === 'trending-up') {
    return (
      <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
        <polyline points="17 6 23 6 23 12"/>
      </svg>
    );
  }
  if (icon === 'bar-chart') {
    return (
      <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
        <line x1="2" y1="20" x2="22" y2="20"/>
      </svg>
    );
  }
  return null;
}

function SmallAppIcon({ icon, size = 16 }) {
  if (icon === 'flame') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
      </svg>
    );
  }
  if (icon === 'trending-up') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
        <polyline points="17 6 23 6 23 12"/>
      </svg>
    );
  }
  if (icon === 'bar-chart') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
        <line x1="2" y1="20" x2="22" y2="20"/>
      </svg>
    );
  }
  return null;
}

function CheckIcon({ color }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}

export { SmallAppIcon };

export default function AppCard({ app, onLaunch }) {
  const { id, name, status, tagline, description, features, launchLabel, icon, accentStart, accentEnd, accentClass, glowColor } = app;
  const isLive = status === 'live';

  return (
    <article
      className={`card card-accent-${accentClass} flex flex-col h-full !p-10 !rounded-2xl relative overflow-hidden`}
      aria-label={`${name} — ${tagline}`}
      style={isLive ? { borderColor: `${accentStart}30` } : undefined}
    >
      {/* Subtle inner gradient glow for live card */}
      {isLive && (
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{ background: `radial-gradient(ellipse at top left, ${accentStart}, transparent 70%)` }}
        />
      )}

      {/* Icon badge + status row */}
      <div className="flex items-start justify-between mb-8 relative z-10">
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center shrink-0"
          style={{ background: `linear-gradient(135deg, ${accentStart}, ${accentEnd})`, boxShadow: `0 8px 32px ${glowColor}` }}
        >
          <AppIcon icon={icon} />
        </div>
        {isLive ? (
          <span className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold tracking-wide bg-green/10 text-green border border-green/20">
            <span className="w-2.5 h-2.5 rounded-full bg-green inline-block animate-pulse" />
            LIVE
          </span>
        ) : (
          <span className="px-4 py-2 rounded-full text-sm font-bold tracking-wide bg-amber/8 text-amber border border-amber/20 border-dashed">
            COMING SOON
          </span>
        )}
      </div>

      {/* Name + tagline + description */}
      <div className="relative z-10">
        <h2
          className="text-3xl font-bold font-heading mb-2"
          style={{ background: `linear-gradient(135deg, ${accentStart}, ${accentEnd})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
        >
          {name}
        </h2>
        <p className="text-text-primary text-lg font-medium mb-2">{tagline}</p>
        <p className="text-text-muted text-sm mb-7 leading-relaxed">{description}</p>
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-border-medium to-transparent mb-7 relative z-10" />

      {/* Features */}
      <ul className="space-y-4 mb-10 flex-1 relative z-10">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-3 text-base text-text-secondary">
            <CheckIcon color={accentStart} />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <div className="relative z-10">
        {isLive ? (
          <button
            onClick={() => onLaunch(id)}
            aria-label={`Launch ${name} — ${tagline}`}
            className="w-full py-5 rounded-2xl text-lg font-bold tracking-wide text-white transition-all hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
            style={{ background: `linear-gradient(135deg, ${accentStart}, ${accentEnd})`, boxShadow: `0 6px 24px ${glowColor}` }}
          >
            {launchLabel} →
          </button>
        ) : (
          <button
            disabled
            aria-disabled="true"
            aria-label={`${name} — coming soon`}
            className="w-full py-5 rounded-2xl text-lg font-bold tracking-wide border border-border-medium text-text-muted cursor-not-allowed"
          >
            {launchLabel}
          </button>
        )}
      </div>
    </article>
  );
}
