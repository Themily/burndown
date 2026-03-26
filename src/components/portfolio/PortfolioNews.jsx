import React, { useState } from 'react';

// Source-specific branded banners
const SOURCE_BANNERS = {
  'Google News': {
    gradient: 'from-[#174ea6]/30 via-[#1a73e8]/15 to-[#4285f4]/10',
    colors: ['#4285F4', '#EA4335', '#FBBC05', '#34A853'],
    label: 'Google News',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
        <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12s4.48 10 10 10 10-4.48 10-10z" fill="#4285F4" opacity="0.15"/>
        <path d="M12 7v10M7 12h10" stroke="#4285F4" strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="12" cy="12" r="3" fill="#EA4335" opacity="0.6"/>
      </svg>
    ),
  },
  'OilPrice': {
    gradient: 'from-[#1a1a2e]/60 via-[#16213e]/40 to-[#0f3460]/20',
    colors: ['#e94560', '#ff6b6b'],
    label: 'OilPrice.com',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
        <path d="M12 2C12 2 6 10 6 14a6 6 0 0 0 12 0c0-4-6-12-6-12z" fill="#e94560" opacity="0.25" stroke="#e94560" strokeWidth="1.5"/>
        <path d="M12 8c0 0-3 4-3 6a3 3 0 0 0 6 0c0-2-3-6-3-6z" fill="#ff6b6b" opacity="0.4"/>
      </svg>
    ),
  },
  'Cointelegraph': {
    gradient: 'from-[#0a1628]/60 via-[#131f36]/40 to-[#1a2d50]/20',
    colors: ['#f7931a', '#ffb347'],
    label: 'Cointelegraph',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="18" rx="3" fill="#f7931a" opacity="0.15"/>
        <path d="M8 8h8M8 12h5M8 16h8" stroke="#f7931a" strokeWidth="1.8" strokeLinecap="round"/>
        <circle cx="17" cy="12" r="2" fill="#ffb347" opacity="0.6"/>
      </svg>
    ),
  },
  'CoinDesk': {
    gradient: 'from-[#0d1b2a]/60 via-[#1b263b]/40 to-[#415a77]/20',
    colors: ['#00d4aa', '#00b894'],
    label: 'CoinDesk',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" fill="#00d4aa" opacity="0.15" stroke="#00d4aa" strokeWidth="1.5"/>
        <path d="M12 7v5l3 3" stroke="#00d4aa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  'CNBC': {
    gradient: 'from-[#004b8d]/30 via-[#005fa3]/15 to-[#0077cc]/10',
    colors: ['#005fa3', '#0077cc'],
    label: 'CNBC',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="6" width="20" height="12" rx="2" fill="#005fa3" opacity="0.2"/>
        <path d="M6 14V10l2 4 2-4v4M14 10h-2v4h2M16 10v4h2a2 2 0 000-4h-2z" stroke="#0077cc" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  'Yahoo Finance': {
    gradient: 'from-[#1a0533]/60 via-[#2d0a4e]/40 to-[#6001d2]/15',
    colors: ['#6001d2', '#7c3aed'],
    label: 'Yahoo Finance',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
        <path d="M4 4l6 8v8h4v-8l6-8" stroke="#6001d2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.8"/>
        <circle cx="12" cy="20" r="2" fill="#7c3aed" opacity="0.4"/>
      </svg>
    ),
  },
};

// Source-specific branded fallback banner
function NewsImageFallback({ source }) {
  const banner = SOURCE_BANNERS[source];

  if (banner) {
    return (
      <div className={`w-full h-36 bg-gradient-to-br ${banner.gradient} flex flex-col items-center justify-center gap-2.5 relative overflow-hidden`}>
        {/* Decorative background circles */}
        <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-[0.07]"
          style={{ background: banner.colors[0] }} />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full opacity-[0.05]"
          style={{ background: banner.colors[1] || banner.colors[0] }} />

        {/* Source icon */}
        <div className="relative z-10">{banner.icon}</div>

        {/* Source label */}
        <span className="relative z-10 text-[11px] font-semibold tracking-wider uppercase opacity-50"
          style={{ color: banner.colors[0] }}>
          {banner.label}
        </span>
      </div>
    );
  }

  // Generic fallback for unknown sources
  return (
    <div className="w-full h-36 bg-gradient-to-br from-teal/10 to-green/5 flex items-center justify-center">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-teal/40">
        <path d="M19 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1m2 13a2 2 0 0 1-2-2V7m2 13a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2m-4-3H9M7 16h6M7 12h10"/>
      </svg>
    </div>
  );
}

// Smart image — hides itself if it looks like a logo (square + small)
function ArticleImage({ src, source }) {
  const [hidden, setHidden] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const handleLoad = (e) => {
    const img = e.target;
    const ratio = img.naturalWidth / img.naturalHeight;
    const isSquarish = ratio > 0.6 && ratio < 1.6;
    const isSmall = img.naturalWidth < 600;
    // Logo heuristic: squarish AND small resolution
    if (isSquarish && isSmall) {
      setHidden(true);
    } else {
      setLoaded(true);
    }
  };

  if (hidden) return <NewsImageFallback source={source} />;

  return (
    <div className="relative w-full h-36 bg-bg-card overflow-hidden">
      {!loaded && <div className="absolute inset-0 bg-bg-card animate-pulse" />}
      <img
        src={src}
        alt=""
        className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={handleLoad}
        onError={() => setHidden(true)}
      />
    </div>
  );
}

export default function PortfolioNews({ articles = [], loading = false }) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? articles.slice(0, 30) : articles.slice(0, 12);

  const timeAgo = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp * 1000;
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="card mx-4 mb-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="section-accent font-heading text-lg font-bold text-text-primary">
            Financial News
          </h2>
          {articles.length > 0 && (
            <span className="text-[10px] text-text-muted bg-bg-elevated border border-border-subtle rounded-full px-2 py-0.5">
              {articles.length} articles
            </span>
          )}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-bg-elevated rounded-xl overflow-hidden animate-pulse">
              <div className="h-32 bg-bg-card" />
              <div className="p-4">
                <div className="h-4 w-3/4 bg-bg-card rounded mb-2" />
                <div className="h-3 w-1/2 bg-bg-card rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : visible.length === 0 ? (
        <p className="text-text-muted text-sm text-center py-8">
          News will appear when deployed with Finnhub API key.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {visible.map((article, i) => (
            <a
              key={i}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col bg-bg-elevated border border-border-subtle rounded-xl overflow-hidden hover:border-border-medium hover:bg-bg-card-hover transition-all group"
            >
              {/* Article image — smart: shows source banner if no image or logo detected */}
              {article.image
                ? <ArticleImage src={article.image} source={article.source} />
                : <NewsImageFallback source={article.source} />
              }

              {/* Article content */}
              <div className="flex flex-col flex-1 p-4">
                <h3 className="text-text-primary text-sm font-medium leading-snug group-hover:text-teal transition-colors line-clamp-2 mb-2">
                  {article.headline}
                </h3>
                {article.summary && (
                  <p className="text-text-muted text-xs leading-relaxed line-clamp-2 mb-3">
                    {article.summary}
                  </p>
                )}
                <div className="flex items-center justify-between mt-auto pt-2 border-t border-border-subtle/50">
                  <span className="text-teal/70 text-[10px] uppercase tracking-wider font-semibold">{article.source}</span>
                  <span className="text-text-muted text-[10px]">{timeAgo(article.datetime)}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}

      {/* Show More / Show Less */}
      {!loading && articles.length > 12 && (
        <div className="text-center mt-6">
          <button
            onClick={() => setShowAll(!showAll)}
            className="px-5 py-2 rounded-full border border-border-subtle bg-bg-elevated text-text-secondary text-xs font-medium hover:text-text-primary hover:border-border-medium transition-all"
          >
            {showAll ? 'Show Less' : `Show More (${articles.length - 12} more)`}
          </button>
        </div>
      )}
    </div>
  );
}
