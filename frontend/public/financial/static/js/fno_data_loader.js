/* F&O Data Loader: centralizes endpoints, auth, and caching for F&O data */
(function (global) {
  'use strict';

  // Base API routes
  const ROUTES = {
    base: (global.root || '') + '/api/stocks',
    fno: (global.root || '') + '/api/stocks/fno',
    studyDataBase: (global.root_1 || '')
  };

  // Get auth token from storage
  function getAuthToken() {
    try {
      if (typeof jwt_decode !== 'undefined' && global.cookieValue_1) {
        return global.cookieValue_1;
      }
      return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    } catch (e) { 
      console.warn('Auth token not available');
      return null;
    }
  }

  // Build headers with auth
  function buildHeaders() {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    const token = getAuthToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  }

  // Simple in-memory cache with TTL (5 minutes default)
  const cache = new Map();
  
  function cacheGet(key, ttlMs = 300000) {
    const item = cache.get(key);
    if (!item) return null;
    if (Date.now() - item.timestamp > ttlMs) {
      cache.delete(key);
      return null;
    }
    return item.data;
  }

  function cacheSet(key, data) {
    cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // Handle API errors consistently
  function handleError(error) {
    console.error('API Error:', error);
    throw error;
  }

  const FnoAPI = {
    // Fetch F&O heatmap data
    heatmap: function() {
      const cacheKey = 'fno_heatmap';
      const cached = cacheGet(cacheKey, 60000); // 1 min TTL
      if (cached) return Promise.resolve(cached);
      
      return $.ajax({
        url: `${ROUTES.fno}/heatmap`,
        method: 'GET',
        headers: buildHeaders()
      })
      .then(data => {
        cacheSet(cacheKey, data);
        return data;
      })
      .catch(handleError);
    },

    // Get running expiry dates for a script
    getExpiry: function(script) {
      const cacheKey = `expiry_${script}`;
      const cached = cacheGet(cacheKey, 3600000); // 1 hour TTL for expiries
      if (cached) return Promise.resolve(cached);
      
      return $.ajax({
        url: `${ROUTES.fno}/get_running_expiry`,
        method: 'POST',
        headers: buildHeaders(),
        data: JSON.stringify({ script })
      })
      .then(data => {
        cacheSet(cacheKey, data);
        return data;
      })
      .catch(handleError);
    },

    // Get live open interest data
    liveOI: function(script, exp) {
      const cacheKey = `live_oi_${script}_${exp}`;
      const cached = cacheGet(cacheKey, 30000); // 30s TTL for live data
      if (cached) return Promise.resolve(cached);
      
      return $.ajax({
        url: `${ROUTES.fno}/live_oi`,
        method: 'POST',
        headers: buildHeaders(),
        data: JSON.stringify({ script, exp })
      })
      .then(data => {
        cacheSet(cacheKey, data, 30000);
        return data;
      })
      .catch(handleError);
    },

    // Get OI change between two timestamps
    oiChange: function(ts1, ts2, script, exp) {
      const cacheKey = `oi_change_${ts1}_${ts2}_${script}_${exp}`;
      
      return $.ajax({
        url: `${ROUTES.fno}/index_analysis`,
        method: 'POST',
        headers: buildHeaders(),
        data: JSON.stringify({ ts1, ts2, script, exp })
      })
      .catch(handleError);
    }
  };

  // Expose to global scope
  global.FnoAPI = FnoAPI;
  
  // Add to window.tredcode if it exists
  if (global.tredcode) {
    global.tredcode.FnoAPI = FnoAPI;
  }
  
  console.log('F&O Data Loader initialized');
})(window);
