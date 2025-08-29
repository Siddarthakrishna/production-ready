// Main app entry: centralizes imports and initialization
// Vendor globals expected: bootstrap (via bootstrap.bundle.min.js), ApexCharts (CDN), window.apiClient (from api_client_compat.js)

// Import ES modules (ensure they execute and attach any singletons to window)
import './utils.js';
import chartManager from './charts.js';
import portfolioManager from './portfolio.js';
import './watchlist.js';
import './dhan_chart_redirect.js';

// Optional: simple tab routing via hash
(function initTabRouting(){
  const tabsEl = document.getElementById('wlTabs');
  if (!tabsEl) return;
  function showTabFromHash(){
    const hash = window.location.hash.replace('#','');
    const target = hash && document.querySelector(`[data-bs-target="#${hash}"]`);
    if (target) new bootstrap.Tab(target).show();
  }
  window.addEventListener('hashchange', showTabFromHash);
  showTabFromHash();
})();

// Expose managers (optional if needed elsewhere)
window.chartManager = chartManager;
window.portfolioManager = portfolioManager;
