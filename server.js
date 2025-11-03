// server.js (MINIMAL – CoinGecko free tier – USD only)
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 9090;

app.use(express.json());

// --- simple TTL cache (60s) ---
const CACHE = new Map();
function cacheGet(k){const v=CACHE.get(k);if(!v)return null;if(v.exp<Date.now()){CACHE.delete(k);return null;}return v.data;}
function cacheSet(k,d){CACHE.set(k,{data:d,exp:Date.now()+60000});} // 60 seconds

// fetch wrapper
async function fetchJson(url){
  const res = await fetch(url,{headers:{accept:'application/json','user-agent':'CryptoAnalyzer/1.0'}});
  if(!res.ok){
    const txt = await res.text().catch(()=> '');
    const e = new Error(`status ${res.status}`);
    e.status=res.status;
    e.body=txt;
    throw e;
  }
  return res.json();
}

// coin endpoint
app.get('/api/coin', async(req,res)=>{
  try {
    const coin = String(req.query.coin||'').trim().toLowerCase();
    if(!coin) return res.status(400).json({error:'coin required'});

    const key = `coin_${coin}`;
    const cache = cacheGet(key);
    if(cache) return res.json(cache);

    const cg = await fetchJson(`https://api.coingecko.com/api/v3/coins/${encodeURIComponent(coin)}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=true&sparkline=false`);

    const out = {
      source: 'coingecko',
      coin,
      id: cg.id,
      name: cg.name,
      symbol: cg.symbol?.toUpperCase(),
      price_usd: cg?.market_data?.current_price?.usd ?? null,
      marketcap_usd: cg?.market_data?.market_cap?.usd ?? null,
      categories: cg?.categories ?? [],
      homepage: cg?.links?.homepage?.[0]??null,
      twitter: cg?.links?.twitter_screen_name?`https://twitter.com/${cg.links.twitter_screen_name}`:null,
      github: cg?.links?.repos_url?.github?.[0]??null,
      description: cg?.description?.en ?? null,
      developer_stats: cg?.developer_data ?? null
    };

    cacheSet(key,out);
    res.json(out);
  } catch(err) {
    console.error('[API] /api/coin error:', err.message);
    res.status(err.status || 502).json({error: 'coingecko unavailable'});
  }
});

// global endpoint
app.get('/api/global', async(req,res)=>{
  try {
    const key = 'global';
    const cache = cacheGet(key);
    if(cache) return res.json(cache);
    const data = await fetchJson('https://api.coingecko.com/api/v3/global');
    cacheSet(key, data);
    res.json(data);
  } catch(err) {
    console.error('[API] /api/global error:', err.message);
    res.status(err.status || 502).json({error: 'coingecko unavailable'});
  }
});

// trending endpoint
app.get('/api/trending', async(req,res)=>{
  try {
    const key = 'trending';
    const cache = cacheGet(key);
    if(cache) return res.json(cache);
    const data = await fetchJson('https://api.coingecko.com/api/v3/search/trending');
    cacheSet(key, data);
    res.json(data);
  } catch(err) {
    console.error('[API] /api/trending error:', err.message);
    res.status(err.status || 502).json({error: 'coingecko unavailable'});
  }
});

// exchanges endpoint
app.get('/api/exchanges', async(req,res)=>{
  try {
    const key = 'exchanges';
    const cache = cacheGet(key);
    if(cache) return res.json(cache);
    const data = await fetchJson('https://api.coingecko.com/api/v3/exchanges');
    cacheSet(key, data);
    res.json(data);
  } catch(err) {
    console.error('[API] /api/exchanges error:', err.message);
    res.status(err.status || 502).json({error: 'coingecko unavailable'});
  }
});

// health
app.get('/api/health',(_req,res)=>res.json({ok:true,time:new Date().toISOString()}));

// static files
app.use(express.static(__dirname));

// 404 handler
app.use((req,res)=>{
  res.status(404).json({error:'Not found'});
});

// error handler
app.use((err,req,res,next)=>{
  console.error('[ERROR]', err);
  res.status(err.status || 500).json({error: 'Internal server error'});
});

app.listen(PORT, '0.0.0.0', ()=>console.log(`Server running on port ${PORT}`));
