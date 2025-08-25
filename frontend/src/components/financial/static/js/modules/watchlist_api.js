// Watchlist API Module
// This module handles all API interactions for the watchlist functionality

class WatchlistAPI {
    constructor(apiBaseUrl = '/api/watchlist') {
        this.apiBaseUrl = apiBaseUrl;
        this.userId = this.getUserId();
    }

    // Get user ID (from localStorage, session, or default)
    getUserId() {
        return localStorage.getItem('userId') || 1;
    }

    // API call wrapper
    async apiCall(endpoint, options = {}) {
        try {
            const defaultOptions = {
                headers: {
                    'Content-Type': 'application/json',
                    'user-id': this.userId
                }
            };
            
            const response = await fetch(`${this.apiBaseUrl}${endpoint}`, {
                ...defaultOptions,
                ...options,
                headers: { ...defaultOptions.headers, ...options.headers }
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'API call failed');
            }
            
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Load all watchlists
    async loadWatchlists() {
        return await this.apiCall('/watchlists');
    }

    // Load specific watchlist details
    async loadWatchlistDetails(watchlistId) {
        return await this.apiCall(`/watchlists/${watchlistId}`);
    }

    // Create new watchlist
    async createWatchlist(formData) {
        return await this.apiCall('/watchlists', {
            method: 'POST',
            body: JSON.stringify(formData)
        });
    }

    // Add stock to watchlist
    async addStockToWatchlist(watchlistId, formData) {
        return await this.apiCall(`/watchlists/${watchlistId}/stocks`, {
            method: 'POST',
            body: JSON.stringify(formData)
        });
    }

    // Update stock
    async updateStock(stockId, formData) {
        return await this.apiCall(`/stocks/${stockId}`, {
            method: 'PUT',
            body: JSON.stringify(formData)
        });
    }

    // Remove stock
    async removeStock(stockId) {
        return await this.apiCall(`/stocks/${stockId}`, {
            method: 'DELETE'
        });
    }

    // Search for stocks
    async searchStocks(query) {
        return await this.apiCall(`/stocks/search?query=${encodeURIComponent(query)}`);
    }

    // Sync with Fyers
    async syncWithFyers(watchlistId) {
        return await this.apiCall(`/fyers/sync-watchlist-prices`, {
            method: 'POST',
            body: JSON.stringify({ watchlist_id: watchlistId })
        });
    }

    // Get Fyers quotes
    async getFyersQuotes(symbols) {
        const symbolString = Array.isArray(symbols) ? symbols.join(',') : symbols;
        return await this.apiCall(`/fyers/quotes?symbols=${encodeURIComponent(symbolString)}`);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WatchlistAPI;
} else if (typeof window !== 'undefined') {
    window.WatchlistAPI = WatchlistAPI;
}