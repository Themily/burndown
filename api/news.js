// Vercel Serverless Function — Finnhub news proxy with 5min cache
let newsCache = null;
let newsCacheTs = 0;
const NEWS_CACHE_TTL = 300000; // 5 minutes

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

  if (!apiKey) {
    return res.status(500).json({ error: 'FINNHUB_API_KEY not configured' });
  }

  const now = Date.now();
  const category = req.query.category || 'general';

  // Check cache
  if (newsCache && (now - newsCacheTs) < NEWS_CACHE_TTL) {
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60');
    return res.status(200).json({ articles: newsCache, cached: true });
  }

  try {
    const url = `https://finnhub.io/api/v1/news?category=${encodeURIComponent(category)}&token=${apiKey}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Finnhub HTTP ${response.status}`);
    }

    const data = await response.json();

    // Finnhub returns array of { category, datetime, headline, id, image, related, source, summary, url }
    const articles = (Array.isArray(data) ? data : [])
      .slice(0, 20)
      .map(item => ({
        headline: item.headline,
        summary: item.summary,
        url: item.url,
        source: item.source,
        image: item.image,
        datetime: item.datetime,
        related: item.related,
      }));

    // Update cache
    newsCache = articles;
    newsCacheTs = now;

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60');
    return res.status(200).json({ articles });
  } catch (err) {
    console.error('News fetch error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch news', message: err.message });
  }
}
