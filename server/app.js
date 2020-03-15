/*********************************************************************************
 * DataBase and Rooms to create
 *********************************************************************************/
var online = true;
var maxMessagesPerRoom = 100;
var fs = require('fs');
var blackListWordsFile = 'forbidden.json';
var default_port = 9090;



/*********************************************************************************
 * TRATAMENTO DO CHAT DA FYI
 *********************************************************************************/
class chatFYI {
    /*********************************************************************************
     * INICIAR A VARIAVEIS
     *********************************************************************************/
    constructor() {
        this.roomsInfo = ['0', '1', '2', '3', '4', '5'];
        this.roomsNames = ['Room 1', 'Room 2', 'Room 3', 'Room 4', 'Room 5', 'Room 6']

        this.rooms = [];
        this.dbName = 'chat.db';
        this.filteredWordsFile = blackListWordsFile;
        this.filteredMessage = '****';
        this.initialize();
    }

    /*********************************************************************************
     * INICIALIZAR AS ROOMS
     *********************************************************************************/
    initialize() {
        for (var i = 0; i < this.roomsInfo.length; i++)
            this.rooms[this.roomsInfo[i]] = new room();
        this.initializeDB();
    }

    initializeDB() {
        this.createTableMessages();
        this.feedMessagesTable();
        this.getMessagesFromRoomFromDB('0');
    }

    createTableMessages() {
        var sqlite = require('sqlite-sync');
        sqlite.connect(this.dbName);
        sqlite.run("CREATE TABLE IF NOT EXISTS MESSAGES(id  INTEGER PRIMARY KEY AUTOINCREMENT,msg TEXT, userID TEXT, userName TEXT, roomID TEXT, img TEXT, date TEXT);", function (res) {
        });
        sqlite.close();
    }

    feedMessagesTable() {
        var sqlite = require('sqlite-sync'); //requiring
        sqlite.connect(this.dbName);
        var rows = sqlite.run("SELECT id, msg, userID, userName, roomID, img, date FROM MESSAGES ORDER BY id DESC LIMIT " + "100");
        rows = rows.reverse();
        for (var i = 0; i < rows.length; i++) {
            var data = {
                msg: rows[i].msg,
                userID: rows[i].userID,
                userName: rows[i].userName,
                img: rows[i].img,
                date: rows[i].date,
                room: rows[i].roomID
            }
            if (this.rooms[rows[i].roomID] != undefined)
                this.rooms[rows[i].roomID].setMessage(data);
        }
        sqlite.close();

    }

    insertMessage(msg, userId, userName, roomId, img, date) {
        var msgs = this.getMessagesFromRoomFromDB(roomId);
        var sqlite = require('sqlite-sync');
        sqlite.connect(this.dbName);
        /*if (msgs.length > maxMessagesPerRoom) {
         sqlite.run("DELETE FROM MESSAGES WHERE id IN (SELECT min(id) FROM MESSAGES WHERE roomID='" + roomId + "')");
         }*/
        sqlite.runAsync("Insert into MESSAGES (msg,userID,userName,roomID,img,date) Values('" + msg + "','" + userId + "','" + userName + "','" + roomId + "','" + img + "','" + date + "')", function (id) {
        });
    }

    getMessagesFromRoomFromDB(room) {
        var sqlite = require('sqlite-sync'); //requiring
        sqlite.connect(this.dbName);
        var rows = sqlite.run("SELECT id, msg, userID, userName, roomID, img, date FROM MESSAGES WHERE roomID='" + room + "'");
        sqlite.close();
        return rows;
    }


    /*********************************************************************************
     * ADICIONAR MENSAGEM
     *********************************************************************************/
    setMessage(room, data) {
        if (this.rooms[room] != undefined)
            this.rooms[room].setMessage(data);
        if (online) {
            this.insertMessage(data.msg, data.userID, data.userName, room, data.img, data.date)
        }
    }

    /*********************************************************************************
     * TODAS AS MENSAGENS DA ROOM
     *********************************************************************************/
    getAllMessages(room) {

        if (this.rooms[room] != undefined)
            return this.rooms[room].getAllMessages();

        return [];
    }

    filterMessage(message) {
        var obj = JSON.parse(fs.readFileSync(this.filteredWordsFile, 'utf8'));
        for (var i in obj) {
            if (message.toLocaleLowerCase().includes(obj[i].word.toLowerCase())) {
                return true;
            }
        }
        return false;

    }
}

class room {
    constructor() {
        this.message = [];
    }

    setMessage(data) {
        this.message.push(data);
        if (this.message.length > maxMessagesPerRoom)
            this.message.shift();
    }

    getAllMessages() {
        var array =  [];
        //for(var i)
        return this.message;
    }
}

/*********************************************************************************
 * INCLUDES
 *********************************************************************************/
try {
    var args = process.argv.slice(2);
    var port;
    port = args[0];
    if (args[0] === undefined) {
        port = default_port;
    }

    var express = require('express');
    const bodyParser = require('body-parser')


    var app = express();
    var urlencodedParser = bodyParser.urlencoded({ extended: false })
    app.use(express.static('public'));


    var port = process.env.PORT || port;

    var io = require('socket.io').listen(app.listen(port));
    var c = new chatFYI();
    require('./routes')(app, io, c, fs, urlencodedParser);
    console.log('running on port ' + port);


} catch ($exception) {

}

function exists(room, roomArray) {
    for (var i = 0; i < roomArray.length; i++) {
        if (roomArray[i].name === room) {
            return true;
        }
    }
    return false;
}

