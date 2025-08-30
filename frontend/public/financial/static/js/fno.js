'use strict';

let HeatMap = [];
let SectorList = [];
let SectorToSymbols = {};
let chartFno;

// Option analytics globals
let Expiry_data = [];
let Nifty_exp_1 = '';
let Nifty_exp_2 = '';
let Live_OI_data = {};
let Index_OI_Change_data = 0;
let Index_OI_final_Change_data = [];
let x_axis_categories = [];
let x_axis_categories_OI_Compass = [];
let CE_array = [], PE_array = [];
let CE_array_OI_Compass = [], PE_array_OI_Compass = [];
let Change_CE_OI = 0, Change_PE_OI = 0;
let ts1 = 0, ts2 = 0;
let c_chart, chart1, chart2, bar_chart;

// Backend API wrapper for F&O endpoints - Updated for Unified API
const FnoAPI = {
  // Updated to use unified endpoints
  heatmap: () => {
    return fetch(window.buildApiUrl('/api/fno/heatmap'), { 
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
      }
    })
      .then(r => { 
        if (!r.ok) throw new Error(`HTTP ${r.status}: ${r.statusText}`);
        return r.json(); 
      })
      .catch((err) => {
        console.warn('Heatmap API error:', err);
        return { data: [], ts: null };
      });
  },
  
  // Updated endpoints for unified API
  getExpiry: (script) => {
    return $.post(window.buildApiUrl('/api/fno/get_running_expiry'), { script });
  },
  
  liveOI: (script, exp) => {
    return $.post(window.buildApiUrl('/api/fno/live_oi'), { script, exp });
  },
  
  oiChange: (ts1, ts2, script, exp) => {
    return $.post(window.buildApiUrl('/api/fno/index_analysis'), { ts1, ts2, script, exp });
  },
  
  // New unified endpoints for FNO signals
  getBullishSignals: () => {
    return fetch(window.buildApiUrl('/api/fno/signals/bullish'), {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
      }
    })
      .then(r => r.ok ? r.json() : Promise.reject(`HTTP ${r.status}`))
      .catch(() => ({ status: 'error', data: [] }));
  },
  
  getBearishSignals: () => {
    return fetch(window.buildApiUrl('/api/fno/signals/bearish'), {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
      }
    })
      .then(r => r.ok ? r.json() : Promise.reject(`HTTP ${r.status}`))
      .catch(() => ({ status: 'error', data: [] }));
  }
};

// Enhanced F&O data processing with unified param format
function call_FNO_HeatMap_API() {
  return FnoAPI.heatmap().then((res) => {
    const rows = res && res.data ? res.data : [];
    
    // Process unified param format: Symbol, param_0 (LTP), param_1 (prev_close), param_2 (% change), param_3 (R-Factor), param_4 (DateTime)
    HeatMap = rows
      .filter((r) => typeof r.param_2 === 'number' && r.Symbol) // Use param_2 for % change
      .map((r) => ({ 
        symbol: r.Symbol, 
        sector: r.sector || 'Others', 
        value: r.param_2, // % change for heatmap coloring
        ltp: r.param_0,   // Current price
        prevClose: r.param_1, // Previous close
        rFactor: r.param_3,   // R-Factor/momentum
        timestamp: r.param_4  // DateTime
      }));

    // Build sector lists
    SectorToSymbols = {};
    SectorList = [];
    HeatMap.forEach((row) => {
      if (!SectorToSymbols[row.sector]) {
        SectorToSymbols[row.sector] = [];
        SectorList.push(row.sector);
      }
      SectorToSymbols[row.sector].push(row);
    });

    // Sort sectors alphabetically, keep 'Others' last
    SectorList = SectorList.sort((a, b) => {
      if (a === 'Others') return 1;
      if (b === 'Others') return -1;
      return a.localeCompare(b);
    });

    const ts = res && res.ts ? res.ts : null;
    if (ts) {
      $('#lastUpdated').text(`Last Updated: ${moment.unix(ts).utcOffset('+5:30').format('DD MMM, HH:mm')}`);
    }

    // Populate stocks dropdown from current sector
    populateStockFilter($('#SectorFilter').val() || 'ALL');

    return HeatMap;
  }).catch((err) => {
    logger && logger.error ? logger.error(err) : console.error(err);
    HeatMap = [];
    SectorList = [];
    SectorToSymbols = {};
    return [];
  });
}

// ============================
// UX helpers
// ============================
function ensureNoticeContainer() {
  if (!document.getElementById('fno_notice')) {
    const el = document.createElement('div');
    el.id = 'fno_notice';
    el.className = 'alert alert-warning mt-2';
    el.style.display = 'none';
    const host = document.querySelector('#fno_heatmap')?.parentElement || document.body;
    host.prepend(el);
  }
}

function showNotice(msg) {
  ensureNoticeContainer();
  const el = document.getElementById('fno_notice');
  el.textContent = msg;
  el.style.display = 'block';
}

function hideNotice() {
  const el = document.getElementById('fno_notice');
  if (el) el.style.display = 'none';
}

function handleAjaxError(err) {
  if (err && (err.status === 501 || err.statusCode === 501)) {
    showNotice('F&O live feed not yet connected. Data will appear once the provider is wired.');
  } else {
    try { logger.error(err); } catch (_) { console.error(err); }
  }
}

    // Populate stocks dropdown from current sector
    populateStockFilter($('#SectorFilter').val() || 'ALL');

    return HeatMap;
  }).catch((err) => {
    logger && logger.error ? logger.error(err) : console.error(err);
    HeatMap = [];
    SectorList = [];
    SectorToSymbols = {};
    return [];
  });
}

function populateSectorFilter() {
  const $sel = $('#SectorFilter');
  $sel.empty();
  $sel.append(`<option value="ALL">All Sectors</option>`);
  SectorList.forEach((s) => $sel.append(`<option value="${s}">${s}</option>`));
}

function populateStockFilter(selectedSector) {
  const $stock = $('#StockFilter');
  $stock.empty();
  const items = selectedSector === 'ALL' ? HeatMap : (SectorToSymbols[selectedSector] || []);
  // Unique symbols
  const syms = [...new Set(items.map(it => it.symbol))].sort();
  syms.forEach(sym => $stock.append(`<option value="${sym}">${sym}</option>`));
}

function getSeriesForSector(selected) {
  const data = selected === 'ALL' ? HeatMap : (SectorToSymbols[selected] || []);
  // Apex treemap expects: [{x: label, y: value}, ...]
  return [{
    data: data.map((r) => ({ x: r.symbol, y: r.value }))
  }];
}

function renderHeatmap(selected = 'ALL') {
  const options = {
    chart: { type: 'treemap', height: '75vh', background: 'transparent', toolbar: { show: false } },
    series: getSeriesForSector(selected),
    theme: { mode: 'dark' },
    dataLabels: {
      enabled: true,
      style: { fontSize: '12px' },
      formatter: function (text, op) { return [text, op.value]; }
    },
    plotOptions: {
      treemap: {
        enableShades: true,
        shadeIntensity: 0.5,
        reverseNegativeShade: true,
        useFillColorAsStroke: true,
        colorScale: {
          ranges: [
            { from: -25, to: 0, color: '#ff6c6c' },
            { from: 0.001, to: 25, color: '#42b142' }
          ]
        }
      }
    }
  };

  if (chartFno) { chartFno.destroy(); }
  chartFno = new ApexCharts(document.querySelector('#fno_heatmap'), options);
  chartFno.render();
}

// ============================
// Options analytics API calls
// ============================

// Expiry API (reusing index analysis endpoint; expects script: symbol)
const call_Expiry_API = (script) => {
  try {
    hideNotice();
    return FnoAPI.getExpiry(script).then((data) => { Expiry_data = data; }).then(() => {
      if (Expiry_data && Expiry_data.length >= 2) {
        const x = moment.unix(Expiry_data[0][0]).utcOffset('+5:30').format("MMM-DD");
        const y = moment.unix(Expiry_data[1][0]).utcOffset('+5:30').format("MMM-DD");
        $("#1st_dropdown_value").attr("value", x).text(x);
        $("#2nd_dropdown_value").attr("value", y).text(y);
        Nifty_exp_1 = moment.unix(Expiry_data[0][0]).utcOffset('+5:30').format("DDMMMYY");
        Nifty_exp_2 = moment.unix(Expiry_data[1][0]).utcOffset('+5:30').format("DDMMMYY");
      }
      return [Expiry_data, Nifty_exp_1, Nifty_exp_2];
    }).catch(handleAjaxError);
  } catch (error) { logger.error(error); }
};

// LIVE OI API
const call_LIVE_OI_API = (script, exp) => {
  try {
    hideNotice();
    return FnoAPI.liveOI(script, exp).then((data) => { Live_OI_data = data; }).then(() => {
      ts2 = Object.keys(Live_OI_data)[0];
      return [Live_OI_data, ts2];
    }).catch(handleAjaxError);
  } catch (error) { logger.error(error); }
};

// Initialize ts1 at 09:15 same day based on ts2's date
const timestamp_1 = () => {
  ts2 = Object.keys(Live_OI_data)[0];
  const dt = moment.unix(parseFloat(ts2)).utcOffset('+5:30');
  const dateTime = moment().utcOffset('+5:30');
  dateTime.set({ year: dt.year(), month: dt.month(), date: dt.date(), hour: 9, minute: 15, second: 0, millisecond: 0 });
  ts1 = parseFloat(dateTime.unix()).toFixed(1);
};

// OI change API (for compass and Change PE/CE)
const call_INDEX_OI_CHANGE_API = (ts1_v, ts2_v, script, exp) => {
  try {
    hideNotice();
    return FnoAPI.oiChange(ts1_v, ts2_v, script, exp).then((data) => { Index_OI_Change_data = data; }).catch((err) => { handleAjaxError(err); Index_OI_Change_data = 0; });
  } catch (error) { logger.error(error); Index_OI_Change_data = 0; }
};

// ============================
// Options analytics calculations
// ============================

const FNO_Open_Interest_Tracker = () => {
  if (!Live_OI_data || !Object.keys(Live_OI_data).length) return;
  const array = Object.keys(Object.values(Live_OI_data)[0]);
  const processedArray = array.slice(0, array.length - 1);
  const newArray = $.map(processedArray, function (element) { return element.slice(0, -2); });
  const uniqueArray = $.unique(newArray);
  x_axis_categories = uniqueArray;

  const Dict = Object.values(Live_OI_data)[0];
  CE_array = []; PE_array = [];
  $.each(Dict, function (key, value) {
    if (key.indexOf("CE") !== -1) { CE_array.push(parseInt(value)); }
    else if (key.indexOf("PE") !== -1) { PE_array.push(parseInt(value)); }
  });

  const CE_OI_total = CE_array.reduce((a, b) => a + b, 0);
  const PE_OI_total = PE_array.reduce((a, b) => a + b, 0);
  $('.total_ce').text(CE_OI_total.toLocaleString());
  $('.total_pe').text(PE_OI_total.toLocaleString());
  $('.pcr_net').text(`${(PE_OI_total / CE_OI_total).toFixed(2)}`);

  renderColumnChart();
};

const OI_Compass = () => {
  if (Index_OI_Change_data == 0 || Index_OI_Change_data == "Err Ts") return;
  if (Object.keys(Index_OI_Change_data).length <= 1) return;
  const array_2 = Object.values(Index_OI_Change_data);
  const commonKeys = array_2.reduce((keys, obj) => Object.keys(obj).filter(key => keys.includes(key)), Object.keys(array_2[0]));
  Index_OI_final_Change_data = array_2.map((obj) => { const inter = {}; commonKeys.forEach(k => { if (k in obj) inter[k] = obj[k]; }); return inter; });

  const array = Object.keys(Object.values(Index_OI_final_Change_data)[0]);
  const processedArray = array.slice(0, array.length - 1);
  const newArray = $.map(processedArray, (element) => element.slice(0, -2));
  x_axis_categories_OI_Compass = $.unique(newArray).reverse();

  const array_1 = Object.values(Index_OI_final_Change_data);
  const Diff_Result = {};
  for (let key in array_1[0]) { if (array_1[0].hasOwnProperty(key) && array_1[1].hasOwnProperty(key)) { Diff_Result[key] = array_1[1][key] - array_1[0][key]; } }

  CE_array_OI_Compass = []; PE_array_OI_Compass = [];
  $.each(Diff_Result, function (key, value) {
    if (key.indexOf("CE") !== -1) { CE_array_OI_Compass.push(parseInt(value)); }
    else if (key.indexOf("PE") !== -1) { PE_array_OI_Compass.push(parseInt(value)); }
  });
  CE_array_OI_Compass = CE_array_OI_Compass.reverse();
  PE_array_OI_Compass = PE_array_OI_Compass.reverse();

  renderGroupedBar();
};

const Changes_in_Put_Call = () => {
  if (!Index_OI_final_Change_data || Index_OI_final_Change_data.length < 2) return;
  const array = Object.values(Index_OI_final_Change_data);
  let ts1_CE_Total = 0, ts2_CE_Total = 0, ts1_PE_Total = 0, ts2_PE_Total = 0;
  for (let key in array[0]) { if (key.endsWith('CE')) ts1_CE_Total += array[0][key]; if (key.endsWith('PE')) ts1_PE_Total += array[0][key]; }
  for (let key in array[1]) { if (key.endsWith('CE')) ts2_CE_Total += array[1][key]; if (key.endsWith('PE')) ts2_PE_Total += array[1][key]; }
  Change_CE_OI = parseInt(ts2_CE_Total - ts1_CE_Total);
  Change_PE_OI = parseInt(ts2_PE_Total - ts1_PE_Total);
  $('.chg_ce').text(Change_CE_OI.toLocaleString());
  $('.chg_pe').text(Change_PE_OI.toLocaleString());
  renderDonuts();
};

// ============================
// Charts
// ============================

function renderColumnChart() {
  const options = {
    chart: { type: 'bar', height: 480, background: 'transparent', toolbar: { show: false } },
    series: [ { name: 'CE', data: CE_array }, { name: 'PE', data: PE_array } ],
    xaxis: { categories: x_axis_categories, labels: { show: true } },
    theme: { mode: 'dark' },
    plotOptions: { bar: { horizontal: false } },
    dataLabels: { enabled: false },
    legend: { labels: { colors: '#cfd3dc' } }
  };
  if (c_chart) c_chart.destroy();
  c_chart = new ApexCharts(document.querySelector('#column_chart'), options);
  c_chart.render();
}

function renderDonuts() {
  const donut_bar = {
    chart: { type: 'bar', height: 220, stacked: true, toolbar: { show: false }, background: 'transparent' },
    series: [ { name: 'Change PE OI', data: [Math.max(Change_PE_OI, 0)] }, { name: 'Change CE OI', data: [Math.max(Change_CE_OI, 0)] } ],
    xaxis: { categories: ['Change'] },
    plotOptions: { bar: { horizontal: true } },
    dataLabels: { enabled: false },
    theme: { mode: 'dark' }
  };
  if (chart1) chart1.destroy();
  chart1 = new ApexCharts(document.querySelector('#donutchart'), donut_bar);
  chart1.render();

  const options1 = {
    chart: { type: 'donut', width: 220, height: 220, background: 'transparent' },
    series: [$('.total_pe').text() ? parseInt($('.total_pe').text().replace(/,/g,'')) : 0, $('.total_ce').text() ? parseInt($('.total_ce').text().replace(/,/g,'')) : 0],
    labels: ['Total PE OI','Total CE OI'],
    theme: { mode: 'dark' },
    legend: { show: false }
  };
  if (chart2) chart2.destroy();
  chart2 = new ApexCharts(document.querySelector('#donutchart1'), options1);
  chart2.render();
}

function renderGroupedBar() {
  const options = {
    chart: { type: 'bar', height: 420, background: 'transparent', toolbar: { show: false } },
    series: [ { name: 'CE ΔOI', data: CE_array_OI_Compass }, { name: 'PE ΔOI', data: PE_array_OI_Compass } ],
    xaxis: { categories: x_axis_categories_OI_Compass },
    plotOptions: { bar: { horizontal: true } },
    dataLabels: { enabled: false },
    theme: { mode: 'dark' },
    legend: { labels: { colors: '#cfd3dc' } }
  };
  if (bar_chart) bar_chart.destroy();
  bar_chart = new ApexCharts(document.querySelector('#grouped_barchart'), options);
  bar_chart.render();
}

// ============================
// Actions
// ============================

function fetch_fno_data() {
  const script = ($('#StockFilter').val() || '').trim();
  if (!script) return;
  const expIdx = $("#Expiry").prop("selectedIndex");
  const exp = expIdx === 1 ? Nifty_exp_2 : Nifty_exp_1;

  // First pull Live OI to get the trading day date context
  call_LIVE_OI_API(script, exp).then(() => {
    // Read range slider times (milliseconds)
    const irs = $(".js-range-slider").data("ionRangeSlider");
    if (!irs || !irs.result) { timestamp_1(); }
    const fromMs = irs && irs.result ? irs.result.from : moment().valueOf();
    let toMs = irs && irs.result ? irs.result.to : moment().valueOf();
    // Snap to 3-min grid
    const toMin = parseInt(moment(toMs).format("mm"), 10) % 3;
    toMs = moment(toMs).subtract(toMin, "minutes").valueOf();
    const from_t = moment(fromMs).unix();
    const to_t = moment(toMs).unix();

    // Build ts1, ts2 on the same date as live OI's ts2
    const liveTs = Object.keys(Live_OI_data)[0];
    const liveDateStr = moment.unix(parseFloat(liveTs)).format('DD-MM-YYYY');
    const y1 = moment.unix(parseFloat(from_t)).format('HH:mm') + ':00:000';
    const y2 = moment.unix(parseFloat(to_t)).format('HH:mm') + ':00:000';
    const datetime_1 = moment(liveDateStr + ' ' + y1, 'DD-MM-YYYY HH:mm:ss:SSS');
    const datetime_2 = moment(liveDateStr + ' ' + y2, 'DD-MM-YYYY HH:mm:ss:SSS');
    ts1 = parseFloat(moment(datetime_1).unix()).toFixed(1);
    ts2 = parseFloat(moment(datetime_2).unix()).toFixed(1);

    return call_INDEX_OI_CHANGE_API(ts1, ts2, script, exp);
  }).then(() => {
    FNO_Open_Interest_Tracker();
    OI_Compass();
    Changes_in_Put_Call();
    // Update last updated label
    try { $("#lastUpdated").text(moment().format('HH:mm:ss')); } catch (e) {}
  });
}

$(document).ready(function () {
  // Access control similar to other pages
  try {
    let td_full = username(cookieValue_1);
    if (td_full[1] == 0) {
      if (td_full[3] == 1) { $('#check_access_button').hide(); }
      else { $('#check_access_button').show(); }
    } else if (td_full[1] == 1) { $('#check_access_button').hide(); }
  } catch (e) { /* ignore */ }

  // Load initial data and render
  call_FNO_HeatMap_API().then(() => {
    populateSectorFilter();
    populateStockFilter($('#SectorFilter').val() || 'ALL');
    renderHeatmap('ALL');
  });

  // Initialize time range slider (09:15 to now, 3-min step)
  try {
    const start = moment().utcOffset('+5:30').set({ hour: 9, minute: 15, second: 0, millisecond: 0 }).valueOf();
    const now = moment().utcOffset('+5:30').valueOf();
    $(".js-range-slider").ionRangeSlider({
      skin: "round",
      type: "double",
      min: start,
      max: now,
      from: start,
      to: now,
      step: 60 * 1000, // 1 minute in ms
      grid: true,
      drag_interval: true,
      prettify: function (num) { return moment(num).format("HH:mm"); }
    }).data("ionRangeSlider");
  } catch (e) { /* ignore slider init errors */ }

  // Filter change
  $('#SectorFilter').on('change', function () {
    const val = $(this).val();
    renderHeatmap(val);
    populateStockFilter(val || 'ALL');
  });

  // Expiry for selected stock (when stock changes)
  $('#StockFilter').on('change', function () {
    const sym = $(this).val();
    if (sym) { call_Expiry_API(sym); }
  });

  // When expiry dropdown changes, fetch full F&O dataset and update charts
  $('#Expiry').on('change', function () {
    fetch_fno_data();
  });

  // Refresh handler if a refresh button exists
  $('#refresh_fno').on('click', function () {
    fetch_fno_data();
  });

  // Auto-refresh heatmap periodically (3 min)
  setInterval(() => {
    call_FNO_HeatMap_API().then(() => {
      const current = $('#SectorFilter').val() || 'ALL';
      populateSectorFilter();
      $('#SectorFilter').val(current);
      populateStockFilter(current);
      renderHeatmap(current);
    });
  }, 180000);

  // Initialize F&O signals if tables exist
  if ($('#bullishTable').length || $('#bearishTable').length) {
    loadFNOSignalsData();
    // Auto-refresh signals every 5 minutes
    setInterval(loadFNOSignalsData, 300000);
  }
});

// ============================
// Enhanced F&O Signals Integration
// ============================

// Function to load F&O signals data
async function loadFNOSignalsData() {
  try {
    // Update last updated time
    const now = new Date();
    $('#last-updated').text(`Last updated: ${now.toLocaleTimeString()}`);

    // Load bullish and bearish signals in parallel
    const [bullishData, bearishData] = await Promise.all([
      FnoAPI.getBullishSignals(),
      FnoAPI.getBearishSignals()
    ]);

    if (bullishData.status === 'success') {
      updateSignalsTable('bullishTable', bullishData.data);
      
      // Update market sentiment if available
      if (bullishData.sentiment) {
        updateSentiment(bullishData.sentiment);
      }
    }

    if (bearishData.status === 'success') {
      updateSignalsTable('bearishTable', bearishData.data);
    }

  } catch (error) {
    console.error('Error loading F&O signals data:', error);
    showError('Error loading F&O signals data. Please try again later.');
  }
}

// Function to update signals table with unified param data
function updateSignalsTable(tableId, data) {
  const table = $(`#${tableId}`).DataTable();
  
  if (!table) {
    console.warn(`Table ${tableId} not found`);
    return;
  }
  
  // Clear existing data
  table.clear();
  
  // Add new data with unified param structure
  data.forEach(item => {
    table.row.add([
      item.Symbol || item.symbol,     // Symbol
      item.param_0 || item.ltp,       // LTP (param_0)
      item.param_1 || item.prevClose, // Previous Close (param_1)
      `${(item.param_2 || 0).toFixed(2)}%`, // % Change (param_2)
      item.param_3 || item.rFactor || 0,    // R-Factor/Score (param_3)
      item.param_4 || item.timestamp || new Date().toLocaleString() // DateTime (param_4)
    ]);
  });
  
  // Redraw the table
  table.draw();
}

// Function to update market sentiment
function updateSentiment(sentiment) {
  if (sentiment && sentiment.overall) {
    $('#market-sentiment').text(sentiment.overall);
    $('#market-sentiment').removeClass('text-success text-danger text-warning')
      .addClass(sentiment.overall === 'Bullish' ? 'text-success' : 
               sentiment.overall === 'Bearish' ? 'text-danger' : 'text-warning');
  }
}

// Function to show error messages
function showError(message) {
  const errorDiv = $('#error-message');
  if (errorDiv.length) {
    errorDiv.text(message).show();
    setTimeout(() => errorDiv.hide(), 5000);
  } else {
    console.error(message);
  }
}
