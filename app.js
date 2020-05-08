var express = require('express');
var app = express();

var server = require('http').createServer(app);

app.get('/', function(request, response){
  response.sendFile(__dirname+'/index.html');
});

server.listen(3000);

var io = require('socket.io').listen(server);

io.on('connection', function(socket){
  socket.on('chat', function(msg){
    io.emit('chat', msg);
  });
});