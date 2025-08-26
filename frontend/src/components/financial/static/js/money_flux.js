/**
 * Money Flux.js - Unified Param System Implementation
 * 
 * This file uses the unified param format:
 * - Symbol: Stock/Index identifier
 * - param_0: Last Trading Price (LTP) - used for price axis in charts
 * - param_1: Previous Close Price
 * - param_2: % Change from previous close - used for standard heatmap color scale
 * - param_3: Money flux intensity/momentum
 * - param_4: DateTime (YYYY-MM-DD HH:mm:ss)
 * 
 * Note: In money flux context, param_0 is used for flux value visualization.
 * Heatmaps may use param_0 for flux intensity or param_2 for standard % change coloring.
 */

route = "http://localhost:8000/api/money_flux";
legacy_route = "http://localhost:8000/api/moneyflux";

// Enhanced global variables for professional trading
let sentimentData = {};
let pcrData = {};
let volumeHistogramData = {};
let currentSentimentInterval = null;
let currentPcrInterval = null;
let currentVolumeInterval = null;

// Enhanced API functions for professional trading features
const call_Enhanced_Sentiment_API = async (script, expiry = null) => {
  try {
    const url = `${legacy_route}/sentiment?index=${script}${expiry ? `&expiry=${expiry}` : ''}`;
    const response = await fetch(url);
    const data = await response.json();
    sentimentData = data;
    update_sentiment_dial(data);
    return data;
  } catch (error) {
    console.error('Enhanced Sentiment API Error:', error);
    sentimentData = {
      index: script,
      sentimentScore: 0,
      sentimentDirection: 'neutral'
    };
    update_sentiment_dial(sentimentData);
    return sentimentData;
  }
};

const call_Enhanced_PCR_API = async (script, expiry = null) => {
  try {
    const url = `${legacy_route}/pcr?index=${script}${expiry ? `&expiry=${expiry}` : ''}`;
    const response = await fetch(url);
    const data = await response.json();
    pcrData = data;
    update_pcr_dial(data);
    return data;
  } catch (error) {
    console.error('Enhanced PCR API Error:', error);
    pcrData = {
      index: script,
      pcrRatio: 1.0,
      pcrChange: 0
    };
    update_pcr_dial(pcrData);
    return pcrData;
  }
};

// Enhanced volume histogram rendering
const render_enhanced_volume_histogram = (volumeHistogramData) => {
  if (!volumeHistogramData || !volumeHistogramData.volumeBars) {
    console.warn('No volume histogram data available');
    return;
  }
  
  try {
    // Find chart container for volume histogram
    const chartContainer = document.getElementById('chart_2');
    if (!chartContainer) {
      console.warn('Chart container for volume histogram not found');
      return;
    }
    
    // Process volume bars for ApexCharts format
    const volumeBars = volumeHistogramData.volumeBars.map(bar => ({
      x: bar.strikePrice || bar.timestamp,
      y: Math.abs(bar.volume),
      fillColor: bar.color || '#0DAD8D'
    }));
    
    // Separate positive and negative volume bars
    const positiveVolume = volumeBars.filter(bar => bar.y >= 0);
    const negativeVolume = volumeBars.filter(bar => bar.y < 0).map(bar => ({
      ...bar,
      y: Math.abs(bar.y) // Make positive for display
    }));
    
    // Enhanced volume histogram chart configuration
    const histogramOptions = {
      series: [{
        name: 'Call Volume',
        data: positiveVolume
      }, {
        name: 'Put Volume', 
        data: negativeVolume
      }],
      chart: {
        type: 'bar',
        height: 350,
        background: 'transparent',
        toolbar: {
          show: false
        }
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '70%',
          distributed: true
        }
      },
      dataLabels: {
        enabled: false
      },
      legend: {
        show: true,
        labels: {
          colors: '#fff'
        }
      },
      xaxis: {
        type: 'category',
        labels: {
          style: {
            colors: '#fff'
          }
        }
      },
      yaxis: {
        labels: {
          style: {
            colors: '#fff'
          }
        }
      },
      theme: {
        mode: 'dark'
      },
      colors: ['#0DAD8D', '#F15B46'],
      title: {
        text: `Volume Histogram - ${volumeHistogramData.index}`,
        style: {
          color: '#fff'
        }
      }
    };
    
    // Destroy existing chart if it exists
    if (window.volumeHistogramChart) {
      window.volumeHistogramChart.destroy();
    }
    
    // Create new volume histogram chart
    window.volumeHistogramChart = new ApexCharts(chartContainer, histogramOptions);
    window.volumeHistogramChart.render();
    
  } catch (error) {
    console.error('Volume histogram rendering error:', error);
  }
};

// Enhanced chart update function combining OHLC and volume histogram
const update_enhanced_moneyflux_charts = async (indexName, timeframe = '3m') => {
  try {
    const selectedExpiry = document.getElementById('Expiry')?.value;
    
    // Update main OHLC chart
    await enhanced_ohlc_and_Volume(indexName, timeframe);
    
    // Update volume histogram
    const volumeHistogramData = await call_Enhanced_Volume_Histogram_API(indexName, selectedExpiry);
    render_enhanced_volume_histogram(volumeHistogramData);
    
    // Update title
    const titleElement = document.getElementById('Candlestick_title');
    if (titleElement) {
      const indexDisplayNames = {
        'NIFTY50': 'Nifty 50',
        'BANKNIFTY': 'Bank Nifty',
        'FINNIFTY': 'Fin Nifty',
        'MIDCAP': 'Nifty Midcap 50',
        'SENSEX': 'BSE Sensex'
      };
      titleElement.textContent = `${indexDisplayNames[indexName] || indexName} ${timeframe.toUpperCase()}`;
    }
    
  } catch (error) {
    console.error('Enhanced chart update error:', error);
  }
};

const call_Enhanced_OHLC_API = async (script, timeframe = '3m') => {
  try {
    const url = `${legacy_route}/chart?index=${script}&timeframe=${timeframe}`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Enhanced OHLC API Error:', error);
    return {
      index: script,
      timeframe: timeframe,
      ohlcData: [],
      volumeData: []
    };
  }
};

const call_Enhanced_Expiry_API = async (script) => {
  try {
    const url = `${legacy_route}/expiry?index=${script}`;
    const response = await fetch(url);
    const data = await response.json();
    populate_enhanced_expiry_dropdown(data);
    return data;
  } catch (error) {
    console.error('Enhanced Expiry API Error:', error);
    return {
      index: script,
      expiries: [],
      currentExpiry: null
    };
  }
};

// Enhanced dial update functions with complex sentiment analysis
const update_sentiment_dial = (data) => {
  const sentimentScore = data.sentimentScore || 0;
  const direction = data.sentimentDirection || 'neutral';
  
  // Update sentiment dial colors and position based on score
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
};

const update_pcr_dial = (data) => {
  const pcrRatio = data.pcrRatio || 1.0;
  const pcrChange = data.pcrChange || 0;
  
  // Update PCR dial colors and position based on ratio
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
};

// Enhanced multi-expiry dropdown population
const populate_enhanced_expiry_dropdown = (data) => {
  const expiryDropdown = document.getElementById('Expiry');
  if (!expiryDropdown || !data.expiries) return;
  
  // Clear existing options
  expiryDropdown.innerHTML = '';
  
  // Populate with new expiry options
  data.expiries.forEach((expiry, index) => {
    const option = document.createElement('option');
    option.value = expiry.label;
    option.textContent = `${expiry.label}${expiry.isWeekly ? ' (W)' : ''}`;
    option.id = `expiry_option_${index}`;
    expiryDropdown.appendChild(option);
  });
  
  // Set default selection
  if (data.currentExpiry) {
    expiryDropdown.value = data.currentExpiry;
  }
  
  // Add change event listener for expiry dropdown
  expiryDropdown.addEventListener('change', handle_expiry_change);
};

// Enhanced expiry change handler
const handle_expiry_change = () => {
  const selectedExpiry = document.getElementById('Expiry').value;
  const currentIndex = get_current_selected_index();
  
  // Refresh all data with new expiry
  call_Enhanced_Sentiment_API(currentIndex, selectedExpiry);
  call_Enhanced_PCR_API(currentIndex, selectedExpiry);
  call_Enhanced_Volume_Histogram_API(currentIndex, selectedExpiry);
  
  // Update chart data
  const selectedTimeframe = document.getElementById('Time_Frame')?.value || '3m';
  enhanced_ohlc_and_Volume(currentIndex, selectedTimeframe);
};

// Enhanced initialization function for MoneyFlux professional features
const initialize_enhanced_moneyflux = async (initialIndex = 'NIFTY50') => {
  try {
    console.log('Initializing Enhanced MoneyFlux Features...');
    
    // Initialize expiry data first
    await call_Enhanced_Expiry_API(initialIndex);
    
    // Initialize all professional features
    await call_Enhanced_Sentiment_API(initialIndex);
    await call_Enhanced_PCR_API(initialIndex);
    await call_Enhanced_Volume_Histogram_API(initialIndex);
    
    // Initialize OHLC data
    const defaultTimeframe = '3m';
    await enhanced_ohlc_and_Volume(initialIndex, defaultTimeframe);
    
    // Start real-time updates
    start_enhanced_real_time_updates(initialIndex);
    
    // Add timeframe change listener
    const timeframeDropdown = document.getElementById('Time_Frame');
    if (timeframeDropdown) {
      timeframeDropdown.addEventListener('change', handle_timeframe_change);
    }
    
    console.log('Enhanced MoneyFlux Features Initialized Successfully');
  } catch (error) {
    console.error('Enhanced MoneyFlux Initialization Error:', error);
  }
};

// Enhanced timeframe change handler
const handle_timeframe_change = () => {
  const selectedTimeframe = document.getElementById('Time_Frame').value;
  const currentIndex = get_current_selected_index();
  const selectedExpiry = document.getElementById('Expiry')?.value;
  
  // Update OHLC data with new timeframe
  enhanced_ohlc_and_Volume(currentIndex, selectedTimeframe);
  
  // Refresh volume histogram for the new timeframe
  call_Enhanced_Volume_Histogram_API(currentIndex, selectedExpiry);
};

// Enhanced index switching function
const switch_enhanced_index = async (newIndex) => {
  try {
    // Update active button styling
    document.querySelectorAll('.go_btn').forEach(btn => btn.classList.remove('gb_active'));
    
    // Add active class to the selected button
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
    
    // Clear existing intervals
    if (currentSentimentInterval) clearInterval(currentSentimentInterval);
    if (currentPcrInterval) clearInterval(currentPcrInterval);
    if (currentVolumeInterval) clearInterval(currentVolumeInterval);
    
    // Initialize enhanced features for new index
    await initialize_enhanced_moneyflux(newIndex);
    
  } catch (error) {
    console.error('Enhanced Index Switching Error:', error);
  }
};

// Get current selected index helper function
const get_current_selected_index = () => {
  // Check which button has the active class
  const activeButton = document.querySelector('.go_btn.gb_active');
  if (activeButton) {
    const buttonId = activeButton.id;
    if (buttonId === 'nifty_btn') return 'NIFTY50';
    if (buttonId === 'bnknifty_btn') return 'BANKNIFTY';
    if (buttonId === 'finnifty_btn') return 'FINNIFTY';
    if (buttonId === 'midcap_btn') return 'MIDCAP';
    if (buttonId === 'sensex_btn') return 'SENSEX';
  }
  return 'NIFTY50'; // Default
};

// Enhanced real-time refresh intervals
const start_enhanced_real_time_updates = (currentIndex) => {
  // Clear existing intervals
  if (currentSentimentInterval) clearInterval(currentSentimentInterval);
  if (currentPcrInterval) clearInterval(currentPcrInterval);
  if (currentVolumeInterval) clearInterval(currentVolumeInterval);
  
  // Sentiment updates every 30 seconds
  currentSentimentInterval = setInterval(() => {
    const selectedExpiry = document.getElementById('Expiry')?.value;
    call_Enhanced_Sentiment_API(currentIndex, selectedExpiry);
  }, 30000);
  
  // PCR updates every 45 seconds
  currentPcrInterval = setInterval(() => {
    const selectedExpiry = document.getElementById('Expiry')?.value;
    call_Enhanced_PCR_API(currentIndex, selectedExpiry);
  }, 45000);
  
  // Volume histogram updates every 60 seconds
  currentVolumeInterval = setInterval(() => {
    const selectedExpiry = document.getElementById('Expiry')?.value;
    call_Enhanced_Volume_Histogram_API(currentIndex, selectedExpiry);
  }, 60000);
};

// Enhanced OHLC and Volume processing with sophisticated data management
const enhanced_ohlc_and_Volume = async (indexName, timeframe = '3m') => {
  try {
    const ohlcData = await call_Enhanced_OHLC_API(indexName, timeframe);
    
    if (!ohlcData.ohlcData || ohlcData.ohlcData.length === 0) {
      // Create default data if no data available
      ohlc = Array(125).fill([Date.now() / 1000, NaN, NaN, NaN, NaN]);
      Volume = Array(125).fill({ x: Date.now() / 1000, y: NaN, color: '#f0f0f0' });
      return;
    }
    
    // Process OHLC data with sophisticated timestamp alignment
    ohlc = process_sophisticated_ohlc_data(ohlcData.ohlcData, timeframe);
    Volume = process_sophisticated_volume_data(ohlcData.volumeData, timeframe);
    
    // Ensure data length is exactly 125 bars (professional trading standard)
    ohlc = ensure_data_length(ohlc, 125, timeframe, 'ohlc');
    Volume = ensure_data_length(Volume, 125, timeframe, 'volume');
    
    return { ohlc, Volume };
  } catch (error) {
    console.error('Enhanced OHLC processing error:', error);
    // Fallback to default data
    ohlc = Array(125).fill([Date.now() / 1000, NaN, NaN, NaN, NaN]);
    Volume = Array(125).fill({ x: Date.now() / 1000, y: NaN, color: '#f0f0f0' });
    return { ohlc, Volume };
  }
};

// Sophisticated data processing functions
const process_sophisticated_ohlc_data = (rawData, timeframe) => {
  if (!rawData || rawData.length === 0) return [];
  
  // Apply complex timestamp alignment similar to MoneyFlux
  let processedData = rawData.map(candle => {
    return [
      parseFloat(candle[0]), // timestamp
      parseFloat(candle[1]), // open
      parseFloat(candle[2]), // high
      parseFloat(candle[3]), // low
      parseFloat(candle[4])  // close
    ];
  });
  
  // Apply timeframe-specific processing
  if (timeframe === '15m') {
    processedData = aggregate_to_15min(processedData);
  } else if (timeframe === '30m') {
    processedData = aggregate_to_30min(processedData);
  }
  
  return processedData;
};

const process_sophisticated_volume_data = (rawData, timeframe) => {
  if (!rawData || rawData.length === 0) return [];
  
  // Process volume data with dynamic color logic
  let compareValue = 0;
  
  return rawData.map(volumeBar => {
    const volume = volumeBar.y || 0;
    const color = get_enhanced_volume_color(volume, compareValue);
    
    if (volume > compareValue) {
      compareValue = volume;
    }
    
    return {
      x: parseFloat(volumeBar.x),
      y: parseFloat(volume),
      color: color
    };
  });
};

// Enhanced volume color logic matching MoneyFlux VolumeBarColor function
const get_enhanced_volume_color = (volume, compareValue) => {
  if (volume > 0) {
    if (compareValue < volume) {
      return "#0DAD8D"; // Bright green for higher volume
    } else {
      return "#ace0d8"; // Light green for lower volume
    }
  } else if (volume < 0) {
    if (compareValue < Math.abs(volume)) {
      return "#F15B46"; // Bright red for higher negative volume
    } else {
      return "#e9c0bb"; // Light red for lower negative volume
    }
  }
  return "#f0f0f0"; // Neutral color
};

// Sophisticated data length management (125 bars standard)
const ensure_data_length = (data, targetLength, timeframe, dataType) => {
  if (!data || data.length === 0) {
    // Create empty data array
    return Array(targetLength).fill(
      dataType === 'ohlc' 
        ? [Date.now() / 1000, NaN, NaN, NaN, NaN]
        : { x: Date.now() / 1000, y: NaN, color: '#f0f0f0' }
    );
  }
  
  if (data.length < targetLength) {
    // Pad with NaN values at the beginning
    const paddingNeeded = targetLength - data.length;
    const intervalSeconds = getIntervalSeconds(timeframe);
    
    const startTime = dataType === 'ohlc' 
      ? data[0][0] - (paddingNeeded * intervalSeconds)
      : data[0].x - (paddingNeeded * intervalSeconds);
    
    const padding = [];
    for (let i = 0; i < paddingNeeded; i++) {
      const timestamp = startTime + (i * intervalSeconds);
      
      if (dataType === 'ohlc') {
        padding.push([timestamp, NaN, NaN, NaN, NaN]);
      } else {
        padding.push({ x: timestamp, y: NaN, color: '#f0f0f0' });
      }
    }
    
    return [...padding, ...data];
  } else if (data.length > targetLength) {
    // Trim to target length (keep most recent)
    return data.slice(-targetLength);
  }
  
  return data;
};

const getIntervalSeconds = (timeframe) => {
  switch (timeframe) {
    case '3m': return 180;
    case '15m': return 900;
    case '30m': return 1800;
    default: return 180;
  }
};

// Timeframe aggregation functions
const aggregate_to_15min = (data) => {
  const aggregated = [];
  
  for (let i = 0; i < data.length; i += 5) {
    const group = data.slice(i, i + 5);
    if (group.length === 0) continue;
    
    const timestamp = group[0][0];
    const open = group[0][1];
    const high = Math.max(...group.map(candle => candle[2]).filter(val => !isNaN(val)));
    const low = Math.min(...group.map(candle => candle[3]).filter(val => !isNaN(val)));
    const close = group[group.length - 1][4];
    
    aggregated.push([timestamp, open, high, low, close]);
  }
  
  return aggregated;
};

const aggregate_to_30min = (data) => {
  // First aggregate to 15min, then to 30min
  const fifteenMinData = aggregate_to_15min(data);
  const aggregated = [];
  
  for (let i = 0; i < fifteenMinData.length; i += 2) {
    const group = fifteenMinData.slice(i, i + 2);
    if (group.length === 0) continue;
    
    const timestamp = group[0][0];
    const open = group[0][1];
    const high = Math.max(...group.map(candle => candle[2]).filter(val => !isNaN(val)));
    const low = Math.min(...group.map(candle => candle[3]).filter(val => !isNaN(val)));
    const close = group[group.length - 1][4];
    
    aggregated.push([timestamp, open, high, low, close]);
  }
  
  return aggregated;
};



// Check Access API
const call_check_access_API = () => {
  try {
    let td_full = username(cookieValue_1)
    if (td_full[1] == 0) {
      if (td_full[3] == 1) {
        $('#check_access_button').hide()
      } else if (td_full[3] == 0) {
        $('#check_access_button').show()
        $('.midcap_btn').attr('id', 'unAuth_midcap_btn')
        $('#unAuth_midcap_btn').text('>> GET MIDCAP')
        $('.sensex_btn').attr('id', 'unAuth_sensex_btn')
        $('#unAuth_sensex_btn').text('>> GET SENSEX')
      }
    } else if (td_full[1] == 1) {
      $('#check_access_button').hide()
    }
  } catch (error) {
    logger.error(error)
  }
};

// Expiry API
const call_Expiry_API = (script) => {
  try {
    $.post(
      root + route + "/get_running_expiry",
      {
        script: script
      },
      function (data, status) {
        Expiry_data = data;
      }
    ).fail(function (response) {
      logger.error("Error: " + response);
      $("#PCM_Color").removeClass();
      $("#PCM_Color").addClass(
        "semicircle-G5piCoZi semicircleNeutral-G5piCoZi"
      );
      $("#PCM_Arrow").removeClass();
      $("#PCM_Arrow").addClass(
        "arrow-G5piCoZi arrowNeutral-G5piCoZi arrowShudderNeutral-G5piCoZi"
      );
      $("#sentiment_dial_Color").removeClass();
      $("#sentiment_dial_Color").addClass(
        "semicircle-G5piCoZi semicircleNeutral-G5piCoZi"
      );
      $("#sentiment_dial_Arrow").removeClass();
      $("#sentiment_dial_Arrow").addClass(
        "arrow-G5piCoZi arrowNeutral-G5piCoZi arrowShudderNeutral-G5piCoZi"
      );
    });
    var x = moment.unix(Expiry_data[0][0]).utcOffset('+5:30').format("MMM-D");
    var y = moment.unix(Expiry_data[1][0]).utcOffset('+5:30').format("MMM-D");
    $("#1st_dropdown_value").attr("value", x);
    $("#2nd_dropdown_value").attr("value", y);
    $("#1st_dropdown_value").text(x + " " + Expiry_data[0][1]);
    $("#2nd_dropdown_value").text(y + " " + Expiry_data[1][1]);
    Nifty_exp_1 = moment.unix(Expiry_data[0][0]).utcOffset('+5:30').format("DDMMM");
    Nifty_exp_2 = moment.unix(Expiry_data[1][0]).utcOffset('+5:30').format("DDMMM");
    return [Expiry_data, Nifty_exp_1, Nifty_exp_2];
  } catch (error) {
    logger.error(error);
    $("#PCM_Color").removeClass();
    $("#PCM_Color").addClass("semicircle-G5piCoZi semicircleNeutral-G5piCoZi");
    $("#PCM_Arrow").removeClass();
    $("#PCM_Arrow").addClass(
      "arrow-G5piCoZi arrowNeutral-G5piCoZi arrowShudderNeutral-G5piCoZi"
    );
    $("#sentiment_dial_Color").removeClass();
    $("#sentiment_dial_Color").addClass(
      "semicircle-G5piCoZi semicircleNeutral-G5piCoZi"
    );
    $("#sentiment_dial_Arrow").removeClass();
    $("#sentiment_dial_Arrow").addClass(
      "arrow-G5piCoZi arrowNeutral-G5piCoZi arrowShudderNeutral-G5piCoZi"
    );
  }
};

// Candlestick API
const call_Candlestick_API = (script) => {
  try {
    $.post(
      root + route + "/chart",
      {
        script: script,
      },
      function (data, status) {
        Candle_data = data;
        if (Candle_data.length == 0) {
          Candle_data = [
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
          ];
        }
      }
    ).fail(function (response) {
      logger.error("Error: " + response);
      Candle_data = [
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
      ];
    });
  } catch (error) {
    logger.error(error);
    Candle_data = [
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
    ];
  }
  return Candle_data;
};

// Volume API
const call_Volume_API = (script, exp_date) => {
  try {
    $.post(
      root + route + "/op_histogram",
      {
        script: script,
        exp: exp_date,
      },
      function (data, status) {
        Volume_data = data;
      }
    ).fail(function (response) {
      logger.error("Error: " + response);
      Volume_data = [];
    });
  } catch (error) {
    Volume_data = [];
    logger.error(error);
  }
  return Volume_data;
};

// Heat Map API
const call_Heat_Map_API = (script) => {
  try {
    // For Midcap = root_1 + `/study-data/Midcap%2050`
    // For Sensex = root_1 + `/study-data/Sensex`
    $.ajax({
      url: root_1 + `/study-data/Heat%20Map%20${script}`,
      method: "GET",
      success: function (data, status) {
        // Heat_Map = JSON.parse(data)["data"];   // For hs
        Heat_Map = data.data;                     // For ebs
      },
      error: function (response) {
        logger.error("Error: " + response);
        Heat_Map = [];
      },
    });

    HeatMap = [];
    for (var i = 0; i < Heat_Map.length; i++) {
      if (Heat_Map[i].param_0 != -0 || Heat_Map[i].param_0 != 0) {
        HeatMap.push({
          x: Heat_Map[i].Symbol, // the date
          y: Heat_Map[i].param_0, // the Volume
        });
      }
    }
  } catch (error) {
    logger.error(error);
    HeatMap = [];
  }
  return HeatMap;
};

// Dial API
const call_Dial_API = (script, exp_date, exp_type) => {
  $.post(
    root + route + "/op_dial",
    {
      script: script,
      exp: exp_date,
      exp_type: exp_type,
    },
    function (data, status) {
      Dial_data = data;
    }
  ).fail(function (response) {
    logger.error("Error: " + response);
    Dial_data = [];
  });

  if (Dial_data.length == 0) {
    Dial_data = [[0, 0, 0]];
  }

  if (parseFloat(Dial_data[0][2]) > 0) {
    $("#PCM_Color").removeClass();
    $("#PCM_Color").addClass("semicircle-G5piCoZi semicircleBuy-G5piCoZi");
    $("#PCM_Arrow").removeClass();
    $("#PCM_Arrow").addClass(
      "arrow-G5piCoZi arrowBuy-G5piCoZi arrowShudderBuy-G5piCoZi"
    );
  } else if (parseFloat(Dial_data[0][2]) < 0) {
    $("#PCM_Color").removeClass();
    $("#PCM_Color").addClass("semicircle-G5piCoZi semicircleSell-G5piCoZi");
    $("#PCM_Arrow").removeClass();
    $("#PCM_Arrow").addClass(
      "arrow-G5piCoZi arrowSell-G5piCoZi arrowShudderSell-G5piCoZi"
    );
  } else if (parseFloat(Dial_data[0][2]) == 0) {
    $("#PCM_Color").removeClass();
    $("#PCM_Color").addClass("semicircle-G5piCoZi semicircleNeutral-G5piCoZi");
    $("#PCM_Arrow").removeClass();
    $("#PCM_Arrow").addClass(
      "arrow-G5piCoZi arrowNeutral-G5piCoZi arrowShudderNeutral-G5piCoZi"
    );
  }
  return Dial_data;
};

// Calculation Function
const calculation_for_Exp_1 = (vol_data, Bar_data) => {
  // Data for Volume (For 1st dropdown value)
  if (vol_data.length != 0) {
    Array_1 = [];
    Array_2 = [];
    len_1 = vol_data.length;
    for (var i = 0; i < len_1; i++) {
      for (var j = 0; j < vol_data[0].length; j++) {
        if (i != len_1 - 1 && parseFloat(vol_data[i][0]) == parseFloat(vol_data[i + 1][0])) {
          i = i + 1;
        }
        Array_2.push(parseFloat(vol_data[i][j]));
        j = j + 1;
      }
      Array_1.push(Array_2);
      Array_2 = [];
    }
  } else if (vol_data.length == 0) {
    Array_1 = [
      [0, 0],
      [0, 0],
    ];
  }

  // For Sentiment Dial (Calculation Part)
  if (Array_1.length != 0) {
    Nifty_exp_1_A = 0;
    Nifty_exp_1_B = 0;
    Nifty_exp_1_Dial = 0;
    for (var i = 0; i < Array_1.length; i++) {
      if (Array_1[i][1] > 0) {
        Nifty_exp_1_A = Nifty_exp_1_A + Array_1[i][1];
      } else if (Array_1[i][1] < 0) {
        Nifty_exp_1_B = Nifty_exp_1_B + Array_1[i][1];
      }
    }
    if (Nifty_exp_1_A > Math.abs(Nifty_exp_1_B)) {
      Nifty_exp_1_Dial = Nifty_exp_1_A / Math.abs(Nifty_exp_1_B);
    } else if (Nifty_exp_1_A < Math.abs(Nifty_exp_1_B)) {
      Nifty_exp_1_Dial = -Math.abs(Nifty_exp_1_B) / Nifty_exp_1_A;
    }

    if (Nifty_exp_1_Dial > 0) {
      $("#sentiment_dial_Color").removeClass();
      $("#sentiment_dial_Color").addClass(
        "semicircle-G5piCoZi semicircleBuy-G5piCoZi"
      );
      $("#sentiment_dial_Arrow").removeClass();
      $("#sentiment_dial_Arrow").addClass(
        "arrow-G5piCoZi arrowBuy-G5piCoZi arrowShudderBuy-G5piCoZi"
      );
    } else if (Nifty_exp_1_Dial < 0) {
      $("#sentiment_dial_Color").removeClass();
      $("#sentiment_dial_Color").addClass(
        "semicircle-G5piCoZi semicircleSell-G5piCoZi"
      );
      $("#sentiment_dial_Arrow").removeClass();
      $("#sentiment_dial_Arrow").addClass(
        "arrow-G5piCoZi arrowSell-G5piCoZi arrowShudderSell-G5piCoZi"
      );
    } else if (Nifty_exp_1_Dial == 0) {
      $("#sentiment_dial_Color").removeClass();
      $("#sentiment_dial_Color").addClass(
        "semicircle-G5piCoZi semicircleNeutral-G5piCoZi"
      );
      $("#sentiment_dial_Arrow").removeClass();
      $("#sentiment_dial_Arrow").addClass(
        "arrow-G5piCoZi arrowNeutral-G5piCoZi arrowShudderNeutral-G5piCoZi"
      );
    }
  }

  if (Dial_data[0][0] == 0 && Dial_data[0][1] == 0 && Dial_data[0][2] == 0) {
    Dial_data = [0, 0, Nifty_exp_1_Dial];
    if (parseFloat(Dial_data[2]) > 0) {
      $("#PCM_Color").removeClass();
      $("#PCM_Color").addClass("semicircle-G5piCoZi semicircleBuy-G5piCoZi");
      $("#PCM_Arrow").removeClass();
      $("#PCM_Arrow").addClass(
        "arrow-G5piCoZi arrowBuy-G5piCoZi arrowShudderBuy-G5piCoZi"
      );
    } else if (parseFloat(Dial_data[2]) < 0) {
      $("#PCM_Color").removeClass();
      $("#PCM_Color").addClass("semicircle-G5piCoZi semicircleSell-G5piCoZi");
      $("#PCM_Arrow").removeClass();
      $("#PCM_Arrow").addClass(
        "arrow-G5piCoZi arrowSell-G5piCoZi arrowShudderSell-G5piCoZi"
      );
    } else if (parseFloat(Dial_data[2]) == 0) {
      $("#PCM_Color").removeClass();
      $("#PCM_Color").addClass(
        "semicircle-G5piCoZi semicircleNeutral-G5piCoZi"
      );
      $("#PCM_Arrow").removeClass();
      $("#PCM_Arrow").addClass(
        "arrow-G5piCoZi arrowNeutral-G5piCoZi arrowShudderNeutral-G5piCoZi"
      );
    }
  }
};

// Highchart color function
const VolumeBarColor = (point) => {
  if (point > 0) {
    if (compare < point) {
      compare = point;
      return "#0DAD8D";
    } else {
      compare = point;
      return "#ace0d8";
    }
  } else if (point < 0) {
    if (compare < point) {
      compare = point;
      return "#e9c0bb";
    } else {
      compare = point;
      return "#F15B46";
    }
  }
};

// split the data set into ohlc and Volume
const ohlc_and_Volume = (candlestick_data) => {
  try {
    if (counter_for_Nifty_3min == 0) {
      counter_for_Nifty_3min += 1;
      ohlc = [];
      Volume = [];
      dataLength = candlestick_data.length;

      let First_candle_time = parseFloat(
        moment.unix(parseFloat(candlestick_data[0][0])).format("h.mm")
      );
      let First_Histo_time = parseFloat(
        moment.unix(Array_1[0][0]).format("h.mm")
      );

      if (First_candle_time < First_Histo_time) {
        var start = moment
          .unix(parseFloat(candlestick_data[0][0]))
          .format("h:mm");
        var end = moment.unix(Array_1[0][0]).format("h:mm");

        var mins = moment
          .utc(moment(end, "h:mm:").diff(moment(start, "h:mm")))
          .format("mm");

        How_many_times_addition = Math.round(parseFloat(mins) / 3) - 1;
        Dummy = [];
        Dummy_1 = [];
        for (var i = 0; i < How_many_times_addition; i++) {
          Dummy.push(parseFloat(candlestick_data[i + 1][0]), 0);
          Dummy_1.push(Dummy);
          Dummy = [];
        }
        for (var i = 0; i < Array_1.length; i++) {
          Dummy_1.push(Array_1[i]);
        }
        Array_1 = [];
        Array_1 = Dummy_1;
      } else if (First_candle_time >= First_Histo_time) {
        Dummy_1 = [];
        var end = moment
          .unix(parseFloat(candlestick_data[0][0]))
          .format("h:mm");
        var start = moment.unix(Array_1[0][0]).format("h:mm");

        var mins = moment
          .utc(moment(end, "h:mm:").diff(moment(start, "h:mm")))
          .format("mm");

        How_many_times_addition = Math.round(parseFloat(mins) / 3) + 1;
        for (var i = How_many_times_addition; i < Array_1.length; i++) {
          Dummy_1.push(Array_1[i]);
        }
        Array_1 = [];
        Array_1 = Dummy_1;
      }

      let Last_candle_time = parseFloat(
        moment
          .unix(parseFloat(candlestick_data[candlestick_data.length - 1][0]))
          .format("h.mm")
      );
      let Last_Histo_time = parseFloat(
        moment.unix(Array_1[Array_1.length - 1][0]).format("h.mm")
      );

      if (Last_candle_time >= Last_Histo_time) {

        var end = moment
          .unix(parseFloat(candlestick_data[candlestick_data.length - 1][0]))
          .format("h:mm");
        var start = moment.unix(Array_1[Array_1.length - 1][0]).format("h:mm");

        var mins = moment
          .utc(moment(end, "h:mm:").diff(moment(start, "h:mm")))
          .format("mm");

        How_many_times_addition = Math.round(parseFloat(mins) / 3) + 1;
        Dummy = [];
        Dummy_1 = [];
        sample = [];
        sample = Array_1;
        len = sample.length + How_many_times_addition - 1;
        for (var i = sample.length - 1; i < len; i++) {
          Dummy.push(parseFloat(sample[i][0]) + 180, 0);
          sample.push(Dummy);
          Dummy = [];
        }
        Array_1 = sample;
      } else if (Last_candle_time < Last_Histo_time) {
        Dummy_1 = [];


        var start = moment
          .unix(parseFloat(candlestick_data[candlestick_data.length - 1][0]))
          .format("h:mm");
        var end = moment.unix(Array_1[Array_1.length - 1][0]).format("h:mm");

        var mins = moment
          .utc(moment(end, "h:mm:").diff(moment(start, "h:mm")))
          .format("mm");

        How_many_times_subtraction = Math.round(parseFloat(mins) / 3) - 1;

        for (var i = 0; i < How_many_times_subtraction; i++) {
          Array_1.pop();
        }
      }

      for (var i = 0; i < dataLength; i += 1) {
        ohlc.push([
          parseFloat(Array_1[i][0]), // the date
          parseFloat(candlestick_data[i][1]), // open
          parseFloat(candlestick_data[i][2]), // high
          parseFloat(candlestick_data[i][3]), // low
          parseFloat(candlestick_data[i][4]), // close
        ]);
      }
      Time = parseFloat(Array_1[Array_1.length - 1]) + 180;
      for (var i = dataLength; i < 125; i += 1) {
        temp_time = moment.unix(Time).format("HH.mm");
        temp_time = parseFloat(temp_time);

        if (temp_time <= 15.3) {
          ohlc.push([
            parseFloat(Time), // the date
            parseFloat(NaN), // open
            parseFloat(NaN), // high
            parseFloat(NaN), // low
            parseFloat(NaN), // close
          ]);
        }
        Time = Time + 180;
      }

      ohlc_temp = ohlc;
      // adding NaN before the data START --> FOR CANDLESTICK
      if (ohlc.length < 125) {
        ohlc_new = [];
        prev_time = moment.unix(ohlc[0][0]).format("HH.mm");
        prev_time = parseFloat(prev_time);
        Timestamp = parseFloat(ohlc[0][0]);
        while (prev_time > 9.18) {
          Timestamp = Timestamp - 180;
          ohlc_new.push([
            parseFloat(Timestamp), // the date
            parseFloat(NaN), // open
            parseFloat(NaN), // high
            parseFloat(NaN), // low
            parseFloat(NaN), // close
          ]);
          prev_time = moment.unix(Timestamp).format("HH.mm");
          prev_time = parseFloat(prev_time);
        }

        ohlc_new_1 = [];
        for (var i = ohlc_new.length - 1; i >= 0; i--) {
          ohlc_new_1.push(ohlc_new[i]);
        }
        for (var i = 0; i < ohlc.length; i++) {
          ohlc_new_1.push(ohlc[i]);
        }
        ohlc = ohlc_new_1;
      }

      for (var i = 0; i < Array_1.length; i++) {
        Volume.push({
          x: parseFloat(Array_1[i][0]), // the date
          y: parseFloat(Array_1[i][1]), // the Volume
          color: VolumeBarColor(parseFloat(Array_1[i][1])),
        });
      }
      Time = parseFloat(Array_1[Array_1.length - 1]) + 180;
      for (var i = dataLength; i < 125; i += 1) {
        var temp_time = moment.unix(Time).format("HH.mm");
        temp_time = parseFloat(temp_time);
        if (temp_time <= 15.3) {
          Volume.push({
            x: parseFloat(Time), // the date
            y: parseFloat(NaN), // the Volume
            color: VolumeBarColor(parseFloat(0)),
          });
        }
        Time = Time + 180;
      }

      Volume_temp = Volume;
      // adding NaN before the data START --> FOR VOLUME
      if (Volume.length < 125) {
        Volume_new = [];
        prev_time = moment.unix(Volume[0]["x"]).format("HH.mm");
        prev_time = parseFloat(prev_time);
        Timestamp = parseFloat(Volume[0]["x"]);
        while (prev_time > 9.18) {
          Timestamp = Timestamp - 180;
          Volume_new.push({
            x: parseFloat(Timestamp), // the date
            y: parseFloat(NaN), // the Volume
            color: VolumeBarColor(parseFloat(0)),
          });
          prev_time = moment.unix(Timestamp).format("HH.mm");
          prev_time = parseFloat(prev_time);
        }

        Volume_new_1 = [];
        for (var i = Volume_new.length - 1; i >= 0; i--) {
          Volume_new_1.push(Volume_new[i]);
        }
        for (var i = 0; i < Volume.length; i++) {
          Volume_new_1.push(Volume[i]);
        }

        Volume = Volume_new_1;
      }
    }
  } catch (error) {
    logger.error(error);
    ohlc = [];
    Volume = [];
    Array_1 = [
      [0, 0],
      [0, 0],
    ];
    for (var i = 0; i < 2; i += 1) {
      ohlc.push([
        parseFloat($.now()), // the date
        parseFloat(NaN), // open
        parseFloat(NaN), // high
        parseFloat(NaN), // low
        parseFloat(NaN), // close
      ]);
    }
    for (var i = 0; i < 2; i++) {
      Volume.push({
        x: parseFloat($.now()), // the date
        y: parseFloat(NaN), // the Volume
      });
    }
  }
};

// Chart Update function
const update_all_chart = (title, ohlc, Volume) => {
  highchart.update({
    tooltip: {
      split: true,
      formatter: function () {
        tooltipArray = "";
        return tooltipArray;
      },
    },
    series: [
      {
        type: "candlestick",
        name: "AAPL",
        data: ohlc,
        dataGrouping: {
          enabled: false,
        },
      },
      {
        type: "column",
        name: "Volume",
        data: Volume,
        yAxis: 1,
        dataGrouping: {
          enabled: false,
        },
      },
    ],
  }),
    chart_2.updateSeries([
      {
        data: HeatMap,
      },
    ]);
};

// function for 15min data
const ohlc_and_Volume_15min = (candlestick_data) => {
  try {
    if (counter_for_Nifty_15min == 0) {
      counter_for_Nifty_15min += 1;
      candlestick_data_15min = []; // for Candlestick
      sample = [];
      numberArray_1 = ohlc_temp;
      let Quotient = Math.trunc(candlestick_data.length / 5);
      let Remainder = candlestick_data.length % 5;
      let Last_i_position = Quotient * 5;
      for (var i = 0; i < candlestick_data.length; i++) {
        sample.push(numberArray_1[i][0], numberArray_1[i][1]);
        for (var j = 2; j < 4; j++) {
          if (j == 3) {
            if (i == Last_i_position) {
              if (Remainder == 1) {
                dummy_i = i;
                i = Last_i_position;
                sample.push(numberArray_1[i][j]);
                i = dummy_i;
              } else if (Remainder == 2) {
                dummy_i = i;
                i = Last_i_position;
                if (numberArray_1[i][j] <= numberArray_1[i + 1][j]) {

                  sample.push(numberArray_1[i][j]);
                } else if (numberArray_1[i + 1][j] <= numberArray_1[i][j]) {

                  sample.push(numberArray_1[i + 1][j]);
                }
                i = dummy_i;
              } else if (Remainder == 3) {
                dummy_i = i;
                i = Last_i_position;
                if (
                  numberArray_1[i][j] <= numberArray_1[i + 1][j] &&
                  numberArray_1[i][j] <= numberArray_1[i + 2][j]
                ) {
                  sample.push(numberArray_1[i][j]);
                } else if (
                  numberArray_1[i + 1][j] <= numberArray_1[i][j] &&
                  numberArray_1[i + 1][j] <= numberArray_1[i + 2][j]
                ) {
                  sample.push(numberArray_1[i + 1][j]);
                } else if (
                  numberArray_1[i + 2][j] <= numberArray_1[i][j] &&
                  numberArray_1[i + 2][j] <= numberArray_1[i + 1][j]
                ) {
                  sample.push(numberArray_1[i + 2][j]);
                }
                i = dummy_i;
              } else if (Remainder == 4) {
                if (
                  numberArray_1[i][j] <= numberArray_1[i + 1][j] &&
                  numberArray_1[i][j] <= numberArray_1[i + 2][j] &&
                  numberArray_1[i][j] <= numberArray_1[i + 3][j]
                ) {
                  sample.push(numberArray_1[i][j]);
                } else if (
                  numberArray_1[i + 1][j] <= numberArray_1[i][j] &&
                  numberArray_1[i + 1][j] <= numberArray_1[i + 2][j] &&
                  numberArray_1[i + 1][j] <= numberArray_1[i + 3][j]
                ) {
                  sample.push(numberArray_1[i + 1][j]);
                } else if (
                  numberArray_1[i + 2][j] <= numberArray_1[i][j] &&
                  numberArray_1[i + 2][j] <= numberArray_1[i + 1][j] &&
                  numberArray_1[i + 2][j] <= numberArray_1[i + 3][j]
                ) {
                  sample.push(numberArray_1[i + 2][j]);
                } else if (
                  numberArray_1[i + 3][j] <= numberArray_1[i][j] &&
                  numberArray_1[i + 3][j] <= numberArray_1[i + 1][j] &&
                  numberArray_1[i + 3][j] <= numberArray_1[i + 2][j]
                ) {
                  sample.push(numberArray_1[i + 3][j]);
                }
              }
            } else {
              if (
                numberArray_1[i][j] <= numberArray_1[i + 1][j] &&
                numberArray_1[i][j] <= numberArray_1[i + 2][j] &&
                numberArray_1[i][j] <= numberArray_1[i + 3][j] &&
                numberArray_1[i][j] <= numberArray_1[i + 4][j]
              ) {
                sample.push(numberArray_1[i][j]);
              } else if (
                numberArray_1[i + 1][j] <= numberArray_1[i][j] &&
                numberArray_1[i + 1][j] <= numberArray_1[i + 2][j] &&
                numberArray_1[i + 1][j] <= numberArray_1[i + 3][j] &&
                numberArray_1[i + 1][j] <= numberArray_1[i + 4][j]
              ) {
                sample.push(numberArray_1[i + 1][j]);
              } else if (
                numberArray_1[i + 2][j] <= numberArray_1[i][j] &&
                numberArray_1[i + 2][j] <= numberArray_1[i + 1][j] &&
                numberArray_1[i + 2][j] <= numberArray_1[i + 3][j] &&
                numberArray_1[i + 2][j] <= numberArray_1[i + 4][j]
              ) {
                sample.push(numberArray_1[i + 2][j]);
              } else if (
                numberArray_1[i + 3][j] <= numberArray_1[i][j] &&
                numberArray_1[i + 3][j] <= numberArray_1[i + 1][j] &&
                numberArray_1[i + 3][j] <= numberArray_1[i + 2][j] &&
                numberArray_1[i + 3][j] <= numberArray_1[i + 4][j]
              ) {
                sample.push(numberArray_1[i + 3][j]);
              } else if (
                numberArray_1[i + 4][j] <= numberArray_1[i][j] &&
                numberArray_1[i + 4][j] <= numberArray_1[i + 1][j] &&
                numberArray_1[i + 4][j] <= numberArray_1[i + 2][j] &&
                numberArray_1[i + 4][j] <= numberArray_1[i + 3][j]
              ) {
                sample.push(numberArray_1[i + 4][j]);
              }
            }
          } else if (j == 2) {
            if (i == Last_i_position) {
              if (Remainder == 1) {
                dummy_i = i;
                i = Last_i_position;
                sample.push(numberArray_1[i][j]);
                i = dummy_i;
              } else if (Remainder == 2) {
                dummy_i = i;
                i = Last_i_position;
                if (numberArray_1[i][j] >= numberArray_1[i + 1][j]) {

                  sample.push(numberArray_1[i][j]);
                } else if (numberArray_1[i + 1][j] >= numberArray_1[i][j]) {

                  sample.push(numberArray_1[i + 1][j]);
                }
                i = dummy_i;
              } else if (Remainder == 3) {
                dummy_i = i;
                i = Last_i_position;
                if (
                  numberArray_1[i][j] >= numberArray_1[i + 1][j] &&
                  numberArray_1[i][j] >= numberArray_1[i + 2][j]
                ) {
                  sample.push(numberArray_1[i][j]);
                } else if (
                  numberArray_1[i + 1][j] >= numberArray_1[i][j] &&
                  numberArray_1[i + 1][j] >= numberArray_1[i + 2][j]
                ) {
                  sample.push(numberArray_1[i + 1][j]);
                } else if (
                  numberArray_1[i + 2][j] >= numberArray_1[i][j] &&
                  numberArray_1[i + 2][j] >= numberArray_1[i + 1][j]
                ) {
                  sample.push(numberArray_1[i + 2][j]);
                }
                i = dummy_i;
              } else if (Remainder == 4) {
                if (
                  numberArray_1[i][j] >= numberArray_1[i + 1][j] &&
                  numberArray_1[i][j] >= numberArray_1[i + 2][j] &&
                  numberArray_1[i][j] >= numberArray_1[i + 3][j]
                ) {
                  sample.push(numberArray_1[i][j]);
                } else if (
                  numberArray_1[i + 1][j] >= numberArray_1[i][j] &&
                  numberArray_1[i + 1][j] >= numberArray_1[i + 2][j] &&
                  numberArray_1[i + 1][j] >= numberArray_1[i + 3][j]
                ) {
                  sample.push(numberArray_1[i + 1][j]);
                } else if (
                  numberArray_1[i + 2][j] >= numberArray_1[i][j] &&
                  numberArray_1[i + 2][j] >= numberArray_1[i + 1][j] &&
                  numberArray_1[i + 2][j] >= numberArray_1[i + 3][j]
                ) {
                  sample.push(numberArray_1[i + 2][j]);
                } else if (
                  numberArray_1[i + 3][j] >= numberArray_1[i][j] &&
                  numberArray_1[i + 3][j] >= numberArray_1[i + 1][j] &&
                  numberArray_1[i + 3][j] >= numberArray_1[i + 2][j]
                ) {
                  sample.push(numberArray_1[i + 3][j]);
                }
              }
            } else {
              if (
                numberArray_1[i][j] >= numberArray_1[i + 1][j] &&
                numberArray_1[i][j] >= numberArray_1[i + 2][j] &&
                numberArray_1[i][j] >= numberArray_1[i + 3][j] &&
                numberArray_1[i][j] >= numberArray_1[i + 4][j]
              ) {
                sample.push(numberArray_1[i][j]);
              } else if (
                numberArray_1[i + 1][j] >= numberArray_1[i][j] &&
                numberArray_1[i + 1][j] >= numberArray_1[i + 2][j] &&
                numberArray_1[i + 1][j] >= numberArray_1[i + 3][j] &&
                numberArray_1[i + 1][j] >= numberArray_1[i + 4][j]
              ) {
                sample.push(numberArray_1[i + 1][j]);
              } else if (
                numberArray_1[i + 2][j] >= numberArray_1[i][j] &&
                numberArray_1[i + 2][j] >= numberArray_1[i + 1][j] &&
                numberArray_1[i + 2][j] >= numberArray_1[i + 3][j] &&
                numberArray_1[i + 2][j] >= numberArray_1[i + 4][j]
              ) {
                sample.push(numberArray_1[i + 2][j]);
              } else if (
                numberArray_1[i + 3][j] >= numberArray_1[i][j] &&
                numberArray_1[i + 3][j] >= numberArray_1[i + 1][j] &&
                numberArray_1[i + 3][j] >= numberArray_1[i + 2][j] &&
                numberArray_1[i + 3][j] >= numberArray_1[i + 4][j]
              ) {
                sample.push(numberArray_1[i + 3][j]);
              } else if (
                numberArray_1[i + 4][j] >= numberArray_1[i][j] &&
                numberArray_1[i + 4][j] >= numberArray_1[i + 1][j] &&
                numberArray_1[i + 4][j] >= numberArray_1[i + 2][j] &&
                numberArray_1[i + 4][j] >= numberArray_1[i + 3][j]
              ) {
                sample.push(numberArray_1[i + 4][j]);
              }
            }
          }
        }
        if (i < Last_i_position) {
          sample.push(numberArray_1[i + 4][4]);
          candlestick_data_15min.push(sample);
          sample = [];
          i = i + 4;
          ohlc_temp_15min = candlestick_data_15min;
        } else if (i == Last_i_position) {
          if (Remainder == 1) {
            dummy_i_new = i;
            i = Last_i_position;
            sample.push(numberArray_1[i][4]);
            candlestick_data_15min.push(sample);
            i = dummy_i_new;
          } else if (Remainder == 2) {
            dummy_i_new = i;
            i = Last_i_position;
            sample.push(numberArray_1[i + 1][4]);
            candlestick_data_15min.push(sample);
            i = dummy_i_new;
          } else if (Remainder == 3) {
            dummy_i_new = i;
            i = Last_i_position;
            sample.push(numberArray_1[i + 2][4]);
            candlestick_data_15min.push(sample);
            i = dummy_i_new;
          } else if (Remainder == 4) {
            dummy_i_new = i;
            i = Last_i_position;
            sample.push(numberArray_1[i + 3][4]);
            candlestick_data_15min.push(sample);
            i = dummy_i_new;
          }

          i = i + 5;
          ohlc_temp_15min = candlestick_data_15min;
        }
      }
      ohlc = ohlc_temp_15min;
      ohlc_temp = ohlc;
      if (ohlc.length < 25) {
        ohlc_new = [];
        prev_time = moment.unix(ohlc[0][0]).format("HH.mm");
        prev_time = parseFloat(prev_time);
        Timestamp = parseFloat(ohlc[0][0]);
        while (prev_time > 9.18) {
          Timestamp = Timestamp - 900;
          ohlc_new.push([
            parseFloat(Timestamp), // the date
            parseFloat(NaN), // open
            parseFloat(NaN), // high
            parseFloat(NaN), // low
            parseFloat(NaN), // close
          ]);
          prev_time = moment.unix(Timestamp).format("HH.mm");
          prev_time = parseFloat(prev_time);
        }

        ohlc_new_1 = [];
        for (var i = ohlc_new.length - 1; i >= 0; i--) {
          ohlc_new_1.push(ohlc_new[i]);
        }
        for (var i = 0; i < ohlc.length; i++) {
          ohlc_new_1.push(ohlc[i]);
        }
        ohlc = ohlc_new_1;
      }

      Volume_15min = [];
      sum = 0;
      let Quotient_1 = Math.trunc(Array_1.length / 5);
      let Remainder_1 = Array_1.length % 5;
      let Last_i_position_1 = Quotient_1 * 5;
      for (var i = 0; i < Array_1.length; i++) {
        if (i != Last_i_position_1) {
          vol_15min =
            parseFloat(Array_1[i][1]) +
            parseFloat(Array_1[i + 1][1]) +
            parseFloat(Array_1[i + 2][1]) +
            parseFloat(Array_1[i + 3][1]) +
            parseFloat(Array_1[i + 4][1]);
          Volume_15min.push({
            x: parseFloat(Array_1[i][0]), // the date
            y: parseFloat(vol_15min), // the Volume
            color: VolumeBarColor(parseFloat(vol_15min)),
          });
          i = i + 4;
        } else if (i == Last_i_position_1) {
          for (var j = i; j < i + Remainder_1; j++) {
            sum = sum + Array_1[j][1];
          }
          Volume_15min.push({
            x: parseFloat(Array_1[i][0]), // the date
            y: parseFloat(sum), // the Volume
            color: VolumeBarColor(parseFloat(sum)),
          });
          i = i + 4;
        }
      }
      Volume = Volume_15min;
      sum = 0;
      Volume_temp = Volume;
      if (Volume.length < 25) {
        Volume_new = [];
        prev_time = moment.unix(Volume[0]["x"]).format("HH.mm");
        prev_time = parseFloat(prev_time);
        Timestamp = parseFloat(Volume[0]["x"]);
        while (prev_time > 9.18) {
          Timestamp = Timestamp - 900;
          Volume_new.push({
            x: parseFloat(Timestamp), // the date
            y: parseFloat(NaN), // the Volume
            color: VolumeBarColor(parseFloat(0)),
          });
          prev_time = moment.unix(Timestamp).format("HH.mm");
          prev_time = parseFloat(prev_time);
        }

        Volume_new_1 = [];
        for (var i = Volume_new.length - 1; i >= 0; i--) {
          Volume_new_1.push(Volume_new[i]);
        }
        for (var i = 0; i < Volume.length; i++) {
          Volume_new_1.push(Volume[i]);
        }
        Volume = Volume_new_1;
      }
    }
  } catch (error) {
    logger.error(error);
    ohlc = [];
    Volume = [];
    for (var i = 0; i < 2; i += 1) {
      ohlc.push([
        parseFloat($.now()), // the date
        parseFloat(NaN), // open
        parseFloat(NaN), // high
        parseFloat(NaN), // low
        parseFloat(NaN), // close
      ]);
    }
    for (var i = 0; i < 2; i++) {
      Volume.push({
        x: parseFloat($.now()), // the date
        y: parseFloat(NaN), // the Volume
      });
    }
  }
};

const ohlc_and_Volume_15min_addition = (Addition, length) => {
  try {
    Time = parseFloat(ohlc[ohlc.length - 1]) + Addition;
    for (var i = ohlc.length; i < length; i++) {
      temp_time = moment.unix(Time).format("HH.mm");
      temp_time = parseFloat(temp_time);

      if (temp_time <= 15.3) {
        ohlc.push([
          parseFloat(Time), // the date
          parseFloat(NaN), // open
          parseFloat(NaN), // high
          parseFloat(NaN), // low
          parseFloat(NaN), // close
        ]);
      }
      Time = Time + Addition;
    }
    Time = parseFloat(Volume[Volume.length - 1].x) + Addition;
    for (var i = Volume.length; i < length; i += 1) {
      var temp_time = moment.unix(Time).format("HH.mm");
      temp_time = parseFloat(temp_time);
      if (temp_time <= 15.3) {
        Volume.push({
          x: parseFloat(Time), // the date
          y: parseFloat(NaN), // the Volume
          color: VolumeBarColor(parseFloat(0)),
        });
      }
      Time = Time + Addition;
    }
  } catch (error) {
    logger.error(error);
    ohlc = [];
    Volume = [];
    for (var i = 0; i < 2; i += 1) {
      ohlc.push([
        parseFloat($.now()), // the date
        parseFloat(NaN), // open
        parseFloat(NaN), // high
        parseFloat(NaN), // low
        parseFloat(NaN), // close
      ]);
    }
    for (var i = 0; i < 2; i++) {
      Volume.push({
        x: parseFloat($.now()), // the date
        y: parseFloat(NaN), // the Volume
      });
    }
  }
};

// function for 30min data
const ohlc_and_Volume_30min = () => {
  try {
    if (counter_for_Nifty_30min == 0) {
      counter_for_Nifty_30min += 0;
      counter_for_Nifty_30min += 1;
      ohlc_and_Volume_15min(Candle_data);
      candlestick_data_30min = []; // for Candlestick
      sample_1 = [];
      ohlc = ohlc_temp
      let Quotient_New = Math.trunc(ohlc.length / 2);
      let Remainder_New = ohlc.length % 2;
      let Last_i_position_New = Quotient_New * 2;
      data_length = ohlc.length;
      for (var i = 0; i < data_length; i++) {
        sample_1.push(ohlc[i][0], ohlc[i][1]);
        for (var j = 2; j < 4; j++) {

          if (j == 3) {
            if (i == Last_i_position_New) {
              if (Remainder_New == 1) {
                dummy_i = i;
                i = Last_i_position_New;
                sample_1.push(ohlc[i][j]);
                i = dummy_i;
              }
            } else {
              if (ohlc[i][j] <= ohlc[i + 1][j]) {
                sample_1.push(ohlc[i][j]);
              } else if (ohlc[i + 1][j] <= ohlc[i][j]) {
                sample_1.push(ohlc[i + 1][j]);
              }
            }
          } else if (j == 2) {
            if (i == Last_i_position_New) {
              if (Remainder_New == 1) {
                dummy_i = i;
                i = Last_i_position_New;
                sample_1.push(ohlc[i][j]);
                i = dummy_i;
              }
            } else {
              if (ohlc[i][j] >= ohlc[i + 1][j]) {
                sample_1.push(ohlc[i][j]);
              } else if (ohlc[i + 1][j] >= ohlc[i][j]) {
                sample_1.push(ohlc[i + 1][j]);
              }
            }
          }
        }
        if (i < Last_i_position_New) {
          sample_1.push(ohlc[i + 1][4]);
          candlestick_data_30min.push(sample_1);
          sample_1 = [];
          i = i + 1;
          ohlc_1 = candlestick_data_30min;
        } else if (i == Last_i_position_New) {
          if (Remainder_New == 1) {
            dummy_i_new = i;
            i = Last_i_position_New;
            sample_1.push(ohlc[i][4]);
            candlestick_data_30min.push(sample_1);
            i = dummy_i_new;
          }
          // i = i + 2
          ohlc_1 = candlestick_data_30min;
        }
      }
      ohlc = ohlc_1;
      if (ohlc.length < 13) {
        ohlc_temp = ohlc;
        ohlc_new = [];
        prev_time = moment.unix(ohlc[0][0]).format("HH.mm");
        prev_time = parseFloat(prev_time);
        Timestamp = parseFloat(ohlc[0][0]);
        while (prev_time > 9.18) {
          Timestamp = Timestamp - 1800;
          ohlc_new.push([
            parseFloat(Timestamp), // the date
            parseFloat(NaN), // open
            parseFloat(NaN), // high
            parseFloat(NaN), // low
            parseFloat(NaN), // close
          ]);
          prev_time = moment.unix(Timestamp).format("HH.mm");
          prev_time = parseFloat(prev_time);
        }

        ohlc_new_1 = [];
        for (var i = ohlc_new.length - 1; i >= 0; i--) {
          ohlc_new_1.push(ohlc_new[i]);
        }
        for (var i = 0; i < ohlc.length; i++) {
          ohlc_new_1.push(ohlc[i]);
        }
        ohlc = ohlc_new_1;
      }

      Volume_2_exp_2_30min = [];
      sum = 0;
      let Quotient_1 = Math.trunc(Array_1.length / 10);
      let Remainder_1 = Array_1.length % 10;
      let Last_i_position_1 = Quotient_1 * 10;
      for (var i = 0; i < Array_1.length; i++) {
        if (i != Last_i_position_1) {
          sum = 0;
          for (var j = i; j < i + 10; j++) {
            sum = sum + Array_1[j][1];
          }
          Volume_2_exp_2_30min.push({
            x: parseFloat(Array_1[i][0]), // the date
            y: parseFloat(sum), // the Volume
            color: VolumeBarColor(parseFloat(sum)),
          });
          i = i + 9;
        } else if (i == Last_i_position_1) {
          sum = 0;
          for (var j = i; j < i + Remainder_1; j++) {
            sum = sum + Array_1[j][1];
          }
          Volume_2_exp_2_30min.push({
            x: parseFloat(Array_1[i][0]), // the date
            y: parseFloat(sum), // the Volume
            color: VolumeBarColor(parseFloat(sum)),
          });
          i = i + 9;
          sum = 0;
        }
      }
      Volume = Volume_2_exp_2_30min;

      if (Volume.length < 13) {
        Volume_temp = Volume;
        Volume_new = [];
        prev_time = moment.unix(Volume[0]["x"]).format("HH.mm");
        prev_time = parseFloat(prev_time);
        Timestamp = parseFloat(Volume[0]["x"]);
        while (prev_time > 9.18) {
          Timestamp = Timestamp - 1800;
          Volume_new.push({
            x: parseFloat(Timestamp), // the date
            y: parseFloat(NaN), // the Volume
            color: VolumeBarColor(parseFloat(0)),
          });
          prev_time = moment.unix(Timestamp).format("HH.mm");
          prev_time = parseFloat(prev_time);
        }

        Volume_new_1 = [];
        for (var i = Volume_new.length - 1; i >= 0; i--) {
          Volume_new_1.push(Volume_new[i]);
        }
        for (var i = 0; i < Volume.length; i++) {
          Volume_new_1.push(Volume[i]);
        }
        Volume = Volume_new_1;
      }
    }
  } catch (error) {
    logger.error(error);
    ohlc = [];
    Volume = [];
    for (var i = 0; i < 2; i += 1) {
      ohlc.push([
        parseFloat($.now()), // the date
        parseFloat(NaN), // open
        parseFloat(NaN), // high
        parseFloat(NaN), // low
        parseFloat(NaN), // close
      ]);
    }
    for (var i = 0; i < 2; i++) {
      Volume.push({
        x: parseFloat($.now()), // the date
        y: parseFloat(NaN), // the Volume
      });
    }
  }
};

$(document).ready(function () {

  a = $("#Candlestick_container").height();
  b = $("#Top_Bar").height();
  c = $("#Dials_Rows").height();
  d = a - (c + $(".money_flux").height());
  e = a - (c + $(".money_flux").height()) + 150;
  f = $(document).width();

  compare = 0;
  counter_for_Nifty_3min = 0;
  counter_for_Nifty_15min = 0;
  counter_for_Nifty_30min = 0;

  let page_access = username(cookieValue_1)
  if (page_access[2] == 0) {
    if (page_access[4]['mf'] == 1) {

      call_check_access_API()
      check_access();


      $.ajaxSetup({ async: false }); // to stop async

      const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
      const tooltipList = [...tooltipTriggerList].map((tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl));


      call_Expiry_API("NIFTY 50");
      call_Candlestick_API("NIFTY 50");
      call_Volume_API("NIFTY 50", Nifty_exp_1);
      call_Heat_Map_API("Nifty50");
      call_Dial_API("NIFTY 50", Nifty_exp_1, Expiry_data[0][1]);
      calculation_for_Exp_1(Volume_data);
      ohlc_and_Volume(Candle_data);

      // create the chart
      highchart = Highcharts.stockChart("chart", {
        rangeSelector: {
          enabled: false,
        },
        navigator: {
          enabled: false,
        },
        scrollbar: {
          enabled: false,
        },
        legend: {
          itemStyle: {
            color: "#000000",
            fontWeight: "bold",
          },
        },
        plotOptions: {
          candlestick: {
            color: "red",
            upColor: "green",
          },
          Volume: {
            color: "red",
            upColor: "green",
          },
        },
        chart: {
          backgroundColor: "#1c1c1c",
          zooming: {
            mouseWheel: false,
          },
        },

        toolbar: {
          enabled: false,
        },
        yAxis: [
          {
            labels: {
              formatter: function () {
                return "";
              },
            },
            top: "8%",
            height: "52%",
            lineWidth: 0,
            gridLineWidth: 0,
            resize: {
              enabled: true,
            },
          },
          {
            labels: {
              formatter: function () {
                return "";
              },
            },
            top: "65%",
            height: "35%",
            offset: 0,
            lineWidth: 0,
            gridLineWidth: 0,
          },
        ],
        tooltip: {
          split: true,
          formatter: function () {
            tooltipArray = "";
            return tooltipArray;
          },
        },
        xAxis: {
          type: "datetime",
          labels: {
            formatter: function () {
              return moment.unix(this.value).format("h:mm a");
            },
            style: {
              color: "#ffffff", // Set the x-axis labels color to white
            },
          },
          lineColor: "#ffffff",
        },
        series: [
          {
            type: "candlestick",
            name: "AAPL",
            data: ohlc,
            dataGrouping: {
              enabled: false,
            },
          },
          {
            type: "column",
            name: "Volume",
            data: Volume,
            yAxis: 1,
            dataGrouping: {
              enabled: false,
            },
          },
        ],
      });

      // Apexchart Bar [Bottom Right Chart]
      var options = {
        series: [
          {
            data: HeatMap,
          },
        ],
        legend: {
          show: false,
        },
        chart: {
          height: d,
          type: "treemap",
          events: {
            dataPointSelection: (event, chartContext, dataPointIndex) => {
              let temp = dataPointIndex["dataPointIndex"];
              let HeatMap_name =
                dataPointIndex["w"]["globals"]["categoryLabels"][temp];

              tw_charts(HeatMap_name);
            },
          },
          toolbar: {
            show: false,
          },
        },
        dataLabels: {
          enabled: true,
          style: {
            fontSize: "12px",
          },
          formatter: function (text, op) {
            return [text, op.value];
          },
        },
        plotOptions: {
          treemap: {
            enableShades: true,
            shadeIntensity: 0.5,
            reverseNegativeShade: true,
            useFillColorAsStroke: true,
            colorScale: {
              ranges: [
                {
                  from: -25,
                  to: 0,
                  color: "#ff6c6c",
                },
                {
                  from: 0.001,
                  to: 25,
                  color: "#42b142",
                },
              ],
            },
          },
        },
        responsive: [
          {
            breakpoint: 768,
            options: {
              chart: {
                height: e,
                type: "treemap",
                toolbar: {
                  show: false,
                },
              },
            },
          },
        ],
      };

      chart_2 = new ApexCharts(document.querySelector("#chart_2"), options);
      chart_2.render();

      // On click Function of 5 BUTTONS [NIFTY 50, NIFTY BANK, NIFTY FIN SERVICE, MIDCAP, SENSEX]
      $("#nifty_btn").click(function () {
        $("#Candlestick_title").text("Nifty 50");
        compare = 0;
        counter_for_Nifty_3min = 0;
        $('#nifty_banknifty').show();
        $('#midcap_body_row').hide();
        $("#nifty_btn").addClass("gb_active");
        $("#bnknifty_btn").removeClass("gb_active");
        $("#finnifty_btn").removeClass("gb_active");
        $("#midcap_btn").removeClass("gb_active");
        $("#unAuth_midcap_btn").removeClass("gb_active");
        $("#sensex_btn").removeClass("gb_active");
        $("#unAuth_sensex_btn").removeClass("gb_active");
        $("#Expiry").prop("selectedIndex", 0);
        $("#Time_Frame").prop("selectedIndex", 0);
        call_Expiry_API("NIFTY 50");
        call_Candlestick_API("NIFTY 50");
        call_Volume_API("NIFTY 50", Nifty_exp_1);
        call_Heat_Map_API("Nifty50");
        call_Dial_API("NIFTY 50", Nifty_exp_1, Expiry_data[0][1]);
        calculation_for_Exp_1(Volume_data);
        ohlc_and_Volume(Candle_data);
        update_all_chart("Nifty 50", ohlc, Volume);
      });
      $("#bnknifty_btn").click(function () {
        $("#Candlestick_title").text("Nifty Bank");
        compare = 0;
        counter_for_Nifty_3min = 0;
        $('#nifty_banknifty').show();
        $('#midcap_body_row').hide();
        $("#nifty_btn").removeClass("gb_active");
        $("#bnknifty_btn").addClass("gb_active");
        $("#finnifty_btn").removeClass("gb_active");
        $("#midcap_btn").removeClass("gb_active");
        $("#unAuth_midcap_btn").removeClass("gb_active");
        $("#sensex_btn").removeClass("gb_active");
        $("#unAuth_sensex_btn").removeClass("gb_active");
        $("#Expiry").prop("selectedIndex", 0);
        $("#Time_Frame").prop("selectedIndex", 0);
        call_Expiry_API("NIFTY BANK");
        call_Candlestick_API("NIFTY BANK");
        call_Volume_API("NIFTY BANK", Nifty_exp_1);
        call_Heat_Map_API("BNF");
        call_Dial_API("NIFTY BANK", Nifty_exp_1, Expiry_data[0][1]);
        calculation_for_Exp_1(Volume_data);
        ohlc_and_Volume(Candle_data);
        update_all_chart("Nifty Bank", ohlc, Volume);
      });
      $("#finnifty_btn").click(function () {
        $("#Candlestick_title").text("Nifty Fin Service");
        compare = 0;
        counter_for_Nifty_3min = 0;
        $('#nifty_banknifty').show();
        $('#midcap_body_row').hide();
        $("#nifty_btn").removeClass("gb_active");
        $("#bnknifty_btn").removeClass("gb_active");
        $("#finnifty_btn").addClass("gb_active");
        $("#midcap_btn").removeClass("gb_active");
        $("#unAuth_midcap_btn").removeClass("gb_active");
        $("#sensex_btn").removeClass("gb_active");
        $("#unAuth_sensex_btn").removeClass("gb_active");
        $("#Expiry").prop("selectedIndex", 0);
        $("#Time_Frame").prop("selectedIndex", 0);
        call_Expiry_API("NIFTY FIN SERVICE");
        call_Candlestick_API("NIFTY FIN SERVICE");
        call_Volume_API("NIFTY FIN SERVICE", Nifty_exp_1);
        call_Heat_Map_API("FINNIFTY");
        call_Dial_API("NIFTY FIN SERVICE", Nifty_exp_1, Expiry_data[0][1]);
        calculation_for_Exp_1(Volume_data);
        ohlc_and_Volume(Candle_data);
        update_all_chart("Nifty Fin Service", ohlc, Volume);
      });
      $("#midcap_btn").click(function () {
        $("#Candlestick_title").text("Midcap");
        compare = 0;
        counter_for_Nifty_3min = 0;
        $('#nifty_banknifty').show();
        $('#midcap_body_row').hide();
        $("#nifty_btn").removeClass("gb_active");
        $("#bnknifty_btn").removeClass("gb_active");
        $("#finnifty_btn").removeClass("gb_active");
        $("#midcap_btn").addClass("gb_active");
        $("#unAuth_midcap_btn").removeClass("gb_active");
        $("#sensex_btn").removeClass("gb_active");
        $("#unAuth_sensex_btn").removeClass("gb_active");
        $("#Expiry").prop("selectedIndex", 0);
        $("#Time_Frame").prop("selectedIndex", 0);
        call_Expiry_API("NIFTY MID SELECT");
        call_Candlestick_API("NIFTY MID SELECT");
        call_Volume_API("NIFTY MID SELECT", Nifty_exp_1);
        call_Heat_Map_API("MIDCAP");
        call_Dial_API("NIFTY MID SELECT", Nifty_exp_1, Expiry_data[0][1]);
        calculation_for_Exp_1(Volume_data);
        ohlc_and_Volume(Candle_data);
        update_all_chart("Nifty Midcap", ohlc, Volume);
      });
      $("#unAuth_midcap_btn").click(function () {
        $("#nifty_btn").removeClass("gb_active");
        $("#bnknifty_btn").removeClass("gb_active");
        $("#finnifty_btn").removeClass("gb_active");
        $("#midcap_btn").removeClass("gb_active");
        $("#unAuth_midcap_btn").addClass("gb_active");
        $("#sensex_btn").removeClass("gb_active");
        $("#unAuth_sensex_btn").removeClass("gb_active");

        $('#nifty_banknifty').hide();
        $('#midcap_body_row').show();

        $('#span_text_for_unauth').text('Get Midcap and other features for Free by opening Dhan account using our link')
      });
      $("#sensex_btn").click(function () {
        $("#Candlestick_title").text("Sensex");
        compare = 0;
        counter_for_Nifty_3min = 0;
        $('#nifty_banknifty').show();
        $('#midcap_body_row').hide();
        $("#nifty_btn").removeClass("gb_active");
        $("#bnknifty_btn").removeClass("gb_active");
        $("#finnifty_btn").removeClass("gb_active");
        $("#midcap_btn").removeClass("gb_active");
        $("#unAuth_midcap_btn").removeClass("gb_active");
        $("#sensex_btn").addClass("gb_active");
        $("#unAuth_sensex_btn").removeClass("gb_active");
        $("#Expiry").prop("selectedIndex", 0);
        $("#Time_Frame").prop("selectedIndex", 0);
        call_Expiry_API("SENSEX");
        call_Candlestick_API("SENSEX");
        call_Volume_API("SENSEX", Nifty_exp_1);
        call_Heat_Map_API("SENSEX");
        call_Dial_API("SENSEX", Nifty_exp_1, Expiry_data[0][1]);
        calculation_for_Exp_1(Volume_data);
        ohlc_and_Volume(Candle_data);
        update_all_chart("Nifty Sensex", ohlc, Volume);
      });
      $("#unAuth_sensex_btn").click(function () {
        $("#nifty_btn").removeClass("gb_active");
        $("#bnknifty_btn").removeClass("gb_active");
        $("#finnifty_btn").removeClass("gb_active");
        $("#midcap_btn").removeClass("gb_active");
        $("#unAuth_midcap_btn").removeClass("gb_active");
        $("#sensex_btn").removeClass("gb_active");
        $("#unAuth_sensex_btn").addClass("gb_active");

        $('#nifty_banknifty').hide();
        $('#midcap_body_row').show();

        $('#span_text_for_unauth').text('Get Sensex and other features for Free by opening Dhan account using our link');
      });

      //Expiry Change
      $("#Expiry").change(function () {
        var x = $("#Expiry").prop("selectedIndex");
        var y = $("#Time_Frame").prop("selectedIndex");

        if ($("#nifty_btn").hasClass("gb_active") && x == 1 && y == 0) {
          compare = 0;
          counter_for_Nifty_3min = 0;

          call_Volume_API("NIFTY 50", Nifty_exp_2);
          call_Dial_API("NIFTY 50", Nifty_exp_2, Expiry_data[1][1]);
          calculation_for_Exp_1(Volume_data);
          ohlc_and_Volume(Candle_data);
          update_all_chart("Nifty 50", ohlc, Volume);
        } else if ($("#nifty_btn").hasClass("gb_active") && x == 0 && y == 0) {
          compare = 0;
          counter_for_Nifty_3min = 0;

          call_Volume_API("NIFTY 50", Nifty_exp_1);
          call_Dial_API("NIFTY 50", Nifty_exp_1, Expiry_data[0][1]);
          calculation_for_Exp_1(Volume_data);
          ohlc_and_Volume(Candle_data);
          update_all_chart("Nifty 50", ohlc, Volume);
        } else if ($("#bnknifty_btn").hasClass("gb_active") && x == 1 && y == 0) {
          compare = 0;
          counter_for_Nifty_3min = 0;

          call_Volume_API("NIFTY BANK", Nifty_exp_2);
          call_Dial_API("NIFTY BANK", Nifty_exp_2, Expiry_data[1][1]);
          calculation_for_Exp_1(Volume_data);
          ohlc_and_Volume(Candle_data);
          update_all_chart("Nifty Bank", ohlc, Volume);
        } else if ($("#bnknifty_btn").hasClass("gb_active") && x == 0 && y == 0) {
          compare = 0;
          counter_for_Nifty_3min = 0;

          call_Volume_API("NIFTY BANK", Nifty_exp_1);
          call_Dial_API("NIFTY BANK", Nifty_exp_1, Expiry_data[0][1]);
          calculation_for_Exp_1(Volume_data);
          ohlc_and_Volume(Candle_data);
          update_all_chart("Nifty Bank", ohlc, Volume);
        } else if ($("#finnifty_btn").hasClass("gb_active") && x == 1 && y == 0) {
          compare = 0;
          counter_for_Nifty_3min = 0;

          call_Volume_API("NIFTY FIN SERVICE", Nifty_exp_2);
          call_Dial_API("NIFTY FIN SERVICE", Nifty_exp_2, Expiry_data[1][1]);
          calculation_for_Exp_1(Volume_data);
          ohlc_and_Volume(Candle_data);
          update_all_chart("Nifty Fin Service", ohlc, Volume);
        } else if ($("#finnifty_btn").hasClass("gb_active") && x == 0 && y == 0) {
          compare = 0;
          counter_for_Nifty_3min = 0;

          call_Volume_API("NIFTY FIN SERVICE", Nifty_exp_1);
          call_Dial_API("NIFTY FIN SERVICE", Nifty_exp_1, Expiry_data[0][1]);
          calculation_for_Exp_1(Volume_data);
          ohlc_and_Volume(Candle_data);
          update_all_chart("Nifty Fin Service", ohlc, Volume);
        } else if ($("#midcap_btn").hasClass("gb_active") && x == 1 && y == 0) {
          compare = 0;
          counter_for_Nifty_3min = 0;

          call_Volume_API("NIFTY MID SELECT", Nifty_exp_2);
          call_Dial_API("NIFTY MID SELECT", Nifty_exp_2, Expiry_data[1][1]);
          calculation_for_Exp_1(Volume_data);
          ohlc_and_Volume(Candle_data);
          update_all_chart("Nifty Midcap", ohlc, Volume);
        } else if ($("#midcap_btn").hasClass("gb_active") && x == 0 && y == 0) {
          compare = 0;
          counter_for_Nifty_3min = 0;

          call_Volume_API("NIFTY MID SELECT", Nifty_exp_1);
          call_Dial_API("NIFTY MID SELECT", Nifty_exp_1, Expiry_data[0][1]);
          calculation_for_Exp_1(Volume_data);
          ohlc_and_Volume(Candle_data);
          update_all_chart("Nifty Midcap", ohlc, Volume);
        } else if ($("#sensex_btn").hasClass("gb_active") && x == 1 && y == 0) {
          compare = 0;
          counter_for_Nifty_3min = 0;

          call_Volume_API("SENSEX", Nifty_exp_2);
          call_Dial_API("SENSEX", Nifty_exp_2, Expiry_data[1][1]);
          calculation_for_Exp_1(Volume_data);
          ohlc_and_Volume(Candle_data);
          update_all_chart("Sensex", ohlc, Volume);
        } else if ($("#sensex_btn").hasClass("gb_active") && x == 0 && y == 0) {
          compare = 0;
          counter_for_Nifty_3min = 0;

          call_Volume_API("SENSEX", Nifty_exp_1);
          call_Dial_API("SENSEX", Nifty_exp_1, Expiry_data[0][1]);
          calculation_for_Exp_1(Volume_data);
          ohlc_and_Volume(Candle_data);
          update_all_chart("Sensex", ohlc, Volume);
        } else if ($("#nifty_btn").hasClass("gb_active") && x == 1 && y == 1) {
          compare = 0;
          counter_for_Nifty_15min = 0;
          counter_for_Nifty_3min = 0;

          call_Volume_API("NIFTY 50", Nifty_exp_2);
          call_Dial_API("NIFTY 50", Nifty_exp_2, Expiry_data[1][1]);
          calculation_for_Exp_1(Volume_data);
          ohlc_and_Volume(Candle_data);
          ohlc_and_Volume_15min(Candle_data);
          ohlc_and_Volume_15min_addition(900, 25);
          update_all_chart("Nifty 50", ohlc, Volume);
        } else if ($("#nifty_btn").hasClass("gb_active") && x == 0 && y == 1) {
          compare = 0;
          counter_for_Nifty_15min = 0;
          counter_for_Nifty_3min = 0;

          call_Volume_API("NIFTY 50", Nifty_exp_1);
          call_Dial_API("NIFTY 50", Nifty_exp_1, Expiry_data[0][1]);
          calculation_for_Exp_1(Volume_data);
          ohlc_and_Volume(Candle_data);
          ohlc_and_Volume_15min(Candle_data);
          ohlc_and_Volume_15min_addition(900, 25);
          update_all_chart("Nifty 50", ohlc, Volume);
        } else if ($("#bnknifty_btn").hasClass("gb_active") && x == 1 && y == 1) {
          compare = 0;
          counter_for_Nifty_15min = 0;
          counter_for_Nifty_3min = 0;

          call_Volume_API("NIFTY BANK", Nifty_exp_2);
          call_Dial_API("NIFTY BANK", Nifty_exp_2, Expiry_data[1][1]);
          calculation_for_Exp_1(Volume_data);
          ohlc_and_Volume(Candle_data);
          ohlc_and_Volume_15min(Candle_data);
          ohlc_and_Volume_15min_addition(900, 25);
          update_all_chart("Nifty Bank", ohlc, Volume);
        } else if ($("#bnknifty_btn").hasClass("gb_active") && x == 0 && y == 1) {
          compare = 0;
          counter_for_Nifty_15min = 0;
          counter_for_Nifty_3min = 0;

          call_Volume_API("NIFTY BANK", Nifty_exp_1);
          call_Dial_API("NIFTY BANK", Nifty_exp_1, Expiry_data[0][1]);
          calculation_for_Exp_1(Volume_data);
          ohlc_and_Volume(Candle_data);
          ohlc_and_Volume_15min(Candle_data);
          ohlc_and_Volume_15min_addition(900, 25);
          update_all_chart("Nifty Bank", ohlc, Volume);
        } else if ($("#finnifty_btn").hasClass("gb_active") && x == 1 && y == 1) {
          compare = 0;
          counter_for_Nifty_15min = 0;
          counter_for_Nifty_3min = 0;

          call_Volume_API("NIFTY FIN SERVICE", Nifty_exp_2);
          call_Dial_API("NIFTY FIN SERVICE", Nifty_exp_2, Expiry_data[1][1]);
          calculation_for_Exp_1(Volume_data);
          ohlc_and_Volume(Candle_data);
          ohlc_and_Volume_15min(Candle_data);
          ohlc_and_Volume_15min_addition(900, 25);
          update_all_chart("Nifty Fin Service", ohlc, Volume);
        } else if ($("#finnifty_btn").hasClass("gb_active") && x == 0 && y == 1) {
          compare = 0;
          counter_for_Nifty_15min = 0;
          counter_for_Nifty_3min = 0;

          call_Volume_API("NIFTY FIN SERVICE", Nifty_exp_1);
          call_Dial_API("NIFTY FIN SERVICE", Nifty_exp_1, Expiry_data[0][1]);
          calculation_for_Exp_1(Volume_data);
          ohlc_and_Volume(Candle_data);
          ohlc_and_Volume_15min(Candle_data);
          ohlc_and_Volume_15min_addition(900, 25);
          update_all_chart("Nifty Fin Service", ohlc, Volume);
        } else if ($("#midcap_btn").hasClass("gb_active") && x == 1 && y == 1) {
          compare = 0;
          counter_for_Nifty_15min = 0;
          counter_for_Nifty_3min = 0;

          call_Volume_API("NIFTY MID SELECT", Nifty_exp_2);
          call_Dial_API("NIFTY MID SELECT", Nifty_exp_2, Expiry_data[1][1]);
          calculation_for_Exp_1(Volume_data);
          ohlc_and_Volume(Candle_data);
          ohlc_and_Volume_15min(Candle_data);
          ohlc_and_Volume_15min_addition(900, 25);
          update_all_chart("Nifty Midcap", ohlc, Volume);
        } else if ($("#midcap_btn").hasClass("gb_active") && x == 0 && y == 1) {
          compare = 0;
          counter_for_Nifty_15min = 0;
          counter_for_Nifty_3min = 0;

          call_Volume_API("NIFTY MID SELECT", Nifty_exp_1);
          call_Dial_API("NIFTY MID SELECT", Nifty_exp_1, Expiry_data[0][1]);
          calculation_for_Exp_1(Volume_data);
          ohlc_and_Volume(Candle_data);
          ohlc_and_Volume_15min(Candle_data);
          ohlc_and_Volume_15min_addition(900, 25);
          update_all_chart("Nifty Midcap", ohlc, Volume);
        } else if ($("#sensex_btn").hasClass("gb_active") && x == 1 && y == 1) {
          compare = 0;
          counter_for_Nifty_15min = 0;
          counter_for_Nifty_3min = 0;

          call_Volume_API("SENSEX", Nifty_exp_2);
          call_Dial_API("SENSEX", Nifty_exp_2, Expiry_data[1][1]);
          calculation_for_Exp_1(Volume_data);
          ohlc_and_Volume(Candle_data);
          ohlc_and_Volume_15min(Candle_data);
          ohlc_and_Volume_15min_addition(900, 25);
          update_all_chart("Sensex", ohlc, Volume);
        } else if ($("#sensex_btn").hasClass("gb_active") && x == 0 && y == 1) {
          compare = 0;
          counter_for_Nifty_15min = 0;
          counter_for_Nifty_3min = 0;

          call_Volume_API("SENSEX", Nifty_exp_1);
          call_Dial_API("SENSEX", Nifty_exp_1, Expiry_data[0][1]);
          calculation_for_Exp_1(Volume_data);
          ohlc_and_Volume(Candle_data);
          ohlc_and_Volume_15min(Candle_data);
          ohlc_and_Volume_15min_addition(900, 25);
          update_all_chart("Sensex", ohlc, Volume);
        } else if ($("#nifty_btn").hasClass("gb_active") && x == 1 && y == 2) {
          compare = 0;
          counter_for_Nifty_15min = 0;
          counter_for_Nifty_3min = 0;
          counter_for_Nifty_30min = 0;

          call_Volume_API("NIFTY 50", Nifty_exp_2);
          call_Dial_API("NIFTY 50", Nifty_exp_2, Expiry_data[1][1]);
          calculation_for_Exp_1(Volume_data);
          ohlc_and_Volume(Candle_data);
          ohlc_and_Volume_30min();
          ohlc_and_Volume_15min_addition(1800, 13);
          update_all_chart("Nifty 50", ohlc, Volume);
        } else if ($("#nifty_btn").hasClass("gb_active") && x == 0 && y == 2) {
          compare = 0;
          counter_for_Nifty_15min = 0;
          counter_for_Nifty_3min = 0;
          counter_for_Nifty_30min = 0;

          call_Volume_API("NIFTY 50", Nifty_exp_1);
          call_Dial_API("NIFTY 50", Nifty_exp_1, Expiry_data[0][1]);
          calculation_for_Exp_1(Volume_data);
          ohlc_and_Volume(Candle_data);
          ohlc_and_Volume_30min();
          ohlc_and_Volume_15min_addition(1800, 13);
          update_all_chart("Nifty 50", ohlc, Volume);
        } else if ($("#bnknifty_btn").hasClass("gb_active") && x == 1 && y == 2) {
          compare = 0;
          counter_for_Nifty_15min = 0;
          counter_for_Nifty_3min = 0;
          counter_for_Nifty_30min = 0;

          call_Volume_API("NIFTY BANK", Nifty_exp_2);
          call_Dial_API("NIFTY BANK", Nifty_exp_2, Expiry_data[1][1]);
          calculation_for_Exp_1(Volume_data);
          ohlc_and_Volume(Candle_data);
          ohlc_and_Volume_30min();
          ohlc_and_Volume_15min_addition(1800, 13);
          update_all_chart("Nifty Bank", ohlc, Volume);
        } else if ($("#bnknifty_btn").hasClass("gb_active") && x == 0 && y == 2) {
          compare = 0;
          counter_for_Nifty_15min = 0;
          counter_for_Nifty_3min = 0;
          counter_for_Nifty_30min = 0;

          call_Volume_API("NIFTY BANK", Nifty_exp_1);
          call_Dial_API("NIFTY BANK", Nifty_exp_1, Expiry_data[0][1]);
          calculation_for_Exp_1(Volume_data);
          ohlc_and_Volume(Candle_data);
          ohlc_and_Volume_30min();
          ohlc_and_Volume_15min_addition(1800, 13);
          update_all_chart("Nifty Bank", ohlc, Volume);
        } else if ($("#finnifty_btn").hasClass("gb_active") && x == 1 && y == 2) {
          compare = 0;
          counter_for_Nifty_15min = 0;
          counter_for_Nifty_3min = 0;
          counter_for_Nifty_30min = 0;

          call_Volume_API("NIFTY FIN SERVICE", Nifty_exp_2);
          call_Dial_API("NIFTY FIN SERVICE", Nifty_exp_2, Expiry_data[1][1]);
          calculation_for_Exp_1(Volume_data);
          ohlc_and_Volume(Candle_data);
          ohlc_and_Volume_30min();
          ohlc_and_Volume_15min_addition(1800, 13);
          update_all_chart("Nifty Fin Service", ohlc, Volume);
        } else if ($("#finnifty_btn").hasClass("gb_active") && x == 0 && y == 2) {
          compare = 0;
          counter_for_Nifty_15min = 0;
          counter_for_Nifty_3min = 0;
          counter_for_Nifty_30min = 0;

          call_Volume_API("NIFTY FIN SERVICE", Nifty_exp_1);
          call_Dial_API("NIFTY FIN SERVICE", Nifty_exp_1, Expiry_data[0][1]);
          calculation_for_Exp_1(Volume_data);
          ohlc_and_Volume(Candle_data);
          ohlc_and_Volume_30min();
          ohlc_and_Volume_15min_addition(1800, 13);
          update_all_chart("Nifty Fin Service", ohlc, Volume);
        } else if ($("#midcap_btn").hasClass("gb_active") && x == 1 && y == 2) {
          compare = 0;
          counter_for_Nifty_15min = 0;
          counter_for_Nifty_3min = 0;
          counter_for_Nifty_30min = 0;

          call_Volume_API("NIFTY MID SELECT", Nifty_exp_2);
          call_Dial_API("NIFTY MID SELECT", Nifty_exp_2, Expiry_data[1][1]);
          calculation_for_Exp_1(Volume_data);
          ohlc_and_Volume(Candle_data);
          ohlc_and_Volume_30min();
          ohlc_and_Volume_15min_addition(1800, 13);
          update_all_chart("Nifty Midcap", ohlc, Volume);
        } else if ($("#midcap_btn").hasClass("gb_active") && x == 0 && y == 2) {
          compare = 0;
          counter_for_Nifty_15min = 0;
          counter_for_Nifty_3min = 0;
          counter_for_Nifty_30min = 0;

          call_Volume_API("NIFTY MID SELECT", Nifty_exp_1);
          call_Dial_API("NIFTY MID SELECT", Nifty_exp_1, Expiry_data[0][1]);
          calculation_for_Exp_1(Volume_data);
          ohlc_and_Volume(Candle_data);
          ohlc_and_Volume_30min();
          ohlc_and_Volume_15min_addition(1800, 13);
          update_all_chart("Nifty Midcap", ohlc, Volume);
        } else if ($("#sensex_btn").hasClass("gb_active") && x == 1 && y == 2) {
          compare = 0;
          counter_for_Nifty_15min = 0;
          counter_for_Nifty_3min = 0;
          counter_for_Nifty_30min = 0;

          call_Volume_API("SENSEX", Nifty_exp_2);
          call_Dial_API("SENSEX", Nifty_exp_2, Expiry_data[1][1]);
          calculation_for_Exp_1(Volume_data);
          ohlc_and_Volume(Candle_data);
          ohlc_and_Volume_30min();
          ohlc_and_Volume_15min_addition(1800, 13);
          update_all_chart("Sensex", ohlc, Volume);
        } else if ($("#sensex_btn").hasClass("gb_active") && x == 0 && y == 2) {
          compare = 0;
          counter_for_Nifty_15min = 0;
          counter_for_Nifty_3min = 0;
          counter_for_Nifty_30min = 0;

          call_Volume_API("SENSEX", Nifty_exp_1);
          call_Dial_API("SENSEX", Nifty_exp_1, Expiry_data[0][1]);
          calculation_for_Exp_1(Volume_data);
          ohlc_and_Volume(Candle_data);
          ohlc_and_Volume_30min();
          ohlc_and_Volume_15min_addition(1800, 13);
          update_all_chart("Sensex", ohlc, Volume);
        }
      });

      //Time Frame Change
      $("#Time_Frame").change(function () {
        var x = $("#Expiry").prop("selectedIndex");
        var y = $("#Time_Frame").prop("selectedIndex");
        if ($("#nifty_btn").hasClass("gb_active") && x == 1 && y == 0) {
          compare = 0;
          counter_for_Nifty_3min = 0;
          call_Volume_API("NIFTY 50", Nifty_exp_2);
          call_Dial_API("NIFTY 50", Nifty_exp_2, Expiry_data[1][1]);
          calculation_for_Exp_1(Volume_data);
          ohlc_and_Volume(Candle_data);
          update_all_chart("Nifty 50", ohlc, Volume);
        } else if ($("#nifty_btn").hasClass("gb_active") && x == 0 && y == 0) {
          compare = 0;
          counter_for_Nifty_3min = 0;

          call_Volume_API("NIFTY 50", Nifty_exp_1);
          call_Dial_API("NIFTY 50", Nifty_exp_1, Expiry_data[0][1]);
          calculation_for_Exp_1(Volume_data);
          ohlc_and_Volume(Candle_data);
          update_all_chart("Nifty 50", ohlc, Volume);
        } else if ($("#bnknifty_btn").hasClass("gb_active") && x == 1 && y == 0) {
          compare = 0;
          counter_for_Nifty_3min = 0;

          call_Volume_API("NIFTY BANK", Nifty_exp_2);
          call_Dial_API("NIFTY BANK", Nifty_exp_2, Expiry_data[1][1]);
          calculation_for_Exp_1(Volume_data);
          ohlc_and_Volume(Candle_data);
          update_all_chart("Nifty Bank", ohlc, Volume);
        } else if ($("#bnknifty_btn").hasClass("gb_active") && x == 0 && y == 0) {
          compare = 0;
          counter_for_Nifty_3min = 0;

          call_Volume_API("NIFTY BANK", Nifty_exp_1);
          call_Dial_API("NIFTY BANK", Nifty_exp_1, Expiry_data[0][1]);
          calculation_for_Exp_1(Volume_data);
          ohlc_and_Volume(Candle_data);
          update_all_chart("Nifty Bank", ohlc, Volume);
        } else if ($("#finnifty_btn").hasClass("gb_active") && x == 1 && y == 0) {
          compare = 0;
          counter_for_Nifty_3min = 0;

          call_Volume_API("NIFTY FIN SERVICE", Nifty_exp_2);
          call_Dial_API("NIFTY FIN SERVICE", Nifty_exp_2, Expiry_data[1][1]);
          calculation_for_Exp_1(Volume_data);
          ohlc_and_Volume(Candle_data);
          update_all_chart("Nifty Fin Service", ohlc, Volume);
        } else if ($("#finnifty_btn").hasClass("gb_active") && x == 0 && y == 0) {
          compare = 0;
          counter_for_Nifty_3min = 0;

          call_Volume_API("NIFTY FIN SERVICE", Nifty_exp_1);
          call_Dial_API("NIFTY FIN SERVICE", Nifty_exp_1, Expiry_data[0][1]);
          calculation_for_Exp_1(Volume_data);
          ohlc_and_Volume(Candle_data);
          update_all_chart("Nifty Fin Service", ohlc, Volume);
        } else if ($("#midcap_btn").hasClass("gb_active") && x == 1 && y == 0) {
          compare = 0;
          counter_for_Nifty_3min = 0;

          call_Volume_API("NIFTY MID SELECT", Nifty_exp_2);
          call_Dial_API("NIFTY MID SELECT", Nifty_exp_2, Expiry_data[1][1]);
          calculation_for_Exp_1(Volume_data);
          ohlc_and_Volume(Candle_data);
          update_all_chart("Nifty Midcap", ohlc, Volume);
        } else if ($("#midcap_btn").hasClass("gb_active") && x == 0 && y == 0) {
          compare = 0;
          counter_for_Nifty_3min = 0;

          call_Volume_API("NIFTY MID SELECT", Nifty_exp_1);
          call_Dial_API("NIFTY MID SELECT", Nifty_exp_1, Expiry_data[0][1]);
          calculation_for_Exp_1(Volume_data);
          ohlc_and_Volume(Candle_data);
          update_all_chart("Nifty Midcap", ohlc, Volume);
        } else if ($("#sensex_btn").hasClass("gb_active") && x == 1 && y == 0) {
          compare = 0;
          counter_for_Nifty_3min = 0;

          call_Volume_API("SENSEX", Nifty_exp_2);
          call_Dial_API("SENSEX", Nifty_exp_2, Expiry_data[1][1]);
          calculation_for_Exp_1(Volume_data);
          ohlc_and_Volume(Candle_data);
          update_all_chart("sensex", ohlc, Volume);
        } else if ($("#sensex_btn").hasClass("gb_active") && x == 0 && y == 0) {
          compare = 0;
          counter_for_Nifty_3min = 0;

          call_Volume_API("SENSEX", Nifty_exp_1);
          call_Dial_API("SENSEX", Nifty_exp_1, Expiry_data[0][1]);
          calculation_for_Exp_1(Volume_data);
          ohlc_and_Volume(Candle_data);
          update_all_chart("sensex", ohlc, Volume);
        } else if ($("#nifty_btn").hasClass("gb_active") && x == 1 && y == 1) {
          compare = 0;
          counter_for_Nifty_15min = 0;
          counter_for_Nifty_3min = 0;

          call_Volume_API("NIFTY 50", Nifty_exp_2);
          call_Dial_API("NIFTY 50", Nifty_exp_2, Expiry_data[1][1]);
          calculation_for_Exp_1(Volume_data);
          ohlc_and_Volume(Candle_data);
          ohlc_and_Volume_15min(Candle_data);
          ohlc_and_Volume_15min_addition(900, 25);
          update_all_chart("Nifty 50", ohlc, Volume);
        } else if ($("#nifty_btn").hasClass("gb_active") && x == 0 && y == 1) {
          compare = 0;
          counter_for_Nifty_15min = 0;
          counter_for_Nifty_3min = 0;

          call_Volume_API("NIFTY 50", Nifty_exp_1);
          call_Dial_API("NIFTY 50", Nifty_exp_1, Expiry_data[0][1]);
          calculation_for_Exp_1(Volume_data);
          ohlc_and_Volume(Candle_data);
          ohlc_and_Volume_15min(Candle_data);
          ohlc_and_Volume_15min_addition(900, 25);
          update_all_chart("Nifty 50", ohlc, Volume);
        } else if ($("#bnknifty_btn").hasClass("gb_active") && x == 1 && y == 1) {
          compare = 0;
          counter_for_Nifty_15min = 0;
          counter_for_Nifty_3min = 0;

          call_Volume_API("NIFTY BANK", Nifty_exp_2);
          call_Dial_API("NIFTY BANK", Nifty_exp_2, Expiry_data[1][1]);
          calculation_for_Exp_1(Volume_data);
          ohlc_and_Volume(Candle_data);
          ohlc_and_Volume_15min(Candle_data);
          ohlc_and_Volume_15min_addition(900, 25);
          update_all_chart("Nifty Bank", ohlc, Volume);
        } else if ($("#bnknifty_btn").hasClass("gb_active") && x == 0 && y == 1) {
          compare = 0;
          counter_for_Nifty_15min = 0;
          counter_for_Nifty_3min = 0;

          call_Volume_API("NIFTY BANK", Nifty_exp_1);
          call_Dial_API("NIFTY BANK", Nifty_exp_1, Expiry_data[0][1]);
          calculation_for_Exp_1(Volume_data);
          ohlc_and_Volume(Candle_data);
          ohlc_and_Volume_15min(Candle_data);
          ohlc_and_Volume_15min_addition(900, 25);
          update_all_chart("Nifty Bank", ohlc, Volume);
        } else if ($("#finnifty_btn").hasClass("gb_active") && x == 1 && y == 1) {
          compare = 0;
          counter_for_Nifty_15min = 0;
          counter_for_Nifty_3min = 0;

          call_Volume_API("NIFTY FIN SERVICE", Nifty_exp_2);
          call_Dial_API("NIFTY FIN SERVICE", Nifty_exp_2, Expiry_data[1][1]);
          calculation_for_Exp_1(Volume_data);
          ohlc_and_Volume(Candle_data);
          ohlc_and_Volume_15min(Candle_data);
          ohlc_and_Volume_15min_addition(900, 25);
          update_all_chart("Nifty Fin Service", ohlc, Volume);
        } else if ($("#finnifty_btn").hasClass("gb_active") && x == 0 && y == 1) {
          compare = 0;
          counter_for_Nifty_15min = 0;
          counter_for_Nifty_3min = 0;

          call_Volume_API("NIFTY FIN SERVICE", Nifty_exp_1);
          call_Dial_API("NIFTY FIN SERVICE", Nifty_exp_1, Expiry_data[0][1]);
          calculation_for_Exp_1(Volume_data);
          ohlc_and_Volume(Candle_data);
          ohlc_and_Volume_15min(Candle_data);
          ohlc_and_Volume_15min_addition(900, 25);
          update_all_chart("Nifty Fin Service", ohlc, Volume);
        } else if ($("#midcap_btn").hasClass("gb_active") && x == 1 && y == 1) {
          compare = 0;
          counter_for_Nifty_15min = 0;
          counter_for_Nifty_3min = 0;

          call_Volume_API("NIFTY MID SELECT", Nifty_exp_2);
          call_Dial_API("NIFTY MID SELECT", Nifty_exp_2, Expiry_data[1][1]);
          calculation_for_Exp_1(Volume_data);
          ohlc_and_Volume(Candle_data);
          ohlc_and_Volume_15min(Candle_data);
          ohlc_and_Volume_15min_addition(900, 25);
          update_all_chart("Nifty Midcap", ohlc, Volume);
        } else if ($("#midcap_btn").hasClass("gb_active") && x == 0 && y == 1) {
          compare = 0;
          counter_for_Nifty_15min = 0;
          counter_for_Nifty_3min = 0;

          call_Volume_API("NIFTY MID SELECT", Nifty_exp_1);
          call_Dial_API("NIFTY MID SELECT", Nifty_exp_1, Expiry_data[0][1]);
          calculation_for_Exp_1(Volume_data);
          ohlc_and_Volume(Candle_data);
          ohlc_and_Volume_15min(Candle_data);
          ohlc_and_Volume_15min_addition(900, 25);
          update_all_chart("Nifty Midcap", ohlc, Volume);
        } else if ($("#sensex_btn").hasClass("gb_active") && x == 1 && y == 1) {
          compare = 0;
          counter_for_Nifty_15min = 0;
          counter_for_Nifty_3min = 0;

          call_Volume_API("SENSEX", Nifty_exp_2);
          call_Dial_API("SENSEX", Nifty_exp_2, Expiry_data[1][1]);
          calculation_for_Exp_1(Volume_data);
          ohlc_and_Volume(Candle_data);
          ohlc_and_Volume_15min(Candle_data);
          ohlc_and_Volume_15min_addition(900, 25);
          update_all_chart("Sensex", ohlc, Volume);
        } else if ($("#sensex_btn").hasClass("gb_active") && x == 0 && y == 1) {
          compare = 0;
          counter_for_Nifty_15min = 0;
          counter_for_Nifty_3min = 0;

          call_Volume_API("SENSEX", Nifty_exp_1);
          call_Dial_API("SENSEX", Nifty_exp_1, Expiry_data[0][1]);
          calculation_for_Exp_1(Volume_data);
          ohlc_and_Volume(Candle_data);
          ohlc_and_Volume_15min(Candle_data);
          ohlc_and_Volume_15min_addition(900, 25);
          update_all_chart("Sensex", ohlc, Volume);
        } else if ($("#nifty_btn").hasClass("gb_active") && x == 1 && y == 2) {
          compare = 0;
          counter_for_Nifty_15min = 0;
          counter_for_Nifty_3min = 0;
          counter_for_Nifty_30min = 0;

          call_Volume_API("NIFTY 50", Nifty_exp_2);
          call_Dial_API("NIFTY 50", Nifty_exp_2, Expiry_data[1][1]);
          calculation_for_Exp_1(Volume_data);
          ohlc_and_Volume(Candle_data);
          ohlc_and_Volume_30min();
          ohlc_and_Volume_15min_addition(1800, 13);
          update_all_chart("Nifty 50", ohlc, Volume);
        } else if ($("#nifty_btn").hasClass("gb_active") && x == 0 && y == 2) {
          compare = 0;
          counter_for_Nifty_15min = 0;
          counter_for_Nifty_3min = 0;
          counter_for_Nifty_30min = 0;

          call_Volume_API("NIFTY 50", Nifty_exp_1);
          call_Dial_API("NIFTY 50", Nifty_exp_1, Expiry_data[0][1]);
          calculation_for_Exp_1(Volume_data);
          ohlc_and_Volume(Candle_data);
          ohlc_and_Volume_30min();
          ohlc_and_Volume_15min_addition(1800, 13);
          update_all_chart("Nifty 50", ohlc, Volume);
        } else if ($("#bnknifty_btn").hasClass("gb_active") && x == 1 && y == 2) {
          compare = 0;
          counter_for_Nifty_15min = 0;
          counter_for_Nifty_3min = 0;
          counter_for_Nifty_30min = 0;

          call_Volume_API("NIFTY BANK", Nifty_exp_2);
          call_Dial_API("NIFTY BANK", Nifty_exp_2, Expiry_data[1][1]);
          calculation_for_Exp_1(Volume_data);
          ohlc_and_Volume(Candle_data);
          ohlc_and_Volume_30min();
          ohlc_and_Volume_15min_addition(1800, 13);
          update_all_chart("Nifty Bank", ohlc, Volume);
        } else if ($("#bnknifty_btn").hasClass("gb_active") && x == 0 && y == 2) {
          compare = 0;
          counter_for_Nifty_15min = 0;
          counter_for_Nifty_3min = 0;
          counter_for_Nifty_30min = 0;

          call_Volume_API("NIFTY BANK", Nifty_exp_1);
          call_Dial_API("NIFTY BANK", Nifty_exp_1, Expiry_data[0][1]);
          calculation_for_Exp_1(Volume_data);
          ohlc_and_Volume(Candle_data);
          ohlc_and_Volume_30min();
          ohlc_and_Volume_15min_addition(1800, 13);
          update_all_chart("Nifty Bank", ohlc, Volume);
        } else if ($("#finnifty_btn").hasClass("gb_active") && x == 1 && y == 2) {
          compare = 0;
          counter_for_Nifty_15min = 0;
          counter_for_Nifty_3min = 0;
          counter_for_Nifty_30min = 0;

          call_Volume_API("NIFTY FIN SERVICE", Nifty_exp_2);
          call_Dial_API("NIFTY FIN SERVICE", Nifty_exp_2, Expiry_data[1][1]);
          calculation_for_Exp_1(Volume_data);
          ohlc_and_Volume(Candle_data);
          ohlc_and_Volume_30min();
          ohlc_and_Volume_15min_addition(1800, 13);
          update_all_chart("Nifty Fin Service", ohlc, Volume);
        } else if ($("#finnifty_btn").hasClass("gb_active") && x == 0 && y == 2) {
          compare = 0;
          counter_for_Nifty_15min = 0;
          counter_for_Nifty_3min = 0;
          counter_for_Nifty_30min = 0;

          call_Volume_API("NIFTY FIN SERVICE", Nifty_exp_1);
          call_Dial_API("NIFTY FIN SERVICE", Nifty_exp_1, Expiry_data[0][1]);
          calculation_for_Exp_1(Volume_data);
          ohlc_and_Volume(Candle_data);
          ohlc_and_Volume_30min();
          ohlc_and_Volume_15min_addition(1800, 13);
          update_all_chart("Nifty Fin Service", ohlc, Volume);
        } else if ($("#midcap_btn").hasClass("gb_active") && x == 1 && y == 2) {
          compare = 0;
          counter_for_Nifty_15min = 0;
          counter_for_Nifty_3min = 0;
          counter_for_Nifty_30min = 0;

          call_Volume_API("NIFTY MID SELECT", Nifty_exp_2);
          call_Dial_API("NIFTY MID SELECT", Nifty_exp_2, Expiry_data[1][1]);
          calculation_for_Exp_1(Volume_data);
          ohlc_and_Volume(Candle_data);
          ohlc_and_Volume_30min();
          ohlc_and_Volume_15min_addition(1800, 13);
          update_all_chart("Nifty Midcap", ohlc, Volume);
        } else if ($("#midcap_btn").hasClass("gb_active") && x == 0 && y == 2) {
          compare = 0;
          counter_for_Nifty_15min = 0;
          counter_for_Nifty_3min = 0;
          counter_for_Nifty_30min = 0;

          call_Volume_API("NIFTY MID SELECT", Nifty_exp_1);
          call_Dial_API("NIFTY MID SELECT", Nifty_exp_1, Expiry_data[0][1]);
          calculation_for_Exp_1(Volume_data);
          ohlc_and_Volume(Candle_data);
          ohlc_and_Volume_30min();
          ohlc_and_Volume_15min_addition(1800, 13);
          update_all_chart("Nifty Midcap", ohlc, Volume);
        } else if ($("#sensex_btn").hasClass("gb_active") && x == 1 && y == 2) {
          compare = 0;
          counter_for_Nifty_15min = 0;
          counter_for_Nifty_3min = 0;
          counter_for_Nifty_30min = 0;

          call_Volume_API("SENSEX", Nifty_exp_2);
          call_Dial_API("SENSEX", Nifty_exp_2, Expiry_data[1][1]);
          calculation_for_Exp_1(Volume_data);
          ohlc_and_Volume(Candle_data);
          ohlc_and_Volume_30min();
          ohlc_and_Volume_15min_addition(1800, 13);
          update_all_chart("Sensex", ohlc, Volume);
        } else if ($("#sensex_btn").hasClass("gb_active") && x == 0 && y == 2) {
          compare = 0;
          counter_for_Nifty_15min = 0;
          counter_for_Nifty_3min = 0;
          counter_for_Nifty_30min = 0;

          call_Volume_API("SENSEX", Nifty_exp_1);
          call_Dial_API("SENSEX", Nifty_exp_1, Expiry_data[0][1]);
          calculation_for_Exp_1(Volume_data);
          ohlc_and_Volume(Candle_data);
          ohlc_and_Volume_30min();
          ohlc_and_Volume_15min_addition(1800, 13);
          update_all_chart("Sensex", ohlc, Volume);
        }
      });

      setInterval(function () {
        var x = $("#Expiry").prop("selectedIndex");
        var y = $("#Time_Frame").prop("selectedIndex");
        if ($("#nifty_btn").hasClass("gb_active") && x == 1 && y == 0) {
          compare = 0;
          counter_for_Nifty_3min = 0;

          call_Candlestick_API("NIFTY 50");
          call_Volume_API("NIFTY 50", Nifty_exp_2);
          call_Dial_API("NIFTY 50", Nifty_exp_2, Expiry_data[1][1]);
          calculation_for_Exp_1(Volume_data);
          ohlc_and_Volume(Candle_data);
          update_all_chart("Nifty 50", ohlc, Volume);
        } else if ($("#nifty_btn").hasClass("gb_active") && x == 0 && y == 0) {
          compare = 0;
          counter_for_Nifty_3min = 0;

          call_Candlestick_API("NIFTY 50");
          call_Volume_API("NIFTY 50", Nifty_exp_1);
          call_Dial_API("NIFTY 50", Nifty_exp_1, Expiry_data[0][1]);
          calculation_for_Exp_1(Volume_data);
          ohlc_and_Volume(Candle_data);
          update_all_chart("Nifty 50", ohlc, Volume);
        } else if ($("#bnknifty_btn").hasClass("gb_active") && x == 1 && y == 0) {
          compare = 0;
          counter_for_Nifty_3min = 0;

          call_Candlestick_API("NIFTY BANK");
          call_Volume_API("NIFTY BANK", Nifty_exp_2);
          call_Dial_API("NIFTY BANK", Nifty_exp_2, Expiry_data[1][1]);
          calculation_for_Exp_1(Volume_data);
          ohlc_and_Volume(Candle_data);
          update_all_chart("Nifty Bank", ohlc, Volume);
        } else if ($("#bnknifty_btn").hasClass("gb_active") && x == 0 && y == 0) {
          compare = 0;
          counter_for_Nifty_3min = 0;

          call_Candlestick_API("NIFTY BANK");
          call_Volume_API("NIFTY BANK", Nifty_exp_1);
          call_Dial_API("NIFTY BANK", Nifty_exp_1, Expiry_data[0][1]);
          calculation_for_Exp_1(Volume_data);
          ohlc_and_Volume(Candle_data);
          update_all_chart("Nifty Bank", ohlc, Volume);
        } else if ($("#finnifty_btn").hasClass("gb_active") && x == 1 && y == 0) {
          compare = 0;
          counter_for_Nifty_3min = 0;

          call_Candlestick_API("NIFTY FIN SERVICE");
          call_Volume_API("NIFTY FIN SERVICE", Nifty_exp_2);
          call_Dial_API("NIFTY FIN SERVICE", Nifty_exp_2, Expiry_data[1][1]);
          calculation_for_Exp_1(Volume_data);
          ohlc_and_Volume(Candle_data);
          update_all_chart("Nifty Fin Service", ohlc, Volume);
        } else if ($("#finnifty_btn").hasClass("gb_active") && x == 0 && y == 0) {
          compare = 0;
          counter_for_Nifty_3min = 0;

          call_Candlestick_API("NIFTY FIN SERVICE");
          call_Volume_API("NIFTY FIN SERVICE", Nifty_exp_1);
          call_Dial_API("NIFTY FIN SERVICE", Nifty_exp_1, Expiry_data[0][1]);
          calculation_for_Exp_1(Volume_data);
          ohlc_and_Volume(Candle_data);
          update_all_chart("Nifty Fin Service", ohlc, Volume);
        } else if ($("#midcap_btn").hasClass("gb_active") && x == 1 && y == 0) {
          compare = 0;
          counter_for_Nifty_3min = 0;

          call_Candlestick_API("NIFTY MID SELECT");
          call_Volume_API("NIFTY MID SELECT", Nifty_exp_2);
          call_Dial_API("NIFTY MID SELECT", Nifty_exp_2, Expiry_data[1][1]);
          calculation_for_Exp_1(Volume_data);
          ohlc_and_Volume(Candle_data);
          update_all_chart("Nifty Midcap", ohlc, Volume);
        } else if ($("#midcap_btn").hasClass("gb_active") && x == 0 && y == 0) {
          compare = 0;
          counter_for_Nifty_3min = 0;

          call_Candlestick_API("NIFTY MID SELECT");
          call_Volume_API("NIFTY MID SELECT", Nifty_exp_1);
          call_Dial_API("NIFTY MID SELECT", Nifty_exp_1, Expiry_data[0][1]);
          calculation_for_Exp_1(Volume_data);
          ohlc_and_Volume(Candle_data);
          update_all_chart("Nifty Midcap", ohlc, Volume);
        } else if ($("#sensex_btn").hasClass("gb_active") && x == 1 && y == 0) {
          compare = 0;
          counter_for_Nifty_3min = 0;

          call_Candlestick_API("SENSEX");
          call_Volume_API("SENSEX", Nifty_exp_2);
          call_Dial_API("SENSEX", Nifty_exp_2, Expiry_data[1][1]);
          calculation_for_Exp_1(Volume_data);
          ohlc_and_Volume(Candle_data);
          update_all_chart("Sensex", ohlc, Volume);
        } else if ($("#sensex_btn").hasClass("gb_active") && x == 0 && y == 0) {
          compare = 0;
          counter_for_Nifty_3min = 0;

          call_Candlestick_API("SENSEX");
          call_Volume_API("SENSEX", Nifty_exp_1);
          call_Dial_API("SENSEX", Nifty_exp_1, Expiry_data[0][1]);
          calculation_for_Exp_1(Volume_data);
          ohlc_and_Volume(Candle_data);
          update_all_chart("Sensex", ohlc, Volume);
        } else if ($("#nifty_btn").hasClass("gb_active") && x == 1 && y == 1) {
          compare = 0;
          counter_for_Nifty_15min = 0;
          counter_for_Nifty_3min = 0;

          call_Candlestick_API("NIFTY 50");
          call_Volume_API("NIFTY 50", Nifty_exp_2);
          call_Dial_API("NIFTY 50", Nifty_exp_2, Expiry_data[1][1]);
          calculation_for_Exp_1(Volume_data);
          ohlc_and_Volume(Candle_data);
          ohlc_and_Volume_15min(Candle_data);
          ohlc_and_Volume_15min_addition(900, 25);
          update_all_chart("Nifty 50", ohlc, Volume);
        } else if ($("#nifty_btn").hasClass("gb_active") && x == 0 && y == 1) {
          compare = 0;
          counter_for_Nifty_15min = 0;
          counter_for_Nifty_3min = 0;

          call_Candlestick_API("NIFTY 50");
          call_Volume_API("NIFTY 50", Nifty_exp_1);
          call_Dial_API("NIFTY 50", Nifty_exp_1, Expiry_data[0][1]);
          calculation_for_Exp_1(Volume_data);
          ohlc_and_Volume(Candle_data);
          ohlc_and_Volume_15min(Candle_data);
          ohlc_and_Volume_15min_addition(900, 25);
          update_all_chart("Nifty 50", ohlc, Volume);
        } else if ($("#bnknifty_btn").hasClass("gb_active") && x == 1 && y == 1) {
          compare = 0;
          counter_for_Nifty_15min = 0;
          counter_for_Nifty_3min = 0;

          call_Candlestick_API("NIFTY BANK");
          call_Volume_API("NIFTY BANK", Nifty_exp_2);
          call_Dial_API("NIFTY BANK", Nifty_exp_2, Expiry_data[1][1]);
          calculation_for_Exp_1(Volume_data);
          ohlc_and_Volume(Candle_data);
          ohlc_and_Volume_15min(Candle_data);
          ohlc_and_Volume_15min_addition(900, 25);
          update_all_chart("Nifty Bank", ohlc, Volume);
        } else if ($("#bnknifty_btn").hasClass("gb_active") && x == 0 && y == 1) {
          compare = 0;
          counter_for_Nifty_15min = 0;
          counter_for_Nifty_3min = 0;

          call_Candlestick_API("NIFTY BANK");
          call_Volume_API("NIFTY BANK", Nifty_exp_1);
          call_Dial_API("NIFTY BANK", Nifty_exp_1, Expiry_data[0][1]);
          calculation_for_Exp_1(Volume_data);
          ohlc_and_Volume(Candle_data);
          ohlc_and_Volume_15min(Candle_data);
          ohlc_and_Volume_15min_addition(900, 25);
          update_all_chart("Nifty Bank", ohlc, Volume);
        } else if ($("#finnifty_btn").hasClass("gb_active") && x == 1 && y == 1) {
          compare = 0;
          counter_for_Nifty_15min = 0;
          counter_for_Nifty_3min = 0;

          call_Candlestick_API("NIFTY FIN SERVICE");
          call_Volume_API("NIFTY FIN SERVICE", Nifty_exp_2);
          call_Dial_API("NIFTY FIN SERVICE", Nifty_exp_2, Expiry_data[1][1]);
          calculation_for_Exp_1(Volume_data);
          ohlc_and_Volume(Candle_data);
          ohlc_and_Volume_15min(Candle_data);
          ohlc_and_Volume_15min_addition(900, 25);
          update_all_chart("Nifty Fin Service", ohlc, Volume);
        } else if ($("#finnifty_btn").hasClass("gb_active") && x == 0 && y == 1) {
          compare = 0;
          counter_for_Nifty_15min = 0;
          counter_for_Nifty_3min = 0;

          call_Candlestick_API("NIFTY FIN SERVICE");
          call_Volume_API("NIFTY FIN SERVICE", Nifty_exp_1);
          call_Dial_API("NIFTY FIN SERVICE", Nifty_exp_1, Expiry_data[0][1]);
          calculation_for_Exp_1(Volume_data);
          ohlc_and_Volume(Candle_data);
          ohlc_and_Volume_15min(Candle_data);
          ohlc_and_Volume_15min_addition(900, 25);
          update_all_chart("Nifty Fin Service", ohlc, Volume);
        } else if ($("#midcap_btn").hasClass("gb_active") && x == 1 && y == 1) {
          compare = 0;
          counter_for_Nifty_15min = 0;
          counter_for_Nifty_3min = 0;

          call_Candlestick_API("NIFTY MID SELECT");
          call_Volume_API("NIFTY MID SELECT", Nifty_exp_2);
          call_Dial_API("NIFTY MID SELECT", Nifty_exp_2, Expiry_data[1][1]);
          calculation_for_Exp_1(Volume_data);
          ohlc_and_Volume(Candle_data);
          ohlc_and_Volume_15min(Candle_data);
          ohlc_and_Volume_15min_addition(900, 25);
          update_all_chart("Nifty Midcap", ohlc, Volume);
        } else if ($("#midcap_btn").hasClass("gb_active") && x == 0 && y == 1) {
          compare = 0;
          counter_for_Nifty_15min = 0;
          counter_for_Nifty_3min = 0;

          call_Candlestick_API("NIFTY MID SELECT");
          call_Volume_API("NIFTY MID SELECT", Nifty_exp_1);
          call_Dial_API("NIFTY MID SELECT", Nifty_exp_1, Expiry_data[0][1]);
          calculation_for_Exp_1(Volume_data);
          ohlc_and_Volume(Candle_data);
          ohlc_and_Volume_15min(Candle_data);
          ohlc_and_Volume_15min_addition(900, 25);
          update_all_chart("Nifty Midcap", ohlc, Volume);
        } else if ($("#sensex_btn").hasClass("gb_active") && x == 1 && y == 1) {
          compare = 0;
          counter_for_Nifty_15min = 0;
          counter_for_Nifty_3min = 0;

          call_Candlestick_API("SENSEX");
          call_Volume_API("SENSEX", Nifty_exp_2);
          call_Dial_API("SENSEX", Nifty_exp_2, Expiry_data[1][1]);
          calculation_for_Exp_1(Volume_data);
          ohlc_and_Volume(Candle_data);
          ohlc_and_Volume_15min(Candle_data);
          ohlc_and_Volume_15min_addition(900, 25);
          update_all_chart("Sensex", ohlc, Volume);
        } else if ($("#sensex_btn").hasClass("gb_active") && x == 0 && y == 1) {
          compare = 0;
          counter_for_Nifty_15min = 0;
          counter_for_Nifty_3min = 0;

          call_Candlestick_API("SENSEX");
          call_Volume_API("SENSEX", Nifty_exp_1);
          call_Dial_API("SENSEX", Nifty_exp_1, Expiry_data[0][1]);
          calculation_for_Exp_1(Volume_data);
          ohlc_and_Volume(Candle_data);
          ohlc_and_Volume_15min(Candle_data);
          ohlc_and_Volume_15min_addition(900, 25);
          update_all_chart("Sensex", ohlc, Volume);
        } else if ($("#nifty_btn").hasClass("gb_active") && x == 1 && y == 2) {
          compare = 0;
          counter_for_Nifty_15min = 0;
          counter_for_Nifty_3min = 0;
          counter_for_Nifty_30min = 0;

          call_Candlestick_API("NIFTY 50");
          call_Volume_API("NIFTY 50", Nifty_exp_2);
          call_Dial_API("NIFTY 50", Nifty_exp_2, Expiry_data[1][1]);
          calculation_for_Exp_1(Volume_data);
          ohlc_and_Volume(Candle_data);
          ohlc_and_Volume_30min();
          ohlc_and_Volume_15min_addition(1800, 13);
          update_all_chart("Nifty 50", ohlc, Volume);
        } else if ($("#nifty_btn").hasClass("gb_active") && x == 0 && y == 2) {
          compare = 0;
          counter_for_Nifty_15min = 0;
          counter_for_Nifty_3min = 0;
          counter_for_Nifty_30min = 0;

          call_Candlestick_API("NIFTY 50");
          call_Volume_API("NIFTY 50", Nifty_exp_1);
          call_Dial_API("NIFTY 50", Nifty_exp_1, Expiry_data[0][1]);
          calculation_for_Exp_1(Volume_data);
          ohlc_and_Volume(Candle_data);
          ohlc_and_Volume_30min();
          ohlc_and_Volume_15min_addition(1800, 13);
          update_all_chart("Nifty 50", ohlc, Volume);
        } else if ($("#bnknifty_btn").hasClass("gb_active") && x == 1 && y == 2) {
          compare = 0;
          counter_for_Nifty_15min = 0;
          counter_for_Nifty_3min = 0;
          counter_for_Nifty_30min = 0;

          call_Candlestick_API("NIFTY BANK");
          call_Volume_API("NIFTY BANK", Nifty_exp_2);
          call_Dial_API("NIFTY BANK", Nifty_exp_2, Expiry_data[1][1]);
          calculation_for_Exp_1(Volume_data);
          ohlc_and_Volume(Candle_data);
          ohlc_and_Volume_30min();
          ohlc_and_Volume_15min_addition(1800, 13);
          update_all_chart("Nifty Bank", ohlc, Volume);
        } else if ($("#bnknifty_btn").hasClass("gb_active") && x == 0 && y == 2) {
          compare = 0;
          counter_for_Nifty_15min = 0;
          counter_for_Nifty_3min = 0;
          counter_for_Nifty_30min = 0;

          call_Candlestick_API("NIFTY BANK");
          call_Volume_API("NIFTY BANK", Nifty_exp_1);
          call_Dial_API("NIFTY BANK", Nifty_exp_1, Expiry_data[0][1]);
          calculation_for_Exp_1(Volume_data);
          ohlc_and_Volume(Candle_data);
          ohlc_and_Volume_30min();
          ohlc_and_Volume_15min_addition(1800, 13);
          update_all_chart("Nifty Bank", ohlc, Volume);
        } else if ($("#finnifty_btn").hasClass("gb_active") && x == 1 && y == 2) {
          compare = 0;
          counter_for_Nifty_15min = 0;
          counter_for_Nifty_3min = 0;
          counter_for_Nifty_30min = 0;

          call_Candlestick_API("NIFTY FIN SERVICE");
          call_Volume_API("NIFTY FIN SERVICE", Nifty_exp_2);
          call_Dial_API("NIFTY FIN SERVICE", Nifty_exp_2, Expiry_data[1][1]);
          calculation_for_Exp_1(Volume_data);
          ohlc_and_Volume(Candle_data);
          ohlc_and_Volume_30min();
          ohlc_and_Volume_15min_addition(1800, 13);
          update_all_chart("Nifty Fin Service", ohlc, Volume);
        } else if ($("#finnifty_btn").hasClass("gb_active") && x == 0 && y == 2) {
          compare = 0;
          counter_for_Nifty_15min = 0;
          counter_for_Nifty_3min = 0;
          counter_for_Nifty_30min = 0;

          call_Candlestick_API("NIFTY FIN SERVICE");
          call_Volume_API("NIFTY FIN SERVICE", Nifty_exp_1);
          call_Dial_API("NIFTY FIN SERVICE", Nifty_exp_1, Expiry_data[0][1]);
          calculation_for_Exp_1(Volume_data);
          ohlc_and_Volume(Candle_data);
          ohlc_and_Volume_30min();
          ohlc_and_Volume_15min_addition(1800, 13);
          update_all_chart("Nifty Fin Service", ohlc, Volume);
        } else if ($("#midcap_btn").hasClass("gb_active") && x == 1 && y == 2) {
          compare = 0;
          counter_for_Nifty_15min = 0;
          counter_for_Nifty_3min = 0;
          counter_for_Nifty_30min = 0;

          call_Candlestick_API("NIFTY MID SELECT");
          call_Volume_API("NIFTY MID SELECT", Nifty_exp_2);
          call_Dial_API("NIFTY MID SELECT", Nifty_exp_2, Expiry_data[1][1]);
          calculation_for_Exp_1(Volume_data);
          ohlc_and_Volume(Candle_data);
          ohlc_and_Volume_30min();
          ohlc_and_Volume_15min_addition(1800, 13);
          update_all_chart("Nifty Midcap", ohlc, Volume);
        } else if ($("#midcap_btn").hasClass("gb_active") && x == 0 && y == 2) {
          compare = 0;
          counter_for_Nifty_15min = 0;
          counter_for_Nifty_3min = 0;
          counter_for_Nifty_30min = 0;

          call_Candlestick_API("NIFTY MID SELECT");
          call_Volume_API("NIFTY MID SELECT", Nifty_exp_1);
          call_Dial_API("NIFTY MID SELECT", Nifty_exp_1, Expiry_data[0][1]);
          calculation_for_Exp_1(Volume_data);
          ohlc_and_Volume(Candle_data);
          ohlc_and_Volume_30min();
          ohlc_and_Volume_15min_addition(1800, 13);
          update_all_chart("Nifty Midcap", ohlc, Volume);
        } else if ($("#sensex_btn").hasClass("gb_active") && x == 1 && y == 2) {
          compare = 0;
          counter_for_Nifty_15min = 0;
          counter_for_Nifty_3min = 0;
          counter_for_Nifty_30min = 0;

          call_Candlestick_API("SENSEX");
          call_Volume_API("SENSEX", Nifty_exp_2);
          call_Dial_API("SENSEX", Nifty_exp_2, Expiry_data[1][1]);
          calculation_for_Exp_1(Volume_data);
          ohlc_and_Volume(Candle_data);
          ohlc_and_Volume_30min();
          ohlc_and_Volume_15min_addition(1800, 13);
          update_all_chart("Sensex", ohlc, Volume);
        } else if ($("#sensex_btn").hasClass("gb_active") && x == 0 && y == 2) {
          compare = 0;
          counter_for_Nifty_15min = 0;
          counter_for_Nifty_3min = 0;
          counter_for_Nifty_30min = 0;

          call_Candlestick_API("SENSEX");
          call_Volume_API("SENSEX", Nifty_exp_1);
          call_Dial_API("SENSEX", Nifty_exp_1, Expiry_data[0][1]);
          calculation_for_Exp_1(Volume_data);
          ohlc_and_Volume(Candle_data);
          ohlc_and_Volume_30min();
          ohlc_and_Volume_15min_addition(1800, 13);
          update_all_chart("Sensex", ohlc, Volume);
        }
      }, 180000);

      setInterval(function () {
        if ($("#nifty_btn").hasClass("gb_active")) {
          call_Heat_Map_API("Nifty50");
          chart_2.updateSeries([
            {
              data: HeatMap,
            },
          ]);
        } else if ($("#bnknifty_btn").hasClass("gb_active")) {
          call_Heat_Map_API("BNF");
          chart_2.updateSeries([
            {
              data: HeatMap,
            },
          ]);
        } else if ($("#finnifty_btn").hasClass("gb_active")) {
          call_Heat_Map_API("FINNIFTY");
          chart_2.updateSeries([
            {
              data: HeatMap,
            },
          ]);
        } else if ($("#midcap_btn").hasClass("gb_active")) {
          call_Heat_Map_API("MIDCAP");
          chart_2.updateSeries([
            {
              data: HeatMap,
            },
          ]);
        } else if ($("#sensex_btn").hasClass("gb_active")) {
          call_Heat_Map_API("SENSEX");
          chart_2.updateSeries([
            {
              data: HeatMap,
            },
          ]);
        }
      }, 60000);

    } else if (page_access[4]['mf'] == 0) {

      $('.blur-background').removeClass('d-none')
      $('.lock-icon').removeClass('d-none')

      var jsonData;

      fetch("json/table.json").then(response => response.json()).then(data => {
        jsonData = data;
        print_data()
      });

      function print_data() {

        a = $("#Candlestick_container").height();
        b = $("#Top_Bar").height();
        c = $("#Dials_Rows").height();
        d = a - (c + $(".money_flux").height());
        e = a - (c + $(".money_flux").height()) + 150;
        f = $(document).width();

        // split the data set into ohlc and volume (20 December 2022)
        ohlc = JSON.parse(jsonData.moneyflux_ohlc)

        // Volume = JSON.parse(jsonData.moneyflux_volume)
        Volume = jsonData.moneyflux_volume

        for (var i = 0; i < Volume.length; i++) {
          Volume[i]['x'] = ohlc[i][0]
        }

        HeatMap = jsonData.moneyflux_heatmap

        // create the chart
        highchart = Highcharts.stockChart("chart", {
          rangeSelector: {
            enabled: false,
          },
          navigator: {
            enabled: false,
          },
          scrollbar: {
            enabled: false,
          },
          legend: {
            itemStyle: {
              color: "#000000",
              fontWeight: "bold",
            },
          },
          plotOptions: {
            candlestick: {
              color: "red",
              upColor: "green",
            },
            Volume: {
              color: "red",
              upColor: "green",
            },
          },
          chart: {
            backgroundColor: "#1c1c1c",
            zooming: {
              mouseWheel: false,
            },
          },

          toolbar: {
            enabled: false,
          },
          yAxis: [
            {
              labels: {
                formatter: function () {
                  return "";
                },
              },
              top: "8%",
              height: "52%",
              lineWidth: 0,
              gridLineWidth: 0,
              resize: {
                enabled: true,
              },
            },
            {
              labels: {
                formatter: function () {
                  return "";
                },
              },
              top: "65%",
              height: "35%",
              offset: 0,
              lineWidth: 0,
              gridLineWidth: 0,
            },
          ],
          tooltip: {
            split: true,
            formatter: function () {
              tooltipArray = "";
              return tooltipArray;
            },
          },
          xAxis: {
            type: "datetime",
            labels: {
              formatter: function () {
                return moment.unix(this.value).format("h:mm a");
              },
              style: {
                color: "#ffffff", // Set the x-axis labels color to white
              },
            },
            lineColor: "#ffffff",
          },
          series: [
            {
              type: "candlestick",
              name: "AAPL",
              data: ohlc,
              dataGrouping: {
                enabled: false,
              },
            },
            {
              type: "column",
              name: "Volume",
              data: Volume,
              yAxis: 1,
              dataGrouping: {
                enabled: false,
              },
            },
          ],
        });

        // Apexchart Bar [Bottom Right Chart]
        var options = {
          series: [
            {
              data: HeatMap,
            },
          ],
          legend: {
            show: false,
          },
          chart: {
            height: d,
            type: "treemap",
            events: {
              dataPointSelection: (event, chartContext, dataPointIndex) => {
                let temp = dataPointIndex["dataPointIndex"];
                let HeatMap_name =
                  dataPointIndex["w"]["globals"]["categoryLabels"][temp];

                tw_charts(HeatMap_name);
              },
            },
            toolbar: {
              show: false,
            },
          },
          dataLabels: {
            enabled: true,
            style: {
              fontSize: "12px",
            },
            formatter: function (text, op) {
              return [text, op.value];
            },
          },
          plotOptions: {
            treemap: {
              enableShades: true,
              shadeIntensity: 0.5,
              reverseNegativeShade: true,
              useFillColorAsStroke: true,
              colorScale: {
                ranges: [
                  {
                    from: -25,
                    to: 0,
                    color: "#ff6c6c",
                  },
                  {
                    from: 0.001,
                    to: 25,
                    color: "#42b142",
                  },
                ],
              },
            },
          },
          responsive: [
            {
              breakpoint: 768,
              options: {
                chart: {
                  height: e,
                  type: "treemap",
                  toolbar: {
                    show: false,
                  },
                },
              },
            },
          ],
        };

        chart_2 = new ApexCharts(document.querySelector("#chart_2"), options);
        chart_2.render();
      }
    }
  } else if (page_access[2] == 1) {
    var jsonData;

    fetch("json/table.json").then(response => response.json()).then(data => {
      jsonData = data;
      print_data()
    });

    function print_data() {

      a = $("#Candlestick_container").height();
      b = $("#Top_Bar").height();
      c = $("#Dials_Rows").height();
      d = a - (c + $(".money_flux").height());
      e = a - (c + $(".money_flux").height()) + 150;
      f = $(document).width();

      // split the data set into ohlc and volume (20 December 2022)
      ohlc = JSON.parse(jsonData.moneyflux_ohlc)

      // Volume = JSON.parse(jsonData.moneyflux_volume)
      Volume = jsonData.moneyflux_volume

      for (var i = 0; i < Volume.length; i++) {
        Volume[i]['x'] = ohlc[i][0]
      }

      HeatMap = jsonData.moneyflux_heatmap

      // create the chart
      highchart = Highcharts.stockChart("chart", {
        rangeSelector: {
          enabled: false,
        },
        navigator: {
          enabled: false,
        },
        scrollbar: {
          enabled: false,
        },
        legend: {
          itemStyle: {
            color: "#000000",
            fontWeight: "bold",
          },
        },
        plotOptions: {
          candlestick: {
            color: "red",
            upColor: "green",
          },
          Volume: {
            color: "red",
            upColor: "green",
          },
        },
        chart: {
          backgroundColor: "#1c1c1c",
          zooming: {
            mouseWheel: false,
          },
        },

        toolbar: {
          enabled: false,
        },
        yAxis: [
          {
            labels: {
              formatter: function () {
                return "";
              },
            },
            top: "8%",
            height: "52%",
            lineWidth: 0,
            gridLineWidth: 0,
            resize: {
              enabled: true,
            },
          },
          {
            labels: {
              formatter: function () {
                return "";
              },
            },
            top: "65%",
            height: "35%",
            offset: 0,
            lineWidth: 0,
            gridLineWidth: 0,
          },
        ],
        tooltip: {
          split: true,
          formatter: function () {
            tooltipArray = "";
            return tooltipArray;
          },
        },
        xAxis: {
          type: "datetime",
          labels: {
            formatter: function () {
              return moment.unix(this.value).format("h:mm a");
            },
            style: {
              color: "#ffffff", // Set the x-axis labels color to white
            },
          },
          lineColor: "#ffffff",
        },
        series: [
          {
            type: "candlestick",
            name: "AAPL",
            data: ohlc,
            dataGrouping: {
              enabled: false,
            },
          },
          {
            type: "column",
            name: "Volume",
            data: Volume,
            yAxis: 1,
            dataGrouping: {
              enabled: false,
            },
          },
        ],
      });

      // Apexchart Bar [Bottom Right Chart]
      var options = {
        series: [
          {
            data: HeatMap,
          },
        ],
        legend: {
          show: false,
        },
        chart: {
          height: d,
          type: "treemap",
          events: {
            dataPointSelection: (event, chartContext, dataPointIndex) => {
              let temp = dataPointIndex["dataPointIndex"];
              let HeatMap_name =
                dataPointIndex["w"]["globals"]["categoryLabels"][temp];

              tw_charts(HeatMap_name);
            },
          },
          toolbar: {
            show: false,
          },
        },
        dataLabels: {
          enabled: true,
          style: {
            fontSize: "12px",
          },
          formatter: function (text, op) {
            return [text, op.value];
          },
        },
        plotOptions: {
          treemap: {
            enableShades: true,
            shadeIntensity: 0.5,
            reverseNegativeShade: true,
            useFillColorAsStroke: true,
            colorScale: {
              ranges: [
                {
                  from: -25,
                  to: 0,
                  color: "#ff6c6c",
                },
                {
                  from: 0.001,
                  to: 25,
                  color: "#42b142",
                },
              ],
            },
          },
        },
        responsive: [
          {
            breakpoint: 768,
            options: {
              chart: {
                height: e,
                type: "treemap",
                toolbar: {
                  show: false,
                },
              },
            },
          },
        ],
      };

      chart_2 = new ApexCharts(document.querySelector("#chart_2"), options);
      chart_2.render();
    }
  }

  // Screen Sizing
  if ($(window).width() < 1500 && $(window).width() > 530) {
    $(".speedometerWrapper-G5piCoZi")
      .removeClass("G5piCoZi")
      .addClass("small-G5piCoZi");
  } else if ($(window).width() < 510 && $(window).width() > 370) {
    $(".speedometerWrapper-G5piCoZi")
      .removeClass("small-G5piCoZi")
      .addClass("G5piCoZi");
  } else if ($(window).width() < 370) {
    $(".speedometerWrapper-G5piCoZi")
      .removeClass("G5piCoZi")
      .addClass("small-G5piCoZi");
  }

  if ($(window).width() > 1500) {
    $(".speedometerWrapper-G5piCoZi")
      .removeClass("small-G5piCoZi")
      .addClass("G5piCoZi");
  } else if ($(window).width() > 510 && $(window).width() < 1500) {
    $(".speedometerWrapper-G5piCoZi")
      .removeClass("G5piCoZi")
      .addClass("small-G5piCoZi");
  }

  $(window).resize(function () {
    if ($(window).width() < 1500 && $(window).width() > 530) {
      $(".speedometerWrapper-G5piCoZi")
        .removeClass("G5piCoZi")
        .addClass("small-G5piCoZi");
    } else if ($(window).width() < 510 && $(window).width() > 370) {
      $(".speedometerWrapper-G5piCoZi")
        .removeClass("small-G5piCoZi")
        .addClass("G5piCoZi");
    } else if ($(window).width() < 370) {
      $(".speedometerWrapper-G5piCoZi")
        .removeClass("G5piCoZi")
        .addClass("small-G5piCoZi");
    }

    if ($(window).width() > 1500) {
      $(".speedometerWrapper-G5piCoZi")
        .removeClass("small-G5piCoZi")
        .addClass("G5piCoZi");
    } else if ($(window).width() > 510 && $(window).width() < 1500) {
      $(".speedometerWrapper-G5piCoZi")
        .removeClass("G5piCoZi")
        .addClass("small-G5piCoZi");
    }
  });
});