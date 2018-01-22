$(function () {

    // Create the close button
    var closebtn = $('<button/>', {
        type: "button",
        text: 'x',
        id: 'close-preview',
        style: 'font-size: initial;',
    });
    closebtn.attr("class", "close pull-right");
    // Set the popover default content
    // Clear event
    $('.image-preview-clear').click(function () {
        $('.image-preview').attr("data-content", "").popover('hide');
        $('.image-preview-filename').val("");
        $('.image-preview-clear').hide();
        $('.image-preview-input input:file').val("");
        $(".image-preview-input-title").text("Browse");
    });
    // Create the preview image
    $(".image-preview-input input:file").change(function (event) {
        var form = new FormData();
        form.append('file', event.target.files[0]);
        var file = this.files[0];
        var reader = new FileReader();
        // Set preview image into the popover data-content
        reader.onload = function (e) {
            $(".image-preview-input-title").text("Change");
            $(".image-preview-clear").show();
            $(".image-preview-filename").val(file.name);

        }
        reader.readAsDataURL(file);
        try {
            uploadFile(form);

        } catch ($exception) {
            $('#wrong_file_alert').css('display', 'block');
        }
    });

    function uploadFile(formdata) {
        $('#load_image').show();
        $.ajax({
            url: "https://file.io",
            type: "POST",
            data: formdata,
            contentType: false,
            cache: false,
            processData: false,
            success: function (data) {
                var json = JSON.stringify(eval("(" + data + ")"));
                var jsonObj = $.parseJSON('[' + data + ']');
                $('#load_image').hide();

                dbcontent(jsonObj[0].link)

            },

        });
    }

    function dbcontent(path) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', path, true);
        xhr.responseType = 'arraybuffer';

        xhr.onload = function (e) {
            try {

                var uInt8Array = new Uint8Array(this.response);
                var db = new SQL.Database(uInt8Array);
                var total = db.exec("SELECT roomID FROM messages");
                var room_0 = db.exec("SELECT roomID FROM messages WHERE roomID=0");
                var room_1 = db.exec("SELECT roomID FROM messages WHERE roomID=1");
                var room_2 = db.exec("SELECT roomID FROM messages WHERE roomID=2");
                var room_3 = db.exec("SELECT roomID FROM messages WHERE roomID=3");
                var room_4 = db.exec("SELECT roomID FROM messages WHERE roomID=4");
                updateElement($('#total'), total[0].values.length);
                updateElement($('#room_0'), room_0[0].values.length);
                updateElement($('#room_1'), room_1[0].values.length);
                updateElement($('#room_2'), room_2[0].values.length);
                updateElement($('#room_3'), room_3[0].values.length);
                updateElement($('#room_4'), room_4[0].values.length);
                // contents is now [{columns:['col1','col2',...], values:[[first row], [second row], ...]}]
            } catch ($exception) {
                $('#wrong_file_alert').css('display', 'block');
            }
        };
        xhr.send();
    }

    function feedMessagesInfo(data) {
        var total = contents.length;
    }

    function updateElement(element, valuep) {
        element.html(valuep);
    }

});