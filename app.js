
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
  client: 'mysql',
  connection: {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'chat',
    charset: 'utf8'
  }
});
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'chat'
})
// 上記で設定したデータベースのテーブルをモデル化
// Bookshelfを使うためには必要。
const Bookshelf = require('bookshelf')(knex);
const Users = Bookshelf.Model.extend({
  tableName: 'users'
});

const Topic = Bookshelf.Model.extend({
  tableName: 'topic',
});

// セッション管理をするための設定
const sessionMiddleware = session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  cookie: {maxAge:60*60*1000}
});
// セッション管理するためには必要な文。

app.use(sessionMiddleware);
io.use(function(socket, next){
  sessionMiddleware(socket.request, socket.request.res, next);
})

// ejsファイルを使うためのエンジンを設定。
app.engine('ejs', ejs.renderFile);
// postを使うための分
app.use(bodyParser.urlencoded({extended: false}));
// publicに静的ファイルを入れる
app.use(express.static('public'));

// ---------------メッセージ--------------------
// urlが/chatで、メソッドがgetの時の動き
app.get('/chat', function(request, response){
  // ログインしていなかった場合ログイン画面に飛ばす
  if(request.session.login == null){
    response.redirect('/login');
  }else{
    let topic = request.query.topic;
    request.session.room = topic;
    // console.log(request.session.login.room);
    const Message = Bookshelf.Model.extend({
      tableName:  topic,
    });

    // ログインしていた場合chatの画面に行く
    new Message().fetchAll().then((collection)=>{
      let data = {
        title: topic+'へようこそ'+request.session.login.name+'さん',
        content: collection.toArray()
      };
      response.render('index.ejs', data);  
    }).catch(function(err){
      response.status(500).json({error: true, data: {message: err.message}});
    });
  }
});

// -----------------websocket での通信の処理-------------------

io.sockets.on('connection', function(socket){
  let room= socket.request.session.room;
  socket.join(room);
  socket.on('chat', function(data){
    let user=socket.request.session.login.name;
    const Message = Bookshelf.Model.extend({
      tableName: room
    });
    // 送信されたメッセージをデータベースに追加
    new Message({message: data, user: user}).save().then((model)=>{
      // ほかのつながってるユーザーにメッセージを送信
      io.sockets.in(room).emit('chat',{message: data, user: user});
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
    .then(function(model){
      response.redirect('/chat?topic='+topic);
    }).catch(function(err){
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
  Users.query({where: {name: userName}, andWhere: {password: password}}).fetch().then(function(model){
  
    // 存在した場合、セッション管理をしている変数にユーザーのデータを入れてる。
      // ここら辺もう少し調べとく
      request.session.login = model.attributes;
      // console.log(request.session.login);
      console.log(userName+' is login');
      // /でリダイレクト　チャット画面に移行
      response.redirect('/topic');
  }).catch(function(err){
    let data = {
      title: 'ログイン名もしくはパスワードが間違っています。再入力してください',
      destination:  '/login',
      btn_value: 'ログイン'
    };
    response.render('login.ejs', data);
  });
});

// -------------------トピックの作成処理----------------------------
app.get('/make_topic', function(request, response){
  if(request.session.login==null){
    response.redirect('login.ejs');
  }else{
    let data = {
      title:'ようこそ'+request.session.login.name+'さん',
      error:''
    };
    response.render('make_topic.ejs', data);
  }
});

app.post('/make_topic', function(request, response){
  if(request.session.login==null){
    response.redirect('login.ejs');
  }else{
    Topic.query({where:{topic:request.body.topic_name}}).fetch().then((model)=>{
      let data = {
        title:'ようこそ'+request.session.login.name+'さん',
        error:'そのトピックは既に存在しています'
      };
      response.render('make_topic.ejs', data);
    }).catch((err)=>{
      let topic = request.body.topic_name;
      db.connect(function(err){
        if(err) throw err;
        let sql='CREATE TABLE '+topic+' (id INT AUTO_INCREMENT PRIMARY KEY, message VARCHAR(255))';
        db.query(sql, function(err, result){
          if(err) throw err;
          new Topic({topic: request.body.topic_name}).save().then((model)=>{
            response.redirect('/chat?topic='+topic);
          })
        });
      });
    });
  }
});

// ポート番号3000で待ち状態------------------------
server.listen(3000, function(){console.log('Server is start on port 3000')});

