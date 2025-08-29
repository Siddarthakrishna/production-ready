// Chart module for handling all chart rendering
class ChartManager {
    constructor() {
        const DEFAULTS = {
            CHART: {
                TOOLBAR: { show: true },
                COLORS: {
                    UP: '#00C853',
                    DOWN: '#D50000',
                    TEXT: '#E0E0E0',
                    TEXT_SECONDARY: '#BDBDBD',
                    BORDER: '#424242',
                    GRID: '#2E2E2E',
                    PORTFOLIO: ['#1f77b4','#ff7f0e','#2ca02c','#d62728','#9467bd','#8c564b','#e377c2','#7f7f7f','#bcbd22','#17becf']
                },
                PERIODS: { '1w': '1W', '1m': '1M', '3m': '3M', '1y': '1Y', 'max': 'Max' }
            }
        };
        this.APP = Object.assign({}, DEFAULTS, window.APP_CONFIG || {});
        this.charts = new Map();
        this.defaultOptions = {
            chart: {
                type: 'candlestick',
                height: 400,
                background: 'transparent',
                toolbar: this.APP.CHART.TOOLBAR,
                animations: { enabled: true, easing: 'easeinout', speed: 800, animateGradually: { enabled: true, delay: 150 }, dynamicAnimation: { enabled: true, speed: 350 } },
                zoom: { enabled: true, type: 'x', autoScaleYaxis: true },
            },
            plotOptions: {
                candlestick: {
                    colors: { upward: this.APP.CHART.COLORS.UP, downward: this.APP.CHART.COLORS.DOWN },
                    wick: { useFillColor: true }
                },
                bar: { borderRadius: 2, columnWidth: '80%', dataLabels: { position: 'center' } },
                pie: { donut: { size: '50%', labels: { show: true, name: { show: true, fontSize: '14px', fontFamily: 'inherit', color: this.APP.CHART.COLORS.TEXT, offsetY: -10 }, value: { show: true, fontSize: '16px', fontFamily: 'inherit', color: this.APP.CHART.COLORS.TEXT, offsetY: 5, formatter: function(val){ return window.utils.formatCurrency(val); } }, total: { show: true, showAlways: false, label: 'Total', color: this.APP.CHART.COLORS.TEXT, formatter: function(w){ return w.globals.seriesTotals.reduce((a,b)=>a+b,0).toFixed(2);} } } }, customScale: 1 }
            },
            xaxis: { type: 'datetime', labels: { datetimeUTC: false, style: { colors: this.APP.CHART.COLORS.TEXT_SECONDARY, fontSize: '12px' } }, axisTicks: { show: true, color: this.APP.CHART.COLORS.BORDER }, axisBorder: { show: true, color: this.APP.CHART.COLORS.BORDER }, tooltip: { enabled: false } },
            yaxis: { tooltip: { enabled: true }, labels: { formatter: function(value){ return window.utils.formatCurrency(value); }, style: { colors: [this.APP.CHART.COLORS.TEXT_SECONDARY], fontSize: '12px' } } },
            tooltip: { enabled: true, theme: 'dark', x: { show: true, format: 'dd MMM yyyy HH:mm' }, y: { formatter: function(value){ return window.utils.formatCurrency(value); }, title: { formatter: function(seriesName){ return seriesName; } } }, marker: { show: true }, fixed: { enabled: false, position: 'topRight', offsetX: 0, offsetY: 30 } },
            grid: { show: true, borderColor: this.APP.CHART.COLORS.GRID, strokeDashArray: 4, position: 'back', xaxis: { lines: { show: true } }, yaxis: { lines: { show: true } }, padding: { top: 0, right: 10, bottom: 0, left: 10 } },
            stroke: { show: true, curve: 'smooth', lineCap: 'butt', colors: undefined, width: 2, dashArray: 0 },
            fill: { opacity: 1, type: 'solid' },
            legend: { position: 'top', horizontalAlign: 'right', offsetY: -10, itemMargin: { horizontal: 10, vertical: 5 }, markers: { width: 8, height: 8, radius: 4, offsetX: -4, offsetY: 0 }, onItemClick: { toggleDataSeries: true }, onItemHover: { highlightDataSeries: true } },
            dataLabels: { enabled: false },
            markers: { size: 4, strokeWidth: 2, fillOpacity: 1, hover: { size: 6, sizeOffset: 2 } },
            noData: { text: 'Loading...', align: 'center', verticalAlign: 'middle', style: { color: this.APP.CHART.COLORS.TEXT, fontSize: '14px', fontFamily: 'inherit' } }
        };
    }

    createChart(elementId, options = {}) {
        if (this.charts.has(elementId)) {
            return this.updateChart(elementId, options);
        }
        const element = document.getElementById(elementId);
        if (!element) { console.error(`Element with id ${elementId} not found`); return null; }
        const chartOptions = this._mergeOptions(options);
        const chart = new ApexCharts(element, chartOptions);
        this.charts.set(elementId, chart);
        chart.render();
        return chart;
    }

    updateChart(elementId, options = {}) {
        if (!this.charts.has(elementId)) {
            return this.createChart(elementId, options);
        }
        const chart = this.charts.get(elementId);
        const chartOptions = this._mergeOptions(options);
        chart.updateOptions(chartOptions);
        return chart;
    }

    renderStockChart(elementId, data, options = {}) {
        const defaultOptions = {
            chart: { type: 'candlestick', height: 400, animations: { enabled: true }, toolbar: { show: true, tools: { download: true, selection: true, zoom: true, zoomin: true, zoomout: true, pan: true, reset: true }, autoSelected: 'zoom' } },
            series: [{ name: 'Candlestick', data: data.map(item => ({ x: new Date(item.date).getTime(), y: [item.open, item.high, item.low, item.close] })) }],
            title: { text: options.title || 'Stock Price', align: 'left', style: { fontSize: '16px', fontWeight: 'bold', color: (this.APP.CHART.COLORS.TEXT) } },
            xaxis: { type: 'datetime', labels: { datetimeUTC: false, style: { colors: this.APP.CHART.COLORS.TEXT_SECONDARY, fontSize: '12px' } } },
            yaxis: { tooltip: { enabled: true }, labels: { formatter: function(value){ return window.utils.formatCurrency(value); }, style: { colors: [this.APP.CHART.COLORS.TEXT_SECONDARY], fontSize: '12px' } } },
            tooltip: { enabled: true, theme: 'dark', x: { format: 'dd MMM yyyy HH:mm' }, y: { formatter: function(_value, { w, seriesIndex, dataPointIndex }) { const d = w.config.series[seriesIndex].data[dataPointIndex]; return [`Open: ${window.utils.formatCurrency(d.y[0])}`,`High: ${window.utils.formatCurrency(d.y[1])}`,`Low: ${window.utils.formatCurrency(d.y[2])}`,`Close: ${window.utils.formatCurrency(d.y[3])}`].join('<br>'); } } },
            plotOptions: { candlestick: { colors: { upward: this.APP.CHART.COLORS.UP, downward: this.APP.CHART.COLORS.DOWN }, wick: { useFillColor: true } } },
            annotations: { position: 'back', yaxis: [] },
            responsive: [{ breakpoint: 600, options: { chart: { height: 300 }, title: { style: { fontSize: '14px' } } } }]
        };
        const chartOptions = this._deepMerge(defaultOptions, options);
        if (this.charts.has(elementId)) { return this.updateChart(elementId, chartOptions); } else { return this.createChart(elementId, chartOptions); }
    }

    renderPortfolioAllocation(elementId, data, options = {}) {
        const defaultOptions = {
            chart: { type: 'donut', height: 400, animations: { enabled: true }, toolbar: { show: false } },
            series: data.map(item => item.value),
            labels: data.map(item => item.label),
            colors: options.colors || this.APP.CHART.COLORS.PORTFOLIO,
            legend: { position: 'right', horizontalAlign: 'center', itemMargin: { horizontal: 8, vertical: 4 } },
            plotOptions: { pie: { donut: { size: '50%', labels: { show: true, name: { show: true, fontSize: '14px', fontFamily: 'inherit', color: this.APP.CHART.COLORS.TEXT, offsetY: -10 }, value: { show: true, fontSize: '16px', fontFamily: 'inherit', color: this.APP.CHART.COLORS.TEXT, offsetY: 5, formatter: function(val){ return window.utils.formatCurrency(val); } }, total: { show: true, showAlways: true, label: 'Total', color: this.APP.CHART.COLORS.TEXT, formatter: function(w){ return w.globals.seriesTotals.reduce((a,b)=>a+b,0).toFixed(2);} } } } } },
            tooltip: { y: { formatter: function(value, { w }) { const total = w.globals.seriesTotals.reduce((a,b)=>a+b,0); const pct = ((value/total)*100).toFixed(2); return `${window.utils.formatCurrency(value)} (${pct}%)`; } } },
            dataLabels: { enabled: false },
            responsive: [{ breakpoint: 768, options: { chart: { height: 350 }, legend: { position: 'bottom' } } }]
        };
        const chartOptions = this._deepMerge(defaultOptions, options);
        if (this.charts.has(elementId)) { return this.updateChart(elementId, chartOptions); } else { return this.createChart(elementId, chartOptions); }
    }

    destroyChart(elementId) { if (this.charts.has(elementId)) { this.charts.get(elementId).destroy(); this.charts.delete(elementId); return true; } return false; }
    destroyAllCharts() { this.charts.forEach((c)=>c.destroy()); this.charts.clear(); }

    _mergeOptions(options){ return this._deepMerge({}, this.defaultOptions, options); }
    _deepMerge(target, ...sources){ if(!sources.length) return target; const source = sources.shift(); if(this._isObject(target) && this._isObject(source)){ for(const key in source){ if(this._isObject(source[key])){ if(!target[key]) Object.assign(target, { [key]: {} }); this._deepMerge(target[key], source[key]); } else { Object.assign(target, { [key]: source[key] }); } } } return this._deepMerge(target, ...sources); }
    _isObject(item){ return (item && typeof item === 'object' && !Array.isArray(item)); }
}

const chartManager = new ChartManager();
window.chartManager = chartManager;
export default chartManager;
