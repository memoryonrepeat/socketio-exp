/*
TODO:
(DONE) Broadcast a message to connected users when someone connects or disconnects
(DONE) Add support for nicknames
(DONE) Don’t send the same message to the user that sent it himself. Instead, append the message directly as soon as he presses enter.
Add “{user} is typing” functionality
Show who’s online
Add private messaging
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
    socket.broadcast.emit('chat message', msg);
  });

  socket.on('disconnect', function(){
  	io.emit('new disconnection', socket.username || socket.id);
  });

  socket.on('username changed', function(username){
  	socket.username = username;
  	io.emit('username changed', {
  		from: socket.id,
  		to: socket.username
  	});
  });

});

http.listen(3000, function(){
  console.log('listening on *:3000');
});