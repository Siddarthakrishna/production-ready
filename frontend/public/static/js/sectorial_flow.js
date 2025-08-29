/**
 * Sectorial Flow.js - Unified Param System Implementation
 * 
 * This file uses the unified param format:
 * - Symbol: Stock/Index identifier  
 * - param_0: Last Trading Price (LTP) - used for bar chart Y-axis
 * - param_1: Previous Close Price
 * - param_2: % Change from previous close - used for heatmap coloring
 * - param_3: R-Factor (momentum / relative factor)
 * - param_4: DateTime (YYYY-MM-DD HH:mm:ss)
 * 
 * Bar charts use param_0 for price bars, heatmaps use param_2 for color scale.
 */

route = "/study-data"

// const update_time = () => {
//     $.getJSON(root_1 + '/current?type=servertime', function (response) {
//         response = response.split(":");
//         $('.dtime').html(response[0] + ':' + (response[1]));
//     });
// }

const sectorial_1_barchart_dict = {
    "NIFTY": 1,
    "BANKNIFTY": 1,
    "NIFTYAUTO": 2,
    "NIFTYFINSERVICE": 2,
    "NIFTYFMCG": 3,
    "CNXIT": 3,
    "NIFTYMEDIA": 4,
    "NIFTYMETAL": 4,
    "CNXPHARMA": 5,
    "NIFTYPSUBANK": 5,
    "NIFTYPVTBANK": 6,
    "CNXREALTY": 6,
    "CNXENERGY": 7,
}

const sectorial_1_barchart_dict_mob = {
    "NIFTY": 1,
    "BANKNIFTY": 11,
    "NIFTYAUTO": 2,
    "NIFTYFINSERVICE": 22,
    "NIFTYFMCG": 3,
    "CNXIT": 33,
    "NIFTYMEDIA": 4,
    "NIFTYMETAL": 44,
    "CNXPHARMA": 5,
    "NIFTYPSUBANK": 55,
    "NIFTYPVTBANK": 6,
    "CNXREALTY": 66,
    "CNXENERGY": 7,
}

options5 = {
    bar: { groupWidth: 30, },
    series: [],
    chart: {
        height: 650,
        width: '100%',
        type: 'bar',
        events: {
            dataPointSelection(event, chartContext, config) {
                var selection = chartContext.data.twoDSeriesX[config.dataPointIndex]
                logger.info(chartContext.data.twoDSeriesX[config.dataPointIndex])
                logger.info(sectorial_1_barchart_dict[selection])
                // diffrent for mob and dsk
                var scroll_offset = 100
                if (window.innerWidth > 575) { var temp_id = "table_row_" + sectorial_1_barchart_dict[selection] }
                else {
                    var temp_id = "table_row_" + sectorial_1_barchart_dict[selection]
                    var tab_index = String(sectorial_1_barchart_dict_mob[selection])
                    if (tab_index.length > 1) { logger.info("double hit "); scroll_offset = -800 }
                    else { logger.info("no hit " + tab_index + " len:" + tab_index.length) }
                }
                var element = document.getElementById(temp_id);
                setTimeout(function () {
                    element.scrollIntoView(true);
                }, 500);

                setTimeout(function () {
                    $('html,body').animate({
                        scrollTop: $(window).scrollTop() - scroll_offset
                    });
                }, 1500);

            },
        },
    },
    dataLabels: { enabled: false },
    title: { text: '', },
    noData: { text: 'Loading...' },

    plotOptions: {
        bar: {
            borderRadius: 8,
            opacity: 1,
            colors: {
                ranges: [{ from: -10, to: -0, color: '#FF5253' },
                { from: 10, to: 0, color: '#00D3C0' }],
                backgroundBarColors: ['#FFFFFF'],
                backgroundBarOpacity: 0.02,
            },

            columnWidth: '40%',
        }
    },
    yaxis: {
        title: { text: '', },
        labels: {
            style: {
                colors: '#FFFFFF'
            },
            rotate: -90,
        }
    },
    xaxis: {
        type: 'category',
        tickPlacement: 'on',
        labels: {
            minHeight: 150,
            maxHeight: 150,
            rotate: -90,
            offsetY: 0,
            rotateAlways: true,
            style: { colors: '#FFFFFF' }
        },

    }
};

var chart_sec1 = new ApexCharts(document.querySelector("#sectorial_1_barchart"), options5);
chart_sec1.render();

const getChartData_sec1 = () => {
    dataSet = [];
    $.ajax({
        url: root_1 + route + '/SECTORIAL VIEW',
        type: 'GET',
        dataType: 'json',
        success: function (response) {
            var i = 0;
            $.each(response.data, function (key, value) {
                if (i >= 20) { return false }
                dataSet[i] = { x: value.Symbol, y: value.param_0 };

                i++;
                //dataSet.push([value.Symbol,Math.floor(value.param_0)]);
            });

            chart_sec1.updateSeries([{
                name: '% chg',
                data: dataSet

            }])
        }
    });

}

$.fn.dataTable.ext.errMode = 'none';

// Initialize DataTables for market breadth
let marketBreadthTable;

// Function to update market breadth data
function updateMarketBreadthData() {
    if (dtime_clock() === false) return;
    
    // Show loading state
    const tbody = document.getElementById('market_breadth_tbody');
    if (tbody) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">Loading market data...</td></tr>';
    }
    
    // Fetch NIFTY 500 data
    $.ajax({
        url: root_1 + route + '/NIFTY 500',
        type: 'GET',
        dataType: 'json',
        success: function(response) {
            if (!response || !response.data || !Array.isArray(response.data)) {
                console.error('Invalid response format for NIFTY 500 data');
                if (tbody) {
                    tbody.innerHTML = '<tr><td colspan="4" class="text-center text-danger">Error loading market data</td></tr>';
                }
                return;
            }
            
            // Clear existing data
            if (marketBreadthTable) {
                marketBreadthTable.destroy();
            }
            
            // Prepare table data
            const tableData = response.data.map(item => {
                const pctChange = parseFloat(item.param_2) || 0; // Use param_2 for % change
                let statusClass = 'text-muted';
                if (pctChange > 0) statusClass = 'text-success';
                else if (pctChange < 0) statusClass = 'text-danger';
                
                return [
                    item.Symbol || '-',
                    item.param_0 || '-', // LTP
                    `<span class="${statusClass}">${pctChange.toFixed(2)}%</span>`,
                    pctChange > 0 ? 'Advancing' : pctChange < 0 ? 'Declining' : 'Unchanged'
                ];
            });
            
            // Initialize DataTable
            marketBreadthTable = $('#market_breadth_table').DataTable({
                data: tableData,
                pageLength: 20,
                lengthMenu: [[10, 20, 50, -1], [10, 20, 50, 'All']],
                order: [[2, 'desc']], // Sort by % change by default
                columnDefs: [
                    { targets: 0, width: '30%' },
                    { targets: 1, className: 'text-end', width: '20%' },
                    { targets: 2, className: 'text-end', width: '25%' },
                    { targets: 3, className: 'text-center', width: '25%' }
                ],
                drawCallback: function() {
                    // Add click handler for symbol cells
                    $('td:first-child').css('cursor', 'pointer').on('click', function() {
                        const symbol = $(this).text();
                        if (symbol && symbol !== '-') {
                            tw_charts(symbol);
                        }
                    });
                }
            });
            
            // Add search functionality
            $('#market_breadth_search').on('keyup', function() {
                marketBreadthTable.search(this.value).draw();
            });
            
            // Update summary stats
            const total = tableData.length;
            const advancing = tableData.filter(row => parseFloat(row[2]) > 0).length;
            const declining = tableData.filter(row => parseFloat(row[2]) < 0).length;
            const unchanged = total - advancing - declining;
            
            // Update the header with summary
            const header = $('.heading_font_size', '#table_row_market_breadth');
            if (header.length) {
                header.html(`
                    MARKET BREADTH (NIFTY 500) &nbsp;
                    <span class="text-success">${advancing}↑</span> | 
                    <span class="text-muted">${unchanged}→</span> | 
                    <span class="text-danger">${declining}↓</span>
                    <a class="live"><i class="fa-solid fa-circle fa-sm"></i>&nbsp;ACTIVE</a>
                `);
            }
        },
        error: function(xhr, status, error) {
            console.error('Error fetching market breadth data:', error);
            if (tbody) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="4" class="text-center text-danger">
                            Error loading market data. Please try again later.
                        </td>
                    </tr>`;
            }
        }
    });
}

$(document).ready(function () {

    let page_access = username(cookieValue_1)
    if (page_access[2] == 0) {
        if (page_access[4]['p3'] == 1) {

            $('.dataTableSf tbody').empty();

            check_access();

            // Initialize chart data
            getChartData_sec1();

            // Initialize market breadth data
            if ($('#market_breadth_table').length) {
                updateMarketBreadthData();
                
                // Refresh market breadth data every 30 seconds
                setInterval(updateMarketBreadthData, 30000);
            }
            
            // Initialize Sectorial Heatmap
            if ($('#sectorial_heatmap_container').length && typeof SectorialHeatmap !== 'undefined') {
                try {
                    window.sectorialHeatmap = new SectorialHeatmap('sectorial_heatmap_container', {
                        apiBase: window.DATA_API_BASE || 'http://localhost:8001/api',
                        updateInterval: 30000, // 30 seconds auto-refresh
                        enableDrillDown: true,
                        showTooltips: true
                    });
                    
                    console.log('Sectorial heatmap initialized successfully');
                } catch (error) {
                    console.error('Error initializing sectorial heatmap:', error);
                }
            }

            $('#sectorial_1_nifty50').DataTable({
                "lengthMenu": [[-1], ["All"]],
                "lengthChange": false,
                "bPaginate": false,
                "scrollX": true,
                "bInfo": false,
                "language": {
                    searchPlaceholder: "Search Stock"
                },
                "ajax": {
                    "url": root_1 + route + '/NIFTY 50',
                    "type": "GET",
                    "dataType": 'json',
                },
                columns: [
                    {
                        data: 'Symbol'
                    },
                    {
                        data: 'param_0'
                    },
                    {
                        data: 'param_1'
                    },
                    {
                        data: 'param_2'
                    },
                    {
                        data: 'param_3'
                    },

                ],
                "order": [[4, "desc"]],
                "rowCallback": function (row, data) {

                    let a = $('td:eq(3)', row).html()
                    if (dtime_clock() == false) { $('td:eq(3)', row).css({ "animation-name": "none" }); }
                    if (a < 0) {
                        if (dtime_clock() == true) { $('td:eq(3)', row).css({ "animation-name": "pink-light-bg" }); }
                        $('td:eq(3)', row).css({ "color": "#f5bcb8" });
                        $('td:eq(3)', row).css({ "background-color": "#8f290a" });

                    }
                    //Dhan Api Code
                    $('td:eq(0)', row).css('cursor', 'pointer');
                    $('td:eq(0)', row).off('click').on('click', function () {
                        var symbol = $(this).html();
                        // do something with symbol value
                        logger.info(symbol)
                        tw_charts(symbol)
                    });
                },

            });
            $("#sectorial_1_nifty50_ip").keyup(function () {
                $('#sectorial_1_nifty50').dataTable().fnFilter(this.value);
            });

            $('#sectorial_2_bnknifty').DataTable({
                "lengthMenu": [[-1], ["All"]],
                "lengthChange": false,
                "bPaginate": false,
                "scrollX": true,
                "bInfo": false,
                "autowidth": true,
                "language": {
                    searchPlaceholder: "Search Stock"
                },

                "ajax": {
                    "url": root_1 + route + '/NIFTY BANK',
                    "type": "GET",
                    "dataType": 'json',
                },
                columns: [
                    {
                        data: 'Symbol'
                    },
                    {
                        data: 'param_0'
                    },
                    {
                        data: 'param_1'
                    },
                    {
                        data: 'param_2'
                    },
                    {
                        data: 'param_3'
                    },

                ],
                "order": [[4, "desc"]],
                "rowCallback": function (row, data) {

                    let a = $('td:eq(3)', row).html()
                    if (dtime_clock() == false) { $('td:eq(3)', row).css({ "animation-name": "none" }); }
                    if (a < 0) {
                        if (dtime_clock() == true) { $('td:eq(3)', row).css({ "animation-name": "pink-light-bg" }); }
                        $('td:eq(3)', row).css({ "color": "#f5bcb8" });
                        $('td:eq(3)', row).css({ "background-color": "#8f290a" });
                    }
                    //Dhan Api Code
                    $('td:eq(0)', row).css('cursor', 'pointer');
                    $('td:eq(0)', row).off('click').on('click', function () {
                        var symbol = $(this).html();
                        // do something with symbol value
                        logger.info(symbol)
                        tw_charts(symbol)
                    });
                },

            });
            $("#sectorial_2_bnknifty_ip").keyup(function () {
                $('#sectorial_2_bnknifty').dataTable().fnFilter(this.value);
            });

            $('#sectorial_3_niftyauto').DataTable({
                "lengthMenu": [[-1], ["All"]],
                "lengthChange": false,
                "bPaginate": false,
                "scrollX": true,
                "bInfo": false,
                "language": {
                    searchPlaceholder: "Search Stock"
                },
                "ajax": {
                    "url": root_1 + route + '/NIFTY AUTO',
                    "type": "GET",
                    "dataType": 'json',
                },
                columns: [
                    {
                        data: 'Symbol'
                    },
                    {
                        data: 'param_0'
                    },
                    {
                        data: 'param_1'
                    },
                    {
                        data: 'param_2'
                    },
                    {
                        data: 'param_3'
                    },

                ],
                "order": [[4, "desc"]],
                "rowCallback": function (row, data) {

                    let a = $('td:eq(3)', row).html()
                    if (dtime_clock() == false) { $('td:eq(3)', row).css({ "animation-name": "none" }); }
                    if (a < 0) {
                        if (dtime_clock() == true) { $('td:eq(3)', row).css({ "animation-name": "pink-light-bg" }); }
                        $('td:eq(3)', row).css({ "color": "#f5bcb8" });
                        $('td:eq(3)', row).css({ "background-color": "#8f290a" });
                    }
                    //Dhan Api Code
                    $('td:eq(0)', row).css('cursor', 'pointer');
                    $('td:eq(0)', row).off('click').on('click', function () {
                        var symbol = $(this).html();
                        // do something with symbol value
                        logger.info(symbol)
                        tw_charts(symbol)
                    });
                },

            });
            $("#sectorial_3_niftyauto_ip").keyup(function () {
                $('#sectorial_3_niftyauto').dataTable().fnFilter(this.value);
            });

            $('#sectorial_4_niftyfinserv').DataTable({
                "lengthMenu": [[-1], ["All"]],
                "lengthChange": false,
                "bPaginate": false,
                "scrollX": true,
                "bInfo": false,
                "language": {
                    searchPlaceholder: "Search Stock"
                },
                "ajax": {
                    "url": root_1 + route + '/NIFTY FIN SERV',
                    "type": "GET",
                    "dataType": 'json',
                },
                columns: [
                    {
                        data: 'Symbol'
                    },
                    {
                        data: 'param_0'
                    },
                    {
                        data: 'param_1'
                    },
                    {
                        data: 'param_2'
                    },
                    {
                        data: 'param_3'
                    },

                ],
                "order": [[4, "desc"]],
                "rowCallback": function (row, data) {

                    let a = $('td:eq(3)', row).html()
                    if (dtime_clock() == false) { $('td:eq(3)', row).css({ "animation-name": "none" }); }
                    if (a < 0) {
                        if (dtime_clock() == true) { $('td:eq(3)', row).css({ "animation-name": "pink-light-bg" }); }
                        $('td:eq(3)', row).css({ "color": "#f5bcb8" });
                        $('td:eq(3)', row).css({ "background-color": "#8f290a" });
                    }
                    //Dhan Api Code
                    $('td:eq(0)', row).css('cursor', 'pointer');
                    $('td:eq(0)', row).off('click').on('click', function () {
                        var symbol = $(this).html();
                        // do something with symbol value
                        logger.info(symbol)
                        tw_charts(symbol)
                    });
                },

            });
            $("#sectorial_4_niftyfinserv_ip").keyup(function () {
                $('#sectorial_4_niftyfinserv').dataTable().fnFilter(this.value);
            });

            $('#sectorial_5_niftyfmcg').DataTable({
                "lengthMenu": [[-1], ["All"]],
                "lengthChange": false,
                "bPaginate": false,
                "scrollX": true,
                "bInfo": false,
                "language": {
                    searchPlaceholder: "Search Stock"
                },
                "ajax": {
                    "url": root_1 + route + '/NIFTY FMCG',
                    "type": "GET",
                    "dataType": 'json',
                },

                columns: [
                    {
                        data: 'Symbol'
                    },
                    {
                        data: 'param_0'
                    },
                    {
                        data: 'param_1'
                    },
                    {
                        data: 'param_2'
                    },
                    {
                        data: 'param_3'
                    },

                ],
                "order": [[4, "desc"]],
                "rowCallback": function (row, data) {

                    let a = $('td:eq(3)', row).html()
                    if (dtime_clock() == false) { $('td:eq(3)', row).css({ "animation-name": "none" }); }
                    if (a < 0) {
                        if (dtime_clock() == true) { $('td:eq(3)', row).css({ "animation-name": "pink-light-bg" }); }
                        $('td:eq(3)', row).css({ "color": "#f5bcb8" });
                        $('td:eq(3)', row).css({ "background-color": "#8f290a" });
                    }
                    //Dhan Api Code
                    $('td:eq(0)', row).css('cursor', 'pointer');
                    $('td:eq(0)', row).off('click').on('click', function () {
                        var symbol = $(this).html();
                        // do something with symbol value
                        logger.info(symbol)
                        tw_charts(symbol)
                    });
                },

            });
            $("#sectorial_5_niftyfmcg_ip").keyup(function () {
                $('#sectorial_5_niftyfmcg').dataTable().fnFilter(this.value);
            });

            $('#sectorial_6_niftyit').DataTable({
                "lengthMenu": [[-1], ["All"]],
                "lengthChange": false,
                "bPaginate": false,
                "scrollX": true,
                "bInfo": false,
                "language": {
                    searchPlaceholder: "Search Stock"
                },
                "ajax": {
                    "url": root_1 + route + '/NIFTY IT',
                    "type": "GET",
                    "dataType": 'json',
                },
                columns: [
                    {
                        data: 'Symbol'
                    },
                    {
                        data: 'param_0'
                    },
                    {
                        data: 'param_1'
                    },
                    {
                        data: 'param_2'
                    },
                    {
                        data: 'param_3'
                    },

                ],
                "order": [[4, "desc"]],
                "rowCallback": function (row, data) {

                    let a = $('td:eq(3)', row).html()
                    if (dtime_clock() == false) { $('td:eq(3)', row).css({ "animation-name": "none" }); }
                    if (a < 0) {
                        if (dtime_clock() == true) { $('td:eq(3)', row).css({ "animation-name": "pink-light-bg" }); }
                        $('td:eq(3)', row).css({ "color": "#f5bcb8" });
                        $('td:eq(3)', row).css({ "background-color": "#8f290a" });
                    }
                    //Dhan Api Code
                    $('td:eq(0)', row).css('cursor', 'pointer');
                    $('td:eq(0)', row).off('click').on('click', function () {
                        var symbol = $(this).html();
                        // do something with symbol value
                        logger.info(symbol)
                        tw_charts(symbol)
                    });
                },

            });
            $("#sectorial_6_niftyit_ip").keyup(function () {
                $('#sectorial_6_niftyit').dataTable().fnFilter(this.value);
            });

            $('#sectorial_7_niftymedia').DataTable({
                "lengthMenu": [[-1], ["All"]],
                "lengthChange": false,
                "bPaginate": false,
                "scrollX": true,
                "bInfo": false,
                "language": {
                    searchPlaceholder: "Search Stock"
                },
                "ajax": {
                    "url": root_1 + route + '/NIFTY MEDIA',
                    "type": "GET",
                    "dataType": 'json',
                },
                columns: [
                    {
                        data: 'Symbol'
                    },
                    {
                        data: 'param_0'
                    },
                    {
                        data: 'param_1'
                    },
                    {
                        data: 'param_2'
                    },
                    {
                        data: 'param_3'
                    },

                ],
                "order": [[4, "desc"]],
                "rowCallback": function (row, data) {

                    let a = $('td:eq(3)', row).html()
                    if (dtime_clock() == false) { $('td:eq(3)', row).css({ "animation-name": "none" }); }
                    if (a < 0) {
                        if (dtime_clock() == true) { $('td:eq(3)', row).css({ "animation-name": "pink-light-bg" }); }
                        $('td:eq(3)', row).css({ "color": "#f5bcb8" });
                        $('td:eq(3)', row).css({ "background-color": "#8f290a" });
                    }
                    //Dhan Api Code
                    $('td:eq(0)', row).css('cursor', 'pointer');
                    $('td:eq(0)', row).off('click').on('click', function () {
                        var symbol = $(this).html();
                        // do something with symbol value
                        logger.info(symbol)
                        tw_charts(symbol)
                    });
                },

            });
            $("#sectorial_7_niftymedia_ip").keyup(function () {
                $('#sectorial_7_niftymedia').dataTable().fnFilter(this.value);
            });

            $('#sectorial_8_niftymetal').DataTable({
                "lengthMenu": [[-1], ["All"]],
                "lengthChange": false,
                "bPaginate": false,
                "scrollX": true,
                "bInfo": false,
                "language": {
                    searchPlaceholder: "Search Stock"
                },
                "ajax": {
                    "url": root_1 + route + '/NIFTY METAL',
                    "type": "GET",
                    "dataType": 'json',
                },
                columns: [
                    {
                        data: 'Symbol'
                    },
                    {
                        data: 'param_0'
                    },
                    {
                        data: 'param_1'
                    },
                    {
                        data: 'param_2'
                    },
                    {
                        data: 'param_3'
                    },

                ],
                "order": [[4, "desc"]],
                "rowCallback": function (row, data) {

                    let a = $('td:eq(3)', row).html()
                    if (dtime_clock() == false) { $('td:eq(3)', row).css({ "animation-name": "none" }); }
                    if (a < 0) {
                        if (dtime_clock() == true) { $('td:eq(3)', row).css({ "animation-name": "pink-light-bg" }); }
                        $('td:eq(3)', row).css({ "color": "#f5bcb8" });
                        $('td:eq(3)', row).css({ "background-color": "#8f290a" });
                    }
                    //Dhan Api Code
                    $('td:eq(0)', row).css('cursor', 'pointer');
                    $('td:eq(0)', row).off('click').on('click', function () {
                        var symbol = $(this).html();
                        // do something with symbol value
                        logger.info(symbol)
                        tw_charts(symbol)
                    });
                },

            });
            $("#sectorial_8_niftymetal_ip").keyup(function () {
                $('#sectorial_8_niftymetal').dataTable().fnFilter(this.value);
            });

            $('#sectorial_9_niftypharma').DataTable({
                "lengthMenu": [[-1], ["All"]],
                "lengthChange": false,
                "bPaginate": false,
                "scrollX": true,
                "bInfo": false,
                "language": {
                    searchPlaceholder: "Search Stock"
                },
                "ajax": {
                    "url": root_1 + route + '/NIFTY PHARMA',
                    "type": "GET",
                    "dataType": 'json',
                },
                columns: [
                    {
                        data: 'Symbol'
                    },
                    {
                        data: 'param_0'
                    },
                    {
                        data: 'param_1'
                    },
                    {
                        data: 'param_2'
                    },
                    {
                        data: 'param_3'
                    },

                ],
                "order": [[4, "desc"]],
                "rowCallback": function (row, data) {

                    let a = $('td:eq(3)', row).html()
                    if (dtime_clock() == false) { $('td:eq(3)', row).css({ "animation-name": "none" }); }
                    if (a < 0) {
                        if (dtime_clock() == true) { $('td:eq(3)', row).css({ "animation-name": "pink-light-bg" }); }
                        $('td:eq(3)', row).css({ "color": "#f5bcb8" });
                        $('td:eq(3)', row).css({ "background-color": "#8f290a" });
                    }
                    //Dhan Api Code
                    $('td:eq(0)', row).css('cursor', 'pointer');
                    $('td:eq(0)', row).off('click').on('click', function () {
                        var symbol = $(this).html();
                        // do something with symbol value
                        logger.info(symbol)
                        tw_charts(symbol)
                    });
                },

            });
            $("#sectorial_9_niftypharma_ip").keyup(function () {
                $('#sectorial_9_niftypharma').dataTable().fnFilter(this.value);
            });

            $('#sectorial_10_niftypsubank').DataTable({
                "lengthMenu": [[-1], ["All"]],
                "lengthChange": false,
                "bPaginate": false,
                "scrollX": true,
                "bInfo": false,
                "language": {
                    searchPlaceholder: "Search Stock"
                },
                "ajax": {
                    "url": root_1 + route + '/NIFTY PSU BANK',
                    "type": "GET",
                    "dataType": 'json',
                },
                columns: [
                    {
                        data: 'Symbol'
                    },
                    {
                        data: 'param_0'
                    },
                    {
                        data: 'param_1'
                    },
                    {
                        data: 'param_2'
                    },
                    {
                        data: 'param_3'
                    },

                ],
                "order": [[4, "desc"]],
                "rowCallback": function (row, data) {

                    let a = $('td:eq(3)', row).html()
                    if (dtime_clock() == false) { $('td:eq(3)', row).css({ "animation-name": "none" }); }
                    if (a < 0) {
                        if (dtime_clock() == true) { $('td:eq(3)', row).css({ "animation-name": "pink-light-bg" }); }
                        $('td:eq(3)', row).css({ "color": "#f5bcb8" });
                        $('td:eq(3)', row).css({ "background-color": "#8f290a" });
                    }
                    //Dhan Api Code
                    $('td:eq(0)', row).css('cursor', 'pointer');
                    $('td:eq(0)', row).off('click').on('click', function () {
                        var symbol = $(this).html();
                        // do something with symbol value
                        logger.info(symbol)
                        tw_charts(symbol)
                    });
                },

            });
            $("#sectorial_10_niftypsubank_ip").keyup(function () {
                $('#sectorial_10_niftypsubank').dataTable().fnFilter(this.value);
            });

            $('#sectorial_11_pvtbank').DataTable({
                "lengthMenu": [[-1], ["All"]],
                "lengthChange": false,
                "bPaginate": false,
                "scrollX": true,
                "bInfo": false,
                "language": {
                    searchPlaceholder: "Search Stock"
                },
                "ajax": {
                    "url": root_1 + route + '/NIFTY PVT BANK',
                    "type": "GET",
                    "dataType": 'json',
                },
                columns: [
                    {
                        data: 'Symbol'
                    },
                    {
                        data: 'param_0'
                    },
                    {
                        data: 'param_1'
                    },
                    {
                        data: 'param_2'
                    },
                    {
                        data: 'param_3'
                    },

                ],
                "order": [[4, "desc"]],
                "rowCallback": function (row, data) {

                    let a = $('td:eq(3)', row).html()
                    if (dtime_clock() == false) { $('td:eq(3)', row).css({ "animation-name": "none" }); }
                    if (a < 0) {
                        if (dtime_clock() == true) { $('td:eq(3)', row).css({ "animation-name": "pink-light-bg" }); }
                        $('td:eq(3)', row).css({ "color": "#f5bcb8" });
                        $('td:eq(3)', row).css({ "background-color": "#8f290a" });
                    }
                    //Dhan Api Code
                    $('td:eq(0)', row).css('cursor', 'pointer');
                    $('td:eq(0)', row).off('click').on('click', function () {
                        var symbol = $(this).html();
                        // do something with symbol value
                        logger.info(symbol)
                        tw_charts(symbol)
                    });
                },

            });
            $("#sectorial_11_pvtbank_ip").keyup(function () {
                $('#sectorial_11_pvtbank').dataTable().fnFilter(this.value);
            });

            $('#sectorial_12_reality').DataTable({
                "lengthMenu": [[-1], ["All"]],
                "lengthChange": false,
                "bPaginate": false,
                "scrollX": true,
                "bInfo": false,
                "language": {
                    searchPlaceholder: "Search Stock"
                },
                "ajax": {
                    "url": root_1 + route + '/NIFTY REALITY',
                    "type": "GET",
                    "dataType": 'json',
                },
                columns: [
                    {
                        data: 'Symbol'
                    },
                    {
                        data: 'param_0'
                    },
                    {
                        data: 'param_1'
                    },
                    {
                        data: 'param_2'
                    },
                    {
                        data: 'param_3'
                    },

                ],
                "order": [[4, "desc"]],
                "rowCallback": function (row, data) {

                    let a = $('td:eq(3)', row).html()
                    if (dtime_clock() == false) { $('td:eq(3)', row).css({ "animation-name": "none" }); }
                    if (a < 0) {
                        if (dtime_clock() == true) { $('td:eq(3)', row).css({ "animation-name": "pink-light-bg" }); }
                        $('td:eq(3)', row).css({ "color": "#f5bcb8" });
                        $('td:eq(3)', row).css({ "background-color": "#8f290a" });
                    }
                    //Dhan Api Code
                    $('td:eq(0)', row).css('cursor', 'pointer');
                    $('td:eq(0)', row).off('click').on('click', function () {
                        var symbol = $(this).html();
                        // do something with symbol value
                        logger.info(symbol)
                        tw_charts(symbol)
                    });
                },

            });
            $("#sectorial_12_reality_ip").keyup(function () {
                $('#sectorial_12_reality').dataTable().fnFilter(this.value);
            });

            $('#sectorial_13_energy').DataTable({
                "lengthMenu": [[-1], ["All"]],
                "lengthChange": false,
                "bPaginate": false,
                "scrollX": true,
                "bInfo": false,
                "language": {
                    searchPlaceholder: "Search Stock"
                },
                "ajax": {
                    "url": root_1 + route + '/NIFTY ENERGY',
                    "type": "GET",
                    "dataType": 'json',
                },
                columns: [
                    {
                        data: 'Symbol'
                    },
                    {
                        data: 'param_0'
                    },
                    {
                        data: 'param_1'
                    },
                    {
                        data: 'param_2'
                    },
                    {
                        data: 'param_3'
                    },

                ],
                "order": [[4, "desc"]],
                "rowCallback": function (row, data) {

                    let a = $('td:eq(3)', row).html()
                    if (dtime_clock() == false) { $('td:eq(3)', row).css({ "animation-name": "none" }); }
                    if (a < 0) {
                        if (dtime_clock() == true) { $('td:eq(3)', row).css({ "animation-name": "pink-light-bg" }); }
                        $('td:eq(3)', row).css({ "color": "#f5bcb8" });
                        $('td:eq(3)', row).css({ "background-color": "#8f290a" });
                    }
                    //Dhan Api Code
                    $('td:eq(0)', row).css('cursor', 'pointer');
                    $('td:eq(0)', row).off('click').on('click', function () {
                        var symbol = $(this).html();
                        // do something with symbol value
                        logger.info(symbol)
                        tw_charts(symbol)
                    });
                },

            });
            $("#sectorial_13_energy_ip").keyup(function () {
                $('#sectorial_13_energy').dataTable().fnFilter(this.value);
            });


            setInterval(function () {
                if (dtime_clock() == false) { return }
                $('#sectorial_1_nifty50').DataTable().ajax.reload();
                $('#sectorial_2_bnknifty').DataTable().ajax.reload();
            }, 47000);

            setInterval(function () {
                if (dtime_clock() == false) { return }
                $('#sectorial_3_niftyauto').DataTable().ajax.reload();
                $('#sectorial_4_niftyfinserv').DataTable().ajax.reload();
            }, 49000);

            setInterval(function () {
                if (dtime_clock() == false) { return }
                $('#sectorial_5_niftyfmcg').DataTable().ajax.reload();
                $('#sectorial_6_niftyit').DataTable().ajax.reload();
            }, 51000);

            setInterval(function () {
                if (dtime_clock() == false) { return }
                $('#sectorial_7_niftymedia').DataTable().ajax.reload();
                $('#sectorial_8_niftymetal').DataTable().ajax.reload();
            }, 53000);

            setInterval(function () {
                if (dtime_clock() == false) { return }
                $('#sectorial_9_niftypharma').DataTable().ajax.reload();
                $('#sectorial_10_niftypsubank').DataTable().ajax.reload();
            }, 55000);

            setInterval(function () {
                if (dtime_clock() == false) { return }
                $('#sectorial_11_pvtbank').DataTable().ajax.reload();
                $('#sectorial_12_reality').DataTable().ajax.reload();
            }, 57000);


        } else if (page_access[4]['p3'] == 0) {

            $('.blur-background').removeClass('d-none')
            $('.lock-icon').removeClass('d-none')

            $('.dataTableSf tbody').empty();

            var jsonData;

            fetch("json/table.json")
                .then(response => response.json())
                .then(data => {
                    jsonData = data;
                    populateTableBodies();
                });

            function populateTableBodies() {
                var tableIds = ["sectorial_1_nifty50", "sectorial_2_bnknifty", "sectorial_3_niftyauto", "sectorial_4_niftyfinserv", "sectorial_5_niftyfmcg", "sectorial_6_niftyit", "sectorial_7_niftymedia", "sectorial_8_niftymetal", "sectorial_9_niftypharma", "sectorial_10_niftypsubank", "sectorial_11_pvtbank", "sectorial_12_reality", "sectorial_13_energy"];

                var sectorialFlowData = jsonData.sectorial_flow_table;

                tableIds.forEach(tableId => {
                    var tableBody = document.getElementById(tableId + '_tbody');

                    sectorialFlowData.forEach(item => {
                        var row = document.createElement("tr");

                        for (var key in item) {
                            if (item.hasOwnProperty(key)) {
                                var cell = document.createElement("td");
                                cell.textContent = item[key];
                                row.appendChild(cell);
                            }
                        }

                        tableBody.appendChild(row);
                    });

                    $("#" + tableId).DataTable({
                        "lengthMenu": [[-1], ["All"]],
                        "lengthChange": false,
                        "bPaginate": false,
                        "scrollX": true,
                        "bInfo": false,
                    });
                });

                dataSet = jsonData.sectorial_flow_chart
                chart_sec1.updateSeries([{
                    name: '% chg',
                    data: dataSet
                }])
            }
        }
    } else if (page_access[2] == 1) {
        $('.dataTableSf tbody').empty();

        var jsonData;

        fetch("json/table.json")
            .then(response => response.json())
            .then(data => {
                jsonData = data;
                populateTableBodies();
            });

        function populateTableBodies() {
            var tableIds = ["sectorial_1_nifty50", "sectorial_2_bnknifty", "sectorial_3_niftyauto", "sectorial_4_niftyfinserv", "sectorial_5_niftyfmcg", "sectorial_6_niftyit", "sectorial_7_niftymedia", "sectorial_8_niftymetal", "sectorial_9_niftypharma", "sectorial_10_niftypsubank", "sectorial_11_pvtbank", "sectorial_12_reality", "sectorial_13_energy"];

            var sectorialFlowData = jsonData.sectorial_flow_table;

            tableIds.forEach(tableId => {
                var tableBody = document.getElementById(tableId + '_tbody');

                sectorialFlowData.forEach(item => {
                    var row = document.createElement("tr");

                    for (var key in item) {
                        if (item.hasOwnProperty(key)) {
                            var cell = document.createElement("td");
                            cell.textContent = item[key];
                            row.appendChild(cell);
                        }
                    }

                    tableBody.appendChild(row);
                });

                $("#" + tableId).DataTable({
                    "lengthMenu": [[-1], ["All"]],
                    "lengthChange": false,
                    "bPaginate": false,
                    "scrollX": true,
                    "bInfo": false,
                });
            });

            dataSet = jsonData.sectorial_flow_chart
            chart_sec1.updateSeries([{
                name: '% chg',
                data: dataSet
            }])
        }
    }
});