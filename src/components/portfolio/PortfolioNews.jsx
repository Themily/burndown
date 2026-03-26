import React, { useState } from 'react';

// ─── Source-specific SVG market banner configs ───────────────────────────────
const BANNER_CONFIGS = {
  'Google News': {
    bg1: '#0d1f3c', bg2: '#0a1628',
    sky1: '#1a3a6e', sky2: '#0d1f3c',
    accent: '#4285F4',
    wave1: '#4285F4', wave2: '#1a3a6e',
    city: '#4285F4',
    // Unique wave path for variety
    wavePath: 'M-20 135 C25 118 65 130 105 114 C145 98 185 122 225 108 C265 94 305 118 345 103 C372 93 400 108 420 100 L420 176 L-20 176 Z',
    wavePath2: 'M-20 150 C30 132 72 145 112 130 C152 115 192 138 232 124 C272 110 312 133 352 118 C376 108 400 122 420 114 L420 176 L-20 176 Z',
    trendPath: 'M0 125 C35 120 55 132 85 115 C115 98 135 112 165 103 C195 94 218 108 248 98 C278 88 305 106 335 94 C358 85 382 98 400 88',
    dots: [
      { cx: 55, cy: 28, r: 20 }, { cx: 318, cy: 22, r: 15 },
      { cx: 195, cy: 18, r: 11 }, { cx: 142, cy: 42, r: 8 }, { cx: 275, cy: 48, r: 13 },
    ],
    glowDots: [{ cx: 85, cy: 115 }, { cx: 248, cy: 98 }, { cx: 400, cy: 88 }],
  },
  'OilPrice': {
    bg1: '#1a0810', bg2: '#0d0a1a',
    sky1: '#2d1020', sky2: '#1a0810',
    accent: '#e94560',
    wave1: '#e94560', wave2: '#2d1020',
    city: '#e94560',
    wavePath: 'M-20 138 C20 122 62 133 102 117 C142 101 182 126 222 111 C262 96 302 122 342 106 C370 96 400 112 420 103 L420 176 L-20 176 Z',
    wavePath2: 'M-20 153 C28 137 70 148 110 134 C150 120 190 142 230 128 C270 114 310 136 350 122 C374 113 400 126 420 118 L420 176 L-20 176 Z',
    trendPath: 'M0 128 C28 135 48 120 78 130 C108 140 125 108 155 98 C185 88 205 115 235 104 C265 93 298 118 328 105 C352 95 378 102 400 92',
    dots: [
      { cx: 62, cy: 32, r: 18 }, { cx: 310, cy: 25, r: 14 },
      { cx: 188, cy: 20, r: 10 }, { cx: 135, cy: 44, r: 7 }, { cx: 265, cy: 50, r: 12 },
    ],
    glowDots: [{ cx: 78, cy: 130 }, { cx: 235, cy: 104 }, { cx: 400, cy: 92 }],
  },
  'Cointelegraph': {
    bg1: '#160e00', bg2: '#0d0e1a',
    sky1: '#2a1c00', sky2: '#160e00',
    accent: '#f7931a',
    wave1: '#f7931a', wave2: '#2a1c00',
    city: '#f7931a',
    wavePath: 'M-20 132 C22 116 64 128 104 112 C144 96 184 120 224 106 C264 92 304 116 344 102 C371 92 400 106 420 98 L420 176 L-20 176 Z',
    wavePath2: 'M-20 148 C26 132 68 144 108 130 C148 116 188 138 228 125 C268 112 308 134 348 120 C373 111 400 124 420 116 L420 176 L-20 176 Z',
    trendPath: 'M0 122 C30 115 52 128 82 110 C112 92 132 118 162 106 C192 94 215 112 245 102 C275 92 302 108 332 97 C356 88 380 100 400 90',
    dots: [
      { cx: 58, cy: 26, r: 22 }, { cx: 315, cy: 20, r: 16 },
      { cx: 192, cy: 16, r: 12 }, { cx: 138, cy: 40, r: 9 }, { cx: 272, cy: 46, r: 14 },
    ],
    glowDots: [{ cx: 82, cy: 110 }, { cx: 245, cy: 102 }, { cx: 400, cy: 90 }],
  },
  'CoinDesk': {
    bg1: '#001818', bg2: '#000d14',
    sky1: '#00302e', sky2: '#001818',
    accent: '#00d4aa',
    wave1: '#00d4aa', wave2: '#00302e',
    city: '#00d4aa',
    wavePath: 'M-20 136 C24 120 66 132 106 116 C146 100 186 124 226 110 C266 96 306 120 346 105 C372 95 400 110 420 101 L420 176 L-20 176 Z',
    wavePath2: 'M-20 152 C28 136 70 147 110 133 C150 119 190 140 230 127 C270 114 310 136 350 122 C374 112 400 125 420 117 L420 176 L-20 176 Z',
    trendPath: 'M0 126 C32 118 54 130 84 113 C114 96 134 114 164 104 C194 94 216 110 246 100 C276 90 304 108 334 96 C358 87 382 100 400 90',
    dots: [
      { cx: 60, cy: 30, r: 19 }, { cx: 316, cy: 24, r: 15 },
      { cx: 193, cy: 19, r: 11 }, { cx: 140, cy: 43, r: 8 }, { cx: 270, cy: 49, r: 13 },
    ],
    glowDots: [{ cx: 84, cy: 113 }, { cx: 246, cy: 100 }, { cx: 400, cy: 90 }],
  },
  'CNBC': {
    bg1: '#001428', bg2: '#000d1c',
    sky1: '#002850', sky2: '#001428',
    accent: '#0099ff',
    wave1: '#0099ff', wave2: '#002850',
    city: '#0099ff',
    wavePath: 'M-20 134 C22 118 64 130 104 114 C144 98 184 122 224 108 C264 94 304 118 344 104 C371 94 400 108 420 100 L420 176 L-20 176 Z',
    wavePath2: 'M-20 150 C26 134 68 146 108 132 C148 118 188 140 228 126 C268 112 308 135 348 121 C373 112 400 124 420 116 L420 176 L-20 176 Z',
    trendPath: 'M0 124 C30 116 52 130 82 112 C112 94 132 116 162 105 C192 94 215 110 245 100 C275 90 302 108 332 96 C355 87 380 100 400 90',
    dots: [
      { cx: 56, cy: 28, r: 20 }, { cx: 314, cy: 22, r: 15 },
      { cx: 190, cy: 17, r: 11 }, { cx: 136, cy: 41, r: 8 }, { cx: 268, cy: 47, r: 13 },
    ],
    glowDots: [{ cx: 82, cy: 112 }, { cx: 245, cy: 100 }, { cx: 400, cy: 90 }],
  },
  'Yahoo Finance': {
    bg1: '#100020', bg2: '#0a0018',
    sky1: '#1e0040', sky2: '#100020',
    accent: '#a855f7',
    wave1: '#a855f7', wave2: '#1e0040',
    city: '#a855f7',
    wavePath: 'M-20 137 C23 121 65 133 105 117 C145 101 185 125 225 111 C265 97 305 121 345 106 C372 96 400 110 420 102 L420 176 L-20 176 Z',
    wavePath2: 'M-20 153 C27 137 69 148 109 134 C149 120 189 141 229 128 C269 115 309 137 349 123 C374 114 400 126 420 118 L420 176 L-20 176 Z',
    trendPath: 'M0 127 C31 119 53 131 83 114 C113 97 133 115 163 105 C193 95 216 111 246 101 C276 91 303 109 333 97 C357 88 381 101 400 91',
    dots: [
      { cx: 57, cy: 29, r: 21 }, { cx: 315, cy: 23, r: 16 },
      { cx: 191, cy: 18, r: 12 }, { cx: 137, cy: 42, r: 9 }, { cx: 269, cy: 48, r: 14 },
    ],
    glowDots: [{ cx: 83, cy: 114 }, { cx: 246, cy: 101 }, { cx: 400, cy: 91 }],
  },
};

// ─── Rich SVG Market Banner ───────────────────────────────────────────────────
function MarketBanner({ source }) {
  const cfg = BANNER_CONFIGS[source];
  if (!cfg) return <GenericBanner />;

  const id = source.replace(/[\s.]/g, '-').toLowerCase();

  return (
    <div className="w-full h-44 overflow-hidden">
      <svg
        viewBox="0 0 400 176"
        preserveAspectRatio="xMidYMid slice"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Background */}
          <linearGradient id={`bg-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={cfg.sky1} />
            <stop offset="100%" stopColor={cfg.bg2} />
          </linearGradient>
          {/* Sky glow (sun/light source) */}
          <radialGradient id={`sun-${id}`} cx="68%" cy="12%" r="45%">
            <stop offset="0%" stopColor={cfg.accent} stopOpacity="0.18" />
            <stop offset="100%" stopColor={cfg.bg1} stopOpacity="0" />
          </radialGradient>
          {/* Wave fills */}
          <linearGradient id={`wv1-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={cfg.wave1} stopOpacity="0.35" />
            <stop offset="100%" stopColor={cfg.wave2} stopOpacity="0.04" />
          </linearGradient>
          <linearGradient id={`wv2-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={cfg.wave1} stopOpacity="0.18" />
            <stop offset="100%" stopColor={cfg.wave2} stopOpacity="0.02" />
          </linearGradient>
          {/* Glow filter for trend line */}
          <filter id={`glow-${id}`} x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          {/* Bokeh blur */}
          <filter id={`bokeh-${id}`}>
            <feGaussianBlur stdDeviation="7" />
          </filter>
          {/* Dot glow */}
          <filter id={`dotglow-${id}`} x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Background */}
        <rect width="400" height="176" fill={`url(#bg-${id})`} />

        {/* Sky light glow */}
        <rect width="400" height="176" fill={`url(#sun-${id})`} />

        {/* City silhouette — subtle rectangles */}
        <g opacity="0.13" fill={cfg.city}>
          <rect x="0"   y="95"  width="22" height="81" />
          <rect x="16"  y="82"  width="16" height="94" />
          <rect x="28"  y="100" width="18" height="76" />
          <rect x="46"  y="90"  width="14" height="86" />
          <rect x="100" y="105" width="12" height="71" />
          <rect x="120" y="110" width="10" height="66" />
          <rect x="330" y="92"  width="14" height="84" />
          <rect x="346" y="80"  width="18" height="96" />
          <rect x="362" y="96"  width="16" height="80" />
          <rect x="376" y="88"  width="24" height="88" />
          <rect x="178" y="108" width="10" height="68" />
          <rect x="204" y="112" width="12" height="64" />
        </g>

        {/* Bokeh circles */}
        {cfg.dots.map((d, i) => (
          <circle key={i} cx={d.cx} cy={d.cy} r={d.r}
            fill={cfg.accent} opacity={0.10 - i * 0.008}
            filter={`url(#bokeh-${id})`} />
        ))}

        {/* Subtle horizontal grid lines */}
        <g opacity="0.08" stroke={cfg.wave1} strokeWidth="0.5">
          <line x1="0" y1="80"  x2="400" y2="80" />
          <line x1="0" y1="105" x2="400" y2="105" />
          <line x1="0" y1="130" x2="400" y2="130" />
          <line x1="0" y1="155" x2="400" y2="155" />
        </g>

        {/* Back wave */}
        <path d={cfg.wavePath2} fill={`url(#wv2-${id})`} />

        {/* Front wave */}
        <path d={cfg.wavePath} fill={`url(#wv1-${id})`} />

        {/* Mesh lines on front wave */}
        <g opacity="0.12" stroke={cfg.wave1} strokeWidth="0.4">
          <line x1="0" y1="152" x2="400" y2="138" />
          <line x1="0" y1="162" x2="400" y2="148" />
        </g>

        {/* Trend line with glow */}
        <path
          d={cfg.trendPath}
          fill="none"
          stroke={cfg.accent}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={`url(#glow-${id})`}
          opacity="0.95"
        />

        {/* Glowing dots along trend line */}
        {cfg.glowDots.map((d, i) => (
          <circle key={i} cx={d.cx} cy={d.cy} r="3"
            fill={cfg.accent}
            filter={`url(#dotglow-${id})`}
            opacity="0.9" />
        ))}

        {/* Source label — centered */}
        <text
          x="200" y="88"
          textAnchor="middle"
          dominantBaseline="middle"
          fill={cfg.accent}
          fontSize="10.5"
          fontWeight="700"
          letterSpacing="3.5"
          opacity="0.65"
          fontFamily="system-ui, -apple-system, 'Segoe UI', sans-serif"
        >
          {source.toUpperCase()}
        </text>
      </svg>
    </div>
  );
}

// ─── Generic fallback for unknown sources ─────────────────────────────────────
function GenericBanner() {
  return (
    <div className="w-full h-44 bg-gradient-to-br from-teal/10 to-green/5 flex items-center justify-center">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-teal/40">
        <path d="M19 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1m2 13a2 2 0 0 1-2-2V7m2 13a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2m-4-3H9M7 16h6M7 12h10" />
      </svg>
    </div>
  );
}

// ─── Smart article image (falls back to MarketBanner if logo detected) ────────
function ArticleImage({ src, source }) {
  const [hidden, setHidden] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const handleLoad = (e) => {
    const img = e.target;
    const ratio = img.naturalWidth / img.naturalHeight;
    const isSquarish = ratio > 0.6 && ratio < 1.6;
    const isSmall = img.naturalWidth < 600;
    if (isSquarish && isSmall) {
      setHidden(true);
    } else {
      setLoaded(true);
    }
  };

  if (hidden) return <MarketBanner source={source} />;

  return (
    <div className="relative w-full h-44 bg-bg-card overflow-hidden">
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

// ─── Main PortfolioNews component ─────────────────────────────────────────────
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
              <div className="h-44 bg-bg-card" />
              <div className="p-4">
                <div className="h-4 w-3/4 bg-bg-card rounded mb-2" />
                <div className="h-3 w-1/2 bg-bg-card rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : visible.length === 0 ? (
        <p className="text-text-muted text-sm text-center py-8">
          News will appear when deployed with the API key.
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
              {/* Article image — falls back to branded MarketBanner if no image or logo */}
              {article.image
                ? <ArticleImage src={article.image} source={article.source} />
                : <MarketBanner source={article.source} />
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
