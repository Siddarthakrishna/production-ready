
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
                for (var i = 0; i < DS_data.length; i++) {
                    // data pre preprocessing
                    let Name = DS_data[i][0];
                    let LTP = DS_data[i][1];
                    let Volume = DS_data[i][2];
                    let Delivery_percentage = DS_data[i][3];
                    let ts = DS_data[i][4];
                    let Avg_delivery_percentage = DS_data[i][5];
                    DS_data[i][0] = Name
                    DS_data[i][1] = LTP;
                    DS_data[i][2] = Volume;
                    DS_data[i][3] = parseFloat(Avg_delivery_percentage).toFixed(2);
                    DS_data[i][4] = `${Delivery_percentage} <progress max=100 value=${Delivery_percentage}>`;

                    $('#updated_date').text(`${moment.unix(ts).format('ddd MMM DD, YYYY')} IST`)
                }
            } else if (scan_value == '_dsp_data_') {
                $('#scanner_datatable').removeClass('dataTableSc dataTableSc_dsp').addClass('dataTableSc_dsp')
                for (var i = 0; i < DS_data.length; i++) {
                    // data pre preprocessing
                    let Name = DS_data[i][0];
                    let LTP = DS_data[i][1];
                    let Delivery_percentage = DS_data[i][2];
                    let Increase_in_Delivery = DS_data[i][3];
                    let ts = DS_data[i][4];
                    let Avg_delivery_percentage = DS_data[i][5];
                    DS_data[i][0] = Name
                    DS_data[i][1] = LTP;
                    DS_data[i][2] = parseFloat(Avg_delivery_percentage).toFixed(2);
                    DS_data[i][3] = `${Delivery_percentage} <progress max=100 value=${Delivery_percentage}>`;
                    DS_data[i][4] = Increase_in_Delivery;

                    $('#updated_date').text(`${moment.unix(ts).format('ddd MMM DD, YYYY')} IST`)
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
                        ordering: false
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