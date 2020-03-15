var host;
var room_0 = 0,room_1 = 0,room_2 = 0,room_3 = 0,room_4 = 0;
(function () {
    $.ajax({
        url: 'settings.json',
        async: false,
        dataType: 'json',
        success: function (response) {
            console.log(response.chat_host);
            host = response.chat_host;
        }
    });
    var roomID = '5';
    var FBuid = 'room_status';
    var username = "room_status";
    var options = {
        transports: ['websocket'],
        'forceNew': true,
        'autoConnect': false
    };

    function selectRoom() {
        socket.emit('selectRoom',
            {
                room: roomID,
                userId: FBuid,
                userName: username,
                avatar: ''
            });
    }

    if (host === undefined) {
        host = 'localhost:8080'
    }

    var socket = io(host);

    /*********************************************************************************
     * FAZER A CONNECAO COM O SERVIDOR NODE
     *********************************************************************************/
    socket.on('connect', function () {

        /*********************************************************************************
         * ADICIONAR UM UTILIZADOR A SALA
         *********************************************************************************/
        selectRoom();

    });

    socket.on('receiveRoomStatus', function (data) {
        //console.log('received RoomStatus:' + JSON.stringify(data));
        switch (data.roomID) {
            case '0':
                room_0 = Number(data.number);
                updateElement($('#room_0'), room_0)
                break;
            case '1':
                room_1 = Number(data.number);
                updateElement($('#room_1'), room_1);
                break;
            case '2':
                room_2 = Number(data.number);
                updateElement($('#room_2'), room_2);
                break;
            case '3':
                room_3 = Number(data.number)
                updateElement($('#room_3'), room_3);
                break;
            case '4':
                room_4 = Number(data.number);
                updateElement($('#room_4'), room_4);
                break;
            default:
                console.log("error");
        }

        updateTotal();

    });

    function updateTotal(){
        var total = parseInt(room_0)+parseInt(room_1)+parseInt(room_2)+parseInt(room_3)+parseInt(room_4);
        updateElement($('#total'), total);

    }


    function insertLog(data) {
        $('#log_list').append("<article class='timeline-entry'> <div class='timeline-entry-inner'> <div class='timeline-icon'> <i class='entypo-feather'></i> </div> <div class='timeline-label'> <h2><span>" + data.date + "</span></h2> <p>" + data.msg + "</p> </div> </div> </article>");
        var $target = $('html,body');
        $target.animate({scrollTop: $target.height()}, 1000);
    }
})();

function updateElement(element, valuep) {
    element.html(valuep);
}




