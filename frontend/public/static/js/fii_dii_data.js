/**
 * FII DII Data Component
 * Uses the unified parameter system with paramUtils and fiiDiiUtils
 */

// Import utilities
import { processFiiDiiResponse, formatFiiDiiData, getValueClass } from '../../../../utils/fiiDiiUtils';

// Route for API endpoint
const route = '/fii-dii/fetch_fii_dii_data';

// Global variables
let datatable = null;
let FII_DII_data = [];
let xAxis = [];
let highchart = null;

// -------------------------- Datatable ------------------------

$.fn.dataTable.ext.errMode = 'none';

/**
 * Fetch FII/DII data from the server
 */
const fetch_data = () => {
    $.ajax({
        method: 'POST',
        url: scanner_root + route,
        success: function (response) {
            try {
                // Process the response to ensure consistent format
                const processedData = processFiiDiiResponse(response);
                
                // Update xAxis for charts
                xAxis = processedData.map(item => {
                    const timestamp = getParamValue(item, 'timestamp');
                    return timestamp ? new Date(timestamp).getTime() : null;
                }).filter(Boolean);
                
                // Initialize or update DataTable
                if (!datatable) {
                    initializeDataTable(processedData);
                } else {
                    updateDataTable(processedData);
                }
                
                // Store the raw data for charts
                FII_DII_data = processedData;
                
                // Update charts
                updateCharts();
                
            } catch (error) {
                console.error('Error processing FII/DII data:', error);
            }
        },
        error: function (xhr, status, error) {
            console.error('Error fetching FII/DII data:', error);
        }
    });
};

/**
 * Initialize the DataTable with FII/DII data
 * @param {Array} data - The FII/DII data to display
 */
const initializeDataTable = (data) => {
    datatable = $("#fii_dii_datatable").DataTable({
        data: data,
        columns: [
            { 
                data: null,
                title: 'Date',
                render: (data) => data.Symbol || formatDate(getParamValue(data, 'timestamp'))
            },
            { 
                data: null,
                title: 'FII Buy',
                render: (data) => formatParamValue(getParamValue(data, 'fii_buy'), { format: 'number', decimals: 2 })
            },
            { 
                data: null,
                title: 'FII Sell',
                render: (data) => formatParamValue(getParamValue(data, 'fii_sell'), { format: 'number', decimals: 2 })
            },
            { 
                data: null,
                title: 'FII Net',
                render: (data) => {
                    const value = getParamValue(data, 'fii_net');
                    const cls = getValueClass(value);
                    return `<span class="${cls}">${formatParamValue(value, { format: 'number', decimals: 2 })}</span>`;
                }
            },
            { 
                data: null,
                title: 'Total Net',
                render: (data) => {
                    const value = getParamValue(data, 'total_net');
                    const cls = getValueClass(value);
                    return `<div class="total-net ${cls}">${formatParamValue(value, { format: 'number', decimals: 2 })}</div>`;
                }
            },
            { 
                data: null,
                title: 'DII Net',
                render: (data) => {
                    const value = getParamValue(data, 'dii_net');
                    const cls = getValueClass(value);
                    return `<span class="${cls}">${formatParamValue(value, { format: 'number', decimals: 2 })}</span>`;
                }
            },
            { 
                data: null,
                title: 'DII Buy',
                render: (data) => formatParamValue(getParamValue(data, 'dii_buy'), { format: 'number', decimals: 2 })
            },
            { 
                data: null,
                title: 'DII Sell',
                render: (data) => formatParamValue(getParamValue(data, 'dii_sell'), { format: 'number', decimals: 2 })
            }
        ],
        columnDefs: [
            { targets: '_all', className: 'dt-body-center' },
            { targets: 4, className: 'dt-body-center total-net-cell' }
        ],
        autoWidth: false,
        paging: false,
        info: false,
        ordering: false,
        scrollX: true,
        pageLength: 50,
        createdRow: (row, data) => {
            // Add any row-level styling here if needed
        }
    });
};

/**
 * Update the DataTable with new data
 * @param {Array} data - The updated FII/DII data
 */
const updateDataTable = (data) => {
    if (datatable) {
        datatable.clear();
        datatable.rows.add(data);
        datatable.draw();
    }
};

// -------------------------- Chart Functions ------------------------

/**
 * Update charts with the latest data
 */
const updateCharts = () => {
    if (FII_DII_data.length === 0) return;
    
    // Prepare series data for charts
    const fiiNetSeries = FII_DII_data.map(item => ({
        x: new Date(getParamValue(item, 'timestamp')).getTime(),
        y: parseFloat(getParamValue(item, 'fii_net') || 0),
        color: getParamValue(item, 'fii_net') >= 0 ? '#00d3c0' : '#ff5253'
    }));
    
    const diiNetSeries = FII_DII_data.map(item => ({
        x: new Date(getParamValue(item, 'timestamp')).getTime(),
        y: parseFloat(getParamValue(item, 'dii_net') || 0),
        color: getParamValue(item, 'dii_net') >= 0 ? '#00d3c0' : '#ff5253'
    }));
    
    const totalNetSeries = FII_DII_data.map(item => ({
        x: new Date(getParamValue(item, 'timestamp')).getTime(),
        y: parseFloat(getParamValue(item, 'total_net') || 0),
        color: getParamValue(item, 'total_net') >= 0 ? '#308f86' : '#ff5253'
    }));
    
    // Update or initialize charts here
    if (!highchart) {
        highchart = Highcharts.stockChart("fii_dii_chart", {
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
            },
            chart: {
                backgroundColor: "#1c1c1c",
                zooming: {
                    mouseWheel: false,
                },
                height: 750,
                timezone: 'Asia/Kolkata',
            },

            toolbar: {
                enabled: false,
            },
            yAxis: [
                {
                    top: "3%",
                    height: "30%",
                    lineWidth: 0,
                    gridLineWidth: 0,
                    resize: {
                        enabled: true,
                    },
                    labels: {
                        enabled: false
                    }
                },
                {
                    top: "33.33%",
                    height: "30%",
                    offset: 0,
                    lineWidth: 0,
                    gridLineWidth: 0,
                    labels: {
                        enabled: false
                    }
                },
                {
                    top: "66.67%",
                    height: "30%",
                    offset: 0,
                    lineWidth: 0,
                    gridLineWidth: 0,
                    labels: {
                        enabled: false
                    }
                }
            ],
            tooltip: {
                xDateFormat: '%d-%m-%Y',
                split: true,
            },
            xAxis: {
                type: "datetime",
                labels: {
                    formatter: function () {
                        // return moment.unix(this.value).format("DD-MM-YYYY");
                        return Highcharts.dateFormat('%d-%m-%Y', this.value);
                    },
                    style: {
                        color: "#ffffff", // Set the x-axis labels color to white
                    },
                },
                lineColor: "#ffffff",
            },
            series: [
                {
                    type: "column",
                    name: "FII + DII Net",
                    data: totalNetSeries,
                    dataGrouping: {
                        enabled: false,
                    },
                    pointWidth: 15
                }, {
                    type: "column",
                    name: "FII Net Value",
                    data: fiiNetSeries,
                    yAxis: 1,
                    dataGrouping: {
                        enabled: false,
                    },
                    pointWidth: 15
                }, {
                    type: "column",
                    name: "DII Net Value",
                    data: diiNetSeries,
                    yAxis: 2,
                    dataGrouping: {
                        enabled: false,
                    },
                    pointWidth: 15
                },
            ],
        });
    } else {
        highchart.update({
            series: [
                {
                    type: "column",
                    name: "FII + DII Net",
                    data: totalNetSeries,
                    dataGrouping: {
                        enabled: false,
                    },
                    pointWidth: 15
                }, {
                    type: "column",
                    name: "FII Net Value",
                    data: fiiNetSeries,
                    yAxis: 1,
                    dataGrouping: {
                        enabled: false,
                    },
                    pointWidth: 15
                }, {
                    type: "column",
                    name: "DII Net Value",
                    data: diiNetSeries,
                    yAxis: 2,
                    dataGrouping: {
                        enabled: false,
                    },
                    pointWidth: 15
                },
            ],
        });
    }
};

// -------------------------- Initialization ------------------------

$(document).ready(function () {
    // Initialize the component
    fetch_data();
    
    // Set up refresh interval (e.g., every 5 minutes)
    setInterval(fetch_data, 5 * 60 * 1000);
    
    // Initialize any tooltips or other UI elements
    $('[data-toggle="tooltip"]').tooltip();
});

// -------------------------- Utility Functions ------------------------

/**
 * Format a date string
 * @param {string|number} date - The date to format
 * @returns {string} Formatted date string
 */
const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit'
    });
};

$(window).resize(function () {
    $('.dataTables_scrollHeadInner').attr('style', 'box-sizing: content-box; padding-right: 0px;')

    if($(window).width() >= 576) {
        $('#add_br').html('Capital Market Activity (in Cr.) <a class="live live-2"><i class="fa-solid fa-circle fa-sm"></i>&nbsp;ACTIVE</a>')
    } else if($(window).width() < 576){
        $('#add_br').html('Capital Market Activity <br> (in Cr.) <a class="live live-2"><i class="fa-solid fa-circle fa-sm"></i>&nbsp;ACTIVE</a>')
    }
})