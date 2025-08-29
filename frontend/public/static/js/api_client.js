// Simple API client using cookie-based auth (HTTP-only cookies)
// Ensure your backend CORS allows your origin and credentials=true

// Use the same API_BASE as defined in api_shim.js and config.js
const API_BASE = window.APP_API_BASE || '/api';

async function apiFetch(path, { method = 'GET', headers = {}, body, retry = true } = {}) {
  const init = {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    credentials: 'include', // send cookies
  };
  if (body !== undefined) init.body = typeof body === 'string' ? body : JSON.stringify(body);

  try {
    const res = await fetch(`${API_BASE}${path}`, init);
    
    if (res.status === 401 && retry) {
      // try refresh once
      const r = await fetch(`${API_BASE}/auth/refresh`, { method: 'POST', credentials: 'include' });
      if (r.ok) {
        return apiFetch(path, { method, headers, body, retry: false });
      }
    }
    
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`HTTP ${res.status}: ${text}`);
    }
    
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) return res.json();
    return res.text();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// Auth
export async function login(email, password) {
  return apiFetch('/auth/login', { method: 'POST', body: { email, password } });
}
export async function logout() {
  return apiFetch('/auth/logout', { method: 'POST' });
}

// Stocks proxy helpers
export async function getServerTime() {
  return apiFetch('/current?type=servertime');
}
export async function getStudyData(name) {
  const p = new URLSearchParams({ name });
  return apiFetch(`/study-data?${p.toString()}`);
}
export async function getStudySymbol(name, count = 5) {
  const p = new URLSearchParams({ name, count });
  return apiFetch(`/study-symbol?${p.toString()}`);
}
export async function getAdvDec(index) {
  return apiFetch(`/adv-dec/${encodeURIComponent(index)}`);
}

// F&O endpoints
export async function fnoGetRunningExpiry(data) {
  return apiFetch('/fno/get_running_expiry', { method: 'POST', body: data });
}
export async function fnoLiveOi(data) {
  return apiFetch('/fno/live_oi', { method: 'POST', body: data });
}
export async function fnoIndexAnalysis(data) {
  return apiFetch('/fno/index_analysis', { method: 'POST', body: data });
}
export async function fnoHeatmap() {
  return apiFetch('/fno/heatmap');
}

// Scanner endpoints
export async function fetchHdDataFno(data) {
  return apiFetch('/fetch_hd_data_fno', { method: 'POST', body: data });
}
export async function fetchHdDataN500(data) {
  return apiFetch('/fetch_hd_data_n500', { method: 'POST', body: data });
}
export async function fetchDspDataFno(data) {
  return apiFetch('/fetch_dsp_data_fno', { method: 'POST', body: data });
}
export async function fetchDspDataN500(data) {
  return apiFetch('/fetch_dsp_data_n500', { method: 'POST', body: data });
}
export async function fetchHdHist(data) {
  return apiFetch('/hd_hist', { method: 'POST', body: data });
}

// Money Flux endpoints
export async function moneyFluxGetExpiry(data) {
  return apiFetch('/money_flux/get_running_expiry', { method: 'POST', body: data });
}
export async function moneyFluxChart(data) {
  return apiFetch('/money_flux/chart', { method: 'POST', body: data });
}
export async function moneyFluxCheckAccess() {
  return apiFetch('/money_flux/check_access');
}

// Index Analysis endpoints
export async function indexAnalysisGetExpiry(data) {
  return apiFetch('/index_analysis/get_running_expiry', { method: 'POST', body: data });
}
export async function indexAnalysisLiveOi(data) {
  return apiFetch('/index_analysis/live_oi', { method: 'POST', body: data });
}
export async function indexAnalysisAnalysis(data) {
  return apiFetch('/index_analysis/index_analysis', { method: 'POST', body: data });
}

// Contact endpoints
export async function submitContact(data) {
  return apiFetch('/contact', { method: 'POST', body: data });
}

// Public endpoints
export async function getNifty50() {
  return apiFetch('/public/nifty50');
}

// Admin
export async function adminGetUsers() {
  return apiFetch('/admin/get_tredcode_users', { method: 'POST' });
}
export async function adminUpsertUser(email, role, access) {
  return apiFetch('/admin/insert_replace_user', { method: 'POST', body: { email, role, access } });
}
export async function adminDeleteUser(email) {
  return apiFetch('/admin/delete_user', { method: 'POST', body: { email } });
}
export async function adminGetSignal() {
  return apiFetch('/admin/get_signal', { method: 'POST' });
}
export async function adminDeleteSignal(timestamp) {
  return apiFetch('/admin/delete_signal', { method: 'POST', body: { timestamp } });
}
export async function clientGetSignalChat() {
  return apiFetch('/admin/get_signal_chat', { method: 'POST' });
}
export async function clientUnsetSignalSelf() {
  return apiFetch('/admin/unset_signal_self', { method: 'POST' });
}
export async function clientCheckSignal() {
  return apiFetch('/admin/check_signal', { method: 'POST' });
}

// File upload example (admin insert_signal)
export async function adminInsertSignal(text, file) {
  const form = new FormData();
  form.append('text', text);
  if (file) form.append('file', file);
  
  try {
    const res = await fetch(`${API_BASE}/admin/insert_signal`, {
      method: 'POST',
      body: form,
      credentials: 'include',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch (error) {
    console.error('File upload failed:', error);
    throw error;
  }
}

// FYERS helpers removed (migration to Dhan-only setup)

// Legacy compatibility functions for existing code
export function legacyApiCall(endpoint, data = null, method = 'GET') {
  const options = { method };
  if (data) {
    options.body = JSON.stringify(data);
    options.headers = { 'Content-Type': 'application/json' };
  }
  return apiFetch(endpoint, options);
}

// Example: replace direct calls in your pages
// getStudyData('NIFTY 50').then(console.log).catch(console.error);
