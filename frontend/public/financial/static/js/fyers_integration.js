// Fyers API Integration JavaScript
class FyersManager {
    constructor() {
        this.apiBaseUrl = '/api/fyers';
        this.isAuthenticated = false;
        this.rateLimitInfo = {
            requestsMade: 0,
            requestsRemaining: 60,
            resetTime: null
        };
        this.refreshInterval = null;
        
        this.init();
    }

    // Initialize Fyers manager
    init() {
        this.checkAuthStatus();
        this.checkRateLimit();
        this.setupEventListeners();
        this.startRateLimitMonitoring();
    }

    // Setup event listeners
    setupEventListeners() {
        // Fyers authentication button
        $(document).on('click', '.fyers-auth-btn', () => {
            this.authenticate();
        });

        // Refresh token button
        $(document).on('click', '.fyers-refresh-btn', () => {
            this.refreshToken();
        });

        // Sync prices button
        $(document).on('click', '.fyers-sync-btn', () => {
            this.syncPrices();
        });

        // Get quotes button
        $(document).on('click', '.fyers-quotes-btn', (e) => {
            const symbols = $(e.target).data('symbols');
            this.getQuotes(symbols);
        });

        // Chart redirect events (using existing pattern)
        $(document).on('click', '[data-exchange][data-symbol]', (e) => {
            const exchange = $(e.target).data('exchange');
            const symbol = $(e.target).data('symbol');
            this.openChart(exchange, symbol);
        });
    }

    // Check authentication status
    async checkAuthStatus() {
        try {
            const response = await this.makeApiCall('/auth/status', 'GET');
            
            if (response.success) {
                this.isAuthenticated = response.authenticated;
                this.updateAuthUI(response);
            }
        } catch (error) {
            console.error('Auth status check failed:', error);
            this.isAuthenticated = false;
            this.updateAuthUI({ authenticated: false });
        }
    }

    // Update authentication UI
    updateAuthUI(authInfo) {
        const statusIndicator = $('.fyers-auth-status');
        const authButton = $('.fyers-auth-btn');
        const syncButton = $('.fyers-sync-btn');
        
        if (authInfo.authenticated) {
            statusIndicator.removeClass('status-error').addClass('status-success')
                          .text('Connected to Fyers');
            authButton.text('Reconnect Fyers').removeClass('btn-primary').addClass('btn-secondary');
            syncButton.prop('disabled', false);
            
            if (authInfo.expires_at) {
                const expiryTime = new Date(authInfo.expires_at).toLocaleString();
                statusIndicator.attr('title', `Token expires: ${expiryTime}`);
            }
        } else {
            statusIndicator.removeClass('status-success').addClass('status-error')
                          .text('Not connected to Fyers');
            authButton.text('Connect to Fyers').removeClass('btn-secondary').addClass('btn-primary');
            syncButton.prop('disabled', true);
        }
    }

    // Authenticate with Fyers
    async authenticate() {
        try {
            const response = await this.makeApiCall('/auth/login', 'GET');
            
            if (response.success && response.auth_url) {
                // Open Fyers auth URL in new window
                const authWindow = window.open(
                    response.auth_url, 
                    'fyersAuth', 
                    'width=600,height=700,scrollbars=yes,resizable=yes'
                );
                
                this.showNotification('Opening Fyers authentication...', 'info');
                
                // Monitor auth window
                this.monitorAuthWindow(authWindow);
            } else {
                this.showNotification('Failed to initiate Fyers authentication', 'error');
            }
        } catch (error) {
            console.error('Authentication failed:', error);
            this.showNotification('Authentication request failed', 'error');
        }
    }

    // Monitor authentication window
    monitorAuthWindow(authWindow) {
        const checkClosed = setInterval(() => {
            if (authWindow.closed) {
                clearInterval(checkClosed);
                
                // Check auth status after window closes
                setTimeout(() => {
                    this.checkAuthStatus();
                }, 2000);
            }
        }, 1000);
        
        // Timeout after 5 minutes
        setTimeout(() => {
            if (!authWindow.closed) {
                authWindow.close();
                clearInterval(checkClosed);
                this.showNotification('Authentication timeout', 'warning');
            }
        }, 300000);
    }

    // Refresh authentication token
    async refreshToken() {
        try {
            const response = await this.makeApiCall('/auth/refresh', 'POST');
            
            if (response.success) {
                this.showNotification('Token refreshed successfully', 'success');
                this.checkAuthStatus();
            } else {
                this.showNotification(response.message || 'Token refresh failed', 'error');
                this.isAuthenticated = false;
                this.updateAuthUI({ authenticated: false });
            }
        } catch (error) {
            console.error('Token refresh failed:', error);
            this.showNotification('Token refresh failed', 'error');
        }
    }

    // Get stock quotes
    async getQuotes(symbols) {
        if (!this.isAuthenticated) {
            this.showNotification('Please authenticate with Fyers first', 'error');
            return null;
        }

        if (!this.checkRateLimit()) {
            this.showNotification('Rate limit exceeded. Please wait.', 'warning');
            return null;
        }

        try {
            // Convert symbols to Fyers format if needed
            const fyersSymbols = this.formatSymbolsForFyers(symbols);
            
            const response = await this.makeApiCall(`/quotes?symbols=${encodeURIComponent(fyersSymbols)}`, 'GET');
            
            if (response.success) {
                this.updateRateLimit();
                return response.data;
            } else {
                this.showNotification('Failed to fetch quotes', 'error');
                return null;
            }
        } catch (error) {
            console.error('Quotes fetch failed:', error);
            this.showNotification('Quotes request failed', 'error');
            return null;
        }
    }

    // Format symbols for Fyers API
    formatSymbolsForFyers(symbols) {
        if (typeof symbols === 'string') {
            symbols = symbols.split(',');
        }
        
        return symbols.map(symbol => {
            const cleanSymbol = symbol.trim().toUpperCase();
            // Add NSE prefix if not present
            if (!cleanSymbol.includes(':')) {
                return `NSE:${cleanSymbol}-EQ`;
            }
            return cleanSymbol;
        }).join(',');
    }

    // Open chart in Fyers
    openChart(exchange, symbol) {
        try {
            // Build Fyers chart URL
            const chartUrl = this.buildChartUrl(exchange, symbol);
            
            // Open in new tab
            window.open(chartUrl, '_blank', 'noopener,noreferrer');
            
            this.showNotification(`Opening Fyers chart for ${symbol}`, 'success');
        } catch (error) {
            console.error('Chart opening failed:', error);
            this.showNotification('Failed to open chart', 'error');
        }
    }

    // Build chart URL
    buildChartUrl(exchange, symbol) {
        const cleanExchange = (exchange || 'NSE').toUpperCase();
        const cleanSymbol = symbol.replace(/[-_]/g, '').toUpperCase();
        
        return `https://trade.fyers.in/charts/${cleanExchange}:${cleanSymbol}`;
    }

    // Get chart URL via API
    async getChartUrl(symbol, exchange = 'NSE') {
        try {
            const response = await this.makeApiCall(`/chart-url/${symbol}?exchange=${exchange}`, 'GET');
            
            if (response.success) {
                return response.data.chart_url;
            }
            return null;
        } catch (error) {
            console.error('Chart URL fetch failed:', error);
            return null;
        }
    }

    // Sync prices with Fyers
    async syncPrices(watchlistId = null) {
        if (!this.isAuthenticated) {
            this.showNotification('Please authenticate with Fyers first', 'error');
            return false;
        }

        try {
            this.showNotification('Starting price sync...', 'info');
            
            const requestData = watchlistId ? { watchlist_id: watchlistId } : {};
            
            const response = await this.makeApiCall('/sync-watchlist-prices', 'POST', requestData);
            
            if (response.success) {
                this.showNotification('Price sync started', 'success');
                return true;
            } else {
                this.showNotification('Failed to start price sync', 'error');
                return false;
            }
        } catch (error) {
            console.error('Price sync failed:', error);
            this.showNotification('Price sync request failed', 'error');
            return false;
        }
    }

    // Get market status
    async getMarketStatus() {
        if (!this.checkRateLimit()) {
            return null;
        }

        try {
            const response = await this.makeApiCall('/market-status', 'GET');
            
            if (response.success) {
                this.updateRateLimit();
                return response.data;
            }
            return null;
        } catch (error) {
            console.error('Market status fetch failed:', error);
            return null;
        }
    }

    // Get user profile
    async getProfile() {
        if (!this.isAuthenticated || !this.checkRateLimit()) {
            return null;
        }

        try {
            const response = await this.makeApiCall('/profile', 'GET');
            
            if (response.success) {
                this.updateRateLimit();
                return response.data;
            }
            return null;
        } catch (error) {
            console.error('Profile fetch failed:', error);
            return null;
        }
    }

    // Check rate limit
    checkRateLimit() {
        return this.rateLimitInfo.requestsRemaining > 0;
    }

    // Update rate limit info
    updateRateLimit() {
        this.rateLimitInfo.requestsMade++;
        this.rateLimitInfo.requestsRemaining = Math.max(0, this.rateLimitInfo.requestsRemaining - 1);
        
        // Update UI
        this.updateRateLimitUI();
    }

    // Get rate limit status from server
    async checkRateLimitStatus() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/rate-limit-status`);
            const data = await response.json();
            
            if (data.success) {
                this.rateLimitInfo = {
                    requestsMade: data.data.requests_made,
                    requestsRemaining: data.data.requests_remaining,
                    resetTime: new Date(data.data.reset_time * 1000)
                };
                
                this.updateRateLimitUI();
                return data.data;
            }
        } catch (error) {
            console.error('Rate limit check failed:', error);
        }
        return null;
    }

    // Update rate limit UI
    updateRateLimitUI() {
        const rateLimitIndicator = $('.fyers-rate-limit');
        const progressBar = $('.fyers-rate-progress');
        
        if (rateLimitIndicator.length) {
            const percentage = (this.rateLimitInfo.requestsRemaining / 60) * 100;
            
            rateLimitIndicator.text(`${this.rateLimitInfo.requestsRemaining}/60 requests remaining`);
            
            if (progressBar.length) {
                progressBar.css('width', `${percentage}%`);
                
                if (percentage < 20) {
                    progressBar.removeClass('bg-success bg-warning').addClass('bg-danger');
                } else if (percentage < 50) {
                    progressBar.removeClass('bg-success bg-danger').addClass('bg-warning');
                } else {
                    progressBar.removeClass('bg-warning bg-danger').addClass('bg-success');
                }
            }
        }
    }

    // Start rate limit monitoring
    startRateLimitMonitoring() {
        // Check rate limit every 30 seconds
        this.refreshInterval = setInterval(() => {
            this.checkRateLimitStatus();
        }, 30000);
    }

    // Stop rate limit monitoring
    stopRateLimitMonitoring() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }

    // Make API call with error handling
    async makeApiCall(endpoint, method = 'GET', data = null) {
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (data && (method === 'POST' || method === 'PUT')) {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(`${this.apiBaseUrl}${endpoint}`, options);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    }

    // Show notification
    showNotification(message, type = 'info') {
        // Try to use existing notification system
        if (typeof showNotification === 'function') {
            showNotification(message, type);
        } else if (window.watchlistManager && typeof window.watchlistManager.showNotification === 'function') {
            window.watchlistManager.showNotification(message, type);
        } else {
            // Fallback to console and alert
            console.log(`${type.toUpperCase()}: ${message}`);
            
            if (type === 'error') {
                alert(`Error: ${message}`);
            }
        }
    }

    // Bulk update quotes for watchlist
    async updateWatchlistQuotes(symbols) {
        if (!symbols || symbols.length === 0) {
            return {};
        }

        const quotes = await this.getQuotes(symbols);
        
        if (quotes) {
            // Dispatch event with updated quotes
            document.dispatchEvent(new CustomEvent('fyersQuotesUpdated', {
                detail: { quotes: quotes }
            }));
            
            return quotes;
        }
        
        return {};
    }

    // Get holdings
    async getHoldings() {
        if (!this.isAuthenticated || !this.checkRateLimit()) {
            return null;
        }

        try {
            const response = await this.makeApiCall('/holdings', 'GET');
            
            if (response.success) {
                this.updateRateLimit();
                return response.data;
            }
            return null;
        } catch (error) {
            console.error('Holdings fetch failed:', error);
            return null;
        }
    }

    // Get positions
    async getPositions() {
        if (!this.isAuthenticated || !this.checkRateLimit()) {
            return null;
        }

        try {
            const response = await this.makeApiCall('/positions', 'GET');
            
            if (response.success) {
                this.updateRateLimit();
                return response.data;
            }
            return null;
        } catch (error) {
            console.error('Positions fetch failed:', error);
            return null;
        }
    }

    // Cleanup method
    cleanup() {
        this.stopRateLimitMonitoring();
    }
}

// Rate Limiter class for client-side rate limiting
class RateLimiter {
    constructor(maxRequests = 60, windowMs = 60000) {
        this.maxRequests = maxRequests;
        this.windowMs = windowMs;
        this.requests = [];
    }

    // Check if request is allowed
    isAllowed() {
        const now = Date.now();
        
        // Remove old requests outside the window
        this.requests = this.requests.filter(time => now - time < this.windowMs);
        
        // Check if we're under the limit
        if (this.requests.length < this.maxRequests) {
            this.requests.push(now);
            return true;
        }
        
        return false;
    }

    // Get remaining requests
    getRemaining() {
        const now = Date.now();
        this.requests = this.requests.filter(time => now - time < this.windowMs);
        return Math.max(0, this.maxRequests - this.requests.length);
    }

    // Get time until reset
    getResetTime() {
        if (this.requests.length === 0) {
            return 0;
        }
        
        const oldestRequest = Math.min(...this.requests);
        const resetTime = oldestRequest + this.windowMs;
        return Math.max(0, resetTime - Date.now());
    }

    // Reset rate limiter
    reset() {
        this.requests = [];
    }
}

// Global variables
let fyersManager;
let fyersRateLimiter;

// Initialize Fyers manager
function initializeFyersManager() {
    fyersManager = new FyersManager();
    fyersRateLimiter = new RateLimiter(60, 60000); // 60 requests per minute
    
    // Add to window for global access
    window.fyersManager = fyersManager;
    window.fyersRateLimiter = fyersRateLimiter;
}

// Helper functions for easy integration
function connectToFyers() {
    if (fyersManager) {
        fyersManager.authenticate();
    }
}

function getFyersQuotes(symbols) {
    if (fyersManager) {
        return fyersManager.getQuotes(symbols);
    }
    return null;
}

function openFyersChart(exchange, symbol) {
    if (fyersManager) {
        fyersManager.openChart(exchange, symbol);
    }
}

function syncFyersPrices(watchlistId) {
    if (fyersManager) {
        return fyersManager.syncPrices(watchlistId);
    }
    return false;
}

// Auto-initialize when DOM is ready
$(document).ready(function() {
    initializeFyersManager();
    
    // Clean up on page unload
    $(window).on('beforeunload', function() {
        if (fyersManager) {
            fyersManager.cleanup();
        }
    });
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { FyersManager, RateLimiter };
}