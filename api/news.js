// Vercel Serverless Function — Multi-source financial news aggregator with 5min cache
// Sources: Finnhub, CoinDesk, Cointelegraph, CNBC, Yahoo Finance, OilPrice, Google News
let newsCache = null;
let newsCacheTs = 0;
const NEWS_CACHE_TTL = 300000; // 5 minutes

// RSS feed sources (free, no API key needed)
const RSS_FEEDS = [
  {
    name: 'CoinDesk',
    url: 'https://www.coindesk.com/arc/outboundfeeds/rss/',
    source: 'CoinDesk',
  },
  {
    name: 'Cointelegraph',
    url: 'https://cointelegraph.com/rss',
    source: 'Cointelegraph',
  },
  {
    name: 'CNBC Business',
    url: 'https://www.cnbc.com/id/10001147/device/rss/rss.html',
    source: 'CNBC',
  },
  {
    name: 'Yahoo Finance',
    url: 'https://finance.yahoo.com/news/rssindex',
    source: 'Yahoo Finance',
  },
  {
    name: 'OilPrice',
    url: 'https://oilprice.com/rss/main',
    source: 'OilPrice',
  },
  {
    name: 'Google News Finance',
    url: 'https://news.google.com/rss/search?q=financial+markets&hl=en-US&gl=US&ceid=US:en',
    source: 'Google News',
  },
];

// Simple RSS XML parser — extracts items from RSS/Atom feeds
function parseRSS(xml, sourceName) {
  const articles = [];

  // Match <item> blocks (RSS 2.0) or <entry> blocks (Atom)
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
      // Clean HTML tags from summary
      const cleanSummary = description
        ? description.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim().slice(0, 300)
        : '';

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

function extractTag(block, tag) {
  // Handle CDATA wrapped content
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
  // <media:content url="..." /> or <media:thumbnail url="..." />
  const m = block.match(/<media:(content|thumbnail)[^>]*url="([^"]+)"/i);
  return m ? m[2] : null;
}

function extractEnclosureImage(block) {
  // <enclosure url="..." type="image/..." />
  const m = block.match(/<enclosure[^>]*url="([^"]+)"[^>]*type="image/i);
  return m ? m[1] : null;
}

async function fetchRSSFeed(feed) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000); // 5s timeout per feed

    const response = await fetch(feed.url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'AtlasWealth/1.0 (Financial News Aggregator)',
        Accept: 'application/rss+xml, application/xml, text/xml, */*',
      },
    });

    clearTimeout(timeout);

    if (!response.ok) {
      console.error(`RSS fetch failed for ${feed.name}: HTTP ${response.status}`);
      return [];
    }

    const xml = await response.text();
    return parseRSS(xml, feed.source);
  } catch (err) {
    console.error(`RSS error for ${feed.name}:`, err.message);
    return [];
  }
}

async function fetchFinnhubNews(apiKey) {
  try {
    const url = `https://finnhub.io/api/v1/news?category=general&token=${apiKey}`;
    const response = await fetch(url);

    if (!response.ok) {
      console.error(`Finnhub news HTTP ${response.status}`);
      return [];
    }

    const data = await response.json();

    return (Array.isArray(data) ? data : []).map(item => ({
      headline: item.headline,
      summary: item.summary,
      url: item.url,
      source: item.source,
      image: item.image,
      datetime: item.datetime,
      related: item.related || '',
    }));
  } catch (err) {
    console.error('Finnhub news error:', err.message);
    return [];
  }
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.FINNHUB_API_KEY;
  const now = Date.now();

  // Check cache
  if (newsCache && (now - newsCacheTs) < NEWS_CACHE_TTL) {
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60');
    return res.status(200).json({ articles: newsCache, cached: true });
  }

  try {
    // Fetch ALL sources in parallel
    const [finnhubArticles, ...rssResults] = await Promise.all([
      apiKey ? fetchFinnhubNews(apiKey) : Promise.resolve([]),
      ...RSS_FEEDS.map(feed => fetchRSSFeed(feed)),
    ]);

    // Merge all articles
    const allArticles = [
      ...finnhubArticles,
      ...rssResults.flat(),
    ];

    // Deduplicate by headline similarity (normalize and compare)
    const seen = new Set();
    const unique = allArticles.filter(a => {
      const key = a.headline.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 60);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Sort by datetime (newest first)
    unique.sort((a, b) => (b.datetime || 0) - (a.datetime || 0));

    // Limit to 30 articles
    const articles = unique.slice(0, 30);

    // Update cache
    newsCache = articles;
    newsCacheTs = now;

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60');
    return res.status(200).json({ articles, sources: RSS_FEEDS.length + 1 });
  } catch (err) {
    console.error('News aggregation error:', err.message);

    // If cache exists, serve stale data
    if (newsCache) {
      return res.status(200).json({ articles: newsCache, cached: true, stale: true });
    }

    return res.status(500).json({ error: 'Failed to fetch news', message: err.message });
  }
}
