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



    var roomID  = '0';
	var FBuid 	= Math.floor((Math.random() * 100000) + 1);
	var username = "pppp"+FBuid;
	var img = "";
	var avatar = 'img/avatar.svg';
    var options = {
        transports: ['websocket'],
        'forceNew': true,
        'autoConnect': false
    };

    var chat_room = document.getElementsByClassName('chat-room');
    var messages_list = $('#messages_list');
    var messageInput = $('#messageInput');
    var sendButton = $('#sendButton');
cleanMessages();
    $('.chat-room').on('click',function () {
        roomID = this.getAttribute('chat_id');
        selectRoom();
    });
    sendButton.on('click',function () {
       var message = messageInput.val();
        socket.emit('sendMSG',{
            msg: message
        });
    messageInput.empty();
    });

    $('#changeUser').on('click',function () {

                username =  $('#username_input').val();
                img = $('#avatar_input').val();
                selectRoom();
    })

    function selectRoom(){
        socket.emit('selectRoom',
            {
                room: 	roomID,
                userId: FBuid,
                userName: username,
                avatar: img
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

	socket.on('displayRoom', function(data) {
	    cleanMessages();
		for(var i=0;i<data.messages.length;i++) {
            insertMessage(data.messages[i]);
        }
	});

	socket.on('receiveMSG', function(data) {
	    console.log('received message:' + JSON.stringify(data));
        insertMessage(data);
        $('body').scrollTop($('#messages_list li').last().position().top + $('#messages_list li').last().height());
    });

    socket.on('messageBlocked', function(data) {
        console.log("Message Blocked");
    });

    function insertMessage(data){
        messages_list.append("<li class='left clearfix'> <span class='chat-img1 pull-left'> <img src='"+data.img+"' alt='User Avatar' class='img-circle userAvatar'> <p style='font-size:12px;'>"+data.userName+"</p></span> <div class='chat-body1 clearfix'> <p>"+data.msg+"</p> <div class='chat_time pull-right'>"+data.date+"</div> </div> </li>");
    default_avatar();
	}
	function cleanMessages(){
        cleanElement(messages_list);
    }

    function default_avatar(){
        $(".userAvatar").each(function() {
            var src = this.getAttribute('src');
            this.onerror = function(){
                this.setAttribute('src', avatar);
            }
            if(src==="" || src===null){
                this.setAttribute('src', avatar);
            }
            if(src==="empty" || src===null){
                this.setAttribute('src', avatar);
            }

        });

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




