//---------- Blog Descriptions
let editorinstance;

CKEDITOR.ClassicEditor.create(document.getElementById("editor"), {
    // https://ckeditor.com/docs/ckeditor5/latest/features/toolbar/toolbar.html#extended-toolbar-configuration-format
    toolbar: {
        items: [
            'exportPDF', 'exportWord', '|',
            'findAndReplace', 'selectAll', '|',
            'heading', '|',
            'bold', 'italic', 'strikethrough', 'underline', 'code', 'subscript', 'superscript', 'removeFormat', '|',
            'bulletedList', 'numberedList', 'todoList', '|',
            'outdent', 'indent', '|',
            'undo', 'redo',
            '-',
            'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor', 'highlight', '|',
            'alignment', '|',
            'link', 'insertImage', 'blockQuote', 'insertTable', 'mediaEmbed', 'codeBlock', 'htmlEmbed', '|',
            'specialCharacters', 'horizontalLine', 'pageBreak', '|',
            'textPartLanguage', '|',
            'sourceEditing'
        ],
        shouldNotGroupWhenFull: true
    },
    // Changing the language of the interface requires loading the language file using the <script> tag.
    // language: 'es',
    list: {
        properties: {
            styles: true,
            startIndex: true,
            reversed: true
        }
    },
    // https://ckeditor.com/docs/ckeditor5/latest/features/headings.html#configuration
    heading: {
        options: [
            { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
            { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
            { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
            { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
            { model: 'heading4', view: 'h4', title: 'Heading 4', class: 'ck-heading_heading4' },
            { model: 'heading5', view: 'h5', title: 'Heading 5', class: 'ck-heading_heading5' },
            { model: 'heading6', view: 'h6', title: 'Heading 6', class: 'ck-heading_heading6' }
        ]
    },
    // https://ckeditor.com/docs/ckeditor5/latest/features/editor-placeholder.html#using-the-editor-configuration
    placeholder: 'Welcome to CKEditor 5!',
    // https://ckeditor.com/docs/ckeditor5/latest/features/font.html#configuring-the-font-family-feature
    fontFamily: {
        options: [
            'default',
            'Arial, Helvetica, sans-serif',
            'Courier New, Courier, monospace',
            'Georgia, serif',
            'Lucida Sans Unicode, Lucida Grande, sans-serif',
            'Tahoma, Geneva, sans-serif',
            'Times New Roman, Times, serif',
            'Trebuchet MS, Helvetica, sans-serif',
            'Verdana, Geneva, sans-serif'
        ],
        supportAllValues: true
    },
    // https://ckeditor.com/docs/ckeditor5/latest/features/font.html#configuring-the-font-size-feature
    fontSize: {
        options: [10, 12, 14, 'default', 18, 20, 22],
        supportAllValues: true
    },
    // Be careful with the setting below. It instructs CKEditor to accept ALL HTML markup.
    // https://ckeditor.com/docs/ckeditor5/latest/features/general-html-support.html#enabling-all-html-features
    htmlSupport: {
        allow: [
            {
                name: /.*/,
                attributes: true,
                classes: true,
                styles: true
            }
        ]
    },
    // Be careful with enabling previews
    // https://ckeditor.com/docs/ckeditor5/latest/features/html-embed.html#content-previews
    htmlEmbed: {
        showPreviews: true
    },
    // https://ckeditor.com/docs/ckeditor5/latest/features/link.html#custom-link-attributes-decorators
    link: {
        decorators: {
            addTargetToExternalLinks: true,
            defaultProtocol: 'https://',
            toggleDownloadable: {
                mode: 'manual',
                label: 'Downloadable',
                attributes: {
                    download: 'file'
                }
            }
        }
    },
    // https://ckeditor.com/docs/ckeditor5/latest/features/mentions.html#configuration
    mention: {
        feeds: [
            {
                marker: '@',
                feed: [
                    '@apple', '@bears', '@brownie', '@cake', '@cake', '@candy', '@canes', '@chocolate', '@cookie', '@cotton', '@cream',
                    '@cupcake', '@danish', '@donut', '@dragée', '@fruitcake', '@gingerbread', '@gummi', '@ice', '@jelly-o',
                    '@liquorice', '@macaroon', '@marzipan', '@oat', '@pie', '@plum', '@pudding', '@sesame', '@snaps', '@soufflé',
                    '@sugar', '@sweet', '@topping', '@wafer'
                ],
                minimumCharacters: 1
            }
        ]
    },
    // The "super-build" contains more premium features that require additional configuration, disable them below.
    // Do not turn them on unless you read the documentation and know how to configure them and setup the editor.
    removePlugins: [
        // These two are commercial, but you can try them out without registering to a trial.
        // 'ExportPdf',
        // 'ExportWord',
        'CKBox',
        'CKFinder',
        'EasyImage',
        // This sample uses the Base64UploadAdapter to handle image uploads as it requires no configuration.
        // https://ckeditor.com/docs/ckeditor5/latest/features/images/image-upload/base64-upload-adapter.html
        // Storing images as Base64 is usually a very bad idea.
        // Replace it on production website with other solutions:
        // https://ckeditor.com/docs/ckeditor5/latest/features/images/image-upload/image-upload.html
        // 'Base64UploadAdapter',
        'RealTimeCollaborativeComments',
        'RealTimeCollaborativeTrackChanges',
        'RealTimeCollaborativeRevisionHistory',
        'PresenceList',
        'Comments',
        'TrackChanges',
        'TrackChangesData',
        'RevisionHistory',
        'Pagination',
        'WProofreader',
        // Careful, with the Mathtype plugin CKEditor will not load when loading this sample
        // from a local file system (file://) - load this site via HTTP server if you enable MathType.
        'MathType',
        // The following features are part of the Productivity Pack and require additional license.
        'SlashCommand',
        'Template',
        'DocumentOutline',
        'FormatPainter',
        'TableOfContents'
    ]
}).then((editor) => {
    editorinstance = editor;
    logger.info("CKEditor initialized successfully");
}).catch((error) => {
    logger.error(error);
});


//---------- Add Signal
function getBase64(file, callback) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function () {
        callback(reader.result);
    };
    reader.onerror = function (error) {
        logger.error('Error converting image to base64:', error);
    };
}

const add_signal = () => {
    var text = editorinstance.getData();
    var Image = $("#Image_input").val()

    // input validation
    if (text == "" && Image == "") {
        toast_function('warning', 'Please Enter all fields!')
        return;
    }

    let imageInput = $('#Image_input')[0].files[0];

    if (imageInput) {
        getBase64(imageInput, function (base64Image) {
            Base_64_string = base64Image;
        });
    } else {
        Base_64_string = '';
    }

    setTimeout(() => {
        var formData = new FormData();
        formData.append('text', text);
        formData.append('link', Base_64_string);

        $.ajax({
            type: "POST",
            url: root + main_route + '/insert_signal',
            data: formData,
            processData: false, // tell jQuery not to process the data
            contentType: false, // tell jQuery not to set contentType
            success: function (data) {
                if (data == "success") {
                    toast_function('success', 'Signal Uploaded Successfully!')

                    Fetch_All_Signal()
                    $(':input').val('');
                    editorinstance.setData("");
                    $('#submit').show()
                }
                else {
                    // alert("Unable to upload Signal")
                    toast_function('danger', 'Unable to upload Signal')
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
            }
        })
    }, 500);
};


//---------- Delete Signal
const del_signal = (ts) => {

    delete_signal_id = ts

};

const confirm_yes = () => {
    $('#delete_signal_close').click()
    Yes_button_Clicked = true
    if (Yes_button_Clicked) {
        Yes_button_Clicked = false

        $.post(
            root + main_route + "/delete_signal",
            { timestamp: delete_signal_id },
            function (data, status) {
                if (data == "success") {
                    toast_function('success', 'Signal deleted Successfully!')
                    logger.info("Data: " + data + "\nStatus: " + status);
                    Fetch_All_Signal();
                    $(":input").val("");
                    editorinstance.setData("");
                    $("#submit").show();
                }

            }
        ).fail(function (response) {
            logger.error("Error: " + response);
        });

    }
}


//---------- Fetch All Signal
const Fetch_All_Signal = () => {
    $.post(root + main_route + "/get_signal", function (data, status) {
        All_signal = JSON.parse(JSON.stringify(data));
        for (var i = 0; i < (All_signal.length); i++) {
            // data pre preprocessing
            let ts = All_signal[i][0];
            let user = All_signal[i][1]
            let Image = All_signal[i][2]
            let text = All_signal[i][3]
            All_signal[i][0] = moment.unix(All_signal[i][0]).format("DD-MMM HH:mm A");
            All_signal[i][1] = user;
            All_signal[i][2] = `<div class="w-100" style="cursor:pointer"><a href="#" data-toggle="tooltip" title="${text}">${shorten(text)}</div>`
            All_signal[i][3] = Image;
            var str =
                `<button class="m-2 Modal_Open" data-bs-toggle="modal" data-bs-target="#exampleModal3" onclick="del_signal('${ts}')">&nbsp;Delete&nbsp;</button>`;
            All_signal[i][4] = str;
        }
        if (All_signal) {
            if (counter_for_datatable == 0) {
                counter_for_datatable += 1;
                datatable = $("#signalDatatable").DataTable({
                    paging: true,
                    pageLength: 50,
                    info: false,
                    scrollX: true,
                    scrollY: 550,
                    order: false
                });
            }
            datatable.clear();
            datatable.rows.add(All_signal);
            datatable.draw();
        }
    }).fail(function (response) {
        logger.error("Error: " + response);
    });
};



//---------- Blog Submit
document.querySelector("#submit").addEventListener("click", () => {
    add_signal();
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

    Fetch_All_Signal();

    $("input[type='file']").on("change", function () {
        try {
            if (this.files[0].size > 15000000) {
                toast_function('warning', 'Please upload a file less than 15MB. Thanks!!')
                $(this).val('');
                return;
            }
        }
        catch (e) { logger.error("File Removed!"); return }

        var allowed_ext = ['jpg', 'png', 'jpeg', 'svg', 'webp', 'JPG', 'PNG', 'JPEG', 'SVG', 'WEBP', 'mp4', 'webm', 'mkv']
        var curr_ext = $("#Image_input").val()
        curr_ext = curr_ext.split('.').pop();
        curr_ext = curr_ext.toLowerCase();
        logger.info("Extension:" + curr_ext)
        if (allowed_ext.includes(curr_ext)) {
            logger.info("Ext allowed")
        }
        else {
            toast_function("warning", "Please upload a image and video only!")
            $(this).val('');
        }
    });

    $("#signalDatatable tbody").on("click", "td", function () {
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