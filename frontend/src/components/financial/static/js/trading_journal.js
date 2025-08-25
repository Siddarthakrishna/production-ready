

/*-------------- ALL HELPER FUNCTION - START ---------------*/

// All array value are +ve, -ve or mix
function checkArrayValues(arr) {
    let allPositive = true;
    let allNegative = true;

    for (const value of arr) {
        if (value > 0) {
            allNegative = false;
        } else if (value < 0) {
            allPositive = false;
        }
    }

    if (allPositive) {
        return "Positive";
    } else if (allNegative) {
        return "Negative";
    } else {
        return "Mixed";
    }
}

function calculateSubranges(min, max, numSubranges) {
    const rangeSize = (max - min + 1) / numSubranges;
    const subranges = [];

    for (let i = 0; i < numSubranges; i++) {
        const startValue = min + i * rangeSize;
        const endValue = startValue + rangeSize - 1;
        // subranges.push({ start: startValue.toFixed(0), end: endValue.toFixed(0) });
        subranges.push({ start: parseInt(startValue), end: parseInt(endValue) });
    }

    return subranges;
}

function extractTimestamp(text) {
    const datePattern = /(\d{2}-\d{2}-\d{2})/; // Updated regex pattern for "DD-MM-YY"
    const match = text.match(datePattern);
    if (match) {
        const dateString = match[1];

        const [day, month, year] = dateString.split("-");

        const date = new Date(`20${year}`, parseInt(month) - 1, day);

        const timestamp = date.getTime() / 1000;
        return timestamp;
    }
    return null;
}

function empty_value() {
    x_axis = []
    y_axis = []

    x_axis1 = []
    y_axis1 = []

    $('#All_stats_Entry_date').text('------')
    $('#All_stats_Exit_date').text('------')

    $('#total_profits').text('------')
    $('#avg_winner').text('------')
    $('#avg_losser').text('------')
    $('#biggest_win').text('------')
    $('#biggest_win1').text('------')
    $('#biggest_loss').text('------')
    $('#biggest_loss1').text('------')
    $('#avg_pnl').text('------')
    $('#total_trades').text('------')
    $('#risk_reward').text('------')

    $('#Top_Winner_1_Name').text('Winner 1')
    $('#Top_Winner_1_Value').text('-------')
    $('#Top_Winner_2_Name').text('Winner 2')
    $('#Top_Winner_2_Value').text('-------')
    $('#Top_Winner_3_Name').text('Winner 3')
    $('#Top_Winner_3_Value').text('-------')

    $('#Top_Losser_1_Name').text('Losser 1')
    $('#Top_Losser_1_Value').text('-------')
    $('#Top_Losser_2_Name').text('Losser 2')
    $('#Top_Losser_2_Value').text('-------')
    $('#Top_Losser_3_Name').text('Losser 3')
    $('#Top_Losser_3_Value').text('-------')
}

function empty_table_chart() {
    if (counter_for_data_table_monthly == 1) {
        data_table_array_monthly = []
        data_table_monthly.clear();
        data_table_monthly.rows.add(data_table_array_monthly);
        data_table_monthly.draw();
    }

    if (counter_for_data_table == 1) {
        data_table_array = []
        data_table.clear();
        data_table.rows.add(data_table_array);
        data_table.draw();
    }


    x_axis = []
    y_axis = []

    x_axis1 = []
    y_axis1 = []

    function addData(chart) {
        chart.data.labels = x_axis;
        chart.data.datasets.forEach((dataset) => {
            dataset.data = y_axis;
        });
        chart.update();
    }
    addData(chart_1);

    apexchart.updateSeries([{
        data: []
    }])

    apexchart_Daily_PnL.updateOptions({
        xaxis: {
            type: 'Text',
            categories: x_axis1,
        }
    })
    apexchart_Daily_PnL.updateSeries([{
        data: y_axis1
    }])

    resultArray = []
    $("#CalendarHeatmap").CalendarHeatmap('updateDates', resultArray);

    $("#CalendarHeatmap").CalendarHeatmap('updateOptions', {
        lastMonth: moment().month() + 1,
        lastYear: moment().year(),
    });

    resize_function()

    calendar.setDate(moment().format("YYYY-MM-DD"));

    $('#equity_curve_container').hide()
    $('#day_chart_and_monthly_table').hide()
    $('#tradelist_table').hide()

    user_has_selected_range = false

}

function format_Currency(value) {
    var floatValue = parseFloat(value);
    var symbol = floatValue >= 0 ? '₹' : '- ₹';
    floatValue = Math.abs(floatValue);
    var formattedValue = '';

    if (floatValue >= 10000000) {
        formattedValue = (floatValue / 10000000).toFixed(2) + 'Cr';
    } else if (floatValue >= 100000) {
        formattedValue = (floatValue / 100000).toFixed(2) + 'L';
    } else if (floatValue >= 1000) {
        formattedValue = (floatValue / 1000).toFixed(2) + 'k';
    } else if (floatValue == 0) {
        formattedValue = floatValue;
    } else {
        formattedValue = floatValue.toFixed(2);
    }

    var oldValueWithSymbol = value >= 0 ? '₹' + floatValue.toFixed(2) : '- ₹' + floatValue.toFixed(2);

    return [symbol + formattedValue, value, oldValueWithSymbol];
}

/*-------------- ALL HELPER FUNCTION - END ---------------*/


//-------------Delete Trades------------------------
const delete_trade = (trade_id) => {

    delete_trade_id = trade_id
}

const confirm_yes = () => {
    Yes_button_Clicked = true
    if (Yes_button_Clicked) {
        Yes_button_Clicked = false
        data_dict = {
            'trade_id': delete_trade_id
        };

        data = JSON.stringify(data_dict);

        $.post(
            root + route + "/curd_journal",
            { 'op': 'delete', 'data': data },
            function (data, status) {
                $('#delete_trade_close').click()

                if (data == "success") {
                                    if (user_has_selected_range) {
                    view_trade()
                }
                
                // Update charges summary after deleting trade
                if (window.brokerageModule) {
                    window.brokerageModule.updateChargesSummary();
                }
                
                setTimeout(() => {
                        toast_function('success', 'Trade deleted Successfully!')
                    }, 200);
                } else {
                    toast_function('danger', 'Unable to delete Trade')
                }
            }
        ).fail(function (response) {
            logger.error("Error: " + response);
        });
    }
}

//-------------Delete Trades------------------------

const winner_losser = () => {

    // const symbolReturns = {};
    const symbolReturn = []

    for (const entry1 of data_table_array) {
        const [status, entryTime, exitTime, symbol, entry, exit, quantity, type, returnAmount, action] = entry1;

        // Convert 'returnAmount' to a number
        const numericReturn = parseFloat(returnAmount[1]);
        symbolReturn.push([symbol, numericReturn])
    }

    symbolReturn.sort(function (a, b) {
        return b[1] - a[1];
    });

    var top3Max = symbolReturn.slice(0, 3);
    var top3Min = symbolReturn.slice(-3);

    var Winner_losser_Dict = {
        Winner_1: top3Max[0],
        Winner_2: top3Max[1],
        Winner_3: top3Max[2],
        Losser_3: top3Min[0],
        Losser_2: top3Min[1],
        Losser_1: top3Min[2]
    };

    const winnersHaveNegativeReturn = Object.values(Winner_losser_Dict)
        .slice(0, 3)
        .some(([_, returnAmount]) => returnAmount < 0);

    const losersHavePositiveReturn = Object.values(Winner_losser_Dict)
        .slice(3)
        .some(([_, returnAmount]) => returnAmount > 0);

    // Update Winner_losser_Dict based on conditions
    if (winnersHaveNegativeReturn) {
        if (Winner_losser_Dict.Winner_1[1] < 0) Winner_losser_Dict.Winner_1 = ['', ''];
        if (Winner_losser_Dict.Winner_2[1] < 0) Winner_losser_Dict.Winner_2 = ['', ''];
        if (Winner_losser_Dict.Winner_3[1] < 0) Winner_losser_Dict.Winner_3 = ['', ''];
    }

    if (losersHavePositiveReturn) {
        if (Winner_losser_Dict.Losser_1[1] > 0) Winner_losser_Dict.Losser_1 = ['', ''];
        if (Winner_losser_Dict.Losser_2[1] > 0) Winner_losser_Dict.Losser_2 = ['', ''];
        if (Winner_losser_Dict.Losser_3[1] > 0) Winner_losser_Dict.Losser_3 = ['', ''];
    }


    function formatCurrency(value) {
        var floatValue = parseFloat(value);
        var symbol = floatValue >= 0 ? '₹' : '- ₹';
        floatValue = Math.abs(floatValue);
        var formattedValue = '';

        if (floatValue >= 10000000) {
            formattedValue = (floatValue / 10000000).toFixed(2) + 'Cr';
        } else if (floatValue >= 100000) {
            formattedValue = (floatValue / 100000).toFixed(2) + 'L';
        } else if (floatValue >= 1000) {
            formattedValue = (floatValue / 1000).toFixed(2) + 'k';
        } else {
            formattedValue = floatValue.toFixed(2);
        }

        var oldValueWithSymbol = value >= 0 ? '₹' + floatValue.toFixed(2) : '- ₹' + floatValue.toFixed(2);

        return [symbol + formattedValue, value, symbol + formattedValue, oldValueWithSymbol];
    }

    // Update Winners and Lossers with formatted amounts
    for (let i = 1; i <= 3; i++) {
        if (Winner_losser_Dict[`Winner_${i}`][1] !== '') {
            const formattedWinner = formatCurrency(Winner_losser_Dict[`Winner_${i}`][1]);
            Winner_losser_Dict[`Winner_${i}`][2] = formattedWinner[0];
            Winner_losser_Dict[`Winner_${i}`][3] = formattedWinner[2];
            Winner_losser_Dict[`Winner_${i}`][4] = formattedWinner[3];
        }

        if (Winner_losser_Dict[`Losser_${i}`][1] !== '') {
            const formattedLosser = formatCurrency(Winner_losser_Dict[`Losser_${i}`][1]);
            Winner_losser_Dict[`Losser_${i}`][2] = formattedLosser[0];
            Winner_losser_Dict[`Losser_${i}`][3] = formattedLosser[2];
            Winner_losser_Dict[`Losser_${i}`][4] = formattedLosser[3];
        }
    }

    // checking that is there any value Undefined or NaN
    for (const key in Winner_losser_Dict) {
        if (Winner_losser_Dict.hasOwnProperty(key)) {
            const value = Winner_losser_Dict[key];
            if (value[1] === undefined || isNaN(value[1]) || value[1] === '₹NaN' || value[1] === '- ₹NaN') {
                Winner_losser_Dict[key] = ['', ''];
            }
        }
    }

    function updateNameAndValue(idPrefix, index, data) {
        const nameId = `#${idPrefix}_${index}_Name`;
        const valueId = `#${idPrefix}_${index}_Value`;

        if ($(nameId).length && data[0] !== '') {
            $(nameId).text(data[0]);
        }

        if ($(valueId).length && data[1] !== '') {
            $(valueId).text(data[2]);
            $(valueId).attr('data-title', data[4]);
        }
    }

    // Update Winners
    updateNameAndValue('Top_Winner', 1, Winner_losser_Dict.Winner_1);
    updateNameAndValue('Top_Winner', 2, Winner_losser_Dict.Winner_2);
    updateNameAndValue('Top_Winner', 3, Winner_losser_Dict.Winner_3);

    // Update Lossers
    updateNameAndValue('Top_Losser', 1, Winner_losser_Dict.Losser_1);
    updateNameAndValue('Top_Losser', 2, Winner_losser_Dict.Losser_2);
    updateNameAndValue('Top_Losser', 3, Winner_losser_Dict.Losser_3);
}

const view_trade_image = (img_src, trade_id) => {



    $('#modal_image').attr('src', '');

    Delete_trade_button_id = trade_id

    for (var i = 0; i < view_trade_data.length; i++) {
        if (trade_id == view_trade_data[i][0]) {
            row_data = view_trade_data[i]
            break;
        }
    }

    $('#image_modal_entry_date_time').text(moment.unix(row_data[2]).format('MMM DD, YYYY HH:mm'))
    $('#image_modal_exit_date_time').text(moment.unix(row_data[3]).format('MMM DD, YYYY HH:mm'))

    parsed_row_data = JSON.parse(row_data[4])

    if (parsed_row_data.hasOwnProperty('link')) {
        $('#modal_image').attr('src', parsed_row_data['link']);
    }

    if (parsed_row_data['trade_type'] == 'Long') {
        returns = (parseFloat(parsed_row_data['exit_price']) - parseFloat(parsed_row_data['entry_price'])) * parseFloat(parsed_row_data['quantity'])
        roc = (parseFloat(parsed_row_data['exit_price']) - parseFloat(parsed_row_data['entry_price'])) / parseFloat(parsed_row_data['entry_price']) * 100 * 1
        roc = parseFloat(roc.toFixed(2))
    } else if (parsed_row_data['trade_type'] == 'Short') {
        returns = (parseFloat(parsed_row_data['entry_price']) - parseFloat(parsed_row_data['exit_price'])) * parseFloat(parsed_row_data['quantity'])
        roc = (parseFloat(parsed_row_data['exit_price']) - parseFloat(parsed_row_data['entry_price'])) / parseFloat(parsed_row_data['entry_price']) * 100 * (-1)
        roc = parseFloat(roc.toFixed(2))
    }

    if (parseFloat(returns).toFixed(2) >= 0) {
        status1 = 'WIN'
        $('#image_modal_status').css('color', 'rgb(123, 219, 123)')
        $('#image_modal_returns').css('color', 'rgb(123, 219, 123)')
    } else {
        status1 = 'LOSS'
        $('#image_modal_status').css('color', 'rgb(252, 92, 93)')
        $('#image_modal_returns').css('color', 'rgb(252, 92, 93)')
    }

    if (roc >= 0) {
        $('#image_modal_returns').css('color', 'rgb(123, 219, 123)')
        roc = roc + '%'
    } else {
        $('#image_modal_returns').css('color', 'rgb(252, 92, 93)')
        roc = '- ' + Math.abs(roc) + '%'
    }

    if (parsed_row_data['trade_type'] == 'Long') {
        $('#image_modal_type').css('color', 'rgb(123, 219, 123)')
    } else if (parsed_row_data['trade_type'] == 'Short') {
        $('#image_modal_type').css('color', 'rgb(252, 92, 93)')
    }

    entry_price = format_Currency(parsed_row_data['entry_price'])
    exit_price = format_Currency(parsed_row_data['exit_price'])
    returns = format_Currency(returns)

    $('#image_modal_status').text(status1)
    $('#image_modal_returns').text(returns[0]).attr('data-title-table', returns[2])
    $('#image_modal_roc').text(roc)
    $('#image_modal_type').text(parsed_row_data['trade_type'])
    $('#image_modal_entry_price').text(entry_price[0]).attr('data-title-table', entry_price[2])
    $('#image_modal_exit_price').text(exit_price[0]).attr('data-title-table', exit_price[2])
    $('#image_modal_symbol').text(parsed_row_data['symbol_Ticker'])
    $('#image_modal_quantity').text(parsed_row_data['quantity'])
    $('#image_modal_trade_logic').text(parsed_row_data['find_Trade'])
    $('#image_modal_entry_reason').text(parsed_row_data['entry_reason'])
    $('#image_modal_exit_reason').text(parsed_row_data['exit_reason'])
    $('#image_modal_mistake_lesson').text(parsed_row_data['mistakes'])
}

resize_function = () => {
    let month_length = $(".ch-month").length;

    if ($(window).width() < 1610 && month_length == 12) {
        $('.ch-year').removeClass('d-flex justify-content-center')
    } else if ($(window).width() >= 1610 && month_length == 12) {
        $('.ch-year').addClass('d-flex justify-content-center')
    }

    if ($(window).width() < 1500 && month_length == 11) {
        $('.ch-year').removeClass('d-flex justify-content-center')
    } else if ($(window).width() >= 1500 && month_length == 11) {
        $('.ch-year').addClass('d-flex justify-content-center')
    }

    if ($(window).width() < 1370 && month_length == 10) {
        $('.ch-year').removeClass('d-flex justify-content-center')
    } else if ($(window).width() >= 1370 && month_length == 10) {
        $('.ch-year').addClass('d-flex justify-content-center')
    }

    if ($(window).width() < 1205 && month_length == 9) {
        $('.ch-year').removeClass('d-flex justify-content-center')
    } else if ($(window).width() >= 1205 && month_length == 9) {
        $('.ch-year').addClass('d-flex justify-content-center')
    }

    if ($(window).width() < 1090 && month_length == 8) {
        $('.ch-year').removeClass('d-flex justify-content-center')
    } else if ($(window).width() >= 1090 && month_length == 8) {
        $('.ch-year').addClass('d-flex justify-content-center')
    }

    if ($(window).width() < 885 && month_length == 7) {
        $('.ch-year').removeClass('d-flex justify-content-center')
    } else if ($(window).width() >= 885 && month_length == 7) {
        $('.ch-year').addClass('d-flex justify-content-center')
    }

    if ($(window).width() < 773 && month_length == 6) {
        $('.ch-year').removeClass('d-flex justify-content-center')
    } else if ($(window).width() >= 773 && month_length == 6) {
        $('.ch-year').addClass('d-flex justify-content-center')
    }

    if ($(window).width() < 660 && month_length == 5) {
        $('.ch-year').removeClass('d-flex justify-content-center')
    } else if ($(window).width() >= 660 && month_length == 5) {
        $('.ch-year').addClass('d-flex justify-content-center')
    }

    if ($(window).width() < 550 && month_length == 4) {
        $('.ch-year').removeClass('d-flex justify-content-center')
    } else if ($(window).width() >= 550 && month_length == 4) {
        $('.ch-year').addClass('d-flex justify-content-center')
    }

    if ($(window).width() < 430 && month_length == 3) {
        $('.ch-year').removeClass('d-flex justify-content-center')
    } else if ($(window).width() >= 430 && month_length == 3) {
        $('.ch-year').addClass('d-flex justify-content-center')
    }

    if ($(window).width() < 540) {
        $('.ch-day').width(9) //15px
        $('.ch-day').height(9)

        $('.ch-week').width(11)
        $('.ch-day-labels').width(11) //17px

        $('.ch-day-label').css('line-height', '11px')  // 17px
    } else {
        $('.ch-day').width(15)
        $('.ch-day').height(15)

        $('.ch-week').width(17)
        $('.ch-day-labels').width(17)

        $('.ch-day-label').css('line-height', '17px')
    }
}

$(document).ready(function () {

    $('#coming_soon').hide()

    previous_timestamp = 0
    scrollPosition = 0;

    x_axis = []
    y_axis = []

    x_axis1 = []
    y_axis1 = []

    counter_for_data_table = 0
    counter_for_data_table_monthly = 0

    Yes_button_Clicked = false
    user_has_selected_range = false

    // Initialize brokerage module
    if (window.brokerageModule) {
        window.brokerageModule.initBrokerage();
    }

    // -------- For Tooltip
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    const tooltipList = [...tooltipTriggerList].map((tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl));


    // Set default values for entry and exit date fields
    $('.disable_color').css('color', '#9f9f9f');
    $('#select_range').css('color', '#9f9f9f');
    $('#Entry_date').attr('disabled', 'true');
    $('#Exit_date').attr('disabled', 'true');


    $('.ch-year').addClass('d-flex justify-content-center')

    // -------------- SUGGESTION STRAT ------------------//

    $.post(root + "http://localhost:8000/api/journal/instr_list", function (data, status) {
        logger.info(status)
    }).done(function (response) {
        response = JSON.parse(response)
        Stockname = []
        for (var i = 0; i < response.length; i++) {
            Stockname.push({ "stockName": response[i] })
        }
        $("#Symbol_Ticker").fuzzyComplete(Stockname);
    }).fail(function (response) {
        logger.error("Error: " + response);
    });

    // -------------- SUGGESTION END ------------------//

    // -------- chartjs linechart initialization

    var ctx = document.getElementById("linechart").getContext('2d');

    var gradientAbove = ctx.createLinearGradient(0, 0, 0, 300);
    gradientAbove.addColorStop(0, 'rgba(51, 208, 38, 1)');
    gradientAbove.addColorStop(1, 'rgba(5, 55, 3, 0.01');

    var gradientBelow = ctx.createLinearGradient(0, 0, 0, 300);
    gradientBelow.addColorStop(1, 'rgba(255, 35, 35, 1)');
    gradientBelow.addColorStop(0, 'rgba(5, 35, 35, 0)');

    chart_1 = new Chart(ctx, {
        type: "line",
        data: {
            labels: x_axis,
            datasets: [
                {
                    fill: {
                        target: "origin",
                        above: gradientAbove,
                        below: gradientBelow,
                    },
                    backgroundColor: '#1c1c1c',
                    data: y_axis,
                    tension: 0.4,
                    borderWidth: 0,
                    pointRadius: 0,
                }
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false,
                    position: 'right',
                    ticks: {
                        color: 'white'
                    },
                    grid: {
                        display: false,
                        drawOnChartArea: false,
                        drawTicks: false,
                    }
                },
                x: {
                    ticks: {
                        display: true,
                        maxTicksLimit: 10,
                        padding: 15,
                        color: "white",
                    },
                    grid: {
                        display: true,
                        drawOnChartArea: true,
                        drawTicks: true,
                    }
                },
            },
            plugins: {
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    enabled: true,
                    displayColors: false,
                    titleColor: "white",
                    titleSpacing: 3,
                    TitleFont: {
                        weight: "bold",
                    },
                    backgroundColor: "black",
                    bodyFont: {
                        weight: "bold",
                    },
                    callbacks: {
                        labelTextColor: function (context) {
                            const value = context.dataset.data[context.dataIndex];
                            return value >= 0 ? "rgba(51, 208, 38, 1)" : "rgba(255, 35, 35, 1)"; // Green for positive values, red for negative values
                        },
                        label: function (context) {
                            const value = context.dataset.data[context.dataIndex];
                            if (parseFloat(value) >= 0) {
                                return '₹' + parseFloat(value);
                            } else {
                                return '- ₹' + Math.abs(parseFloat(value));
                            }
                        },
                    },
                },
                crosshair: {
                    line: {
                        color: '#e7e7e7',  // crosshair line color
                        width: 1        // crosshair line width
                    },
                    sync: {
                        enabled: true,            // enable trace line syncing with other charts
                        group: 1,                 // chart group
                        suppressTooltips: false   // suppress tooltips when showing a synced tracer
                    },
                },
                legend: {
                    display: false,
                    color: '#1c1c1c',
                    legendText: 'MTM Value'
                },
                title: {
                    display: true,
                    text: "",
                    align: "start",
                    color: "white",
                    font: {
                        size: 20,
                    },
                    padding: { bottom: 25 },
                },
            },
        },
    });


    // ------ Apexchart
    var options = {
        series: [{
            name: 'MTM Value',
            data: []
        }],
        chart: {
            type: 'bar',
            height: 300,
            toolbar: {
                show: false
            }
        },
        plotOptions: {
            bar: {
                colors: {
                    ranges: [{
                        from: 0,
                        to: 100000000,
                        color: '#7bdb7b'
                    }, {
                        from: -100000000,
                        to: 0,
                        color: '#fc5c5d'
                    }]
                },
                columnWidth: '80%',
            }
        },
        dataLabels: {
            enabled: false,
        },
        yaxis: {
            labels: {
                show: true,
                style: {
                    colors: '#fff',
                },
                formatter: function (y) {
                    if (y >= 0) {
                        var final = '₹' + Math.abs(y.toFixed(2))
                    } else {
                        var final = '- ₹' + Math.abs(y.toFixed(2))
                    }
                    return final
                }
            }
        },
        xaxis: {
            type: 'Text',
            categories: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            labels: {
                show: true,
                style: {
                    colors: '#fff',
                }
            }
        },
        grid: {
            show: false
        }
    };

    apexchart = new ApexCharts(document.querySelector("#bar_chart_apexchart"), options);
    apexchart.render();

    var options_1 = {
        series: [{
            name: 'MTM Value',
            data: []
        }],
        chart: {
            type: 'bar',
            height: 300,
            toolbar: {
                show: false
            }
        },
        plotOptions: {
            bar: {
                colors: {
                    ranges: [{
                        from: 0,
                        to: 100000000,
                        color: '#7bdb7b'
                    }, {
                        from: -100000000,
                        to: 0,
                        color: '#fc5c5d'
                    }]
                },
                columnWidth: '80%',
            }
        },
        dataLabels: {
            enabled: false,
        },
        yaxis: {
            labels: {
                show: true,
                style: {
                    colors: '#fff',
                },
                formatter: function (y) {
                    if (y >= 0) {
                        var final = '₹' + Math.abs(y.toFixed(2))
                    } else {
                        var final = '- ₹' + Math.abs(y.toFixed(2))
                    }
                    return final
                }
            }
        },
        xaxis: {
            type: 'Text',
            categories: [],
            labels: {
                show: true,
                style: {
                    colors: '#fff',
                }
            }
        },
        grid: {
            show: false
        }
    };

    apexchart_Daily_PnL = new ApexCharts(document.querySelector("#barchart"), options_1);
    apexchart_Daily_PnL.render();

    // ------- Calendar HeatMap
    $("#CalendarHeatmap").CalendarHeatmap([], {
        months: 12,
        lastMonth: moment().month() + 1,
        lastYear: moment().year(),
        labels: {
            days: true,
            custom: {
                weekDayLabels: "dd"
            }
        },
        legend: {
            minLabel: "Max Loss",
            maxLabel: "Max Profit",
        },
        tooltips: {
            show: false
        },
    });
    resize_function()

    $("input[type='file']").on("change", function () {
        try {
            if (this.files[0].size > 2000000) {
                toast_function('warning', 'Please upload a file less than 2MB. Thanks!!')
                $(this).val('');
                return;
            }
        }
        catch (e) { logger.error("File Removed!"); return }


        var allowed_ext = ['jpg', 'png', 'jpeg']
        var curr_ext = $("#Image_input").val()
        curr_ext = curr_ext.split('.').pop();
        curr_ext = curr_ext.toLowerCase();
        logger.info("Extension:" + curr_ext)
        if (allowed_ext.includes(curr_ext)) {
            logger.info("Ext allowed")
        }
        else {
            toast_function("warning", "Please upload a image only!")
            $(this).val('');
        }

    });
});

$(window).on("resize", function () {
    resize_function()
});

$('.modal').on('shown.bs.modal', function () {
    $('html').css('overflow', 'hidden')
}).on('hidden.bs.modal', function () {
    $('html').attr('style', 'overflow-x:hidden !important; overflow-y:auto !important')
    $('body').css('overflow-x', 'clip')
});

$(document).on("click", ".ch-day", function () {
    let text = $(this).attr('data-title')
    const output1 = extractTimestamp(text)
    if (previous_timestamp != 0) {


        current_click_month = moment.unix(output1).format('MM')
        previous_click_month = moment.unix(previous_timestamp).format('MM')

        current_click_year = moment.unix(output1).format('YYYY')
        previous_click_year = moment.unix(previous_timestamp).format('YYYY')
        if (current_click_month != previous_click_month) {
            updateCalendar(output1)

            data_table.clear();
            data_table.rows.add(data_table_array);
            data_table.draw();

            filtered_x_axis1 = [];
            filtered_y_axis1 = [];
            for (let i = 0; i < x_axis1.length; i++) {
                const date = new Date(x_axis1[i]);
                const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Adding 1 to get the correct month value
                const year = (date.getFullYear()).toString() // Adding 1 to get the correct month value

                if (month === current_click_month && year == current_click_year) {
                    filtered_x_axis1.push(x_axis1[i]);
                    filtered_y_axis1.push(y_axis1[i]);
                }
            }
            apexchart_Daily_PnL.updateOptions({
                xaxis: {
                    type: 'Text',
                    categories: filtered_x_axis1,
                }
            })
            apexchart_Daily_PnL.updateSeries([{
                data: filtered_y_axis1
            }])

            filtered_x_axis = [];
            filtered_y_axis = [];
            var sum = 0;
            var cumulativeArray = [];
            for (var i = 0; i < filtered_y_axis1.length; i++) {
                sum += filtered_y_axis1[i];
                cumulativeArray.push(sum);
            }
            filtered_x_axis = filtered_x_axis1
            filtered_y_axis = cumulativeArray

            function addData(chart) {
                chart.data.labels = filtered_x_axis;
                chart.data.datasets.forEach((dataset) => {
                    dataset.data = filtered_y_axis;
                });
                chart.update();
            }
            addData(chart_1);
        }
    }
});


//---------------------------------- ONE month Calendar part -----------------------------------------//

$(function (e) {
    calendar = $("#calendar").calendarGC({
        dayBegin: 0,
        events: getHoliday(),
    });
});

const getHoliday = () => {
    var d = new Date();
    var totalDay = new Date(d.getFullYear(), d.getMonth(), 0).getDate();
    events = [];

    for (var i = 1; i <= totalDay; i++) {
        var newDate = new Date(d.getFullYear(), d.getMonth(), i);
        if (newDate.getDay() == 0) {   //if Sunday
            events.push({
                date: newDate,
                eventName: 'Sun',
                dateColor: "#ffbd5a",
            });
            events.push({
                date: newDate,
                eventName: 'Sun',
                dateColor: "#ffbd5a"
            });
        }

        if (newDate.getDay() == 6) {   //if Saturday
            events.push({
                date: newDate,
                eventName: 'Sat',
                dateColor: "#ffbd5a"
            });
            events.push({
                date: newDate,
                eventName: 'Sat',
                dateColor: "#ffbd5a"
            });
        }
    }
    return events;
}

const updateCalendar = (date) => {
    previous_timestamp = date

    const timestampMoment = moment.unix(date);
    const year = timestampMoment.year();
    const month = timestampMoment.month() + 1;

    monthResultArray = resultArray.filter(item => {
        const itemMoment = moment(item.date);
        return itemMoment.year() === year && itemMoment.month() + 1 === month;
    });

    events = []
    for (var i = 0; i < monthResultArray.length; i++) {
        var floatValue = parseFloat(monthResultArray[i]['count'])
        var symbol = floatValue >= 0 ? '₹' : '- ₹';
        floatValue = Math.abs(floatValue);
        var formattedValue = '';

        if (floatValue >= 10000000) {
            formattedValue = (floatValue / 10000000).toFixed(1) + 'Cr';
        } else if (floatValue >= 100000) {
            formattedValue = (floatValue / 100000).toFixed(1) + 'L';
        } else if (floatValue >= 1000) {
            formattedValue = (floatValue / 1000).toFixed(1) + 'k';
        } else {
            formattedValue = floatValue.toFixed(1);
        }

        var oldValueWithSymbol = parseFloat(monthResultArray[i]['count']) >= 0 ? '₹' + floatValue.toFixed(2) : '- ₹' + floatValue.toFixed(2);

        events.push({
            date: new Date(monthResultArray[i]['date']),
            eventName: `${symbol + formattedValue}`,
            className: `badge mtm_value`,
            dateColor: '#fff',
            titleName: `${oldValueWithSymbol}`
        })
        events.push({
            date: new Date(monthResultArray[i]['date']),
            eventName: `${monthResultArray[i]['no_of_trades']} Trades`,
            className: `badge`,
            dateColor: '#fff',
            titleName: `${monthResultArray[i]['no_of_trades']} Trades`
        })
    }

    var d = new Date(moment.unix(date).format('YYYY-MM-DD'));
    var totalDay = new Date(d.getFullYear(), d.getMonth(), 0).getDate();

    for (var i = 1; i <= totalDay; i++) {
        var newDate = new Date(d.getFullYear(), d.getMonth(), i);
        if (newDate.getDay() == 0) {   //if Sunday
            events.push({
                date: newDate,
                eventName: "Sun",
                className: `badge`,
                dateColor: "#ffbd5a"
            }); events.push({
                date: newDate,
                eventName: "Sun",
                className: `badge`,
                dateColor: "#ffbd5a"
            });
        }

        if (newDate.getDay() == 6) {   //if Saturday
            events.push({
                date: newDate,
                eventName: "sat",
                className: `badge`,
                dateColor: "#ffbd5a"
            }); events.push({
                date: newDate,
                eventName: "sat",
                className: `badge`,
                dateColor: "#ffbd5a"
            });
        }
    }

    calendar.setEvents(events);
    calendar.setDate(moment.unix(date).format('YYYY-MM-DD'));
    background_color_one_month_cal()
}

const background_color_one_month_cal = () => {
    var tdElements = document.querySelectorAll('td div.gc-event.badge.mtm_value');

    // Loop through each selected <div> element
    tdElements.forEach(function (divElement) {
        var tdElement = divElement.parentElement; // Get the parent <td> element
        var content = (divElement.textContent.trim()); // Parse content as a float

        content = content.replace(/[^0-9-]/g, '');


        if (!isNaN(content)) {
            if (content > 0) {
                tdElement.style.backgroundColor = '#7bdb7b'; // Set background color to green for positive numbers
            } else if (content < 0) {
                tdElement.style.backgroundColor = '#fc5c5d'; // Set background color to red for negative numbers
            }
        }
    });
}

$(document).on("click", ".slider1", function () {
    if ($('#checkbox1').is(':checked')) {
        $('.disable_color').css('color', '#9f9f9f');
        $('#select_range').css('color', '#9f9f9f');
        $('#all').css('color', '#fff');
        $('#Entry_date').attr('disabled', 'true');
        $('#Exit_date').attr('disabled', 'true');
    } else {
        $('.disable_color').css('color', '#fff');
        $('#select_range').css('color', '#fff');
        $('#all').css('color', '#9f9f9f');
        $('#Entry_date').removeAttr('disabled');
        $('#Exit_date').removeAttr('disabled');
    }
})

$(document).on("click", ".event", (e) => {
    data = e
    var text = data['currentTarget'].innerText
    var lines = text.split('\n');
    var Date = lines[0];
    var Month = moment.unix(previous_timestamp).format('MMM')
    var Year = moment.unix(previous_timestamp).format('YYYY')
    clicked_date = Month + ' ' + Date + ', ' + Year

    filteredArray = data_table_array.filter(function (item) {
        var dateTime = moment(item[2][0], "DD/MM/YY HH:mm");
        var datePart = dateTime.format("MMM D, YYYY");

        return datePart === clicked_date;
    });

    data_table.clear();
    data_table.rows.add(filteredArray);
    data_table.draw();
})

$(document).on("click", ".data_Table_1", () => {
    data_table.clear();
    data_table.rows.add(data_table_array);
    data_table.draw();
})

$(document).on("click", ".bar_chart", () => {
    function addData(chart) {
        chart.data.labels = x_axis;
        chart.data.datasets.forEach((dataset) => {
            dataset.data = y_axis;
        });
        chart.update();
    }
    addData(chart_1);

    apexchart_Daily_PnL.updateOptions({
        xaxis: {
            type: 'Text',
            categories: x_axis1,
        }
    })
    apexchart_Daily_PnL.updateSeries([{
        data: y_axis1
    }])
})


//-----------------------Modal form-------------------------//
$('.btn-close1').hover(
    function () {
        $(this).addClass('bg-white'); // Add class on mouseenter
    },
    function () {
        $(this).removeClass('bg-white'); // Remove class on mouseleave
    }
);

$(document).on("click", ".slider", function () {
    if ($('#checkbox').is(':checked')) {
        $('#long_text').css('color', '#fff');
        $('#short_text').css('color', '#fff');
        $('#exampleModal1 .modal-header').css('background-color', '#3caf39')
        $('#exampleModal1 .modal-footer').css('background-color', '#3caf39')
    } else {
        $('#long_text').css('color', '#fff');
        $('#short_text').css('color', '#fff');
        $('#exampleModal1 .modal-header').css('background-color', '#fc5c5d')
        $('#exampleModal1 .modal-footer').css('background-color', '#fc5c5d')
    }
})

$(document).on("click", "#add_trade", function () {
    $('#add_another_trade').removeClass().addClass('btn btn-secondary bg-faint d-none')
    $('#update_trade_submit').removeClass().addClass('btn btn-secondary bg-faint d-none')
    $('#add_trade_submit').removeClass().addClass('btn btn-secondary bg-faint')

    $('#exampleModal1 .modal-title').text('Add Trade Inputs:')
    $('#Image_input_row').show()

    $('#success_message').hide()
    $('#add_update_table').show()

    $('#exampleModal1 .modal-footer').css('background-color', '#3caf39')
    $('#exampleModal1 .modal-header').css('background-color', '#3caf39')
})

//------- character upto 300 only
var maxChars = 300;

$("textarea").on("input", function () {
    var $this = $(this);
    var remainingChars = maxChars - $this.val().length;

    if (remainingChars >= 0) {
        $this.siblings(".char-count").text(remainingChars + " characters remaining");
    } else {
        // Trim the content to the maximum limit
        $this.val($this.val().substring(0, maxChars));
        $this.siblings(".char-count").text("0 characters remaining");
    }
});




//---------- Trade Submit
document.querySelector("#add_trade_submit").addEventListener("click", () => {
    add_trade();
});

//---------- Trade View
document.querySelector("#view_trade_submit").addEventListener("click", () => {
    user_has_selected_range = true
    view_trade();
});

//---------- Trade Update
document.querySelector("#update_trade_submit").addEventListener("click", () => {
    update_trade_API(trade_id);
});

//---------- Show Individual Day
document.querySelector("#individual_day_curve").addEventListener("click", () => {
    $('#individual_day_curve').removeClass('gb_active').addClass('gb_active')
    $('#equity_curve').removeClass('gb_active')

    $('#show_hide_chart').removeClass().addClass('d-none')
    $('#show_hide_apexchart').removeClass()
});

//---------- Show Equity Curve
document.querySelector("#equity_curve").addEventListener("click", () => {
    $('#individual_day_curve').removeClass('gb_active')
    $('#equity_curve').removeClass('gb_active').addClass('gb_active')

    $('#show_hide_chart').removeClass()
    $('#show_hide_apexchart').removeClass().addClass('d-none')
});

//---------- Intersection Observer - MODAL CLOSE - (page will not go back to top)
$(document).on("click", ".Modal_Open", function () {
    scrollPosition = window.scrollY;
});

//------ Close the modal and restore scroll position
$(document).on("click", ".close_modal", function () {
    setTimeout(() => {
        window.scrollTo(0, scrollPosition);
    }, 350);

    $('#checkbox').prop('checked', false);
    $("input[type='datetime-local']").val("");
    $("input[type='text']").val("");
    $("input[type='number']").val("");
    $("input[type='file']").val("");
    $("textarea").val("");
    $('#exampleModal1 .modal-footer').css('background-color', '#3caf39')
    $('#exampleModal1 .modal-header').css('background-color', '#3caf39')

    $('#success_message').hide()
    $('#add_update_table').show()
    // $('#exampleModal1 .modal-title').css('color', '#f8f9fa !important')
    $('#exampleModal1 .modal-title').css('Add Trade Inputs')

    $('#add_trade_submit').removeClass().addClass('btn btn-secondary bg-faint')
    $('#update_trade_submit').removeClass().addClass('btn btn-secondary bg-faint d-none')
    $('#add_another_trade').removeClass().addClass('btn btn-secondary bg-faint d-none')
});

//-------- User won't able to select sat/sun & Time between 9:15 - 15:30 only

document.addEventListener("DOMContentLoaded", function () {
    const dateTimeInput = document.getElementById("Entry_date_time");

    dateTimeInput.addEventListener("input", function () {
        const selectedDate = new Date(dateTimeInput.value);
        const currentDate = new Date(); // Get the current date and time
        const selectedTime = selectedDate.getHours() * 100 + selectedDate.getMinutes();

        // Check if the selected date is in the future
        if (selectedDate > currentDate) {
            // Display an error message
            toast_function('warning', 'Please select a date and time in the past or present.')
            dateTimeInput.value = ""; // Clear the input value
        }
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const dateTimeInput1 = document.getElementById("Exit_date_time");

    dateTimeInput1.addEventListener("input", function () {
        const selectedDate = new Date(dateTimeInput1.value);
        const currentDate = new Date(); // Get the current date and time
        const selectedTime = selectedDate.getHours() * 100 + selectedDate.getMinutes();

        // Check if the selected date is in the future
        if (selectedDate > currentDate) {
            // Display an error message
            toast_function('warning', 'Please select a date and time in the past or present.')

            dateTimeInput1.value = ""; // Clear the input value
        }
    });
});

function validateInput(input) {
    const inputValue = input.value;

    // Use a regular expression to allow only digits and a single dot (.)
    const validInput = inputValue.replace(/[^0-9.]/g, "");

    // Split the valid input by dot (.)
    const parts = validInput.split(".");

    // If there is more than one dot, remove all dots except the first one
    if (parts.length > 2) {
        parts.splice(2);
    }

    // Join the parts back together with a single dot (.)
    const finalValue = parts.join(".");

    // Update the input field value with the valid input
    input.value = finalValue;
}

function validateInput1(input) {
    const inputValue = input.value;

    // Use a regular expression to allow only digits and a single dot (.)
    const validInput = inputValue.replace(/[^0-9]/g, "");

    // Split the valid input by dot (.)
    const parts = validInput.split(".");

    // If there is more than one dot, remove all dots except the first one
    if (parts.length > 2) {
        parts.splice(2);
    }

    // Join the parts back together with a single dot (.)
    const finalValue = parts.join(".");

    // Update the input field value with the valid input
    input.value = finalValue;
}

//-------- Delete Trade using Image Modal
document.querySelector("#delete_trade_button").addEventListener("click", () => {
    delete_trade(Delete_trade_button_id)
});

//-------- Edit Trade using Image Modal
$('#exampleModal4').on('show.bs.modal', function (event) {
    setTimeout(() => {
        $('#edit_trade_button').attr('onclick', `update_trade(${row_data[0]}, ${row_data[2]}, ${row_data[3]}, ${row_data[4]})`)
    }, 1000);
});

//------------- Add another trade
$(document).on("click", "#add_another_trade", function () {
    $('#success_message').hide()
    $('#add_update_table').show()
    // $('#exampleModal1 .modal-title').css('color', '#f8f9fa !important')
    $('#exampleModal1 .modal-title').css('Add Trade Inputs')
    $('#checkbox').prop('checked', false);
    $('#exampleModal1 .modal-footer').css('background-color', '#3caf39')
    $('#exampleModal1 .modal-header').css('background-color', '#3caf39')

    $('#add_trade_submit').removeClass().addClass('btn btn-secondary bg-faint')
    $('#update_trade_submit').removeClass().addClass('btn btn-secondary bg-faint d-none')
    $('#add_another_trade').removeClass().addClass('btn btn-secondary bg-faint d-none')
});

//------------- English Video 
$(document).on("click", "#english_language", function () {
    $('#coming_soon').hide()
    $('iframe').show()

    $('#english_language').removeClass('gb_active')
    $('#hindi_language').removeClass('gb_active')

    $('#english_language').addClass('gb_active')

    $('#video_container').removeClass().addClass('px-0 mt-3 video-container')
});

//------------- Hindi Video 
$(document).on("click", "#hindi_language", function () {
    $('#coming_soon').show()
    $('iframe').hide()

    $('#english_language').removeClass('gb_active')
    $('#hindi_language').removeClass('gb_active')

    $('#hindi_language').addClass('gb_active')

    $('#video_container').removeClass().addClass('px-0 mt-3 d-flex align-items-center justify-content-center')

    iframe = $('iframe')[0];
    player = new Vimeo.Player(iframe);
    player_one = player
    player.pause()
});

//------------- Hindi Video 
$(document).on("click", ".video_modal_close", function () {
    iframe = $('iframe')[0];
    player = new Vimeo.Player(iframe);
    player_one = player
    player.pause()
    player.setCurrentTime(0)
});

$(document).on("click", "#TradeBook_warning_message", function() {
    $("#exampleModal2").modal("show");
})