import React, { useState, useCallback } from 'react';

export default function ShareSection() {
  const [copiedLink, setCopiedLink] = useState(false);

  const handleEmail = useCallback(() => {
    const subject = encodeURIComponent('Atlas Wealth — Financial Tools');
    const body = encodeURIComponent(
      `Check out Atlas Wealth, a suite of financial planning tools:\n\n${window.location.href}`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`, '_self');
  }, []);

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    });
  }, []);

  const handleTwitter = useCallback(() => {
    const text = encodeURIComponent('Check out Atlas Wealth — free financial planning tools for budgeting, debt freedom, and wealth building!');
    const url = encodeURIComponent(window.location.href);
    window.open(`https://x.com/intent/tweet?text=${text}&url=${url}`, '_blank', 'noopener,noreferrer');
  }, []);

  const handleInstagram = useCallback(() => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
      window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer');
    });
  }, []);

  return (
    <div className="card mx-4 mb-10 print:hidden print-hidden-capture">
      <h2 className="font-heading text-lg font-semibold mb-4">Like this? Please share</h2>
      <div className="flex items-center gap-3 flex-wrap">
        {/* Email */}
        <button
          onClick={handleEmail}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border-subtle hover:border-border-medium text-text-secondary hover:text-text-primary transition-all backdrop-blur-xl"
          aria-label="Share by email"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2"/>
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
          </svg>
          <span className="text-sm font-medium">Email</span>
        </button>

        {/* Copy Link */}
        <button
          onClick={handleCopyLink}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border transition-all backdrop-blur-xl ${
            copiedLink
              ? 'border-green/40 text-green bg-green-dim'
              : 'border-border-subtle hover:border-border-medium text-text-secondary hover:text-text-primary'
          }`}
          aria-label="Copy link to this page"
        >
          {copiedLink ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
          )}
          <span className="text-sm font-medium">{copiedLink ? 'Copied!' : 'Link'}</span>
        </button>

        {/* X (Twitter) */}
        <button
          onClick={handleTwitter}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border-subtle hover:border-border-medium text-text-secondary hover:text-text-primary transition-all backdrop-blur-xl"
          aria-label="Share on X"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
          <span className="text-sm font-medium">X</span>
        </button>

        {/* Instagram */}
        <button
          onClick={handleInstagram}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border-subtle hover:border-border-medium text-text-secondary hover:text-text-primary transition-all backdrop-blur-xl"
          aria-label="Share on Instagram"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
            <circle cx="12" cy="12" r="5"/>
            <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/>
          </svg>
          <span className="text-sm font-medium">Instagram</span>
        </button>
      </div>
    </div>
  );
}
