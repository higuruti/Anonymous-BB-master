// 必要なモジュールを取り込んでいる


var express = require('express');
// expressのインスタンス化
var app = express();
// postの中身を取得するためのモジュール
var bodyParser = require('body-parser');
// ejsファイルという、htmlファイルを動的に変化させるためのモジュール
var ejs = require('ejs');
// mysqlを扱うためのモジュール
var mysql = require('mysql');
// httpサーバーを作っている
var server = require('http').createServer(app);
// websocket通信をするためのモジュールを取り込みインスタンス化
var io = require('socket.io').listen(server);
// セッション管理をするためのモジュール
var session = require('express-session');
// SQL文を解析するためのモジュールとその設定をしている
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
// 上記で設定したデータベースのテーブルをモデル化とか書いてあるけどよくわからん。
// Bookshelfを使うためには必要。
var Bookshelf = require('bookshelf')(knex);

var Users = Bookshelf.Model.extend({
  tableName: 'users'
});
var Message = Bookshelf.Model.extend({
  tableName:  'chat_contents',
});

// セッション管理をするための設定
var session_opt = {
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  cookie: {maxAge:60*60*1000}
};
// セッション管理するためには必要な文。よくわからん
app.use(session(session_opt));

// ejsファイルを使うためのエンジンを設定。
app.engine('ejs', ejs.renderFile);
// postの内容を取得するために必要。とにかく必要なんだ
app.use(bodyParser.urlencoded({extended: false}));


// ---------------メッセージ--------------------
// urlが/で、メソッドがgetの時の動き
app.get('/', function(request, response){
  // ログインしていなかった場合ログイン画面に飛ばす
  if(request.session.login == null){
    response.redirect('/login');
  }else{
    // ログインしていた場合chatの画面に行く
    new Message().fetchAll().then((collection)=>{
      var data = {
        title: 'Open chat',
        content: collection.toArray()
      };
      response.render('index.ejs', data);  
    }).catch((err)=>{
      response.status(500).json({error: true, data: {message: err.message}});
    });
  }
});

//websocket での通信の処理
io.on('connection', function(socket){
  socket.on('chat', function(msg){
    new Message({message: msg}).save().then((model)=>{
      io.emit('chat', msg);
    });
  });
});

// -----------------ユーザーのログイン処理--------------------
// ログイン画面
app.get('/login', function(request, response){
  response.render('login.ejs', {});
});

// 名前とパスワードが送られてきたときの処理
app.post('/login', function(request, response){
  // userName、password変数に送られてきたユーザー名、名前を入れる
  var userName = request.body.name;
  var password = request.body.password;

  // データベースに接続して送られてきたアカウントが存在するか調べる
  Users.query({where: {name: userName}, andWhere: {password: password}}).fetch().then((model)=>{
    if(model == null){
      // 間違ったログイン名とパスワードを入力するとエラー発生　原因不明
      response.render('login.ejs', {});
    }else{
      // 存在した場合、セッション管理をしている変数にユーザーのデータを入れてる。
      // ここら辺もう少し調べとく
      request.session.login = model.attributes;
      console.log(userName+' is login');
      // /でリダイレクト　チャット画面に移行
      response.redirect('/');
    }
  })

});

// ポート番号3000で待ち状態
server.listen(3000, ()=>{console.log('Server is start on port 3000')});

