var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var ejs = require('ejs');
var mysql = require('mysql');
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var session = require('express-session');
var knex = require('knex')({
  dialect: 'mysql',
  connection: {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'chat',
    charset: 'utf8'
  }
});
var Bookshelf = require('bookshelf')(knex);
var Users = Bookshelf.Model.extend({
  tableName: 'users'
});

var session_opt = {
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  cookie: {maxAge:60*60*1000}
};
app.use(session(session_opt));

app.engine('ejs', ejs.renderFile);
app.use(bodyParser.urlencoded({extended: false}));


// ---------------メッセージ--------------------
app.get('/', function(request, response){
  if(request.session.login == null){
    response.redirect('/login');
  }else{
    response.render('index.ejs',{});  
  }
});

io.on('connection', function(socket){
  socket.on('chat', function(msg){
    io.emit('chat', msg);
  });
});

// -----------------ユーザーのログイン処理--------------------
app.get('/login', function(request, response){
  response.render('login.ejs', {});
});

app.post('/login', function(request, response){
  var userName = request.body.name;
  var password = request.body.password;

  Users.query({where: {name: userName}, andWhere: {password: password}}).fetch().then((model)=>{
    if(model == null){
      // 間違ったログイン名とパスワードを入力するとエラー発生　原因不明
      response.render('login.ejs', {});
    }else{
      request.session.login = model.attributes;
      response.redirect('/');
    }
  })

});

server.listen(3000);

