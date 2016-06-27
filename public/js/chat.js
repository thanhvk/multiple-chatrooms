var socket = io();

socket.on('Change Nick', function(data) {
	$('#messages').append('<li>You know as: <b>' + data.nick + '</b></li>');
})

socket.on('Join Room', function(data) {
	$('#messages').append('<li><b>' + data.nick + '</b> join to <b>' + data.currRoom + '</b></li>');	
	listRooms(data.rooms);
})

socket.on('Change Room', function(data) {
	$('#current-chatroom').html('Current room: <b>' + data.currRoom + '<b>');
	listRooms(data.rooms);
})

socket.on('Update Rooms', function(data) {
	listRooms(data.rooms);
});

setInterval(function() {
	socket.emit('Update Rooms');
}, 1000);

function listRooms(rooms) {
	var htmlText = '';
	for (var i = 0; i < rooms.length; i++) {
		htmlText += '<li>' + rooms[i] + '</li>';
	}
	$('#rooms').html(htmlText);	
}

socket.on('Chat', function(data) {
	$('#messages').append('<li><b>' + data.nick + ':</b> ' + data.msg + '</li>');
});

$('#chat-box').on('submit', function(event) {
	event.preventDefault();
	var msg = $('#msg').val();
	$('#msg').val('');
	var commands = msg.split(' ');

	switch (commands[0]) {
		case '/room': 
			socket.emit('Change Room', {room: msg.substr(msg.indexOf(' ')+1, msg.length)})
			break;
		case '/nick': 
			socket.emit('Change Nick', {nick: msg.substr(msg.indexOf(' ')+1, msg.length)})
			break;
		default:
			$('#messages').append('<li><b>You:</b> ' + msg +  '</li>');
			socket.emit('Chat', {msg: msg})
	}	
})

