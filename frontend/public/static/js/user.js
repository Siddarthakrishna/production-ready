//---------- Add Member
const add_member = () => {
    var email = $("#email_input").val();
    var role = $('input[type="radio"]:checked').val();
    var data_dict = {};

    // input validation
    if (email == "") {
        toast_function('warning', 'Please Enter all fields!')
        return;
    }

    if ($("#p1").is(":checked")) { p1_value = 1 } else { p1_value = 0 }
    if ($("#p2").is(":checked")) { p2_value = 1 } else { p2_value = 0 }
    if ($("#p3").is(":checked")) { p3_value = 1 } else { p3_value = 0 }
    if ($("#p4").is(":checked")) { p4_value = 1 } else { p4_value = 0 }
    if ($("#idx").is(":checked")) { idx_value = 1 } else { idx_value = 0 }
    if ($("#mf").is(":checked")) { mf_value = 1 } else { mf_value = 0 }

    data_dict = {
        'p1': p1_value,
        'p2': p2_value,
        'p3': p3_value,
        'p4': p4_value,
        'idx': idx_value,
        'mf': mf_value
    };

    data = JSON.stringify(data_dict);

    $.post(
        root + main_route + "/insert_replace_user",
        { email: email, role: role, access: data },
        function (data, status) {
            logger.info("Data: " + data + "\nStatus: " + status);
            if (data == "success") {
                toast_function('success', 'User added Successfully!')
                Fetch_All_Members();
                $("#email_input").val("");
                $("#submit").show();
            } else {
                toast_function('danger', 'Unable to add User')
            }
        }
    ).fail(function (response) {
        logger.error("Error: " + response);
    });
};


//---------- Delete Member
const del_member = (email) => {
    delete_user_email = email
};

const confirm_yes = () => {
    $('#delete_user_close').click()
    Yes_button_Clicked = true
    if (Yes_button_Clicked) {
        Yes_button_Clicked = false

        $.post(
            root + main_route + "/delete_user",
            { email: delete_user_email },
            function (data, status) {
                if (data == "success") {
                    toast_function('success', 'User deleted Successfully!')
                    logger.info("Data: " + data + "\nStatus: " + status);
                    Fetch_All_Members();
                    $("#email_input").val("");
                    $("#submit").show();
                }

            }
        ).fail(function (response) {
            logger.error("Error: " + response);
        });
    }
}


//---------- Fetch All Member
const Fetch_All_Members = () => {
    $.post(root + main_route + "/get_tredcode_users", function (data, status) {
        All_Member = JSON.parse(JSON.stringify(data));
        for (var i = 0; i < All_Member.length; i++) {
            // data pre preprocessing
            let ts = All_Member[i][0];
            let email = All_Member[i][1];
            let roles = All_Member[i][2];
            let access = All_Member[i][3];
            All_Member[i][0] = moment.unix(All_Member[i][0]).format("DD-MMM HH:mm A");
            All_Member[i][1] = email;
            All_Member[i][2] = roles;
            All_Member[i][3] = shorten(access);
            var str =
                `<button class="m-2 Modal_Open" data-bs-toggle="modal" data-bs-target="#exampleModal3" onclick="del_member('${email}')">&nbsp;Delete&nbsp;</button>`;
            All_Member[i][4] = str;
        }
        if (All_Member) {
            if (counter_for_datatable == 0) {
                counter_for_datatable += 1;
                datatable = $("#userDatatable").DataTable({
                    paging: true,
                    pageLength: 50,
                    info: false,
                    scrollX: true,
                    scrollY: 550,
                    order: false,
                });
            }
            datatable.clear();
            datatable.rows.add(All_Member);
            datatable.draw();
        }
    }).fail(function (response) {
        logger.error("Error: " + response);
    });
};



//---------- Blog Submit
document.querySelector("#submit").addEventListener("click", () => {
    add_member();
});



//---------- Shorten Function
const shorten = (text, length = 75) => {
    if (text == null) {
        return "";
    }
    if (text.length <= length) {
        return text;
    }
    temp.push(text);
    text = text.substring(0, length);
    return text + "...";
};



//---------- Show_Hide Table
const show_hide = () => {
    counter_for_show_hide += 1;
    if (counter_for_show_hide % 2 == 0) {
        $('.wrapper_1_button').text('Hide')
        $('#table_datatable').show()
    }
    else {
        $('.wrapper_1_button').text('Show')
        $('#table_datatable').hide()
    }
}




//---------- On Ready - Refresh
$(document).ready(function () {

    $.ajaxSetup({ async: false }); // to stop async

    $("#submit").show();

    scrollPosition = 0;
    Yes_button_Clicked = false

    counter_for_datatable = 0;
    counter_for_show_hide = 0;
    temp = [];

    Fetch_All_Members();

    $("#userDatatable tbody").on("click", "td", function () {
        var cell = $(this);
        var text = cell.text();

        if (
            cell.children().length === 0 &&
            cell.contents().length === 1 &&
            cell.contents()[0].nodeType === Node.TEXT_NODE
        ) {

            navigator.clipboard
                .writeText(text)
                .then(() => {
                    logger.info("Text copied to clipboard: " + text);
                    toast_function('success', 'Text copied to clipboard')
                })
                .catch((err) => {
                    logger.error("Failed to copy text: " + err);
                    toast_function('danger', 'Failed to copy text')
                });
        }
    });

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
});