// Shim to unify API endpoints without rewriting every JS file
// Include this BEFORE other page scripts.

// Single base for Sharada Research public data (do NOT use for protected app endpoints)
window.DATA_API_BASE = window.DATA_API_BASE || 'https://api.sharadaresearch.in';
// Back-compat: some legacy files refer to API_BASE for data endpoints only
window.API_BASE = window.API_BASE || window.DATA_API_BASE;

// Legacy variables used across files, mapped to the new base
// Many files build URLs as: root_1 + route + '/<NAME>'
// Map them to the normalized paths here.
window.root_1 = window.API_BASE;           // e.g., https://api.sharadaresearch.in
window.route  = '/study-data';             // sectorial_flow, market_depth tables
window.route_1 = '/study-data';            // pro_setup charts
window.route_2 = '/study-symbol';          // pro_setup tables and symbol scans

// Some files use direct adv-dec paths already: /adv-dec/NIFTY, /adv-dec/FO
// If any use variables, keep consistency via:
window.route_adv_dec = '/adv-dec';

// Admin/chat endpoints: keep relative to current origin unless you proxy them behind same domain
// If you deploy the backend at same origin, this will work as /api/admin/*
window.main_route = '/api/admin';
// If pages prepend `root + main_route`, set root to empty for same-origin; otherwise point to your backend host.
window.root = '';

// Other legacy variables often seen
window.scanner_root = window.API_BASE;     // optional; unify scanner references if present
window.main_route_1 = '/live_price';       // keep as-is unless you have a unified endpoint for live prices
window.route_dhan = '/dhan';               // keep as-is or adjust if unified later

// Additional missing route variables found in the codebase
window.route_fno = '/fno';                 // F&O related endpoints
window.route_money_flux = '/money_flux';   // Money flux endpoints
window.route_index_analysis = '/index_analysis'; // Index analysis endpoints
window.route_scanner = '/scanner';         // Scanner endpoints
// Feedback module removed; keep a null route and guard to avoid accidental calls
window.route_feedback = null;
window.feedbackDisabled = true;
window.route_contact = '/contact';         // Contact endpoints

// F&O specific routes
window.route_fno_expiry = '/fno/get_running_expiry';
window.route_fno_live_oi = '/fno/live_oi';
window.route_fno_analysis = '/fno/index_analysis';
window.route_fno_heatmap = '/fno/heatmap';

// Scanner specific routes - point to unified endpoints
window.route_hd_data_fno = '/unified/fetch_hd_data_fno';
window.route_hd_data_n500 = '/unified/fetch_hd_data_n500';
window.route_dsp_data_fno = '/unified/fetch_dsp_data_fno';
window.route_dsp_data_n500 = '/unified/fetch_dsp_data_n500';
window.route_hd_hist = '/unified/hd_hist';

// Money flux specific routes
window.route_money_flux_expiry = '/money_flux/get_running_expiry';
window.route_money_flux_chart = '/money_flux/chart';
window.route_money_flux_access = '/money_flux/check_access';

// Index analysis specific routes
window.route_index_analysis_expiry = '/index_analysis/get_running_expiry';
window.route_index_analysis_live_oi = '/index_analysis/live_oi';
window.route_index_analysis_analysis = '/index_analysis/index_analysis';

// Public routes
window.route_public_nifty50 = '/public/nifty50';

// Helper function to build API URLs consistently
window.buildApiUrl = function(endpoint, params = {}) {
  const url = new URL(window.API_BASE + endpoint);
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null) {
      url.searchParams.append(key, params[key]);
    }
  });
  return url.toString();
};

// Helper function for legacy jQuery ajax calls
window.legacyAjaxCall = function(endpoint, data = null, method = 'GET', callback = null) {
  if (window.feedbackDisabled && typeof endpoint === 'string' && endpoint.includes('feedback')) {
    console.warn('Feedback module is removed. Ignoring call to:', endpoint)
    return $.Deferred().reject('Feedback module removed').promise();
  }
  const options = {
    url: window.API_BASE + endpoint,
    method: method,
    xhrFields: {
      withCredentials: true
    },
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
  if (data) {
    options.data = JSON.stringify(data);
  }
  
  if (callback) {
    options.success = callback;
  }
  
  return $.ajax(options);
};
