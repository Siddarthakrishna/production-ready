/**
 * Index Analysis.js - Unified Param System Implementation
 * 
 * This file uses the unified param format:
 * - Symbol: Stock/Index identifier
 * - param_0: Index value/price - used for price visualization
 * - param_1: Previous Close Price
 * - param_2: % Change from previous close - used for heatmap coloring
 * - param_3: Volatility/momentum indicator
 * - param_4: DateTime (YYYY-MM-DD HH:mm:ss)
 * 
 * Index charts use param_0 for price bars, heatmaps use param_2 for color scale.
 */

route = "http://localhost:8000/api/index"
legacy_route = "http://localhost:8000/api/index_analysis"

// Enhanced global variables for all supported indices with Highcharts
const SUPPORTED_INDICES = {
    'NIFTY50': { display_name: 'NIFTY 50', api_name: 'NIFTY50', legacy_name: 'NIFTY 50' },
    'BANKNIFTY': { display_name: 'BANK NIFTY', api_name: 'BANKNIFTY', legacy_name: 'NIFTY BANK' },
    'FINNIFTY': { display_name: 'FIN NIFTY', api_name: 'FINNIFTY', legacy_name: 'NIFTY FIN SERVICE' },
    'MIDCAP': { display_name: 'NIFTY MIDCAP 50', api_name: 'MIDCAP', legacy_name: 'NIFTY MID SELECT' },
    'SENSEX': { display_name: 'BSE SENSEX', api_name: 'SENSEX', legacy_name: 'SENSEX' }
};

let currentIndex = 'NIFTY50';
let professionalCandlestickChart = null;  // Highcharts.stockChart instance
let professionalHeatmapChart = null;      // ApexCharts treemap (keeping for heatmap)
let currentTimeframe = '1d';
let sentimentDialData = {};
let pcrIndicatorData = {};

// Legacy variables
let Expiry_data;
let Live_OI_data;
let Index_OI_Change_data;
let ts2;
let ts1;
let Nifty_exp_1;
let Nifty_exp_2;

// Professional chart rendering with Highcharts.stockChart
const renderProfessionalCandlestickChart = (ohlcData, indexName) => {
    if (!ohlcData || !ohlcData.data || ohlcData.data.length === 0) {
        console.warn('No OHLC data available for chart rendering');
        return;
    }
    
    // Process data for Highcharts format
    const chartData = ohlcData.data.map(item => [
        new Date(item.timestamp).getTime(),
        item.open,
        item.high,
        item.low,
        item.close
    ]);
    
    const volumeData = ohlcData.data.map(item => ({
        x: new Date(item.timestamp).getTime(),
        y: item.volume,
        color: getVolumeColor(item.volume)
    }));

    // Professional Highcharts.stockChart configuration
    const chartConfig = {
        rangeSelector: {
            enabled: true,
            buttons: [{
                type: 'hour',
                count: 1,
                text: '1h'
            }, {
                type: 'day',
                count: 1,
                text: '1d'
            }, {
                type: 'week',
                count: 1,
                text: '1w'
            }, {
                type: 'month',
                count: 1,
                text: '1m'
            }, {
                type: 'all',
                text: 'All'
            }],
            selected: 1,
            inputEnabled: true
        },
        navigator: {
            enabled: true,
            height: 50
        },
        scrollbar: {
            enabled: true
        },
        chart: {
            backgroundColor: 'transparent',
            height: 600
        },
        title: {
            text: `${indexName} Professional Analysis`,
            style: {
                color: '#fff',
                fontSize: '18px',
                fontWeight: 'bold'
            }
        },
        xAxis: {
            type: 'datetime',
            labels: {
                style: {
                    color: '#fff'
                }
            },
            gridLineColor: '#333'
        },
        yAxis: [{
            labels: {
                align: 'right',
                x: -3,
                style: {
                    color: '#fff'
                }
            },
            title: {
                text: 'Price',
                style: {
                    color: '#fff'
                }
            },
            height: '75%',
            lineWidth: 1,
            gridLineColor: '#333'
        }, {
            labels: {
                align: 'right',
                x: -3,
                style: {
                    color: '#fff'
                }
            },
            title: {
                text: 'Volume',
                style: {
                    color: '#fff'
                }
            },
            top: '80%',
            height: '20%',
            offset: 0,
            lineWidth: 1,
            gridLineColor: '#333'
        }],
        legend: {
            enabled: true,
            itemStyle: {
                color: '#fff'
            }
        },
        plotOptions: {
            candlestick: {
                upColor: '#00d3c0',
                color: '#ff5253',
                upLineColor: '#00d3c0',
                lineColor: '#ff5253',
                tooltip: {
                    pointFormat: '<span style="color:{point.color}">\u25CF</span> <b>{series.name}</b><br/>' +
                        'Open: {point.open}<br/>' +
                        'High: {point.high}<br/>' +
                        'Low: {point.low}<br/>' +
                        'Close: {point.close}<br/>'
                }
            },
            column: {
                pointPadding: 0.2,
                borderWidth: 0
            }
        },
        tooltip: {
            split: true,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            style: {
                color: '#fff'
            }
        },
        series: [{
            type: 'candlestick',
            name: indexName,
            data: chartData,
            dataGrouping: {
                enabled: false
            }
        }, {
            type: 'column',
            name: 'Volume',
            data: volumeData,
            yAxis: 1,
            dataGrouping: {
                enabled: false
            }
        }]
    };

    // Create or update the professional chart
    if (professionalCandlestickChart) {
        professionalCandlestickChart.destroy();
    }
    
    professionalCandlestickChart = Highcharts.stockChart('candlestick_chart', chartConfig);
};

// Professional sentiment and PCR integration with MoneyFlux APIs
const fetchProfessionalTradingIndicators = async (indexName) => {
  try {
    // Use MoneyFlux API endpoints for professional trading data
    const moneyfluxApiBase = 'http://localhost:8000/api/moneyflux';
    
    // Fetch sentiment data
    const sentimentResponse = await fetch(`${moneyfluxApiBase}/sentiment?index=${indexName}`);
    const sentimentData = await sentimentResponse.json();
    
    // Fetch PCR data
    const pcrResponse = await fetch(`${moneyfluxApiBase}/pcr?index=${indexName}`);
    const pcrData = await pcrResponse.json();
    
    // Update sentiment dial
    updateIndexAnalysisSentimentDial(sentimentData);
    
    // Update PCR dial
    updateIndexAnalysisPCRDial(pcrData);
    
    // Update professional metrics display
    updateProfessionalMetricsDisplay(sentimentData, pcrData);
    
  } catch (error) {
    console.error('Professional trading indicators fetch error:', error);
    // Set default neutral states
    updateIndexAnalysisSentimentDial({ sentimentScore: 0, sentimentDirection: 'neutral' });
    updateIndexAnalysisPCRDial({ pcrRatio: 1.0, pcrChange: 0 });
  }
};

// Update sentiment dial for Index Analysis
const updateIndexAnalysisSentimentDial = (sentimentData) => {
  const sentimentScore = sentimentData.sentimentScore || 0;
  const direction = sentimentData.sentimentDirection || 'neutral';
  
  // Update sentiment dial colors and position
  const sentimentColorElement = document.getElementById('sentiment_dial_Color');
  const sentimentArrowElement = document.getElementById('sentiment_dial_Arrow');
  
  if (sentimentColorElement && sentimentArrowElement) {
    // Remove existing classes
    sentimentColorElement.className = 'semicircle-G5piCoZi';
    sentimentArrowElement.className = 'arrow-G5piCoZi';
    
    // Apply new classes based on sentiment direction
    if (direction === 'bullish') {
      sentimentColorElement.classList.add('semicircleBuy-G5piCoZi');
      sentimentArrowElement.classList.add('arrowBuy-G5piCoZi', 'arrowShudderBuy-G5piCoZi');
    } else if (direction === 'bearish') {
      sentimentColorElement.classList.add('semicircleSell-G5piCoZi');
      sentimentArrowElement.classList.add('arrowSell-G5piCoZi', 'arrowShudderSell-G5piCoZi');
    } else {
      sentimentColorElement.classList.add('semicircleNeutral-G5piCoZi');
      sentimentArrowElement.classList.add('arrowNeutral-G5piCoZi', 'arrowShudderNeutral-G5piCoZi');
    }
  }
  
  // Update sentiment score display
  const scoreDisplay = document.getElementById('sentiment_score_display');
  if (scoreDisplay) {
    scoreDisplay.textContent = sentimentScore.toFixed(2);
  }
};

// Update PCR dial for Index Analysis
const updateIndexAnalysisPCRDial = (pcrData) => {
  const pcrRatio = pcrData.pcrRatio || 1.0;
  const pcrChange = pcrData.pcrChange || 0;
  
  // Update PCR dial colors and position
  const pcrColorElement = document.getElementById('PCM_Color');
  const pcrArrowElement = document.getElementById('PCM_Arrow');
  
  if (pcrColorElement && pcrArrowElement) {
    // Remove existing classes
    pcrColorElement.className = 'semicircle-G5piCoZi';
    pcrArrowElement.className = 'arrow-G5piCoZi';
    
    // Apply new classes based on PCR ratio
    if (pcrRatio > 1.2) {
      pcrColorElement.classList.add('semicircleBuy-G5piCoZi');
      pcrArrowElement.classList.add('arrowBuy-G5piCoZi', 'arrowShudderBuy-G5piCoZi');
    } else if (pcrRatio < 0.8) {
      pcrColorElement.classList.add('semicircleSell-G5piCoZi');
      pcrArrowElement.classList.add('arrowSell-G5piCoZi', 'arrowShudderSell-G5piCoZi');
    } else {
      pcrColorElement.classList.add('semicircleNeutral-G5piCoZi');
      pcrArrowElement.classList.add('arrowNeutral-G5piCoZi', 'arrowShudderNeutral-G5piCoZi');
    }
  }
  
  // Update PCR ratio display
  const ratioDisplay = document.getElementById('pcr_ratio_display');
  if (ratioDisplay) {
    ratioDisplay.textContent = pcrRatio.toFixed(2);
  }
};

// Update professional metrics display
const updateProfessionalMetricsDisplay = (sentimentData, pcrData) => {
  // Update Call/Put OI displays
  const callOIDisplay = document.getElementById('call_oi_display');
  const putOIDisplay = document.getElementById('put_oi_display');
  
  if (callOIDisplay && pcrData.callOI !== undefined) {
    callOIDisplay.textContent = formatNumber(pcrData.callOI);
  }
  if (putOIDisplay && pcrData.putOI !== undefined) {
    putOIDisplay.textContent = formatNumber(pcrData.putOI);
  }
  
  // Update Call/Put Volume displays
  const callVolumeDisplay = document.getElementById('call_volume_display');
  const putVolumeDisplay = document.getElementById('put_volume_display');
  
  if (callVolumeDisplay && pcrData.callVolume !== undefined) {
    callVolumeDisplay.textContent = formatNumber(pcrData.callVolume);
  }
  if (putVolumeDisplay && pcrData.putVolume !== undefined) {
    putVolumeDisplay.textContent = formatNumber(pcrData.putVolume);
  }
};

// Format large numbers for display
const formatNumber = (num) => {
  if (num === null || num === undefined) return '-';
  if (num >= 10000000) {
    return (num / 10000000).toFixed(1) + 'Cr';
  } else if (num >= 100000) {
    return (num / 100000).toFixed(1) + 'L';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

// Enhanced volume color logic matching MoneyFlux
const getVolumeColor = (volume) => {
    if (!volume) return '#f0f0f0';
    
    // Use static comparison for consistent coloring
    const avgVolume = 1000000; // This should come from API in real implementation
    
    if (volume > avgVolume * 1.5) {
        return '#0DAD8D';  // High volume - bright green
    } else if (volume > avgVolume) {
        return '#ace0d8';  // Above average - light green
    } else if (volume < avgVolume * 0.5) {
        return '#F15B46';  // Low volume - red
    } else {
        return '#e9c0bb';  // Below average - light red
    }
};

// Enhanced professional index switching
const switchIndexProfessional = async (newIndex) => {
    try {
        // Update current index
        currentIndex = newIndex;
        
        // Update active button styling
        document.querySelectorAll('.go_btn').forEach(btn => btn.classList.remove('gb_active'));
        
        // Add active class to selected button
        const buttonMap = {
            'NIFTY50': 'nifty_btn',
            'BANKNIFTY': 'bnknifty_btn', 
            'FINNIFTY': 'finnifty_btn',
            'MIDCAP': 'midcap_btn',
            'SENSEX': 'sensex_btn'
        };
        
        const activeButtonId = buttonMap[newIndex];
        if (activeButtonId) {
            document.getElementById(activeButtonId)?.classList.add('gb_active');
        }
        
        // Update all charts and indicators
        await updateAllIndexAnalysisCharts(newIndex);
        
        // Update professional trading indicators
        await fetchProfessionalTradingIndicators(newIndex);
        
        console.log(`Switched to professional index analysis: ${newIndex}`);
        
    } catch (error) {
        console.error('Professional index switching error:', error);
    }
};

// Enhanced chart update functions
const updateAllIndexAnalysisCharts = async (indexName) => {
    try {
        // Fetch OHLC data
        const ohlcUrl = `${route}/${indexName}/ohlc?timeframe=${currentTimeframe}&limit=100`;
        const ohlcResponse = await fetch(ohlcUrl);
        const ohlcData = await ohlcResponse.json();
        
        // Render professional candlestick chart
        if (ohlcData && ohlcData.data) {
            renderProfessionalCandlestickChart(ohlcData, SUPPORTED_INDICES[indexName]?.display_name || indexName);
        }
        
        // Fetch and render heatmap
        const heatmapUrl = `${route}/${indexName}/heatmap`;
        const heatmapResponse = await fetch(heatmapUrl);
        const heatmapData = await heatmapResponse.json();
        
        if (heatmapData) {
            renderProfessionalHeatmapChart(heatmapData, SUPPORTED_INDICES[indexName]?.display_name || indexName);
        }
        
    } catch (error) {
        console.error('Chart update error:', error);
    }
};

// Enhanced heatmap rendering (keeping ApexCharts for treemap)
const renderProfessionalHeatmapChart = (heatmapData, indexName) => {
    if (!heatmapData || !heatmapData.constituents || heatmapData.constituents.length === 0) {
        console.warn('No heatmap data available');
        return;
    }
    
    // Process data for treemap format
    const data = heatmapData.constituents.map((stock) => ({
        x: stock.symbol,
        y: stock.heatScore || 0,
        symbol: stock.symbol,
        price: stock.price,
        priceChange: stock.priceChange,
        priceChangePercent: stock.priceChangePercent,
        volume: stock.volume,
        marketCap: stock.marketCap
    }));

    const options = {
        series: [{
            name: 'Heat Score',
            data: data
        }],
        chart: {
            height: 500,
            type: 'treemap',
            background: 'transparent',
            toolbar: {
                show: true,
                tools: {
                    download: true,
                    selection: true,
                    zoom: true,
                    zoomin: true,
                    zoomout: true,
                    pan: true,
                    reset: true
                }
            }
        },
        title: {
            text: `${indexName} Professional Heatmap`,
            style: {
                color: '#fff',
                fontSize: '18px',
                fontWeight: 'bold'
            }
        },
        theme: {
            mode: 'dark'
        },
        plotOptions: {
            treemap: {
                enableShades: true,
                shadeIntensity: 0.5,
                reverseNegativeShade: true,
                useFillColorAsStroke: true,
                colorScale: {
                    ranges: [{
                        from: -25,
                        to: -5,
                        color: '#ff5253'
                    }, {
                        from: -5,
                        to: -1,
                        color: '#ffab00'
                    }, {
                        from: -1,
                        to: 1,
                        color: '#69d40e'
                    }, {
                        from: 1,
                        to: 5,
                        color: '#00d3c0'
                    }, {
                        from: 5,
                        to: 25,
                        color: '#0DAD8D'
                    }]
                }
            }
        },
        tooltip: {
            theme: 'dark',
            custom: function({ series, seriesIndex, dataPointIndex, w }) {
                const data = w.globals.initialSeries[seriesIndex].data[dataPointIndex];
                return `<div class="arrow_box" style="background: rgba(0,0,0,0.85); color: #fff; padding: 10px; border-radius: 5px;">
                    <span><strong>${data.symbol}</strong></span><br/>
                    <span>Price: ₹${data.price?.toFixed(2) || 'N/A'}</span><br/>
                    <span>Change: ${data.priceChangePercent?.toFixed(2) || 'N/A'}%</span><br/>
                    <span>Volume: ${data.volume?.toLocaleString() || 'N/A'}</span><br/>
                    <span>Market Cap: ₹${(data.marketCap / 10000000)?.toFixed(0) || 'N/A'} Cr</span>
                </div>`;
            }
        }
    };

    if (professionalHeatmapChart) {
        professionalHeatmapChart.destroy();
    }
    professionalHeatmapChart = new ApexCharts(document.querySelector('#heatmap_chart'), options);
    professionalHeatmapChart.render();
};

// Professional sentiment dial implementation
const renderSentimentDial = (sentimentData) => {
    const sentimentScore = sentimentData.sentimentScore || 0;
    const direction = sentimentData.sentimentDirection || 'neutral';
    
    // Update sentiment dial similar to MoneyFlux
    const sentimentColorElement = document.getElementById('sentiment_dial_Color');
    const sentimentArrowElement = document.getElementById('sentiment_dial_Arrow');
    
    if (sentimentColorElement && sentimentArrowElement) {
        // Remove existing classes
        sentimentColorElement.className = 'semicircle-G5piCoZi';
        sentimentArrowElement.className = 'arrow-G5piCoZi';
        
        // Apply classes based on sentiment
        if (direction === 'bullish') {
            sentimentColorElement.classList.add('semicircleBuy-G5piCoZi');
            sentimentArrowElement.classList.add('arrowBuy-G5piCoZi', 'arrowShudderBuy-G5piCoZi');
        } else if (direction === 'bearish') {
            sentimentColorElement.classList.add('semicircleSell-G5piCoZi');
            sentimentArrowElement.classList.add('arrowSell-G5piCoZi', 'arrowShudderSell-G5piCoZi');
        } else {
            sentimentColorElement.classList.add('semicircleNeutral-G5piCoZi');
            sentimentArrowElement.classList.add('arrowNeutral-G5piCoZi', 'arrowShudderNeutral-G5piCoZi');
        }
    }
};

// Professional PCR indicator implementation
const renderPCRIndicator = (pcrData) => {
    const pcrRatio = pcrData.pcrRatio || 1.0;
    const pcrChange = pcrData.pcrChange || 0;
    
    // Update PCR dial similar to MoneyFlux
    const pcrColorElement = document.getElementById('PCM_Color');
    const pcrArrowElement = document.getElementById('PCM_Arrow');
    
    if (pcrColorElement && pcrArrowElement) {
        // Remove existing classes
        pcrColorElement.className = 'semicircle-G5piCoZi';
        pcrArrowElement.className = 'arrow-G5piCoZi';
        
        // Apply classes based on PCR ratio
        if (pcrRatio > 1.2) {
            pcrColorElement.classList.add('semicircleBuy-G5piCoZi');
            pcrArrowElement.classList.add('arrowBuy-G5piCoZi', 'arrowShudderBuy-G5piCoZi');
        } else if (pcrRatio < 0.8) {
            pcrColorElement.classList.add('semicircleSell-G5piCoZi');
            pcrArrowElement.classList.add('arrowSell-G5piCoZi', 'arrowShudderSell-G5piCoZi');
        } else {
            pcrColorElement.classList.add('semicircleNeutral-G5piCoZi');
            pcrArrowElement.classList.add('arrowNeutral-G5piCoZi', 'arrowShudderNeutral-G5piCoZi');
        }
    }
};



// Professional real-time refresh system with multiple intervals
let realTimeIntervals = {
    main: null,           // Main data refresh every 3 minutes
    sentiment: null,      // Sentiment analysis every 30 seconds
    pcr: null,           // PCR analysis every 45 seconds
    heatmap: null,       // Heatmap refresh every 60 seconds
    volume: null,        // Volume analysis every 90 seconds
    chart: null          // Chart data every 2 minutes
};

const startProfessionalRealTimeUpdates = (indexKey) => {
    console.log(`Starting professional real-time updates for ${indexKey}`);
    
    // Clear any existing intervals
    stopAllRealTimeUpdates();
    
    const indexInfo = SUPPORTED_INDICES[indexKey];
    if (!indexInfo) return;
    
    // Main data refresh every 3 minutes (like MoneyFlux)
    realTimeIntervals.main = setInterval(async () => {
        try {
            await loadComprehensiveAnalysis(indexInfo.api_name);
            console.log('Main data refreshed');
        } catch (error) {
            console.error('Main data refresh error:', error);
        }
    }, 180000); // 3 minutes
    
    // Sentiment analysis every 30 seconds
    realTimeIntervals.sentiment = setInterval(async () => {
        try {
            const sentimentData = await getSentimentAnalysis(indexInfo.api_name);
            renderSentimentDial(sentimentData);
            updateSentimentDisplay(sentimentData);
            console.log('Sentiment data refreshed');
        } catch (error) {
            console.error('Sentiment refresh error:', error);
        }
    }, 30000); // 30 seconds
    
    // PCR analysis every 45 seconds
    realTimeIntervals.pcr = setInterval(async () => {
        try {
            const pcrData = await getPCRAnalysis(indexInfo.api_name);
            renderPCRIndicator(pcrData);
            updatePCRDisplay(pcrData);
            console.log('PCR data refreshed');
        } catch (error) {
            console.error('PCR refresh error:', error);
        }
    }, 45000); // 45 seconds
    
    // Heatmap refresh every 60 seconds (like MoneyFlux)
    realTimeIntervals.heatmap = setInterval(async () => {
        try {
            const heatmapData = await getIndexHeatmap(indexInfo.api_name);
            renderProfessionalHeatmapChart(heatmapData, indexInfo.display_name);
            console.log('Heatmap data refreshed');
        } catch (error) {
            console.error('Heatmap refresh error:', error);
        }
    }, 60000); // 60 seconds
    
    // Volume analysis every 90 seconds
    realTimeIntervals.volume = setInterval(async () => {
        try {
            const volumeData = await getIndexVolumeAnalysis(indexInfo.api_name);
            updateVolumeAnalysis(volumeData);
            console.log('Volume data refreshed');
        } catch (error) {
            console.error('Volume refresh error:', error);
        }
    }, 90000); // 90 seconds
    
    // Chart data every 2 minutes
    realTimeIntervals.chart = setInterval(async () => {
        try {
            const ohlcData = await getIndexOHLC(indexInfo.api_name, currentTimeframe);
            renderProfessionalCandlestickChart(ohlcData, indexInfo.display_name);
            console.log('Chart data refreshed');
        } catch (error) {
            console.error('Chart refresh error:', error);
        }
    }, 120000); // 2 minutes
    
    console.log('All real-time intervals started successfully');
};

const stopAllRealTimeUpdates = () => {
    Object.keys(realTimeIntervals).forEach(key => {
        if (realTimeIntervals[key]) {
            clearInterval(realTimeIntervals[key]);
            realTimeIntervals[key] = null;
        }
    });
    console.log('All real-time intervals stopped');
};

// Enhanced API functions for professional trading features
const getSentimentAnalysis = async (indexName) => {
    try {
        // This would connect to the enhanced backend sentiment API
        // For now, return mock data structure
        return {
            index: indexName,
            sentimentScore: Math.random() * 4 - 2, // -2 to +2 range
            sentimentDirection: ['bullish', 'bearish', 'neutral'][Math.floor(Math.random() * 3)],
            calculatedAt: new Date().toISOString(),
            volumeRatio: Math.random() * 2,
            priceAction: (Math.random() - 0.5) * 10
        };
    } catch (error) {
        console.error('Error fetching sentiment analysis:', error);
        return {
            index: indexName,
            sentimentScore: 0,
            sentimentDirection: 'neutral',
            calculatedAt: new Date().toISOString(),
            volumeRatio: 1,
            priceAction: 0
        };
    }
};

const getPCRAnalysis = async (indexName) => {
    try {
        // This would connect to the enhanced backend PCR API
        // For now, return mock data structure
        return {
            index: indexName,
            pcrRatio: 0.8 + Math.random() * 0.8, // 0.8 to 1.6 range
            pcrChange: (Math.random() - 0.5) * 10,
            putOI: Math.floor(Math.random() * 1000000),
            callOI: Math.floor(Math.random() * 1000000),
            putVolume: Math.floor(Math.random() * 500000),
            callVolume: Math.floor(Math.random() * 500000),
            calculatedAt: new Date().toISOString()
        };
    } catch (error) {
        console.error('Error fetching PCR analysis:', error);
        return {
            index: indexName,
            pcrRatio: 1.0,
            pcrChange: 0,
            putOI: 0,
            callOI: 0,
            putVolume: 0,
            callVolume: 0,
            calculatedAt: new Date().toISOString()
        };
    }
};

// Display update functions
const updateSentimentDisplay = (sentimentData) => {
    const scoreElement = document.getElementById('sentiment_score_display');
    if (scoreElement) {
        scoreElement.textContent = (sentimentData.sentimentScore || 0).toFixed(2);
        
        // Color coding based on sentiment
        scoreElement.className = 'h5';
        if (sentimentData.sentimentDirection === 'bullish') {
            scoreElement.classList.add('text-success');
        } else if (sentimentData.sentimentDirection === 'bearish') {
            scoreElement.classList.add('text-danger');
        } else {
            scoreElement.classList.add('text-muted');
        }
    }
};

const updatePCRDisplay = (pcrData) => {
    // Update PCR ratio display
    const pcrRatioElement = document.getElementById('pcr_ratio_display');
    if (pcrRatioElement) {
        pcrRatioElement.textContent = (pcrData.pcrRatio || 1.0).toFixed(2);
        
        // Color coding based on PCR ratio
        pcrRatioElement.className = 'h5';
        if (pcrData.pcrRatio > 1.2) {
            pcrRatioElement.classList.add('text-success');
        } else if (pcrData.pcrRatio < 0.8) {
            pcrRatioElement.classList.add('text-danger');
        } else {
            pcrRatioElement.classList.add('text-warning');
        }
    }
    
    // Update detailed metrics
    const updateElement = (id, value, isVolume = false) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = isVolume ? 
                (value || 0).toLocaleString() : 
                (value || 0).toFixed(0);
        }
    };
    
    updateElement('call_oi_display', pcrData.callOI);
    updateElement('put_oi_display', pcrData.putOI);
    updateElement('call_volume_display', pcrData.callVolume, true);
    updateElement('put_volume_display', pcrData.putVolume, true);
    
    const pcrChangeElement = document.getElementById('pcr_change_display');
    if (pcrChangeElement && pcrData.pcrChange !== undefined) {
        const changeText = `${pcrData.pcrChange > 0 ? '+' : ''}${pcrData.pcrChange.toFixed(2)}%`;
        pcrChangeElement.textContent = changeText;
        pcrChangeElement.className = 'h5';
        
        if (pcrData.pcrChange > 0) {
            pcrChangeElement.classList.add('text-success');
        } else if (pcrData.pcrChange < 0) {
            pcrChangeElement.classList.add('text-danger');
        } else {
            pcrChangeElement.classList.add('text-muted');
        }
    }
};

// Enhanced timeframe switching with professional aggregation
// Enhanced timeframe switching
const switchTimeframe = async (timeframe) => {
    currentTimeframe = timeframe;
    
    // Update UI
    const timeframeSelector = document.getElementById('timeframe_selector');
    if (timeframeSelector) {
        timeframeSelector.value = timeframe;
    }
    
    // Reload chart with new timeframe
    const indexInfo = SUPPORTED_INDICES[currentIndex];
    if (indexInfo) {
        try {
            const ohlcData = await getIndexOHLC(indexInfo.api_name, timeframe);
            renderProfessionalCandlestickChart(ohlcData, indexInfo.display_name);
        } catch (error) {
            console.error('Error switching timeframe:', error);
        }
    }
};


const getIndexOHLC = async (indexName, timeframe = '1d', limit = 100) => {
    try {
        const response = await fetch(`${route}/${indexName}/ohlc?timeframe=${timeframe}&limit=${limit}`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching OHLC data:', error);
        return { index: indexName, timeframe: timeframe, data: [] };
    }
};

const getIndexHeatmap = async (indexName) => {
    try {
        const response = await fetch(`${route}/${indexName}/heatmap`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching heatmap data:', error);
        return { index: indexName, constituents: [], lastUpdated: null };
    }
};

const getIndexVolumeAnalysis = async (indexName) => {
    try {
        const response = await fetch(`${route}/${indexName}/volume`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching volume analysis:', error);
        return { index: indexName, currentVolume: null, averageVolume: null, volumeChange: null, volumeRatio: null };
    }
};

const getComprehensiveAnalysis = async (indexName) => {
    try {
        const response = await fetch(`${route}/${indexName}/comprehensive`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching comprehensive analysis:', error);
        return null;
    }
};

// Enhanced chart rendering functions
const renderCandlestickChart = (ohlcData, indexName) => {
    const chartData = ohlcData.data.map(item => ({
        x: new Date(item.timestamp),
        y: [item.open, item.high, item.low, item.close]
    }));
    
    const volumeData = ohlcData.data.map(item => ({
        x: new Date(item.timestamp),
        y: item.volume
    }));

    const options = {
        series: [{
            name: 'Price',
            type: 'candlestick',
            data: chartData
        }, {
            name: 'Volume',
            type: 'column',
            yAxisIndex: 1,
            data: volumeData
        }],
        chart: {
            type: 'candlestick',
            height: 500,
            background: 'transparent',
            toolbar: {
                show: true,
                tools: {
                    download: true,
                    selection: true,
                    zoom: true,
                    zoomin: true,
                    zoomout: true,
                    pan: true,
                    reset: true
                }
            }
        },
        title: {
            text: `${indexName} Price & Volume`,
            align: 'left',
            style: {
                color: '#fff'
            }
        },
        xaxis: {
            type: 'datetime',
            labels: {
                style: {
                    colors: '#fff'
                }
            }
        },
        yaxis: [{
            tooltip: {
                enabled: true
            },
            labels: {
                style: {
                    colors: '#fff'
                }
            }
        }, {
            opposite: true,
            tooltip: {
                enabled: true
            },
            labels: {
                style: {
                    colors: '#fff'
                }
            }
        }],
        theme: {
            mode: 'dark'
        },
        plotOptions: {
            candlestick: {
                colors: {
                    upward: '#00d3c0',
                    downward: '#ff5253'
                }
            }
        },
        legend: {
            labels: {
                colors: '#fff'
            }
        }
    };

    if (candlestickChart) {
        candlestickChart.destroy();
    }
    candlestickChart = new ApexCharts(document.querySelector('#candlestick_chart'), options);
    candlestickChart.render();
};

const renderHeatmapChart = (heatmapData, indexName) => {
    const data = heatmapData.constituents.map((stock, index) => ({
        x: stock.symbol,
        y: Math.floor(index / 10), // Create grid layout
        z: stock.heatScore || 0,
        symbol: stock.symbol,
        price: stock.price,
        priceChange: stock.priceChange,
        priceChangePercent: stock.priceChangePercent,
        volume: stock.volume
    }));

    const options = {
        series: [{
            name: 'Heat Score',
            data: data
        }],
        chart: {
            height: 400,
            type: 'treemap',
            background: 'transparent'
        },
        title: {
            text: `${indexName} Constituents Heatmap`,
            style: {
                color: '#fff'
            }
        },
        theme: {
            mode: 'dark'
        },
        plotOptions: {
            treemap: {
                enableShades: true,
                shadeIntensity: 0.5,
                colorScale: {
                    ranges: [{
                        from: -10,
                        to: -2,
                        color: '#ff5253'
                    }, {
                        from: -2,
                        to: 0,
                        color: '#ffab00'
                    }, {
                        from: 0,
                        to: 2,
                        color: '#69d40e'
                    }, {
                        from: 2,
                        to: 10,
                        color: '#00d3c0'
                    }]
                }
            }
        },
        tooltip: {
            theme: 'dark',
            custom: function({ series, seriesIndex, dataPointIndex, w }) {
                const data = w.globals.initialSeries[seriesIndex].data[dataPointIndex];
                return `<div class="arrow_box">
                    <span><strong>${data.symbol}</strong></span><br/>
                    <span>Price: ₹${data.price}</span><br/>
                    <span>Change: ${data.priceChangePercent}%</span><br/>
                    <span>Volume: ${data.volume?.toLocaleString()}</span>
                </div>`;
            }
        }
    };

    if (heatmapChart) {
        heatmapChart.destroy();
    }
    heatmapChart = new ApexCharts(document.querySelector('#heatmap_chart'), options);
    heatmapChart.render();
};

const updateVolumeAnalysis = (volumeData) => {
    document.getElementById('current_volume').textContent = 
        volumeData.currentVolume ? volumeData.currentVolume.toLocaleString() : '-';
    document.getElementById('avg_volume').textContent = 
        volumeData.averageVolume ? volumeData.averageVolume.toLocaleString() : '-';
    document.getElementById('volume_change').textContent = 
        volumeData.volumeChange ? `${volumeData.volumeChange.toFixed(2)}%` : '-';
    document.getElementById('volume_ratio').textContent = 
        volumeData.volumeRatio ? `${volumeData.volumeRatio.toFixed(2)}x` : '-';
};

const updateTopMovers = (topGainers, topLosers) => {
    const gainersHtml = topGainers.map(stock => 
        `<div class="mb-1">
            <span class="text-light">${stock.symbol}</span>
            <span class="text-success ms-2">+${stock.priceChangePercent?.toFixed(2)}%</span>
        </div>`
    ).join('');
    
    const losersHtml = topLosers.map(stock => 
        `<div class="mb-1">
            <span class="text-light">${stock.symbol}</span>
            <span class="text-danger ms-2">${stock.priceChangePercent?.toFixed(2)}%</span>
        </div>`
    ).join('');
    
    document.getElementById('top_gainers_list').innerHTML = gainersHtml || '<span class="text-muted">No data</span>';
    document.getElementById('top_losers_list').innerHTML = losersHtml || '<span class="text-muted">No data</span>';
};

// Enhanced index switching functionality
const switchIndex = async (indexKey) => {
    currentIndex = indexKey;
    const indexInfo = SUPPORTED_INDICES[indexKey];
    
    // Update UI elements
    document.getElementById('candlestick_chart_name').textContent = 
        `${indexInfo.display_name} Price & Volume Analysis`;
    document.getElementById('heatmap_chart_name').textContent = 
        `${indexInfo.display_name} Constituents Heatmap`;
    document.getElementById('col_barchart_name').textContent = 
        `${indexInfo.display_name} Open Interest Tracker`;
    
    // Update button states
    document.querySelectorAll('.go_btn').forEach(btn => btn.classList.remove('gb_active'));
    document.getElementById(`${indexKey.toLowerCase()}_btn`)?.classList.add('gb_active');
    
    // Load comprehensive analysis
    await loadComprehensiveAnalysis(indexInfo.api_name);
    
    // Load legacy data for existing charts
    await loadLegacyData(indexInfo.legacy_name);
};

const loadComprehensiveAnalysis = async (indexName) => {
    try {
        const [ohlcData, heatmapData, volumeData, comprehensiveData] = await Promise.all([
            getIndexOHLC(indexName, currentTimeframe, 100),
            getIndexHeatmap(indexName),
            getIndexVolumeAnalysis(indexName),
            getComprehensiveAnalysis(indexName)
        ]);
        
        // Render new charts
        renderCandlestickChart(ohlcData, SUPPORTED_INDICES[currentIndex].display_name);
        renderHeatmapChart(heatmapData, SUPPORTED_INDICES[currentIndex].display_name);
        
        // Update volume analysis
        updateVolumeAnalysis(volumeData);
        
        // Update top movers
        if (comprehensiveData) {
            updateTopMovers(comprehensiveData.topGainers || [], comprehensiveData.topLosers || []);
        }
        
    } catch (error) {
        console.error('Error loading comprehensive analysis:', error);
    }
};

const loadLegacyData = async (legacyIndexName) => {
    // Load existing legacy data for OI Compass and other existing charts
    try {
        call_Expiry_API(legacyIndexName);
        call_LIVE_OI_API(legacyIndexName, Nifty_exp_1);
        // Add other legacy API calls as needed
    } catch (error) {
        console.error('Error loading legacy data:', error);
    }
};

// Expiry API
const call_Expiry_API = (script) => {
    try {
        $.post(root + route + "/get_running_expiry", { script: script }, function (data, status) {
            Expiry_data = data;
        }).fail(function (response) {
            logger.error('Error: ' + response);
        });
        let x = moment.unix(Expiry_data[0][0]).utcOffset('+5:30').format("MMM-DD");
        let y = moment.unix(Expiry_data[1][0]).utcOffset('+5:30').format("MMM-DD");
        $("#1st_dropdown_value").attr("value", x);
        $("#2nd_dropdown_value").attr("value", y);
        $("#1st_dropdown_value").text(x);
        $("#2nd_dropdown_value").text(y);
        Nifty_exp_1 = moment.unix(Expiry_data[0][0]).utcOffset('+5:30').format("DDMMMYY");
        Nifty_exp_2 = moment.unix(Expiry_data[1][0]).utcOffset('+5:30').format("DDMMMYY");
        return [Expiry_data, Nifty_exp_1, Nifty_exp_2];
    } catch (error) {
        logger.error(error)
    }
}

// LIVE OI API
const call_LIVE_OI_API = (script, exp) => {
    try {
        $.post(root + route + "/live_oi", { script: script, exp: exp }, function (data, status) {
            Live_OI_data = data;
        }).done(function (res) {
            ts_2 = Object.keys(Live_OI_data)[0]
            // $('#c_chart_last_upd').text(`${moment.unix(ts_2).format("HH:mm")}`)
            return [Live_OI_data, ts2]
        }).fail(function (response) {
            logger.error('Error: ' + response);
        });
    } catch (error) {
        logger.error(error)
    }
}

// Function for timestamp 1 
const timestamp_1 = () => {
    ts2 = Object.keys(Live_OI_data)[0]

    year = moment.unix(parseFloat(ts2)).utcOffset('+5:30').year()
    month = moment.unix(parseFloat(ts2)).utcOffset('+5:30').month()
    day = moment.unix(parseFloat(ts2)).utcOffset('+5:30').date()

    const dateTime = moment().utcOffset('+5:30');
    dateTime.set({ year: year, month: month, date: day, hour: 9, minute: 15, second: 0, millisecond: 0 });
    ts1 = dateTime.unix();
    ts1 = parseFloat(ts1).toFixed(1)
}

// INDEX OI CHANGE API
const call_INDEX_OI_CHANGE_API = (ts1, ts2, script, exp) => {
    try {
        $.post(root + route + "/index_analysis", { ts1: ts1, ts2: ts2, script: script, exp: exp }, function (data, status) {
            Index_OI_Change_data = data;
        }).fail(function (response) {
            logger.error('Error: ' + response);
            Index_OI_Change_data = 0
        });
    } catch (error) {
        logger.error(error)
        Index_OI_Change_data = 0
    }
}

// Calculation for data of NIFTY 50 Open Interest Tracker
const NIFTY_50_Open_Intrest_Tracker = (script) => {
    let array = Object.keys(Object.values(Live_OI_data)[0])
    let processedArray = array.slice(0, array.length - 1);
    let newArray = $.map(processedArray, function (element) {
        if (script == "NIFTY 50") {
            return element.slice(14, -2);
        }
        else if (script == "NIFTY BANK") {
            return element.slice(18, -2);
        }
        else if (script == "NIFTY FIN SERVICE") {
            return element.slice(17, -2);
        }
        else if (script == "NIFTY MID SELECT") {
            return element.slice(19, -2);
        }
        else if (script == "SENSEX") { // for sensex
            return element.slice(15, -2);
        }
    });
    let uniqueArray = $.unique(newArray);
    x_axis_categories = uniqueArray

    let Dict = Object.values(Live_OI_data)[0]

    CE_array = [];
    PE_array = [];

    $.each(Dict, function (key, value) {
        if (key.indexOf("CE") !== -1) {
            value = parseInt(value)
            CE_array.push(value);
        } else if (key.indexOf("PE") !== -1) {
            value = parseInt(value)
            PE_array.push(value);
        }
    });

    CE_OI_total = CE_array.reduce(function (accumulator, currentValue) {
        return accumulator + currentValue;
    }, 0);

    PE_OI_total = PE_array.reduce(function (accumulator, currentValue) {
        return accumulator + currentValue;
    }, 0);

    CE_OI_total = parseInt(CE_OI_total)
    PE_OI_total = parseInt(PE_OI_total)

    Open_Intrest_Tracker_atm = `${Object.values(Live_OI_data)[0]['atm']}`

    $('.total_ce').text(CE_OI_total.toLocaleString())
    $('.total_pe').text(PE_OI_total.toLocaleString())
    $('.pcr_net').text(`${parseFloat(PE_OI_total / CE_OI_total).toFixed(2)}`)
}

// Calculation for data of OI Compass
const OI_Compass = (script) => {
    if (Index_OI_Change_data != 0 && Index_OI_Change_data != "Err Ts") {
        if (Object.keys(Index_OI_Change_data).length > 1) {
            let array_2 = Object.values(Index_OI_Change_data);
            var commonKeys = Object.keys(array_2[0]);
            // Get the common keys from all dictionaries in the array
            var commonKeys = array_2.reduce(function (keys, obj) {
                return Object.keys(obj).filter(function (key) {
                    return keys.includes(key);
                });
            }, Object.keys(array_2[0]));
            // Perform intersection for each dictionary in the array
            Index_OI_final_Change_data = array_2.map(function (obj) {
                var intersection = {};
                commonKeys.forEach(function (key) {
                    if (key in obj) {
                        intersection[key] = obj[key];
                    }
                });
                return intersection;
            });

            let array = Object.keys(Object.values(Index_OI_final_Change_data)[0])
            let processedArray = array.slice(0, array.length - 1);
            let newArray = $.map(processedArray, function (element) {
                if (script == "NIFTY 50") {
                    return element.slice(14, -2);
                }
                else if (script == "NIFTY BANK") {
                    return element.slice(18, -2);
                }
                else if (script == "NIFTY FIN SERVICE") {
                    return element.slice(17, -2);
                }
                else if (script == "NIFTY MID SELECT") {
                    return element.slice(19, -2);
                }
                else if (script == "SENSEX") { // for sensex
                    return element.slice(15, -2);
                }
            });
            let uniqueArray = $.unique(newArray);
            x_axis_categories_OI_Compass = uniqueArray

            let my_array = x_axis_categories_OI_Compass;
            let reversed_array = $([].concat(my_array)).toArray().reverse();
            x_axis_categories_OI_Compass = reversed_array

            let array_1 = Object.values(Index_OI_final_Change_data)
            Diff_Result = {};
            for (let key in array_1[0]) {
                if (array_1[0].hasOwnProperty(key) && array_1[1].hasOwnProperty(key)) {
                    let diff = array_1[1][key] - array_1[0][key];
                    Diff_Result[key] = diff;
                }
            }

            let Dict = Diff_Result
            CE_array_OI_Compass = [];
            PE_array_OI_Compass = [];

            $.each(Dict, function (key, value) {
                if (key.indexOf("CE") !== -1) {
                    value = parseInt(value)
                    CE_array_OI_Compass.push(value);
                } else if (key.indexOf("PE") !== -1) {
                    value = parseInt(value)
                    PE_array_OI_Compass.push(value);
                }
            });

            let my_array_1 = CE_array_OI_Compass;
            let reversed_array_1 = $([].concat(my_array_1)).toArray().reverse();
            CE_array_OI_Compass = reversed_array_1

            let my_array_2 = PE_array_OI_Compass;
            let reversed_array_2 = $([].concat(my_array_2)).toArray().reverse();
            PE_array_OI_Compass = reversed_array_2

            OI_Compass_atm_1 = `${Object.values(Index_OI_Change_data)[1]['atm']}`
            OI_Compass_atm_Final = OI_Compass_atm_1
        }
    }
}

// Calculation for Change in P/C
const Changes_in_Put_Call = () => {
    if (Index_OI_Change_data != 0 && Index_OI_Change_data != "Err Ts") {
        if (Object.keys(Index_OI_Change_data).length > 1) {
            let array = Object.values(Index_OI_final_Change_data)

            // Calculate ts1_CE_Total
            let ts1_CE_Total = 0;
            for (let key in array[0]) {
                if (key.endsWith('CE')) {
                    ts1_CE_Total += array[0][key];
                }
            }

            // Calculate ts2_CE_Total
            let ts2_CE_Total = 0;
            for (let key in array[1]) {
                if (key.endsWith('CE')) {
                    ts2_CE_Total += array[1][key];
                }
            }

            // Calculate Change_CE_OI
            Change_CE_OI = ts2_CE_Total - ts1_CE_Total;
            Change_CE_OI = parseInt(Change_CE_OI)

            // Calculate ts1_PE_Total
            let ts1_PE_Total = 0;
            for (let key in array[0]) {
                if (key.endsWith('PE')) {
                    ts1_PE_Total += array[0][key];
                }
            }

            // Calculate ts2_PE_Total
            let ts2_PE_Total = 0;
            for (let key in array[1]) {
                if (key.endsWith('PE')) {
                    ts2_PE_Total += array[1][key];
                }
            }

            // Calculate Change_PE_OI
            Change_PE_OI = ts2_PE_Total - ts1_PE_Total;
            Change_PE_OI = parseInt(Change_PE_OI)

            $('.chg_ce').text(Change_CE_OI.toLocaleString())
            $('.chg_pe').text(Change_PE_OI.toLocaleString())
        }
    }
}

// Click function on the button
const fetch_data = () => {
    // Getting Timestamp from ion Range slider
    let irs_data = $(".js-range-slider").data("ionRangeSlider");
    from_t = moment(irs_data.old_from).unix(), to_t = moment(irs_data.old_to).unix();
    to_t_min = parseFloat(moment.unix(to_t).format("mm")) % 3
    to_t = moment.unix(to_t).subtract(to_t_min, "minutes")
    to_t = moment(to_t).unix()

    var x1 = moment.unix(parseFloat(Object.keys(Live_OI_data)[0])).format('DD-MM-YYYY')
    var y1 = moment.unix(parseFloat(from_t)).format('HH:mm') + ':00:000';
    var y2 = moment.unix(parseFloat(to_t)).format('HH:mm') + ':00:000';

    var datetime_1 = moment(x1 + ' ' + y1, 'DD-MM-YYYY HH:mm:ss:SSS');
    var datetime_2 = moment(x1 + ' ' + y2, 'DD-MM-YYYY HH:mm:ss:SSS');
    ts1 = datetime_1.valueOf(), ts1 = moment(ts1).unix(), ts1 = parseFloat(ts1).toFixed(1);
    ts2 = datetime_2.valueOf(), ts2 = moment(ts2).unix(), ts2 = parseFloat(ts2).toFixed(1);

    var x = $("#Expiry").prop("selectedIndex");

    if ($("#nifty_btn").hasClass("gb_active") && x == 1) {
        call_Expiry_API("NIFTY 50");

        call_LIVE_OI_API("NIFTY 50", Nifty_exp_2)
        NIFTY_50_Open_Intrest_Tracker("NIFTY 50")
        update_chart_set_interval()

        call_INDEX_OI_CHANGE_API(ts1, ts2, "NIFTY 50", Nifty_exp_2)
        OI_Compass("NIFTY 50")
        Changes_in_Put_Call()
        update_chart()
    } else if ($("#nifty_btn").hasClass("gb_active") && x == 0) {
        call_Expiry_API("NIFTY 50");

        call_LIVE_OI_API("NIFTY 50", Nifty_exp_1)
        NIFTY_50_Open_Intrest_Tracker("NIFTY 50")
        update_chart_set_interval()

        call_INDEX_OI_CHANGE_API(ts1, ts2, "NIFTY 50", Nifty_exp_1)
        OI_Compass("NIFTY 50")
        Changes_in_Put_Call()
        update_chart()
    } else if ($("#bnknifty_btn").hasClass("gb_active") && x == 1) {
        call_Expiry_API("NIFTY BANK");

        call_LIVE_OI_API("NIFTY BANK", Nifty_exp_2)
        NIFTY_50_Open_Intrest_Tracker("NIFTY BANK")
        update_chart_set_interval()

        call_INDEX_OI_CHANGE_API(ts1, ts2, "NIFTY BANK", Nifty_exp_2)
        OI_Compass("NIFTY BANK")
        Changes_in_Put_Call()
        update_chart()
    } else if ($("#bnknifty_btn").hasClass("gb_active") && x == 0) {
        call_Expiry_API("NIFTY BANK");

        call_LIVE_OI_API("NIFTY BANK", Nifty_exp_1)
        NIFTY_50_Open_Intrest_Tracker("NIFTY BANK")
        update_chart_set_interval()

        call_INDEX_OI_CHANGE_API(ts1, ts2, "NIFTY BANK", Nifty_exp_1)
        OI_Compass("NIFTY BANK")
        Changes_in_Put_Call()
        update_chart()
    } else if ($("#finnifty_btn").hasClass("gb_active") && x == 1) {
        call_Expiry_API("NIFTY FIN SERVICE");

        call_LIVE_OI_API("NIFTY FIN SERVICE", Nifty_exp_2)
        NIFTY_50_Open_Intrest_Tracker("NIFTY FIN SERVICE")
        update_chart_set_interval()

        call_INDEX_OI_CHANGE_API(ts1, ts2, "NIFTY FIN SERVICE", Nifty_exp_2)
        OI_Compass("NIFTY FIN SERVICE")
        Changes_in_Put_Call()
        update_chart()
    } else if ($("#finnifty_btn").hasClass("gb_active") && x == 0) {
        call_Expiry_API("NIFTY FIN SERVICE");

        call_LIVE_OI_API("NIFTY FIN SERVICE", Nifty_exp_1)
        NIFTY_50_Open_Intrest_Tracker("NIFTY FIN SERVICE")
        update_chart_set_interval()

        call_INDEX_OI_CHANGE_API(ts1, ts2, "NIFTY FIN SERVICE", Nifty_exp_1)
        OI_Compass("NIFTY FIN SERVICE")
        Changes_in_Put_Call()
        update_chart()
    } else if ($("#midcap_btn").hasClass("gb_active") && x == 1) {
        call_Expiry_API("NIFTY MID SELECT");

        call_LIVE_OI_API("NIFTY MID SELECT", Nifty_exp_2)
        NIFTY_50_Open_Intrest_Tracker("NIFTY MID SELECT")
        update_chart_set_interval()

        call_INDEX_OI_CHANGE_API(ts1, ts2, "NIFTY MID SELECT", Nifty_exp_2)
        OI_Compass("NIFTY MID SELECT")
        Changes_in_Put_Call()
        update_chart()
    } else if ($("#midcap_btn").hasClass("gb_active") && x == 0) {
        call_Expiry_API("NIFTY MID SELECT");

        call_LIVE_OI_API("NIFTY MID SELECT", Nifty_exp_1)
        NIFTY_50_Open_Intrest_Tracker("NIFTY MID SELECT")
        update_chart_set_interval()

        call_INDEX_OI_CHANGE_API(ts1, ts2, "NIFTY MID SELECT", Nifty_exp_1)
        OI_Compass("NIFTY MID SELECT")
        Changes_in_Put_Call()
        update_chart()
    } else if ($("#sensex_btn").hasClass("gb_active") && x == 1) {
        call_Expiry_API("SENSEX");

        call_LIVE_OI_API("SENSEX", Nifty_exp_2)
        NIFTY_50_Open_Intrest_Tracker("SENSEX")
        update_chart_set_interval()

        call_INDEX_OI_CHANGE_API(ts1, ts2, "SENSEX", Nifty_exp_2)
        OI_Compass("SENSEX")
        Changes_in_Put_Call()
        update_chart()
    } else if ($("#sensex_btn").hasClass("gb_active") && x == 0) {
        call_Expiry_API("SENSEX");

        call_LIVE_OI_API("SENSEX", Nifty_exp_1)
        NIFTY_50_Open_Intrest_Tracker("SENSEX")
        update_chart_set_interval()

        call_INDEX_OI_CHANGE_API(ts1, ts2, "SENSEX", Nifty_exp_1)
        OI_Compass("SENSEX")
        Changes_in_Put_Call()
        update_chart()
    }
}

const update_chart = () => {
    if (counter_for_horizontal_grouped_bar_chart != true) {
        var x = $("#Expiry").prop("selectedIndex");
        if ($("#nifty_btn").hasClass("gb_active") && x == 1) {
            Button = "NIFTY"
            Expiry = Nifty_exp_2
        } else if ($("#nifty_btn").hasClass("gb_active") && x == 0) {
            Button = "NIFTY"
            Expiry = Nifty_exp_1
        } else if ($("#bnknifty_btn").hasClass("gb_active") && x == 1) {
            Button = "BANKNIFTY"
            Expiry = Nifty_exp_2
        } else if ($("#bnknifty_btn").hasClass("gb_active") && x == 0) {
            Button = "BANKNIFTY"
            Expiry = Nifty_exp_1
        } else if ($("#finnifty_btn").hasClass("gb_active") && x == 1) {
            Button = "FINNIFTY"
            Expiry = Nifty_exp_2
        } else if ($("#finnifty_btn").hasClass("gb_active") && x == 0) {
            Button = "FINNIFTY"
            Expiry = Nifty_exp_1
        } else if ($("#midcap_btn").hasClass("gb_active") && x == 1) {
            Button = "MIDCAP"
            Expiry = Nifty_exp_2
        } else if ($("#midcap_btn").hasClass("gb_active") && x == 0) {
            Button = "MIDCAP"
            Expiry = Nifty_exp_1
        } else if ($("#sensex_btn").hasClass("gb_active") && x == 1) {
            Button = "SENSEX"
            Expiry = Nifty_exp_2
        } else if ($("#sensex_btn").hasClass("gb_active") && x == 0) {
            Button = "SENSEX"
            Expiry = Nifty_exp_1
        }

        counter_for_horizontal_grouped_bar_chart = true
        var options = {
            series: [{
                name: "Call OI",
                data: CE_array_OI_Compass
            }, {
                name: "Put OI",
                data: PE_array_OI_Compass
            }],
            chart: {
                type: 'bar',
                height: "625px",
                toolbar: {
                    show: false,
                },
                foreColor: "#000",
                events: {
                    click: (event, chartContext, dataPointIndex) => {
                        let temp = dataPointIndex['dataPointIndex']
                        let strike = dataPointIndex['config']['xaxis']['categories'][temp];


                        let temp_1 = dataPointIndex['seriesIndex']
                        let value_name = dataPointIndex['globals']['initialSeries'][temp_1]['data'][temp];

                        var p_c = ''
                        var idx = ''

                        if (temp_1 == 0) { logger.info("Name = CE"); p_c = 'CALL' }
                        else if (temp_1 == 1) { logger.info("Name = PE"); p_c = 'PUT' }

                        let exp = (moment(Expiry).format("DD MMM")).toUpperCase()

                        idx = Button

                        let symbol = idx + " " + exp + " " + strike + " " + p_c
                        logger.info(idx, exp, strike, p_c, " ", symbol)
                        tw_charts(symbol)
                    }
                },
            },
            plotOptions: {
                bar: {
                    horizontal: true,
                    dataLabels: {
                        position: 'top',
                    },
                }
            },
            dataLabels: {
                enabled: true,
                offsetX: 35,
                style: {
                    fontSize: '12px',
                    colors: ['#fff']
                }
            },
            stroke: {
                show: false,
            },
            tooltip: {
                shared: !1,
                intersect: !0,
                style: {
                    fontSize: '12px',
                    color: ['#333']
                },
            },
            legend: {
                show: false
            },
            xaxis: {
                categories: x_axis_categories_OI_Compass,
                colors: ["#fff"],
                labels: {
                    style: {
                        fontSize: "14px"
                    }
                }
            },
            yaxis: {
                labels: {
                    formatter: function (t) {
                        return Math.floor(t)
                    },
                    style: {
                        fontSize: "14px"
                    }
                }
            },
            annotations: {
                yaxis: [{
                    y: OI_Compass_atm_Final,
                    offsetX: 0,
                    offsetY: -3,
                    borderColor: "#ffffff",
                    label: {
                        style: {
                            color: "#123",
                            fontSize: '12px'
                        },
                        text: "ATM"
                    }
                }]
            },
            grid: {
                show: false
            },
            colors: ["#ff5253", "#00d3c0"]
        };
        chart = new ApexCharts(document.querySelector("#grouped_barchart"), options), chart.render();
    }
    else {
        var x = $("#Expiry").prop("selectedIndex");
        if ($("#nifty_btn").hasClass("gb_active") && x == 1) {
            Button = "NIFTY"
            Expiry = Nifty_exp_2
        } else if ($("#nifty_btn").hasClass("gb_active") && x == 0) {
            Button = "NIFTY"
            Expiry = Nifty_exp_1
        } else if ($("#bnknifty_btn").hasClass("gb_active") && x == 1) {
            Button = "BANKNIFTY"
            Expiry = Nifty_exp_2
        } else if ($("#bnknifty_btn").hasClass("gb_active") && x == 0) {
            Button = "BANKNIFTY"
            Expiry = Nifty_exp_1
        } else if ($("#finnifty_btn").hasClass("gb_active") && x == 1) {
            Button = "FINNIFTY"
            Expiry = Nifty_exp_2
        } else if ($("#finnifty_btn").hasClass("gb_active") && x == 0) {
            Button = "FINNIFTY"
            Expiry = Nifty_exp_1
        } else if ($("#midcap_btn").hasClass("gb_active") && x == 1) {
            Button = "MIDCAP"
            Expiry = Nifty_exp_2
        } else if ($("#midcap_btn").hasClass("gb_active") && x == 0) {
            Button = "MIDCAP"
            Expiry = Nifty_exp_1
        } else if ($("#sensex_btn").hasClass("gb_active") && x == 1) {
            Button = "SENSEX"
            Expiry = Nifty_exp_2
        } else if ($("#sensex_btn").hasClass("gb_active") && x == 0) {
            Button = "SENSEX"
            Expiry = Nifty_exp_1
        }
        chart.updateOptions({
            xaxis: {
                categories: x_axis_categories_OI_Compass
            },
            chart: {
                events: {
                    click: (event, chartContext, dataPointIndex) => {
                        let temp = dataPointIndex['dataPointIndex']
                        let strike = dataPointIndex['config']['xaxis']['categories'][temp];


                        let temp_1 = dataPointIndex['seriesIndex']
                        let value_name = dataPointIndex['globals']['initialSeries'][temp_1]['data'][temp];

                        var p_c = ''
                        var idx = ''

                        if (temp_1 == 0) { logger.info("Name = CE"); p_c = 'CALL' }
                        else if (temp_1 == 1) { logger.info("Name = PE"); p_c = 'PUT' }

                        let exp = (moment(Expiry).format("DD MMM")).toUpperCase()

                        idx = Button

                        let symbol = idx + " " + exp + " " + strike + " " + p_c
                        logger.info(idx, exp, strike, p_c, " ", symbol)
                        tw_charts(symbol)
                    }
                },
            },
            annotations: {
                yaxis: [{
                    y: OI_Compass_atm_Final,
                    offsetX: 0,
                    offsetY: -3,
                    borderColor: "#ffffff",
                    label: {
                        style: {
                            color: "#123",
                            fontSize: '12px'
                        },
                        text: "ATM"
                    }
                }]
            }
        }), chart.updateSeries([{
            name: "Call OI",
            data: CE_array_OI_Compass
        }, {
            name: "Put OI",
            data: PE_array_OI_Compass
        }])
    }

    if (counter_for_bar_chart != true) {
        counter_for_bar_chart = true
        var donut_bar = {
            responsive: [{
                breakpoint: 800,
                options: {
                    chart: {
                        height: "auto"
                    }
                }
            }],
            grid: {
                borderColor: "#2e2e2e"
            },
            series: [{
                name: "OI Chng",
                data: [Change_PE_OI, Change_CE_OI]
            }],
            chart: {
                type: "bar",
                height: "95%",
                toolbar: {
                    show: !1
                },
                foreColor: "#ffffff"
            },
            plotOptions: {
                bar: {
                    horizontal: !1,
                    columnWidth: "45%",
                    endingShape: "rounded"
                }
            },
            dataLabels: {
                enabled: !1
            },
            stroke: {
                show: !0,
                width: 2,
                colors: ["transparent"]
            },
            xaxis: {
                categories: ["PE Chg", "CE Chg"]
            },
            yaxis: {
                title: {}
            },
            fill: {
                colors: ['#00d3c0', '#ff5253'],
                opacity: 1
            },
            tooltip: {
                y: {
                    formatter: function (t) {
                        return t
                    }
                }
            }
        };
        chart1 = new ApexCharts(document.querySelector("#donutchart"), donut_bar), chart1.render();
    }
    else {
        chart1.updateSeries([{
            name: "OI Chng",
            data: [Change_PE_OI, Change_CE_OI]
        }])
    }

    $("#donutchart path:eq(1)").css("fill", "#ff5253")
    Change_PE_OI > 0 ? $("#donutchart path:eq(0)").css("fill", "#00d3c0") : $("#donutchart path:eq(0)").css("fill", "#ff5253"),
        Change_CE_OI > 0 ? $("#donutchart path:eq(1)").css("fill", "#ff5253") : $("#donutchart path:eq(1)").css("fill", "#00d3c0")
}

const update_chart_set_interval = () => {
    if (counter_for_column_chart != true) {
        counter_for_column_chart = true
        var options = {
            grid: {
                borderColor: "#2e2e2e"
            },
            responsive: [{
                breakpoint: 800,
                options: {
                    dataLabels: {},
                    plotOptions: {
                        bar: {
                            horizontal: !1,
                            columnWidth: "75%",
                            endingShape: "rounded"
                        }
                    },
                    yaxis: {
                        show: true,
                        labels: {
                            show: true,
                            align: 'left',
                            rotate: 270
                        }
                    }
                }
            }],
            colors: ["#ff5253", "#00d3c0"],
            legend: {
                fontSize: "16px",
                labels: {
                    colors: ["#ffffff"]
                }
            },
            series: [{
                name: "Call OI",
                data: CE_array
            }, {
                name: "Put OI",
                data: PE_array
            }],
            chart: {
                toolbar: {
                    show: !1
                },
                toolbar: {
                    show: !0,
                    tools: {
                        download: !1,
                        selection: !0,
                        zoom: !0,
                        zoomin: !0,
                        zoomout: !0,
                        pan: !0,
                        reset: 1,
                        customIcons: []
                    }
                },
                foreColor: "#ffffff",
                type: "bar",
                height: 530
            },
            plotOptions: {
                bar: {
                    horizontal: !1,
                    columnWidth: "30%",
                    endingShape: "rounded"
                }
            },
            dataLabels: {
                enabled: !1
            },
            stroke: {
                show: !0,
                width: 2,
                colors: ["transparent"]
            },
            xaxis: {
                tickPlacement: "on",
                categories: x_axis_categories,
                title: {
                    style: {
                        fontSize: "1rem",
                        fontWeight: 600,
                        cssClass: "apexcharts-xaxis-title"
                    }
                }
            },
            yaxis: {
                title: {
                    text: "Open Interest",
                    style: {
                        fontSize: "1rem",
                        fontWeight: 600,
                        cssClass: "apexcharts-xaxis-title"
                    }
                }
            },
            annotations: {
                xaxis: [{
                    x: Open_Intrest_Tracker_atm,
                    borderColor: '#999',
                    borderType: 'dotted',
                    borderWidth: 1,
                    label: {
                        style: {
                            color: '#000',
                            fontSize: '12px'
                        },
                        text: 'ATM',
                        position: 'top',
                        orientation: 'horizontal',
                    }
                }]
            },
            fill: {
                opacity: 1
            },
            tooltip: {
                y: {
                    formatter: function (t) {
                        return t
                    }
                }
            }
        };
        c_chart = new ApexCharts(document.querySelector("#column_chart"), options), c_chart.render();
    }
    else {
        c_chart.updateOptions({
            annotations: {
                xaxis: [{
                    x: Open_Intrest_Tracker_atm,
                    offsetX: -1,
                    offsetY: 0,
                    borderColor: "#ffffff",
                    label: {
                        style: {
                            color: "#123",
                            fontSize: '12px'
                        },
                        orientation: "horizontal",
                        text: "ATM"
                    }
                }]
            },
            xaxis: {
                categories: x_axis_categories
            }
        }), c_chart.updateSeries([{
            name: "Call OI",
            data: CE_array
        }, {
            name: "Put OI",
            data: PE_array
        }])
    }

    if (counter_for_donut_chart != true) {
        counter_for_donut_chart = true
        var options1 = {
            chart: {
                type: "donut",
                width: '220',
                height: '220'
            },
            responsive: [{
                breakpoint: 1150,
                options: {
                    chart: {
                        width: '200',
                        height: '200',
                    },
                    dataLabels: {
                        offsetX: 5,
                        offsetY: 0,
                        style: {
                            fontSize: "10px",
                            fontFamily: "Helvetica, Arial, sans-serif",
                            fontWeight: "bold"
                        }
                    }
                }
            }, {
                breakpoint: 992,
                options: {
                    chart: {
                        width: '250',
                        height: '250',
                    },
                    dataLabels: {
                        offsetX: 5,
                        offsetY: 0,
                        style: {
                            fontSize: "10px",
                            fontFamily: "Helvetica, Arial, sans-serif",
                            fontWeight: "bold"
                        }
                    }
                }
            }, {
                breakpoint: 800,
                options: {
                    chart: {
                        width: '200',
                        height: '200',
                    },
                    dataLabels: {
                        offsetX: 5,
                        offsetY: 0,
                        style: {
                            fontSize: "10px",
                            fontFamily: "Helvetica, Arial, sans-serif",
                            fontWeight: "bold"
                        }
                    }
                }
            }],
            series: [PE_OI_total, CE_OI_total],
            labels: ["Total PE OI", "Total CE OI"],
            backgroundColor: "transparent",
            pieHole: .5,
            colors: ["#00d3c0", "#ff5253"],
            pieSliceTextStyle: {
                color: "#ffffff"
            },
            sliceVisibilityThreshold: 0,
            fontSize: 17,
            chartArea: {
                top: 40
            },
            pieSliceTextStyle: {
                fontSize: 12
            },
            pieStartAngle: 50,
            isStacked: !0,
            enableInteractivity: !1,
            pieSliceBorderColor: "transparent",
            legend: {
                show: !1,
                position: "right",
                horizontalAlign: "right",
                labels: {
                    colors: "#ffffff",
                    useSeriesColors: !1
                },
                itemMargin: {
                    horizontal: 10,
                    vertical: 20
                },
                fontSize: 15,
                markers: {
                    width: 12,
                    height: 12,
                    radius: 12
                }
            },
            stroke: {
                colors: "trasparant",
                width: 0
            },
            plotOptions: {
                pie: {
                    startAngle: 0,
                    endAngle: 360,
                    expandOnClick: !0,
                    offsetX: 0,
                    offsetY: 25,
                    customScale: 1.1,
                    dataLabels: {
                        position: "right",
                        offset: 0,
                        minAngleToShowLabel: 50
                    },
                    grid: {
                        borderColor: "#000000"
                    },
                    donut: {
                        size: "70%",
                        labels: {
                            colors: "#ffffff",
                            show: !0,
                            name: {
                                color: "#ffffff",
                                fontSize: 14
                            },
                            value: {
                                color: "#ffffff",
                                fontSize: 14
                            },
                            total: {
                                color: "#ffffff"
                            }
                        }
                    }
                }
            }
        };
        chart2 = new ApexCharts(document.querySelector("#donutchart1"), options1), chart2.render();
    }
    else {
        chart2.updateSeries([PE_OI_total, CE_OI_total])
    }
}

const updateSlider = (fromValue, toValue) => {
    slider.update({
        from: fromValue,
        to: toValue
    });
}

const executeFunction = () => {
    var x = $("#Expiry").prop("selectedIndex");
    if ($("#nifty_btn").hasClass("gb_active") && x == 1) {
        call_LIVE_OI_API("NIFTY 50", Nifty_exp_2)
        NIFTY_50_Open_Intrest_Tracker("NIFTY 50")
        update_chart_set_interval()
    } else if ($("#nifty_btn").hasClass("gb_active") && x == 0) {
        call_LIVE_OI_API("NIFTY 50", Nifty_exp_1)
        NIFTY_50_Open_Intrest_Tracker("NIFTY 50")
        update_chart_set_interval()
    } else if ($("#bnknifty_btn").hasClass("gb_active") && x == 1) {
        call_LIVE_OI_API("NIFTY BANK", Nifty_exp_2)
        NIFTY_50_Open_Intrest_Tracker("NIFTY BANK")
        update_chart_set_interval()
    } else if ($("#bnknifty_btn").hasClass("gb_active") && x == 0) {
        call_LIVE_OI_API("NIFTY BANK", Nifty_exp_1)
        NIFTY_50_Open_Intrest_Tracker("NIFTY BANK")
        update_chart_set_interval()
    } else if ($("#finnifty_btn").hasClass("gb_active") && x == 1) {
        call_LIVE_OI_API("NIFTY FIN SERVICE", Nifty_exp_2)
        NIFTY_50_Open_Intrest_Tracker("NIFTY FIN SERVICE")
        update_chart_set_interval()
    } else if ($("#finnifty_btn").hasClass("gb_active") && x == 0) {
        call_LIVE_OI_API("NIFTY FIN SERVICE", Nifty_exp_1)
        NIFTY_50_Open_Intrest_Tracker("NIFTY FIN SERVICE")
        update_chart_set_interval()
    } else if ($("#midcap_btn").hasClass("gb_active") && x == 1) {
        call_LIVE_OI_API("NIFTY MID SELECT", Nifty_exp_2)
        NIFTY_50_Open_Intrest_Tracker("NIFTY MID SELECT")
        update_chart_set_interval()
    } else if ($("#midcap_btn").hasClass("gb_active") && x == 0) {
        call_LIVE_OI_API("NIFTY MID SELECT", Nifty_exp_1)
        NIFTY_50_Open_Intrest_Tracker("NIFTY MID SELECT")
        update_chart_set_interval()
    } else if ($("#sensex_btn").hasClass("gb_active") && x == 1) {
        call_LIVE_OI_API("SENSEX", Nifty_exp_2)
        NIFTY_50_Open_Intrest_Tracker("SENSEX")
        update_chart_set_interval()
    } else if ($("#sensex_btn").hasClass("gb_active") && x == 0) {
        call_LIVE_OI_API("SENSEX", Nifty_exp_1)
        NIFTY_50_Open_Intrest_Tracker("SENSEX")
        update_chart_set_interval()
    }
}

const schedulePrint = () => {
    var current_time = new Date();

    var minutes = current_time.getMinutes();
    var seconds = current_time.getSeconds();
    var next_min = minutes % 3;
    if (next_min == 2) {
        next_interval = 60 - seconds + 31
        next_interval *= 1000;
    } else if (next_min == 1) {
        next_interval = 120 - seconds + 31
        next_interval *= 1000;
    } else if (next_min == 0) {
        if (seconds < 31) {
            next_interval = 31 - seconds
            next_interval *= 1000;
        }
        else {
            next_interval = 60 - seconds + 120 + 31
            next_interval *= 1000;
        }
    }

    setTimeout(() => {
        executeFunction()
        next_interval_1 = 180000
        setInterval(() => {
            executeFunction()
        }, next_interval_1);
    }, next_interval);
}


$(document).ready(function () {



    livequotei();
    setInterval(function () { if (dtime_clock() == false) { return } livequotei(); }, 44000);

    $.ajaxSetup({ async: false }); // to stop async

    counter_for_column_chart = false
    counter_for_donut_chart = false
    counter_for_horizontal_grouped_bar_chart = false
    counter_for_bar_chart = false

    Index_OI_Change_data = 0;
    Change_PE_OI = 0;
    Change_CE_OI = 0;
    CE_array_OI_Compass = [0, 0]
    PE_array_OI_Compass = [0, 0]
    x_axis_categories_OI_Compass = [0, 0]
    OI_Compass_atm_Final = 0
    CE_array = [0, 0]
    PE_array = [0, 0]
    x_axis_categories = 0
    Open_Intrest_Tracker_atm = 0
    PE_OI_total = 0
    CE_OI_total = 0
    Change_PE_OI = 0
    Change_CE_OI = 0

    slider = $(".js-range-slider").ionRangeSlider({
        grid: true,
        type: "double",
        min: moment("0915", "hhmm").valueOf(),
        max: moment("1530", "hhmm").valueOf(),
        from: moment("0915", "hhmm").valueOf(),
        to: moment("1530", "hhmm").valueOf(),
        force_edges: !0,
        grid_num: 12,
        step: 180000,
        min_interval: 180000,
        prettify: function (t) {
            return moment(t).format("HH:mm")
        }
    }).data("ionRangeSlider");

    let page_access = username(cookieValue_1)
    if (page_access[2] == 0) {
        if (page_access[4]['idx'] == 1) {

            // Start the initial scheduling
            schedulePrint();

            call_check_access_API()
            call_Expiry_API("NIFTY 50");
            call_LIVE_OI_API("NIFTY 50", Nifty_exp_1)
            timestamp_1() // Calculating ts1 and ts2
            NIFTY_50_Open_Intrest_Tracker("NIFTY 50")

            // Grouped Column Bar Chart
            var options = {
                grid: {
                    borderColor: "#2e2e2e"
                },
                responsive: [{
                    breakpoint: 800,
                    options: {
                        dataLabels: {},
                        plotOptions: {
                            bar: {
                                horizontal: !1,
                                columnWidth: "75%",
                                endingShape: "rounded"
                            }
                        },
                        yaxis: {
                            show: true,
                            labels: {
                                show: true,
                                align: 'left',
                                rotate: 270
                            }
                        }
                    }
                }],
                colors: ["#ff5253", "#00d3c0"],
                legend: {
                    fontSize: "16px",
                    labels: {
                        colors: ["#ffffff"]
                    }
                },
                series: [{
                    name: "Call OI",
                    data: CE_array
                }, {
                    name: "Put OI",
                    data: PE_array
                }],
                chart: {
                    toolbar: {
                        show: !1
                    },
                    toolbar: {
                        show: !0,
                        tools: {
                            download: !1,
                            selection: !0,
                            zoom: !0,
                            zoomin: !0,
                            zoomout: !0,
                            pan: !0,
                            reset: 1,
                            customIcons: []
                        }
                    },
                    foreColor: "#ffffff",
                    type: "bar",
                    height: 530
                },
                plotOptions: {
                    bar: {
                        horizontal: !1,
                        columnWidth: "30%",
                        endingShape: "rounded"
                    }
                },
                dataLabels: {
                    enabled: !1
                },
                stroke: {
                    show: !0,
                    width: 2,
                    colors: ["transparent"]
                },
                xaxis: {
                    tickPlacement: "on",
                    categories: x_axis_categories,
                    title: {
                        style: {
                            fontSize: "1rem",
                            fontWeight: 600,
                            cssClass: "apexcharts-xaxis-title"
                        }
                    }
                },
                yaxis: {
                    title: {
                        text: "Open Interest",
                        style: {
                            fontSize: "1rem",
                            fontWeight: 600,
                            cssClass: "apexcharts-xaxis-title"
                        }
                    }
                },
                annotations: {
                    xaxis: [{
                        x: Open_Intrest_Tracker_atm,
                        borderColor: '#999',
                        borderType: 'dotted',
                        borderWidth: 1,
                        label: {
                            style: {
                                color: '#000',
                                fontSize: '12px'
                            },
                            text: 'ATM',
                            position: 'top',
                            orientation: 'horizontal',
                        }
                    }]
                },
                fill: {
                    opacity: 1
                },
                tooltip: {
                    y: {
                        formatter: function (t) {
                            return t
                        }
                    }
                }
            };
            c_chart = new ApexCharts(document.querySelector("#column_chart"), options), c_chart.render();
            counter_for_column_chart = true

            // Donut Chart
            var options1 = {
                chart: {
                    type: "donut",
                    width: '220',
                    height: '220'
                },
                responsive: [{
                    breakpoint: 1150,
                    options: {
                        chart: {
                            width: '200',
                            height: '200',
                        },
                        dataLabels: {
                            offsetX: 5,
                            offsetY: 0,
                            style: {
                                fontSize: "10px",
                                fontFamily: "Helvetica, Arial, sans-serif",
                                fontWeight: "bold"
                            }
                        }
                    }
                }, {
                    breakpoint: 992,
                    options: {
                        chart: {
                            width: '250',
                            height: '250',
                        },
                        dataLabels: {
                            offsetX: 5,
                            offsetY: 0,
                            style: {
                                fontSize: "10px",
                                fontFamily: "Helvetica, Arial, sans-serif",
                                fontWeight: "bold"
                            }
                        }
                    }
                }, {
                    breakpoint: 800,
                    options: {
                        chart: {
                            width: '200',
                            height: '200',
                        },
                        dataLabels: {
                            offsetX: 5,
                            offsetY: 0,
                            style: {
                                fontSize: "10px",
                                fontFamily: "Helvetica, Arial, sans-serif",
                                fontWeight: "bold"
                            }
                        }
                    }
                }],
                series: [PE_OI_total, CE_OI_total],
                labels: ["Total PE OI", "Total CE OI"],
                backgroundColor: "transparent",
                pieHole: .5,
                colors: ["#00d3c0", "#ff5253"],
                pieSliceTextStyle: {
                    color: "#ffffff"
                },
                sliceVisibilityThreshold: 0,
                fontSize: 17,
                chartArea: {
                    top: 40
                },
                pieSliceTextStyle: {
                    fontSize: 12
                },
                pieStartAngle: 50,
                isStacked: !0,
                enableInteractivity: !1,
                pieSliceBorderColor: "transparent",
                legend: {
                    show: !1,
                    position: "right",
                    horizontalAlign: "right",
                    labels: {
                        colors: "#ffffff",
                        useSeriesColors: !1
                    },
                    itemMargin: {
                        horizontal: 10,
                        vertical: 20
                    },
                    fontSize: 15,
                    markers: {
                        width: 12,
                        height: 12,
                        radius: 12
                    }
                },
                stroke: {
                    colors: "trasparant",
                    width: 0
                },
                plotOptions: {
                    pie: {
                        startAngle: 0,
                        endAngle: 360,
                        expandOnClick: !0,
                        offsetX: 0,
                        offsetY: 25,
                        customScale: 1.1,
                        dataLabels: {
                            position: "right",
                            offset: 0,
                            minAngleToShowLabel: 50
                        },
                        grid: {
                            borderColor: "#000000"
                        },
                        donut: {
                            size: "70%",
                            labels: {
                                colors: "#ffffff",
                                show: !0,
                                name: {
                                    color: "#ffffff",
                                    fontSize: 14
                                },
                                value: {
                                    color: "#ffffff",
                                    fontSize: 14
                                },
                                total: {
                                    color: "#ffffff"
                                }
                            }
                        }
                    }
                }
            };
            chart2 = new ApexCharts(document.querySelector("#donutchart1"), options1), chart2.render();
            counter_for_donut_chart = true

            call_INDEX_OI_CHANGE_API(ts1, ts2, "NIFTY 50", Nifty_exp_1)
            OI_Compass("NIFTY 50")
            Changes_in_Put_Call()

            let today = moment();
            let todays_day = today.format('DD-MM-YYYY')
            let API_day = moment.unix(Object.keys(Live_OI_data)[0]).format('DD-MM-YYYY')
            if (todays_day == API_day) {
                updateSlider("9:15", new Date().getTime())
            } else {
                updateSlider("9:15", "15:30")
            }

            // Grouped Horizontal Bar Chart 
            var options = {
                series: [{
                    name: "Call OI",
                    data: CE_array_OI_Compass
                }, {
                    name: "Put OI",
                    data: PE_array_OI_Compass
                }],
                chart: {
                    type: 'bar',
                    height: "625px",
                    toolbar: {
                        show: false,
                    },
                    foreColor: "#000",
                    events: {
                        click: (event, chartContext, dataPointIndex) => {
                            let temp = dataPointIndex['dataPointIndex']
                            let strike = dataPointIndex['config']['xaxis']['categories'][temp];


                            let temp_1 = dataPointIndex['seriesIndex']
                            let value_name = dataPointIndex['globals']['initialSeries'][temp_1]['data'][temp];

                            var p_c = ''
                            var idx = ''

                            if (temp_1 == 0) { logger.info("Name = CE"); p_c = 'CALL' }
                            else if (temp_1 == 1) { logger.info("Name = PE"); p_c = 'PUT' }

                            let exp = moment(Nifty_exp_1).format('DD MMM').toUpperCase()

                            idx = $('#nifty_btn').text()


                            let symbol = idx + " " + exp + " " + strike + " " + p_c
                            logger.info(symbol)
                            tw_charts(symbol)
                        }
                    },
                },
                plotOptions: {
                    bar: {
                        horizontal: true,
                        dataLabels: {
                            position: 'top',
                        },
                    }
                },
                dataLabels: {
                    enabled: true,
                    offsetX: 35,
                    style: {
                        fontSize: '12px',
                        colors: ['#fff']
                    }
                },
                stroke: {
                    show: false,
                },
                tooltip: {
                    shared: !1,
                    intersect: !0,
                    style: {
                        fontSize: '12px',
                        color: ['#333']
                    },
                },
                legend: {
                    show: false
                },
                xaxis: {
                    categories: x_axis_categories_OI_Compass,
                    colors: ["#fff"],
                    labels: {
                        style: {
                            fontSize: "14px"
                        }
                    }
                },
                yaxis: {
                    labels: {
                        formatter: function (t) {
                            return Math.floor(parseInt(t))
                        },
                        style: {
                            fontSize: "14px"
                        }
                    }
                },
                annotations: {
                    yaxis: [{
                        y: OI_Compass_atm_Final,
                        offsetX: 0,
                        offsetY: -3,
                        borderColor: "#ffffff",
                        label: {
                            style: {
                                color: "#123",
                                fontSize: '12px'
                            },
                            text: "ATM"
                        }
                    }]
                },
                grid: {
                    show: false
                },
                colors: ["#ff5253", "#00d3c0"]
            };
            chart = new ApexCharts(document.querySelector("#grouped_barchart"), options), chart.render();
            counter_for_horizontal_grouped_bar_chart = true

            // Bar Chart
            var donut_bar = {
                responsive: [{
                    breakpoint: 800,
                    options: {
                        chart: {
                            height: "auto"
                        }
                    }
                }],
                grid: {
                    borderColor: "#2e2e2e"
                },
                series: [{
                    name: "OI Chng",
                    data: [Change_PE_OI, Change_CE_OI]
                }],
                chart: {
                    type: "bar",
                    height: "95%",
                    toolbar: {
                        show: !1
                    },
                    foreColor: "#ffffff"
                },
                plotOptions: {
                    bar: {
                        horizontal: !1,
                        columnWidth: "45%",
                        endingShape: "rounded"
                    }
                },
                dataLabels: {
                    enabled: !1
                },
                stroke: {
                    show: !0,
                    width: 2,
                    colors: ["transparent"]
                },
                xaxis: {
                    categories: ["PE Chg", "CE Chg"]
                },
                yaxis: {
                    title: {}
                },
                fill: {
                    colors: ['#00d3c0', '#ff5253'],
                    opacity: 1
                },
                tooltip: {
                    y: {
                        formatter: function (t) {
                            return t
                        }
                    }
                }
            };
            chart1 = new ApexCharts(document.querySelector("#donutchart"), donut_bar), chart1.render();
            counter_for_bar_chart = true

            $("#donutchart path:eq(1)").css("fill", "#ff5253")
            Change_PE_OI > 0 ? $("#donutchart path:eq(0)").css("fill", "#00d3c0") : $("#donutchart path:eq(0)").css("fill", "#ff5253"),
                Change_CE_OI > 0 ? $("#donutchart path:eq(1)").css("fill", "#ff5253") : $("#donutchart path:eq(1)").css("fill", "#00d3c0");

            // On click Function of 5 BUTTONS [NIFTY 50, NIFTY BANK, NIFTY FIN SERVICE, MIDCAP, SENSEX]
            $("#nifty_btn").click(function () {
                $('#Candlestick_title').text('Nifty 50')
                Index_OI_Change_data = 0;
                Change_PE_OI = 0;
                Change_CE_OI = 0;
                CE_array_OI_Compass = [0, 0]
                PE_array_OI_Compass = [0, 0]
                x_axis_categories_OI_Compass = [0, 0]
                OI_Compass_atm_Final = 0
                CE_array = [0, 0]
                PE_array = [0, 0]
                x_axis_categories = 0
                Open_Intrest_Tracker_atm = 0
                PE_OI_total = 0
                CE_OI_total = 0
                Change_PE_OI = 0
                Change_CE_OI = 0

                $('#finnifty_body_row').hide();
                $('.nifty_banknifty').show();

                $("#nifty_btn").addClass("gb_active");
                $("#bnknifty_btn").removeClass("gb_active");
                $("#finnifty_btn").removeClass("gb_active");
                $("#unAuth_finnifty_btn").removeClass("gb_active");
                $("#midcap_btn").removeClass("gb_active");
                $("#unAuth_midcap_btn").removeClass("gb_active");
                $("#sensex_btn").removeClass("gb_active");
                $("#unAuth_sensex_btn").removeClass("gb_active");

                $('#col_barchart_name').text('Nifty 50 Open Interest Tracker');

                fetch_data()
            });
            $("#bnknifty_btn").click(function () {
                $('#Candlestick_title').text('Nifty Bank')
                Index_OI_Change_data = 0;
                Change_PE_OI = 0;
                Change_CE_OI = 0;
                CE_array_OI_Compass = [0, 0]
                PE_array_OI_Compass = [0, 0]
                x_axis_categories_OI_Compass = [0, 0]
                OI_Compass_atm_Final = 0
                CE_array = [0, 0]
                PE_array = [0, 0]
                x_axis_categories = 0
                Open_Intrest_Tracker_atm = 0
                PE_OI_total = 0
                CE_OI_total = 0
                Change_PE_OI = 0
                Change_CE_OI = 0

                $('#finnifty_body_row').hide();
                $('.nifty_banknifty').show();

                $("#nifty_btn").removeClass("gb_active");
                $("#bnknifty_btn").addClass("gb_active");
                $("#finnifty_btn").removeClass("gb_active");
                $("#unAuth_finnifty_btn").removeClass("gb_active");
                $("#midcap_btn").removeClass("gb_active");
                $("#unAuth_midcap_btn").removeClass("gb_active");
                $("#sensex_btn").removeClass("gb_active");
                $("#unAuth_sensex_btn").removeClass("gb_active");

                $('#col_barchart_name').text('Banknifty Open Interest Tracker');
                fetch_data()
            });
            $("#finnifty_btn").click(function () {
                $('#Candlestick_title').text('Nifty Fin Service')
                Index_OI_Change_data = 0;
                Change_PE_OI = 0;
                Change_CE_OI = 0;
                CE_array_OI_Compass = [0, 0]
                PE_array_OI_Compass = [0, 0]
                x_axis_categories_OI_Compass = [0, 0]
                OI_Compass_atm_Final = 0
                CE_array = [0, 0]
                PE_array = [0, 0]
                x_axis_categories = 0
                Open_Intrest_Tracker_atm = 0
                PE_OI_total = 0
                CE_OI_total = 0
                Change_PE_OI = 0
                Change_CE_OI = 0

                $('#finnifty_body_row').hide();
                $('.nifty_banknifty').show();

                $("#nifty_btn").removeClass("gb_active");
                $("#bnknifty_btn").removeClass("gb_active");
                $("#finnifty_btn").addClass("gb_active");
                $("#unAuth_finnifty_btn").removeClass("gb_active");
                $("#midcap_btn").removeClass("gb_active");
                $("#unAuth_midcap_btn").removeClass("gb_active");
                $("#sensex_btn").removeClass("gb_active");
                $("#unAuth_sensex_btn").removeClass("gb_active");

                $('#col_barchart_name').text('Finnifty Open Interest Tracker');
                fetch_data()
            });
            $("#unAuth_finnifty_btn").click(function () {
                // window.location.href = root + "/trade-with-tredcode";

                $("#nifty_btn").removeClass("gb_active");
                $("#bnknifty_btn").removeClass("gb_active");
                $("#finnifty_btn").removeClass("gb_active");
                $("#unAuth_finnifty_btn").addClass("gb_active");
                $("#midcap_btn").removeClass("gb_active");
                $("#unAuth_midcap_btn").removeClass("gb_active");
                $("#sensex_btn").removeClass("gb_active");
                $("#unAuth_sensex_btn").removeClass("gb_active");

                $('#finnifty_body_row').show();
                $('.nifty_banknifty').hide();

                $('#span_text_for_unauth').text('Get FinNifty and other features for Free by opening Dhan account using our link')
            });
            $("#midcap_btn").click(function () {
                $('#Candlestick_title').text('Midcap')
                Index_OI_Change_data = 0;
                Change_PE_OI = 0;
                Change_CE_OI = 0;
                CE_array_OI_Compass = [0, 0]
                PE_array_OI_Compass = [0, 0]
                x_axis_categories_OI_Compass = [0, 0]
                OI_Compass_atm_Final = 0
                CE_array = [0, 0]
                PE_array = [0, 0]
                x_axis_categories = 0
                Open_Intrest_Tracker_atm = 0
                PE_OI_total = 0
                CE_OI_total = 0
                Change_PE_OI = 0
                Change_CE_OI = 0

                $('#finnifty_body_row').hide();
                $('.nifty_banknifty').show();

                $("#nifty_btn").removeClass("gb_active");
                $("#bnknifty_btn").removeClass("gb_active");
                $("#finnifty_btn").removeClass("gb_active");
                $("#unAuth_finnifty_btn").removeClass("gb_active");
                $("#midcap_btn").addClass("gb_active");
                $("#unAuth_midcap_btn").removeClass("gb_active");
                $("#sensex_btn").removeClass("gb_active");
                $("#unAuth_sensex_btn").removeClass("gb_active");

                $('#col_barchart_name').text('Midcap Open Interest Tracker');
                fetch_data()
            });
            $("#unAuth_midcap_btn").click(function () {
                // window.location.href = root + "/trade-with-tredcode";

                $("#nifty_btn").removeClass("gb_active");
                $("#bnknifty_btn").removeClass("gb_active");
                $("#finnifty_btn").removeClass("gb_active");
                $("#unAuth_finnifty_btn").removeClass("gb_active");
                $("#midcap_btn").removeClass("gb_active");
                $("#unAuth_midcap_btn").addClass("gb_active");
                $("#sensex_btn").removeClass("gb_active");
                $("#unAuth_sensex_btn").removeClass("gb_active");

                $('#finnifty_body_row').show();
                $('.nifty_banknifty').hide();

                $('#span_text_for_unauth').text('Get Midcap and other features for Free by opening Dhan account using our link')
            });
            $("#sensex_btn").click(function () {
                $('#Candlestick_title').text('Sensex')
                Index_OI_Change_data = 0;
                Change_PE_OI = 0;
                Change_CE_OI = 0;
                CE_array_OI_Compass = [0, 0]
                PE_array_OI_Compass = [0, 0]
                x_axis_categories_OI_Compass = [0, 0]
                OI_Compass_atm_Final = 0
                CE_array = [0, 0]
                PE_array = [0, 0]
                x_axis_categories = 0
                Open_Intrest_Tracker_atm = 0
                PE_OI_total = 0
                CE_OI_total = 0
                Change_PE_OI = 0
                Change_CE_OI = 0

                $('#finnifty_body_row').hide();
                $('.nifty_banknifty').show();

                $("#nifty_btn").removeClass("gb_active");
                $("#bnknifty_btn").removeClass("gb_active");
                $("#finnifty_btn").removeClass("gb_active");
                $("#unAuth_finnifty_btn").removeClass("gb_active");
                $("#midcap_btn").removeClass("gb_active");
                $("#unAuth_midcap_btn").removeClass("gb_active");
                $("#sensex_btn").addClass("gb_active");
                $("#unAuth_sensex_btn").removeClass("gb_active");

                $('#col_barchart_name').text('Sensex Open Interest Tracker');
                fetch_data()
            });
            $("#unAuth_sensex_btn").click(function () {
                // window.location.href = root + "/trade-with-tredcode";

                $("#nifty_btn").removeClass("gb_active");
                $("#bnknifty_btn").removeClass("gb_active");
                $("#finnifty_btn").removeClass("gb_active");
                $("#unAuth_finnifty_btn").removeClass("gb_active");
                $("#midcap_btn").removeClass("gb_active");
                $("#unAuth_midcap_btn").removeClass("gb_active");
                $("#sensex_btn").removeClass("gb_active");
                $("#unAuth_sensex_btn").addClass("gb_active");

                $('#finnifty_body_row').show();
                $('.nifty_banknifty').hide();

                $('#span_text_for_unauth').text('Get Sensex and other features for Free by opening Dhan account using our link')
            });
            //Expiry Change
            $("#Expiry").change(function () {
                var x = $("#Expiry").prop("selectedIndex");
                if ($("#nifty_btn").hasClass("gb_active") && x == 1) {
                    call_LIVE_OI_API("NIFTY 50", Nifty_exp_2)
                    call_INDEX_OI_CHANGE_API(ts1, ts2, "NIFTY 50", Nifty_exp_2)
                    NIFTY_50_Open_Intrest_Tracker("NIFTY 50")
                    OI_Compass("NIFTY 50")
                    Changes_in_Put_Call()
                    update_chart()
                    update_chart_set_interval()
                } else if ($("#nifty_btn").hasClass("gb_active") && x == 0) {
                    call_LIVE_OI_API("NIFTY 50", Nifty_exp_1)
                    call_INDEX_OI_CHANGE_API(ts1, ts2, "NIFTY 50", Nifty_exp_1)
                    NIFTY_50_Open_Intrest_Tracker("NIFTY 50")
                    OI_Compass("NIFTY 50")
                    Changes_in_Put_Call()
                    update_chart()
                    update_chart_set_interval()
                } else if ($("#bnknifty_btn").hasClass("gb_active") && x == 1) {
                    call_LIVE_OI_API("NIFTY BANK", Nifty_exp_2)
                    call_INDEX_OI_CHANGE_API(ts1, ts2, "NIFTY BANK", Nifty_exp_2)
                    NIFTY_50_Open_Intrest_Tracker("NIFTY BANK")
                    OI_Compass("NIFTY BANK")
                    Changes_in_Put_Call()
                    update_chart()
                    update_chart_set_interval()
                } else if ($("#bnknifty_btn").hasClass("gb_active") && x == 0) {
                    call_LIVE_OI_API("NIFTY BANK", Nifty_exp_1)
                    call_INDEX_OI_CHANGE_API(ts1, ts2, "NIFTY BANK", Nifty_exp_1)
                    NIFTY_50_Open_Intrest_Tracker("NIFTY BANK")
                    OI_Compass("NIFTY BANK")
                    Changes_in_Put_Call()
                    update_chart()
                    update_chart_set_interval()
                } else if ($("#finnifty_btn").hasClass("gb_active") && x == 1) {
                    call_LIVE_OI_API("NIFTY FIN SERVICE", Nifty_exp_2)
                    call_INDEX_OI_CHANGE_API(ts1, ts2, "NIFTY FIN SERVICE", Nifty_exp_2)
                    NIFTY_50_Open_Intrest_Tracker("NIFTY FIN SERVICE")
                    OI_Compass("NIFTY FIN SERVICE")
                    Changes_in_Put_Call()
                    update_chart()
                    update_chart_set_interval()
                } else if ($("#finnifty_btn").hasClass("gb_active") && x == 0) {
                    call_LIVE_OI_API("NIFTY FIN SERVICE", Nifty_exp_1)
                    call_INDEX_OI_CHANGE_API(ts1, ts2, "NIFTY FIN SERVICE", Nifty_exp_1)
                    NIFTY_50_Open_Intrest_Tracker("NIFTY FIN SERVICE")
                    OI_Compass("NIFTY FIN SERVICE")
                    Changes_in_Put_Call()
                    update_chart()
                    update_chart_set_interval()
                } else if ($("#midcap_btn").hasClass("gb_active") && x == 1) {
                    call_LIVE_OI_API("NIFTY MID SELECT", Nifty_exp_2)
                    call_INDEX_OI_CHANGE_API(ts1, ts2, "NIFTY MID SELECT", Nifty_exp_2)
                    NIFTY_50_Open_Intrest_Tracker("NIFTY MID SELECT")
                    OI_Compass("NIFTY MID SELECT")
                    Changes_in_Put_Call()
                    update_chart()
                    update_chart_set_interval()
                } else if ($("#midcap_btn").hasClass("gb_active") && x == 0) {
                    call_LIVE_OI_API("NIFTY MID SELECT", Nifty_exp_1)
                    call_INDEX_OI_CHANGE_API(ts1, ts2, "NIFTY MID SELECT", Nifty_exp_1)
                    NIFTY_50_Open_Intrest_Tracker("NIFTY MID SELECT")
                    OI_Compass("NIFTY MID SELECT")
                    Changes_in_Put_Call()
                    update_chart()
                    update_chart_set_interval()
                } else if ($("#sensex_btn").hasClass("gb_active") && x == 1) {
                    call_LIVE_OI_API("SENSEX", Nifty_exp_2)
                    call_INDEX_OI_CHANGE_API(ts1, ts2, "SENSEX", Nifty_exp_2)
                    NIFTY_50_Open_Intrest_Tracker("SENSEX")
                    OI_Compass("SENSEX")
                    Changes_in_Put_Call()
                    update_chart()
                    update_chart_set_interval()
                } else if ($("#sensex_btn").hasClass("gb_active") && x == 0) {
                    call_LIVE_OI_API("SENSEX", Nifty_exp_1)
                    call_INDEX_OI_CHANGE_API(ts1, ts2, "SENSEX", Nifty_exp_1)
                    NIFTY_50_Open_Intrest_Tracker("SENSEX")
                    OI_Compass("SENSEX")
                    Changes_in_Put_Call()
                    update_chart()
                    update_chart_set_interval()
                }
            })
        } else if (page_access[4]['idx'] == 0) {

            $('.blur-background').removeClass('d-none')
            $('.lock-icon').removeClass('d-none')

            var jsonData;

            fetch("json/table.json").then(response => response.json()).then(data => {
                jsonData = data;
                index_analysis_call_OI = JSON.parse(jsonData.index_analysis_call_OI)
                index_analysis_put_OI = JSON.parse(jsonData.index_analysis_put_OI)
                index_analysis_Donut_Chart = JSON.parse(jsonData.index_analysis_Donut_Chart)
                index_analysis_Bar_Chart = JSON.parse(jsonData.index_analysis_Bar_Chart)

                print_chart()
            });

            function print_chart() {
                var options = {
                    grid: {
                        borderColor: "#2e2e2e"
                    },
                    responsive: [{
                        breakpoint: 800,
                        options: {
                            dataLabels: {},
                            plotOptions: {
                                bar: {
                                    horizontal: !1,
                                    columnWidth: "75%",
                                    endingShape: "rounded"
                                }
                            },
                            yaxis: {
                                show: true,
                                labels: {
                                    show: true,
                                    align: 'left',
                                    rotate: 270
                                }
                            }
                        }
                    }],
                    colors: ["#ff5253", "#00d3c0"],
                    legend: {
                        fontSize: "16px",
                        labels: {
                            colors: ["#ffffff"]
                        }
                    },
                    series: [{
                        name: "Call OI",
                        data: index_analysis_call_OI
                    }, {
                        name: "Put OI",
                        data: index_analysis_put_OI
                    }],
                    chart: {
                        toolbar: {
                            show: !1
                        },
                        toolbar: {
                            show: !0,
                            tools: {
                                download: !1,
                                selection: !0,
                                zoom: !0,
                                zoomin: !0,
                                zoomout: !0,
                                pan: !0,
                                reset: 1,
                                customIcons: []
                            }
                        },
                        foreColor: "#ffffff",
                        type: "bar",
                        height: 530
                    },
                    plotOptions: {
                        bar: {
                            horizontal: !1,
                            columnWidth: "30%",
                            endingShape: "rounded"
                        }
                    },
                    dataLabels: {
                        enabled: !1
                    },
                    stroke: {
                        show: !0,
                        width: 2,
                        colors: ["transparent"]
                    },
                    xaxis: {
                        tickPlacement: "on",
                        categories: ['18850', '18900', '18950', '19000', '19050', '19100', '19150', '19200', '19250', '19300', '19350', '19400', '19450', '19500', '19550', '19600', '19650', '19700', '19750', '19800', '19850'],
                        title: {
                            style: {
                                fontSize: "1rem",
                                fontWeight: 600,
                                cssClass: "apexcharts-xaxis-title"
                            }
                        }
                    },
                    yaxis: {
                        title: {
                            text: "Open Interest",
                            style: {
                                fontSize: "1rem",
                                fontWeight: 600,
                                cssClass: "apexcharts-xaxis-title"
                            }
                        }
                    },
                    annotations: {
                        xaxis: [{
                            x: '19350',
                            borderColor: '#999',
                            borderType: 'dotted',
                            borderWidth: 1,
                            label: {
                                style: {
                                    color: '#000',
                                    fontSize: '12px'
                                },
                                text: 'ATM',
                                position: 'top',
                                orientation: 'horizontal',
                            }
                        }]
                    },
                    fill: {
                        opacity: 1
                    },
                    tooltip: {
                        y: {
                            formatter: function (t) {
                                return t
                            }
                        }
                    }
                };
                c_chart = new ApexCharts(document.querySelector("#column_chart"), options), c_chart.render();
                counter_for_column_chart = true

                // Donut Chart
                var options1 = {
                    chart: {
                        type: "donut",
                        width: '220',
                        height: '220'
                    },
                    responsive: [{
                        breakpoint: 1150,
                        options: {
                            chart: {
                                width: '200',
                                height: '200',
                            },
                            dataLabels: {
                                offsetX: 5,
                                offsetY: 0,
                                style: {
                                    fontSize: "10px",
                                    fontFamily: "Helvetica, Arial, sans-serif",
                                    fontWeight: "bold"
                                }
                            }
                        }
                    }, {
                        breakpoint: 992,
                        options: {
                            chart: {
                                width: '250',
                                height: '250',
                            },
                            dataLabels: {
                                offsetX: 5,
                                offsetY: 0,
                                style: {
                                    fontSize: "10px",
                                    fontFamily: "Helvetica, Arial, sans-serif",
                                    fontWeight: "bold"
                                }
                            }
                        }
                    }, {
                        breakpoint: 800,
                        options: {
                            chart: {
                                width: '200',
                                height: '200',
                            },
                            dataLabels: {
                                offsetX: 5,
                                offsetY: 0,
                                style: {
                                    fontSize: "10px",
                                    fontFamily: "Helvetica, Arial, sans-serif",
                                    fontWeight: "bold"
                                }
                            }
                        }
                    }],
                    series: index_analysis_Donut_Chart,
                    labels: ["Total PE OI", "Total CE OI"],
                    backgroundColor: "transparent",
                    pieHole: .5,
                    colors: ["#00d3c0", "#ff5253"],
                    pieSliceTextStyle: {
                        color: "#ffffff"
                    },
                    sliceVisibilityThreshold: 0,
                    fontSize: 17,
                    chartArea: {
                        top: 40
                    },
                    pieSliceTextStyle: {
                        fontSize: 12
                    },
                    pieStartAngle: 50,
                    isStacked: !0,
                    enableInteractivity: !1,
                    pieSliceBorderColor: "transparent",
                    legend: {
                        show: !1,
                        position: "right",
                        horizontalAlign: "right",
                        labels: {
                            colors: "#ffffff",
                            useSeriesColors: !1
                        },
                        itemMargin: {
                            horizontal: 10,
                            vertical: 20
                        },
                        fontSize: 15,
                        markers: {
                            width: 12,
                            height: 12,
                            radius: 12
                        }
                    },
                    stroke: {
                        colors: "trasparant",
                        width: 0
                    },
                    plotOptions: {
                        pie: {
                            startAngle: 0,
                            endAngle: 360,
                            expandOnClick: !0,
                            offsetX: 0,
                            offsetY: 25,
                            customScale: 1.1,
                            dataLabels: {
                                position: "right",
                                offset: 0,
                                minAngleToShowLabel: 50
                            },
                            grid: {
                                borderColor: "#000000"
                            },
                            donut: {
                                size: "70%",
                                labels: {
                                    colors: "#ffffff",
                                    show: !0,
                                    name: {
                                        color: "#ffffff",
                                        fontSize: 14
                                    },
                                    value: {
                                        color: "#ffffff",
                                        fontSize: 14
                                    },
                                    total: {
                                        color: "#ffffff"
                                    }
                                }
                            }
                        }
                    }
                };
                chart2 = new ApexCharts(document.querySelector("#donutchart1"), options1), chart2.render();
                counter_for_donut_chart = true

                // Grouped Horizontal Bar Chart 
                var options = {
                    series: [{
                        name: "Call OI",
                        data: index_analysis_call_OI
                    }, {
                        name: "Put OI",
                        data: index_analysis_put_OI
                    }],
                    chart: {
                        type: 'bar',
                        height: "625px",
                        toolbar: {
                            show: false,
                        },
                        foreColor: "#000",
                    },
                    plotOptions: {
                        bar: {
                            horizontal: true,
                            dataLabels: {
                                position: 'top',
                            },
                        }
                    },
                    dataLabels: {
                        enabled: true,
                        offsetX: 35,
                        style: {
                            fontSize: '12px',
                            colors: ['#fff']
                        }
                    },
                    stroke: {
                        show: false,
                    },
                    tooltip: {
                        shared: !1,
                        intersect: !0,
                        style: {
                            fontSize: '12px',
                            color: ['#333']
                        },
                    },
                    legend: {
                        show: false
                    },
                    xaxis: {
                        categories: ['18850', '18900', '18950', '19000', '19050', '19100', '19150', '19200', '19250', '19300', '19350', '19400', '19450', '19500', '19550', '19600', '19650', '19700', '19750', '19800', '19850'],
                        labels: {
                            style: {
                                fontSize: "14px"
                            }
                        }
                    },
                    yaxis: {
                        labels: {
                            formatter: function (t) {
                                return Math.floor(parseInt(t))
                            },
                            style: {
                                fontSize: "14px"
                            }
                        }
                    },
                    annotations: {
                        yaxis: [{
                            y: '19350',
                            offsetX: 0,
                            offsetY: -3,
                            borderColor: "#ffffff",
                            label: {
                                style: {
                                    color: "#123",
                                    fontSize: '12px'
                                },
                                text: "ATM"
                            }
                        }]
                    },
                    grid: {
                        show: false
                    },
                    colors: ["#ff5253", "#00d3c0"]
                };
                chart = new ApexCharts(document.querySelector("#grouped_barchart"), options), chart.render();
                counter_for_horizontal_grouped_bar_chart = true

                // Bar Chart
                var donut_bar = {
                    responsive: [{
                        breakpoint: 800,
                        options: {
                            chart: {
                                height: "auto"
                            }
                        }
                    }],
                    grid: {
                        borderColor: "#2e2e2e"
                    },
                    series: [{
                        name: "OI Chng",
                        data: index_analysis_Bar_Chart
                    }],
                    chart: {
                        type: "bar",
                        height: "95%",
                        toolbar: {
                            show: !1
                        },
                        foreColor: "#ffffff"
                    },
                    plotOptions: {
                        bar: {
                            horizontal: !1,
                            columnWidth: "45%",
                            endingShape: "rounded"
                        }
                    },
                    dataLabels: {
                        enabled: !1
                    },
                    stroke: {
                        show: !0,
                        width: 2,
                        colors: ["transparent"]
                    },
                    xaxis: {
                        categories: ["PE Chg", "CE Chg"]
                    },
                    yaxis: {
                        title: {}
                    },
                    fill: {
                        colors: ['#00d3c0', '#ff5253'],
                        opacity: 1
                    },
                    tooltip: {
                        y: {
                            formatter: function (t) {
                                return t
                            }
                        }
                    }
                };
                chart1 = new ApexCharts(document.querySelector("#donutchart"), donut_bar), chart1.render();
                counter_for_bar_chart = true

                $("#donutchart path:eq(1)").css("fill", "#ff5253")
                595818 > 0 ? $("#donutchart path:eq(0)").css("fill", "#00d3c0") : $("#donutchart path:eq(0)").css("fill", "#ff5253"),
                    462504 > 0 ? $("#donutchart path:eq(1)").css("fill", "#ff5253") : $("#donutchart path:eq(1)").css("fill", "#00d3c0");

                Change_PE_OI = 595818
                Change_CE_OI = 462504
            }
        }
    } else if (page_access[2] == 1) {
        var jsonData;

        fetch("json/table.json").then(response => response.json()).then(data => {
            jsonData = data;
            index_analysis_call_OI = JSON.parse(jsonData.index_analysis_call_OI)
            index_analysis_put_OI = JSON.parse(jsonData.index_analysis_put_OI)
            index_analysis_Donut_Chart = JSON.parse(jsonData.index_analysis_Donut_Chart)
            index_analysis_Bar_Chart = JSON.parse(jsonData.index_analysis_Bar_Chart)

            print_chart()
        });

        function print_chart() {
            var options = {
                grid: {
                    borderColor: "#2e2e2e"
                },
                responsive: [{
                    breakpoint: 800,
                    options: {
                        dataLabels: {},
                        plotOptions: {
                            bar: {
                                horizontal: !1,
                                columnWidth: "75%",
                                endingShape: "rounded"
                            }
                        },
                        yaxis: {
                            show: true,
                            labels: {
                                show: true,
                                align: 'left',
                                rotate: 270
                            }
                        }
                    }
                }],
                colors: ["#ff5253", "#00d3c0"],
                legend: {
                    fontSize: "16px",
                    labels: {
                        colors: ["#ffffff"]
                    }
                },
                series: [{
                    name: "Call OI",
                    data: index_analysis_call_OI
                }, {
                    name: "Put OI",
                    data: index_analysis_put_OI
                }],
                chart: {
                    toolbar: {
                        show: !1
                    },
                    toolbar: {
                        show: !0,
                        tools: {
                            download: !1,
                            selection: !0,
                            zoom: !0,
                            zoomin: !0,
                            zoomout: !0,
                            pan: !0,
                            reset: 1,
                            customIcons: []
                        }
                    },
                    foreColor: "#ffffff",
                    type: "bar",
                    height: 530
                },
                plotOptions: {
                    bar: {
                        horizontal: !1,
                        columnWidth: "30%",
                        endingShape: "rounded"
                    }
                },
                dataLabels: {
                    enabled: !1
                },
                stroke: {
                    show: !0,
                    width: 2,
                    colors: ["transparent"]
                },
                xaxis: {
                    tickPlacement: "on",
                    categories: ['18850', '18900', '18950', '19000', '19050', '19100', '19150', '19200', '19250', '19300', '19350', '19400', '19450', '19500', '19550', '19600', '19650', '19700', '19750', '19800', '19850'],
                    title: {
                        style: {
                            fontSize: "1rem",
                            fontWeight: 600,
                            cssClass: "apexcharts-xaxis-title"
                        }
                    }
                },
                yaxis: {
                    title: {
                        text: "Open Interest",
                        style: {
                            fontSize: "1rem",
                            fontWeight: 600,
                            cssClass: "apexcharts-xaxis-title"
                        }
                    }
                },
                annotations: {
                    xaxis: [{
                        x: '19350',
                        borderColor: '#999',
                        borderType: 'dotted',
                        borderWidth: 1,
                        label: {
                            style: {
                                color: '#000',
                                fontSize: '12px'
                            },
                            text: 'ATM',
                            position: 'top',
                            orientation: 'horizontal',
                        }
                    }]
                },
                fill: {
                    opacity: 1
                },
                tooltip: {
                    y: {
                        formatter: function (t) {
                            return t
                        }
                    }
                }
            };
            c_chart = new ApexCharts(document.querySelector("#column_chart"), options), c_chart.render();
            counter_for_column_chart = true

            // Donut Chart
            var options1 = {
                chart: {
                    type: "donut",
                    width: '220',
                    height: '220'
                },
                responsive: [{
                    breakpoint: 1150,
                    options: {
                        chart: {
                            width: '200',
                            height: '200',
                        },
                        dataLabels: {
                            offsetX: 5,
                            offsetY: 0,
                            style: {
                                fontSize: "10px",
                                fontFamily: "Helvetica, Arial, sans-serif",
                                fontWeight: "bold"
                            }
                        }
                    }
                }, {
                    breakpoint: 992,
                    options: {
                        chart: {
                            width: '250',
                            height: '250',
                        },
                        dataLabels: {
                            offsetX: 5,
                            offsetY: 0,
                            style: {
                                fontSize: "10px",
                                fontFamily: "Helvetica, Arial, sans-serif",
                                fontWeight: "bold"
                            }
                        }
                    }
                }, {
                    breakpoint: 800,
                    options: {
                        chart: {
                            width: '200',
                            height: '200',
                        },
                        dataLabels: {
                            offsetX: 5,
                            offsetY: 0,
                            style: {
                                fontSize: "10px",
                                fontFamily: "Helvetica, Arial, sans-serif",
                                fontWeight: "bold"
                            }
                        }
                    }
                }],
                series: index_analysis_Donut_Chart,
                labels: ["Total PE OI", "Total CE OI"],
                backgroundColor: "transparent",
                pieHole: .5,
                colors: ["#00d3c0", "#ff5253"],
                pieSliceTextStyle: {
                    color: "#ffffff"
                },
                sliceVisibilityThreshold: 0,
                fontSize: 17,
                chartArea: {
                    top: 40
                },
                pieSliceTextStyle: {
                    fontSize: 12
                },
                pieStartAngle: 50,
                isStacked: !0,
                enableInteractivity: !1,
                pieSliceBorderColor: "transparent",
                legend: {
                    show: !1,
                    position: "right",
                    horizontalAlign: "right",
                    labels: {
                        colors: "#ffffff",
                        useSeriesColors: !1
                    },
                    itemMargin: {
                        horizontal: 10,
                        vertical: 20
                    },
                    fontSize: 15,
                    markers: {
                        width: 12,
                        height: 12,
                        radius: 12
                    }
                },
                stroke: {
                    colors: "trasparant",
                    width: 0
                },
                plotOptions: {
                    pie: {
                        startAngle: 0,
                        endAngle: 360,
                        expandOnClick: !0,
                        offsetX: 0,
                        offsetY: 25,
                        customScale: 1.1,
                        dataLabels: {
                            position: "right",
                            offset: 0,
                            minAngleToShowLabel: 50
                        },
                        grid: {
                            borderColor: "#000000"
                        },
                        donut: {
                            size: "70%",
                            labels: {
                                colors: "#ffffff",
                                show: !0,
                                name: {
                                    color: "#ffffff",
                                    fontSize: 14
                                },
                                value: {
                                    color: "#ffffff",
                                    fontSize: 14
                                },
                                total: {
                                    color: "#ffffff"
                                }
                            }
                        }
                    }
                }
            };
            chart2 = new ApexCharts(document.querySelector("#donutchart1"), options1), chart2.render();
            counter_for_donut_chart = true

            // Grouped Horizontal Bar Chart 
            var options = {
                series: [{
                    name: "Call OI",
                    data: index_analysis_call_OI
                }, {
                    name: "Put OI",
                    data: index_analysis_put_OI
                }],
                chart: {
                    type: 'bar',
                    height: "625px",
                    toolbar: {
                        show: false,
                    },
                    foreColor: "#000",
                },
                plotOptions: {
                    bar: {
                        horizontal: true,
                        dataLabels: {
                            position: 'top',
                        },
                    }
                },
                dataLabels: {
                    enabled: true,
                    offsetX: 35,
                    style: {
                        fontSize: '12px',
                        colors: ['#fff']
                    }
                },
                stroke: {
                    show: false,
                },
                tooltip: {
                    shared: !1,
                    intersect: !0,
                    style: {
                        fontSize: '12px',
                        color: ['#333']
                    },
                },
                legend: {
                    show: false
                },
                xaxis: {
                    categories: ['18850', '18900', '18950', '19000', '19050', '19100', '19150', '19200', '19250', '19300', '19350', '19400', '19450', '19500', '19550', '19600', '19650', '19700', '19750', '19800', '19850'],
                    labels: {
                        style: {
                            fontSize: "14px"
                        }
                    }
                },
                yaxis: {
                    labels: {
                        formatter: function (t) {
                            return Math.floor(parseInt(t))
                        },
                        style: {
                            fontSize: "14px"
                        }
                    }
                },
                annotations: {
                    yaxis: [{
                        y: '19350',
                        offsetX: 0,
                        offsetY: -3,
                        borderColor: "#ffffff",
                        label: {
                            style: {
                                color: "#123",
                                fontSize: '12px'
                            },
                            text: "ATM"
                        }
                    }]
                },
                grid: {
                    show: false
                },
                colors: ["#ff5253", "#00d3c0"]
            };
            chart = new ApexCharts(document.querySelector("#grouped_barchart"), options), chart.render();
            counter_for_horizontal_grouped_bar_chart = true

            // Bar Chart
            var donut_bar = {
                responsive: [{
                    breakpoint: 800,
                    options: {
                        chart: {
                            height: "auto"
                        }
                    }
                }],
                grid: {
                    borderColor: "#2e2e2e"
                },
                series: [{
                    name: "OI Chng",
                    data: index_analysis_Bar_Chart
                }],
                chart: {
                    type: "bar",
                    height: "95%",
                    toolbar: {
                        show: !1
                    },
                    foreColor: "#ffffff"
                },
                plotOptions: {
                    bar: {
                        horizontal: !1,
                        columnWidth: "45%",
                        endingShape: "rounded"
                    }
                },
                dataLabels: {
                    enabled: !1
                },
                stroke: {
                    show: !0,
                    width: 2,
                    colors: ["transparent"]
                },
                xaxis: {
                    categories: ["PE Chg", "CE Chg"]
                },
                yaxis: {
                    title: {}
                },
                fill: {
                    colors: ['#00d3c0', '#ff5253'],
                    opacity: 1
                },
                tooltip: {
                    y: {
                        formatter: function (t) {
                            return t
                        }
                    }
                }
            };
            chart1 = new ApexCharts(document.querySelector("#donutchart"), donut_bar), chart1.render();
            counter_for_bar_chart = true

            $("#donutchart path:eq(1)").css("fill", "#ff5253")
            595818 > 0 ? $("#donutchart path:eq(0)").css("fill", "#00d3c0") : $("#donutchart path:eq(0)").css("fill", "#ff5253"),
                462504 > 0 ? $("#donutchart path:eq(1)").css("fill", "#ff5253") : $("#donutchart path:eq(1)").css("fill", "#00d3c0");

            Change_PE_OI = 595818
            Change_CE_OI = 462504
        }
    }

    $(window).on("resize", function () {
        $("#donutchart path:eq(1)").css("fill", "#ff5253")
        Change_PE_OI > 0 ? $("#donutchart path:eq(0)").css("fill", "#00d3c0") : $("#donutchart path:eq(0)").css("fill", "#ff5253"),
            Change_CE_OI > 0 ? $("#donutchart path:eq(1)").css("fill", "#ff5253") : $("#donutchart path:eq(1)").css("fill", "#00d3c0");

        setTimeout(() => {
            $("#donutchart path:eq(1)").css("fill", "#ff5253")
            Change_PE_OI > 0 ? $("#donutchart path:eq(0)").css("fill", "#00d3c0") : $("#donutchart path:eq(0)").css("fill", "#ff5253"),
                Change_CE_OI > 0 ? $("#donutchart path:eq(1)").css("fill", "#ff5253") : $("#donutchart path:eq(1)").css("fill", "#00d3c0");
        }, 500);
    });
})

// Enhanced initialization and event listeners for comprehensive index analysis
$(document).ready(function() {
    // Initialize with NIFTY50
    switchIndex('NIFTY50');
    
    // Button click handlers for all indices
    $('#nifty_btn').click(() => switchIndex('NIFTY50'));
    $('#bnknifty_btn').click(() => switchIndex('BANKNIFTY'));
    $('#finnifty_btn').click(() => switchIndex('FINNIFTY'));
    $('#midcap_btn').click(() => switchIndex('MIDCAP'));
    $('#sensex_btn').click(() => switchIndex('SENSEX'));
    
    // Timeframe selector for candlestick chart
    $('#timeframe_selector').change(function() {
        currentTimeframe = $(this).val();
        if (currentIndex) {
            loadComprehensiveAnalysis(SUPPORTED_INDICES[currentIndex].api_name);
        }
    });
    
    // Heatmap sorting controls
    $('#heatmap_sort_price').click(function() {
        // Reload heatmap sorted by price change
        if (currentIndex) {
            loadComprehensiveAnalysis(SUPPORTED_INDICES[currentIndex].api_name);
        }
    });
    
    $('#heatmap_sort_volume').click(function() {
        // Reload heatmap sorted by volume
        if (currentIndex) {
            loadComprehensiveAnalysis(SUPPORTED_INDICES[currentIndex].api_name);
        }
    });
    
    // Auto-refresh every 30 seconds for live data
    setInterval(() => {
        if (currentIndex) {
            loadComprehensiveAnalysis(SUPPORTED_INDICES[currentIndex].api_name);
        }
    }, 30000);
    
    // Handle window resize for responsive charts
    $(window).on('resize', function() {
        if (candlestickChart) candlestickChart.resize();
        if (heatmapChart) heatmapChart.resize();
    });
});