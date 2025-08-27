// Central API configuration
// Single base for all data endpoints
// If you need to switch environments, change API_BASE here only.

// Do not override app protected base. Use DATA_API_BASE for public data endpoints.
window.DATA_API_BASE = window.DATA_API_BASE || 'http://localhost:8000'; 
// Back-compat alias for legacy code that references API_BASE for data only
window.API_BASE = window.API_BASE || window.DATA_API_BASE;

// Helpers to build normalized endpoints
window.apiUrl = {
  current: () => `${DATA_API_BASE}/current?type=servertime`,
  studyData: (name) => `${DATA_API_BASE}/swing/study/data/${encodeURIComponent(name)}`,
  studySymbol: (name, count = 5) => `${DATA_API_BASE}/swing/study/symbol/${encodeURIComponent(name)}?count=${encodeURIComponent(count)}`,
  advDec: (index) => `${DATA_API_BASE}/swing/adv-dec/${encodeURIComponent(index)}`,
};

// v2 API builders (standardized endpoints)
window.apiV2 = {
  // Money Flux
  moneyfluxHeatmap: (index) => `${DATA_API_BASE}/moneyflux/heatmap?index=${encodeURIComponent(index)}`,

  // Index Analysis
  indexExpiry: (name) => `${DATA_API_BASE}/index/${encodeURIComponent(name)}/expiry`,
  indexOi: (name) => `${DATA_API_BASE}/index/${encodeURIComponent(name)}/oi`,
  indexPcr: (name) => `${DATA_API_BASE}/index/${encodeURIComponent(name)}/pcr`,
  indexContracts: (name) => `${DATA_API_BASE}/index/${encodeURIComponent(name)}/contracts`,

  // Sector
  sectorHeatmap: () => `${DATA_API_BASE}/sector/heatmap`,
  sectorDetail: (sector) => `${DATA_API_BASE}/sector/${encodeURIComponent(sector)}`,

  // F&O
  fnoExpiry: (symbol) => `${DATA_API_BASE}/fno/${encodeURIComponent(symbol)}/expiry`,
  fnoOi: (symbol, period) => `${DATA_API_BASE}/fno/${encodeURIComponent(symbol)}/oi${period ? `?period=${encodeURIComponent(period)}` : ''}`,
  fnoOptionChain: (symbol) => `${DATA_API_BASE}/fno/${encodeURIComponent(symbol)}/option-chain`,
  fnoRelativeFactor: (symbol) => `${DATA_API_BASE}/fno/${encodeURIComponent(symbol)}/relative-factor`,
  fnoSignal: (symbol) => `${DATA_API_BASE}/fno/${encodeURIComponent(symbol)}/signal`,
  fnoHeatmap: () => `${DATA_API_BASE}/fno/heatmap`,

  // Market Depth
  mdHighpower: () => `${DATA_API_BASE}/market-depth/highpower`,
  mdIntradayBoost: () => `${DATA_API_BASE}/market-depth/intraday-boost`,
  mdTopLevel: () => `${DATA_API_BASE}/market-depth/top-level`,
  mdLowLevel: () => `${DATA_API_BASE}/market-depth/low-level`,
  mdGainers: () => `${DATA_API_BASE}/market-depth/gainers`,
  mdLosers: () => `${DATA_API_BASE}/market-depth/losers`,

  // Pro Setup
  proSpike5m: () => `${DATA_API_BASE}/pro/spike/5min`,
  proSpike10m: () => `${DATA_API_BASE}/pro/spike/10min`,
  proBullDiv15: () => `${DATA_API_BASE}/pro/bullish-divergence/15`,
  proBearDiv15: () => `${DATA_API_BASE}/pro/bearish-divergence/15`,
  proBullDiv1h: () => `${DATA_API_BASE}/pro/bullish-divergence/1h`,
  proBearDiv1h: () => `${DATA_API_BASE}/pro/bearish-divergence/1h`,
  proMultiResistance: () => `${DATA_API_BASE}/pro/multi-resistance`,
  proMultiSupport: () => `${DATA_API_BASE}/pro/multi-support`,
  proUnusualVolume: () => `${DATA_API_BASE}/pro/unusual-volume`,

  // Swing Centre
  swingWeeklyPerformance: () => apiUrl.studyData('MAJOR INDEX WEEKLY PERFORMANCE'),
  swingShortTermBullish: (count = 20) => apiUrl.studySymbol('short-term-bullish', count),
  swingShortTermBearish: (count = 20) => apiUrl.studySymbol('short-term-bearish', count),
  swingLongTermBullish: (count = 20) => apiUrl.studySymbol('long-term-bullish', count),
  swingLongTermBearish: (count = 20) => apiUrl.studySymbol('long-term-bearish', count),
  swingAdvanceDecline: (index = 'NIFTY') => apiUrl.advDec(index),

  // Journal
  journalPost: () => `${DATA_API_BASE}/journal/logs`,
  journalSummary: () => `${DATA_API_BASE}/journal/summary`,
  journalChart: () => `${DATA_API_BASE}/journal/chart`,

  // Watchlist
  watchlist: () => `${DATA_API_BASE}/watchlist`,
  watchlistAdd: () => `${DATA_API_BASE}/watchlist/add`,
  watchlistRemove: () => `${DATA_API_BASE}/watchlist/remove`,

  // FII-DII
  fiiDiiNet: () => `${DATA_API_BASE}/fii-dii/net`,
  fiiDiiBreakdown: () => `${DATA_API_BASE}/fii-dii/breakdown`,
};
