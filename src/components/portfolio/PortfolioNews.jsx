import React, { useState } from 'react';

// Fallback shown when there's no image or the image is a logo
function NewsImageFallback() {
  return (
    <div className="w-full h-36 bg-gradient-to-br from-teal/10 to-green/5 flex items-center justify-center">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-teal/40">
        <path d="M19 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1m2 13a2 2 0 0 1-2-2V7m2 13a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2m-4-3H9M7 16h6M7 12h10"/>
      </svg>
    </div>
  );
}

// Smart image — hides itself if it looks like a logo (square + small)
function ArticleImage({ src }) {
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

  if (hidden) return <NewsImageFallback />;

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
  const visible = articles.slice(0, 12);

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
        <h2 className="section-accent font-heading text-lg font-bold text-text-primary">
          Financial News
        </h2>
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
              {/* Article image — smart: shows fallback if logo detected */}
              {article.image
                ? <ArticleImage src={article.image} />
                : <NewsImageFallback />
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
    </div>
  );
}
