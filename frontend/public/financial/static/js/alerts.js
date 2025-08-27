// Alerts Module
class AlertsManager {
    constructor() {
        this.alerts = [];
        this.pollingInterval = null;
        this.initialized = false;
        
        this.initEventListeners();
        this.loadAlerts();
    }

    // Initialize event listeners
    initEventListeners() {
        // Add alert button
        const addAlertBtn = document.getElementById('add-alert-btn');
        if (addAlertBtn) {
            addAlertBtn.addEventListener('click', () => this.showAddAlertModal());
        }
        
        // Alert form submission
        const alertForm = document.getElementById('alertForm');
        if (alertForm) {
            alertForm.addEventListener('submit', (e) => this.handleAddAlert(e));
        }
        
        // Listen for price updates
        document.addEventListener('priceUpdated', (e) => {
            const { symbol, price } = e.detail;
            this.checkAlerts(symbol, price);
        });
    }

    // Load alerts from API
    async loadAlerts() {
        try {
            const data = await apiClient.alerts.getAll();
            this.alerts = Array.isArray(data) ? data : [];
            this.renderAlerts();
            this.startPolling();
            this.initialized = true;
        } catch (error) {
            console.error('Error loading alerts:', error);
            utils.showToast('Failed to load alerts', 'error');
        }
    }

    // Start polling for alert updates
    startPolling() {
        // Clear any existing interval
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
        }
        
        // Set up new polling interval
        this.pollingInterval = setInterval(async () => {
            await this.checkAllAlerts();
        }, 60000); // Check every minute
    }

    // Stop polling
    stopPolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
    }

    // Check all alerts for a specific symbol and price
    async checkAlerts(symbol, price) {
        if (!this.initialized) return;
        
        const triggeredAlerts = [];
        
        this.alerts.forEach(alert => {
            if (alert.symbol === symbol && !alert.isTriggered) {
                const shouldTrigger = alert.condition === 'above' 
                    ? price >= alert.targetPrice 
                    : price <= alert.targetPrice;
                
                if (shouldTrigger) {
                    alert.isTriggered = true;
                    alert.triggeredAt = new Date().toISOString();
                    triggeredAlerts.push(alert);
                }
            }
        });
        
        // Update triggered alerts in the API
        for (const alert of triggeredAlerts) {
            try {
                await apiClient.alerts.update(alert.id, { isTriggered: true });
                this.showAlertNotification(alert, price);
            } catch (error) {
                console.error('Error updating alert:', error);
                // Revert the change if API update fails
                alert.isTriggered = false;
                delete alert.triggeredAt;
            }
        }
        
        if (triggeredAlerts.length > 0) {
            this.renderAlerts();
        }
    }

    // Check all alerts by fetching latest prices
    async checkAllAlerts() {
        if (!this.initialized || this.alerts.length === 0) return;
        
        try {
            // Get unique symbols from active alerts
            const activeAlerts = this.alerts.filter(a => !a.isTriggered);
            const symbols = [...new Set(activeAlerts.map(a => a.symbol))];
            
            // Fetch latest prices for all symbols
            const pricePromises = symbols.map(symbol => 
                apiClient.market.getQuote(symbol).catch(() => null)
            );
            
            const priceResults = await Promise.all(pricePromises);
            
            // Check alerts for each symbol with its current price
            priceResults.forEach((quote, index) => {
                if (quote && quote.price) {
                    this.checkAlerts(symbols[index], quote.price);
                }
            });
        } catch (error) {
            console.error('Error checking alerts:', error);
        }
    }

    // Show add alert modal
    showAddAlertModal(symbol = '') {
        // In a real app, you would show a modal with a form
        // For now, we'll use prompts for simplicity
        
        const alertSymbol = symbol || prompt('Enter stock symbol:', '');
        if (!alertSymbol) return;
        
        const condition = prompt('Alert when price is (1) above or (2) below target?', '1');
        if (condition !== '1' && condition !== '2') {
            utils.showToast('Invalid condition', 'warning');
            return;
        }
        
        const targetPrice = parseFloat(prompt('Enter target price:', ''));
        if (isNaN(targetPrice) || targetPrice <= 0) {
            utils.showToast('Invalid price', 'warning');
            return;
        }
        
        this.addAlert({
            symbol: alertSymbol.toUpperCase(),
            targetPrice,
            condition: condition === '1' ? 'above' : 'below',
            notes: ''
        });
    }

    // Handle add alert form submission
    async handleAddAlert(event) {
        event.preventDefault();
        
        const form = event.target;
        const symbol = form.symbol.value.trim().toUpperCase();
        const targetPrice = parseFloat(form.targetPrice.value);
        const condition = form.condition.value;
        const notes = form.notes.value.trim();
        
        if (!symbol || isNaN(targetPrice) || targetPrice <= 0) {
            utils.showToast('Please fill in all required fields', 'warning');
            return;
        }
        
        const submitButton = form.querySelector('button[type="submit"]');
        const buttonText = submitButton.innerHTML;
        utils.showLoading(submitButton);
        
        try {
            await this.addAlert({
                symbol,
                targetPrice,
                condition,
                notes
            });
            
            // Close the modal
            const modal = bootstrap.Modal.getInstance(form.closest('.modal'));
            if (modal) modal.hide();
            
            form.reset();
        } catch (error) {
            console.error('Error adding alert:', error);
            utils.showToast('Failed to add alert', 'error');
        } finally {
            utils.hideLoading(submitButton, buttonText);
        }
    }

    // Add a new alert
    async addAlert(alertData) {
        try {
            // Check if the same alert already exists
            const exists = this.alerts.some(alert => 
                alert.symbol === alertData.symbol && 
                alert.targetPrice === alertData.targetPrice && 
                alert.condition === alertData.condition &&
                !alert.isTriggered
            );
            
            if (exists) {
                utils.showToast('A similar alert already exists', 'warning');
                return;
            }
            
            // Add the alert via API
            const newAlert = await apiClient.alerts.create(
                alertData.symbol,
                alertData.targetPrice,
                alertData.condition
            );
            
            // Add to local alerts array
            this.alerts.unshift({
                ...newAlert,
                notes: alertData.notes || ''
            });
            
            // Update the UI
            this.renderAlerts();
            
            utils.showToast('Alert added successfully', 'success');
            return newAlert;
        } catch (error) {
            console.error('Error adding alert:', error);
            throw error;
        }
    }

    // Delete an alert
    async deleteAlert(id) {
        if (!confirm('Are you sure you want to delete this alert?')) {
            return false;
        }
        
        try {
            await apiClient.alerts.delete(id);
            
            // Remove from local alerts array
            this.alerts = this.alerts.filter(alert => alert.id !== id);
            
            // Update the UI
            this.renderAlerts();
            
            utils.showToast('Alert deleted', 'success');
            return true;
        } catch (error) {
            console.error('Error deleting alert:', error);
            utils.showToast('Failed to delete alert', 'error');
            return false;
        }
    }

    // Render alerts table
    renderAlerts() {
        const alertsBody = document.getElementById('alerts-body');
        const alertsCount = document.getElementById('alerts-count');
        
        if (!alertsBody) return;
        
        // Update alerts count in the tab
        if (alertsCount) {
            const activeAlerts = this.alerts.filter(a => !a.isTriggered).length;
            alertsCount.textContent = activeAlerts;
            alertsCount.style.display = activeAlerts > 0 ? 'inline-block' : 'none';
        }
        
        if (this.alerts.length === 0) {
            alertsBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center text-muted py-4">
                        <i class="fas fa-bell-slash fa-2x mb-2 d-block"></i>
                        No active alerts. Create one to get notified about price movements.
                    </td>
                </tr>
            `;
            return;
        }
        
        // Sort alerts: active first, then by symbol
        const sortedAlerts = [...this.alerts].sort((a, b) => {
            if (a.isTriggered !== b.isTriggered) {
                return a.isTriggered ? 1 : -1;
            }
            return a.symbol.localeCompare(b.symbol);
        });
        
        let html = '';
        
        sortedAlerts.forEach(alert => {
            const isActive = !alert.isTriggered;
            const rowClass = isActive ? '' : 'text-muted';
            const statusText = isActive ? 'Active' : 'Triggered';
            const statusClass = isActive ? 'badge bg-success' : 'badge bg-secondary';
            const currentPrice = alert.currentPrice || '--';
            const createdDate = alert.createdAt ? new Date(alert.createdAt) : new Date();
            const triggeredDate = alert.triggeredAt ? new Date(alert.triggeredAt) : null;
            
            html += `
                <tr class="${rowClass}" data-id="${alert.id}">
                    <td><strong>${alert.symbol}</strong></td>
                    <td>${alert.condition === 'above' ? 'Above' : 'Below'} ${utils.formatCurrency(alert.targetPrice)}</td>
                    <td>${utils.formatCurrency(alert.targetPrice)}</td>
                    <td>${currentPrice}</td>
                    <td><span class="${statusClass}">${statusText}</span></td>
                    <td>${utils.formatDate(createdDate, { month: 'short', day: 'numeric' })}</td>
                    <td>
                        <div class="btn-group btn-group-sm">
                            ${isActive ? `
                                <button type="button" class="btn btn-outline-secondary btn-edit" 
                                        data-id="${alert.id}" title="Edit">
                                    <i class="fas fa-edit"></i>
                                </button>
                            ` : ''}
                            <button type="button" class="btn btn-outline-danger btn-delete" 
                                    data-id="${alert.id}" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
                ${triggeredDate ? `
                    <tr class="${rowClass}">
                        <td colspan="7" class="small text-muted">
                            <i class="fas fa-clock me-1"></i>
                            Triggered on ${utils.formatDate(triggeredDate, { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </td>
                    </tr>
                ` : ''}
            `;
        });
        
        alertsBody.innerHTML = html;
        
        // Add event listeners
        this.addAlertEventListeners();
    }

    // Add event listeners to alert actions
    addAlertEventListeners() {
        // Edit buttons
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                this.editAlert(id);
            });
        });
        
        // Delete buttons
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                await this.deleteAlert(id);
            });
        });
    }

    // Edit an alert
    async editAlert(id) {
        const alert = this.alerts.find(a => a.id === id);
        if (!alert) {
            utils.showToast('Alert not found', 'error');
            return;
        }
        
        // In a real app, you would show a modal with a form to edit the alert
        // For now, we'll use prompts for simplicity
        
        const newTargetPrice = parseFloat(prompt('Enter new target price:', alert.targetPrice));
        if (isNaN(newTargetPrice) || newTargetPrice <= 0) {
            utils.showToast('Invalid price', 'warning');
            return;
        }
        
        const condition = confirm(`Alert when price is ${alert.condition === 'above' ? 'below' : 'above'} ${newTargetPrice}?\n\nClick OK for "Above", Cancel for "Below"`) ? 'above' : 'below';
        
        try {
            await apiClient.alerts.update(id, {
                targetPrice: newTargetPrice,
                condition
            });
            
            // Update local alert
            const alertIndex = this.alerts.findIndex(a => a.id === id);
            if (alertIndex !== -1) {
                this.alerts[alertIndex] = {
                    ...this.alerts[alertIndex],
                    targetPrice: newTargetPrice,
                    condition
                };
                
                this.renderAlerts();
                utils.showToast('Alert updated successfully', 'success');
            }
        } catch (error) {
            console.error('Error updating alert:', error);
            utils.showToast('Failed to update alert', 'error');
        }
    }

    // Show notification for triggered alert
    showAlertNotification(alert, currentPrice) {
        if (!('Notification' in window)) {
            console.warn('This browser does not support desktop notifications');
            return;
        }
        
        const notificationTitle = `Price Alert: ${alert.symbol}`;
        const notificationOptions = {
            body: `${alert.symbol} is now ${alert.condition} ${utils.formatCurrency(alert.targetPrice)}\n` +
                  `Current price: ${utils.formatCurrency(currentPrice)}`,
            icon: '/favicon.ico',
            tag: `alert-${alert.id}`,
            renotify: true,
            vibrate: [200, 100, 200]
        };
        
        // Check if notification permission is already granted
        if (Notification.permission === 'granted') {
            this.showNotification(notificationTitle, notificationOptions);
        } 
        // Otherwise, ask for permission
        else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    this.showNotification(notificationTitle, notificationOptions);
                }
            });
        }
        
        // Show toast notification as fallback
        utils.showToast(
            `${alert.symbol} is now ${alert.condition} ${utils.formatCurrency(alert.targetPrice)}`,
            'info',
            10000
        );
    }
    
    // Show browser notification
    showNotification(title, options) {
        // Show the notification
        const notification = new Notification(title, options);
        
        // Handle notification click
        notification.onclick = function(event) {
            event.preventDefault();
            window.focus();
            // window.location.href = `/stocks/${alert.symbol}`;
            notification.close();
        };
        
        // Close notification after 10 seconds
        setTimeout(() => {
            notification.close();
        }, 10000);
    }
}

// Create and export a singleton instance
const alertsManager = new AlertsManager();
window.alertsManager = alertsManager;

export default alertsManager;
