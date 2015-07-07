/*
TODO:
(DONE) Broadcast a message to connected users when someone connects or disconnects
(DONE) Add support for nicknames
(DONE) Don’t send the same message to the user that sent it himself. Instead, append the message directly as soon as he presses enter.
Add “{user} is typing” functionality
Show who’s online
Add private messaging
Make a proper API doc
*/

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){

  io.emit('new connection', socket.id);

  socket.on('chat message', function(msg){

    // socket.broadcast echoes the event to all sockets except the sender
    socket.broadcast.emit('chat message', msg);
    
    // socket.emit echoes the event to the same socket only
    // socket.emit('chat message', msg);
  });

  socket.on('disconnect', function(){
  	io.emit('new disconnection', socket.username || socket.id);
  });

  socket.on('username changed', function(username){
  	socket.username = username;

    // io.emit echoes the event to all connected sockets
  	io.emit('username changed', {
  		from: socket.id,
  		to: socket.username
  	});
  });

  socket.on('login', function(username){ 
    socket.username = username;
    socket.emit('serverMessage', 'Currently logged in as ' + username); 
    socket.broadcast.emit('serverMessage', 'User ' + username + ' logged in');  
  });

  socket.emit('login');

});

http.listen(3000, function(){
  console.log('listening on *:3000');
});