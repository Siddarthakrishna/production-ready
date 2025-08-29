// API service for financial data

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8001/api';

// Helper function for making API requests
async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      // Add authorization header if user is logged in
      ...((localStorage.getItem('token')) && {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      })
    }
  };

  const response = await fetch(url, {
    ...defaultOptions,
    ...options
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: 'An error occurred while fetching data'
    }));
    throw new Error(error.message || 'An error occurred while fetching data');
  }

  return response.json();
}

// Market data endpoints
export const marketAPI = {
  // Get market overview data (NIFTY, SENSEX, etc.)
  getMarketOverview: () => fetchAPI('/financial/market/overview'),
  
  // Get FII/DII data
  getFIIDIIData: (period = 'daily') => fetchAPI(`/financial/market/fii-dii?period=${period}`),
  
  // Get sectorial performance
  getSectorialFlow: () => fetchAPI('/financial/market/sectorial-flow'),
  
  // Get F&O data
  getFnOData: (symbol = 'NIFTY') => fetchAPI(`/financial/market/fno?symbol=${symbol}`),
  
  // Get market depth
  getMarketDepth: (symbol) => fetchAPI(`/financial/market/depth?symbol=${symbol}`),
  
  // Get money flux data
  getMoneyFlux: () => fetchAPI('/financial/market/money-flux'),
};

// User related endpoints
export const userAPI = {
  // Get user profile
  getProfile: () => fetchAPI('/user/profile'),
  
  // Get user watchlist
  getWatchlist: () => fetchAPI('/user/watchlist'),
  
  // Add symbol to watchlist
  addToWatchlist: (symbol) => fetchAPI('/user/watchlist', {
    method: 'POST',
    body: JSON.stringify({ symbol })
  }),
  
  // Remove symbol from watchlist
  removeFromWatchlist: (symbol) => fetchAPI(`/user/watchlist/${symbol}`, {
    method: 'DELETE'
  })
};

export default {
  market: marketAPI,
  user: userAPI
};