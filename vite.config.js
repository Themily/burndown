import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Dev-only: inline RSS news aggregator so /api/news works locally
function devNewsPlugin() {
  const RSS_FEEDS = [
    { name: 'CoinDesk', url: 'https://www.coindesk.com/arc/outboundfeeds/rss/', source: 'CoinDesk' },
    { name: 'Cointelegraph', url: 'https://cointelegraph.com/rss', source: 'Cointelegraph' },
    { name: 'CNBC Business', url: 'https://www.cnbc.com/id/10001147/device/rss/rss.html', source: 'CNBC' },
    { name: 'Yahoo Finance', url: 'https://finance.yahoo.com/news/rssindex', source: 'Yahoo Finance' },
    { name: 'OilPrice', url: 'https://oilprice.com/rss/main', source: 'OilPrice' },
    { name: 'Google News Finance', url: 'https://news.google.com/rss/search?q=financial+markets&hl=en-US&gl=US&ceid=US:en', source: 'Google News' },
  ];

  function extractTag(block, tag) {
    const regex = new RegExp(`<${tag}[^>]*>\\s*(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?\\s*<\\/${tag}>`, 'i');
    const m = block.match(regex);
    return m ? m[1].trim() : null;
  }
  function extractAttr(block, tag, attr) {
    const regex = new RegExp(`<${tag}[^>]*${attr}="([^"]*)"`, 'i');
    const m = block.match(regex);
    return m ? m[1] : null;
  }
  function extractMediaImage(block) {
    const m = block.match(/<media:(content|thumbnail)[^>]*url="([^"]+)"/i);
    return m ? m[2] : null;
  }
  function extractEnclosureImage(block) {
    const m = block.match(/<enclosure[^>]*url="([^"]+)"[^>]*type="image/i);
    return m ? m[1] : null;
  }

  function parseRSS(xml, sourceName) {
    const articles = [];
    const itemRegex = /<item[\s>]([\s\S]*?)<\/item>|<entry[\s>]([\s\S]*?)<\/entry>/gi;
    let match;
    while ((match = itemRegex.exec(xml)) !== null) {
      const block = match[1] || match[2] || '';
      const title = extractTag(block, 'title');
      const link = extractTag(block, 'link') || extractAttr(block, 'link', 'href');
      const description = extractTag(block, 'description') || extractTag(block, 'summary') || extractTag(block, 'content');
      const pubDate = extractTag(block, 'pubDate') || extractTag(block, 'published') || extractTag(block, 'updated');
      const image = extractMediaImage(block) || extractEnclosureImage(block);
      if (title && link) {
        const cleanSummary = description ? description.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim().slice(0, 300) : '';
        const cleanTitle = title.replace(/<!\[CDATA\[|\]\]>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();
        articles.push({
          headline: cleanTitle,
          summary: cleanSummary,
          url: link.replace(/<!\[CDATA\[|\]\]>/g, '').trim(),
          source: sourceName,
          image: image || null,
          datetime: pubDate ? Math.floor(new Date(pubDate).getTime() / 1000) : Math.floor(Date.now() / 1000),
          related: '',
        });
      }
    }
    return articles;
  }

  let cache = null;
  let cacheTs = 0;

  return {
    name: 'dev-news-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url.startsWith('/api/news')) return next();

        res.setHeader('Content-Type', 'application/json');
        const now = Date.now();
        if (cache && (now - cacheTs) < 300000) {
          return res.end(JSON.stringify({ articles: cache, cached: true }));
        }

        try {
          const results = await Promise.all(
            RSS_FEEDS.map(async (feed) => {
              try {
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 5000);
                const r = await fetch(feed.url, {
                  signal: controller.signal,
                  headers: { 'User-Agent': 'AtlasWealth/1.0', Accept: 'application/rss+xml, application/xml, text/xml, */*' },
                });
                clearTimeout(timeout);
                if (!r.ok) return [];
                const xml = await r.text();
                return parseRSS(xml, feed.source);
              } catch { return []; }
            })
          );

          const all = results.flat();
          const seen = new Set();
          const unique = all.filter(a => {
            const key = a.headline.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 60);
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });
          unique.sort((a, b) => (b.datetime || 0) - (a.datetime || 0));
          const articles = unique.slice(0, 30);
          cache = articles;
          cacheTs = now;
          res.end(JSON.stringify({ articles, sources: RSS_FEEDS.length }));
        } catch (err) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: err.message }));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), devNewsPlugin()],
  resolve: {
    alias: {
      'html2canvas': 'html2canvas-pro',
    },
  },
})
