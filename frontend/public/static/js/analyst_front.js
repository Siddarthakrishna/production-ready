/* Frontpage interactions: charts, animations, forms */
(function(){
  const $ = window.jQuery;

  // Mobile menu toggle
  $(document).on('click', '#menuToggle', function(){
    $('#mobileMenu').slideToggle(160);
  });
  $(document).on('click', '#mobileMenu .nav-link', function(){
    $('#mobileMenu').slideUp(120);
  });

  // GSAP intro animations if available
  if (window.gsap){
    gsap.registerPlugin(window.ScrollTrigger || {});
    gsap.from('.profile-wrapper', { y: 10, opacity: 0, duration: .8, ease: 'power2.out' });
    gsap.from('.headline', { y: 10, opacity: 0, duration: .8, delay: .1 });
    gsap.from('.tagline', { y: 10, opacity: 0, duration: .8, delay: .2 });
    gsap.utils.toArray('.idea-card').forEach((el) => {
      gsap.from(el, { scrollTrigger: { trigger: el, start: 'top 85%' }, y: 18, opacity: 0, duration: .6 });
    });
  }

  // TradingView NIFTY 50 tape
  function injectTickerTape(){
    const el = document.getElementById('ticker-tape');
    if (!el) return;
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbols: [
        { proName: 'NSE:NIFTY', title: 'NIFTY 50' },
        { proName: 'NSE:BANKNIFTY', title: 'BANK NIFTY' },
        { proName: 'NSE:FINNIFTY', title: 'FIN NIFTY' }
      ],
      showSymbolLogo: true,
      colorTheme: 'dark',
      isTransparent: true,
      displayMode: 'adaptive',
      locale: 'en'
    });
    const wrap = document.createElement('div');
    wrap.className = 'tradingview-widget-container';
    const inner = document.createElement('div');
    inner.className = 'tradingview-widget-container__widget';
    wrap.appendChild(inner);
    script.onerror = function(){
      const msg = document.createElement('div');
      msg.className = 'small text-muted';
      msg.textContent = 'TradingView ticker failed to load. Please check your network/ad-blocker and ensure the page is served over http/https (not file://).';
      wrap.appendChild(msg);
    };
    wrap.appendChild(script);
    el.appendChild(wrap);
  }

  // Ideas grid with TradingView mini candlestick widgets and research/risk
  function populateIdeas(){
    const grid = document.getElementById('ideasGrid');
    if (!grid) return;
    const ideas = [
      { sym:'NSE:RELIANCE', title:'RELIANCE — Trend Pullback', rr:'RR 1:2', research:'Refining & retail tailwinds; watch OPM trend and petchem cycle.', risk:'Earnings sensitivity to spreads; policy risk.' },
      { sym:'NSE:TCS', title:'TCS — Base Breakout', rr:'RR 1:2.3', research:'Large-cap IT leadership; order book resilience and margin levers.', risk:'US recession risk; currency volatility.' },
      { sym:'NSE:HDFCBANK', title:'HDFCBANK — Higher Low', rr:'RR 1:2', research:'Deposit growth normalization; watch NIM trajectory post-merger.', risk:'NIM compression; asset quality surprise.' },
      { sym:'NSE:INFY', title:'INFY — Inside Bar', rr:'RR 1:2.2', research:'Stable digital pipeline; utilization recovery potential.', risk:'Deal ramp delays; pricing pressure.' },
    ]
    grid.innerHTML = ideas.map((it,idx)=>
      `<div class="col-12 col-md-6 col-lg-3">
        <div class="idea-card h-100">
          <div class="d-flex align-items-start justify-content-between">
            <div class="idea-title">${it.title}</div>
            <div class="rr">${it.rr}</div>
          </div>
          <div class="tv-mini mt-2" id="tv-${idx}"></div>
          <div class="mt-2 small text-muted">Research: ${it.research}</div>
          <div class="small" style="color:#ff9f9f">Risk: ${it.risk}</div>
          <div class="mt-2 d-flex justify-content-end">
            <a class="btn btn-ghost btn-sm" href="#">Read Full Idea</a>
          </div>
        </div>
      </div>`
    ).join('');
    // After DOM paint, mount TradingView mini widgets
    requestAnimationFrame(()=>{
      ideas.forEach((it,idx)=>{
        const host = document.getElementById(`tv-${idx}`);
        if (!host) return;
        const script = document.createElement('script');
        script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js';
        script.async = true;
        const chartUrl = 'https://www.tradingview.com/chart/?symbol=' + encodeURIComponent(it.sym);
        script.innerHTML = JSON.stringify({
          symbol: it.sym,
          width: '100%',
          height: 200,
          locale: 'en',
          dateRange: '12M',
          colorTheme: 'dark',
          isTransparent: true,
          autosize: true,
          largeChartUrl: chartUrl
        });
        const wrap = document.createElement('div');
        wrap.className = 'tradingview-widget-container';
        const inner = document.createElement('div');
        inner.className = 'tradingview-widget-container__widget';
        wrap.appendChild(inner);
        script.onerror = function(){
          const msg = document.createElement('div');
          msg.className = 'small text-muted';
          msg.textContent = `Widget for ${it.sym} failed to load. Check network/ad-blocker and use http/https.`;
          wrap.appendChild(msg);
        };
        wrap.appendChild(script);
        host.appendChild(wrap);
      });
      if (window.gsap){
        gsap.utils.toArray('.idea-card').forEach((el) => {
          gsap.from(el, { scrollTrigger: { trigger: el, start: 'top 85%' }, y: 18, opacity: 0, duration: .6 });
        });
      }
    });
  }

  // NIFTY 50 strip (from backend public proxy)
  async function loadNifty50Strip(){
    const host = document.getElementById('nifty50-strip');
    if (!host) return;
    const setStatus = (html) => { host.innerHTML = html; };
    try {
      setStatus('<div class="small text-muted">Loading NIFTY 50...</div>');
      const res = await fetch('http://localhost:8000/api/public/nifty50');
      if (!res.ok) throw new Error('HTTP '+res.status);
      const data = await res.json();
      const list = Array.isArray(data) ? data
        : Array.isArray(data?.items) ? data.items
        : Array.isArray(data?.data) ? data.data
        : Array.isArray(data?.result) ? data.result
        : [];

      if (!list.length){
        setStatus('<div class="small text-muted">No data received for NIFTY 50.</div>');
        return;
      }

      const pick = (o, keys) => keys.find(k => o && (k in o));
      const fmtSigned = (v) => (v>0?'+':'') + (typeof v==='number'? v.toFixed(2): v);

      const items = list.map(item => {
        const symKey = pick(item, ['symbol','name','scrip','ticker','SYMBOL','Name']);
        const lastKey = pick(item, ['last','ltp','price','close','LTP','Price']);
        const chKey = pick(item, ['change','chg','diff','CHANGE']);
        const pctKey = pick(item, ['pct','percent','chgPct','percentage','PCT']);
        const sym = (symKey ? item[symKey] : '').toString();
        const last = lastKey ? item[lastKey] : undefined;
        const ch = chKey ? item[chKey] : undefined;
        const pct = pctKey ? item[pctKey] : undefined;
        const dir = (typeof (pct ?? ch) === 'number') ? ((pct ?? ch) >= 0 ? 'up' : 'down') : 'flat';
        return { sym, last, ch, pct, dir };
      }).filter(x=>x.sym);

      if (!items.length){
        setStatus('<div class="small text-muted">Unexpected data format from API.</div>');
        return;
      }

      const row = document.createElement('div');
      row.style.display = 'flex';
      row.style.gap = '16px';
      row.style.whiteSpace = 'nowrap';
      row.style.overflowX = 'auto';
      row.style.padding = '2px 4px';

      items.forEach(it => {
        const chip = document.createElement('div');
        chip.className = 'small';
        chip.style.display = 'inline-flex';
        chip.style.alignItems = 'baseline';
        chip.style.gap = '8px';
        chip.style.padding = '4px 8px';
        chip.style.borderRadius = '8px';
        chip.style.background = 'rgba(255,255,255,0.03)';
        const color = it.dir==='up' ? '#6CFFA7' : it.dir==='down' ? '#FFA6A6' : '#ddd';
        const sym = document.createElement('span');
        sym.textContent = it.sym;
        const price = document.createElement('span');
        price.style.color = '#bbb';
        price.textContent = (it.last!==undefined? it.last : '').toString();
        const change = document.createElement('span');
        change.style.color = color;
        if (it.pct!==undefined)
          change.textContent = fmtSigned(Number(it.pct)) + '%';
        else if (it.ch!==undefined)
          change.textContent = fmtSigned(Number(it.ch));
        else
          change.textContent = '';
        chip.append(sym, price, change);
        row.appendChild(chip);
      });

      host.innerHTML = '';
      host.appendChild(row);
    } catch (err){
      setStatus('<div class="small" style="color:#ff9f9f">Failed to load NIFTY 50. Please retry.</div>');
      // eslint-disable-next-line no-console
      console.warn('NIFTY50 fetch failed', err);
    }
  }

  // Contact form
  function bindContact(){
    const form = document.getElementById('contactForm');
    const status = document.getElementById('contactStatus');
    if (!form) return;
    form.addEventListener('submit', async (e)=>{
      e.preventDefault();
      status.textContent = 'Sending...';
      const payload = {
        name: form.name.value.trim(),
        email: form.email.value.trim(),
        subject: form.subject.value.trim(),
        message: form.message.value.trim()
      };
      try{
        const res = await fetch('http://localhost:8000/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (!res.ok) throw new Error('Failed');
        status.textContent = 'Thanks! I will get back to you shortly.';
        form.reset();
      }catch(err){
        status.textContent = 'Something went wrong. Please try again later.';
      }
    });
  }

  // Newsletter
  function bindNewsletter(){
    const f = document.getElementById('newsletterForm');
    if (!f) return;
    f.addEventListener('submit', (e)=>{
      e.preventDefault();
      const email = document.getElementById('newsletterEmail').value.trim();
      if (!email) return;
      alert('Subscribed: '+email);
      f.reset();
    });
  }

  // Init
  $(function(){
    // Warn if running from file:// which blocks TradingView widgets
    if (location.protocol === 'file:') {
      const warn = document.createElement('div');
      warn.className = 'container';
      warn.innerHTML = "<div class=\"glass p-2 small\" style=\"margin-top:8px;color:#ffb3b3\">TradingView widgets require http/https. Please run a local server (not file://).</div>";
      const nav = document.getElementById('mainNav');
      (nav && nav.parentNode) ? nav.parentNode.insertBefore(warn, nav.nextSibling) : document.body.prepend(warn);
      console.warn('TradingView widgets may not load over file://. Serve via http/https.');
    }
    injectTickerTape();
    loadNifty50Strip();
    populateIdeas();
    bindContact();
    bindNewsletter();
  });
})();
