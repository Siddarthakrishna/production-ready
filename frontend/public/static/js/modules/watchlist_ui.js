// Watchlist UI Module
// This module handles all UI interactions for the watchlist functionality

class WatchlistUI {
    constructor() {
        // Pagination properties
        this.currentPage = 1;
        this.pageSize = 25;
        this.totalPages = 1;
        this.totalStocks = 0;
    }

    // Render watchlist tabs
    renderWatchlistTabs(watchlists, loadWatchlistDetailsCallback) {
        const tabsContainer = document.getElementById('watchlistTabs');
        const contentContainer = document.getElementById('watchlistTabContent');
        
        if (!tabsContainer || !contentContainer) {
            console.error('Watchlist containers not found');
            return;
        }
        
        tabsContainer.innerHTML = '';
        contentContainer.innerHTML = '';
        
        watchlists.forEach((watchlist, index) => {
            const isActive = index === 0 ? 'active' : '';
            
            // Create tab
            const tab = document.createElement('li');
            tab.className = 'nav-item';
            tab.role = 'presentation';
            tab.innerHTML = `
                <button class="nav-link ${isActive}" id="tab-${watchlist.id}" data-bs-toggle="tab" 
                        data-bs-target="#content-${watchlist.id}" type="button" role="tab">
                    ${watchlist.name}
                    ${watchlist.is_default ? '<i class="fa-solid fa-star text-warning ms-1"></i>' : ''}
                    <span class="badge bg-secondary ms-2">${watchlist.stocks ? watchlist.stocks.length : 0}</span>
                </button>
            `;
            
            // Add event listener to tab
            const tabButton = tab.querySelector('button');
            tabButton.addEventListener('click', () => {
                loadWatchlistDetailsCallback(watchlist.id);
            });
            
            // Create content
            const content = document.createElement('div');
            content.className = `tab-pane fade ${isActive ? 'show active' : ''}`;
            content.id = `content-${watchlist.id}`;
            content.role = 'tabpanel';
            content.setAttribute('aria-labelledby', `tab-${watchlist.id}`);
            content.innerHTML = `
                <div id="watchlist-${watchlist.id}-content">
                    <div class="text-center text-muted">
                        <i class="fa-solid fa-spinner fa-spin"></i> Loading...
                    </div>
                </div>
            `;
            
            tabsContainer.appendChild(tab);
            contentContainer.appendChild(content);
        });
    }

    // Render watchlist table
    renderWatchlistTable(watchlist, openFyersChartCallback, generateAIInsightsCallback) {
        const container = document.getElementById(`watchlist-${watchlist.id}-content`);
        
        if (!container) {
            console.error(`Container for watchlist ${watchlist.id} not found`);
            return;
        }
        
        if (!watchlist.stocks || watchlist.stocks.length === 0) {
            container.innerHTML = `
                <div class="empty-watchlist">
                    <i class="fa-solid fa-chart-line"></i>
                    <h5>No stocks in this watchlist</h5>
                    <p>Add stocks to start tracking their performance</p>
                    <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addStockModal">
                        <i class="fa-solid fa-plus"></i> Add Stock
                    </button>
                </div>
            `;
            this.updatePaginationInfo(0, 0);
            return;
        }

        // Get stocks for current page
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        const pageStocks = watchlist.stocks.slice(startIndex, endIndex);

        const tableHtml = `
            <div class="table-responsive">
                <table class="table watchlist-table table-hover">
                    <thead>
                        <tr>
                            <th>Symbol</th>
                            <th>Exchange</th>
                            <th>Type</th>
                            <th>Current Price</th>
                            <th>Change</th>
                            <th>% Change</th>
                            <th>Volume</th>
                            <th>52W High</th>
                            <th>52W Low</th>
                            <th>Target Price</th>
                            <th>Alert Price</th>
                            <th>Notes</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${pageStocks.map(stock => this.renderStockRow(stock, openFyersChartCallback, generateAIInsightsCallback)).join('')}
                    </tbody>
                </table>
            </div>
        `;
        
        container.innerHTML = tableHtml;
        
        // Update pagination controls
        this.updatePaginationControls();
        this.updatePaginationInfo(startIndex + 1, Math.min(endIndex, watchlist.stocks.length));
    }

    // Render individual stock row
    renderStockRow(stock, openFyersChartCallback, generateAIInsightsCallback) {
        const priceChange = parseFloat(stock.price_change) || 0;
        const priceChangePercent = parseFloat(stock.price_change_percent) || 0;
        const volume = parseInt(stock.volume) || 0;
        const fiftyTwoWeekHigh = parseFloat(stock.fifty_two_week_high) || 0;
        const fiftyTwoWeekLow = parseFloat(stock.fifty_two_week_low) || 0;
        
        const priceClass = priceChange > 0 ? 'positive' : priceChange < 0 ? 'negative' : 'neutral';
        const priceColor = priceChange > 0 ? 'price-positive' : priceChange < 0 ? 'price-negative' : 'price-neutral';
        
        return `
            <tr class="stock-row" data-stock-id="${stock.id}">
                <td>
                    <div class="stock-symbol">
                        <a href="#" 
                           data-exchange="${stock.exchange || 'NSE'}" 
                           data-symbol="${stock.symbol}" 
                           class="fyers-symbol-link">
                            ${stock.symbol}
                        </a>
                    </div>
                    <small class="company-name">${stock.company_name || ''}</small>
                </td>
                <td>${stock.exchange || ''}</td>
                <td>${stock.instrument_type || ''}</td>
                <td class="${priceColor}">
                    ₹${this.formatPrice(stock.current_price)}
                </td>
                <td>
                    <span class="price-change ${priceClass}">
                        ${priceChange >= 0 ? '+' : ''}${this.formatPrice(priceChange)}
                    </span>
                </td>
                <td>
                    <span class="price-change ${priceClass}">
                        ${priceChangePercent >= 0 ? '+' : ''}${priceChangePercent.toFixed(2)}%
                    </span>
                </td>
                <td>
                    ${volume.toLocaleString()}
                </td>
                <td>
                    ₹${this.formatPrice(fiftyTwoWeekHigh)}
                </td>
                <td>
                    ₹${this.formatPrice(fiftyTwoWeekLow)}
                </td>
                <td class="editable" data-field="target_price" data-stock-id="${stock.id}">
                    ${stock.target_price ? '₹' + this.formatPrice(stock.target_price) : '-'}
                </td>
                <td class="editable" data-field="alert_price" data-stock-id="${stock.id}">
                    ${stock.alert_price ? '₹' + this.formatPrice(stock.alert_price) : '-'}
                    ${stock.is_alert_enabled ? '<span class="alert-badge enabled">Alert</span>' : ''}
                </td>
                <td class="editable text-truncate-custom" data-field="notes" data-stock-id="${stock.id}" title="${stock.notes || ''}">
                    ${stock.notes || '<span class="text-muted">Add notes...</span>'}
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-action btn-chart" data-symbol="${stock.symbol}" data-exchange="${stock.exchange || 'NSE'}" title="Open Fyers Chart">
                            <i class="fa-solid fa-chart-line"></i>
                        </button>
                        <button class="btn-action btn-ai" data-symbol="${stock.symbol}" data-price="${stock.current_price || 0}" data-change="${priceChangePercent}" title="AI Insights">
                            <i class="fa-solid fa-robot"></i>
                        </button>
                        <button class="btn-action btn-edit" data-stock-id="${stock.id}">
                            <i class="fa-solid fa-edit"></i>
                        </button>
                        <button class="btn-action btn-delete" data-stock-id="${stock.id}">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    // Format price display
    formatPrice(price) {
        if (!price) return '0.00';
        return parseFloat(price).toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    // Update pagination controls
    updatePaginationControls() {
        // Update page buttons
        for (let i = 1; i <= 3; i++) {
            const pageBtn = document.getElementById(`page${i}`);
            if (pageBtn) {
                if (i <= this.totalPages) {
                    pageBtn.style.display = 'inline-block';
                    if (i === this.currentPage) {
                        pageBtn.classList.add('active');
                    } else {
                        pageBtn.classList.remove('active');
                    }
                } else {
                    pageBtn.style.display = 'none';
                }
            }
        }
        
        // Update prev/next buttons
        const prevBtn = document.getElementById('prevPage');
        const nextBtn = document.getElementById('nextPage');
        
        if (prevBtn) {
            if (this.currentPage <= 1) {
                prevBtn.classList.add('disabled');
            } else {
                prevBtn.classList.remove('disabled');
            }
        }
        
        if (nextBtn) {
            if (this.currentPage >= this.totalPages) {
                nextBtn.classList.add('disabled');
            } else {
                nextBtn.classList.remove('disabled');
            }
        }
    }
    
    // Update pagination info
    updatePaginationInfo(startItem, endItem) {
        const infoElement = document.getElementById('paginationInfo');
        if (infoElement) {
            const info = `Showing ${startItem}-${endItem} of ${this.totalStocks} stocks`;
            infoElement.textContent = info;
        }
    }
    
    // Show empty state
    showEmptyState() {
        const contentContainer = document.getElementById('watchlistTabContent');
        if (contentContainer) {
            contentContainer.innerHTML = `
                <div class="empty-watchlist">
                    <i class="fa-solid fa-list"></i>
                    <h4>No Watchlists Found</h4>
                    <p>Create your first watchlist to start tracking stocks</p>
                    <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#createWatchlistModal">
                        <i class="fa-solid fa-plus"></i> Create Watchlist
                    </button>
                </div>
            `;
        }
    }

    // Show notification
    showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        if (notification) {
            notification.className = 'alert';
            notification.classList.add(type === 'success' ? 'alert-success' : 'alert-danger');
            notification.textContent = message;
            notification.style.display = 'block';
            
            setTimeout(() => {
                notification.style.display = 'none';
            }, 3000);
        }
    }

    // Populate watchlist select options
    populateWatchlistSelect(watchlists, currentWatchlistId) {
        const select = document.getElementById('watchlistSelect');
        if (select) {
            select.innerHTML = '';
            
            watchlists.forEach(watchlist => {
                const option = document.createElement('option');
                option.value = watchlist.id;
                option.textContent = watchlist.name;
                select.appendChild(option);
            });
            
            if (currentWatchlistId) {
                select.value = currentWatchlistId;
            }
        }
    }

    // Clear forms
    clearAddStockForm() {
        const form = document.getElementById('addStockForm');
        if (form) {
            form.reset();
        }
        const suggestionsContainer = document.getElementById('stockSuggestions');
        if (suggestionsContainer) {
            suggestionsContainer.innerHTML = '';
            suggestionsContainer.style.display = 'none';
        }
    }

    clearCreateWatchlistForm() {
        const form = document.getElementById('createWatchlistForm');
        if (form) {
            form.reset();
        }
    }

    // Update portfolio stats
    updatePortfolioStats(totalWatchlists, totalStocks, totalAlerts) {
        const totalWatchlistsElement = document.getElementById('totalWatchlists');
        const totalStocksElement = document.getElementById('totalStocks');
        const totalAlertsElement = document.getElementById('totalAlerts');
        
        if (totalWatchlistsElement) totalWatchlistsElement.textContent = totalWatchlists;
        if (totalStocksElement) totalStocksElement.textContent = totalStocks;
        if (totalAlertsElement) totalAlertsElement.textContent = totalAlerts;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WatchlistUI;
} else if (typeof window !== 'undefined') {
    window.WatchlistUI = WatchlistUI;
}