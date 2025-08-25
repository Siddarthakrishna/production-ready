
route_1 = "/study-data"         // For Chart
route_2 = "/study-symbol"       // For DataTable

// const update_time = () => {
//     $.getJSON(root_1 + '/current?type=servertime', function (response) {
//         response = response.split(":");
//         $('.dtime').html(response[0] + ':' + (response[1]));
//     });
// }


options5 = {
    bar: { groupWidth: 30, },
    series: [],
    chart: {
        height: 600,
        width: '100%',
        type: 'bar',
        events: {
            click: (event, chartContext, dataPointIndex) => {

                const toolbarElements = document.querySelectorAll("#prosetup_1_barchart .apexcharts-toolbar");
                if (toolbarElements.length > 0 && toolbarElements[0].contains(event.target)) {
                    // If the clicked element is part of the toolbar, return without doing anything
                    return;
                }

                let temp = dataPointIndex['dataPointIndex']
                let Bar_name = dataPointIndex['globals']['categoryLabels'][temp];

                logger.info(Bar_name)
                tw_charts(Bar_name)
            }
        }
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

chart_ps1 = new ApexCharts(document.querySelector("#prosetup_1_barchart"), options5);
chart_ps1.render();

const getChartData_ps1 = () => {
    var dataSet = [];

    $.ajax({
        url: root_1 + route_1 + '/5 minute MOMENTUM SPIKE',
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

            chart_ps1.updateSeries([{
                name: '% chg',
                data: dataSet
            }])
        }
    });
}



options6 = {
    bar: { groupWidth: 30, },
    series: [],
    chart: {
        height: 600,
        width: '100%',
        type: 'bar',
        events: {
            click: (event, chartContext, dataPointIndex) => {

                const toolbarElements = document.querySelectorAll("#prosetup_2_barchart .apexcharts-toolbar");
                if (toolbarElements.length > 0 && toolbarElements[0].contains(event.target)) {
                    // If the clicked element is part of the toolbar, return without doing anything
                    return;
                }

                let temp = dataPointIndex['dataPointIndex']
                let Bar_name = dataPointIndex['globals']['categoryLabels'][temp];

                logger.info(Bar_name)
                tw_charts(Bar_name)
            }
        }
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

chart_ps2 = new ApexCharts(document.querySelector("#prosetup_2_barchart"), options6);
chart_ps2.render();

const getChartData_ps2 = () => {
    var dataSet = [];

    $.ajax({
        url: root_1 + route_1 + '/10 minute MOMENTUM SPIKE',
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

            chart_ps2.updateSeries([{
                name: '% chg',
                data: dataSet

            }])

        }
    }
    );

}


// ---------------------------------------------------- DATATABLE ----------------------------------------------//


$.fn.dataTable.ext.errMode = 'none';




$(document).ready(function () {

    let page_access = username(cookieValue_1)
    if (page_access[2] == 0) {
        if (page_access[4]['p2'] == 1) {

            $('.dataTablePs tbody').empty();

            check_access();

            getChartData_ps1();
            getChartData_ps2();

            $('#prosetup_1_downsidelomintra').DataTable({
                "lengthMenu": [[-1], ["All"]],
                "lengthChange": false,
                "bPaginate": false,
                "scrollX": true,
                "bInfo": false,
                "language": {
                    searchPlaceholder: "Search Stock"
                },
                "ajax": {
                    "url": root_1 + route_2 + '/TCI BULL DIV 15 MIN?count=5',
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

                    let a = $('td:eq(1)', row).html()
                    if (dtime_clock() == false) { $('td:eq(1)', row).css({ "animation-name": "none" }); }
                    if (a < 0) {
                        if (dtime_clock() == true) { $('td:eq(1)', row).css({ "animation-name": "pink-light-bg" }); }
                        $('td:eq(1)', row).css({ "color": "#f5bcb8" });
                        $('td:eq(1)', row).css({ "background-color": "#8f290a" });
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
            $("#prosetup_1_downsidelomintra_ip").keyup(function () {
                $('#prosetup_1_downsidelomintra').dataTable().fnFilter(this.value);
            });

            $('#prosetup_2_upsidelomintra').DataTable({
                "lengthMenu": [[-1], ["All"]],
                "lengthChange": false,
                "bPaginate": false,
                "scrollX": true,
                "bInfo": false,
                "language": {
                    searchPlaceholder: "Search Stock"
                },
                "ajax": {
                    "url": root_1 + route_2 + '/TCI BEAR DIV 15 MIN?count=5',
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

                    let a = $('td:eq(1)', row).html()
                    if (dtime_clock() == false) { $('td:eq(1)', row).css({ "animation-name": "none" }); }
                    if (a < 0) {
                        if (dtime_clock() == true) { $('td:eq(1)', row).css({ "animation-name": "pink-light-bg" }); }
                        $('td:eq(1)', row).css({ "color": "#f5bcb8" });
                        $('td:eq(1)', row).css({ "background-color": "#8f290a" });
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
            $("#prosetup_2_upsidelomintra_ip").keyup(function () {
                $('#prosetup_2_upsidelomintra').dataTable().fnFilter(this.value);
            });

            $('#prosetup_3_downsidelomswing').DataTable({
                "lengthMenu": [[-1], ["All"]],
                "lengthChange": false,
                "bPaginate": false,
                "scrollX": true,
                "bInfo": false,
                "language": {
                    searchPlaceholder: "Search Stock"
                },
                "ajax": {
                    "url": root_1 + route_2 + '/TCI BULL DIV 1 HR?count=5',
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

                    let a = $('td:eq(1)', row).html()
                    if (dtime_clock() == false) { $('td:eq(1)', row).css({ "animation-name": "none" }); }
                    if (a < 0) {
                        if (dtime_clock() == true) { $('td:eq(1)', row).css({ "animation-name": "pink-light-bg" }); }
                        $('td:eq(1)', row).css({ "color": "#f5bcb8" });
                        $('td:eq(1)', row).css({ "background-color": "#8f290a" });
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
            $("#prosetup_3_downsidelomswing_ip").keyup(function () {
                $('#prosetup_3_downsidelomswing').dataTable().fnFilter(this.value);
            });

            $('#prosetup_4_upsidelomswing').DataTable({
                "lengthMenu": [[-1], ["All"]],
                "lengthChange": false,
                "bPaginate": false,
                "scrollX": true,
                "bInfo": false,
                "language": {
                    searchPlaceholder: "Search Stock"
                },
                "ajax": {
                    "url": root_1 + route_2 + '/TCI BEAR DIV 1 HR?count=5',
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

                    let a = $('td:eq(1)', row).html()
                    if (dtime_clock() == false) { $('td:eq(1)', row).css({ "animation-name": "none" }); }
                    if (a < 0) {
                        if (dtime_clock() == true) { $('td:eq(1)', row).css({ "animation-name": "pink-light-bg" }); }
                        $('td:eq(1)', row).css({ "color": "#f5bcb8" });
                        $('td:eq(1)', row).css({ "background-color": "#8f290a" });
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
            $("#prosetup_4_upsidelomswing_ip").keyup(function () {
                $('#prosetup_4_upsidelomswing').dataTable().fnFilter(this.value);
            });

            $('#prosetup_5_multiresistancebo').DataTable({
                "lengthMenu": [[-1], ["All"]],
                "lengthChange": false,
                "bPaginate": false,
                "scrollX": true,
                "bInfo": false,
                "language": {
                    searchPlaceholder: "Search Stock"
                },
                "ajax": {
                    "url": root_1 + route_2 + '/2 DAY HIGH BREAK LIVE?count=5',
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

                    let a = $('td:eq(1)', row).html()
                    if (dtime_clock() == false) { $('td:eq(1)', row).css({ "animation-name": "none" }); }
                    if (a < 0) {
                        if (dtime_clock() == true) { $('td:eq(1)', row).css({ "animation-name": "pink-light-bg" }); }
                        $('td:eq(1)', row).css({ "color": "#f5bcb8" });
                        $('td:eq(1)', row).css({ "background-color": "#8f290a" });
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
            $("#prosetup_5_multiresistancebo_ip").keyup(function () {
                $('#prosetup_5_multiresistancebo').dataTable().fnFilter(this.value);
            });

            $('#prosetup_6_multisupportbo').DataTable({
                "lengthMenu": [[-1], ["All"]],
                "lengthChange": false,
                "bPaginate": false,
                "scrollX": true,
                "bInfo": false,
                "language": {
                    searchPlaceholder: "Search Stock"
                },
                "ajax": {
                    "url": root_1 + route_2 + '/2 DAY LOW BREAK LIVE?count=5',
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

                    let a = $('td:eq(1)', row).html()
                    if (dtime_clock() == false) { $('td:eq(1)', row).css({ "animation-name": "none" }); }
                    if (a < 0) {
                        if (dtime_clock() == true) { $('td:eq(1)', row).css({ "animation-name": "pink-light-bg" }); }
                        $('td:eq(1)', row).css({ "color": "#f5bcb8" });
                        $('td:eq(1)', row).css({ "background-color": "#8f290a" });
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
            $("#prosetup_6_multisupportbo_ip").keyup(function () {
                $('#prosetup_6_multisupportbo').dataTable().fnFilter(this.value);
            });

            $('#prosetup_7_multiresistancebo_eod').DataTable({
                "lengthMenu": [[-1], ["All"]],
                "lengthChange": false,
                "bPaginate": false,
                "scrollX": true,
                "bInfo": false,
                "language": {
                    searchPlaceholder: "Search Stock"
                },
                "ajax": {
                    "url": root_1 + route_2 + '/TCI 2 day high EOD?count=5',
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

                    let a = $('td:eq(1)', row).html()
                    if (dtime_clock() == false) { $('td:eq(1)', row).css({ "animation-name": "none" }); }
                    if (a < 0) {
                        if (dtime_clock() == true) { $('td:eq(1)', row).css({ "animation-name": "pink-light-bg" }); }
                        $('td:eq(1)', row).css({ "color": "#f5bcb8" });
                        $('td:eq(1)', row).css({ "background-color": "#8f290a" });
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
            $("#prosetup_7_multiresistancebo_eod_ip").keyup(function () {
                $('#prosetup_7_multiresistancebo_eod').dataTable().fnFilter(this.value);
            });

            $('#prosetup_8_multisupportbo_eod').DataTable({
                "lengthMenu": [[-1], ["All"]],
                "lengthChange": false,
                "bPaginate": false,
                "scrollX": true,
                "bInfo": false,
                "language": {
                    searchPlaceholder: "Search Stock"
                },
                "ajax": {
                    "url": root_1 + route_2 + '/TCI 2 day low EOD?count=5',
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

                    let a = $('td:eq(1)', row).html()
                    if (dtime_clock() == false) { $('td:eq(1)', row).css({ "animation-name": "none" }); }
                    if (a < 0) {
                        if (dtime_clock() == true) { $('td:eq(1)', row).css({ "animation-name": "pink-light-bg" }); }
                        $('td:eq(1)', row).css({ "color": "#f5bcb8" });
                        $('td:eq(1)', row).css({ "background-color": "#8f290a" });
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
            $("#prosetup_8_multisupportbo_eod_ip").keyup(function () {
                $('#prosetup_8_multisupportbo_eod').dataTable().fnFilter(this.value);
            });

            $('#prosetup_9_dailycontraction').DataTable({
                "lengthMenu": [[-1], ["All"]],
                "lengthChange": false,
                "bPaginate": false,
                "scrollX": true,
                "bInfo": false,
                "language": {
                    searchPlaceholder: "Search Stock"
                },
                "ajax": {
                    "url": root_1 + route_2 + '/TCI NR7 INSIDER EOD?count=5',
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

                    let a = $('td:eq(1)', row).html()
                    if (dtime_clock() == false) { $('td:eq(1)', row).css({ "animation-name": "none" }); }
                    if (a < 0) {
                        if (dtime_clock() == true) { $('td:eq(1)', row).css({ "animation-name": "pink-light-bg" }); }
                        $('td:eq(1)', row).css({ "color": "#f5bcb8" });
                        $('td:eq(1)', row).css({ "background-color": "#8f290a" });
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
            $("#prosetup_9_dailycontraction_ip").keyup(function () {
                $('#prosetup_9_dailycontraction').dataTable().fnFilter(this.value);
            });

            setInterval(function () {
                if (dtime_clock() == false) { return }
                $('#prosetup_1_downsidelomintra').DataTable().ajax.reload();
                $('#prosetup_2_upsidelomintra').DataTable().ajax.reload();
            }, 47000);

            setInterval(function () {
                if (dtime_clock() == false) { return }
                $('#prosetup_3_downsidelomswing').DataTable().ajax.reload();
                $('#prosetup_4_upsidelomswing').DataTable().ajax.reload();
            }, 49000);

            setInterval(function () {
                if (dtime_clock() == false) { return }
                $('#prosetup_5_multiresistancebo').DataTable().ajax.reload();
                $('#prosetup_6_multisupportbo').DataTable().ajax.reload();
            }, 51000);

            setInterval(function () {
                if (dtime_clock() == false) { return }
                $('#prosetup_7_multiresistancebo_eod').DataTable().ajax.reload();
                $('#prosetup_8_multisupportbo_eod').DataTable().ajax.reload();
            }, 53000);


            setInterval(function () {
                if (dtime_clock() == false) { return }
                getChartData_ps1();
                getChartData_ps2();
            }, 57000);


        } else if (page_access[4]['p2'] == 0) {

            $('.blur-background').removeClass('d-none')
            $('.lock-icon').removeClass('d-none')

            $('.dataTablePs tbody').empty();

            var jsonData;

            fetch("json/table.json")
                .then(response => response.json())
                .then(data => {
                    jsonData = data;
                    populateTableBodies();
                });

            function populateTableBodies() {
                var tableIds = ["prosetup_1_downsidelomintra", "prosetup_2_upsidelomintra", "prosetup_3_downsidelomswing", "prosetup_4_upsidelomswing", "prosetup_5_multiresistancebo", "prosetup_6_multisupportbo", "prosetup_7_multiresistancebo_eod", "prosetup_8_multisupportbo_eod", "prosetup_9_dailycontraction"];

                var proSetupData = jsonData.pro_setup_table;

                tableIds.forEach(tableId => {
                    var tableBody = document.getElementById(tableId + '_tbody');

                    proSetupData.forEach(item => {
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

                dataSet = jsonData.pro_setup_chart;


                chart_ps1.updateSeries([{
                    name: '% chg',
                    data: dataSet
                }])

                chart_ps2.updateSeries([{
                    name: '% chg',
                    data: dataSet
                }])
            }
        }
    } else if (page_access[2] == 1) {
        $('.dataTablePs tbody').empty();

        var jsonData;

        fetch("json/table.json")
            .then(response => response.json())
            .then(data => {
                jsonData = data;
                populateTableBodies();
            });

        function populateTableBodies() {
            var tableIds = ["prosetup_1_downsidelomintra", "prosetup_2_upsidelomintra", "prosetup_3_downsidelomswing", "prosetup_4_upsidelomswing", "prosetup_5_multiresistancebo", "prosetup_6_multisupportbo", "prosetup_7_multiresistancebo_eod", "prosetup_8_multisupportbo_eod", "prosetup_9_dailycontraction"];

            var proSetupData = jsonData.pro_setup_table;

            tableIds.forEach(tableId => {
                var tableBody = document.getElementById(tableId + '_tbody');

                proSetupData.forEach(item => {
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

            dataSet = jsonData.pro_setup_chart;


            chart_ps1.updateSeries([{
                name: '% chg',
                data: dataSet
            }])

            chart_ps2.updateSeries([{
                name: '% chg',
                data: dataSet
            }])
        }
    }

});