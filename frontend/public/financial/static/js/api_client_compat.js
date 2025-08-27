// Compatibility API client providing watchlist/portfolio/alerts and market methods using localStorage
(function(){
  const LS_KEYS = {
    watchlist: 'sw_watchlist_items',
    portfolio: 'sw_portfolio_items',
    alerts: 'sw_alert_items'
  };

  function read(key){ try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; } }
  function write(key, value){ localStorage.setItem(key, JSON.stringify(value)); }
  function uid(){ return Math.random().toString(36).slice(2) + Date.now().toString(36); }

  const market = {
    async getQuote(symbol){
      // Simulate a quote around 100-1000
      const base = 100 + (Math.abs(hashCode(symbol)) % 900);
      const price = +(base * (0.95 + Math.random()*0.1)).toFixed(2);
      return { symbol, price };
    },
    async getHistory(symbol, period){
      // Generate mock OHLC for 120 points
      const now = Date.now();
      const points = period === '1w' ? 30 : period === '1m' ? 120 : period === '3m' ? 360 : period === '1y' ? 1000 : 1500;
      let last = 100 + (Math.abs(hashCode(symbol)) % 900);
      const data = [];
      for (let i=points-1;i>=0;i--){
        const t = now - i*60*60*1000; // hourly
        const open = last * (0.99 + Math.random()*0.02);
        const high = open * (1 + Math.random()*0.01);
        const low = open * (1 - Math.random()*0.01);
        const close = low + Math.random()*(high-low);
        last = close;
        data.push({ date: t, open:+open.toFixed(2), high:+high.toFixed(2), low:+low.toFixed(2), close:+close.toFixed(2) });
      }
      return data;
    }
  };

  const watchlist = {
    async getAll(){ return read(LS_KEYS.watchlist); },
    async add(symbol, note=''){
      const items = read(LS_KEYS.watchlist);
      if (!items.find(i=>i.symbol===symbol)) items.unshift({ id: uid(), symbol, note });
      write(LS_KEYS.watchlist, items);
      return { ok: true };
    },
    async remove(id){
      let items = read(LS_KEYS.watchlist);
      items = items.filter(i=>i.id!==id && i.symbol!==id);
      write(LS_KEYS.watchlist, items);
      return { ok: true };
    }
  };

  const portfolio = {
    async getAll(){
      const items = read(LS_KEYS.portfolio);
      // enrich with currentPrice
      const enriched = await Promise.all(items.map(async it => {
        const q = await market.getQuote(it.symbol);
        return { ...it, currentPrice: q.price };
      }));
      return enriched;
    },
    async add(symbol, quantity, avgBuyPrice, notes=''){
      const items = read(LS_KEYS.portfolio);
      items.unshift({ id: uid(), symbol, quantity: +quantity, avgBuyPrice: +avgBuyPrice, notes });
      write(LS_KEYS.portfolio, items);
      return { ok: true };
    },
    async update(id, updates){
      const items = read(LS_KEYS.portfolio);
      const idx = items.findIndex(i=>i.id===id);
      if (idx!==-1){ items[idx] = { ...items[idx], ...updates }; write(LS_KEYS.portfolio, items); }
      return items[idx];
    },
    async remove(id){
      let items = read(LS_KEYS.portfolio);
      items = items.filter(i=>i.id!==id);
      write(LS_KEYS.portfolio, items);
      return { ok: true };
    }
  };

  const alerts = {
    async getAll(){ return read(LS_KEYS.alerts); },
    async create(symbol, targetPrice, condition){
      const items = read(LS_KEYS.alerts);
      const alert = { id: uid(), symbol, targetPrice:+targetPrice, condition, isTriggered:false, createdAt: new Date().toISOString() };
      items.unshift(alert);
      write(LS_KEYS.alerts, items);
      return alert;
    },
    async update(id, updates){
      const items = read(LS_KEYS.alerts);
      const idx = items.findIndex(a=>a.id===id);
      if (idx!==-1){ items[idx] = { ...items[idx], ...updates }; write(LS_KEYS.alerts, items); return items[idx]; }
      return null;
    },
    async delete(id){
      let items = read(LS_KEYS.alerts);
      items = items.filter(a=>a.id!==id);
      write(LS_KEYS.alerts, items);
      return { ok: true };
    }
  };

  function hashCode(str){ let h=0; for(let i=0;i<str.length;i++){ h=((h<<5)-h)+str.charCodeAt(i); h|=0; } return h; }

  window.apiClient = { market, watchlist, portfolio, alerts };
})();
