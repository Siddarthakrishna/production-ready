/**
 * Sectorial Flow Heatmap Component
 * 
 * This component provides interactive heatmap visualization for sectorial flow analysis
 * using the unified parameter system and ApexCharts treemap functionality.
 * 
 * Features:
 * - Sector-level heatmap overview
 * - Drill-down to individual stock heatmaps
 * - Interactive filtering and real-time updates
 * - Integration with existing sectorial flow page
 */

class SectorialHeatmap {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.chart = null;
        this.currentView = 'sectors'; // 'sectors' | 'stocks' | 'all'
        this.currentSector = null;
        this.data = [];
        this.isLoading = false;
        
        // Default configuration
        this.config = {
            apiBase: window.API_BASE || 'http://localhost:8001/api',
            updateInterval: 30000, // 30 seconds
            colorScheme: {
                positive: '#00E676',  // Green for positive changes
                negative: '#FF5252',  // Red for negative changes
                neutral: '#FFC107'    // Yellow for neutral
            },
            enableDrillDown: true,
            showTooltips: true,
            ...options
        };
        
        this.initialize();
    }
    
    /**
     * Initialize the heatmap component
     */
    initialize() {
        this.createContainer();
        this.setupEventListeners();
        this.loadSectorHeatmap();
        
        // Setup auto-refresh
        if (this.config.updateInterval > 0) {
            setInterval(() => this.refreshData(), this.config.updateInterval);
        }
    }
    
    /**
     * Create the heatmap container with controls
     */
    createContainer() {
        const container = document.getElementById(this.containerId);
        if (!container) {
            console.error(`Container with ID '${this.containerId}' not found`);
            return;
        }
        
        container.innerHTML = `
            <div class="sectorial-heatmap-wrapper">
                <div class="heatmap-controls mb-3">
                    <div class="row align-items-center">
                        <div class="col-md-6">
                            <div class="btn-group" role="group">
                                <button type="button" class="btn btn-outline-light btn-sm view-toggle" data-view="sectors">
                                    Sectors Overview
                                </button>
                                <button type="button" class="btn btn-outline-light btn-sm view-toggle" data-view="all">
                                    All Stocks
                                </button>
                            </div>
                        </div>
                        <div class="col-md-6 text-end">
                            <select class="form-select form-select-sm sector-filter" style="width: auto; display: inline-block;">
                                <option value="">All Sectors</option>
                            </select>
                            <button type="button" class="btn btn-outline-light btn-sm ms-2 refresh-btn">
                                <i class="fa-solid fa-refresh"></i> Refresh
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="heatmap-info mb-2">
                    <small class="text-muted">
                        <span class="info-text">Loading heatmap data...</span>
                        <span class="timestamp ms-3"></span>
                    </small>
                </div>
                
                <div class="heatmap-container">
                    <div id="${this.containerId}_chart" style="height: 500px;"></div>
                </div>
                
                <div class="heatmap-legend mt-3">
                    <div class="row">
                        <div class="col-md-12">
                            <div class="d-flex justify-content-center align-items-center flex-wrap">
                                <span class="badge bg-success me-2">
                                    <i class="fa-solid fa-square"></i> Positive (> 0%)
                                </span>
                                <span class="badge bg-warning me-2">
                                    <i class="fa-solid fa-square"></i> Neutral (± 0.5%)
                                </span>
                                <span class="badge bg-danger me-2">
                                    <i class="fa-solid fa-square"></i> Negative (< 0%)
                                </span>
                                <small class="text-muted ms-3">
                                    Size represents volume/market cap • Color represents % change
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add custom styles
        this.addStyles();
    }
    
    /**
     * Add custom CSS styles for the heatmap
     */
    addStyles() {
        const styleId = 'sectorial-heatmap-styles';
        if (document.getElementById(styleId)) return;
        
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .sectorial-heatmap-wrapper {
                background: rgba(28, 28, 28, 0.8);
                border-radius: 8px;
                padding: 20px;
                border: 1px solid #444;
            }
            
            .view-toggle.active {
                background-color: #007bff !important;
                border-color: #007bff !important;
                color: white !important;
            }
            
            .heatmap-container {
                background: #1c1c1c;
                border-radius: 4px;
                border: 1px solid #333;
                overflow: hidden;
            }
            
            .heatmap-controls .btn {
                font-size: 0.875rem;
            }
            
            .heatmap-info {
                color: #ccc;
                font-size: 0.875rem;
            }
            
            .sector-filter {
                background-color: #2c2c2c !important;
                border-color: #444 !important;
                color: #fff !important;
                max-width: 200px;
            }
            
            .sector-filter:focus {
                border-color: #007bff !important;
                box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25) !important;
            }
            
            .heatmap-legend .badge {
                font-size: 0.75rem;
            }
        `;
        
        document.head.appendChild(style);
    }
    
    /**
     * Setup event listeners for controls
     */
    setupEventListeners() {
        const container = document.getElementById(this.containerId);
        
        // View toggle buttons
        container.addEventListener('click', (e) => {
            if (e.target.classList.contains('view-toggle')) {
                const view = e.target.dataset.view;
                this.switchView(view);
                
                // Update button states
                container.querySelectorAll('.view-toggle').forEach(btn => {
                    btn.classList.remove('active');
                });
                e.target.classList.add('active');
            }
            
            // Refresh button
            if (e.target.closest('.refresh-btn')) {
                this.refreshData();
            }
        });
        
        // Sector filter
        const sectorFilter = container.querySelector('.sector-filter');
        sectorFilter.addEventListener('change', (e) => {
            const sector = e.target.value;
            if (sector) {
                this.loadSectorStocksHeatmap(sector);
                this.currentView = 'stocks';
                this.currentSector = sector;
            } else {
                this.loadSectorHeatmap();
                this.currentView = 'sectors';
                this.currentSector = null;
            }
        });
    }
    
    /**
     * Switch between different heatmap views
     */
    switchView(view) {
        this.currentView = view;
        
        switch(view) {
            case 'sectors':
                this.loadSectorHeatmap();
                break;
            case 'all':
                this.loadAllStocksHeatmap();
                break;
        }
    }
    
    /**
     * Load sector-level heatmap data
     */
    async loadSectorHeatmap(sectorFilter = null) {
        this.setLoading(true);
        
        try {
            const url = sectorFilter 
                ? `${this.config.apiBase}/sector/heatmap/sectors?sector_filter=${sectorFilter}`
                : `${this.config.apiBase}/sector/heatmap/sectors`;
                
            const response = await fetch(url);
            const data = await response.json();
            
            if (data && data.data) {
                this.data = data.data;
                this.renderHeatmap(this.prepareSectorData(data.data), 'Sector Performance Overview');
                this.updateInfo(`${data.data.length} sectors loaded`, data.timestamp);
                this.populateSectorFilter();
            }
        } catch (error) {
            console.error('Error loading sector heatmap:', error);
            this.showError('Failed to load sector data');
        } finally {
            this.setLoading(false);
        }
    }
    
    /**
     * Load stock-level heatmap for a specific sector
     */
    async loadSectorStocksHeatmap(sectorCode) {
        this.setLoading(true);
        
        try {
            const response = await fetch(`${this.config.apiBase}/sector/heatmap/stocks/${sectorCode}`);
            const data = await response.json();
            
            if (data && data.data) {
                this.data = data.data;
                this.renderHeatmap(this.prepareStockData(data.data), `${data.sector} Stocks Heatmap`);
                this.updateInfo(`${data.data.length} stocks in ${data.sector}`, data.timestamp);
            }
        } catch (error) {
            console.error('Error loading sector stocks heatmap:', error);
            this.showError(`Failed to load stocks for ${sectorCode}`);
        } finally {
            this.setLoading(false);
        }
    }
    
    /**
     * Load all stocks heatmap across all sectors
     */
    async loadAllStocksHeatmap() {
        this.setLoading(true);
        
        try {
            const response = await fetch(`${this.config.apiBase}/sector/heatmap/stocks`);
            const data = await response.json();
            
            if (data && data.data) {
                this.data = data.data;
                this.renderHeatmap(this.prepareStockData(data.data), 'All Stocks Heatmap');
                this.updateInfo(`${data.data.length} stocks across ${data.total_sectors} sectors`, data.timestamp);
            }
        } catch (error) {
            console.error('Error loading all stocks heatmap:', error);
            this.showError('Failed to load all stocks data');
        } finally {
            this.setLoading(false);
        }
    }
    
    /**
     * Prepare sector data for heatmap visualization
     */
    prepareSectorData(data) {
        return data.map(item => {
            const heatValue = this.getParamValue(item, 'param_500') || this.getParamValue(item, 'param_2') || 0; // heatmap value or % change
            const volume = this.getParamValue(item, 'param_5') || 100000; // volume for size
            
            return {
                x: item.Symbol,
                y: Math.abs(heatValue), // Use absolute value for size
                fillColor: this.getHeatmapColor(heatValue),
                custom: {
                    symbol: item.Symbol,
                    heatValue: heatValue,
                    change: this.getParamValue(item, 'param_2') || 0,
                    volume: volume,
                    price: this.getParamValue(item, 'param_0') || 0
                }
            };
        });
    }
    
    /**
     * Prepare stock data for heatmap visualization
     */
    prepareStockData(data) {
        return data.map(item => {
            const heatValue = this.getParamValue(item, 'param_500') || this.getParamValue(item, 'param_2') || 0;
            const volume = this.getParamValue(item, 'param_5') || 100000;
            
            return {
                x: item.Symbol,
                y: Math.abs(heatValue),
                fillColor: this.getHeatmapColor(heatValue),
                custom: {
                    symbol: item.Symbol,
                    sector: this.getParamValue(item, 'param_6') || 'Unknown',
                    heatValue: heatValue,
                    change: this.getParamValue(item, 'param_2') || 0,
                    volume: volume,
                    price: this.getParamValue(item, 'param_0') || 0,
                    rFactor: this.getParamValue(item, 'param_3') || 1
                }
            };
        });
    }
    
    /**
     * Get parameter value from data item (handles both old and new format)
     */
    getParamValue(item, paramKey) {
        // New format with params object
        if (item.params && item.params[paramKey]) {
            return item.params[paramKey].value;
        }
        
        // Legacy format with direct param access
        return item[paramKey] || null;
    }
    
    /**
     * Generate color based on heatmap value
     */
    getHeatmapColor(value) {
        const absValue = Math.abs(value);
        const intensity = Math.min(absValue / 5, 1); // Normalize to 0-1 range (assuming max 5% change)
        
        if (Math.abs(value) < 0.5) {
            return this.config.colorScheme.neutral;
        } else if (value > 0) {
            return this.adjustColorIntensity(this.config.colorScheme.positive, intensity);
        } else {
            return this.adjustColorIntensity(this.config.colorScheme.negative, intensity);
        }
    }
    
    /**
     * Adjust color intensity based on value
     */
    adjustColorIntensity(color, intensity) {
        // Simple intensity adjustment - you can make this more sophisticated
        const alpha = 0.3 + (intensity * 0.7); // Alpha between 0.3 and 1.0
        
        // Convert hex to rgba
        const hex = color.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    
    /**
     * Render the heatmap using ApexCharts
     */
    renderHeatmap(data, title) {
        const chartContainer = document.getElementById(`${this.containerId}_chart`);
        
        if (this.chart) {
            this.chart.destroy();
        }
        
        const options = {
            series: [{
                data: data
            }],
            chart: {
                type: 'treemap',
                height: 500,
                background: 'transparent',
                toolbar: {
                    show: false
                },
                events: {
                    dataPointSelection: (event, chartContext, config) => {
                        this.handleDataPointClick(data[config.dataPointIndex]);
                    }
                }
            },
            theme: {
                mode: 'dark'
            },
            dataLabels: {
                enabled: true,
                style: {
                    fontSize: '12px',
                    fontWeight: 'bold',
                    colors: ['#ffffff']
                },
                formatter: function(text, op) {
                    const custom = op.w.config.series[0].data[op.dataPointIndex].custom;
                    return [text, `${custom.change > 0 ? '+' : ''}${custom.change.toFixed(2)}%`];
                }
            },
            plotOptions: {
                treemap: {
                    enableShades: false,
                    shadeIntensity: 0,
                    distributed: true,
                    colorScale: {
                        ranges: []
                    }
                }
            },
            legend: {
                show: false
            },
            tooltip: {
                enabled: this.config.showTooltips,
                theme: 'dark',
                custom: ({ series, seriesIndex, dataPointIndex, w }) => {
                    const custom = w.config.series[seriesIndex].data[dataPointIndex].custom;
                    
                    return `
                        <div class="custom-tooltip p-3" style="background: #1c1c1c; border: 1px solid #444; border-radius: 6px;">
                            <div class="tooltip-title" style="font-weight: bold; color: #fff; margin-bottom: 8px;">
                                ${custom.symbol}
                            </div>
                            <div class="tooltip-content" style="color: #ccc; font-size: 12px;">
                                ${custom.sector ? `<div>Sector: ${custom.sector}</div>` : ''}
                                <div>Price: ₹${custom.price.toFixed(2)}</div>
                                <div>Change: <span style="color: ${custom.change >= 0 ? '#00E676' : '#FF5252'}">${custom.change > 0 ? '+' : ''}${custom.change.toFixed(2)}%</span></div>
                                <div>Heat Value: ${custom.heatValue.toFixed(2)}</div>
                                <div>Volume: ${this.formatVolume(custom.volume)}</div>
                                ${custom.rFactor ? `<div>R-Factor: ${custom.rFactor.toFixed(2)}</div>` : ''}
                            </div>
                        </div>
                    `;
                }
            },
            title: {
                text: title,
                align: 'center',
                style: {
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#ffffff'
                }
            }
        };
        
        this.chart = new ApexCharts(chartContainer, options);
        this.chart.render();
    }
    
    /**
     * Handle click on heatmap data points
     */
    handleDataPointClick(dataPoint) {
        if (!this.config.enableDrillDown) return;
        
        const custom = dataPoint.custom;
        
        if (this.currentView === 'sectors') {
            // Drill down to sector stocks
            const sectorCode = this.getSectorCode(custom.symbol);
            if (sectorCode) {
                this.loadSectorStocksHeatmap(sectorCode);
                this.currentView = 'stocks';
                this.currentSector = sectorCode;
                
                // Update sector filter
                const filter = document.querySelector('.sector-filter');
                filter.value = sectorCode;
            }
        } else {
            // Open stock chart
            if (typeof tw_charts === 'function') {
                tw_charts(custom.symbol);
            }
        }
    }
    
    /**
     * Get sector code from sector name (simplified mapping)
     */
    getSectorCode(sectorName) {
        const mapping = {
            'Nifty 50': 'NIFTY50',
            'Bank Nifty': 'BANKNIFTY',
            'Nifty Auto': 'NIFTYAUTO',
            'Nifty Financial Services': 'NIFTYFINSERVICE',
            'Nifty FMCG': 'NIFTYFMCG',
            'Nifty IT': 'CNXIT',
            'Nifty Media': 'NIFTYMEDIA',
            'Nifty Metal': 'NIFTYMETAL',
            'Nifty Pharma': 'CNXPHARMA',
            'Nifty PSU Bank': 'NIFTYPSUBANK',
            'Nifty Private Bank': 'NIFTYPVTBANK',
            'Nifty Realty': 'CNXREALTY',
            'Nifty Energy': 'CNXENERGY'
        };
        
        return mapping[sectorName] || sectorName.toUpperCase().replace(/\s+/g, '');
    }
    
    /**
     * Populate sector filter dropdown
     */
    populateSectorFilter() {
        const filter = document.querySelector('.sector-filter');
        const sectors = [
            { code: 'NIFTY50', name: 'Nifty 50' },
            { code: 'BANKNIFTY', name: 'Bank Nifty' },
            { code: 'NIFTYAUTO', name: 'Nifty Auto' },
            { code: 'NIFTYFINSERVICE', name: 'Nifty Financial Services' },
            { code: 'NIFTYFMCG', name: 'Nifty FMCG' },
            { code: 'CNXIT', name: 'Nifty IT' },
            { code: 'NIFTYMEDIA', name: 'Nifty Media' },
            { code: 'NIFTYMETAL', name: 'Nifty Metal' },
            { code: 'CNXPHARMA', name: 'Nifty Pharma' },
            { code: 'NIFTYPSUBANK', name: 'Nifty PSU Bank' },
            { code: 'NIFTYPVTBANK', name: 'Nifty Private Bank' },
            { code: 'CNXREALTY', name: 'Nifty Realty' },
            { code: 'CNXENERGY', name: 'Nifty Energy' }
        ];
        
        // Clear existing options except "All Sectors"
        filter.innerHTML = '<option value="">All Sectors</option>';
        
        sectors.forEach(sector => {
            const option = document.createElement('option');
            option.value = sector.code;
            option.textContent = sector.name;
            filter.appendChild(option);
        });
    }
    
    /**
     * Set loading state
     */
    setLoading(loading) {
        this.isLoading = loading;
        const infoText = document.querySelector('.info-text');
        
        if (loading) {
            infoText.textContent = 'Loading heatmap data...';
        }
    }
    
    /**
     * Update info display
     */
    updateInfo(text, timestamp) {
        const infoText = document.querySelector('.info-text');
        const timestampEl = document.querySelector('.timestamp');
        
        infoText.textContent = text;
        
        if (timestamp) {
            const date = new Date(timestamp);
            timestampEl.textContent = `Last updated: ${date.toLocaleTimeString()}`;
        }
    }
    
    /**
     * Show error message
     */
    showError(message) {
        const infoText = document.querySelector('.info-text');
        infoText.textContent = `Error: ${message}`;
        infoText.style.color = '#FF5252';
        
        setTimeout(() => {
            infoText.style.color = '';
        }, 5000);
    }
    
    /**
     * Format volume for display
     */
    formatVolume(volume) {
        if (volume >= 10000000) {
            return `${(volume / 10000000).toFixed(1)}Cr`;
        } else if (volume >= 100000) {
            return `${(volume / 100000).toFixed(1)}L`;
        } else if (volume >= 1000) {
            return `${(volume / 1000).toFixed(1)}K`;
        } else {
            return volume.toString();
        }
    }
    
    /**
     * Refresh current data
     */
    refreshData() {
        if (this.isLoading) return;
        
        switch (this.currentView) {
            case 'sectors':
                this.loadSectorHeatmap();
                break;
            case 'stocks':
                if (this.currentSector) {
                    this.loadSectorStocksHeatmap(this.currentSector);
                }
                break;
            case 'all':
                this.loadAllStocksHeatmap();
                break;
        }
    }
    
    /**
     * Destroy the heatmap instance
     */
    destroy() {
        if (this.chart) {
            this.chart.destroy();
        }
        
        // Remove styles
        const style = document.getElementById('sectorial-heatmap-styles');
        if (style) {
            style.remove();
        }
    }
}

// Export for global use
window.SectorialHeatmap = SectorialHeatmap;

// Auto-initialize if container exists
document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on the sectorial flow page
    if (document.getElementById('sectorial_heatmap_container')) {
        window.sectorialHeatmap = new SectorialHeatmap('sectorial_heatmap_container');
    }
});