import React from 'react';
import AtlasHubHeader from './AtlasHubHeader';
import ProductCardsGrid from './ProductCardsGrid';
import ShareSection from '../ShareSection';
import Footer from '../Footer';
import AtlasHubFooter from './AtlasHubFooter';

function AtlasGlobeMark() {
  return (
    <svg width="48" height="48" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="atlas-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8b7cf7" />
          <stop offset="100%" stopColor="#2DD4BF" />
        </linearGradient>
      </defs>
      <circle cx="22" cy="22" r="19" stroke="url(#atlas-grad)" strokeWidth="2" fill="none" />
      <ellipse cx="22" cy="22" rx="9" ry="19" stroke="url(#atlas-grad)" strokeWidth="1.5" fill="none" opacity="0.7" />
      <line x1="3" y1="22" x2="41" y2="22" stroke="url(#atlas-grad)" strokeWidth="1.5" opacity="0.6" />
      <line x1="5" y1="13" x2="39" y2="13" stroke="url(#atlas-grad)" strokeWidth="1" opacity="0.4" />
      <line x1="5" y1="31" x2="39" y2="31" stroke="url(#atlas-grad)" strokeWidth="1" opacity="0.4" />
    </svg>
  );
}

export default function AtlasHubPage({ onLaunchApp, focusRef }) {
  return (
    <main
      role="main"
      aria-label="Atlas Wealth financial tools hub"
      className="fade-in min-h-screen flex flex-col"
    >
      <div tabIndex={-1} ref={focusRef} className="outline-none" />

      {/* Logo + headline pinned to the top */}
      <div className="text-center pt-8 px-4">
        <div className="flex items-center justify-center gap-3 mb-6">
          <AtlasGlobeMark />
          <div className="text-left">
            <span className="atlas-text font-heading text-2xl font-bold tracking-tight leading-none block">Atlas</span>
            <span className="text-text-muted text-sm tracking-widest uppercase leading-none">Wealth</span>
          </div>
        </div>
        <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight mb-3">
          <span className="text-text-primary">Your financial </span>
          <span className="atlas-text">command centre</span>
        </h1>
        <p className="text-text-secondary text-base md:text-lg font-light leading-relaxed mb-2">
          Free tools for budgeting, debt freedom, and wealth building —
          all running locally in your browser.
        </p>

        {/* Stats counter row */}
        <p className="text-text-muted text-sm mb-6">
          <span className="text-green font-semibold">3</span> tools live
        </p>
      </div>

      {/* Centered content */}
      <div className="flex-1 flex flex-col justify-center">
        <AtlasHubHeader />

        {/* Gradient divider */}
        <div className="mx-4 mb-8">
          <div className="h-px bg-gradient-to-r from-transparent via-purple/30 to-transparent" />
        </div>

        <ProductCardsGrid onLaunch={onLaunchApp} />
      </div>

      <ShareSection />
      <Footer />
      <AtlasHubFooter />
    </main>
  );
}
