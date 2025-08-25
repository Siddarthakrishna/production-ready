/**
 * Unified Chart Management System
 * Consolidates all chart creation, management, and redirection functionality
 * Eliminates duplicate code across the frontend
 */

class UnifiedChartManager {
    constructor() {
        this.charts = new Map();
        this.defaultOptions = this.getDefaultOptions();
        this.fyersManager = null;
        this.brokerageIntegrations = {
            fyers: true,
            dhan: true
        };
        
        this.init();
    }

    init() {
        // Initialize Fyers manager if available
        if (typeof FyersManager !== 'undefined') {
            this.fyersManager = new FyersManager();
        }
        
        // Setup event listeners for chart redirections
        this.setupEventListeners();
    }

    getDefaultOptions() {
        return {
            chart: {
                type: 'line',
                height: 400,
                background: 'transparent',
                toolbar: { show: true },
                animations: { enabled: true, easing: 'easeinout', speed: 800 },
                zoom: { enabled: true, type: 'x', autoScaleYaxis: true }
            },
            theme: { mode: 'dark' },
            colors: ['#00C853', '#D50000', '#FF9800', '#2196F3', '#9C27B0'],
            tooltip: { 
                enabled: true, 
                theme: 'dark',
                x: { show: true, format: 'dd MMM yyyy HH:mm' },
                y: { 
                    formatter: function(value) { 
                        return window.utils ? window.utils.formatCurrency(value) : value; 
                    }
                }
            },
            grid: { 
                show: true, 
                borderColor: '#2E2E2E', 
                strokeDashArray: 4 
            },
            legend: { 
                position: 'top', 
                horizontalAlign: 'right',
                labels: { colors: '#E0E0E0' }
            },
            dataLabels: { enabled: false },
            noData: { 
                text: 'Loading...', 
                align: 'center', 
                style: { color: '#E0E0E0' } 
            }
        };
    }

    setupEventListeners() {
        // Unified chart redirect handler
        $(document).on('click', '[data-exchange][data-symbol]', (e) => {
            e.preventDefault();
            const exchange = $(e.target).data('exchange');
            const symbol = $(e.target).data('symbol');
            this.openChart(exchange, symbol);
        });

        // Legacy tw_charts support
        $(document).on('click', '.chart-redirect', (e) => {
            const symbol = $(e.target).text() || $(e.target).data('symbol');
            if (symbol) {
                this.openChart('NSE', symbol);
            }
        });

        // ApexCharts click handler for bar charts
        $(document).on('click', '.apex-chart-clickable', (e) => {
            const symbol = $(e.target).closest('[data-symbol]').data('symbol');
            if (symbol) {
                this.openChart('NSE', symbol);
            }
        });
    }

    // Create or update chart
    createChart(elementId, options = {}) {
        if (this.charts.has(elementId)) {
            return this.updateChart(elementId, options);
        }

        const element = document.getElementById(elementId);
        if (!element) {
            console.error(`Element with id ${elementId} not found`);
            return null;
        }

        const chartOptions = this.mergeOptions(options);
        const chart = new ApexCharts(element, chartOptions);
        
        this.charts.set(elementId, chart);
        chart.render();
        
        return chart;
    }

    // Update existing chart
    updateChart(elementId, options = {}) {
        if (!this.charts.has(elementId)) {
            return this.createChart(elementId, options);
        }

        const chart = this.charts.get(elementId);
        const chartOptions = this.mergeOptions(options);
        chart.updateOptions(chartOptions);
        
        return chart;
    }

    // Destroy specific chart
    destroyChart(elementId) {
        if (this.charts.has(elementId)) {
            this.charts.get(elementId).destroy();
            this.charts.delete(elementId);
            return true;
        }
        return false;
    }

    // Destroy all charts
    destroyAllCharts() {
        this.charts.forEach((chart) => chart.destroy());
        this.charts.clear();
    }

    // Render candlestick chart
    renderCandlestickChart(elementId, data, options = {}) {
        const defaultOptions = {
            chart: { type: 'candlestick', height: 400 },
            series: [{
                name: 'Candlestick',
                data: data.map(item => ({
                    x: new Date(item.date || item.timestamp).getTime(),
                    y: [item.open, item.high, item.low, item.close]
                }))
            }],
            plotOptions: {
                candlestick: {
                    colors: {
                        upward: '#00C853',
                        downward: '#D50000'
                    }
                }
            },
            xaxis: { type: 'datetime' }
        };

        return this.createChart(elementId, this.mergeOptions(defaultOptions, options));
    }

    // Render heatmap chart
    renderHeatmapChart(elementId, data, options = {}) {
        const defaultOptions = {
            chart: { type: 'treemap', height: 400 },
            series: [{
                data: data.map(item => ({
                    x: item.symbol || item.name,
                    y: item.value || item.change
                }))
            }],
            plotOptions: {
                treemap: {
                    enableShades: true,
                    shadeIntensity: 0.5,
                    colorScale: {
                        ranges: [
                            { from: -100, to: -0.001, color: '#D50000' },
                            { from: 0.001, to: 100, color: '#00C853' }
                        ]
                    }
                }
            }
        };

        return this.createChart(elementId, this.mergeOptions(defaultOptions, options));
    }

    // Render donut/pie chart
    renderDonutChart(elementId, data, labels, options = {}) {
        const defaultOptions = {
            chart: { type: 'donut', height: 350 },
            series: data,
            labels: labels,
            plotOptions: {
                pie: {
                    donut: {
                        size: '70%'
                    }
                }
            }
        };

        return this.createChart(elementId, this.mergeOptions(defaultOptions, options));
    }

    // Render bar chart
    renderBarChart(elementId, data, categories, options = {}) {
        const defaultOptions = {
            chart: { type: 'bar', height: 400 },
            series: [{
                name: 'Value',
                data: data
            }],
            xaxis: {
                categories: categories,
                labels: { style: { colors: '#E0E0E0' } }
            },
            plotOptions: {
                bar: {
                    horizontal: false,
                    columnWidth: '55%'
                }
            }
        };

        return this.createChart(elementId, this.mergeOptions(defaultOptions, options));
    }

    // Open chart in external platform
    openChart(exchange, symbol, platform = 'auto') {
        if (!symbol) return;

        const cleanExchange = (exchange || 'NSE').toUpperCase();
        const cleanSymbol = symbol.toUpperCase().replace(/\s+/g, '');

        // Determine platform
        if (platform === 'auto') {
            platform = this.fyersManager && this.fyersManager.isAuthenticated ? 'fyers' : 'dhan';
        }

        let chartUrl;
        
        switch (platform) {
            case 'fyers':
                chartUrl = `https://trade.fyers.in/charts/${cleanExchange}:${cleanSymbol}`;
                break;
            case 'dhan':
                chartUrl = `https://trading.dhan.co/charts/${encodeURIComponent(cleanExchange)}/${encodeURIComponent(cleanSymbol)}`;
                break;
            default:
                console.error('Invalid chart platform:', platform);
                return;
        }

        // Open chart
        window.open(chartUrl, '_blank', 'noopener,noreferrer');
        
        // Show notification
        this.showNotification(`Opening ${platform.toUpperCase()} chart for ${cleanSymbol}`, 'success');
    }

    // Legacy tw_charts function replacement
    tw_charts(symbol) {
        this.openChart('NSE', symbol);
    }

    // Merge chart options
    mergeOptions(...optionObjects) {
        return this.deepMerge({}, this.defaultOptions, ...optionObjects);
    }

    // Deep merge utility
    deepMerge(target, ...sources) {
        if (!sources.length) return target;
        const source = sources.shift();

        if (this.isObject(target) && this.isObject(source)) {
            for (const key in source) {
                if (this.isObject(source[key])) {
                    if (!target[key]) Object.assign(target, { [key]: {} });
                    this.deepMerge(target[key], source[key]);
                } else {
                    Object.assign(target, { [key]: source[key] });
                }
            }
        }

        return this.deepMerge(target, ...sources);
    }

    // Check if value is object
    isObject(item) {
        return (item && typeof item === 'object' && !Array.isArray(item));
    }

    // Show notification
    showNotification(message, type = 'info') {
        // Try multiple notification systems
        if (typeof showNotification === 'function') {
            showNotification(message, type);
        } else if (window.watchlistManager && typeof window.watchlistManager.showNotification === 'function') {
            window.watchlistManager.showNotification(message, type);
        } else if (window.fyersManager && typeof window.fyersManager.showNotification === 'function') {
            window.fyersManager.showNotification(message, type);
        } else {
            // Fallback
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }

    // Get chart instance
    getChart(elementId) {
        return this.charts.get(elementId);
    }

    // Check if chart exists
    hasChart(elementId) {
        return this.charts.has(elementId);
    }

    // Get all chart IDs
    getChartIds() {
        return Array.from(this.charts.keys());
    }

    // Update series data for existing chart
    updateSeries(elementId, newSeries) {
        if (this.charts.has(elementId)) {
            this.charts.get(elementId).updateSeries(newSeries);
            return true;
        }
        return false;
    }

    // Cleanup method
    cleanup() {
        this.destroyAllCharts();
        if (this.fyersManager && typeof this.fyersManager.cleanup === 'function') {
            this.fyersManager.cleanup();
        }
    }
}

// Global instance
const unifiedChartManager = new UnifiedChartManager();

// Global functions for backwards compatibility
window.tw_charts = (symbol) => unifiedChartManager.tw_charts(symbol);
window.openChart = (exchange, symbol) => unifiedChartManager.openChart(exchange, symbol);

// Export for module use
window.unifiedChartManager = unifiedChartManager;

// Cleanup on page unload
$(window).on('beforeunload', function() {
    unifiedChartManager.cleanup();
});

// Auto-initialize on DOM ready
$(document).ready(function() {
    console.log('Unified Chart Manager initialized');
});

export default unifiedChartManager;