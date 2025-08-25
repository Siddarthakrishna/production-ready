
route = '/calcApi'

// -------------------------- Datatable ------------------------

$.fn.dataTable.ext.errMode = 'none';

const fetch_data = () => {
    $.ajax({
        method: 'POST',
        url: scanner_root + route + '/fetch_fii_dii_data',
        success: function (response) {
            response = JSON.parse(JSON.stringify(response));
            for (var i = 0; i < response.length; i++) {
                xAxis.push(response[i][0])
                let ts = response[i][0];
                let FII_Buy = response[i][1];
                let FII_Sell = response[i][2];
                let FII_Net = response[i][3];
                let DII_Buy = response[i][4];
                let DII_Sell = response[i][5];
                let DII_Net = response[i][6];
                response[i][0] = moment.unix(ts).format('DD-MM-YYYY')
                response[i][1] = FII_Buy
                response[i][2] = FII_Sell
                response[i][3] = FII_Net
                response[i][4] = parseFloat(parseFloat(FII_Net) + parseFloat(DII_Net)).toFixed(2)
                response[i][5] = DII_Net
                response[i][6] = DII_Buy
                response[i][7] = DII_Sell
            }
            datatable = $("#fii_dii_datatable").DataTable({

                "columnDefs": [{ targets: [0, 1, 2, 3, 5, 6, 7], className: 'dt-body-center' },
                { targets: [4], className: 'dt-body-center' }],
                "autoWidth": false,
                "rowCallback": function (row, data) {
                    if (data[3] > 0) {
                        $('td:eq(3)', row).html('<span style=color:#00d3c0>' + data[3] + '</span>');
                    }
                    else {
                        $('td:eq(3)', row).html('<span style=color:#ff5253>' + data[3] + '</span>');
                    }
                    if (data[5] > 0) {
                        $('td:eq(5)', row).html('<span style=color:#00d3c0>' + data[5] + '</span>');
                    }
                    else {
                        $('td:eq(5)', row).html('<span style=color:#ff5253>' + data[5] + '</span>');
                    }
                    if (data[4] > 0) {
                        $('td:eq(4)', row).html('<span><div style=color:white;background-color:#308f86;border-radius:5px;>' + data[4] + '</div></span>');
                    }
                    else {
                        $('td:eq(4)', row).html('<span><div style=color:white;background-color:#ff5253;border-radius:5px;>' + data[4] + '</div></span>');
                    }
                },
                paging: false,
                info: false,
                ordering: false,
                scrollX: true,
                pageLength: 50,
            });
            datatable.clear();
            datatable.rows.add(response);
            datatable.draw();

            FII_DII_data = response

            chart_data()
        }
    })

    $('.dataTables_scrollHeadInner').attr('style', 'box-sizing: content-box; padding-right: 0px;')

}

// Highchart color function
const VolumeBarColor = (point) => {
    if (point > 0) {
        return "#00d3c0";
    } else if (point < 0) {
        return "#ff5253"
    }  else if (point == 0) {
        return "#fff"
    }
};

// Highchart volume bar width and then Update chart
const VolumeBarWidth = (points) => {
    var volume_bar_width = parseInt(points * 24 / 1031.5)

    console.log(volume_bar_width)

    highchart.update({
        series: [
            {
                type: "column",
                name: "FII + DII Net",
                data: FII_DII_net_array,
                dataGrouping: {
                    enabled: false,
                },
                pointWidth: volume_bar_width
            }, {
                type: "column",
                name: "FII Net Value",
                data: FII_net_array,
                yAxis: 1,
                dataGrouping: {
                    enabled: false,
                },
                pointWidth: volume_bar_width
            }, {
                type: "column",
                name: "DII Net Value",
                data: DII_net_array,
                yAxis: 2,
                dataGrouping: {
                    enabled: false,
                },
                pointWidth: volume_bar_width
            },
        ],
    })
}

const chart_data = () => {

    FII_DII_net_array = []
    FII_net_array = []
    DII_net_array = []

    if (FII_DII_data.length >= 40) { last_limit = 40 }
    else { last_limit = FII_DII_data.length }

    FII_DII_net_array.push({
        x: parseFloat((parseFloat(xAxis[1]) + 19800) * 1000), // the date
        y: parseFloat(FII_DII_data[1][4]), // the Volume
        color: VolumeBarColor(0),
    });

    FII_net_array.push({
        x: parseFloat((parseFloat(xAxis[1]) + 19800) * 1000), // the date
        y: parseFloat(FII_DII_data[1][3]), // the Volume
        color: VolumeBarColor(0),
    });

    DII_net_array.push({
        x: parseFloat((parseFloat(xAxis[1]) + 19800) * 1000), // the date
        y: parseFloat(FII_DII_data[1][5]), // the Volume
        color: VolumeBarColor(0),
    });

    for (var i = 0; i < last_limit; i++) {
        FII_DII_net_array.push({
            x: parseFloat((parseFloat(xAxis[i]) + 19800) * 1000), // the date
            y: parseFloat(FII_DII_data[i][4]), // the Volume
            color: VolumeBarColor(parseFloat(FII_DII_data[i][4])),
        });

        FII_net_array.push({
            x: parseFloat((parseFloat(xAxis[i]) + 19800) * 1000), // the date
            y: parseFloat(FII_DII_data[i][3]), // the Volume
            color: VolumeBarColor(parseFloat(FII_DII_data[i][3])),
        });

        DII_net_array.push({
            x: parseFloat((parseFloat(xAxis[i]) + 19800) * 1000), // the date
            y: parseFloat(FII_DII_data[i][5]), // the Volume
            color: VolumeBarColor(parseFloat(FII_DII_data[i][5])),
        });
    }

    chart_width = $('#fii_dii_chart').width()

    VolumeBarWidth(chart_width)
}


$(document).ready(function () {

    // create the chart
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
                data: [],
                dataGrouping: {
                    enabled: false,
                },
                pointWidth: 15
            }, {
                type: "column",
                name: "FII Net Value",
                data: [],
                yAxis: 1,
                dataGrouping: {
                    enabled: false,
                },
                pointWidth: 15
            }, {
                type: "column",
                name: "DII Net Value",
                data: [0, 0, 0, 0],
                yAxis: 2,
                dataGrouping: {
                    enabled: false,
                },
                pointWidth: 15
            },
        ],
    });

    xAxis = []

    fetch_data()

    $("#fii_dii_datatable_ip").keyup(function () {
        $('#fii_dii_datatable').dataTable().fnFilter(this.value);
    });
})

$(window).resize(function () {
    $('.dataTables_scrollHeadInner').attr('style', 'box-sizing: content-box; padding-right: 0px;')

    chart_width = $('#fii_dii_chart').width()
    VolumeBarWidth(chart_width)

    if($(window).width() >= 576) {
        $('#add_br').html('Capital Market Activity (in Cr.) <a class="live live-2"><i class="fa-solid fa-circle fa-sm"></i>&nbsp;ACTIVE</a>')
    } else if($(window).width() < 576){
        $('#add_br').html('Capital Market Activity <br> (in Cr.) <a class="live live-2"><i class="fa-solid fa-circle fa-sm"></i>&nbsp;ACTIVE</a>')
    }
})