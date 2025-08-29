// Attach a delegated click handler for any element carrying data-exchange and data-symbol
// Usage in DOM: <a href="#" data-exchange="NSE" data-symbol="RELIANCE" class="dh-symbol">RELIANCE</a>
(function initDhanChartRedirect(){
  function buildChartUrl(exchange, symbol){
    const exch = (exchange || 'NSE').toString().toUpperCase();
    const sym = (symbol || '').toString().toUpperCase().replace(/\s+/g, '');
    return `https://trading.dhan.co/charts/${encodeURIComponent(exch)}/${encodeURIComponent(sym)}`;
  }

  function clickHandler(e){
    const el = e.target.closest('[data-exchange][data-symbol]');
    if (!el) return;
    // Prevent default navigation within our app
    e.preventDefault();
    const exchange = el.dataset.exchange;
    const symbol = el.dataset.symbol;
    if (!symbol) return;
    const url = buildChartUrl(exchange, symbol);
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  document.addEventListener('click', clickHandler);
})();
