/* ===========================================================
   CO₹PU$ — live prices
   These call public market data sources directly from your
   browser. There is still no server of ours involved, and no
   AI service either, this is just fetching a number that is
   already public. Mutual fund NAVs need no key. Stock prices
   need a free personal key from Alpha Vantage, Finnhub or EODHD,
   stored only in your browser's local storage, never sent to us.

   Every function below wraps its fetch() in its own try/catch so
   a plain network failure (offline, blocked, DNS) is reported as
   that, rather than surfacing as a generic, unhelpful error.
=========================================================== */

async function safeFetch(url, networkErrorMessage){
  try{
    return await fetch(url);
  }catch(networkErr){
    throw new Error(networkErrorMessage || 'Could not reach that service, check your internet connection.');
  }
}

async function searchMfSchemes(query){
  if(!query || query.trim().length < 3) return [];
  const res = await safeFetch(
    `https://api.mfapi.in/mf/search?q=${encodeURIComponent(query.trim())}`,
    'Could not reach the mutual fund search service, check your internet connection.'
  );
  if(!res.ok) throw new Error('Mutual fund search failed.');
  const list = await res.json();
  return list.slice(0, 15);
}

async function fetchMfNav(schemeCode){
  const code = String(schemeCode || '').trim();
  if(!code) throw new Error('Add a scheme code first, search for the fund name below to find it.');
  const res = await safeFetch(
    `https://api.mfapi.in/mf/${encodeURIComponent(code)}/latest`,
    'Could not reach the mutual fund price service, check your internet connection.'
  );
  if(!res.ok) throw new Error(`mfapi.in did not recognise scheme code "${code}". Search for the fund again below to get the exact code.`);
  const json = await res.json();
  if(!json.data || !json.data[0]) throw new Error('No NAV data for this scheme yet.');
  return {
    nav: Number(json.data[0].nav),
    date: json.data[0].date,
    schemeName: json.meta ? json.meta.scheme_name : ''
  };
}

// Gold and silver, per gram, via the free goldprice.dev endpoint. No key
// needed for a modest number of calls an hour, straight from your browser.
const TROY_OUNCE_IN_GRAMS = 31.1034768;

async function fetchMetalPricePerGram(metal, currency){
  const symbol = (metal === 'silver' ? 'XAG' : 'XAU') + '-' + currency.toUpperCase() + '-SPOT';
  const res = await safeFetch(
    `https://api.goldprice.dev/v1/prices?symbol=${symbol}`,
    'Could not reach the gold price service, check your internet connection.'
  );
  if(!res.ok) throw new Error('Could not reach the gold price service.');
  const json = await res.json();
  const row = json.symbols && json.symbols[0];
  if(!row || !row.price) throw new Error('No price returned for that currency.');
  return {
    pricePerGram: Number(row.price) / TROY_OUNCE_IN_GRAMS,
    isStale: !!row.is_stale,
    computedAt: row.computed_at
  };
}

// Crypto via CoinGecko's free, keyless endpoint. `coinId` is CoinGecko's
// own slug, e.g. "bitcoin", "ethereum", "solana", not the ticker symbol.
async function fetchCryptoPrice(coinId, currency){
  const id = String(coinId || '').trim().toLowerCase();
  if(!id) throw new Error('Add a CoinGecko coin ID first, e.g. "bitcoin".');
  const cur = currency.toLowerCase();
  const res = await safeFetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(id)}&vs_currencies=${cur}`,
    'Could not reach CoinGecko, check your internet connection.'
  );
  if(!res.ok) throw new Error('Could not reach CoinGecko.');
  const json = await res.json();
  const entry = json[id];
  if(!entry || entry[cur] === undefined) throw new Error('Unknown coin ID, use the CoinGecko slug, e.g. "bitcoin", not the ticker "BTC".');
  return { price: Number(entry[cur]) };
}

// Currency conversion via Frankfurter, free and keyless, sourced from
// European Central Bank reference rates.
async function fetchFxRate(from, to){
  // frankfurter.app now redirects to frankfurter.dev, and a cross-domain
  // redirect on a CORS request fails in some browsers, so this calls the
  // current domain directly rather than following the old one.
  const url = `https://api.frankfurter.dev/v1/latest?base=${encodeURIComponent(from)}&symbols=${encodeURIComponent(to)}`;
  const res = await safeFetch(url, 'Could not reach the currency conversion service, check your internet connection.');
  if(!res.ok) throw new Error('Could not reach the currency conversion service.');
  const json = await res.json();
  if(!json.rates || json.rates[to] === undefined) throw new Error('That currency pair is not available.');
  return { rate: Number(json.rates[to]), date: json.date };
}

// Finnhub as an alternative stock price source, better free tier than
// Alpha Vantage but its free plan mostly covers US listed tickers.
async function fetchFinnhubQuote(symbol, apiKey){
  if(!apiKey) throw Object.assign(new Error('Add your free Finnhub key first.'), { code: 'NO_KEY', provider: 'finnhub' });
  const res = await safeFetch(
    `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${apiKey}`,
    'Could not reach Finnhub, check your internet connection.'
  );
  if(res.status === 401 || res.status === 403) throw Object.assign(new Error('Finnhub did not accept that key. Copy it again from your Finnhub dashboard.'), { code: 'BAD_KEY', provider: 'finnhub' });
  if(res.status === 429) throw new Error('Finnhub says too many lookups this minute. Wait a moment and try again.');
  if(!res.ok) throw new Error('Price lookup failed.');
  const json = await res.json();
  if(!json.c || json.c === 0) throw new Error('No price found for that symbol on Finnhub\'s free plan, which mainly covers US listed tickers.');
  return { price: Number(json.c) };
}

async function fetchStockPrice(symbol, apiKey){
  if(!apiKey) throw Object.assign(new Error('Add your free Alpha Vantage key first.'), { code: 'NO_KEY', provider: 'alphavantage' });
  const res = await safeFetch(
    `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(symbol)}&apikey=${apiKey}`,
    'Could not reach Alpha Vantage, check your internet connection.'
  );
  if(!res.ok) throw new Error('Price lookup failed.');
  const json = await res.json();
  const quote = json['Global Quote'];
  if(!quote || !quote['05. price']){
    const info = String(json['Error Message'] || json['Information'] || json['Note'] || '');
    if(/api ?key/i.test(info) && /invalid|missing/i.test(info)) throw Object.assign(new Error('Alpha Vantage did not accept that key. Copy it again from alphavantage.co.'), { code: 'BAD_KEY', provider: 'alphavantage' });
    if(json['Note'] || json['Information']) throw new Error('Rate limit reached on the free plan (25 calls a day), try again tomorrow or switch to Finnhub in Settings.');
    throw new Error('No price found for that symbol. Check the exact ticker, and pick the right exchange above if it is an Indian stock.');
  }
  return {
    price: Number(quote['05. price']),
    changePct: quote['10. change percent']
  };
}

// EODHD: delayed quotes (about 15 minutes) for most world exchanges, written
// as TICKER.EXCHANGE, e.g. VAS.AU (ASX), XIU.TO (Toronto), VWRL.LSE (London),
// AAPL.US. The free plan allows 20 lookups a day.
async function fetchEodhdQuote(symbol, apiKey){
  if(!apiKey) throw Object.assign(new Error('Add your free EODHD key first.'), { code: 'NO_KEY', provider: 'eodhd' });
  const res = await safeFetch(
    `https://eodhd.com/api/real-time/${encodeURIComponent(symbol)}?api_token=${encodeURIComponent(apiKey)}&fmt=json`,
    'Could not reach EODHD from this browser. Check your connection; if it keeps failing, EODHD may not allow requests from this site, so type the price yourself.'
  );
  if(res.status === 401 || res.status === 403) throw Object.assign(new Error('EODHD did not accept that key. Copy it again from your EODHD dashboard.'), { code: 'BAD_KEY', provider: 'eodhd' });
  if(res.status === 402 || res.status === 429) throw new Error('EODHD daily limit reached on the free plan (20 lookups a day). Try again tomorrow.');
  if(!res.ok) throw new Error('No price found on EODHD for ' + symbol + '. Check the ticker and exchange code.');
  const json = await res.json();
  const price = Number(json && (json.close !== 'NA' ? json.close : json.previousClose));
  if(!price) throw new Error('No price found on EODHD for ' + symbol + '. Check the ticker and exchange code.');
  return { price };
}
