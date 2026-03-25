// Vercel Serverless Function — Market price proxy with 60s in-memory cache
// Uses Finnhub for US stocks/ETFs, CoinGecko for crypto, goldprice.org for gold spot
const cache = new Map();
const CACHE_TTL = 60000; // 60 seconds

// Special symbols handled by dedicated free APIs (not Finnhub)
const METALS = ['GOLD', 'SILVER'];

// Known crypto symbols → CoinGecko IDs
// Users can add these tickers to watchlists and get live prices
const CRYPTO_MAP = {
  BTC:   'bitcoin',
  ETH:   'ethereum',
  XRP:   'ripple',
  SOL:   'solana',
  ADA:   'cardano',
  DOGE:  'dogecoin',
  DOT:   'polkadot',
  AVAX:  'avalanche-2',
  MATIC: 'matic-network',
  POL:   'matic-network',
  LINK:  'chainlink',
  UNI:   'uniswap',
  SHIB:  'shiba-inu',
  LTC:   'litecoin',
  ATOM:  'cosmos',
  XLM:   'stellar',
  ALGO:  'algorand',
  FTM:   'fantom',
  NEAR:  'near',
  APT:   'aptos',
  ARB:   'arbitrum',
  OP:    'optimism',
  SUI:   'sui',
  SEI:   'sei-network',
  TIA:   'celestia',
  INJ:   'injective-protocol',
  FET:   'fetch-ai',
  RENDER:'render-token',
  RNDR:  'render-token',
  PEPE:  'pepe',
  WIF:   'dogwifcoin',
  BONK:  'bonk',
  FLOKI: 'floki',
  BNB:   'binancecoin',
  TRX:   'tron',
  TON:   'the-open-network',
  ICP:   'internet-computer',
  FIL:   'filecoin',
  VET:   'vechain',
  AAVE:  'aave',
  MKR:   'maker',
  CRV:   'curve-dao-token',
  LDO:   'lido-dao',
  SAND:  'the-sandbox',
  MANA:  'decentraland',
  AXS:   'axie-infinity',
  HBAR:  'hedera-hashgraph',
  EOS:   'eos',
  XTZ:   'tezos',
  THETA: 'theta-token',
  EGLD:  'elrond-erd-2',
  RUNE:  'thorchain',
  ENS:   'ethereum-name-service',
  GRT:   'the-graph',
  COMP:  'compound-governance-token',
  SNX:   'havven',
  SUSHI: 'sushi',
  YFI:   'yearn-finance',
  BAT:   'basic-attention-token',
  ZEC:   'zcash',
  XMR:   'monero',
  DASH:  'dash',
  NEO:   'neo',
  WAVES: 'waves',
  KAVA:  'kava',
  CELO:  'celo',
  ONE:   'harmony',
  ZIL:   'zilliqa',
  ENJ:   'enjincoin',
  CHZ:   'chiliz',
  GALA:  'gala',
  IMX:   'immutable-x',
  CRO:   'crypto-com-chain',
  OSMO:  'osmosis',
  KAS:   'kaspa',
  STX:   'blockstack',
  USDT:  'tether',
  USDC:  'usd-coin',
  DAI:   'dai',
};

// Cache for CoinGecko ID lookups (symbols not in CRYPTO_MAP)
const geckoIdCache = new Map();

async function lookupCoinGeckoId(symbol) {
  // Check local cache first
  if (geckoIdCache.has(symbol)) return geckoIdCache.get(symbol);

  try {
    const url = `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(symbol)}`;
    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();
    const coins = data.coins || [];

    // Find exact symbol match (case-insensitive)
    const match = coins.find(c => c.symbol.toUpperCase() === symbol.toUpperCase());
    if (match) {
      geckoIdCache.set(symbol, match.id);
      return match.id;
    }
  } catch (e) {
    console.error(`CoinGecko search failed for ${symbol}:`, e.message);
  }

  // Mark as not found to avoid repeated lookups
  geckoIdCache.set(symbol, null);
  return null;
}

// Fetch gold/silver spot price — tries multiple free sources
async function fetchMetalPrice(symbol, apiKey, now) {
  // Strategy 1: Try goldprice.org
  const goldpriceResult = await tryGoldPriceOrg(symbol, now);
  if (goldpriceResult) return goldpriceResult;

  // Strategy 2: Try gold-api.com free endpoint
  const goldApiResult = await tryGoldApi(symbol, now);
  if (goldApiResult) return goldApiResult;

  // Strategy 3: Derive from ETF via Finnhub (GLD for gold, SLV for silver)
  const etfResult = await tryMetalFromETF(symbol, apiKey, now);
  if (etfResult) return etfResult;

  return null;
}

async function tryGoldPriceOrg(symbol, now) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const response = await fetch('https://data-asg.goldprice.org/dbXRates/USD', {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AtlasWealth/1.0)',
        'Accept': 'application/json',
        'Referer': 'https://goldprice.org/',
      },
    });

    clearTimeout(timeout);
    if (!response.ok) return null;

    const data = await response.json();
    const item = data?.items?.[0];
    if (!item) return null;

    if (symbol === 'GOLD' && item.xauPrice) {
      return {
        price: item.xauPrice,
        change: item.chgXau || 0,
        changePercent: item.pcXau || 0,
        high: null, low: null,
        open: item.xauPrice - (item.chgXau || 0),
        prevClose: item.xauPrice - (item.chgXau || 0),
        ts: now,
      };
    }
    if (symbol === 'SILVER' && item.xagPrice) {
      return {
        price: item.xagPrice,
        change: item.chgXag || 0,
        changePercent: item.pcXag || 0,
        high: null, low: null,
        open: item.xagPrice - (item.chgXag || 0),
        prevClose: item.xagPrice - (item.chgXag || 0),
        ts: now,
      };
    }
    return null;
  } catch (err) {
    console.error('goldprice.org failed:', err.message);
    return null;
  }
}

async function tryGoldApi(symbol, now) {
  try {
    // Free public endpoint — no key needed, returns spot prices
    const metalCode = symbol === 'GOLD' ? 'XAU' : symbol === 'SILVER' ? 'XAG' : null;
    if (!metalCode) return null;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(`https://api.gold-api.com/price/${metalCode}`, {
      signal: controller.signal,
    });

    clearTimeout(timeout);
    if (!response.ok) return null;

    const data = await response.json();
    if (data && typeof data.price === 'number' && data.price > 0) {
      return {
        price: data.price,
        change: data.ch || 0,
        changePercent: data.chp || 0,
        high: data.high_price || null,
        low: data.low_price || null,
        open: data.open_price || null,
        prevClose: data.prev_close_price || data.price - (data.ch || 0),
        ts: now,
      };
    }
    return null;
  } catch (err) {
    console.error('gold-api.com failed:', err.message);
    return null;
  }
}

async function tryMetalFromETF(symbol, apiKey, now) {
  try {
    // GLD holds ~0.09295 oz of gold per share; SLV holds ~0.9216 oz silver
    const etfSymbol = symbol === 'GOLD' ? 'GLD' : symbol === 'SILVER' ? 'SLV' : null;
    const multiplier = symbol === 'GOLD' ? (1 / 0.09295) : symbol === 'SILVER' ? (1 / 0.9216) : null;
    if (!etfSymbol || !multiplier || !apiKey) return null;

    const url = `https://finnhub.io/api/v1/quote?symbol=${etfSymbol}&token=${apiKey}`;
    const response = await fetch(url);
    if (!response.ok) return null;

    const data = await response.json();
    if (data && typeof data.c === 'number' && data.c > 0) {
      const spotPrice = Math.round(data.c * multiplier * 100) / 100;
      const spotChange = Math.round((data.d || 0) * multiplier * 100) / 100;
      return {
        price: spotPrice,
        change: spotChange,
        changePercent: data.dp || 0,
        high: data.h ? Math.round(data.h * multiplier * 100) / 100 : null,
        low: data.l ? Math.round(data.l * multiplier * 100) / 100 : null,
        open: data.o ? Math.round(data.o * multiplier * 100) / 100 : null,
        prevClose: data.pc ? Math.round(data.pc * multiplier * 100) / 100 : null,
        ts: now,
      };
    }
    return null;
  } catch (err) {
    console.error('ETF metal derivation failed:', err.message);
    return null;
  }
}

async function fetchCryptoPrice(symbol, coinGeckoId, now) {
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coinGeckoId}&vs_currencies=usd&include_24hr_change=true`;
  const response = await fetch(url);

  if (!response.ok) {
    console.error(`CoinGecko error for ${symbol}: HTTP ${response.status}`);
    return null;
  }

  const data = await response.json();
  const coinData = data[coinGeckoId];

  if (coinData && typeof coinData.usd === 'number') {
    const changePercent = coinData.usd_24h_change || 0;
    const price = coinData.usd;
    const change = price * (changePercent / 100);

    return {
      price,
      change: Math.round(change * 100) / 100,
      changePercent: Math.round(changePercent * 100) / 100,
      high: null,
      low: null,
      open: null,
      prevClose: price - change,
      ts: now,
    };
  }

  return null;
}

async function fetchStockPrice(symbol, apiKey, now) {
  const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${apiKey}`;
  const response = await fetch(url);

  if (!response.ok) {
    console.error(`Finnhub error for ${symbol}: HTTP ${response.status}`);
    return null;
  }

  const data = await response.json();

  if (data && typeof data.c === 'number' && data.c > 0) {
    return {
      price: data.c,
      change: data.d || 0,
      changePercent: data.dp || 0,
      high: data.h,
      low: data.l,
      open: data.o,
      prevClose: data.pc,
      ts: now,
    };
  }

  return null;
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

  const { symbols } = req.query;

  if (!symbols) {
    return res.status(400).json({ error: 'Missing symbols parameter' });
  }

  const apiKey = process.env.FINNHUB_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'FINNHUB_API_KEY not configured' });
  }

  const symbolList = symbols.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
  const prices = {};
  const now = Date.now();

  // Route symbols to the correct data source
  const cryptoSymbols = [];
  const metalSymbols = [];
  const stockSymbols = [];

  for (const symbol of symbolList) {
    // Check cache first
    const cached = cache.get(symbol);
    if (cached && (now - cached.ts) < CACHE_TTL) {
      prices[symbol] = cached.data;
      continue;
    }

    if (METALS.includes(symbol)) {
      metalSymbols.push(symbol);
    } else if (CRYPTO_MAP[symbol]) {
      cryptoSymbols.push({ symbol, geckoId: CRYPTO_MAP[symbol] });
    } else {
      stockSymbols.push(symbol);
    }
  }

  // Fetch metal spot prices (gold, silver) from goldprice.org
  if (metalSymbols.length > 0) {
    // One API call returns both gold and silver
    for (const symbol of metalSymbols) {
      try {
        const priceData = await fetchMetalPrice(symbol, apiKey, now);
        if (priceData) {
          prices[symbol] = priceData;
          cache.set(symbol, { data: priceData, ts: now });
        }
      } catch (err) {
        console.error(`Metal fetch error for ${symbol}:`, err.message);
      }
    }
  }

  // Batch fetch all crypto prices from CoinGecko in one call
  if (cryptoSymbols.length > 0) {
    try {
      const geckoIds = [...new Set(cryptoSymbols.map(c => c.geckoId))].join(',');
      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${geckoIds}&vs_currencies=usd&include_24hr_change=true`;
      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();

        for (const { symbol, geckoId } of cryptoSymbols) {
          const coinData = data[geckoId];
          if (coinData && typeof coinData.usd === 'number') {
            const changePercent = coinData.usd_24h_change || 0;
            const price = coinData.usd;
            const change = price * (changePercent / 100);

            const priceData = {
              price,
              change: Math.round(change * 100) / 100,
              changePercent: Math.round(changePercent * 100) / 100,
              high: null,
              low: null,
              open: null,
              prevClose: price - change,
              ts: now,
            };

            prices[symbol] = priceData;
            cache.set(symbol, { data: priceData, ts: now });
          }
        }
      }
    } catch (err) {
      console.error('CoinGecko batch fetch error:', err.message);
    }
  }

  // Fetch stock prices from Finnhub (must be individual calls)
  if (stockSymbols.length > 0) {
    const stockPromises = stockSymbols.map(async (symbol) => {
      try {
        // Try Finnhub first
        const priceData = await fetchStockPrice(symbol, apiKey, now);

        if (priceData) {
          prices[symbol] = priceData;
          cache.set(symbol, { data: priceData, ts: now });
          return;
        }

        // If Finnhub returned nothing, try CoinGecko as fallback
        // (in case user typed a crypto symbol not in our map)
        const geckoId = await lookupCoinGeckoId(symbol);
        if (geckoId) {
          const cryptoData = await fetchCryptoPrice(symbol, geckoId, now);
          if (cryptoData) {
            prices[symbol] = cryptoData;
            cache.set(symbol, { data: cryptoData, ts: now });
          }
        }
      } catch (err) {
        console.error(`Failed to fetch ${symbol}:`, err.message);
      }
    });

    await Promise.all(stockPromises);
  }

  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=30');
  return res.status(200).json({ prices });
}
