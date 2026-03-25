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

  const visible = filteredArticles.slice(0, 10);

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
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-bg-elevated rounded-xl p-4 animate-pulse">
              <div className="h-4 w-3/4 bg-bg-card rounded mb-2" />
              <div className="h-3 w-1/2 bg-bg-card rounded" />
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
        <div className="space-y-3">
          {visible.map((article, i) => (
            <a
              key={i}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-4 bg-bg-elevated border border-border-subtle rounded-xl p-4 hover:border-border-medium hover:bg-bg-card-hover transition-all group"
            >
              {article.image && (
                <img
                  src={article.image}
                  alt=""
                  className="w-16 h-16 rounded-lg object-cover flex-shrink-0 hidden sm:block"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="text-text-primary text-sm font-medium leading-snug group-hover:text-teal transition-colors line-clamp-2">
                  {article.headline}
                </h3>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-text-muted text-[10px] uppercase tracking-wider">{article.source}</span>
                  <span className="text-text-muted text-[10px]">·</span>
                  <span className="text-text-muted text-[10px]">{timeAgo(article.datetime)}</span>
                </div>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-muted flex-shrink-0 mt-1 group-hover:text-teal transition-colors">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
