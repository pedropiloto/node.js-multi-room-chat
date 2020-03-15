var should = require('should');
var io = require('socket.io-client');

var socketURL = 'http://127.0.0.1:8080';

var options ={
    transports: ['websocket'],
    'force new connection': true
};

var chatUser1 = {'name':'Tom'};
var chatUser2 = {'name':'Sally'};
var chatUser3 = {'name':'Dana'};

describe("Chat Server",function(){
    it('Should broadcast new user to all users', function(done){
        var client1 = io.connect(socketURL, options);

        client1.on('connect', function(data){
            var info = {userId: 1,
                    room:   X1,
                    avatar: pppp}
            client1.emit('selectRoom', info);
        });
    });
});