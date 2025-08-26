/**
 * Scanner.js - Unified Param System Implementation
 * 
 * This file has been updated to use the unified param format:
 * - Symbol: Stock/Index identifier
 * - param_0: Last Trading Price (LTP)
 * - param_1: Previous Close Price (not used in scanner data)
 * - param_2: Volume (HD) / Avg Delivery % (DSP)
 * - param_3: Avg Delivery % (HD) / Increase in Delivery (DSP)
 * - param_4: DateTime (YYYY-MM-DD HH:mm:ss)
 * 
 * Legacy array format is automatically converted to param format for consistency.
 */

route = '/calcApi2'

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
        $.post(scanner_root + route + default_url, function (data, status) {
            logger.info(status)
            DS_data = JSON.parse(JSON.stringify(data));
            if (scan_value == '_hd_data_') {
                $('#scanner_datatable').removeClass('dataTableSc dataTableSc_dsp').addClass('dataTableSc')
                // Convert array data to unified param format if needed
                if (DS_data.length > 0 && Array.isArray(DS_data[0])) {
                    DS_data = DS_data.map(row => ({
                        Symbol: row[0],
                        param_0: parseFloat(row[1]) || 0, // LTP
                        param_1: 0, // Previous Close (not available in scanner)
                        param_2: parseFloat(row[2]) || 0, // Volume as param_2
                        param_3: parseFloat(row[5]) || 0, // Avg delivery percentage as param_3
                        param_4: moment.unix(row[4]).format('YYYY-MM-DD HH:mm:ss'), // DateTime
                        delivery_percentage: parseFloat(row[3]) || 0 // Keep for progress bar
                    }));
                }
                // Update timestamp display
                if (DS_data.length > 0) {
                    let displayTime = DS_data[0].param_4 ? 
                        moment(DS_data[0].param_4).format('ddd MMM DD, YYYY') : 
                        moment().format('ddd MMM DD, YYYY');
                    $('#updated_date').text(`${displayTime} IST`);
                }
            } else if (scan_value == '_dsp_data_') {
                $('#scanner_datatable').removeClass('dataTableSc dataTableSc_dsp').addClass('dataTableSc_dsp')
                // Convert array data to unified param format if needed
                if (DS_data.length > 0 && Array.isArray(DS_data[0])) {
                    DS_data = DS_data.map(row => ({
                        Symbol: row[0],
                        param_0: parseFloat(row[1]) || 0, // LTP
                        param_1: 0, // Previous Close (not available in scanner)
                        param_2: parseFloat(row[5]).toFixed(2) || '0.00', // Avg delivery percentage as param_2
                        param_3: parseFloat(row[3]) || 0, // Increase in delivery as param_3
                        param_4: moment.unix(row[4]).format('YYYY-MM-DD HH:mm:ss'), // DateTime
                        delivery_percentage: parseFloat(row[2]) || 0 // Keep for progress bar
                    }));
                }
                // Update timestamp display
                if (DS_data.length > 0) {
                    let displayTime = DS_data[0].param_4 ? 
                        moment(DS_data[0].param_4).format('ddd MMM DD, YYYY') : 
                        moment().format('ddd MMM DD, YYYY');
                    $('#updated_date').text(`${displayTime} IST`);
                }
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
                            { data: 'Symbol' },
                            { data: 'param_0' }, // LTP
                            { 
                                data: scan_value == '_hd_data_' ? 'param_2' : 'param_2', // Volume or Avg Del %
                                render: function(data, type, row) {
                                    return scan_value == '_hd_data_' ? data : parseFloat(data).toFixed(2);
                                }
                            },
                            { 
                                data: scan_value == '_hd_data_' ? 'param_3' : null, // Avg Del % or Progress bar
                                render: function(data, type, row) {
                                    if (scan_value == '_hd_data_') {
                                        return parseFloat(data).toFixed(2);
                                    } else {
                                        let del_pct = row.delivery_percentage || 0;
                                        return `${del_pct} <progress max=100 value=${del_pct}>`;
                                    }
                                }
                            },
                            { 
                                data: scan_value == '_hd_data_' ? null : 'param_3', // Progress bar or Increase in Delivery
                                render: function(data, type, row) {
                                    if (scan_value == '_hd_data_') {
                                        let del_pct = row.delivery_percentage || 0;
                                        return `${del_pct} <progress max=100 value=${del_pct}>`;
                                    } else {
                                        return data;
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
        }).fail(function (response) {
            logger.error("Error: " + response);
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

    counter_for_datatable = 0
    default_url = "/fetch_hd_data_fno"
    scan_value = "_hd_data_"

    API_call_for_HD_FnO = false
    API_call_for_HD_Nifty500 = false
    API_call_for_DS_FnO = false
    API_call_for_DS_Nifty500 = false

    call_Post_API = false

    API_call()

    $("#scanner_datatable_ip").keyup(function () {
        $('#scanner_datatable').dataTable().fnFilter(this.value);
    });

})