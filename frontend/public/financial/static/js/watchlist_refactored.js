// Refactored Watchlist JavaScript Functionality
// This version uses modular components for better organization and maintainability

// Import required modules
// Note: In a real implementation, we would use ES6 imports or a module bundler
// For now, we assume the modules are loaded globally

class WatchlistManager {
    constructor() {
        // Initialize API module
        this.api = new WatchlistAPI();
        
        // Initialize UI module
        this.ui = new WatchlistUI();
        
        this.currentWatchlistId = null;
        this.watchlists = [];
        this.refreshInterval = null;
        
        this.init();
    }

    // Initialize the watchlist application
    init() {
        this.loadWatchlists();
        this.setupEventListeners();
        this.startAutoRefresh();
        this.initializeFyersIntegration();
    }
    
    // Initialize Fyers integration
    initializeFyersIntegration() {
        // Wait for Fyers manager to be available
        if (window.fyersManager) {
            this.setupFyersEventListeners();
        } else {
            // Retry after a short delay
            setTimeout(() => {
                this.initializeFyersIntegration();
            }, 1000);
        }
    }
    
    // Setup Fyers-specific event listeners
    setupFyersEventListeners() {
        // Listen for Fyers quotes updates
        document.addEventListener('fyersQuotesUpdated', (event) => {
            const quotes = event.detail.quotes;
            this.updatePricesInUI(quotes);
        });
        
        // Auto-sync with Fyers every 5 minutes
        setInterval(() => {
            if (window.fyersManager && window.fyersManager.isAuthenticated) {
                this.updateStockPricesFromFyers();
            }
        }, 300000); // 5 minutes
    }

    // Setup event listeners
    setupEventListeners() {
        // Stock symbol search
        const stockSymbolInput = document.getElementById('stockSymbol');
        if (stockSymbolInput) {
            stockSymbolInput.addEventListener('input', this.handleStockSearch.bind(this));
        }
        
        // Form submissions
        const addStockForm = document.getElementById('addStockForm');
        if (addStockForm) {
            addStockForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addStockToWatchlist();
            });
        }
        
        const createWatchlistForm = document.getElementById('createWatchlistForm');
        if (createWatchlistForm) {
            createWatchlistForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.createWatchlist();
            });
        }
        
        // Modal events
        const addStockModal = document.getElementById('addStockModal');
        if (addStockModal) {
            addStockModal.addEventListener('show.bs.modal', this.populateWatchlistSelect.bind(this));
            addStockModal.addEventListener('hidden.bs.modal', this.ui.clearAddStockForm.bind(this.ui));
        }
        
        const createWatchlistModal = document.getElementById('createWatchlistModal');
        if (createWatchlistModal) {
            createWatchlistModal.addEventListener('hidden.bs.modal', this.ui.clearCreateWatchlistForm.bind(this.ui));
        }
        
        // Action button events
        document.addEventListener('click', (e) => {
            // Handle chart button clicks
            if (e.target.closest('.btn-chart')) {
                const button = e.target.closest('.btn-chart');
                const symbol = button.dataset.symbol;
                const exchange = button.dataset.exchange || 'NSE';
                this.openFyersChart(exchange, symbol);
            }
            
            // Handle AI button clicks
            if (e.target.closest('.btn-ai')) {
                const button = e.target.closest('.btn-ai');
                const symbol = button.dataset.symbol;
                const currentPrice = button.dataset.price;
                const priceChangePercent = button.dataset.change;
                this.generateAIInsights(symbol, currentPrice, priceChangePercent);
            }
            
            // Handle edit button clicks
            if (e.target.closest('.btn-edit')) {
                const button = e.target.closest('.btn-edit');
                const stockId = button.dataset.stockId;
                this.editStock(stockId);
            }
            
            // Handle delete button clicks
            if (e.target.closest('.btn-delete')) {
                const button = e.target.closest('.btn-delete');
                const stockId = button.dataset.stockId;
                this.removeStock(stockId);
            }
        });
    }

    // Load all watchlists
    async loadWatchlists() {
        try {
            const response = await this.api.loadWatchlists();
            this.watchlists = response.data;
            this.ui.renderWatchlistTabs(this.watchlists, this.loadWatchlistDetails.bind(this));
            
            // Load default or first watchlist
            if (this.watchlists.length > 0) {
                const defaultWatchlist = this.watchlists.find(w => w.is_default) || this.watchlists[0];
                this.loadWatchlistDetails(defaultWatchlist.id);
            } else {
                this.ui.showEmptyState();
            }
            
            // Update portfolio stats
            const totalStocks = this.watchlists.reduce((sum, w) => sum + (w.stocks ? w.stocks.length : 0), 0);
            const totalAlerts = this.watchlists.reduce((sum, w) => sum + (w.stocks ? w.stocks.filter(s => s.is_alert_enabled).length : 0), 0);
            this.ui.updatePortfolioStats(this.watchlists.length, totalStocks, totalAlerts);
            
        } catch (error) {
            console.error('Failed to load watchlists:', error);
            this.ui.showNotification('Failed to load watchlists', 'error');
        }
    }

    // Load specific watchlist details
    async loadWatchlistDetails(watchlistId) {
        try {
            this.currentWatchlistId = watchlistId;
            
            // Reset pagination when switching watchlists
            this.ui.currentPage = 1;
            
            const response = await this.api.loadWatchlistDetails(watchlistId);
            const watchlist = response.data;
            
            // Update the watchlist in our local array
            const watchlistIndex = this.watchlists.findIndex(w => w.id === watchlistId);
            if (watchlistIndex !== -1) {
                this.watchlists[watchlistIndex] = watchlist;
            }
            
            this.ui.renderWatchlistTable(watchlist, this.openFyersChart.bind(this), this.generateAIInsights.bind(this));
        } catch (error) {
            console.error('Failed to load watchlist details:', error);
            this.ui.showNotification('Failed to load watchlist details', 'error');
        }
    }

    // Handle stock search
    async handleStockSearch(event) {
        const query = event.target.value.trim();
        const suggestionsContainer = document.getElementById('stockSuggestions');
        
        if (!suggestionsContainer) return;
        
        if (query.length < 2) {
            suggestionsContainer.innerHTML = '';
            suggestionsContainer.style.display = 'none';
            return;
        }
        
        try {
            const response = await this.api.searchStocks(query);
            const stocks = response.data;
            
            if (stocks.length === 0) {
                suggestionsContainer.innerHTML = '';
                suggestionsContainer.style.display = 'none';
                return;
            }
            
            let suggestionsHtml = '';
            stocks.forEach(stock => {
                suggestionsHtml += `
                    <a href="#" class="list-group-item list-group-item-action" 
                       onclick="watchlistManager.selectStock('${stock.symbol}', '${stock.company_name}', '${stock.sector}')">
                        <div class="d-flex justify-content-between">
                            <strong>${stock.symbol}</strong>
                            <span class="text-muted">${stock.exchange || ''}</span>
                        </div>
                        <small>${stock.company_name} - ${stock.sector}</small>
                    </a>
                `;
            });
            
            suggestionsContainer.innerHTML = suggestionsHtml;
            suggestionsContainer.style.display = 'block';
        } catch (error) {
            console.error('Stock search failed:', error);
        }
    }

    // Select stock from suggestions
    selectStock(symbol, companyName, sector) {
        const stockSymbolInput = document.getElementById('stockSymbol');
        const suggestionsContainer = document.getElementById('stockSuggestions');
        
        if (stockSymbolInput) {
            stockSymbolInput.value = symbol;
        }
        
        if (suggestionsContainer) {
            suggestionsContainer.innerHTML = '';
            suggestionsContainer.style.display = 'none';
        }
    }

    // Populate watchlist select options
    populateWatchlistSelect() {
        this.ui.populateWatchlistSelect(this.watchlists, this.currentWatchlistId);
    }

    // Add stock to watchlist
    async addStockToWatchlist() {
        try {
            const stockSymbolInput = document.getElementById('stockSymbol');
            const targetPriceInput = document.getElementById('targetPrice');
            const alertPriceInput = document.getElementById('alertPrice');
            const stockNotesInput = document.getElementById('stockNotes');
            const watchlistSelect = document.getElementById('watchlistSelect');
            
            const formData = {
                symbol: stockSymbolInput ? stockSymbolInput.value.trim().toUpperCase() : '',
                target_price: targetPriceInput && targetPriceInput.value ? parseFloat(targetPriceInput.value) : null,
                alert_price: alertPriceInput && alertPriceInput.value ? parseFloat(alertPriceInput.value) : null,
                notes: stockNotesInput ? stockNotesInput.value.trim() : ''
            };
            
            const watchlistId = watchlistSelect ? watchlistSelect.value : null;
            
            if (!formData.symbol || !watchlistId) {
                this.ui.showNotification('Please enter symbol and select watchlist', 'error');
                return;
            }
            
            await this.api.addStockToWatchlist(watchlistId, formData);
            
            this.ui.showNotification('Stock added successfully', 'success');
            
            // Hide modal
            const addStockModal = document.getElementById('addStockModal');
            if (addStockModal) {
                const modal = bootstrap.Modal.getInstance(addStockModal);
                if (modal) modal.hide();
            }
            
            this.loadWatchlists(); // Refresh data
        } catch (error) {
            console.error('Failed to add stock:', error);
            this.ui.showNotification('Failed to add stock', 'error');
        }
    }

    // Create new watchlist
    async createWatchlist() {
        try {
            const watchlistNameInput = document.getElementById('watchlistName');
            const watchlistDescriptionInput = document.getElementById('watchlistDescription');
            const isDefaultCheckbox = document.getElementById('isDefault');
            
            const formData = {
                name: watchlistNameInput ? watchlistNameInput.value.trim() : '',
                description: watchlistDescriptionInput ? watchlistDescriptionInput.value.trim() : '',
                is_default: isDefaultCheckbox ? isDefaultCheckbox.checked : false
            };
            
            if (!formData.name) {
                this.ui.showNotification('Please enter watchlist name', 'error');
                return;
            }
            
            await this.api.createWatchlist(formData);
            
            this.ui.showNotification('Watchlist created successfully', 'success');
            
            // Hide modal
            const createWatchlistModal = document.getElementById('createWatchlistModal');
            if (createWatchlistModal) {
                const modal = bootstrap.Modal.getInstance(createWatchlistModal);
                if (modal) modal.hide();
            }
            
            this.loadWatchlists(); // Refresh data
        } catch (error) {
            console.error('Failed to create watchlist:', error);
            this.ui.showNotification('Failed to create watchlist', 'error');
        }
    }

    // Edit stock
    editStock(stockId) {
        // Find the stock data
        const stock = this.findStockById(stockId);
        if (!stock) return;
        
        // Populate edit form
        const editStockIdInput = document.getElementById('editStockId');
        const editTargetPriceInput = document.getElementById('editTargetPrice');
        const editAlertPriceInput = document.getElementById('editAlertPrice');
        const editStockNotesInput = document.getElementById('editStockNotes');
        const editAlertEnabledCheckbox = document.getElementById('editAlertEnabled');
        
        if (editStockIdInput) editStockIdInput.value = stockId;
        if (editTargetPriceInput) editTargetPriceInput.value = stock.target_price || '';
        if (editAlertPriceInput) editAlertPriceInput.value = stock.alert_price || '';
        if (editStockNotesInput) editStockNotesInput.value = stock.notes || '';
        if (editAlertEnabledCheckbox) editAlertEnabledCheckbox.checked = stock.is_alert_enabled;
        
        // Show modal
        const editStockModal = document.getElementById('editStockModal');
        if (editStockModal) {
            const modal = new bootstrap.Modal(editStockModal);
            modal.show();
        }
    }

    // Update stock
    async updateStock() {
        try {
            const editStockIdInput = document.getElementById('editStockId');
            const editTargetPriceInput = document.getElementById('editTargetPrice');
            const editAlertPriceInput = document.getElementById('editAlertPrice');
            const editStockNotesInput = document.getElementById('editStockNotes');
            const editAlertEnabledCheckbox = document.getElementById('editAlertEnabled');
            
            const stockId = editStockIdInput ? editStockIdInput.value : null;
            const formData = {
                target_price: editTargetPriceInput && editTargetPriceInput.value ? parseFloat(editTargetPriceInput.value) : null,
                alert_price: editAlertPriceInput && editAlertPriceInput.value ? parseFloat(editAlertPriceInput.value) : null,
                notes: editStockNotesInput ? editStockNotesInput.value.trim() : '',
                is_alert_enabled: editAlertEnabledCheckbox ? editAlertEnabledCheckbox.checked : false
            };
            
            await this.api.updateStock(stockId, formData);
            
            this.ui.showNotification('Stock updated successfully', 'success');
            
            // Hide modal
            const editStockModal = document.getElementById('editStockModal');
            if (editStockModal) {
                const modal = bootstrap.Modal.getInstance(editStockModal);
                if (modal) modal.hide();
            }
            
            this.loadWatchlistDetails(this.currentWatchlistId);
        } catch (error) {
            console.error('Failed to update stock:', error);
            this.ui.showNotification('Failed to update stock', 'error');
        }
    }

    // Remove stock
    async removeStock(stockId) {
        if (!confirm('Are you sure you want to remove this stock from watchlist?')) {
            return;
        }
        
        try {
            await this.api.removeStock(stockId);
            
            this.ui.showNotification('Stock removed successfully', 'success');
            
            // Hide modal
            const editStockModal = document.getElementById('editStockModal');
            if (editStockModal) {
                const modal = bootstrap.Modal.getInstance(editStockModal);
                if (modal) modal.hide();
            }
            
            this.loadWatchlists(); // Refresh data
        } catch (error) {
            console.error('Failed to remove stock:', error);
            this.ui.showNotification('Failed to remove stock', 'error');
        }
    }

    // Find stock by ID
    findStockById(stockId) {
        for (const watchlist of this.watchlists) {
            if (watchlist.stocks) {
                const stock = watchlist.stocks.find(s => s.id == stockId);
                if (stock) return stock;
            }
        }
        return null;
    }

    // Pagination Methods
    
    // Go to specific page
    goToPage(pageNumber) {
        if (pageNumber < 1 || pageNumber > this.ui.totalPages || pageNumber === this.ui.currentPage) {
            return;
        }
        
        this.ui.currentPage = pageNumber;
        
        // Re-render current watchlist with new page
        if (this.currentWatchlistId) {
            const currentWatchlist = this.watchlists.find(w => w.id === this.currentWatchlistId);
            if (currentWatchlist) {
                this.ui.renderWatchlistTable(currentWatchlist, this.openFyersChart.bind(this), this.generateAIInsights.bind(this));
            }
        }
    }
    
    // Change page (prev/next)
    changePage(direction) {
        if (direction === 'prev' && this.ui.currentPage > 1) {
            this.goToPage(this.ui.currentPage - 1);
        } else if (direction === 'next' && this.ui.currentPage < this.ui.totalPages) {
            this.goToPage(this.ui.currentPage + 1);
        }
    }
    
    // Change page size
    changePageSize() {
        const pageSizeSelect = document.getElementById('pageSizeSelect');
        const newPageSize = parseInt(pageSizeSelect ? pageSizeSelect.value : 25);
        if (newPageSize !== this.ui.pageSize) {
            this.ui.pageSize = newPageSize;
            this.ui.currentPage = 1; // Reset to first page
            
            // Recalculate total pages
            if (this.currentWatchlistId) {
                const currentWatchlist = this.watchlists.find(w => w.id === this.currentWatchlistId);
                if (currentWatchlist && currentWatchlist.stocks) {
                    this.ui.totalStocks = currentWatchlist.stocks.length;
                    this.ui.totalPages = Math.max(1, Math.ceil(this.ui.totalStocks / this.ui.pageSize));
                    this.ui.renderWatchlistTable(currentWatchlist, this.openFyersChart.bind(this), this.generateAIInsights.bind(this));
                }
            }
        }
    }

    // Start auto-refresh for prices
    startAutoRefresh() {
        // Refresh every 30 seconds
        this.refreshInterval = setInterval(() => {
            if (this.currentWatchlistId) {
                this.loadWatchlistDetails(this.currentWatchlistId);
            }
        }, 30000);
    }

    // Stop auto-refresh
    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }

    // Open Fyers chart for stock symbol
    openFyersChart(exchange, symbol) {
        try {
            // Use the Fyers manager if available
            if (window.fyersManager) {
                window.fyersManager.openChart(exchange, symbol);
                return;
            }
            
            // Fallback to direct URL opening
            const cleanSymbol = symbol.replace(/[-_]/g, '').toUpperCase();
            const cleanExchange = (exchange || 'NSE').toUpperCase();
            
            // Build Fyers chart URL
            const fyersUrl = `https://trade.fyers.in/charts/${cleanExchange}:${cleanSymbol}`;
            
            // Open in new tab
            window.open(fyersUrl, '_blank', 'noopener,noreferrer');
            
            // Show notification
            this.ui.showNotification(`Opening Fyers chart for ${symbol}`, 'success');
            
        } catch (error) {
            console.error('Failed to open Fyers chart:', error);
            this.ui.showNotification('Failed to open Fyers chart', 'error');
        }
    }

    // Generate AI insights for a stock
    async generateAIInsights(symbol, currentPrice, priceChangePercent) {
        try {
            this.ui.showNotification('Generating AI insights...', 'info');
            
            // For this example, we'll simulate an API call to Ollama
            // In a real implementation, this would call the Ollama analytics module
            setTimeout(() => {
                const insights = `Here are some AI insights for ${symbol}:
                
1. Current price of ₹${currentPrice} shows ${priceChangePercent >= 0 ? 'positive' : 'negative'} momentum
2. Technical indicators suggest ${priceChangePercent >= 2 ? 'strong buying' : priceChangePercent <= -2 ? 'strong selling' : 'neutral'} pressure
3. Volume trends indicate ${Math.abs(priceChangePercent) >= 1 ? 'significant' : 'moderate'} market interest
4. Consider monitoring support levels around ₹${(currentPrice * 0.98).toFixed(2)} and resistance at ₹${(currentPrice * 1.02).toFixed(2)}`;
                
                this.showAIInsightsModal(symbol, insights);
            }, 1000);
            
        } catch (error) {
            console.error('AI insights error:', error);
            this.ui.showNotification('AI service temporarily unavailable', 'error');
        }
    }

    // Show AI insights in a modal
    showAIInsightsModal(symbol, insights) {
        // Remove existing modal if any
        const existingModal = document.getElementById('aiInsightsModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Create new modal
        const modalHtml = `
            <div class="modal fade" id="aiInsightsModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="fa-solid fa-robot"></i> AI Insights for ${symbol}
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="ai-insights-content">
                                ${insights.replace(/\n/g, '<br>')}
                            </div>
                            <div class="mt-3">
                                <small class="text-muted">
                                    <i class="fa-solid fa-info-circle"></i>
                                    AI-generated insights are for informational purposes only. Please do your own research before making investment decisions.
                                </small>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button type="button" class="btn btn-primary" onclick="watchlistManager.generateTradeRationale('${symbol}')">
                                <i class="fa-solid fa-chart-line"></i> Generate Trade Rationale
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add new modal to body
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Show modal
        const aiInsightsModal = document.getElementById('aiInsightsModal');
        if (aiInsightsModal) {
            const modal = new bootstrap.Modal(aiInsightsModal);
            modal.show();
            
            // Clean up modal when hidden
            aiInsightsModal.addEventListener('hidden.bs.modal', function() {
                aiInsightsModal.remove();
            });
        }
    }

    // Generate trade rationale using AI
    async generateTradeRationale(symbol) {
        try {
            // Get current stock data
            const stock = this.findStockBySymbol(symbol);
            if (!stock) {
                this.ui.showNotification('Stock data not found', 'error');
                return;
            }
            
            this.ui.showNotification('Generating trade rationale...', 'info');
            
            // For this example, we'll simulate an API call to Ollama
            // In a real implementation, this would call the Ollama analytics module
            setTimeout(() => {
                const rationale = `Trade Rationale for ${symbol}:
                
Entry Point: ₹${stock.current_price || 'N/A'}
Target Price: ₹${stock.target_price || 'N/A'}
Stop Loss: ₹${(stock.current_price * 0.95).toFixed(2) || 'N/A'}

Strategy:
- Technical outlook suggests ${stock.price_change_percent >= 0 ? 'bullish' : 'bearish'} momentum
- Support levels at ₹${(stock.current_price * 0.97).toFixed(2)} and ₹${(stock.current_price * 0.95).toFixed(2)}
- Resistance levels at ₹${(stock.current_price * 1.03).toFixed(2)} and ₹${(stock.current_price * 1.05).toFixed(2)}
- Recommended position size: 2-3% of portfolio based on risk tolerance

Risk Factors:
- Market volatility may impact short-term price movements
- Monitor volume trends for confirmation of breakouts
- Consider global market sentiment and sector performance`;
                
                // Update the modal content with trade rationale
                const aiInsightsContent = document.querySelector('.ai-insights-content');
                const modalTitle = document.querySelector('.modal-title');
                
                if (aiInsightsContent) {
                    aiInsightsContent.innerHTML = rationale.replace(/\n/g, '<br>');
                }
                
                if (modalTitle) {
                    modalTitle.innerHTML = `<i class="fa-solid fa-chart-line"></i> Trade Rationale for ${symbol}`;
                }
            }, 1000);
            
        } catch (error) {
            console.error('Trade rationale error:', error);
            this.ui.showNotification('AI service temporarily unavailable', 'error');
        }
    }

    // Find stock by symbol in current watchlists
    findStockBySymbol(symbol) {
        for (const watchlist of this.watchlists) {
            if (watchlist.stocks) {
                const stock = watchlist.stocks.find(s => s.symbol === symbol);
                if (stock) return stock;
            }
        }
        return null;
    }

    // Enhanced notes using Ollama AI
    async enhanceNotesWithAI(symbol, originalNotes) {
        try {
            this.ui.showNotification('Enhancing notes with AI...', 'info');
            
            // For this example, we'll simulate an API call to Ollama
            // In a real implementation, this would call the Ollama analytics module
            return new Promise((resolve) => {
                setTimeout(() => {
                    const enhancedNotes = `${originalNotes}
                    
AI Enhancement:
- Key points identified: ${(originalNotes.match(/\b\w+/g) || []).slice(0, 5).join(', ')}
- Sentiment analysis: ${originalNotes.length > 50 ? 'Detailed analysis' : 'Brief notes'}
- Suggested actions: Monitor price levels, check news, review technical indicators`;
                    resolve(enhancedNotes);
                }, 1000);
            });
            
        } catch (error) {
            console.error('Notes enhancement error:', error);
            this.ui.showNotification('AI enhancement failed', 'error');
            return originalNotes;
        }
    }

    // Generate portfolio insights using AI
    async generatePortfolioInsights() {
        try {
            if (!this.currentWatchlistId) {
                this.ui.showNotification('No watchlist selected', 'error');
                return;
            }
            
            const currentWatchlist = this.watchlists.find(w => w.id === this.currentWatchlistId);
            if (!currentWatchlist) {
                this.ui.showNotification('Watchlist not found', 'error');
                return;
            }
            
            this.ui.showNotification('Generating portfolio insights...', 'info');
            
            // For this example, we'll simulate an API call to Ollama
            // In a real implementation, this would call the Ollama analytics module
            setTimeout(() => {
                const insights = `Portfolio Insights for ${currentWatchlist.name}:
                
Overview:
- Total stocks tracked: ${currentWatchlist.stocks.length}
- Average performance: ${(currentWatchlist.stocks.reduce((sum, s) => sum + (parseFloat(s.price_change_percent) || 0), 0) / currentWatchlist.stocks.length).toFixed(2)}%
- Best performer: ${currentWatchlist.stocks.reduce((best, s) => (parseFloat(s.price_change_percent) || 0) > (parseFloat(best.price_change_percent) || 0) ? s : best, currentWatchlist.stocks[0]).symbol}
- Diversification score: ${(Math.min(100, currentWatchlist.stocks.length * 5)).toFixed(0)}/100

Recommendations:
- Consider rebalancing if any stock exceeds 10% of portfolio
- Monitor stocks with negative momentum for potential exits
- Look for new opportunities in underrepresented sectors`;
                
                this.showAIInsightsModal(`Portfolio: ${currentWatchlist.name}`, insights);
            }, 1000);
            
        } catch (error) {
            console.error('Portfolio insights error:', error);
            this.ui.showNotification('AI service temporarily unavailable', 'error');
        }
    }

    // Sync prices with Fyers
    async syncWithFyers() {
        try {
            if (!this.currentWatchlistId) {
                this.ui.showNotification('No watchlist selected', 'error');
                return;
            }
            
            // Use Fyers manager if available
            if (window.fyersManager) {
                const success = await window.fyersManager.syncPrices(this.currentWatchlistId);
                
                if (success) {
                    // Refresh watchlist after a short delay
                    setTimeout(() => {
                        this.loadWatchlistDetails(this.currentWatchlistId);
                    }, 3000);
                }
                return;
            }
            
            // Fallback to direct API call
            this.ui.showNotification('Syncing prices with Fyers...', 'info');
            
            const response = await this.api.syncWithFyers(this.currentWatchlistId);
            
            if (response.success) {
                this.ui.showNotification('Price sync started', 'success');
                
                // Refresh watchlist after a short delay
                setTimeout(() => {
                    this.loadWatchlistDetails(this.currentWatchlistId);
                }, 3000);
            } else {
                this.ui.showNotification('Failed to sync with Fyers', 'error');
            }
            
        } catch (error) {
            console.error('Fyers sync error:', error);
            this.ui.showNotification('Fyers sync failed', 'error');
        }
    }

    // Get real-time quotes from Fyers
    async getFyersQuotes(symbols) {
        try {
            if (window.fyersManager) {
                return await window.fyersManager.getQuotes(symbols);
            }
            
            // Fallback to direct API call
            const response = await this.api.getFyersQuotes(symbols);
            
            if (response.success) {
                return response.data;
            }
            return null;
        } catch (error) {
            console.error('Failed to get Fyers quotes:', error);
            return null;
        }
    }

    // Update stock prices with Fyers data
    async updateStockPricesFromFyers() {
        try {
            // Get current stocks from the active watchlist
            const currentWatchlist = this.watchlists.find(w => w.id === this.currentWatchlistId);
            if (!currentWatchlist || !currentWatchlist.stocks || currentWatchlist.stocks.length === 0) {
                return;
            }
            
            // Extract symbols from current stocks
            const symbols = currentWatchlist.stocks.map(stock => stock.symbol);
            
            // Get quotes from Fyers
            const quotes = await this.getFyersQuotes(symbols);
            
            if (quotes && quotes.length > 0) {
                // Update stock prices in the UI
                this.updatePricesInUI(quotes);
                this.ui.showNotification('Prices updated from Fyers', 'success');
            }
        } catch (error) {
            console.error('Failed to update prices from Fyers:', error);
        }
    }

    // Update prices in the UI
    updatePricesInUI(quotes) {
        try {
            quotes.forEach(quote => {
                const symbol = this.extractSymbolFromQuote(quote);
                const price = quote.lp || quote.last_price || quote.price;
                const change = quote.ch || quote.change || 0;
                const changePercent = quote.chp || quote.change_percent || 0;
                
                // Find and update the corresponding row
                const stockRows = document.querySelectorAll('.stock-row');
                stockRows.forEach(row => {
                    const symbolElement = row.querySelector('.stock-symbol a');
                    if (symbolElement && symbolElement.textContent.trim() === symbol) {
                        // Update price
                        const priceCell = row.querySelector('.price-positive, .price-negative, .price-neutral');
                        if (priceCell) {
                            const priceClass = change > 0 ? 'price-positive' : change < 0 ? 'price-negative' : 'price-neutral';
                            priceCell.className = priceClass;
                            priceCell.textContent = `₹${this.ui.formatPrice(price)}`;
                        }
                        
                        // Update change
                        const changeCells = row.querySelectorAll('.price-change');
                        if (changeCells.length >= 2) {
                            const changeClass = change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral';
                            changeCells[0].className = `price-change ${changeClass}`;
                            changeCells[0].textContent = `${change >= 0 ? '+' : ''}${this.ui.formatPrice(change)}`;
                            
                            // Update change percent
                            changeCells[1].className = `price-change ${changeClass}`;
                            changeCells[1].textContent = `${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%`;
                        }
                    }
                });
            });
        } catch (error) {
            console.error('Failed to update prices in UI:', error);
        }
    }

    // Extract symbol from quote object
    extractSymbolFromQuote(quote) {
        // Handle different quote formats
        if (quote.symbol) {
            return quote.symbol.replace(/NSE:|BSE:|-EQ/g, '');
        }
        if (quote.fyToken && quote.description) {
            return quote.description.split(' ')[0];
        }
        return '';
    }
}

// Global variable for the watchlist manager
let watchlistManager;

// Initialize when document is ready
function initializeWatchlist() {
    // Wait for DOM to be ready
    document.addEventListener('DOMContentLoaded', function() {
        // Initialize Fyers manager first if not already initialized
        if (typeof initializeFyersManager === 'function' && !window.fyersManager) {
            initializeFyersManager();
        }
        
        // Initialize watchlist manager
        watchlistManager = new WatchlistManager();
        
        // Setup additional event handlers
        setupAdditionalEventHandlers();
    });
}

// Setup additional event handlers
function setupAdditionalEventHandlers() {
    // Handle Fyers authentication button clicks
    const fyersAuthBtns = document.querySelectorAll('.fyers-auth-btn');
    fyersAuthBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            if (window.fyersManager) {
                window.fyersManager.authenticate();
            } else {
                alert('Fyers integration not available');
            }
        });
    });
    
    // Handle Fyers sync button clicks
    const fyersSyncBtns = document.querySelectorAll('.fyers-sync-btn');
    fyersSyncBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            if (watchlistManager) {
                watchlistManager.syncWithFyers();
            }
        });
    });
    
    // Handle portfolio insights button
    const portfolioInsightsBtns = document.querySelectorAll('.portfolio-insights-btn');
    portfolioInsightsBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            if (watchlistManager) {
                watchlistManager.generatePortfolioInsights();
            }
        });
    });
    
    // Setup keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl+R: Refresh current watchlist
        if (e.ctrlKey && e.key === 'r') {
            e.preventDefault();
            if (watchlistManager && watchlistManager.currentWatchlistId) {
                watchlistManager.loadWatchlistDetails(watchlistManager.currentWatchlistId);
            }
        }
        
        // Ctrl+F: Sync with Fyers
        if (e.ctrlKey && e.key === 'f') {
            e.preventDefault();
            if (watchlistManager) {
                watchlistManager.syncWithFyers();
            }
        }
    });
    
    // Handle pagination buttons
    document.addEventListener('click', function(e) {
        if (e.target.id === 'prevPage') {
            if (watchlistManager) watchlistManager.changePage('prev');
        } else if (e.target.id === 'nextPage') {
            if (watchlistManager) watchlistManager.changePage('next');
        } else if (e.target.id.startsWith('page')) {
            const pageNumber = parseInt(e.target.id.replace('page', ''));
            if (watchlistManager) watchlistManager.goToPage(pageNumber);
        }
    });
    
    // Handle page size change
    const pageSizeSelect = document.getElementById('pageSizeSelect');
    if (pageSizeSelect) {
        pageSizeSelect.addEventListener('change', function() {
            if (watchlistManager) watchlistManager.changePageSize();
        });
    }
}

// Cleanup on page unload
window.addEventListener('beforeunload', function() {
    if (watchlistManager) {
        watchlistManager.stopAutoRefresh();
    }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WatchlistManager;
}