// 必要なモジュールを取り込んでいる
const express = require('express');
// expressのインスタンス化
const app = express();
// postの中身を取得するためのモジュール
const bodyParser = require('body-parser');
// ejsファイルという、htmlファイルを動的に変化させるためのモジュール
const ejs = require('ejs');
// mysqlを扱うためのモジュール
const mysql = require('mysql');
// httpサーバーを作っている
const server = require('http').createServer(app);
// websocket通信をするためのモジュールを取り込みインスタンス化
const io = require('socket.io').listen(server);
// セッション管理をするためのモジュール
const session = require('express-session');
// express-validatorを用いるためのモジュール
const { check, validationResult} = require('express-validator');
// SQL文を解析するためのモジュールとその設定をしている
const knex = require('knex')({
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
const Bookshelf = require('bookshelf')(knex);
const Users = Bookshelf.Model.extend({
  tableName: 'users'
});
// const Message = Bookshelf.Model.extend({
//   tableName:  'chat_contents',
// });
const Topic = Bookshelf.Model.extend({
  tableName: 'topic',
});

// セッション管理をするための設定
const session_opt = {
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
app.use(express.static('public'));

// ---------------メッセージ--------------------
// urlが/で、メソッドがgetの時の動き
app.get('/chat', function(request, response){
  // ログインしていなかった場合ログイン画面に飛ばす
  if(request.session.login == null){
    response.redirect('/login');
  }else{
    let topic = request.query.topic;
    request.session.login.room = topic;
    // console.log(request.session.login.room);
    const Message = Bookshelf.Model.extend({
      tableName:  topic,
    });

    // ログインしていた場合chatの画面に行く
    new Message().fetchAll().then((collection)=>{
      let data = {
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
io.sockets.on('connection', function(socket){
  // let room= socket.request.session.login.room;
  let room='game'
  socket.join(room);
  console.log(room);
  socket.on('chat', function(data){
    const Message = Bookshelf.Model.extend({
      tableName: room,
    });
    // 送信されたメッセージをデータベースに追加
    new Message({message: data.msg}).save().then((model)=>{
      // ほかのつながってるユーザーにメッセージを送信
      console.log(data);
      io.to(room).emit('chat',data.msg);
    });
  });
});

// ---------------トピック選択-------------------------------

app.get('/topic', function(request, response){
  if(request.session.login==null){
    response.redirect('login.ejs');
  }else{
    new Topic().fetchAll().then((collection)=>{
      let data = {
        error: '',
        content: collection.toArray()
      };
      response.render('topic.ejs', data);
    });
  }
});

app.post('/topic', [
  check('topic').notEmpty().withMessage('トピックを選択してください')
], function(request, response){
  const error = validationResult(request);
  if(!error.isEmpty()){
    let error_title = '<ul>';
    let error_arr = error.array();
    for(let n in error_arr){
      error_title += '<li>' + error_arr[n].msg + '</li>';
    }
    error_title += '</ul>';
    response.render('topic.ejs', {error: error_title});
  }else{
    let topic = request.body.topic;
    Topic.query({where: {topic: topic}})
    .fetch()
    .then((model)=>{
      response.redirect('/chat?topic='+topic);
    }).catch((err)=>{
      new Topic().fetchAll().then((collection)=>{
        let data = {
          error: 'そのようなトピックは存在しません',
          content: collection.toArray()
        };
        response.render('topic.ejs', data);
      });
    });
  }
})

// ----------------アカウントの新規作成-----------------------

app.get('/new', function(reqest, response){
  let data = {
    title: 'アカウントの新規作成を行います。ログイン名とパスワードの入力をしてください',
    destination: '/new',
    btn_value: '作成'
  };
  response.render('login.ejs', data);
});

app.post('/new',[
  // 入力のチェックする項目を設定
  check('name').notEmpty().withMessage('ログイン名を入力してください'),
  check('password', '五文字以上のパスワードは必ず入力してください').isLength({min: 5})
], function(request, response){
  // エラーがあるかどうかの判定。あった場合errorにエラーメッセージが入る
  const error = validationResult(request);
  // エラー定数に中身があるかどうかチェック
  if(!error.isEmpty()){
    // あった場合
    let error_title = '<ul>';
    let error_result_arr = error.array();
    for(let n in error_result_arr){
      error_title += '<li>' + error_result_arr[n].msg + '</li>';
    }
    error_title += '</ul>';
    let data = {
      title: error_title,
      destination: '/new',
      btn_value: '作成'
    };
    response.render('login.ejs', data);
  }else{
    // ない場合
    new Users(request.body).save().then((model)=>{
      request.session.login = model.attributes;
      response.redirect('/topic');
    });
  }
});

// -----------------ユーザーのログイン処理--------------------
// ログイン画面
app.get('/login', function(request, response){
  let data = {
    title: 'ログイン名とパスワードを入力してください',
    destination: '/login',
    btn_value: 'ログイン'
  };
  response.render('login.ejs', data);
});

// 名前とパスワードが送られてきたときの処理
app.post('/login', function(request, response){
  // userName、password変数に送られてきたユーザー名、名前を入れる
  let userName = request.body.name;
  let password = request.body.password;

  // データベースに接続して送られてきたアカウントが存在するか調べる
  Users.query({where: {name: userName}, andWhere: {password: password}}).fetch().then((model)=>{
  
    // 存在した場合、セッション管理をしている変数にユーザーのデータを入れてる。
      // ここら辺もう少し調べとく
      request.session.login = model.attributes;
      // console.log(request.session.login);
      console.log(userName+' is login');
      // /でリダイレクト　チャット画面に移行
      response.redirect('/topic');
  }).catch((err)=>{
    let data = {
      title: 'ログイン名もしくはパスワードが間違っています。再入力してください',
      destination:  '/login',
      btn_value: 'ログイン'
    };
    response.render('login.ejs', data);
  });
});

// ポート番号3000で待ち状態
server.listen(3000, ()=>{console.log('Server is start on port 3000')});

