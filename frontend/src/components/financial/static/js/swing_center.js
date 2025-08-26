/**
 * Swing Center.js - Unified Param System Implementation
 * 
 * This file uses the unified param format:
 * - Symbol: Stock/Index identifier
 * - param_0: Advance percentage (swing context) / LTP
 * - param_1: Decline percentage (swing context) / Previous Close
 * - param_2: % Change from previous close - used for heatmap coloring
 * - param_3: Momentum/swing strength - used for swing visualization
 * - param_4: DateTime (YYYY-MM-DD HH:mm:ss)
 * 
 * Swing charts use param_3 for momentum bars, heatmaps use param_2 for color scale.
 */

route_1 = "/study-data"         // PIE DONUT
route_2 = "/adv-dec"            // SEMI CIRCLE
route_3 = "/study-symbol"       // DATA TABLE

// const update_time = () => {
//     $.getJSON(root_1 + '/current?type=servertime', function (response) {
//         response = response.split(":");
//         $('.dtime').html(response[0] + ':' + (response[1]));
//     });
// }


// semichart.js

var options3 = {
    series: [76],
    chart: {
        type: 'radialBar', offsetY: -20, height: 240,
        sparkline: { enabled: true }
    },
    plotOptions: {
        radialBar: {
            startAngle: -90,
            endAngle: 90,
            track: {
                background: '#343260',
                strokeWidth: '90%',
                margin: 5, // margin is in pixels
                dropShadow: {
                    enabled: false,
                    top: 2,
                    left: 0,
                    color: '#fff',
                    opacity: 1,
                    blur: 2
                }
            },
            dataLabels: {
                name: { show: false },
                value: { offsetY: -2, fontSize: '18px', color: '#fff', }
            },
            hollow: {
                margin: 15,
                size: "65%"
            },

        }
    },
    grid: {
        padding: {
            top: 10
        }
    },
    fill: {
        background: '#6c63ff',
    },
    labels: ['Average Results'],
};
nvtupgroupcurrentvalue = '0';
const randomize3 = (dataSet) => {

    i = 0;
    return chart3.w.globals.series.map(function () {

        return dataSet[i++]; //Math.floor(Math.random() * (100 - 1 + 1)) + 1
    })
}
chart3 = new ApexCharts(document.querySelector("#nftadgrouthp"), options3);
chart3.render();

const getpieDount3 = () => {
    dataSet = [];

    $.ajax({
        url: root_1 + route_2 + '/NIFTY',
        method: 'GET',
        dataType: 'json',
        success: function (response) {
            var i = 0;

            if (response.data[0]['param_0'] > 0) {
                $('#nftadgrouthp').html('<div id="progress-bar" class="progress-bar"><div class="left"></div><div class="right"><div class="back"></div></div><div class="barOverflow"><div class="bar"></div></div> <span id="nadgrouthbar">' + response.data[0]['param_0'] + '</span>% <br> Advance Growth</div>');
                $('#nftadgrouthspan').html('<span></span> Advance % Growth from Yest. Close');
                datanftadgrout = true;
                dataSet[0] = response.data[0]['param_0'];

            }
            else if (response.data[0]['param_1'] > 0) {

                dataSet[0] = response.data[0]['param_1'];

                $('#nftadgrouthp').html('<div id="progress-bar" class="progress-bar"><div class="left"></div><div class="right"><div class="back"></div></div><div class="barOverflow"><div class="bar"></div></div> <span id="nadgrouthbar">' + response.data[0]['param_1'] + '</span>% <br> Decline Growth</div>');
                $('#nftadgrouthspan').html('<span></span> Decline % Growth from Yest. Close');
                datanftadgrout = true;
            }
            chart3.updateSeries(randomize3(dataSet))
        },
        error: function (jqXHR, textStatus, errorThrown) {
            logger.error(textStatus + ': ' + errorThrown);
        }
    });
}

var options4 = {
    series: [76],
    chart: {
        type: 'radialBar', offsetY: -20, height: 240,
        sparkline: { enabled: true }
    },
    plotOptions: {
        radialBar: {
            startAngle: -90,
            endAngle: 90,
            track: {
                background: '#343260',
                strokeWidth: '90%',
                margin: 5, // margin is in pixels
                dropShadow: {
                    enabled: false,
                    top: 2,
                    left: 0,
                    color: '#fff',
                    opacity: 1,
                    blur: 2
                }
            },
            dataLabels: {
                name: { show: false },
                value: { offsetY: -2, fontSize: '18px', color: '#fff', }
            },
            hollow: {
                margin: 15,
                size: "65%"
            },

        }
    },
    grid: {
        padding: {
            top: 10
        }
    },
    fill: {
        background: '#6c63ff',
    },
    labels: ['Average Results'],
};
foupgroupcurrentvalue = '0';
const randomize4 = (dataSet) => {


    i = 0;
    return chart4.w.globals.series.map(function () {

        return dataSet[i++]; //Math.floor(Math.random() * (100 - 1 + 1)) + 1
    })
}
chart4 = new ApexCharts(document.querySelector("#fotadgrouthp"), options4);
chart4.render();

const getpieDount4 = () => {
    dataSet = [];

    $.ajax({
        url: root_1 + route_2 + '/FO',
        method: 'GET',
        dataType: 'json',
        success: function (response) {

            var i = 0;
            datafoupgroup = true;
            if (response.data[0]['param_0'] > 0) {
                $('#fotadgrouthp').html('<div id="progress-bar1" class="progress-bar"><div class="left"></div><div class="right"><div class="back"></div></div><div class="barOverflow"><div class="bar"></div></div> <span id="nadgrouthbar">' + response.data[0]['param_0'] + '</span>% <br> Advance Growth</div>');
                datafoupgroup = true;
                foupgroupcurrentvalue = response.data[0]['param_0'];
                $('#fotadgrouthspan').html('<span></span> Advance % Growth from Yest. Close');
                dataSet[0] = response.data[0]['param_0'];

            }
            else if (response.data[0]['param_1'] > 0) {

                dataSet[0] = response.data[0]['param_1'];
                foupgroupcurrentvalue = response.data[0]['param_1'];
                $('#fotadgrouthp').html('<div id="progress-bar1" class="progress-bar"><div class="left"></div><div class="right"><div class="back"></div></div><div class="barOverflow"><div class="bar"></div></div> <span id="nadgrouthbar">' + response.data[0]['param_1'] + '</span>% <br> Decline Growth</div>');
                $('#fotadgrouthspan').html('<span></span> Decline % Growth from Yest. Close');
                datafoupgroup = true;
            }

            chart4.updateSeries(randomize4(dataSet))
        },
        error: function (jqXHR, textStatus, errorThrown) {
            logger.error(textStatus + ': ' + errorThrown);
        }
    });
}

// tabledata.js

$.fn.dataTable.ext.errMode = 'none';



// barchart.js

var options5 = {
    bar: { groupWidth: 30, },
    series: [],
    chart: { height: 600, width: '100%', type: 'bar', },
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
chart5 = new ApexCharts(document.querySelector("#barchart"), options5);
chart5.render();
function getChartData() {


    $.ajax({
        url: root_1 + route_1 + '/MAJOR INDEX WEEKLY PERFORMANCE',
        method: 'GET',
        dataType: 'json',
        success: function (response) {
            var i = 0;
            $.each(response.data, function (key, value) {
                dataSet[i] = { x: value.Symbol, y: value.param_0 };

                i++;
                //dataSet.push([value.Symbol,Math.floor(value.param_0)]);
            });
            chart5.updateSeries([{
                name: '% chg',
                data: dataSet

            }])
        },
        error: function (jqXHR, textStatus, errorThrown) {
            logger.error(textStatus + ': ' + errorThrown);
        }
    });


}

$(document).ready(function () {


    let page_access = username(cookieValue_1)
    if (page_access[2] == 0) {
        if (page_access[4]['p4'] == 1) {

            $('.dataTableSw tbody').empty();

            check_access();

            getpieDount3();
            getpieDount4();


            tendayhighbo = $('#tendayhighbo').DataTable({
                "lengthMenu": [[-1], ["All"]],
                "lengthChange": false,
                "bPaginate": false,
                "scrollX": true,
                "bInfo": false,
                "language": {
                    searchPlaceholder: "Search Stock"
                },
                "ajax": {
                    "url": root_1 + route_3 + '/10 DAY HIGH BO?count=5',
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
                    {
                        data: 'param_4',
                        render: function (data, type) {
                            return data.split(" ")[0]
                        }
                    },
                ],
                "order": [[5, "desc"]],
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
            $("#tendayhighbo_ip").keyup(function () {
                $('#tendayhighbo').dataTable().fnFilter(this.value);
            });

            tendaylowbo = $('#tendaylowbo').DataTable({
                "lengthMenu": [[-1], ["All"]],
                "lengthChange": false,
                "bPaginate": false,
                "scrollX": true,
                "bInfo": false,
                "language": {
                    searchPlaceholder: "Search Stock"
                },
                "ajax": {
                    "url": root_1 + route_3 + '/10 DAY LOW BO?count=5',
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
                    {
                        data: 'param_4',
                        render: function (data, type) {
                            return data.split(" ")[0]
                        }
                    },
                ],
                "order": [[5, "desc"]],
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
            $("#tendaylowbo_ip").keyup(function () {
                $('#tendaylowbo').dataTable().fnFilter(this.value);
            });

            fiftydayhighbo = $('#fiftydayhighbo').DataTable({
                "lengthMenu": [[-1], ["All"]],
                "lengthChange": false,
                "bPaginate": false,
                "scrollX": true,
                "bInfo": false,
                "language": {
                    searchPlaceholder: "Search Stock"
                },
                "ajax": {
                    "url": root_1 + route_3 + '/50 DAY HIGH BO?count=5',
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
                    {
                        data: 'param_4',
                        render: function (data, type) {
                            return data.split(" ")[0]
                        }
                    },
                ],
                "order": [[5, "desc"]],
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
            $("#fiftydayhighbo_ip").keyup(function () {
                $('#fiftydayhighbo').dataTable().fnFilter(this.value);
            });

            fiftydaylowbo = $('#fiftydaylowbo').DataTable({
                "lengthMenu": [[-1], ["All"]],
                "lengthChange": false,
                "bPaginate": false,
                "scrollX": true,
                "bInfo": false,
                "language": {
                    searchPlaceholder: "Search Stock"
                },
                "ajax": {
                    "url": root_1 + route_3 + '/50 DAY LOW BO?count=5',
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
                    {
                        data: 'param_4',
                        render: function (data, type) {
                            return data.split(" ")[0]
                        }
                    },
                ],
                "order": [[5, "desc"]],
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
            $("#fiftydaylowbo_ip").keyup(function () {
                $('#fiftydaylowbo').dataTable().fnFilter(this.value);
            });

            setInterval(function () {
                if (dtime_clock() == false) { return }
                getpieDount3();
                getpieDount4();
            }, 55000);

            setInterval(function () {
                if (dtime_clock() == false) { return }
                fiftydayhighbo.ajax.reload();
                fiftydaylowbo.ajax.reload();
            }, 51000);

            setInterval(function () {
                if (dtime_clock() == false) { return }
                tendayhighbo.ajax.reload();
                tendaylowbo.ajax.reload();
            }, 47000);

            setInterval(function () {
                if (dtime_clock() == false) { return }
                getChartData();
            }, 49000);

            setTimeout(function () {
                chart5.render();
                getChartData();
            }, 700);
        } else if (page_access[4]['p4'] == 0) {

            $('.blur-background').removeClass('d-none')
            $('.lock-icon').removeClass('d-none')

            $('.dataTableSw tbody').empty();

            var jsonData;

            fetch("json/table.json")
                .then(response => response.json())
                .then(data => {
                    jsonData = data;
                    populateTableBodies();
                });

            function populateTableBodies() {
                var tableIds = ["tendayhighbo", "tendaylowbo", "fiftydayhighbo", "fiftydaylowbo"];

                var swingCenterData = jsonData.swing_center_table;

                tableIds.forEach(tableId => {
                    var tableBody = document.getElementById(tableId + '_tbody');

                    swingCenterData.forEach(item => {
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

                dataSet = jsonData.swing_center_chart

                chart5.updateSeries([{
                    name: '% chg',
                    data: dataSet
                }])
            }
        }
    } else if (page_access[2] == 1) {
        $('.dataTableSw tbody').empty();

        var jsonData;

        fetch("json/table.json")
            .then(response => response.json())
            .then(data => {
                jsonData = data;
                populateTableBodies();
            });

        function populateTableBodies() {
            var tableIds = ["tendayhighbo", "tendaylowbo", "fiftydayhighbo", "fiftydaylowbo"];

            var swingCenterData = jsonData.swing_center_table;

            tableIds.forEach(tableId => {
                var tableBody = document.getElementById(tableId + '_tbody');

                swingCenterData.forEach(item => {
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

            dataSet = jsonData.swing_center_chart

            chart5.updateSeries([{
                name: '% chg',
                data: dataSet
            }])
        }
    }
});
