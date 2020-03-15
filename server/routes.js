/*********************************************************************************
 * TRATAR DO ROUTES
 *********************************************************************************/
module.exports = function (app, io, c, fs, urlencodedParser) {

    var month = new Array();
    month[0] = "Jan";
    month[1] = "Feb";
    month[2] = "Mar";
    month[3] = "Abr";
    month[4] = "May";
    month[5] = "Jun";
    month[6] = "Jul";
    month[7] = "Aug";
    month[8] = "Set";
    month[9] = "Out";
    month[10] = "Nov";
    month[11] = "Dec";


    var chat = io.on('connection', function (socket) {
        socket.emit('connect');
        /*********************************************************************************
         * FAZER A LIGAÇÃO A UMA SALA
         *********************************************************************************/
        socket.on('selectRoom', function (data) {

            var old_room = socket.room;
            var new_room = data.room;
            /*********************************************************************************
             * PASSAR OS DADOS DO UTILIZADOR PARA O NDE
             *********************************************************************************/
            socket.userID = data.userId;
            socket.userName = data.userName;
            socket.room = new_room;
            socket.avatar = data.avatar;

            /*********************************************************************************
             * JUNTAR O UTILIZADOR A UMA SALA
             *********************************************************************************/

                socket.leave(old_room);
            sendRoomStatus(old_room);

            socket.room = new_room;
            socket.join(new_room);
            sendRoomStatus(new_room);


            /*********************************************************************************
             * ENVIAR A INFORMAÇÃO DA SALA PARA O UTILIZADOR
             *********************************************************************************/
            socket.emit('joinedRoom');

            console.log("------------------------------------------------------------------------------");
            var str = socket.userID + " with userName: " + socket.userName + " joined room " + c.roomsNames[socket.room] + " with avatar: " + socket.avatar;
            console.log(str);
            console.log("------------------------------------------------------------------------------");
            var p = new Date();
            var log = {
                msg: str,
                date: personalizeDate(p)
            }
            sendLog(log);



            socket.emit('displayRoom', {messages: c.getAllMessages(socket.room)});
        });


        /*********************************************************************************
         * ALTERAR A ROOM DO UTILIZADOR
         *********************************************************************************/
        socket.on('changeRoom', function (data) {

            /*********************************************************************************
             * TROCAR A ROOM
             *********************************************************************************/
            socket.leave(socket.room);
            sendRoomStatus(socket.room);

            socket.room = data.room;
            socket.join(data.room);

            sendRoomStatus(socket.room);

            /*********************************************************************************
             * ENVIAR A INFORMAÇÃO DA SALA PARA O UTILIZADOR
             *********************************************************************************/

            socket.emit('joinedRoom');

            console.log("------------------------------------------------------------------------------");
            console.log(socket.userID + " with userName: " + socket.userName + " joined room " + c.roomsNames[socket.room] + " with avatar: " + socket.avatar);
            console.log("------------------------------------------------------------------------------");

            socket.emit('displayRoom', {messages: c.getAllMessages(socket.room)});

            console.log('CHANGE ROOM: ' + socket.userID);
        });

        /*********************************************************************************
         * DISCONNECTAR O UTILIZADOR
         *********************************************************************************/
        socket.on('disconnect', function () {

            socket.leave(socket.room);

            var str = 'USER LEAVE: ' + socket.userID;
            console.log(str);
            var p = new Date();
            var log = {
                msg: str,
                date: personalizeDate(p)
            }
            sendLog(log);
        });

        /*********************************************************************************
         * RECEBER MENSAGEM
         *********************************************************************************/
        socket.on('sendMSG', function (data) {
            if (data.room != undefined) {
                socket.leave(socket.room);
                socket.room = data.room;
                socket.join(data.room);

            }
            var isBlackListed = c.filterMessage(data.msg);
            var str;
            if (isBlackListed) {
                str = 'Message BLOCKED : ' + socket.userID + " " + socket.userName + " : " + data.msg + " to ROOM: " + c.roomsNames[socket.room];
            } else {
                str = 'Message sent by : ' + socket.userID + " " + socket.userName + " : " + data.msg + " to ROOM: " + c.roomsNames[socket.room];
            }
            console.log(str);
            var p = new Date();
            var d = {
                msg: data.msg,
                userID: socket.userID.toString(),
                userName: socket.userName,
                img: socket.avatar,
                date: personalizeDate(p),
                room: socket.room
            }
            var log = {
                msg: str,
                date: personalizeDate(p)
            }
            sendLog(log);
            if (!isBlackListed) {
                c.setMessage(socket.room, d);
                socket.broadcast.to(socket.room).emit('receiveMSG', d);
                socket.emit('receiveMSG', d);
            } else {
                socket.emit('messageBlocked');
            }

        });
    });

    function personalizeDate(date) {

        var hours = ('0' + date.getHours()).slice(-2);
        var mins = ('0' + date.getMinutes()).slice(-2);

        return date.getDate() + " " + month[date.getMonth()] + "  " + hours + ":" + mins;
    }

    function sendLog(data) {
        io.sockets.in('5').emit('receiveLOG', data);
    }

    function sendRoomStatus(roomID) {
        var room = io.sockets.adapter.rooms[roomID] || {};
        var numSocketsInRoom = Object.keys(room).length;
        var roomStatus = {
            roomID: roomID,
            number: numSocketsInRoom
        }

        io.sockets.in('5').emit('receiveRoomStatus', roomStatus);
    }

    app.get('/blackList', function (req, res) {
        var obj = JSON.parse(fs.readFileSync(c.filteredWordsFile, 'utf8'));
        res.send(JSON.stringify(obj));
    })

    app.post('/blackList', urlencodedParser, function (req, res) {
        try {
            var obj = JSON.parse(fs.readFileSync(c.filteredWordsFile, 'utf8'));
            var word = req.body.word;
            obj.push({'word': word});
            fs.writeFile(c.filteredWordsFile, JSON.stringify(obj), function (err) {
                if (err) return console.log(err);
            });
            response = {
                'status': 'OK',
                'word': word
            };
            var log = {
                msg: "Added " + word + " to BlackList",
                date: personalizeDate(new Date())
            }
            sendLog(log);
            res.end(JSON.stringify(obj));
        }catch($exception){
            var log = {
                msg: "ERROR adding " + word + " to BlackList",
                date: personalizeDate(new Date())
            }
            sendLog(log);
        }
    });

};