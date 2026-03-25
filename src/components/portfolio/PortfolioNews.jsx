import React, { useState } from 'react';

export default function PortfolioNews({ articles = [], loading = false, holdings = [] }) {
  const [filter, setFilter] = useState('all'); // 'all' | 'holdings'

  const holdingTickers = holdings.map(h => h.ticker?.toUpperCase()).filter(Boolean);

  const filteredArticles = filter === 'holdings' && holdingTickers.length > 0
    ? articles.filter(a =>
        holdingTickers.some(t =>
          a.headline?.toUpperCase().includes(t) ||
          a.summary?.toUpperCase().includes(t)
        )
      )
    : articles;

  const visible = filteredArticles.slice(0, 12);

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
        <div className="flex items-center bg-bg-elevated border border-border-subtle rounded-full px-1 py-0.5">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              filter === 'all' ? 'bg-teal/15 text-teal' : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            All News
          </button>
          <button
            onClick={() => setFilter('holdings')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              filter === 'holdings' ? 'bg-teal/15 text-teal' : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            My Holdings
          </button>
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
          {filter === 'holdings'
            ? 'No news matching your holdings. Try "All News".'
            : 'News will appear when deployed with Finnhub API key.'}
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
              {/* Article image */}
              {article.image ? (
                <div className="relative w-full h-36 bg-bg-card overflow-hidden">
                  <img
                    src={article.image}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.parentElement.style.display = 'none';
                    }}
                  />
                </div>
              ) : (
                <div className="w-full h-20 bg-gradient-to-br from-teal/10 to-green/5 flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-teal/40">
                    <path d="M19 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1m2 13a2 2 0 0 1-2-2V7m2 13a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2m-4-3H9M7 16h6M7 12h10"/>
                  </svg>
                </div>
              )}

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
