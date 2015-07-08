/*
TODO:
- Add “{user} is typing” functionality
- Show who’s online
- Add private messaging
- Add room functionality
- Username should be unique
- Make a proper app & API doc
- Reliable channel: Acknowledge that message received
- "seen" feature
---------------------------------------
Rules:
- Backend does not handle UI logic. Just pass object to frontend
*/

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){

  // io.emit echoes the event to all connected sockets
  io.emit('newConnection', socket.id);

  socket.on('chatMessage', function(msg){

    // socket.broadcast relays the event to all sockets except the sender
    socket.broadcast.emit('chatMessage', {
      sender: msg.sender,
      content: msg.content,
      self: false
    });
    
    // socket.emit echoes the event to the same socket only
    socket.emit('chatMessage', {
      content: msg.content,
      self: true
    });

  });

  socket.on('disconnect', function(){
  	io.emit('newDisconnection', socket.username || socket.id);
  });

  socket.on('usernameChanged', function(username){

    // Notify self
    socket.emit('usernameChanged',{
      self: true,
      from: socket.username || socket.id,
      to: username
    })

    // Notify the rest
  	socket.broadcast.emit('usernameChanged', {
      self: false,
  		from: socket.username || socket.id,
  		to: username
  	});

    // Change username finally
    socket.username = username;

  });

  socket.on('login', function(username){
    socket.username = username;

    socket.emit('loggedIn',{
      self: true,
      username: username
    }); 

    socket.broadcast.emit('loggedIn',{
      self: false,
      username: username
    });  
  });

  socket.on('roomChanged', function(room){
    socket.join(room, function(){
      socket.emit('roomChanged',{
        self: true,
        rooms: socket.rooms
      });
      socket.broadcast.emit('roomChanged',{
        self: false,
        user: socket.username || socket.id,
        room: room
      });
    });
  });

  socket.on('leaveRoom', function(room){
    socket.leave(room, function(){
      socket.emit('leaveRoom',{
        self: true,
        rooms: socket.rooms
      });
      socket.broadcast.emit('leaveRoom',{
        self: false,
        user: socket.username || socket.id,
        room: room
      });
    });
  });

  socket.on('private', function(msg){
    io.sockets.socket(msg.privateTo).emit('private',{
      sender: msg.sender,
      content: msg.content
    })
  });

  socket.emit('login');

});

http.listen(3000, function(){
  console.log('listening on *:3000');
});






