var should = require('should');
var io = require('socket.io-client');

var socketURL = 'http://127.0.0.1:9090';
var expect = require('chai').expect;

var options = {
    transports: ['websocket'],
    'forceNew': true,
    'autoConnect': false
};

var c, io_server;
var so = require('socket.io');

var maxMessages = 20;

class chatFYI {
    /*********************************************************************************
     * INICIAR A VARIAVEIS
     *********************************************************************************/
    constructor() {
        this.roomsInfo = ['X1', 'X2', 'X3', 'X4', 'X5', 'X6'];

        this.rooms = [];

        this.initialize();
    }

    /*********************************************************************************
     * INICIALIZAR AS ROOMS
     *********************************************************************************/
    initialize() {
        for (var i = 0; i < this.roomsInfo.length; i++)
            this.rooms[this.roomsInfo[i]] = new room();
    }

    /*********************************************************************************
     * ADICIONAR MENSAGEM
     *********************************************************************************/
    setMessage(room, data) {
        if (this.rooms[room] != undefined)
            this.rooms[room].setMessage(data);
    }

    /*********************************************************************************
     * TODAS AS MENSAGENS DA ROOM
     *********************************************************************************/
    getAllMessages(room) {
        if (this.rooms[room] != undefined)
            return this.rooms[room].getAllMessages();

        return [];
    }

    reset() {
        this.initialize();
    }
}

class room {
    constructor() {
        this.message = [];
    }

    setMessage(data) {
        this.message.push(data);
        if (this.message.length > maxMessages)
            this.message.pop();
    }

    getAllMessages() {
        return this.message;
    }
}


function runChat() {
    var express = require('express');

    var app = express();
    var port = process.env.PORT || 9090;
    if (io_server == null) {
        io_server = so.listen(port);
    }
    c = new chatFYI();
console.log('ran')
    require('./../routes')(app, io_server, c);
}


describe("Chat Server", function () {
    it('Test messages in a room', function (done) {
        this.timeout(6000)
        runChat();
        var messagesToSend = 20;
        var clientsNumber = 3;
        var passed = false;

        var clients = []
        for (var i = 0; i < clientsNumber; i++)
            clients[i] = io.connect(socketURL, options);
        var chatUsers = []
        for (var i = 0; i < clientsNumber; i++) {
            chatUsers[i] = {userId: makeid(), room: c.roomsInfo[0]}
        }

        var message = {msg: 'Private Hello World'};

        var completeTest = function () {
            clients[0].emit('changeRoom', chatUsers[0]);

            clients[0].on('displayRoom', function (data) {
                data.messages.length.should.equal(messagesToSend);

                for (var i = 0; i < 3; i++) {
                    clients[i].disconnect();
                }
                if (passed != true) {
                    done();
                    passed = true;
                }
            });
        };

        var checkPrivateMessage = function (client) {
            client.on('receiveMSG', function (data) {

                if (client === clients[0]) {
                    console.log(" received msg: " + data.msg + " from: " + data.userID);
                    /* The first client has received the message
                     we give some time to ensure that the others
                     will not receive the same message. */
                    setTimeout(completeTest, 40);
                }
                ;
            });
        };

        clients[0].emit('selectRoom', chatUsers[0]);

        clients[0].on('connect', function (data) {
            checkPrivateMessage(clients[0]);
            clients[1].on('connect', function (data) {
                clients[1].emit('selectRoom', chatUsers[1]);
                checkPrivateMessage(clients[1]);
                clients[2].on('connect', function (data) {
                    clients[2].emit('selectRoom', chatUsers[2]);
                    checkPrivateMessage(clients[2]);
                    for (var i = 0; i < messagesToSend / 2; i++) {
                        clients[1].emit('sendMSG', message)
                    }
                    for (var i = 0; i < messagesToSend / 2; i++) {
                        clients[2].emit('sendMSG', message)
                    }
                });
            });
        });
    });
    it('Test messages in a room 2', function (done) {
        console.log("started");
        this.timeout(6000)
        runChat();
        var messagesToSend = 20;
        var clientsNumber = 3;
        var roomsNumber = 2;
        var passed = false;
        var j = 0;

        var clients = []
        for (var i = 0; i < clientsNumber; i++)
            clients[i] = io.connect(socketURL, options);
        var chatUsers = []
        for (var i = 0; i < clientsNumber; i++) {
            chatUsers[i] = {userId: makeid(), room: c.roomsInfo[randomIntFromInterval(0, roomsNumber - 1)]}
            clients[i].user = chatUsers[i];
        }

        var roomMessages = [];

        for (var i = 0; i < clientsNumber; i++) {
            roomMessages[chatUsers[i].room] = 0;
        }
        console.log(chatUsers[0].userId + " " + chatUsers[0].room + " " + roomMessages[chatUsers[0].room])
        console.log(chatUsers[1].userId + " " + chatUsers[1].room + " " + roomMessages[chatUsers[1].room])
        console.log(chatUsers[2].userId + " " + chatUsers[2].room + " " + roomMessages[chatUsers[2].room])
        var message = {msg: 'Private Hello World'};

        var completeTest = function (client) {
            clients[0].emit('changeRoom', client.user);

            clients[0].on('displayRoom', function (data) {
                var msgNumber = roomMessages[client.user.room]

                data.messages.length.should.equal(msgNumber);

                for (var i = 0; i < 3; i++) {
                    clients[i].disconnect(true);
                }
                if (passed != true) {
                    done();
                    passed = true;
                }
            });
        };

        var checkPrivateMessage = function (client) {
            client.on('receiveMSG', function (data) {


                    console.log(" received msg: " + data.msg + " from: " + data.userID);
                    /* The first client has received the message
                     we give some time to ensure that the others
                     will not receive the same message. */
                    setTimeout(completeTest(client), 40);
            });
        };
        for (var j = 0; j < clientsNumber; j++) {
            clients[j].on('connect', function (data) {
                this.emit('selectRoom', this.user);
                this.on('joinedRoom', function () {
                    console.log('joined room')
                    checkPrivateMessage(this);
                });
            });
        }


        for (var i = 0; i < messagesToSend / 2; i++) {
            clients[1].emit('sendMSG', message)
            roomMessages[chatUsers[1].room]++;
        }
        for (var i = 0; i < messagesToSend / 2; i++) {
            clients[2].emit('sendMSG', message)
            roomMessages[chatUsers[2].room]++;
        }
    });
});

function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
function makeid() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 5; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

function index(array, obj){
    for(var i = 0; i<array.length;i++){
        if(array[i]===obj){
            return i;
        }

    }

}

