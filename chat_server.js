var socketio = require('socket.io');
var io;
var guestNumber = 1;
var nickNames = {};
var currRooms = {};
var rooms = ['Lobby'];

exports.listen = function(server) {
	io = socketio(server);

	io.on('connection', (socket) => {
		changeNick(socket, null, nickNames);		
		changeRoom(socket, null, currRooms);

		socket.on('Chat', (data) => {
			socket.in(currRooms[socket.id]).emit('Chat', {msg: data.msg, nick: nickNames[socket.id]});
		});

		socket.on('Change Room', (data) => {
			changeRoom(socket, data.room, currRooms);
		})

		socket.on('Change Nick', (data) => {
			changeNick(socket, data.nick, nickNames)
		});

		socket.on('Update Rooms', () => {
			io.emit('Update Rooms', {rooms: rooms});
		})

		socket.on('disconnect', () => {
			removeGuest(socket, nickNames, currRooms);
		});
	})
}

function changeRoom(socket, newRoom, currRooms) {
	if (newRoom) {
		var exit = false;
		for (var i = 0; i < rooms.length; i++) {
			if (newRoom == rooms[i]) {
				exit = true;
				break;
			}
		}
		if (!exit) rooms.push(newRoom);
		socket.leave(currRooms[socket.id]);
		currRooms[socket.id] = newRoom;
	} else {
		currRooms[socket.id] = rooms[0];
	}	

	socket.join(currRooms[socket.id]);
	socket.emit('Change Room', {rooms: rooms, currRoom: currRooms[socket.id]} );
	socket.to(currRooms[socket.id]).emit('Join Room', {nick: nickNames[socket.id],rooms: rooms, currRoom: currRooms[socket.id]});
}

function changeNick(socket, newNick, nickNames) {
	if (newNick) {
		nickNames[socket.id] = newNick;
	} else {
		nickNames[socket.id] = 'Guest_' + guestNumber;
		guestNumber++;
	}

	socket.emit('Change Nick', {nick: nickNames[socket.id]});
}

function removeGuest(socket, nickNames, currRooms) {
	socket.leave(currRooms[socket.id]);
	console.log(nickNames[socket.id] + ' leave room ' + currRooms[socket.id]);	
	delete nickNames[socket.id];
	delete currRooms[socket.id]
}