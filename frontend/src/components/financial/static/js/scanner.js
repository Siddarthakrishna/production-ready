/**
 * Scanner.js - Unified Parameter System Implementation
 * 
 * This file implements the delivery scanner using the global parameter system:
 * - Symbol: Stock/Index identifier
 * - param_0: Last Trading Price (LTP)
 * - param_1: Previous Close Price (calculated/mocked)
 * - param_2: Volume (HD) / Avg Delivery % (DSP)
 * - param_3: Avg Delivery % (HD) / Increase in Delivery (DSP)
 * - param_4: DateTime (YYYY-MM-DD HH:mm:ss)
 * 
 * Uses modern unified API endpoints with proper parameter format.
 */

// Import parameter utilities if available
if (typeof window.paramUtils !== 'undefined') {
    const { getParamValue, formatPercentage, formatVolume } = window.paramUtils;
}

// -------------------------- Datatable ------------------------

$.fn.dataTable.ext.errMode = 'none';

const API_call = () => {

    if (default_url == "/fetch_hd_data_fno") {
        if (!API_call_for_HD_FnO) {
            API_call_for_HD_FnO = true
            call_Post_API = true
        }
    } else if (default_url == "/fetch_hd_data_n500") {
        if (!API_call_for_HD_Nifty500) {
            API_call_for_HD_Nifty500 = true
            call_Post_API = true
        }
    } else if (default_url == "/fetch_dsp_data_fno") {
        if (!API_call_for_DS_FnO) {
            API_call_for_DS_FnO = true
            call_Post_API = true
        }
    } else if (default_url == "/fetch_dsp_data_n500") {
        if (!API_call_for_DS_Nifty500) {
            API_call_for_DS_Nifty500 = true
            call_Post_API = true
        }
    }

    if (call_Post_API) {
        // Use modern unified API endpoints instead of legacy /calcApi2
        $.post(window.API_BASE + default_url, function (data, status) {
            console.log('API call status:', status);
            
            // Data should already be in parameter format from backend
            DS_data = Array.isArray(data) ? data : [];
            
            // Validate parameter format and add missing fields if needed
            DS_data = DS_data.map(item => {
                // If it's already in parameter format, use as-is
                if (item.Symbol && typeof item.param_0 !== 'undefined') {
                    return {
                        ...item,
                        // Ensure param_1 exists (previous close, calculated as param_0 * 0.99 if missing)
                        param_1: item.param_1 || (item.param_0 * 0.99),
                        // Ensure param_4 has proper timestamp format
                        param_4: item.param_4 || moment().format('YYYY-MM-DD HH:mm:ss')
                    };
                }
                // Legacy fallback: if data comes in array format, convert it
                else if (Array.isArray(item)) {
                    return {
                        Symbol: item[0] || 'UNKNOWN',
                        param_0: parseFloat(item[1]) || 0, // LTP
                        param_1: parseFloat(item[1]) * 0.99 || 0, // Previous Close (calculated)
                        param_2: parseFloat(item[2]) || 0, // Volume/Avg Del %
                        param_3: parseFloat(item[3]) || 0, // Avg Del %/Increase
                        param_4: item[4] ? moment.unix(item[4]).format('YYYY-MM-DD HH:mm:ss') : moment().format('YYYY-MM-DD HH:mm:ss')
                    };
                }
                // Unknown format, create minimal structure
                else {
                    return {
                        Symbol: item.Symbol || 'UNKNOWN',
                        param_0: 0,
                        param_1: 0,
                        param_2: 0,
                        param_3: 0,
                        param_4: moment().format('YYYY-MM-DD HH:mm:ss')
                    };
                }
            });
            
            // Update table styling based on scan type
            if (scan_value == '_hd_data_') {
                $('#scanner_datatable').removeClass('dataTableSc dataTableSc_dsp').addClass('dataTableSc');
            } else if (scan_value == '_dsp_data_') {
                $('#scanner_datatable').removeClass('dataTableSc dataTableSc_dsp').addClass('dataTableSc_dsp');
            }
            
            // Update timestamp display
            if (DS_data.length > 0) {
                let displayTime = DS_data[0].param_4 ? 
                    moment(DS_data[0].param_4).format('ddd MMM DD, YYYY') : 
                    moment().format('ddd MMM DD, YYYY');
                $('#updated_date').text(`${displayTime} IST`);
            }

            if (default_url == "/fetch_hd_data_fno") {
                HD_FnO = DS_data
            } else if (default_url == "/fetch_hd_data_n500") {
                HD_Nifty500 = DS_data
            } else if (default_url == "/fetch_dsp_data_fno") {
                DS_FnO = DS_data
            } else if (default_url == "/fetch_dsp_data_n500") {
                DS_Nifty500 = DS_data
            }

            if (DS_data) {
                if (counter_for_datatable == 0) {
                    counter_for_datatable += 1;
                    datatable = $("#scanner_datatable").DataTable({
                        paging: false,
                        pageLength: 50,
                        info: false,
                        scrollX: true,
                        ordering: false,
                        columns: [
                            { 
                                data: 'Symbol',
                                title: 'Name'
                            },
                            { 
                                data: 'param_0',
                                title: 'LTP',
                                render: function(data, type, row) {
                                    return typeof data === 'number' ? data.toFixed(2) : data;
                                }
                            },
                            { 
                                data: 'param_2',
                                title: scan_value == '_hd_data_' ? 'Volume' : 'Avg. Del %',
                                render: function(data, type, row) {
                                    if (scan_value == '_hd_data_') {
                                        // Format volume (param_2 for HD)
                                        return typeof window.paramUtils !== 'undefined' && window.paramUtils.formatVolume 
                                            ? window.paramUtils.formatVolume(data) 
                                            : (typeof data === 'number' ? data.toLocaleString() : data);
                                    } else {
                                        // Format percentage (param_2 for DSP)
                                        return typeof data === 'number' ? data.toFixed(2) + '%' : data;
                                    }
                                }
                            },
                            { 
                                data: 'param_3',
                                title: scan_value == '_hd_data_' ? 'Avg. Del %' : 'Delivery (%)',
                                render: function(data, type, row) {
                                    if (scan_value == '_hd_data_') {
                                        // param_3 is Avg Del % for HD
                                        return typeof data === 'number' ? data.toFixed(2) + '%' : data;
                                    } else {
                                        // param_3 is current delivery % for DSP (with progress bar)
                                        const value = typeof data === 'number' ? data : 0;
                                        return `${value.toFixed(1)}% <progress max="100" value="${value}" style="width: 60px; height: 16px;"></progress>`;
                                    }
                                }
                            },
                            { 
                                data: null,
                                title: scan_value == '_hd_data_' ? 'Delivery (%)' : 'Increase in Delivery (%)',
                                render: function(data, type, row) {
                                    if (scan_value == '_hd_data_') {
                                        // Calculate delivery percentage from param_3 for progress bar
                                        const deliveryPct = row.param_3 || 0;
                                        return `${deliveryPct.toFixed(1)}% <progress max="100" value="${deliveryPct}" style="width: 60px; height: 16px;"></progress>`;
                                    } else {
                                        // For DSP, show increase in delivery (difference calculation)
                                        const increase = Math.max(0, (row.param_3 - row.param_2) || 0);
                                        return typeof increase === 'number' ? increase.toFixed(2) + '%' : '0.00%';
                                    }
                                }
                            }
                        ]
                    });
                }
                datatable.clear();
                datatable.rows.add(DS_data);
                datatable.draw();
            }
        }).fail(function (xhr, status, error) {
            console.error('Scanner API Error:', { status, error, response: xhr.responseText });
            // Show user-friendly error message
            if (xhr.status === 401) {
                alert('Authentication required. Please log in again.');
            } else if (xhr.status === 500) {
                alert('Server error. Please try again later.');
            } else {
                alert('Failed to load scanner data. Please check your connection.');
            }
        });
    } else {
        if (default_url == "/fetch_hd_data_fno") {
            datatable.clear();
            datatable.rows.add(HD_FnO);
            datatable.draw();
        } else if (default_url == "/fetch_hd_data_n500") {
            datatable.clear();
            datatable.rows.add(HD_Nifty500);
            datatable.draw();
        } else if (default_url == "/fetch_dsp_data_fno") {
            datatable.clear();
            datatable.rows.add(DS_FnO);
            datatable.draw();
        } else if (default_url == "/fetch_dsp_data_n500") {
            datatable.clear();
            datatable.rows.add(DS_Nifty500);
            datatable.draw();
        }
    }

    call_Post_API = false
}

$(document).on('click', "input[type='radio']", function () {

    scan_value = $("input[name='market_option']:checked").val()
    segment_value = $("input[name='market_option_1']:checked").val()
    default_url = '/fetch' + scan_value + segment_value;

    if (scan_value == '_hd_data_') {
        $('#3rd_col_heading').text('Volume')
        $('#4th_col_heading').text('Avg. Del %')
        $('#5th_col_heading').text('Delivery (%)')
        if (!$('.dataTables_scrollHeadInner table').hasClass('dataTableSc')) {
            $('.dataTables_scrollHeadInner table').addClass('dataTableSc').removeClass('dataTableSc_dsp')
        }
        if (!$('.dataTables_scrollBody table').hasClass('dataTableSc')) {
            $('.dataTables_scrollBody table').addClass('dataTableSc').removeClass('dataTableSc_dsp')
        }
    } else if (scan_value == '_dsp_data_') {
        $('#3rd_col_heading').text('Avg. Del %')
        $('#4th_col_heading').text('Delivery (%)')
        $('#5th_col_heading').text('Increase in Delivery (%)')
        if (!$('.dataTables_scrollHeadInner table').hasClass('dataTableSc_dsp')) {
            $('.dataTables_scrollHeadInner table').addClass('dataTableSc_dsp').removeClass('dataTableSc')
        }
        if (!$('.dataTables_scrollBody table').hasClass('dataTableSc_dsp')) {
            $('.dataTables_scrollBody table').addClass('dataTableSc_dsp').removeClass('dataTableSc')
        }
    }

    API_call()

    setTimeout(() => {
        if (scan_value == '_dsp_data_') {
            $('#4th_col_heading').removeAttr("style")
        } else if (scan_value == '_hd_data_') {
            $('#5th_col_heading').removeAttr("style")
        }
    }, 30);

})

$(document).ready(function () {

    // Initialize global variables
    counter_for_datatable = 0;
    default_url = "/fetch_hd_data_fno";
    scan_value = "_hd_data_";
    segment_value = "fno";

    // Initialize API call flags
    API_call_for_HD_FnO = false;
    API_call_for_HD_Nifty500 = false;
    API_call_for_DS_FnO = false;
    API_call_for_DS_Nifty500 = false;

    call_Post_API = false;

    // Initialize data storage variables
    HD_FnO = [];
    HD_Nifty500 = [];
    DS_FnO = [];
    DS_Nifty500 = [];
    DS_data = [];
    datatable = null;

    // Initialize logger if not available
    if (typeof console !== 'undefined' && !window.logger) {
        window.logger = {
            info: console.log.bind(console),
            error: console.error.bind(console),
            warn: console.warn.bind(console)
        };
    }

    // Make initial API call
    API_call();

    // Set up search functionality
    $("#scanner_datatable_ip").keyup(function () {
        if (datatable) {
            datatable.search(this.value).draw();
        }
    });

});