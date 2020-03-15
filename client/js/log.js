var host;
(function(){
    $.ajax({
        url: 'settings.json',
        async: false,
        dataType: 'json',
        success: function (response) {
            console.log(response.chat_host);
            host = response.chat_host;
        }
    });
	var roomID  = '5';
	var FBuid 	= 'admin';
	var username = "admin";
    var options = {
        transports: ['websocket'],
        'forceNew': true,
        'autoConnect': false
    };

    function selectRoom(){
        socket.emit('selectRoom',
            {
                room: 	roomID,
                userId: FBuid,
                userName: username,
                avatar: ''
            });
    }

    if(host===undefined){
        host = 'localhost:8080'
    }

	var socket 	= io(host);

	/*********************************************************************************
	* FAZER A CONNECAO COM O SERVIDOR NODE
	*********************************************************************************/
        socket.on('connect', function(){
	
		/*********************************************************************************
		* ADICIONAR UM UTILIZADOR A SALA
		*********************************************************************************/
		selectRoom();

	});

	socket.on('receiveLOG', function(data) {
        insertLog(data);
        //$('body').scrollTop($('#messages_list li').last().position().top + $('#messages_list li').last().height());
    });

    function insertLog(data){
        $('#log_list').append("<article class='timeline-entry'> <div class='timeline-entry-inner'> <div class='timeline-icon'> <i class='entypo-feather'></i> </div> <div class='timeline-label'> <h2><span>"+data.date+"</span></h2> <p>"+data.msg+"</p> </div> </div> </article>");
        var $target = $('html,body');
        $target.animate({scrollTop: $target.height()}, 1000);
    }
})();

function updateElement(element, text) {
    cleanElement(element);
    var textNode = document.createTextNode(text);
    element.appendChild(textNode)
}

function cleanElement(element) {
  element.empty();
}




